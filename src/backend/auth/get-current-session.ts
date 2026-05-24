import { createSupabaseServerClient } from "@/backend/supabase/server";

export async function getCurrentSession() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}
