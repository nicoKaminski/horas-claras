"use client";

import { useState } from "react";
import Link from "next/link";
import { FiClock, FiGrid, FiUser, FiMenu, FiX, FiLogOut } from "react-icons/fi";
import { logoutAction } from "@/backend/auth/actions";
import { Profile } from "@/shared/types/profile";
import { getDeveloperDisplayName, getRoleDisplayName } from "@/shared/constants/profile-labels";
import ThemeToggle from "../theme/ThemeToggle";
import styles from "./AppShell.module.css";

interface AppShellProps {
  children: React.ReactNode;
  profile: Profile;
  activeItem: "dashboard" | "hours" | "profile";
}

export default function AppShell({ children, profile, activeItem }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = () => setMobileOpen(!mobileOpen);
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className={styles.container}>
      {/* Mobile Top Bar */}
      <header className={styles.mobileHeader}>
        <div className={styles.logoContainer}>
          <img
            src="/logoHorasClarasDark.png"
            alt="Horas Claras"
            className={styles.logoImg}
          />
        </div>
        <button
          type="button"
          onClick={toggleMobile}
          className={styles.menuToggle}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </header>

      {/* Sidebar navigation */}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoContainer}>
            <img
              src="/logoHorasClarasDark.png"
              alt="Horas Claras"
              className={styles.logoImg}
            />
          </div>
          <button type="button" onClick={closeMobile} className={styles.mobileClose} aria-label="Cerrar menú">
            <FiX size={20} />
          </button>
        </div>

        {/* User Info */}
        <div className={styles.profileBox}>
          <div className={styles.avatar}>
            {profile.developer_name.substring(0, 2).toUpperCase()}
          </div>
          <div className={styles.profileDetails}>
            <span className={styles.profileName}>{getDeveloperDisplayName(profile.developer_name)}</span>
            <div className={styles.badgeRow}>
              <span className={`${styles.badge} ${profile.role === "admin" ? styles.adminBadge : styles.userBadge}`}>
                {getRoleDisplayName(profile.role)}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className={styles.nav} aria-label="Navegación principal">
          <Link
            href="/dashboard"
            onClick={closeMobile}
            className={`${styles.navItem} ${activeItem === "dashboard" ? styles.active : ""}`}
          >
            <FiGrid className={styles.navIcon} />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/registros"
            onClick={closeMobile}
            className={`${styles.navItem} ${activeItem === "hours" ? styles.active : ""}`}
          >
            <FiClock className={styles.navIcon} />
            <span>Mis Horas</span>
          </Link>

          <div className={`${styles.navItem} ${styles.disabled}`}>
            <FiUser className={styles.navIcon} />
            <div className={styles.disabledLabel}>
              <span>Perfil</span>
              <span className={styles.upcomingBadge}>Próximamente</span>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className={styles.sidebarFooter}>
          <div className={styles.footerRow}>
            <ThemeToggle />
            <form action={logoutAction}>
              <button type="submit" className={styles.logoutBtn} aria-label="Cerrar sesión" title="Cerrar sesión">
                <FiLogOut className={styles.logoutIcon} />
                <span>Cerrar sesión</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileOpen && <div className={styles.backdrop} onClick={closeMobile} />}

      {/* Main Content Area */}
      <div className={styles.contentWrapper}>
        <main className={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
}
