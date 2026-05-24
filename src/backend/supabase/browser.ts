import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ENV } from "./env";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    SUPABASE_ENV.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
