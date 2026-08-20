import { apiRequest } from "./api";

import type { CustomerBalance } from "../types/customer-balance.types";

export async function getCustomerBalances(): Promise<
  CustomerBalance[]
> {
  return apiRequest<CustomerBalance[]>(
    "/api/customers/balances",
  );
}