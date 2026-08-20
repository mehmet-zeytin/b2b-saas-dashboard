import { apiRequest } from "./api";
import type { DashboardStat } from "../types/stats.types";

// Haalt de actuele dashboardstatistieken op.
export function getDashboardStats(): Promise<
  DashboardStat[]
> {
  return apiRequest<DashboardStat[]>("/api/stats");
}