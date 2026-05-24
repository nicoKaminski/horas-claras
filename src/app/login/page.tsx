import { redirect } from "next/navigation";
import { getCurrentSession } from "@/backend/auth/get-current-session";
import LoginForm from "@/frontend/features/auth/components/LoginForm";
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
      <section className={styles.card} aria-labelledby="login-title">
        <h1 id="login-title" className={styles.title}>Iniciar sesión</h1>
        <p className={styles.subtitle}>
          Ingresá tus credenciales para acceder a Horas Claras
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
