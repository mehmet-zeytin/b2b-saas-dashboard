export type CustomerActivityType =
  | "CUSTOMER_CREATED"
  | "CUSTOMER_UPDATED"
  | "CUSTOMER_ARCHIVED"
  | "CUSTOMER_RESTORED"
  | "TRANSACTION_CREATED"
  | "TRANSACTION_UPDATED";

export interface ActivityChange {
  from: unknown;
  to: unknown;
}

export interface CustomerActivityMetadata {
  changes?: Record<
    string,
    ActivityChange
  >;

  transactionType?:
    | "SALE"
    | "PAYMENT";

  amount?: string;

  currency?: string;

  note?: string;
}

export interface CustomerActivityTransaction {
  id: number;

  type:
    | "SALE"
    | "PAYMENT";

  amount: string;

  currency: string;

  status:
    | "PENDING"
    | "COMPLETED"
    | "FAILED"
    | "REFUNDED";

  description:
    | string
    | null;

  transactionDate: string;
}

export interface CustomerActivity {
  id: number;

  customerId: number;

  transactionId:
    | number
    | null;

  type:
    CustomerActivityType;

  title: string;

  description:
    | string
    | null;

  metadata:
    | CustomerActivityMetadata
    | null;

  createdAt: string;

  transaction:
    | CustomerActivityTransaction
    | null;
}