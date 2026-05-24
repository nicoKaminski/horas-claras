import { useState } from "react";
import { WorkLog } from "@/shared/types/work-log";
import { Profile } from "@/shared/types/profile";
import {
  calculateTotalHoursByDateAndDev,
  getCanEdit,
} from "../utils/work-log-table";

interface UseWorkLogsTableRowsProps {
  logs: WorkLog[];
  currentProfile: Profile;
}

export function useWorkLogsTableRows({ logs, currentProfile }: UseWorkLogsTableRowsProps) {
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const totalHoursByDateAndDev = calculateTotalHoursByDateAndDev(logs);

  const checkCanEdit = (log: WorkLog) => {
    return getCanEdit(log, currentProfile);
  };

  return {
    expandedLogs,
    toggleExpand,
    totalHoursByDateAndDev,
    checkCanEdit,
  };
}
