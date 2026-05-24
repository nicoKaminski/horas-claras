import { createSupabaseServerClient } from "@/backend/supabase/server";
import { getCurrentProfile } from "@/backend/profiles/get-current-profile";
import { DashboardMetrics } from "@/shared/types/dashboard";

export type DashboardMetricsResult =
  | { status: "unauthenticated"; metrics: null; error: null }
  | { status: "success"; metrics: DashboardMetrics; error: null }
  | { status: "error"; metrics: null; error: string };

const MONTH_NAMES_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export async function getDashboardMetrics(
  selectedMonth?: number,
  selectedYear?: number
): Promise<DashboardMetricsResult> {
  try {
    const profileResult = await getCurrentProfile();
    if (profileResult.status === "unauthenticated") {
      return { status: "unauthenticated", metrics: null, error: null };
    }

    if (profileResult.status === "error" || !profileResult.profile) {
      return {
        status: "error",
        metrics: null,
        error: "No se pudo validar el perfil del usuario actual.",
      };
    }

    const { profile } = profileResult;
    const supabase = await createSupabaseServerClient();

    // Calcular el rango del mes seleccionado o el actual
    const now = new Date();
    const year = selectedYear !== undefined ? Number(selectedYear) : now.getFullYear();
    const monthIndex = selectedMonth !== undefined ? Number(selectedMonth) - 1 : now.getMonth(); // 0-11

    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0);

    const startStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-01`;
    const endStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
    const monthName = `${MONTH_NAMES_ES[monthIndex]} de ${year}`;

    // Traer solo campos necesarios y filtrar por fecha del mes seleccionado
    const { data, error } = await supabase
      .from("work_logs")
      .select("developer_name, date, duration_hours, jira_loaded")
      .gte("date", startStr)
      .lte("date", endStr);

    if (error) {
      return {
        status: "error",
        metrics: null,
        error: "No se pudieron obtener los registros de horas para calcular las métricas.",
      };
    }

    // Inicializar métricas
    let totalHours = 0;
    let totalLogs = 0;
    let pendingJiraCount = 0;
    let loadedJiraCount = 0;
    let pendingJiraHours = 0;
    let loadedJiraHours = 0;

    // Desglose por developer (solo para admin)
    const breakdown: Record<"dev" | "compa", { total_hours: number; pending_jira_count: number }> | null =
      profile.role === "admin"
        ? {
            dev: { total_hours: 0, pending_jira_count: 0 },
            compa: { total_hours: 0, pending_jira_count: 0 },
          }
        : null;

    // Inicializar serie diaria para todos los días del mes
    const daysInMonth = endDate.getDate();
    const dailySeriesMap: Record<string, number> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      dailySeriesMap[dateStr] = 0;
    }

    if (data) {
      for (const row of data) {
        const duration = Number(row.duration_hours);
        const jiraLoaded = row.jira_loaded;
        const rawDevName = row.developer_name;

        if (rawDevName !== "dev" && rawDevName !== "compa") {
          continue;
        }

        const devName: "dev" | "compa" = rawDevName;

        totalHours += duration;
        totalLogs += 1;

        if (jiraLoaded) {
          loadedJiraCount += 1;
          loadedJiraHours += duration;
        } else {
          pendingJiraCount += 1;
          pendingJiraHours += duration;
        }

        if (breakdown) {
          breakdown[devName].total_hours += duration;
          if (!jiraLoaded) {
            breakdown[devName].pending_jira_count += 1;
          }
        }

        // Sumar a la serie diaria
        if (dailySeriesMap[row.date] !== undefined) {
          dailySeriesMap[row.date] += duration;
        } else {
          dailySeriesMap[row.date] = duration;
        }
      }
    }

    // Redondear horas
    totalHours = Math.round(totalHours * 100) / 100;
    pendingJiraHours = Math.round(pendingJiraHours * 100) / 100;
    loadedJiraHours = Math.round(loadedJiraHours * 100) / 100;

    if (breakdown) {
      breakdown.dev.total_hours = Math.round(breakdown.dev.total_hours * 100) / 100;
      breakdown.compa.total_hours = Math.round(breakdown.compa.total_hours * 100) / 100;
    }

    // Calcular top day
    let maxHours = 0;
    let topDayDate = "";
    for (const [date, hours] of Object.entries(dailySeriesMap)) {
      if (hours > maxHours) {
        maxHours = hours;
        topDayDate = date;
      }
    }
    const top_day = maxHours > 0 ? { date: topDayDate, hours: Math.round(maxHours * 100) / 100 } : null;

    // Formatear la serie diaria
    const daily_series = Object.entries(dailySeriesMap).map(([date, hours]) => ({
      date,
      hours: Math.round(hours * 100) / 100,
    })).sort((a, b) => a.date.localeCompare(b.date));

    const jira_loaded_percentage = totalHours > 0 ? Math.round((loadedJiraHours / totalHours) * 100) : 0;
    const average_hours_per_log = totalLogs > 0 ? Math.round((totalHours / totalLogs) * 100) / 100 : 0;

    const metrics: DashboardMetrics = {
      total_hours: totalHours,
      total_logs: totalLogs,
      pending_jira_count: pendingJiraCount,
      loaded_jira_count: loadedJiraCount,
      pending_jira_hours: pendingJiraHours,
      loaded_jira_hours: loadedJiraHours,
      jira_loaded_percentage,
      average_hours_per_log,
      top_day,
      daily_series,
      breakdown,
      month_name: monthName,
      start_date: startStr,
      end_date: endStr,
    };

    return { status: "success", metrics, error: null };
  } catch {
    return {
      status: "error",
      metrics: null,
      error: "Ocurrió un error inesperado al procesar las métricas del dashboard.",
    };
  }
}
