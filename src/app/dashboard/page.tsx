import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/backend/profiles/get-current-profile";
import { getDashboardMetrics } from "@/backend/work-logs/get-dashboard-metrics";
import { getDeveloperDisplayName } from "@/shared/constants/profile-labels";
import AppShell from "@/frontend/components/app-shell/AppShell";
import DashboardFilters from "@/frontend/features/dashboard/components/DashboardFilters";
import MonthlyRateCard from "@/frontend/features/dashboard/components/MonthlyRateCard";
import styles from "./page.module.css";

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(value);
};



export const metadata = {
  title: "Dashboard · Horas Claras",
  description: "Panel de control principal",
};

interface DashboardPageProps {
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const profileResult = await getCurrentProfile();

  if (profileResult.status === "unauthenticated") {
    redirect("/login");
  }

  if (profileResult.status !== "success" || !profileResult.profile) {
    redirect("/login");
  }

  const { profile } = profileResult;

  const resolvedParams = await searchParams;
  const currentMonth = resolvedParams.month ? Number(resolvedParams.month) : new Date().getMonth() + 1;
  const currentYear = resolvedParams.year ? Number(resolvedParams.year) : new Date().getFullYear();

  const metricsResult = await getDashboardMetrics(currentMonth, currentYear);
  const metrics = metricsResult.status === "success" ? metricsResult.metrics : null;

  const ratesCard = metrics ? (
    <div className={`${styles.card} ${styles.fullWidthCard}`}>
      <h2 className={styles.cardTitle}>Tarifas y Cobro ({metrics.month_name})</h2>
      <div className={styles.ratesGrid}>
        {profile.role === "admin" ? (
          <>
            <MonthlyRateCard
              key={`dev-${currentYear}-${currentMonth}`}
              developerName="dev"
              hourlyRate={metrics.breakdown?.dev.hourlyRate ?? null}
              amountToCharge={metrics.breakdown?.dev.amountToCharge ?? null}
              hasConfiguredRate={metrics.breakdown?.dev.hasConfiguredRate ?? false}
              totalHours={metrics.breakdown?.dev.total_hours ?? 0}
              year={currentYear}
              month={currentMonth}
              isAdmin={true}
            />
            <MonthlyRateCard
              key={`compa-${currentYear}-${currentMonth}`}
              developerName="compa"
              hourlyRate={metrics.breakdown?.compa.hourlyRate ?? null}
              amountToCharge={metrics.breakdown?.compa.amountToCharge ?? null}
              hasConfiguredRate={metrics.breakdown?.compa.hasConfiguredRate ?? false}
              totalHours={metrics.breakdown?.compa.total_hours ?? 0}
              year={currentYear}
              month={currentMonth}
              isAdmin={true}
            />
          </>
        ) : (
          <MonthlyRateCard
            key={`${profile.developer_name}-${currentYear}-${currentMonth}`}
            developerName={profile.developer_name}
            hourlyRate={metrics.hourlyRate ?? null}
            amountToCharge={metrics.amountToCharge ?? null}
            hasConfiguredRate={metrics.hasConfiguredRate ?? false}
            totalHours={metrics.total_hours}
            year={currentYear}
            month={currentMonth}
            isAdmin={false}
          />
        )}
      </div>


      {profile.role === "admin" && (
        <>
          {metrics.hasConfiguredRate ? (
            <div className={styles.totalBanner}>
              <span className={styles.totalBannerText}>Total a pagar estimado (período):</span>
              <strong className={styles.totalBannerValue}>
                {formatCurrency(metrics.amountToCharge)}
              </strong>
            </div>
          ) : (
            <div className={styles.totalBannerMissing}>
              <span>Falta configurar tarifas de desarrolladores activos para calcular el total general.</span>
            </div>
          )}
        </>
      )}
    </div>
  ) : null;

