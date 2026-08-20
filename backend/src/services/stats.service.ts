import { prisma } from "../config/database.js";

export interface DashboardStat {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}

function formatCurrency(
  amount: number,
  currency = "EUR",
): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Berekent de financiële dashboardgegevens rechtstreeks uit de database.
export async function getDashboardStats(): Promise<
  DashboardStat[]
> {
  const [
    salesResult,
    paymentsResult,
    activeCustomerCount,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        type: "SALE",
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.transaction.aggregate({
      where: {
        type: "PAYMENT",
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.customer.count({
      where: {
        status: "ACTIVE",
        isArchived: false,
      },
    }),
  ]);

  const totalSales = Number(
    salesResult._sum.amount ?? 0,
  );

  const totalPayments = Number(
    paymentsResult._sum.amount ?? 0,
  );

  const outstanding =
    totalSales - totalPayments;

  return [
    {
      title: "Totale verkoop",
      value: formatCurrency(totalSales),
      change: "Voltooide verkopen",
      isPositive: totalSales > 0,
    },
    {
      title: "Totaal ontvangen",
      value: formatCurrency(totalPayments),
      change: "Ontvangen betalingen",
      isPositive: totalPayments > 0,
    },
    {
      title: "Openstaand bedrag",
      value: formatCurrency(outstanding),
      change:
        outstanding > 0
          ? "Nog te ontvangen"
          : outstanding < 0
            ? "Meer ontvangen dan verkocht"
            : "Volledig voldaan",
      isPositive: outstanding <= 0,
    },
    {
      title: "Actieve klanten",
      value: activeCustomerCount.toLocaleString(
        "nl-NL",
      ),
      change: "Niet gearchiveerd",
      isPositive: activeCustomerCount > 0,
    },
  ];
}