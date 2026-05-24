import { DeveloperName } from "./profile";

export interface WorkLog {
  id: string;
  user_id: string;
  developer_name: DeveloperName;
  created_by: string;
  date: string;
  start_time: string;
  end_time: string | null;
  duration_hours: number;
  task_title: string;
  description: string;
  jira_loaded: boolean;
  jira_loaded_at: string | null;
  created_at: string;
  updated_at: string;
}
