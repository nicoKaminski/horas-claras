import { createSupabaseServerClient } from "@/backend/supabase/server";
import { Profile } from "@/shared/types/profile";

export type ProfileFetchResult =
  | { status: "unauthenticated"; profile: null; error: null }
  | { status: "success"; profile: Profile; error: null }
  | { status: "not_found"; profile: null; error: null }
  | { status: "error"; profile: null; error: string };

export async function getCurrentProfile(): Promise<ProfileFetchResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { status: "unauthenticated", profile: null, error: null };
    }

    const { data, error: dbError } = await supabase
      .from("profiles")
      .select("id, username, developer_name, role")
      .eq("id", user.id)
      .maybeSingle();

    if (dbError) {
      return {
        status: "error",
        profile: null,
        error: "No se pudo leer el perfil de usuario de la base de datos.",
      };
    }

    if (!data) {
      return { status: "not_found", profile: null, error: null };
    }

    const username = data.username;
    const developer_name = data.developer_name;
    const role = data.role;

    if (
      (username === "dev" || username === "compa") &&
      (developer_name === "dev" || developer_name === "compa") &&
      (role === "admin" || role === "user")
    ) {
      const profile: Profile = {
        id: data.id,
        username,
        developer_name,
        role,
      };
      return { status: "success", profile, error: null };
    }

    return {
      status: "error",
      profile: null,
      error: "Los datos del perfil en la base de datos son inválidos.",
    };
  } catch {
    return {
      status: "error",
      profile: null,
      error: "Ocurrió un error inesperado al obtener el perfil de usuario.",
    };
  }
}
