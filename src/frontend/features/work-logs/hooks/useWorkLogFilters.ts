import { useState, useRef } from "react";
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

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedJira("todos");
    setSelectedDeveloper("todos");
    setSelectedFrom("");
    setSelectedTo("");
  };

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

  return {
    searchQuery,
    setSearchQuery,
    selectedJira,
    setSelectedJira,
    selectedDeveloper,
    setSelectedDeveloper,
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
