export interface CustomerBalance {
  customerId: number;
  customerName: string;
  customerEmail: string;
  company: string | null;
  isArchived: boolean;
  currency: string;
  totalSales: number;
  totalPaid: number;
  outstanding: number;
}