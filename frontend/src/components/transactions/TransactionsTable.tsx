import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Loader2,
} from "lucide-react";

import { getTransactions } from "../../services/transactions.service";

import {
  type Transaction,
  type TransactionStatus,
  type TransactionCustomerStatus,
} from "../../types/transaction.types";

interface TransactionsTableProps {
  searchTerm?: string;
  limit?: number;
}

const statusLabels: Record<
  TransactionStatus,
  string
> = {
  PENDING: "In afwachting",
  COMPLETED: "Voltooid",
  FAILED: "Mislukt",
  REFUNDED: "Terugbetaald",
};

const customerStatusLabels: Record<
  TransactionCustomerStatus,
  string
> = {
  ACTIVE: "Actief",
  INACTIVE: "Inactief",
  SUSPENDED: "Geschorst",
};

function getStatusClasses(
  status: TransactionStatus,
): string {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700";

    case "PENDING":
      return "bg-amber-100 text-amber-700";

    case "FAILED":
      return "bg-red-100 text-red-700";

    case "REFUNDED":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getCustomerStatusClasses(
  status: TransactionCustomerStatus,
): string {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-700";

    case "INACTIVE":
      return "bg-slate-100 text-slate-600";

    case "SUSPENDED":
      return "bg-amber-100 text-amber-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function formatCurrency(
  amount: string,
  currency: string,
): string {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return `${currency} ${amount}`;
  }

  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

function formatDate(
  dateValue: string,
): string {
  const date = new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "nl-NL",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  ).format(date);
}

export default function TransactionsTable({
  searchTerm = "",
  limit = 5,
}: TransactionsTableProps) {
  const [
    transactions,
    setTransactions,
  ] = useState<Transaction[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      try {
        setIsLoading(true);
        setError(null);

        const data =
          await getTransactions();

        setTransactions(data);
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "De transacties konden niet worden geladen.";

        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    void loadTransactions();
  }, []);

  const visibleTransactions =
    useMemo(() => {
      const normalizedSearchTerm =
        searchTerm
          .trim()
          .toLowerCase();

      const filteredTransactions =
        normalizedSearchTerm.length ===
        0
          ? transactions
          : transactions.filter(
              (transaction) =>
                transaction.customer.name
                  .toLowerCase()
                  .includes(
                    normalizedSearchTerm,
                  ) ||
                transaction.customer.email
                  .toLowerCase()
                  .includes(
                    normalizedSearchTerm,
                  ) ||
                (
                  transaction.description ??
                  ""
                )
                  .toLowerCase()
                  .includes(
                    normalizedSearchTerm,
                  ),
            );

      return filteredTransactions.slice(
        0,
        limit,
      );
    }, [
      transactions,
      searchTerm,
      limit,
    ]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Recente transacties
          </h2>

          <p className="text-xs text-slate-400">
            De meest recente verkopen en betalingen op basis van de transactiedatum.
          </p>
        </div>

        <span className="text-xs text-slate-400">
          Live gegevens
        </span>
      </div>

      {isLoading ? (
        <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Transacties worden geladen...
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-6 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs text-slate-400">
                <th className="px-6 py-3 font-medium">
                  Klant
                </th>

                <th className="px-6 py-3 font-medium">
                  Bedrag
                </th>

                <th className="px-6 py-3 font-medium">
                  Transactiedatum
                </th>

                <th className="px-6 py-3 font-medium">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {visibleTransactions.length >
              0 ? (
                visibleTransactions.map(
                  (transaction) => (
                    <tr
                      key={
                        transaction.id
                      }
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-800">
                            {
                              transaction
                                .customer
                                .name
                            }
                          </span>

                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${getCustomerStatusClasses(
                              transaction
                                .customer
                                .status,
                            )}`}
                          >
                            (
                            {
                              customerStatusLabels[
                                transaction
                                  .customer
                                  .status
                              ]
                            }
                            )
                          </span>
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          {
                            transaction
                              .customer
                              .email
                          }
                        </div>

                        {transaction.customer
                          .isArchived && (
                          <div className="mt-1 text-xs font-medium text-red-500">
                            Gearchiveerde klant
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-700">
                        {formatCurrency(
                          transaction.amount,
                          transaction.currency,
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500">
                        {formatDate(
                          transaction.transactionDate,
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                            transaction.status,
                          )}`}
                        >
                          {
                            statusLabels[
                              transaction
                                .status
                            ]
                          }
                        </span>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-sm text-slate-400"
                  >
                    Geen transacties gevonden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}