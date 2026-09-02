import { redirect } from "next/navigation";
import Image from "next/image";
import { FiGithub, FiGlobe } from "react-icons/fi";
import { FaLinkedin } from "react-icons/fa";
import { getCurrentSession } from "@/backend/auth/get-current-session";
import LoginForm from "@/frontend/features/auth/components/LoginForm";
import ThemeToggle from "@/frontend/components/theme/ThemeToggle";
import styles from "./page.module.css";

export const metadata = {
  title: "Iniciar sesión · Horas Claras",
  description: "Accede a tu panel de control de Horas Claras",
};

export default async function LoginPage() {
  const user = await getCurrentSession();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <ThemeToggle />
      </header>

      <section className={styles.card} aria-labelledby="login-title">
        <div className={styles.logoContainer}>
          <Image
            src="/logo.svg"
            alt="Horas Claras"
            width={160}
            height={48}
            className={styles.logoImg}
            priority
          />
        </div>
        <h1 id="login-title" className={styles.title}>
          Iniciar sesión
        </h1>
        {/* <p className={styles.subtitle}>
          Ingresá tus credenciales para acceder a Horas Claras
        </p> */}
        <LoginForm />

        <div className={styles.visitorSection}>
          <hr className={styles.divider} />
          <p className={styles.visitorTitle}>¿Estás visitando el proyecto?</p>
          <div className={styles.visitorLinks}>
            <a
              href="https://github.com/nicoKaminski/horas-claras"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.visitorLink}
            >
              <FiGithub className={styles.linkIcon} aria-hidden="true" />
              <span>Repositorio</span>
            </a>
            <span className={styles.separator} aria-hidden="true">
              ·
            </span>
            <a
              href="https://nicokaminski.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.visitorLink}
            >
              <FiGlobe className={styles.linkIcon} aria-hidden="true" />
              <span>Portfolio</span>
            </a>
            <span className={styles.separator} aria-hidden="true">
              ·
            </span>
            <a
              href="https://www.linkedin.com/in/nkaminski-profile/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.visitorLink}
            >
              <FaLinkedin className={styles.linkIcon} aria-hidden="true" />
              <span>LinkedIn</span>
            </a>
          </div>
          <p className={styles.visitorAuthor}>Desarrollado por Nico Kaminski</p>
        </div>
      </section>
    </main>
  );
}
