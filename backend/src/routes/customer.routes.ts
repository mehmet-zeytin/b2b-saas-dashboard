import { Router } from "express";

import {
  archiveCustomerController,
  createCustomerController,
  getArchivedCustomersController,
  getCustomerByIdController,
  getCustomersController,
  restoreCustomerController,
  updateCustomerController,
} from "../controllers/customer.controller.js";

const router = Router();

// Haalt alle niet-gearchiveerde klanten op.
router.get("/", getCustomersController);

// Haalt alle gearchiveerde klanten op.
router.get("/archived", getArchivedCustomersController);

// Haalt één klant op.
router.get("/:id", getCustomerByIdController);

// Maakt een nieuwe klant aan.
router.post("/", createCustomerController);

// Werkt een bestaande klant bij.
router.patch("/:id", updateCustomerController);

// Archiveert een klant.
router.patch("/:id/archive", archiveCustomerController);

// Herstelt een gearchiveerde klant.
router.patch("/:id/restore", restoreCustomerController);

export default router;