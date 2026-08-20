import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { getDashboardStats } from "../services/stats.service.js";

// Stuurt de actuele dashboardstatistieken naar de frontend.
export async function getStatsController(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const stats = await getDashboardStats();

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}