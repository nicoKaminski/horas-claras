import { redirect } from "next/navigation";
import Image from "next/image";
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
            src="/logoHorasClarasDark.png"
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
      </section>
    </main>
  );
}
