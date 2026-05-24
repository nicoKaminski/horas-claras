"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/backend/supabase/server";

export async function loginAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    return { error: "El email y la contraseña son obligatorios." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Credenciales incorrectas o error al iniciar sesión." };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

