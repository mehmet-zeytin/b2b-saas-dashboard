import { Router } from "express";
import { getStatsController } from "../controllers/stats.controller.js";

const router = Router();

// Haalt de dashboardstatistieken op.
router.get("/", getStatsController);

export default router;