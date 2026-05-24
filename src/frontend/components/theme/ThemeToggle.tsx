"use client";

import { FiSun, FiMoon } from "react-icons/fi";
import { useThemePreference } from "@/frontend/hooks/useThemePreference";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemePreference();

  return (
    <button
      type="button"
      className={styles.toggleButton}
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Cambiar a tema oscuro" : "Cambiar a tema claro"}
      title={theme === "light" ? "Tema Oscuro" : "Tema Claro"}
    >
      {theme === "light" ? (
        <FiMoon className={styles.icon} />
      ) : (
        <FiSun className={styles.icon} />
      )}
    </button>
  );
}
