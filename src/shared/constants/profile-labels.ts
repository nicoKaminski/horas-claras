import { DeveloperName, AppRole } from "@/shared/types/profile";

export const DEVELOPER_DISPLAY_NAMES: Record<DeveloperName, string> = {
  dev: "dev-admin",
  compa: "dev-user",
};

export const ROLE_DISPLAY_NAMES: Record<AppRole, string> = {
  admin: "Admin",
  user: "User",
};

export function getDeveloperDisplayName(developerName: DeveloperName): string {
  return DEVELOPER_DISPLAY_NAMES[developerName] || developerName;
}

export function getRoleDisplayName(role: AppRole): string {
  return ROLE_DISPLAY_NAMES[role] || role;
}
