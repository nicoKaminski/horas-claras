import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/backend/profiles/get-current-profile";
import { getDashboardMetrics } from "@/backend/work-logs/get-dashboard-metrics";
import LogoutButton from "@/frontend/features/auth/components/LogoutButton";
import styles from "./page.module.css";

export const metadata = {
  title: "Dashboard · Horas Claras",
  description: "Panel de control principal",
};

export default async function DashboardPage() {
  const result = await getCurrentProfile();

  if (result.status === "unauthenticated") {
    redirect("/login");
  }

  // Fetch metrics if authenticated
  const metricsResult = await getDashboardMetrics();

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="dashboard-title">
        <div className={styles.header}>
          <h1 id="dashboard-title" className={styles.title}>Dashboard</h1>
          <LogoutButton />
        </div>

        {result.status === "success" && result.profile && (
          <>
            <div className={styles.profileSection}>
              <div className={styles.profileRow}>
                <span className={styles.label}>Desarrollador:</span>
                <span
                  className={`${styles.badge} ${
                    result.profile.username === "dev" ? styles.badgeDev : styles.badgeCompa
                  }`}
                >
                  {result.profile.developer_name}
                </span>
              </div>
              <div className={styles.profileRow}>
                <span className={styles.label}>Rol:</span>
                <span
                  className={`${styles.badge} ${
                    result.profile.role === "admin" ? styles.badgeAdmin : styles.badgeUser
                  }`}
                >
                  {result.profile.role}
                </span>
              </div>
            </div>

            {/* Sección de Métricas */}
            <div className={styles.metricsSection}>
              <h2 className={styles.metricsSectionTitle}>
                Métricas de {metricsResult.status === "success" && metricsResult.metrics ? metricsResult.metrics.month_name : "este mes"}
              </h2>

              {metricsResult.status === "success" && metricsResult.metrics && (
                <>
                  {metricsResult.metrics.total_logs === 0 ? (
                    <div className={styles.emptyMetrics}>
                      <p className={styles.emptyMetricsText}>
                        No hay registros de horas cargados en este mes todavía.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className={styles.metricsGrid}>
                        <div className={styles.metricCard}>
                          <span className={styles.metricLabel}>Total Horas Mes</span>
                          <span className={styles.metricValue}>{metricsResult.metrics.total_hours} hs</span>
                        </div>
                        <div className={styles.metricCard}>
                          <span className={styles.metricLabel}>Total Registros Mes</span>
                          <span className={styles.metricValue}>{metricsResult.metrics.total_logs}</span>
                        </div>
                        <div className={styles.metricCard}>
                          <span className={styles.metricLabel}>Pendientes Jira</span>
                          <span className={styles.metricValue}>
                            {metricsResult.metrics.pending_jira_count} ({metricsResult.metrics.pending_jira_hours} hs)
                          </span>
                        </div>
                        <div className={styles.metricCard}>
                          <span className={styles.metricLabel}>Cargados Jira</span>
                          <span className={styles.metricValue}>
                            {metricsResult.metrics.loaded_jira_count} ({metricsResult.metrics.loaded_jira_hours} hs)
                          </span>
                        </div>
                      </div>

                      {/* Desglose por desarrollador (solo admin) */}
                      {metricsResult.metrics.breakdown && (
                        <div className={styles.breakdownSection}>
                          <h3 className={styles.breakdownTitle}>Desglose por Desarrollador</h3>
                          <div className={styles.breakdownGrid}>
                            <div className={styles.breakdownCard}>
                              <span className={styles.breakdownDevName}>dev</span>
                              <div className={styles.breakdownRow}>
                                <span className={styles.breakdownLabel}>Horas totales:</span>
                                <strong className={styles.breakdownValue}>{metricsResult.metrics.breakdown.dev.total_hours} hs</strong>
                              </div>
                              <div className={styles.breakdownRow}>
                                <span className={styles.breakdownLabel}>Pendientes Jira:</span>
                                <strong className={styles.breakdownValue}>{metricsResult.metrics.breakdown.dev.pending_jira_count}</strong>
                              </div>
                            </div>
                            <div className={styles.breakdownCard}>
                              <span className={styles.breakdownDevName}>compa</span>
                              <div className={styles.breakdownRow}>
                                <span className={styles.breakdownLabel}>Horas totales:</span>
                                <strong className={styles.breakdownValue}>{metricsResult.metrics.breakdown.compa.total_hours} hs</strong>
                              </div>
                              <div className={styles.breakdownRow}>
                                <span className={styles.breakdownLabel}>Pendientes Jira:</span>
                                <strong className={styles.breakdownValue}>{metricsResult.metrics.breakdown.compa.pending_jira_count}</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {metricsResult.status === "error" && (
                <div className={styles.errorCardMini}>
                  <p className={styles.errorTextMini}>
                    {metricsResult.error || "Hubo un problema al cargar las métricas de horas."}
                  </p>
                </div>
              )}
            </div>

            <div className={styles.actionsSection}>
              <h2 className={styles.actionsSectionTitle}>Módulos</h2>
              <div className={styles.actionsGrid}>
                <Link href="/registros/nuevo" className={`${styles.actionCard} ${styles.actionLink}`}>
                  <span className={styles.actionTitle}>Registrar horas</span>
                  <p className={styles.actionDescription}>
                    Carga tus horas trabajadas diarias en el sistema.
                  </p>
                </Link>
                <Link href="/registros" className={`${styles.actionCard} ${styles.actionLink}`}>
                  <span className={styles.actionTitle}>Ver registros</span>
                  <p className={styles.actionDescription}>
                    Visualiza y gestiona tu historial de horas cargadas.
                  </p>
                </Link>
                <Link href="/pendientes-jira" className={`${styles.actionCard} ${styles.actionLink}`}>
                  <span className={styles.actionTitle}>Pendientes Jira</span>
                  <p className={styles.actionDescription}>
                    Revisa qué horas faltan subir a tus tareas de Jira.
                  </p>
                </Link>
              </div>
            </div>
          </>
        )}

        {result.status === "not_found" && (
          <div className={`${styles.alertCard} ${styles.alertCardWarning}`}>
            <h2 className={styles.alertTitle}>Perfil no configurado</h2>
            <p className={styles.alertDescription}>
              Tu sesión está activa, pero no se ha encontrado un perfil correspondiente en la tabla{" "}
              <strong>profiles</strong> de Supabase. Comunícate con el administrador para registrar tu usuario.
            </p>
          </div>
        )}

        {result.status === "error" && (
          <div className={`${styles.alertCard} ${styles.alertCardError}`}>
            <h2 className={styles.alertTitle}>Error de conexión</h2>
            <p className={styles.alertDescription}>
              {result.error ||
                "Hubo un problema al cargar la información de tu perfil. Por favor, intenta de nuevo más tarde."}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}


