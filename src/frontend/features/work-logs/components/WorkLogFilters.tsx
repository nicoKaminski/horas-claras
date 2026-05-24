import { Profile } from "@/shared/types/profile";
import Link from "next/link";
import styles from "./WorkLogFilters.module.css";

interface WorkLogFiltersProps {
  currentProfile: Profile;
  initialFilters: {
    developer?: string;
    jira?: string;
    from?: string;
    to?: string;
    q?: string;
  };
}

export default function WorkLogFilters({ currentProfile, initialFilters }: WorkLogFiltersProps) {
  const isAdmin = currentProfile.role === "admin";

  return (
    <form method="GET" action="/registros" className={styles.filtersForm}>
      <div className={styles.filtersGrid}>
        {/* 1. Selector Desarrollador (Solo Admin) */}
        {isAdmin && (
          <div className={styles.filterField}>
            <label htmlFor="filter-developer">Desarrollador</label>
            <select
              id="filter-developer"
              name="developer"
              className={styles.select}
              defaultValue={initialFilters.developer || "todos"}
            >
              <option value="todos">Todos</option>
              <option value="dev">dev</option>
              <option value="compa">compa</option>
            </select>
          </div>
        )}

        {/* 2. Estado Jira */}
        <div className={styles.filterField}>
          <label htmlFor="filter-jira">Estado Jira</label>
          <select
            id="filter-jira"
            name="jira"
            className={styles.select}
            defaultValue={initialFilters.jira || "todos"}
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendiente Jira</option>
            <option value="cargado">Cargado Jira</option>
          </select>
        </div>

        {/* 3. Fecha Desde */}
        <div className={styles.filterField}>
          <label htmlFor="filter-from">Fecha Desde</label>
          <input
            type="text"
            id="filter-from"
            name="from"
            placeholder="ej. 5/4/26 o 2026-04-05"
            className={styles.input}
            defaultValue={initialFilters.from || ""}
          />
        </div>

        {/* 4. Fecha Hasta */}
        <div className={styles.filterField}>
          <label htmlFor="filter-to">Fecha Hasta</label>
          <input
            type="text"
            id="filter-to"
            name="to"
            placeholder="ej. 05-04-2026"
            className={styles.input}
            defaultValue={initialFilters.to || ""}
          />
        </div>

        {/* 5. Búsqueda */}
        <div className={styles.filterFieldFull}>
          <label htmlFor="filter-q">Buscar tarea o descripción</label>
          <input
            type="text"
            id="filter-q"
            name="q"
            placeholder="Buscar por ticket, título o descripción..."
            className={styles.input}
            defaultValue={initialFilters.q || ""}
          />
        </div>
      </div>

      <div className={styles.filterActions}>
        <Link href="/registros" className={styles.buttonClear}>
          Limpiar filtros
        </Link>
        <button type="submit" className={styles.buttonApply}>
          Aplicar filtros
        </button>
      </div>
    </form>
  );
}
