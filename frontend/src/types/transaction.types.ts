export type TransactionType =
  | "SALE"
  | "PAYMENT";

export type TransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED";

export type TransactionCustomerStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED";

export interface TransactionCustomer {
  id: number;
  name: string;
  email: string;
  company: string | null;
  status: TransactionCustomerStatus;
  isArchived: boolean;
}

export interface Transaction {
  id: number;
  customerId: number;
  type: TransactionType;
  amount: string;
  currency: string;
  status: TransactionStatus;
  description: string | null;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
  customer: TransactionCustomer;
}

export interface CreateTransactionInput {
  customerId: number;
  type: TransactionType;
  amount: number;
  currency?: string;
  status?: TransactionStatus;
  description?: string | null;
  transactionDate?: string;
}

export interface UpdateTransactionInput {
  type?: TransactionType;
  amount?: number;
  currency?: string;
  status?: TransactionStatus;
  description?: string | null;
  transactionDate?: string;

  // Verplicht bij iedere handmatige wijziging.
  changeNote: string;
}