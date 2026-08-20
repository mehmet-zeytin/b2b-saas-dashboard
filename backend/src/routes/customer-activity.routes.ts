import {
  Router,
} from "express";

import {
  listCustomerActivities,
} from "../controllers/customer-activity.controller.js";

const router =
  Router();

router.get(
  "/:customerId",
  listCustomerActivities,
);

export default router;