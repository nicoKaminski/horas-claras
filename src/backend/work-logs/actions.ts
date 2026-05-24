"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/backend/supabase/server";
import { getCurrentProfile } from "@/backend/profiles/get-current-profile";
import { validateWorkLog, WorkLogFormValues } from "@/shared/validations/work-log";

export interface WorkLogActionState {
  error?: string;
  errors?: {
    date?: string;
    start_time?: string;
    end_time?: string;
    task_title?: string;
    description?: string;
    general?: string;
  };
  values?: {
    date?: string;
    start_time?: string;
    end_time?: string;
    task_title?: string;
    description?: string;
    developer_name?: string;
  };
  success?: boolean;
}

const formatTimeForDb = (timeStr: string) => {
  if (!timeStr) return "";
  const trimmed = timeStr.trim();
  if (trimmed.split(":").length === 2) {
    return `${trimmed}:00`;
  }
  return trimmed;
};

export async function createWorkLogAction(
  _prevState: WorkLogActionState | undefined,
  formData: FormData
): Promise<WorkLogActionState> {
  let shouldRedirect = false;

  try {
    const profileResult = await getCurrentProfile();
    if (profileResult.status !== "success" || !profileResult.profile) {
      return { error: "No tienes una sesión activa o un perfil configurado." };
    }

    const { profile } = profileResult;

    const date = formData.get("date") as string;
    const start_time = formData.get("start_time") as string;
    const end_time = formData.get("end_time") as string;
    const task_title = formData.get("task_title") as string;
    const description = formData.get("description") as string;
    const targetDevName = formData.get("developer_name") as string;

    const formValues: WorkLogFormValues = {
      date,
      start_time,
      end_time,
      task_title,
      description,
    };

    // 1. Validaciones de negocio del formulario
    const validation = validateWorkLog(formValues);
    if (!validation.isValid) {
      return {
        errors: validation.errors,
        values: {
          date,
          start_time,
          end_time,
          task_title,
          description,
          developer_name: targetDevName,
        },
      };
    }

    const supabase = await createSupabaseServerClient();
    let targetUserId = profile.id;
    let targetDeveloperName = profile.developer_name;

    // 2. Resolver usuario destino
    if (profile.role === "admin") {
      if (!targetDevName || (targetDevName !== "dev" && targetDevName !== "compa")) {
        return { error: "Debe seleccionar un desarrollador de destino válido." };
      }

      if (targetDevName !== profile.developer_name) {
        // Buscar el id del otro desarrollador en la tabla profiles
        const { data: targetProfile, error: profileError } = await supabase
          .from("profiles")
          .select("id, developer_name")
          .eq("developer_name", targetDevName)
          .maybeSingle();

        if (profileError || !targetProfile) {
          return {
            error: `No se encontró un perfil en el sistema asignado a "${targetDevName}".`,
          };
        }

        targetUserId = targetProfile.id;
        targetDeveloperName = targetProfile.developer_name;
      }
    } else {
      // Si el usuario es regular (compa), forzar sus datos y omitir cualquier inyección
      targetUserId = profile.id;
      targetDeveloperName = profile.developer_name;
    }

    const startTimeDb = formatTimeForDb(validation.normalizedValues?.start_time || start_time);
    const endTimeDb = formatTimeForDb(validation.normalizedValues?.end_time || end_time);
    const dateDb = validation.normalizedValues?.date || date;

    // 3. Inserción en la base de datos
    const { error: insertError } = await supabase.from("work_logs").insert({
      user_id: targetUserId,
      developer_name: targetDeveloperName,
      created_by: profile.id,
      date: dateDb,
      start_time: startTimeDb,
      end_time: endTimeDb,
      duration_hours: validation.duration,
      task_title: task_title.trim(),
      description: description.trim(),
      jira_loaded: false,
      jira_loaded_at: null,
    });

    if (insertError) {
      return {
        error: "No se pudo registrar la hora en la base de datos (error de permisos o de conexión).",
      };
    }

    shouldRedirect = true;
  } catch {
    return {
      error: "Ocurrió un error inesperado al procesar el registro de horas.",
    };
  }

  if (shouldRedirect) {
    redirect("/registros");
  }

  return {};
}

export async function markWorkLogAsJiraLoadedAction(
  _prevState: WorkLogActionState | undefined,
  formData: FormData
): Promise<WorkLogActionState> {
  try {
    const profileResult = await getCurrentProfile();
    if (profileResult.status !== "success" || !profileResult.profile) {
      return { error: "No tienes una sesión activa o un perfil configurado." };
    }

    const { profile } = profileResult;

    if (profile.role !== "admin") {
      return { error: "No tienes permisos para marcar registros como cargados en Jira." };
    }

    const logId = formData.get("id") as string;
    if (!logId || logId.trim() === "") {
      return { error: "El ID de registro es inválido." };
    }

    const supabase = await createSupabaseServerClient();
    const { error: updateError } = await supabase
      .from("work_logs")
      .update({
        jira_loaded: true,
        jira_loaded_at: new Date().toISOString(),
      })
      .eq("id", logId);

    if (updateError) {
      return { error: "No se pudo actualizar el registro de horas en la base de datos." };
    }

    revalidatePath("/registros");
    revalidatePath("/pendientes-jira");
    revalidatePath("/dashboard");

    return { success: true };
  } catch {
    return { error: "Ocurrió un error inesperado al marcar el registro como cargado." };
  }
}

