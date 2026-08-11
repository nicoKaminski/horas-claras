import { WorkLog } from "@/shared/types/work-log";
import { Profile } from "@/shared/types/profile";

export const formatTime = (timeStr: string | null): string => {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeStr;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export const getCanEdit = (log: WorkLog, currentProfile: Profile): boolean => {
  const isAdmin = currentProfile.role === "admin";
  const isOwner = log.user_id === currentProfile.id;
  const isPending = !log.jira_loaded;
  return isAdmin || (isOwner && isPending);
};
