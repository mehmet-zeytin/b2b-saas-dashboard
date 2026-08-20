export type CustomerStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED";

export type CustomerTransactionType =
  | "SALE"
  | "PAYMENT";

export type CustomerTransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED";

export interface Customer {
  id: number;
  name: string;
  email: string;
  company: string | null;
  status: CustomerStatus;
  isArchived: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDetails
  extends Customer {
  transactions: CustomerTransaction[];
  subscriptions: CustomerSubscription[];
}

export interface CustomerTransaction {
  id: number;
  customerId: number;
  type: CustomerTransactionType;
  amount: string;
  currency: string;
  status: CustomerTransactionStatus;
  description: string | null;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSubscription {
  id: number;
  customerId: number;
  planName: string;
  amount: string;
  status: string;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerInput {
  name: string;
  email: string;
  company?: string;
}

export interface UpdateCustomerInput {
  name?: string;
  email?: string;
  company?: string | null;
  status?: CustomerStatus;
}

export interface CustomerMutationResponse {
  message: string;
  data: Customer;
}