  return (

    <AppShell profile={profile} activeItem="dashboard">
      <div className={styles.dashboardContainer}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>
              Estadísticas y estado de tus registros para el período seleccionado
            </p>
          </div>
        </header>

        <DashboardFilters currentMonth={currentMonth} currentYear={currentYear} />

        {metricsResult.status === "success" && metricsResult.metrics && (
          <>
            {metricsResult.metrics.total_logs === 0 ? (
              <div className={styles.contentGrid}>
                {ratesCard}
                <div className={`${styles.emptyMetrics} ${styles.fullWidthCard}`}>
                  <p className={styles.emptyMetricsText}>
                    No hay registros de horas cargados en este período todavía.
                  </p>
                </div>
              </div>
            ) : (
              <div className={styles.contentGrid}>
                {/* 1. Tarjetas de métricas principales */}
                <div className={styles.metricsGrid}>
                  <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Total Horas Mes</span>
                    <span className={styles.metricValue}>
                      {metricsResult.metrics.total_hours} hs
                    </span>
                  </div>
                  <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Total Registros</span>
                    <span className={styles.metricValue}>
                      {metricsResult.metrics.total_logs}
                    </span>
                  </div>
                  <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Promedio por Registro</span>
                    <span className={styles.metricValue}>
                      {metricsResult.metrics.average_hours_per_log} hs
                    </span>
                  </div>
                  <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Día con Más Horas</span>
                    <span className={styles.metricValue}>
                      {metricsResult.metrics.top_day
                        ? `${metricsResult.metrics.top_day.hours} hs (Día ${metricsResult.metrics.top_day.date.split("-")[2]})`
                        : "-"}
                    </span>
                  </div>
                </div>

                {/* 2. Barra de progreso Jira */}
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Estado de carga en Jira</h2>
                  <div className={styles.jiraSection}>
                    <div className={styles.jiraMetrics}>
                      <div className={styles.jiraMetricItem}>
                        <span className={`${styles.dot} ${styles.dotSuccess}`} />
                        <div>
                          <span className={styles.jiraMetricLabel}>Cargadas en Jira</span>
                          <strong className={styles.jiraMetricVal}>
                            {metricsResult.metrics.loaded_jira_hours} hs ({metricsResult.metrics.loaded_jira_count} logs)
                          </strong>
                        </div>
                      </div>
                      <div className={styles.jiraMetricItem}>
                        <span className={`${styles.dot} ${styles.dotWarning}`} />
                        <div>
                          <span className={styles.jiraMetricLabel}>Pendientes de Jira</span>
                          <strong className={styles.jiraMetricVal}>
                            {metricsResult.metrics.pending_jira_hours} hs ({metricsResult.metrics.pending_jira_count} logs)
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className={styles.progressContainer}>
                      <div
                        className={styles.progressBar}
                        style={{ width: `${metricsResult.metrics.jira_loaded_percentage}%` }}
                      />
                    </div>
                    <div className={styles.progressDetails}>
                      <span>{metricsResult.metrics.jira_loaded_percentage}% completado</span>
                    </div>
                  </div>
                </div>

                {/* Tarifas y Cobro Section */}
                {ratesCard}


                {/* 3. Gráfico de barras diario */}

                <div className={`${styles.card} ${styles.fullWidthCard}`}>
                  <h2 className={styles.cardTitle}>Horas trabajadas por día</h2>
                  <div className={styles.chartScroll}>
                    <div className={styles.barChart}>
                      {metricsResult.metrics.daily_series.map((day) => {
                        const dayNum = day.date.split("-")[2];
                        const maxDailyHours = Math.max(
                          ...metricsResult.metrics!.daily_series.map((d) => d.hours),
                          8
                        );
                        const heightPercent = (day.hours / maxDailyHours) * 100;

                        return (
                          <div
                            key={day.date}
                            className={styles.barColumn}
                            title={`${day.date}: ${day.hours} hs`}
                          >
                            <div className={styles.barWrapper}>
                              <div
                                className={`${styles.bar} ${day.hours > 0 ? styles.barActive : ""}`}
                                style={{ height: `${heightPercent}%` }}
                              />
                            </div>
                            <span className={styles.barLabel}>{Number(dayNum)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 4. Desglose para admin por desarrollador */}
                {metricsResult.metrics.breakdown && (
                  <div className={`${styles.card} ${styles.fullWidthCard}`}>
                    <h2 className={styles.cardTitle}>Desglose por Desarrollador</h2>
                    <div className={styles.breakdownGrid}>
                      <div className={styles.breakdownCard}>
                        <div className={styles.breakdownHeader}>
                          <span className={styles.breakdownDevName}>{getDeveloperDisplayName("dev")} (Admin)</span>
                          <span className={`${styles.badge} ${styles.badgeDev}`}>{getDeveloperDisplayName("dev")}</span>
                        </div>
                        <div className={styles.breakdownRow}>
                          <span className={styles.breakdownLabel}>Horas totales:</span>
                          <strong className={styles.breakdownValue}>
                            {metricsResult.metrics.breakdown.dev.total_hours} hs
                          </strong>
                        </div>
                        <div className={styles.breakdownRow}>
                          <span className={styles.breakdownLabel}>Pendientes Jira:</span>
                          <strong className={styles.breakdownValue}>
                            {metricsResult.metrics.breakdown.dev.pending_jira_count}
                          </strong>
                        </div>
                      </div>
                      <div className={styles.breakdownCard}>
                        <div className={styles.breakdownHeader}>
                          <span className={styles.breakdownDevName}>{getDeveloperDisplayName("compa")} (Usuario)</span>
                          <span className={`${styles.badge} ${styles.badgeCompa}`}>{getDeveloperDisplayName("compa")}</span>
                        </div>
                        <div className={styles.breakdownRow}>
                          <span className={styles.breakdownLabel}>Horas totales:</span>
                          <strong className={styles.breakdownValue}>
                            {metricsResult.metrics.breakdown.compa.total_hours} hs
                          </strong>
                        </div>
                        <div className={styles.breakdownRow}>
                          <span className={styles.breakdownLabel}>Pendientes Jira:</span>
                          <strong className={styles.breakdownValue}>
                            {metricsResult.metrics.breakdown.compa.pending_jira_count}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {metricsResult.status === "error" && (
          <div className={styles.errorCard}>
            <p className={styles.errorText}>
              {metricsResult.error || "Hubo un problema al cargar las métricas de horas."}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
