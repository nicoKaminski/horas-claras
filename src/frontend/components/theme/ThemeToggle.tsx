"use client";

import { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "night">("light");

  useEffect(() => {
    // Read theme on client mount
    const savedTheme = localStorage.getItem("theme") as "light" | "night" | null;
    const initialTheme =
      savedTheme ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "light");
    document.documentElement.setAttribute("data-theme", initialTheme);
    
    const timer = setTimeout(() => {
      setTheme(initialTheme);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "night" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

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
