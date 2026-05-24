import { createSupabaseServerClient } from "@/backend/supabase/server";
import { getCurrentProfile } from "@/backend/profiles/get-current-profile";
import { MonthlyHourlyRate } from "@/shared/types/monthly-rate";

export type GetMonthlyRatesResult =
  | { status: "unauthenticated"; rates: null; error: null }
  | { status: "success"; rates: MonthlyHourlyRate[]; error: null }
  | { status: "error"; rates: null; error: string };

export async function getMonthlyRates(
  year: number,
  month: number
): Promise<GetMonthlyRatesResult> {
  if (isNaN(year) || year < 2000 || year > 2100) {
    return { status: "error", rates: null, error: "Año inválido." };
  }
  if (isNaN(month) || month < 1 || month > 12) {
    return { status: "error", rates: null, error: "Mes inválido." };
  }

  try {
    const profileResult = await getCurrentProfile();
    if (profileResult.status === "unauthenticated") {
      return { status: "unauthenticated", rates: null, error: null };
    }
    if (profileResult.status === "error" || !profileResult.profile) {
      return {
        status: "error",
        rates: null,
        error: "No se pudo validar el perfil del usuario actual.",
      };
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("monthly_hourly_rates")
      .select("id, developer_name, year, month, hourly_rate, created_by, created_at, updated_at")
      .eq("year", year)
      .eq("month", month);

    if (error) {
      return {
        status: "error",
        rates: null,
        error: "No se pudieron obtener las tarifas mensuales de la base de datos.",
      };
    }

    return { status: "success", rates: data as MonthlyHourlyRate[], error: null };
  } catch {
    return {
      status: "error",
      rates: null,
      error: "Ocurrió un error inesperado al obtener las tarifas mensuales.",
    };
  }
}
