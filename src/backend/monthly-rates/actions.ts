"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/backend/supabase/server";
import { getCurrentProfile } from "@/backend/profiles/get-current-profile";
import { DeveloperName } from "@/shared/types/profile";

export interface MonthlyRateActionState {
  error?: string;
  success?: boolean;
}

export async function upsertMonthlyHourlyRateAction(
  _prevState: MonthlyRateActionState | undefined,
  formData: FormData
): Promise<MonthlyRateActionState> {
  try {
    const profileResult = await getCurrentProfile();
    if (profileResult.status !== "success" || !profileResult.profile) {
      return { error: "No tienes una sesión activa o un perfil configurado." };
    }

    const { profile } = profileResult;
    if (profile.role !== "admin") {
      return { error: "No tienes permisos para modificar tarifas mensuales." };
    }

    const developerName = formData.get("developer_name") as string;
    const yearStr = formData.get("year") as string;
    const monthStr = formData.get("month") as string;
    const hourlyRateStr = formData.get("hourly_rate") as string;

    if (developerName !== "dev" && developerName !== "compa") {
      return { error: "Desarrollador inválido." };
    }

    const year = Number(yearStr);
    const month = Number(monthStr);
    const hourlyRate = Number(hourlyRateStr);

    if (isNaN(year) || year < 2000 || year > 2100) {
      return { error: "Año inválido." };
    }
    if (isNaN(month) || month < 1 || month > 12) {
      return { error: "Mes inválido." };
    }
    if (isNaN(hourlyRate) || hourlyRate <= 0) {
      return { error: "La tarifa debe ser un número positivo." };
    }

    const supabase = await createSupabaseServerClient();

    const { error: upsertError } = await supabase
      .from("monthly_hourly_rates")
      .upsert(
        {
          developer_name: developerName as DeveloperName,
          year,
          month,
          hourly_rate: hourlyRate,
          created_by: profile.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "developer_name,year,month" }
      );

    if (upsertError) {
      return { error: "No se pudo guardar la tarifa en la base de datos." };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Ocurrió un error inesperado al guardar la tarifa." };
  }
}
