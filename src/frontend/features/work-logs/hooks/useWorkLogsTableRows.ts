import { WorkLog } from "@/shared/types/work-log";
import { Profile } from "@/shared/types/profile";
import { getCanEdit } from "../utils/work-log-table";

interface UseWorkLogsTableRowsProps {
  currentProfile: Profile;
}

export function useWorkLogsTableRows({ currentProfile }: UseWorkLogsTableRowsProps) {
  const checkCanEdit = (log: WorkLog) => {
    return getCanEdit(log, currentProfile);
  };

  return {
    checkCanEdit,
  };
}

