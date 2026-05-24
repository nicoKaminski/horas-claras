"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiPlus, FiSearch, FiRefreshCw } from "react-icons/fi";
import { WorkLog } from "@/shared/types/work-log";
import { Profile } from "@/shared/types/profile";
import AppModal from "@/frontend/components/modal/AppModal";
import WorkLogForm from "./WorkLogForm";
import WorkLogsTable from "./WorkLogsTable";
import { normalizeDate } from "@/shared/validations/work-log";
import styles from "./Workspace.module.css";

interface WorkspaceProps {
  logs: WorkLog[];
  currentProfile: Profile;
  initialMonth: number;
  initialYear: number;
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function Workspace({ logs, currentProfile, initialMonth, initialYear }: WorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [logToEdit, setLogToEdit] = useState<WorkLog | null>(null);

  // Client-side filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJira, setSelectedJira] = useState("todos");
  const [selectedDeveloper, setSelectedDeveloper] = useState("todos");
  const [selectedFrom, setSelectedFrom] = useState("");
  const [selectedTo, setSelectedTo] = useState("");

  // Refs and click handlers for date pickers
  const fromDatePickerRef = useRef<HTMLInputElement>(null);
  const toDatePickerRef = useRef<HTMLInputElement>(null);

  const handleFromCalendarClick = () => {
    try {
      fromDatePickerRef.current?.showPicker();
    } catch {
      // Fallback
    }
  };

  const handleToCalendarClick = () => {
    try {
      toDatePickerRef.current?.showPicker();
    } catch {
      // Fallback
    }
  };

  const handleMonthYearChange = (month: number, year: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("month", month.toString());
      params.set("year", year.toString());
      router.push(`/registros?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedJira("todos");
    setSelectedDeveloper("todos");
    setSelectedFrom("");
    setSelectedTo("");
  };

  // 1. Filtrar registros en el cliente
  const filteredLogs = logs.filter((log) => {
    // Buscar texto (título o descripción)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      const matchesTitle = log.task_title.toLowerCase().includes(query);
      const matchesDesc = log.description.toLowerCase().includes(query);
      if (!matchesTitle && !matchesDesc) return false;
    }

    // Estado Jira
    if (selectedJira !== "todos") {
      if (selectedJira === "pendiente" && log.jira_loaded) return false;
      if (selectedJira === "cargado" && !log.jira_loaded) return false;
    }

    // Desarrollador (solo admin)
    if (currentProfile.role === "admin" && selectedDeveloper !== "todos") {
      if (log.developer_name !== selectedDeveloper) return false;
    }

    // Fechas normalizadas
    const normFrom = normalizeDate(selectedFrom);
    if (normFrom && log.date < normFrom) return false;

    const normTo = normalizeDate(selectedTo);
    if (normTo && log.date > normTo) return false;

    return true;
  });

  const handleEditClick = (log: WorkLog) => {
    setLogToEdit(log);
    setIsEditOpen(true);
  };

  const closeCreateModal = () => setIsCreateOpen(false);
  const closeEditModal = () => {
    setLogToEdit(null);
    setIsEditOpen(false);
  };

  const years = [];
  const currentSystemYear = new Date().getFullYear();
  for (let y = currentSystemYear - 3; y <= currentSystemYear + 2; y++) {
    years.push(y);
  }

  const isAdmin = currentProfile.role === "admin";

  return (
    <div className={styles.workspace}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Workspace de Horas</h1>
          <p className={styles.subtitle}>
            Gestioná y controlá los registros de horas del equipo
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className={styles.btnPrimary}
        >
          <FiPlus size={18} />
          <span>Cargar horas</span>
        </button>
      </header>

      {/* Filtros avanzados */}
      <section className={styles.filtersSection} aria-label="Filtros de registros">
        <div className={styles.filtersGrid}>
          {/* Mes */}
          <div className={styles.filterGroup}>
            <label htmlFor="workspace-month" className={styles.label}>Mes</label>
            <select
              id="workspace-month"
              value={initialMonth}
              onChange={(e) => handleMonthYearChange(Number(e.target.value), initialYear)}
              className={styles.select}
              disabled={isPending}
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={idx} value={idx + 1}>{name}</option>
              ))}
            </select>
          </div>

          {/* Año */}
          <div className={styles.filterGroup}>
            <label htmlFor="workspace-year" className={styles.label}>Año</label>
            <select
              id="workspace-year"
              value={initialYear}
              onChange={(e) => handleMonthYearChange(initialMonth, Number(e.target.value))}
              className={styles.select}
              disabled={isPending}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Jira */}
          <div className={styles.filterGroup}>
            <label htmlFor="workspace-jira" className={styles.label}>Estado Jira</label>
            <select
              id="workspace-jira"
              value={selectedJira}
              onChange={(e) => setSelectedJira(e.target.value)}
              className={styles.select}
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="cargado">Cargado</option>
            </select>
          </div>

          {/* Desarrollador (admin) */}
          {isAdmin && (
            <div className={styles.filterGroup}>
              <label htmlFor="workspace-dev" className={styles.label}>Desarrollador</label>
              <select
                id="workspace-dev"
                value={selectedDeveloper}
                onChange={(e) => setSelectedDeveloper(e.target.value)}
                className={styles.select}
              >
                <option value="todos">Todos</option>
                <option value="dev">dev</option>
                <option value="compa">compa</option>
              </select>
            </div>
          )}
        </div>

        <div className={styles.filtersSecondRow}>
          {/* Buscador */}
          <div className={styles.searchGroup}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por ticket, título o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Rango de fechas */}
          <div className={styles.dateRangeGroup}>
            <div className={styles.dateInputContainer}>
              <input
                type="text"
                value={selectedFrom}
                onChange={(e) => setSelectedFrom(e.target.value)}
                placeholder="Desde (ej. 5/4/26)"
                className={styles.dateInput}
                aria-label="Fecha desde"
              />
              <button
                type="button"
                className={styles.calendarButton}
                onClick={handleFromCalendarClick}
                aria-label="Seleccionar fecha de inicio"
              >
                📅
              </button>
              <input
                ref={fromDatePickerRef}
                type="date"
                className={styles.hiddenDatePicker}
                tabIndex={-1}
                value={/^\d{4}-\d{2}-\d{2}$/.test(normalizeDate(selectedFrom) || "") ? normalizeDate(selectedFrom) || "" : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedFrom(e.target.value);
                  }
                }}
              />
            </div>
            <span className={styles.dateDivider}>a</span>
            <div className={styles.dateInputContainer}>
              <input
                type="text"
                value={selectedTo}
                onChange={(e) => setSelectedTo(e.target.value)}
                placeholder="Hasta (ej. 2026-04-05)"
                className={styles.dateInput}
                aria-label="Fecha hasta"
              />
              <button
                type="button"
                className={styles.calendarButton}
                onClick={handleToCalendarClick}
                aria-label="Seleccionar fecha de fin"
              >
                📅
              </button>
              <input
                ref={toDatePickerRef}
                type="date"
                className={styles.hiddenDatePicker}
                tabIndex={-1}
                value={/^\d{4}-\d{2}-\d{2}$/.test(normalizeDate(selectedTo) || "") ? normalizeDate(selectedTo) || "" : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedTo(e.target.value);
                  }
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className={styles.btnSecondary}
          >
            Limpiar
          </button>
        </div>
      </section>

      {/* Lista de Registros */}
      <section className={styles.contentSection}>
        {isPending ? (
          <div className={styles.loadingState}>
            <FiRefreshCw className={styles.spinner} size={24} />
            <p>Cargando registros del período...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No se encontraron registros</h3>
            <p>Intentá modificando los filtros o cargá un nuevo registro de horas.</p>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className={styles.btnPrimary}
            >
              <FiPlus size={16} />
              <span>Cargar horas</span>
            </button>
          </div>
        ) : (
          <WorkLogsTable
            logs={filteredLogs}
            currentProfile={currentProfile}
            onEdit={handleEditClick}
          />
        )}
      </section>

      {/* Modal para Crear Registro */}
      <AppModal
        isOpen={isCreateOpen}
        onClose={closeCreateModal}
        title="Registrar horas"
      >
        <WorkLogForm
          currentProfile={currentProfile}
          mode="create"
          onCancel={closeCreateModal}
        />
      </AppModal>

      {/* Modal para Editar Registro */}
      <AppModal
        isOpen={isEditOpen}
        onClose={closeEditModal}
        title="Editar registro"
      >
        {logToEdit && (
          <WorkLogForm
            currentProfile={currentProfile}
            mode="edit"
            workLogId={logToEdit.id}
            isLoadedInJira={logToEdit.jira_loaded}
            onCancel={closeEditModal}
            initialValues={{
              date: logToEdit.date,
              start_time: logToEdit.start_time,
              end_time: logToEdit.end_time,
              task_title: logToEdit.task_title,
              description: logToEdit.description,
            }}
          />
        )}
      </AppModal>
    </div>
  );
}
