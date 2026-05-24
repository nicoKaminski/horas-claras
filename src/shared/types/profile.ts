export type DeveloperName = "dev" | "compa";
export type AppRole = "admin" | "user";

export interface Profile {
  id: string;
  username: DeveloperName;
  developer_name: DeveloperName;
  role: AppRole;
}
