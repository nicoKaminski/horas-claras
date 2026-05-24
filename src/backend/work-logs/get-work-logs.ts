import { createSupabaseServerClient } from "@/backend/supabase/server";
import { getCurrentProfile } from "@/backend/profiles/get-current-profile";
import { WorkLog } from "@/shared/types/work-log";

export type WorkLogsFetchResult =
  | { status: "unauthenticated"; logs: null; error: null }
  | { status: "success"; logs: WorkLog[]; error: null }
  | { status: "error"; logs: null; error: string };

export async function getWorkLogs(): Promise<WorkLogsFetchResult> {
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

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("work_logs")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return {
        status: "error",
        logs: null,
        error: "No se pudieron obtener los registros de horas de la base de datos.",
      };
    }

    const logs: WorkLog[] = [];

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

    return { status: "success", logs, error: null };
  } catch {
    return {
      status: "error",
      logs: null,
      error: "Ocurrió un error inesperado al consultar los registros de horas.",
    };
  }
}
