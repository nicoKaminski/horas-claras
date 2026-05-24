import { redirect } from "next/navigation";
import { getCurrentSession } from "@/backend/auth/get-current-session";

export default async function Home() {
  const user = await getCurrentSession();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
