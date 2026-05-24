import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/backend/profiles/get-current-profile";
import { getPendingJiraWorkLogs } from "@/backend/work-logs/get-pending-jira-work-logs";
import MarkJiraLoadedButton from "@/frontend/features/work-logs/components/MarkJiraLoadedButton";
import DeleteWorkLogButton from "@/frontend/features/work-logs/components/DeleteWorkLogButton";
import styles from "./page.module.css";

export const metadata = {
  title: "Pendientes Jira · Horas Claras",
  description: "Listado de registros de horas pendientes de cargar en Jira",
};

const formatTime = (timeStr: string | null) => {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeStr;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export default async function PendientesJiraPage() {
  const profileResult = await getCurrentProfile();

  if (profileResult.status === "unauthenticated") {
    redirect("/login");
  }

  if (profileResult.status !== "success" || !profileResult.profile) {
    redirect("/dashboard");
  }

  const logsResult = await getPendingJiraWorkLogs();

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="pendientes-title">
        <header className={styles.header}>
          <div className={styles.headerInfo}>
            <h1 id="pendientes-title" className={styles.title}>
              Pendientes de Jira
            </h1>
            <p className={styles.subtitle}>
              Registros de horas que aún no se han cargado en Jira
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link href="/dashboard" className={styles.buttonSecondary}>
              Dashboard
            </Link>
            <Link href="/registros" className={styles.buttonSecondary}>
              Ver registros
            </Link>
            <Link href="/registros/nuevo" className={styles.buttonPrimary}>
              Registrar horas
            </Link>
          </div>
        </header>

        {/* 1. Estado Exitoso */}
        {logsResult.status === "success" && logsResult.logs && (
          <>
            {logsResult.logs.length === 0 ? (
              <div className={styles.emptyState}>
                <h2 className={styles.emptyStateTitle}>
                  ¡Todo al día!
                </h2>
                <p className={styles.emptyStateDescription}>
                  No hay registros de horas pendientes de cargar en Jira. Buen trabajo.
                </p>
                <Link href="/registros" className={styles.buttonPrimary}>
                  Ver todos los registros
                </Link>
              </div>
            ) : (
              <div className={styles.list}>
                {logsResult.logs.map((log) => (
                  <article key={log.id} className={styles.logCard}>
                    <div className={styles.logHeader}>
                      <div className={styles.logTitleSection}>
                        <span className={styles.taskTitle}>{log.task_title}</span>
                        <span className={styles.duration}>
                          {log.duration_hours} hs
                        </span>
                        <span
                          className={`${styles.badge} ${
                            log.developer_name === "dev"
                              ? styles.badgeDev
                              : styles.badgeCompa
                          }`}
                        >
                          {log.developer_name}
                        </span>
                      </div>
                    </div>

                    <p className={styles.logBody}>{log.description}</p>

                    <div className={styles.logMeta}>
                      <div className={styles.metaItem}>
                        <strong>Fecha:</strong> {formatDate(log.date)}
                      </div>
                      <div className={styles.metaItem}>
                        <strong>Horario:</strong> {formatTime(log.start_time)} -{" "}
                        {formatTime(log.end_time)}
                      </div>
                      <div className={styles.metaItem}>
                        {profileResult.profile.role === "admin" ? (
                          <MarkJiraLoadedButton logId={log.id} />
                        ) : (
                          <span className={`${styles.jiraBadge} ${styles.jiraBadgePending}`}>
                            Pendiente Jira
                          </span>
                        )}
                      </div>
                      {profileResult.profile.role === "admin" && (
                        <>
                          <div className={styles.metaItem}>
                            <Link href={`/registros/${log.id}/editar`} className={styles.buttonEdit}>
                              Editar
                            </Link>
                          </div>
                          <div className={styles.metaItem}>
                            <DeleteWorkLogButton logId={log.id} />
                          </div>
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {/* 2. Estado de Error */}
        {logsResult.status === "error" && (
          <div className={styles.errorCard}>
            <h2 className={styles.errorCardTitle}>Error al cargar registros</h2>
            <p className={styles.errorCardDescription}>
              {logsResult.error ||
                "Hubo un problema al consultar tus pendientes. Por favor, intenta de nuevo más tarde."}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