export async function deleteWorkLogAction(
  _prevState: WorkLogActionState | undefined,
  formData: FormData
): Promise<WorkLogActionState> {
  try {
    const profileResult = await getCurrentProfile();
    if (profileResult.status !== "success" || !profileResult.profile) {
      return { error: "No tienes una sesión activa o un perfil configurado." };
    }

    const { profile } = profileResult;

    const logId = formData.get("id") as string;
    if (!logId || logId.trim() === "") {
      return { error: "El ID de registro es inválido." };
    }

    const supabase = await createSupabaseServerClient();

    // 1. Consultar el registro para verificar existencia y permisos
    const { data: record, error: fetchError } = await supabase
      .from("work_logs")
      .select("user_id, jira_loaded")
      .eq("id", logId)
      .maybeSingle();

    if (fetchError || !record) {
      return { error: "No se encontró el registro de horas en la base de datos." };
    }

    // 2. Validar permisos
    if (profile.role !== "admin") {
      if (record.user_id !== profile.id) {
        return { error: "No tienes permisos para eliminar este registro." };
      }
      if (record.jira_loaded) {
        return { error: "No se puede eliminar un registro que ya ha sido cargado en Jira." };
      }
    }

    // 3. Eliminar
    const { error: deleteError } = await supabase
      .from("work_logs")
      .delete()
      .eq("id", logId);

    if (deleteError) {
      return { error: "No se pudo eliminar el registro de la base de datos." };
    }

    revalidatePath("/registros");
    revalidatePath("/pendientes-jira");
    revalidatePath("/dashboard");

    return { success: true };
  } catch {
    return { error: "Ocurrió un error inesperado al eliminar el registro de horas." };
  }
}

export async function updateWorkLogAction(
  _prevState: WorkLogActionState | undefined,
  formData: FormData
): Promise<WorkLogActionState> {
  let shouldRedirect = false;

  try {
    const profileResult = await getCurrentProfile();
    if (profileResult.status !== "success" || !profileResult.profile) {
      return { error: "No tienes una sesión activa o un perfil configurado." };
    }

    const { profile } = profileResult;

    const logId = formData.get("id") as string;
    const date = formData.get("date") as string;
    const start_time = formData.get("start_time") as string;
    const end_time = formData.get("end_time") as string;
    const task_title = formData.get("task_title") as string;
    const description = formData.get("description") as string;

    if (!logId || logId.trim() === "") {
      return { error: "El ID de registro es inválido." };
    }

    const formValues: WorkLogFormValues = {
      date,
      start_time,
      end_time,
      task_title,
      description,
    };

    // 1. Validaciones
    const validation = validateWorkLog(formValues);
    if (!validation.isValid) {
      return {
        errors: validation.errors,
        values: {
          date,
          start_time,
          end_time,
          task_title,
          description,
        },
      };
    }

    const supabase = await createSupabaseServerClient();

    // 2. Obtener registro actual
    const { data: record, error: fetchError } = await supabase
      .from("work_logs")
      .select("user_id, jira_loaded")
      .eq("id", logId)
      .maybeSingle();

    if (fetchError || !record) {
      return { error: "No se encontró el registro de horas en la base de datos." };
    }

    const startTimeDb = formatTimeForDb(validation.normalizedValues?.start_time || start_time);
    const endTimeDb = formatTimeForDb(validation.normalizedValues?.end_time || end_time);
    const dateDb = validation.normalizedValues?.date || date;

    // 3. Validar permisos
    const updateFields: {
      date: string;
      start_time: string;
      end_time: string | null;
      duration_hours: number;
      task_title: string;
      description: string;
      jira_loaded?: boolean;
      jira_loaded_at?: null;
    } = {
      date: dateDb,
      start_time: startTimeDb,
      end_time: endTimeDb,
      duration_hours: validation.duration,
      task_title: task_title.trim(),
      description: description.trim(),
    };

    if (profile.role !== "admin") {
      if (record.user_id !== profile.id) {
        return { error: "No tienes permisos para editar este registro." };
      }
      if (record.jira_loaded) {
        return { error: "No se puede editar un registro que ya ha sido cargado en Jira." };
      }
    } else {
      if (record.jira_loaded) {
        updateFields.jira_loaded = false;
        updateFields.jira_loaded_at = null;
      }
    }

    // 4. Actualizar
    const { error: updateError } = await supabase
      .from("work_logs")
      .update(updateFields)
      .eq("id", logId);

    if (updateError) {
      return {
        error: "No se pudo actualizar el registro en la base de datos (error de permisos o de conexión).",
      };
    }

    revalidatePath("/registros");
    revalidatePath("/pendientes-jira");
    revalidatePath("/dashboard");

    shouldRedirect = true;
  } catch {
    return {
      error: "Ocurrió un error inesperado al actualizar el registro de horas.",
    };
  }

  if (shouldRedirect) {
    redirect("/registros");
  }

  return {};
}



