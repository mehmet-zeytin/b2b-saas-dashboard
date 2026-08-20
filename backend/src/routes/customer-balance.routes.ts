import { Router } from "express";
import { listCustomerBalances } from "../controllers/customer-balance.controller.js";

const router = Router();

router.get("/", listCustomerBalances);

export default router;