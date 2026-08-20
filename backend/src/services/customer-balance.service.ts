import { prisma } from "../config/database.js";

interface CustomerBalance {
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

export async function getCustomerBalances(): Promise<
  CustomerBalance[]
> {
  const customers = await prisma.customer.findMany({
    include: {
      transactions: {
        where: {
          status: "COMPLETED",
        },
        select: {
          type: true,
          amount: true,
          currency: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const balances: CustomerBalance[] = [];

  for (const customer of customers) {
    const currencyMap = new Map<
      string,
      {
        totalSales: number;
        totalPaid: number;
      }
    >();

    for (const transaction of customer.transactions) {
      const current =
        currencyMap.get(transaction.currency) ?? {
          totalSales: 0,
          totalPaid: 0,
        };

      const amount = Number(transaction.amount);

      if (transaction.type === "SALE") {
        current.totalSales += amount;
      }

      if (transaction.type === "PAYMENT") {
        current.totalPaid += amount;
      }

      currencyMap.set(transaction.currency, current);
    }

    if (currencyMap.size === 0) {
      balances.push({
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        company: customer.company,
        isArchived: customer.isArchived,
        currency: "EUR",
        totalSales: 0,
        totalPaid: 0,
        outstanding: 0,
      });

      continue;
    }

    for (const [currency, values] of currencyMap.entries()) {
      balances.push({
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        company: customer.company,
        isArchived: customer.isArchived,
        currency,
        totalSales: values.totalSales,
        totalPaid: values.totalPaid,
        outstanding:
          values.totalSales - values.totalPaid,
      });
    }
  }

  return balances;
}