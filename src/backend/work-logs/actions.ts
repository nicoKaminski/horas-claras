"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/backend/supabase/server";
import { getCurrentProfile } from "@/backend/profiles/get-current-profile";
import { validateWorkLog, WorkLogFormValues, MAX_DAILY_WORK_LOG_HOURS } from "@/shared/validations/work-log";

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

    // Validar solapamiento y horas diarias acumuladas
    const existingLogsResult = await getExistingWorkLogsForUserAndDate(supabase, targetUserId, dateDb);
    if (existingLogsResult.status === "error") {
      return {
        error: "No se pudo validar la disponibilidad horaria. Intentá nuevamente.",
      };
    }
    const existingLogs = existingLogsResult.logs;
    if (checkTimeOverlap(startTimeDb, endTimeDb, existingLogs)) {
      return {
        error: "Ya existe un registro de horas que se superpone con ese horario.",
      };
    }
    const dailyTotal = calculateDailyTotalHours(validation.duration, existingLogs);
    if (dailyTotal > MAX_DAILY_WORK_LOG_HOURS) {
      return {
        error: "El total diario no puede superar las 20 horas.",
      };
    }

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
    const searchParamsRaw = formData.get("search_params") as string;
    let redirectUrl = "/registros";
    if (searchParamsRaw) {
      const parsed = new URLSearchParams(searchParamsRaw);
      const month = parsed.get("month");
      const year = parsed.get("year");
      
      const newParams = new URLSearchParams();
      if (month && !isNaN(Number(month)) && Number(month) >= 1 && Number(month) <= 12) {
        newParams.set("month", month);
      }
      if (year && !isNaN(Number(year)) && Number(year) >= 2000 && Number(year) <= 2100) {
        newParams.set("year", year);
      }

      const queryString = newParams.toString();
      if (queryString) {
        redirectUrl = `/registros?${queryString}`;
      }
    }
    redirect(redirectUrl);
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

    // Validar solapamiento y horas diarias acumuladas
    const existingLogsResult = await getExistingWorkLogsForUserAndDate(supabase, record.user_id, dateDb);
    if (existingLogsResult.status === "error") {
      return {
        error: "No se pudo validar la disponibilidad horaria. Intentá nuevamente.",
      };
    }
    const existingLogs = existingLogsResult.logs;
    if (checkTimeOverlap(startTimeDb, endTimeDb, existingLogs, logId)) {
      return {
        error: "Ya existe un registro de horas que se superpone con ese horario.",
      };
    }
    const dailyTotal = calculateDailyTotalHours(validation.duration, existingLogs, logId);
    if (dailyTotal > MAX_DAILY_WORK_LOG_HOURS) {
      return {
        error: "El total diario no puede superar las 20 horas.",
      };
    }

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
    const searchParamsRaw = formData.get("search_params") as string;
    let redirectUrl = "/registros";
    if (searchParamsRaw) {
      const parsed = new URLSearchParams(searchParamsRaw);
      const month = parsed.get("month");
      const year = parsed.get("year");
      
      const newParams = new URLSearchParams();
      if (month && !isNaN(Number(month)) && Number(month) >= 1 && Number(month) <= 12) {
        newParams.set("month", month);
      }
      if (year && !isNaN(Number(year)) && Number(year) >= 2000 && Number(year) <= 2100) {
        newParams.set("year", year);
      }

      const queryString = newParams.toString();
      if (queryString) {
        redirectUrl = `/registros?${queryString}`;
      }
    }
    redirect(redirectUrl);
  }

  return {};
}

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

interface ExistingWorkLog {
  id: string;
  start_time: string;
  end_time: string | null;
  duration_hours: number;
}

async function getExistingWorkLogsForUserAndDate(
  supabase: SupabaseClient,
  userId: string,
  date: string
): Promise<{ status: "success"; logs: ExistingWorkLog[] } | { status: "error"; error: string }> {
  const { data, error } = await supabase
    .from("work_logs")
    .select("id, start_time, end_time, duration_hours")
    .eq("user_id", userId)
    .eq("date", date);

  if (error || !data) {
    return { status: "error", error: error?.message || "Error al obtener registros." };
  }

  const logs = data.map((row) => ({
    id: row.id,
    start_time: row.start_time,
    end_time: row.end_time,
    duration_hours: Number(row.duration_hours),
  }));

  return { status: "success", logs };
}

function checkTimeOverlap(
  newStart: string,
  newEnd: string,
  existingLogs: ExistingWorkLog[],
  excludeLogId?: string
): boolean {
  const newStartMin = parseTimeToMinutesRobust(newStart);
  const newEndMin = parseTimeToMinutesRobust(newEnd);

  if (newStartMin < 0 || newEndMin < 0) return false;

  for (const log of existingLogs) {
    if (excludeLogId && log.id === excludeLogId) {
      continue;
    }
    if (!log.end_time) {
      continue;
    }
    const extStartMin = parseTimeToMinutesRobust(log.start_time);
    const extEndMin = parseTimeToMinutesRobust(log.end_time);

    if (extStartMin < 0 || extEndMin < 0) continue;

    // Check overlap: existing.start_time < new.end_time AND existing.end_time > new.start_time
    if (extStartMin < newEndMin && extEndMin > newStartMin) {
      return true;
    }
  }

  return false;
}

function calculateDailyTotalHours(
  newDuration: number,
  existingLogs: ExistingWorkLog[],
  excludeLogId?: string
): number {
  let total = newDuration;
  for (const log of existingLogs) {
    if (excludeLogId && log.id === excludeLogId) {
      continue;
    }
    total += log.duration_hours;
  }
  return total;
}

function parseTimeToMinutesRobust(timeStr: string): number {
  const parts = timeStr.trim().split(":");
  if (parts.length < 2) return -1;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return -1;
  }
  return hours * 60 + minutes;
}




