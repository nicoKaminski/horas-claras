import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="home-title">
        <p className={styles.kicker}>Mini app interna</p>
        <h1 id="home-title">Horas Claras</h1>
        <p className={styles.subtitle}>
          Registro simple de horas y control de carga en Jira
        </p>
        <p className={styles.description}>
          Una mini app para registrar horas de dev y compa, revisar pendientes
          y marcar qué ya fue cargado en Jira.
        </p>

        <ul className={styles.featureList}>
          <li>Registrar horas por fecha y tarea</li>
          <li>Revisar pendientes de Jira</li>
          <li>Marcar registros cargados</li>
        </ul>

        <p className={styles.note}>
          El login y la conexión con Supabase se implementarán en los próximos
          pasos.
        </p>
      </section>
    </main>
  );
}
