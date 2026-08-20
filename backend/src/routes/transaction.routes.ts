import { Router } from "express";
import {
  listTransactions,
  modifyTransaction,
  showTransaction,
  storeTransaction,
} from "../controllers/transaction.controller.js";

const router = Router();

router.get("/", listTransactions);
router.get("/:id", showTransaction);
router.post("/", storeTransaction);
router.patch("/:id", modifyTransaction);

export default router;