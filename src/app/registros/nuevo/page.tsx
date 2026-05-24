import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/backend/profiles/get-current-profile";
import WorkLogForm from "@/frontend/features/work-logs/components/WorkLogForm";
import styles from "./page.module.css";

export const metadata = {
  title: "Registrar horas · Horas Claras",
  description: "Crea un nuevo registro de horas de trabajo",
};

export default async function NuevoRegistroPage() {
  const result = await getCurrentProfile();

  if (result.status === "unauthenticated") {
    redirect("/login");
  }

  if (result.status !== "success" || !result.profile) {
    redirect("/dashboard");
  }

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="nuevo-registro-title">
        <header className={styles.header}>
          <h1 id="nuevo-registro-title" className={styles.title}>
            Registrar horas
          </h1>
          <p className={styles.subtitle}>
            Completá los detalles del trabajo realizado para cargar tus horas
          </p>
        </header>

        <WorkLogForm currentProfile={result.profile} />
      </section>
    </main>
  );
}
