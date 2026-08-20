import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { getTransactions } from "../../services/transactions.service";

import type { Transaction } from "../../types/transaction.types";

interface MonthlyRevenue {
  key: string;
  label: string;
  revenue: number;
}

function createLastSixMonths(): MonthlyRevenue[] {
  const months: MonthlyRevenue[] = [];
  const currentDate = new Date();

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - index,
      1
    );

    months.push({
      key: `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`,
      label: new Intl.DateTimeFormat("nl-NL", {
        month: "short",
        year: "numeric",
      }).format(date),
      revenue: 0,
    });
  }

  return months;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function createMonthKey(dateValue: string): string | null {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

export default function RevenueChart() {
  const [transactions, setTransactions] = useState<
    Transaction[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<
    string | null
  >(null);

  async function loadTransactions(): Promise<void> {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getTransactions();

      setTransactions(data);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "De verkoopgegevens konden niet worden geladen.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadTransactions();
  }, []);

  const monthlyRevenue = useMemo(() => {
    const months = createLastSixMonths();

    const monthMap = new Map(
      months.map((month) => [
        month.key,
        month,
      ])
    );

    transactions.forEach((transaction) => {
      if (
        transaction.status !== "COMPLETED" ||
        transaction.customer.status !== "ACTIVE" ||
        transaction.customer.isArchived
      ) {
        return;
      }

      const monthKey = createMonthKey(
        transaction.transactionDate
      );

      if (!monthKey) {
        return;
      }

      const month = monthMap.get(monthKey);

      if (!month) {
        return;
      }

      const amount = Number(transaction.amount);

      if (!Number.isFinite(amount)) {
        return;
      }

      month.revenue += amount;
    });

    return months;
  }, [transactions]);

  const maximumRevenue = Math.max(
    ...monthlyRevenue.map(
      (month) => month.revenue
    ),
    1
  );

  const totalRevenue = monthlyRevenue.reduce(
    (total, month) =>
      total + month.revenue,
    0
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Verkoopanalyse
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Omzet uit voltooide transacties van
            actieve klanten in de afgelopen zes
            maanden.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right">
            <p className="text-xs text-slate-400">
              Totale omzet
            </p>

            <p className="font-bold text-slate-800">
              {formatCurrency(totalRevenue)}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadTransactions()
            }
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isLoading ? "animate-spin" : ""
              }`}
            />

            Vernieuwen
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-72 items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Verkoopgegevens worden geladen...
        </div>
      ) : error ? (
        <div className="flex h-72 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      ) : (
        <div className="relative flex h-72 items-end gap-4 overflow-hidden rounded-lg border border-slate-200 px-6 pb-5 pt-8">
          <div className="pointer-events-none absolute inset-x-6 bottom-16 top-8 flex flex-col justify-between">
            {[100, 75, 50, 25, 0].map(
              (percentage) => (
                <div
                  key={percentage}
                  className="border-b border-slate-100"
                />
              )
            )}
          </div>

          {monthlyRevenue.map((month) => {
            const heightPercentage =
              month.revenue > 0
                ? Math.max(
                    (month.revenue /
                      maximumRevenue) *
                      100,
                    4
                  )
                : 0;

            return (
              <div
                key={month.key}
                className="relative z-10 flex h-full min-w-0 flex-1 flex-col items-center justify-end"
              >
                <div className="flex w-full flex-1 items-end justify-center">
                  <div
                    title={`${month.label}: ${formatCurrency(
                      month.revenue
                    )}`}
                    style={{
                      height: `${heightPercentage}%`,
                    }}
                    className="w-full max-w-12 rounded-t-md bg-blue-600 transition-all hover:bg-blue-700"
                  />
                </div>

                <div className="mt-3 w-full text-center">
                  <p className="truncate text-xs font-medium text-slate-600">
                    {month.label}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-blue-600">
                    {formatCurrency(
                      month.revenue
                    )}
                  </p>
                </div>
              </div>
            );
          })}

          {totalRevenue === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-400">
              Geen verkoopgegevens beschikbaar.
            </div>
          )}
        </div>
      )}
    </div>
  );
}