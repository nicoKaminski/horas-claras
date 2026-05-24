"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styles from "./DashboardFilters.module.css";

interface DashboardFiltersProps {
  currentMonth: number;
  currentYear: number;
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function DashboardFilters({ currentMonth, currentYear }: DashboardFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (month: number, year: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", month.toString());
    params.set("year", year.toString());
    router.push(`/dashboard?${params.toString()}`);
  };

  const years = [];
  const currentSystemYear = new Date().getFullYear();
  // Generate options for the last 3 years and next 2 years
  for (let y = currentSystemYear - 3; y <= currentSystemYear + 2; y++) {
    years.push(y);
  }

  return (
    <div className={styles.container}>
      <div className={styles.filterGroup}>
        <label htmlFor="dashboard-month" className={styles.label}>Mes</label>
        <select
          id="dashboard-month"
          value={currentMonth}
          onChange={(e) => handleFilterChange(Number(e.target.value), currentYear)}
          className={styles.select}
        >
          {MONTH_NAMES.map((name, index) => (
            <option key={index} value={index + 1}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="dashboard-year" className={styles.label}>Año</label>
        <select
          id="dashboard-year"
          value={currentYear}
          onChange={(e) => handleFilterChange(currentMonth, Number(e.target.value))}
          className={styles.select}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
