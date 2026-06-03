import { createSupabaseServerClient } from "@/backend/supabase/server";
import { getCurrentProfile } from "@/backend/profiles/get-current-profile";
import { WorkLog } from "@/shared/types/work-log";
import { normalizeDate } from "@/shared/validations/work-log";

export type WorkLogsFetchResult =
  | { status: "unauthenticated"; logs: null; error: null }
  | { status: "success"; logs: WorkLog[]; error: null }
  | { status: "error"; logs: null; error: string };

export interface WorkLogsFilters {
  developer?: string;
  jira?: string;
  from?: string;
  to?: string;
  q?: string;
  month?: string | number;
  year?: string | number;
}

export async function getWorkLogs(filters?: WorkLogsFilters): Promise<WorkLogsFetchResult> {
  try {
    const profileResult = await getCurrentProfile();
    if (profileResult.status === "unauthenticated") {
      return { status: "unauthenticated", logs: null, error: null };
    }

    if (profileResult.status === "error" || !profileResult.profile) {
      return {
        status: "error",
        logs: null,
        error: "No se pudo validar el perfil del usuario actual.",
      };
    }

    const { profile } = profileResult;
    const supabase = await createSupabaseServerClient();

    let query = supabase
      .from("work_logs")
      .select("id, user_id, developer_name, created_by, date, start_time, end_time, duration_hours, task_title, description, jira_loaded, jira_loaded_at, created_at, updated_at");

    // 1. Filtrar por developer (solo admisible para admin, para user forzar su propio developer_name)
    if (filters?.developer && filters.developer !== "todos") {
      if (profile.role === "admin") {
        query = query.eq("developer_name", filters.developer);
      } else {
        query = query.eq("developer_name", profile.developer_name);
      }
    }

    // 2. Filtrar por Jira
    if (filters?.jira && filters.jira !== "todos") {
      if (filters.jira === "pendiente") {
        query = query.eq("jira_loaded", false);
      } else if (filters.jira === "cargado") {
        query = query.eq("jira_loaded", true);
      }
    }

    // 3. Rango de fechas
    if (filters?.from && filters.from.trim() !== "") {
      const normFrom = normalizeDate(filters.from);
      if (normFrom) {
        query = query.gte("date", normFrom);
      }
    }
    if (filters?.to && filters.to.trim() !== "") {
      const normTo = normalizeDate(filters.to);
      if (normTo) {
        query = query.lte("date", normTo);
      }
    }

    // 4. Filtrar por mes/año seleccionado
    if (filters?.month !== undefined || filters?.year !== undefined) {
      const now = new Date();
      let m = filters.month !== undefined ? Number(filters.month) : now.getMonth() + 1;
      let y = filters.year !== undefined ? Number(filters.year) : now.getFullYear();

      if (isNaN(m) || m < 1 || m > 12) {
        m = now.getMonth() + 1;
      }
      if (isNaN(y) || y < 2000 || y > 2100) {
        y = now.getFullYear();
      }

      const startDate = new Date(y, m - 1, 1);
      const endDate = new Date(y, m, 0);
      const startStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-01`;
      const endStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
      query = query.gte("date", startStr).lte("date", endStr);
    }

    // Ordenar por fecha desc y luego created_at desc
    query = query
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      return {
        status: "error",
        logs: null,
        error: "No se pudieron obtener los registros de horas de la base de datos.",
      };
    }

    let logs: WorkLog[] = [];

    if (data) {
      for (const row of data) {
        const devName = row.developer_name;
        if (devName === "dev" || devName === "compa") {
          logs.push({
            id: row.id,
            user_id: row.user_id,
            developer_name: devName,
            created_by: row.created_by,
            date: row.date,
            start_time: row.start_time,
            end_time: row.end_time || null,
            duration_hours: Number(row.duration_hours),
            task_title: row.task_title,
            description: row.description,
            jira_loaded: row.jira_loaded,
            jira_loaded_at: row.jira_loaded_at || null,
            created_at: row.created_at,
            updated_at: row.updated_at,
          });
        }
      }
    }

    // 4. Filtrar por búsqueda q en servidor (task_title y description)
    if (filters?.q && filters.q.trim() !== "") {
      const search = filters.q.toLowerCase().trim();
      logs = logs.filter(
        (log) =>
          log.task_title.toLowerCase().includes(search) ||
          log.description.toLowerCase().includes(search)
      );
    }

    return { status: "success", logs, error: null };
  } catch {
    return {
      status: "error",
      logs: null,
      error: "Ocurrió un error inesperado al consultar los registros de horas.",
    };
  }
}
