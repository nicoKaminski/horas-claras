import { DeveloperName } from "./profile";

export interface MonthlyHourlyRate {
  id: string;
  developer_name: DeveloperName;
  year: number;
  month: number;
  hourly_rate: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MonthlyRateDeveloperSummary {
  developer_name: DeveloperName;
  hourly_rate: number | null;
  amount_to_charge: number | null;
  has_configured_rate: boolean;
  total_hours: number;
}
