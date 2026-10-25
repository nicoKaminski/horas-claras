import { useState, useRef, useMemo } from "react";
import { WorkLog } from "@/shared/types/work-log";
import { Profile } from "@/shared/types/profile";
import { normalizeDate } from "@/shared/validations/work-log";

interface UseWorkLogFiltersProps {
  logs: WorkLog[];
  currentProfile: Profile;
}

export function useWorkLogFilters({ logs, currentProfile }: UseWorkLogFiltersProps) {
  // Client-side filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJira, setSelectedJira] = useState("todos");
  const [selectedDeveloper, setSelectedDeveloper] = useState("todos");
  const [selectedTask, setSelectedTask] = useState("todas");
  const [selectedFrom, setSelectedFrom] = useState("");
  const [selectedTo, setSelectedTo] = useState("");

  // Tareas únicas correspondientes exclusivamente al mes y año de los registros cargados
  const availableTasks = useMemo(() => {
    const taskSet = new Set<string>();
    for (const log of logs) {
      const trimmed = log.task_title?.trim();
      if (trimmed) {
        taskSet.add(trimmed);
      }
    }
    return Array.from(taskSet).sort((a, b) =>
      a.localeCompare(b, "es", { sensitivity: "base" })
    );
  }, [logs]);

  const [previousAvailableTasks, setPreviousAvailableTasks] = useState(availableTasks);

  // Si cambia el período o la tarea seleccionada ya no existe en el mes actual, resetear a "todas"
  if (previousAvailableTasks !== availableTasks) {
    setPreviousAvailableTasks(availableTasks);
    if (selectedTask !== "todas" && !availableTasks.includes(selectedTask)) {
      setSelectedTask("todas");
    }
  }

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

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedJira("todos");
    setSelectedDeveloper("todos");
    setSelectedTask("todas");
    setSelectedFrom("");
    setSelectedTo("");
  };

  const filteredLogs = logs
    .filter((log) => {
      // Buscar texto (título o descripción)
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = log.task_title.toLowerCase().includes(query);
        const matchesDesc = log.description.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Tarea seleccionada
      if (selectedTask !== "todas") {
        if (log.task_title.trim().toLowerCase() !== selectedTask.trim().toLowerCase()) {
          return false;
        }
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
    })
    .sort((a, b) => {
      // 1. Fecha descendente
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      // 2. Horario de inicio descendente (la hora más reciente primero)
      if (a.start_time !== b.start_time) {
        return b.start_time.localeCompare(a.start_time);
      }
      // 3. Horario de fin descendente (si existe)
      const endA = a.end_time || "";
      const endB = b.end_time || "";
      if (endA !== endB) {
        return endB.localeCompare(endA);
      }
      // 4. Fallback por fecha de creación descendente
      return b.created_at.localeCompare(a.created_at);
    });

  return {
    searchQuery,
    setSearchQuery,
    selectedJira,
    setSelectedJira,
    selectedDeveloper,
    setSelectedDeveloper,
    selectedTask,
    setSelectedTask,
    availableTasks,
    selectedFrom,
    setSelectedFrom,
    selectedTo,
    setSelectedTo,
    fromDatePickerRef,
    toDatePickerRef,
    handleFromCalendarClick,
    handleToCalendarClick,
    clearFilters,
    filteredLogs,
  };
}
