import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/backend/profiles/get-current-profile";
import { getWorkLogById } from "@/backend/work-logs/get-work-log-by-id";
import WorkLogForm from "@/frontend/features/work-logs/components/WorkLogForm";
import styles from "./page.module.css";

export const metadata = {
  title: "Editar registro · Horas Claras",
  description: "Edita un registro de horas existente",
};

interface EditarRegistroPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditarRegistroPage({ params }: EditarRegistroPageProps) {
  const { id } = await params;

  const profileResult = await getCurrentProfile();
  if (profileResult.status === "unauthenticated") {
    redirect("/login");
  }

  if (profileResult.status !== "success" || !profileResult.profile) {
    redirect("/dashboard");
  }

  const { profile } = profileResult;

  const logResult = await getWorkLogById(id);
  if (logResult.status !== "success" || !logResult.log) {
    redirect("/registros");
  }

  const { log } = logResult;

  // Validar permisos de edición
  const isOwner = log.user_id === profile.id;
  const isAdmin = profile.role === "admin";
  const isPending = !log.jira_loaded;

  const canEdit = isAdmin || (isOwner && isPending);

  if (!canEdit) {
    redirect("/registros");
  }

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="editar-registro-title">
        <header className={styles.header}>
          <h1 id="editar-registro-title" className={styles.title}>
            Editar registro
          </h1>
          <p className={styles.subtitle}>
            Modificá los detalles del registro de horas seleccionado
          </p>
        </header>

        <WorkLogForm
          currentProfile={profile}
          mode="edit"
          workLogId={log.id}
          isLoadedInJira={log.jira_loaded}
          workLogDeveloperName={log.developer_name}
          initialValues={{
            date: log.date,
            start_time: log.start_time,
            end_time: log.end_time,
            task_title: log.task_title,
            description: log.description,
          }}
        />
      </section>
    </main>
  );
}
