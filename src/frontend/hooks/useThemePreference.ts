"use client";

import { useEffect, useState } from "react";

export function useThemePreference() {
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

  return { theme, toggleTheme };
}
