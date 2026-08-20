import { useEffect, useMemo, useState } from "react";
import { getTransactions } from "../../services/transactions.service";
import type { Transaction } from "../../types/transaction.types";

type AnalysisType = "SALES" | "PAYMENTS";

interface MonthlyValue {
  label: string;
  value: number;
}

function getLastSixMonths(): {
  year: number;
  month: number;
  label: string;
}[] {
  const result: {
    year: number;
    month: number;
    label: string;
  }[] = [];

  const now = new Date();

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);

    result.push({
      year: date.getFullYear(),
      month: date.getMonth(),
      label: new Intl.DateTimeFormat("nl-NL", {
        month: "short",
      }).format(date),
    });
  }

  return result;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getAnalysisTitle(type: AnalysisType): string {
  switch (type) {
    case "SALES":
      return "Verkoopanalyse";
    case "PAYMENTS":
      return "Betalingsanalyse";
  }
}

function getAnalysisDescription(type: AnalysisType): string {
  switch (type) {
    case "SALES":
      return "Voltooide verkopen van de afgelopen zes maanden.";
    case "PAYMENTS":
      return "Ontvangen betalingen van de afgelopen zes maanden.";
  }
}

function getTotalLabel(type: AnalysisType): string {
  switch (type) {
    case "SALES":
      return "Totale verkoop";
    case "PAYMENTS":
      return "Totaal ontvangen";
  }
}

export default function AnalysisChart() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analysisType, setAnalysisType] = useState<AnalysisType>("SALES");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTransactions(): Promise<void> {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getTransactions();
      setTransactions(data);
    } catch (loadError) {
      console.error(
        "Fout bij het laden van analysegegevens:",
        loadError,
      );

      setError("De analysegegevens konden niet worden geladen.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadTransactions();
  }, []);

  const monthlyData = useMemo<MonthlyValue[]>(() => {
    const months = getLastSixMonths();

    return months.map((month) => {
      const value = transactions
        .filter((transaction) => {
          if (transaction.status !== "COMPLETED") {
            return false;
          }

          if (analysisType === "SALES" && transaction.type !== "SALE") {
            return false;
          }

          if (analysisType === "PAYMENTS" && transaction.type !== "PAYMENT") {
            return false;
          }

          const transactionDate = new Date(transaction.transactionDate);

          return (
            transactionDate.getUTCFullYear() === month.year &&
            transactionDate.getUTCMonth() === month.month
          );
        })
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

      return {
        label: month.label,
        value,
      };
    });
  }, [transactions, analysisType]);

  const maximumValue = Math.max(...monthlyData.map((item) => item.value), 1);

  const total = monthlyData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-900">
            {getAnalysisTitle(analysisType)}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {getAnalysisDescription(analysisType)}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={analysisType}
            onChange={(event) =>
              setAnalysisType(event.target.value as AnalysisType)
            }
            className="min-w-[180px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="SALES">Verkoopanalyse</option>
            <option value="PAYMENTS">Betalingsanalyse</option>
          </select>

          <button
            type="button"
            onClick={() => void loadTransactions()}
            disabled={isLoading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Vernieuwen
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-80 w-full items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-sm text-slate-500">
          Analysegegevens worden geladen...
        </div>
      ) : error ? (
        <div className="flex h-80 w-full items-center justify-center rounded-lg border border-red-200 bg-red-50 text-sm text-red-600">
          {error}
        </div>
      ) : (
        <div className="w-full">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {getTotalLabel(analysisType)}
              </p>

              <p
                className={`mt-1 text-3xl font-bold ${
                  analysisType === "PAYMENTS"
                    ? "text-emerald-700"
                    : "text-slate-900"
                }`}
              >
                {formatCurrency(total)}
              </p>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="relative rounded-xl border border-slate-200 bg-slate-50 px-4 py-6">
                <div className="absolute inset-x-4 top-6 bottom-14 flex flex-col justify-between pointer-events-none">
                  {[100, 75, 50, 25, 0].map((line) => (
                    <div
                      key={line}
                      className="border-t border-slate-200"
                    />
                  ))}
                </div>

                <div className="relative z-10 flex h-[320px] items-end gap-4">
                  {monthlyData.map((item) => {
                    const heightPercentage =
                      (item.value / maximumValue) * 100;

                    return (
                      <div
                        key={item.label}
                        className="flex h-full flex-1 flex-col justify-end"
                      >
                        <div className="mb-3 text-center text-xs font-medium text-slate-600">
                          {item.value > 0 ? formatCurrency(item.value) : "€0"}
                        </div>

                        <div className="flex h-[240px] items-end">
                          <div
                            className={`w-full rounded-t-md transition-all duration-300 ${
                              analysisType === "PAYMENTS"
                                ? "bg-emerald-500"
                                : "bg-blue-500"
                            }`}
                            style={{
                              height: `${Math.max(
                                heightPercentage,
                                item.value > 0 ? 6 : 0,
                              )}%`,
                            }}
                          />
                        </div>

                        <div className="mt-3 text-center text-sm font-medium capitalize text-slate-600">
                          {item.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}