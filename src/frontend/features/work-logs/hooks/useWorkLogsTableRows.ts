import { useState } from "react";
import { WorkLog } from "@/shared/types/work-log";
import { Profile } from "@/shared/types/profile";
import {
  getCanEdit,
} from "../utils/work-log-table";

interface UseWorkLogsTableRowsProps {
  currentProfile: Profile;
}

export function useWorkLogsTableRows({ currentProfile }: UseWorkLogsTableRowsProps) {
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const checkCanEdit = (log: WorkLog) => {
    return getCanEdit(log, currentProfile);
  };

  return {
    expandedLogs,
    toggleExpand,
    checkCanEdit,
  };
}
