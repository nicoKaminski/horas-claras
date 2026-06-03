import { createSupabaseServerClient } from "@/backend/supabase/server";
import { getCurrentProfile } from "@/backend/profiles/get-current-profile";
import { WorkLog } from "@/shared/types/work-log";

export type WorkLogFetchResult =
  | { status: "unauthenticated"; log: null; error: null }
  | { status: "success"; log: WorkLog; error: null }
  | { status: "not_found"; log: null; error: null }
  | { status: "error"; log: null; error: string };

export async function getWorkLogById(id: string): Promise<WorkLogFetchResult> {
  if (!id || id.trim() === "") {
    return { status: "error", log: null, error: "El ID de registro provisto es inválido." };
  }

  try {
    const profileResult = await getCurrentProfile();
    if (profileResult.status === "unauthenticated") {
      return { status: "unauthenticated", log: null, error: null };
    }

    if (profileResult.status === "error" || !profileResult.profile) {
      return {
        status: "error",
        log: null,
        error: "No se pudo validar el perfil del usuario actual.",
      };
    }

    const supabase = await createSupabaseServerClient();
    const { data: row, error } = await supabase
      .from("work_logs")
      .select("id, user_id, developer_name, created_by, date, start_time, end_time, duration_hours, task_title, description, jira_loaded, jira_loaded_at, created_at, updated_at")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return {
        status: "error",
        log: null,
        error: "No se pudo obtener el registro de horas de la base de datos.",
      };
    }

    if (!row) {
      return { status: "not_found", log: null, error: null };
    }

    const devName = row.developer_name;
    if (devName !== "dev" && devName !== "compa") {
      return {
        status: "error",
        log: null,
        error: "Los datos de desarrollador en el registro de horas son inválidos.",
      };
    }

    const log: WorkLog = {
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
    };

    return { status: "success", log, error: null };
  } catch {
    return {
      status: "error",
      log: null,
      error: "Ocurrió un error inesperado al buscar el registro de horas.",
    };
  }
}
