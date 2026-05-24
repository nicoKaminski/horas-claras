import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/backend/profiles/get-current-profile";
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
                <div className={`${styles.actionCard} ${styles.actionCardDisabled}`}>
                  <span className={styles.actionTitle}>Pendientes Jira</span>
                  <p className={styles.actionDescription}>
                    Revisa qué horas faltan subir a tus tareas de Jira.
                  </p>
                  <span className={styles.actionStatus}>Próximamente</span>
                </div>
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

