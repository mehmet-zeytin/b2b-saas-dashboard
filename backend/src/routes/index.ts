import {
  Router,
} from "express";

import customerActivityRoutes from "./customer-activity.routes.js";
import customerBalanceRoutes from "./customer-balance.routes.js";
import customerRoutes from "./customer.routes.js";
import statsRoutes from "./stats.routes.js";
import transactionRoutes from "./transaction.routes.js";

const router =
  Router();

router.use(
  "/stats",
  statsRoutes,
);

router.use(
  "/transactions",
  transactionRoutes,
);

router.use(
  "/customer-activities",
  customerActivityRoutes,
);

// Deze route moet vóór /customers staan,
// anders kan "balances" als klant-ID worden geïnterpreteerd.
router.use(
  "/customers/balances",
  customerBalanceRoutes,
);

router.use(
  "/customers",
  customerRoutes,
);

export default router;