import { apiRequest } from "./api";

import type {
  CustomerActivity,
} from "../types/customer-activity.types";

// Haalt de volledige activiteitengeschiedenis van één klant op.
export function getCustomerActivities(
  customerId: number,
): Promise<CustomerActivity[]> {
  return apiRequest<CustomerActivity[]>(
    `/api/customer-activities/${customerId}`,
  );
}