import { DeveloperName } from "./profile";

export interface DeveloperMetrics {
  total_hours: number;
  pending_jira_count: number;
}

export interface DashboardMetrics {
  total_hours: number;
  total_logs: number;
  pending_jira_count: number;
  loaded_jira_count: number;
  pending_jira_hours: number;
  loaded_jira_hours: number;
  jira_loaded_percentage: number;
  average_hours_per_log: number;
  top_day: { date: string; hours: number } | null;
  daily_series: { date: string; hours: number }[];
  breakdown: Record<DeveloperName, DeveloperMetrics> | null;
  month_name: string;
  start_date: string;
  end_date: string;
}

