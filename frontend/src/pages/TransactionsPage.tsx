import {
  Fragment,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Archive,
  ChevronDown,
  ChevronRight,
  Edit3,
  Eye,
  Loader2,
  MoreHorizontal,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";

import {
  createTransaction,
  getTransactions,
  updateTransaction,
} from "../services/transactions.service";

import {
  archiveCustomer,
  getArchivedCustomers,
  getCustomers,
  restoreCustomer,
  updateCustomer,
} from "../services/customers.service";

import {
  getCustomerBalances,
} from "../services/customer-balances.service";

import {
  getCustomerActivities,
} from "../services/customer-activities.service";

import type {
  Transaction,
  TransactionStatus,
  TransactionType,
} from "../types/transaction.types";

import type {
  Customer,
  CustomerStatus,
} from "../types/customer.types";

import type {
  CustomerBalance,
} from "../types/customer-balance.types";

import type {
  ActivityChange,
  CustomerActivity,
} from "../types/customer-activity.types";

interface TransactionFormState {
  customerId: string;
  type: TransactionType;
  amount: string;
  currency: string;
  status: TransactionStatus;
  description: string;
  transactionDate: string;
  changeNote: string;
}

interface CustomerFormState {
  name: string;
  email: string;
  company: string;
  status: CustomerStatus;
}

interface TransactionsPageProps {
  searchTerm?: string;
}

interface TimelineTransactionItem {
  kind: "TRANSACTION";
  id: string;
  date: string;
  transaction: Transaction;
}

interface TimelineActivityItem {
  kind: "ACTIVITY";
  id: string;
  date: string;
  activity: CustomerActivity;
}

type TimelineItem =
  | TimelineTransactionItem
  | TimelineActivityItem;

const emptyTransactionForm: TransactionFormState = {
  customerId: "",
  type: "SALE",
  amount: "",
  currency: "EUR",
  status: "COMPLETED",
  description: "",
  transactionDate: "",
  changeNote: "",
};

const emptyCustomerForm: CustomerFormState = {
  name: "",
  email: "",
  company: "",
  status: "ACTIVE",
};

function formatCurrency(
  value: string | number,
  currency = "EUR",
): string {
  const numericValue =
    typeof value === "string"
      ? Number.parseFloat(value)
      : value;

  if (!Number.isFinite(numericValue)) {
    return "-";
  }

  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency,
  }).format(numericValue);
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDateTime(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function toDateInputValue(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year =
    date.getUTCFullYear();

  const month = String(
    date.getUTCMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getUTCDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTransactionTypeLabel(
  type: TransactionType,
): string {
  return type === "SALE"
    ? "Verkoop"
    : "Betaling";
}

function getTransactionStatusLabel(
  status: TransactionStatus,
): string {
  switch (status) {
    case "COMPLETED":
      return "Voltooid";

    case "PENDING":
      return "In behandeling";

    case "FAILED":
      return "Mislukt";

    case "REFUNDED":
      return "Terugbetaald";
  }
}

function getCustomerStatusLabel(
  status: CustomerStatus,
): string {
  switch (status) {
    case "ACTIVE":
      return "Actief";

    case "INACTIVE":
      return "Inactief";

    case "SUSPENDED":
      return "Geschorst";
  }
}

function getCustomerStatusClasses(
  status: CustomerStatus,
): string {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-700";

    case "INACTIVE":
      return "bg-slate-100 text-slate-600";

    case "SUSPENDED":
      return "bg-amber-100 text-amber-700";
  }
}

function getOutstandingClasses(
  value: number,
): string {
  if (value > 0) {
    return "text-red-700";
  }

  if (value < 0) {
    return "text-emerald-700";
  }

  return "text-slate-700";
}

function formatFieldName(
  field: string,
): string {
  const labels: Record<
    string,
    string
  > = {
    type:
      "Type",

    amount:
      "Bedrag",

    currency:
      "Valuta",

    status:
      "Status",

    description:
      "Omschrijving",

    transactionDate:
      "Transactiedatum",

    customerId:
      "Klant",
  };

  return labels[field] ?? field;
}


function formatChangeValue(
  field: string,
  value: unknown,
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Leeg";
  }
  if (field === "amount") {
    const numericValue =
      Number(value);

    if (
      Number.isFinite(
        numericValue,
      )
    ) {
      return formatCurrency(
        numericValue,
        "EUR",
      );
    }
  }
  if (
    field ===
    "transactionDate"
  ) {
    return formatDate(
      String(value),
    );
  }

  if (field === "type") {
    if (value === "SALE") {
      return "Verkoop";
    }

    if (value === "PAYMENT") {
      return "Betaling";
    }
  }

  if (field === "status") {
    const statusLabels:
      Record<
        string,
        string
      > = {
      PENDING:
        "In behandeling",

      COMPLETED:
        "Voltooid",

      FAILED:
        "Mislukt",

      REFUNDED:
        "Terugbetaald",
    };

    return (
      statusLabels[
        String(value)
      ] ??
      String(value)
    );
  }

  return String(value);
}

function getActivityClasses(
  type: CustomerActivity["type"],
): string {
  switch (type) {
    case "TRANSACTION_CREATED":
      return "border-blue-200 bg-blue-50";

    case "TRANSACTION_UPDATED":
      return "border-amber-200 bg-amber-50";

    case "CUSTOMER_CREATED":
      return "border-emerald-200 bg-emerald-50";

    case "CUSTOMER_UPDATED":
      return "border-violet-200 bg-violet-50";

    case "CUSTOMER_ARCHIVED":
      return "border-red-200 bg-red-50";

    case "CUSTOMER_RESTORED":
      return "border-emerald-200 bg-emerald-50";
  }
}

function getActivityTitleClasses(
  type: CustomerActivity["type"],
): string {
  switch (type) {
    case "TRANSACTION_CREATED":
      return "text-blue-800";

    case "TRANSACTION_UPDATED":
      return "text-amber-800";

    case "CUSTOMER_CREATED":
      return "text-emerald-800";

    case "CUSTOMER_UPDATED":
      return "text-violet-800";

    case "CUSTOMER_ARCHIVED":
      return "text-red-800";

    case "CUSTOMER_RESTORED":
      return "text-emerald-800";
  }
}

function buildTimeline(
  customerTransactions: Transaction[],
  customerActivities: CustomerActivity[],
): TimelineItem[] {
  const transactionIdsWithCreatedActivity =
    new Set(
      customerActivities
        .filter(
          (activity) =>
            activity.type ===
              "TRANSACTION_CREATED" &&
            activity.transactionId !== null,
        )
        .map(
          (activity) =>
            activity.transactionId,
        ),
    );

  // Alleen oude transacties zonder TRANSACTION_CREATED-activity
  // worden als historische transactie toegevoegd.
  const legacyTransactions:
    TimelineTransactionItem[] =
    customerTransactions
      .filter(
        (transaction) =>
          !transactionIdsWithCreatedActivity.has(
            transaction.id,
          ),
      )
      .map(
        (transaction) => ({
          kind: "TRANSACTION",
          id: `transaction-${transaction.id}`,
          date:
            transaction.transactionDate,
          transaction,
        }),
      );

  // TRANSACTION_UPDATED wordt hier bewust niet toegevoegd.
  // Deze wijzigingen worden onder de bijbehorende transactie getoond.
  const activityItems:
    TimelineActivityItem[] =
    customerActivities
      .filter(
        (activity) =>
          activity.type !==
          "TRANSACTION_UPDATED",
      )
      .map(
        (activity) => ({
          kind: "ACTIVITY",
          id: `activity-${activity.id}`,
          date:
            activity.createdAt,
          activity,
        }),
      );

  return [
    ...legacyTransactions,
    ...activityItems,
  ].sort(
    (first, second) =>
      new Date(
        second.date,
      ).getTime() -
      new Date(
        first.date,
      ).getTime(),
  );
}

export default function TransactionsPage({
  searchTerm = "",
}: TransactionsPageProps) {
  
  const [
    transactions,
    setTransactions,
  ] = useState<Transaction[]>([]);

  const [
    activeCustomers,
    setActiveCustomers,
  ] = useState<Customer[]>([]);

  const [
    archivedCustomers,
    setArchivedCustomers,
  ] = useState<Customer[]>([]);

  const [
    balances,
    setBalances,
  ] = useState<CustomerBalance[]>([]);

  const [
    activitiesByCustomer,
    setActivitiesByCustomer,
  ] = useState<
    Record<number, CustomerActivity[]>
  >({});

  const [
    expandedCustomers,
    setExpandedCustomers,
  ] = useState<number[]>([]);

  const [
    openMenuCustomerId,
    setOpenMenuCustomerId,
  ] = useState<number | null>(
    null,
  );

  const [
    selectedCustomer,
    setSelectedCustomer,
  ] = useState<Customer | null>(
    null,
  );

  const [
    editingTransaction,
    setEditingTransaction,
  ] = useState<Transaction | null>(
    null,
  );

  const [
    transactionForm,
    setTransactionForm,
  ] =
    useState<TransactionFormState>(
      emptyTransactionForm,
    );

  const [
    customerForm,
    setCustomerForm,
  ] =
    useState<CustomerFormState>(
      emptyCustomerForm,
    );

  const [
    isTransactionModalOpen,
    setIsTransactionModalOpen,
  ] = useState(false);

  const [
    isCustomerDetailsOpen,
    setIsCustomerDetailsOpen,
  ] = useState(false);

  const [
    isCustomerEditOpen,
    setIsCustomerEditOpen,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const allCustomers =
    useMemo(
      () => [
        ...activeCustomers,
        ...archivedCustomers,
      ],
      [
        activeCustomers,
        archivedCustomers,
      ],
    );

  const customerRows =
    useMemo(() => {
      return balances.map(
        (balance) => {
          const customer =
            allCustomers.find(
              (item) =>
                item.id ===
                balance.customerId,
            );

          const customerTransactions =
            transactions.filter(
              (transaction) =>
                transaction.customerId ===
                balance.customerId,
            );

          const customerActivities =
            activitiesByCustomer[
              balance.customerId
            ] ?? [];

          return {
            balance,
            customer,
            transactions:
              customerTransactions,
            activities:
              customerActivities,
          };
        },
      );
    }, [
      balances,
      transactions,
      allCustomers,
      activitiesByCustomer,
    ]);



  const filteredCustomerRows =
    useMemo(() => {
      const normalizedSearchTerm =
        searchTerm
          .trim()
          .toLowerCase();

      if (!normalizedSearchTerm) {
        return customerRows;
      }

      return customerRows.filter(
        ({ customer, balance }) => {
          if (!customer) {
            return false;
          }

          const searchableText = [
            customer.name,
            customer.email,
            customer.company ?? "",
            String(customer.id),
            balance.customerName,
            balance.customerEmail,
          ]
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            normalizedSearchTerm,
          );
        },
      );
    }, [
      customerRows,
      searchTerm,
    ]);


  async function loadData(): Promise<void> {
    try {
      setIsLoading(true);
      setError(null);

      const [
        transactionData,
        activeCustomerData,
        archivedCustomerData,
        balanceData,
      ] = await Promise.all([
        getTransactions(),
        getCustomers(),
        getArchivedCustomers(),
        getCustomerBalances(),
      ]);

      const allLoadedCustomers = [
        ...activeCustomerData,
        ...archivedCustomerData,
      ];

      const activityResults =
        await Promise.all(
          allLoadedCustomers.map(
            async (customer) => {
              const activities =
                await getCustomerActivities(
                  customer.id,
                );

              return [
                customer.id,
                activities,
              ] as const;
            },
          ),
        );

      const activityMap:
        Record<
          number,
          CustomerActivity[]
        > = {};

      for (
        const [
          customerId,
          activities,
        ] of activityResults
      ) {
        activityMap[
          customerId
        ] = activities;
      }

      setTransactions(
        transactionData,
      );

      setActiveCustomers(
        activeCustomerData,
      );

      setArchivedCustomers(
        archivedCustomerData,
      );

      setBalances(
        balanceData,
      );

      setActivitiesByCustomer(
        activityMap,
      );
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "De gegevens konden niet worden geladen.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function toggleCustomer(
    customerId: number,
  ): void {
    setExpandedCustomers(
      (current) =>
        current.includes(
          customerId,
        )
          ? current.filter(
              (id) =>
                id !== customerId,
            )
          : [
              ...current,
              customerId,
            ],
    );

    setOpenMenuCustomerId(
      null,
    );
  }

  function openTransactionModal(
    customerId?: number,
    type: TransactionType = "SALE",
  ): void {
    setEditingTransaction(
      null,
    );

    setTransactionForm({
      ...emptyTransactionForm,

      customerId:
        customerId !== undefined
          ? String(customerId)
          : "",

      type,

      transactionDate:
        new Date()
          .toISOString()
          .slice(0, 10),
    });

    setOpenMenuCustomerId(
      null,
    );

    setError(null);

    setIsTransactionModalOpen(
      true,
    );
  }

  function openTransactionEdit(
    transaction: Transaction,
  ): void {
    setEditingTransaction(
      transaction,
    );

    setTransactionForm({
      customerId:
        String(
          transaction.customerId,
        ),

      type:
        transaction.type,

      amount:
        transaction.amount,

      currency:
        transaction.currency,

      status:
        transaction.status,

      description:
        transaction.description ??
        "",

      transactionDate:
        toDateInputValue(
          transaction.transactionDate,
        ),
      changeNote: "",
    });

    setError(null);

    setIsTransactionModalOpen(
      true,
    );
  }

  function closeTransactionModal(): void {
    if (isSaving) {
      return;
    }

    setIsTransactionModalOpen(
      false,
    );

    setEditingTransaction(
      null,
    );

    setTransactionForm(
      emptyTransactionForm,
    );

    setError(null);
  }

  async function handleTransactionSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const amount =
      Number(
        transactionForm.amount,
      );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setError(
        "Voer een geldig bedrag groter dan nul in.",
      );
      return;
    }

    if (
      !transactionForm.transactionDate
    ) {
      setError(
        "Selecteer een transactiedatum.",
      );
      return;
    }

    if (
      !editingTransaction &&
      !transactionForm.customerId
    ) {
      setError(
        "Selecteer een klant.",
      );
      return;
    }

    if (
      editingTransaction &&
      editingTransaction.type !==
        transactionForm.type
    ) {
      const confirmed =
        window.confirm(
          "Weet u zeker dat u het transactietype wilt wijzigen? Dit beïnvloedt de verkoop, ontvangen betalingen en het openstaande saldo.",
        );

      if (!confirmed) {
        return;
      }
    }

    try {
      setIsSaving(true);
      setError(null);

      const transactionDate =
        new Date(
          `${transactionForm.transactionDate}T12:00:00.000Z`,
        ).toISOString();

      if (editingTransaction) {
        await updateTransaction(
          editingTransaction.id,
          {
            type:
              transactionForm.type,

            amount,

            currency:
              transactionForm.currency,

            status:
              transactionForm.status,

            description:
              transactionForm.description
                .trim() ||
              null,

            transactionDate,

            changeNote:
              transactionForm.changeNote
                .trim(),
          },
        );
      } else {
        await createTransaction({
          customerId:
            Number(
              transactionForm.customerId,
            ),

          type:
            transactionForm.type,

          amount,

          currency:
            transactionForm.currency,

          status:
            transactionForm.status,

          description:
            transactionForm.description
              .trim() ||
            null,

          transactionDate,
        });
      }

      setIsTransactionModalOpen(
        false,
      );

      setEditingTransaction(
        null,
      );

      setTransactionForm(
        emptyTransactionForm,
      );

      await loadData();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "De transactie kon niet worden opgeslagen.";

      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  function openCustomerDetails(
    customer: Customer,
  ): void {
    setSelectedCustomer(
      customer,
    );

    setOpenMenuCustomerId(
      null,
    );

    setIsCustomerDetailsOpen(
      true,
    );
  }

  function openCustomerEdit(
    customer: Customer,
  ): void {
    setSelectedCustomer(
      customer,
    );

    setCustomerForm({
      name:
        customer.name,

      email:
        customer.email,

      company:
        customer.company ?? "",

      status:
        customer.status,
    });

    setOpenMenuCustomerId(
      null,
    );

    setError(null);

    setIsCustomerEditOpen(
      true,
    );
  }

  async function handleCustomerSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!selectedCustomer) {
      return;
    }

    const name =
      customerForm.name.trim();

    const email =
      customerForm.email
        .trim()
        .toLowerCase();

    if (name.length < 2) {
      setError(
        "De klantnaam moet minimaal twee tekens bevatten.",
      );
      return;
    }

    if (!email) {
      setError(
        "Vul een geldig e-mailadres in.",
      );
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await updateCustomer(
        selectedCustomer.id,
        {
          name,
          email,

          company:
            customerForm.company
              .trim() ||
            null,

          status:
            customerForm.status,
        },
      );

      setIsCustomerEditOpen(
        false,
      );

      setSelectedCustomer(
        null,
      );

      await loadData();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "De klant kon niet worden opgeslagen.";

      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleArchive(
    customer: Customer,
  ): Promise<void> {
    const confirmed =
      window.confirm(
        `Weet u zeker dat u ${customer.name} wilt archiveren?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setOpenMenuCustomerId(
        null,
      );

      await archiveCustomer(
        customer.id,
      );

      await loadData();
    } catch (archiveError) {
      const message =
        archiveError instanceof Error
          ? archiveError.message
          : "De klant kon niet worden gearchiveerd.";

      setError(message);
    }
  }

  async function handleRestore(
    customer: Customer,
  ): Promise<void> {
    const confirmed =
      window.confirm(
        `Weet u zeker dat u ${customer.name} wilt herstellen?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setOpenMenuCustomerId(
        null,
      );

      await restoreCustomer(
        customer.id,
      );

      await loadData();
    } catch (restoreError) {
      const message =
        restoreError instanceof Error
          ? restoreError.message
          : "De klant kon niet worden hersteld.";

      setError(message);
    }
  }

  const selectedBalance =
    selectedCustomer
      ? balances.find(
          (balance) =>
            balance.customerId ===
            selectedCustomer.id,
        )
      : undefined;

  const selectedTransactions =
    selectedCustomer
      ? transactions.filter(
          (transaction) =>
            transaction.customerId ===
            selectedCustomer.id,
        )
      : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Transacties
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Beheer financiële gegevens en de volledige klantgeschiedenis.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              void loadData()
            }
            disabled={isLoading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            Vernieuwen
          </button>

          <button
            type="button"
            onClick={() =>
              openTransactionModal()
            }
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nieuwe transactie
          </button>
        </div>
      </div>

      {error &&
        !isTransactionModalOpen &&
        !isCustomerEditOpen && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

      <div className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Gegevens en geschiedenis worden geladen...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">
                    Klant
                  </th>

                  <th className="px-5 py-4">
                    Totale verkoop
                  </th>

                  <th className="px-5 py-4">
                    Betaald
                  </th>

                  <th className="px-5 py-4">
                    Openstaand
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right">
                    Beheer
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomerRows.map(
                  ({
                    balance,
                    customer,
                    transactions:
                      customerTransactions,
                    activities:
                      customerActivities,
                  }) => {
                    if (!customer) {
                      return null;
                    }

                    const expanded =
                      expandedCustomers.includes(
                        customer.id,
                      );

                    const timeline =
                      buildTimeline(
                        customerTransactions,
                        customerActivities,
                      );


                    const transactionCount =
                      customerTransactions.length;

                    const changeCount =
                      customerActivities.filter(
                        (activity) =>
                          activity.type ===
                            "TRANSACTION_UPDATED" ||
                          activity.type ===
                            "CUSTOMER_UPDATED" ||
                          activity.type ===
                            "CUSTOMER_ARCHIVED" ||
                          activity.type ===
                            "CUSTOMER_RESTORED",
                      ).length;







                    return (
                      <Fragment
                        key={
                          customer.id
                        }
                      >
                        <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() =>
                                toggleCustomer(
                                  customer.id,
                                )
                              }
                              className="flex items-start gap-3 text-left"
                            >
                              <div className="mt-1 text-slate-400">
                                {expanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </div>

                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-semibold text-slate-900">
                                    {
                                      customer.name
                                    }
                                  </span>

                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getCustomerStatusClasses(
                                      customer.status,
                                    )}`}
                                  >
                                    (
                                    {getCustomerStatusLabel(
                                      customer.status,
                                    )}
                                    )
                                  </span>

                                  {customer.isArchived && (
                                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                                      Gearchiveerd
                                    </span>
                                  )}
                                </div>

                                <div className="mt-1 text-xs text-slate-400">
                                  {
                                    customer.email
                                  }
                                </div>

                                {customer.company && (
                                  <div className="mt-0.5 text-xs text-slate-500">
                                    {
                                      customer.company
                                    }
                                  </div>
                                )}

                                <div className="mt-2 flex flex-wrap items-center gap-1 text-xs font-medium text-blue-600">
                                  <span>
                                    {transactionCount}{" "}
                                    {transactionCount === 1
                                      ? "transactie"
                                      : "transacties"}
                                  </span>

                                  <span className="text-slate-300">
                                    ·
                                  </span>

                                  <span>
                                    {changeCount}{" "}
                                    {changeCount === 1
                                      ? "wijziging"
                                      : "wijzigingen"}
                                  </span>
                                </div>
                              </div>
                            </button>
                          </td>

                          <td className="px-5 py-4 font-semibold text-slate-900">
                            {formatCurrency(
                              balance.totalSales,
                              balance.currency,
                            )}
                          </td>

                          <td className="px-5 py-4 font-semibold text-emerald-700">
                            {formatCurrency(
                              balance.totalPaid,
                              balance.currency,
                            )}
                          </td>

                          <td
                            className={`px-5 py-4 font-bold ${getOutstandingClasses(
                              balance.outstanding,
                            )}`}
                          >
                            {formatCurrency(
                              balance.outstanding,
                              balance.currency,
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${getCustomerStatusClasses(
                                customer.status,
                              )}`}
                            >
                              {getCustomerStatusLabel(
                                customer.status,
                              )}
                            </span>
                          </td>

                          <td className="relative px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuCustomerId(
                                  openMenuCustomerId ===
                                    customer.id
                                    ? null
                                    : customer.id,
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              Beheer
                            </button>

                            {openMenuCustomerId ===
                              customer.id && (
                              <div className="absolute right-5 top-14 z-40 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-xl">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openCustomerDetails(
                                      customer,
                                    )
                                  }
                                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <Eye className="h-4 w-4" />
                                  Klantgegevens
                                </button>

                                {!customer.isArchived && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openCustomerEdit(
                                          customer,
                                        )
                                      }
                                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                                    >
                                      <Edit3 className="h-4 w-4" />
                                      Klant bewerken
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        openTransactionModal(
                                          customer.id,
                                          "SALE",
                                        )
                                      }
                                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                                    >
                                      <Plus className="h-4 w-4" />
                                      Nieuwe verkoop
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        openTransactionModal(
                                          customer.id,
                                          "PAYMENT",
                                        )
                                      }
                                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                                    >
                                      <Plus className="h-4 w-4" />
                                      Nieuwe betaling
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handleArchive(
                                          customer,
                                        )
                                      }
                                      className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                                    >
                                      <Archive className="h-4 w-4" />
                                      Archiveren
                                    </button>
                                  </>
                                )}

                                {customer.isArchived && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleRestore(
                                        customer,
                                      )
                                    }
                                    className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-sm text-blue-600 hover:bg-blue-50"
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                    Herstellen
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>

                        {expanded && (
                          <tr className="border-b border-slate-200 bg-slate-50/70">
                            <td
                              colSpan={6}
                              className="px-8 py-6"
                            >
                              <div className="ml-5">
                                <div className="mb-4 flex items-center justify-between">
                                  <div>
                                    <h3 className="font-semibold text-slate-900">
                                      Activiteit van{" "}
                                      {
                                        customer.name
                                      }
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                      Transacties en wijzigingen in één chronologische geschiedenis.
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span>
                                      {transactionCount}{" "}
                                      {transactionCount === 1
                                        ? "transactie"
                                        : "transacties"}
                                    </span>

                                    <span>·</span>

                                    <span>
                                      {changeCount}{" "}
                                      {changeCount === 1
                                        ? "wijziging"
                                        : "wijzigingen"}
                                    </span>
                                  </div>
                                </div>

                                {timeline.length ===
                                0 ? (
                                  <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
                                    Nog geen activiteiten gevonden.
                                  </div>
                                ) : (
                                  <div className="relative space-y-3 border-l-2 border-slate-200 pl-6">
                                    {timeline.map(
                                      (item) => {



                                        if (item.kind === "TRANSACTION" ) {
                                          const { transaction } = item;
                                          const transactionUpdates =
                                            customerActivities
                                              .filter(
                                                (activity) =>
                                                  activity.type ===
                                                    "TRANSACTION_UPDATED" &&
                                                  activity.transactionId ===
                                                    transaction.id,
                                              )
                                              .sort(
                                                (first, second) =>
                                                  new Date(
                                                    second.createdAt,
                                                  ).getTime() -
                                                  new Date(
                                                    first.createdAt,
                                                  ).getTime(),
                                              );



                                          return (
                                            <div
                                              key={
                                                item.id
                                              }
                                              className="relative"
                                            >
                                              <div className="absolute -left-[31px] top-5 h-3 w-3 rounded-full border-2 border-white bg-slate-400" />

                                              <div className="rounded-xl border border-slate-200 bg-white p-4">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                  <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                      <span
                                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                          transaction.type ===
                                                          "SALE"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : "bg-emerald-100 text-emerald-700"
                                                        }`}
                                                      >
                                                        {getTransactionTypeLabel(
                                                          transaction.type,
                                                        )}
                                                      </span>

                                                      <span className="text-xs text-slate-400">
                                                        Historische transactie
                                                      </span>
                                                    </div>

                                                    <p
                                                      className={`mt-2 text-base font-bold ${
                                                        transaction.type ===
                                                        "PAYMENT"
                                                          ? "text-emerald-700"
                                                          : "text-slate-900"
                                                      }`}
                                                    >
                                                      {transaction.type ===
                                                      "PAYMENT"
                                                        ? "- "
                                                        : ""}

                                                      {formatCurrency(
                                                        transaction.amount,
                                                        transaction.currency,
                                                      )}
                                                    </p>

                                                    {transaction.description && (
                                                      <p className="mt-1 text-sm text-slate-600">
                                                        {
                                                          transaction.description
                                                        }
                                                      </p>
                                                    )}

                                                    <p className="mt-2 text-xs text-slate-400">
                                                      {getTransactionStatusLabel(
                                                        transaction.status,
                                                      )}
                                                    </p>

                                                  {transactionUpdates.length > 0 && (
                                                    <div className="mt-4 border-t border-slate-200 pt-4">
                                                      <div className="mb-3 flex items-center justify-between">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                          Wijzigingsgeschiedenis
                                                        </p>

                                                        <span className="text-xs text-slate-400">
                                                          {transactionUpdates.length} wijzigingen
                                                        </span>
                                                      </div>

                                                      <div className="space-y-3">
                                                        {transactionUpdates.map(
                                                          (update) => {
                                                            const updateChanges =
                                                              update.metadata?.changes ??
                                                              {};

                                                            return (
                                                              <div
                                                                key={update.id}
                                                                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                                                              >
                                                                <span className="text-xs font-medium text-slate-500">
                                                                  {formatDateTime(
                                                                    update.createdAt,
                                                                  )}
                                                                </span>

                                                                <div className="mt-3 space-y-2">
                                                                  {Object.entries(
                                                                    updateChanges,
                                                                  ).map(
                                                                    ([
                                                                      field,
                                                                      change,
                                                                    ]) => {
                                                                      const typedChange =
                                                                        change as ActivityChange;

                                                                      return (
                                                                        <div
                                                                          key={field}
                                                                          className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                                                                        >
                                                                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                            {formatFieldName(
                                                                              field,
                                                                            )}
                                                                          </p>

                                                                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                                                                            <span className="text-slate-400 line-through">
                                                                              {formatChangeValue(
                                                                                field,
                                                                                typedChange.from,
                                                                              )}
                                                                            </span>

                                                                            <span className="text-slate-300">
                                                                              →
                                                                            </span>

                                                                            <span className="font-semibold text-slate-900">
                                                                              {formatChangeValue(
                                                                                field,
                                                                                typedChange.to,
                                                                              )}
                                                                            </span>
                                                                          </div>
                                                                        </div>
                                                                      );
                                                                    },
                                                                  )}
                                                                </div>

                                                                {update.description && (
                                                                  <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5">
                                                                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                                                                      Wijzigingsnotitie
                                                                    </p>

                                                                    <p className="mt-1 text-sm leading-5 text-slate-700">
                                                                      {
                                                                        update.description
                                                                      }
                                                                    </p>
                                                                  </div>
                                                                )}
                                                              </div>
                                                            );
                                                          },
                                                        )}
                                                      </div>
                                                    </div>
                                                  )}




                                                  </div>

                                                  <div className="flex items-center gap-4">
                                                    <span className="text-xs text-slate-500">
                                                      {formatDate(
                                                        transaction.transactionDate,
                                                      )}
                                                    </span>

                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        openTransactionEdit(
                                                          transaction,
                                                        )
                                                      }
                                                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                                    >
                                                      Bewerken
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        }

                                        const {
                                          activity,
                                        } = item;

                                        
                                        const linkedTransaction =
                                          activity.transactionId !== null
                                            ? customerTransactions.find(
                                                (transaction) =>
                                                  transaction.id ===
                                                  activity.transactionId,
                                              )
                                            : undefined;
                                        

                                        const transactionUpdates =
                                          activity.transactionId !== null
                                            ? customerActivities
                                                .filter(
                                                  (candidate) =>
                                                    candidate.type ===
                                                      "TRANSACTION_UPDATED" &&
                                                    candidate.transactionId ===
                                                      activity.transactionId,
                                                )
                                                .sort(
                                                  (first, second) =>
                                                    new Date(
                                                      second.createdAt,
                                                    ).getTime() -
                                                    new Date(
                                                      first.createdAt,
                                                    ).getTime(),
                                                )
                                            : [];





                                        const changes =
                                          activity.metadata
                                            ?.changes ??
                                          {};

                                        const changeEntries =
                                          Object.entries(
                                            changes,
                                          );

                                        return (
                                          <div
                                            key={
                                              item.id
                                            }
                                            className="relative"
                                          >
                                            <div
                                              className={`absolute -left-[31px] top-5 h-3 w-3 rounded-full border-2 border-white ${
                                                activity.type ===
                                                "CUSTOMER_ARCHIVED"
                                                  ? "bg-red-500"
                                                  : activity.type ===
                                                      "TRANSACTION_UPDATED"
                                                    ? "bg-amber-500"
                                                    : activity.type ===
                                                        "CUSTOMER_UPDATED"
                                                      ? "bg-violet-500"
                                                      : "bg-emerald-500"
                                              }`}
                                            />

                                            <div
                                              className={`rounded-xl border p-4 ${getActivityClasses(
                                                activity.type,
                                              )}`}
                                            >
                                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                  <h4
                                                    className={`font-semibold ${getActivityTitleClasses(
                                                      activity.type,
                                                    )}`}
                                                  >
                                                    {
                                                      activity.title
                                                    }
                                                  </h4>

                                                  {activity.type ===
                                                    "TRANSACTION_CREATED" &&
                                                    activity.transaction && (
                                                      <div className="mt-2">
                                                        <p className="text-base font-bold text-slate-900">
                                                          {formatCurrency(
                                                            activity.transaction.amount,
                                                            activity.transaction.currency,
                                                          )}
                                                        </p>

                                                        {activity.transaction.description && (
                                                          <p className="mt-1 text-sm text-slate-600">
                                                            {activity.transaction.description}
                                                          </p>
                                                        )}

                                                        {transactionUpdates.length > 0 && (
                                                          <div className="mt-4 border-t border-blue-200 pt-4">
                                                            <div className="mb-3 flex items-center justify-between">
                                                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                                Wijzigingsgeschiedenis
                                                              </p>

                                                              <span className="text-xs text-slate-400">
                                                                {transactionUpdates.length} wijzigingen
                                                              </span>
                                                            </div>

                                                            <div className="space-y-3">
                                                              {transactionUpdates.map(
                                                                (update) => {
                                                                  const updateChanges =
                                                                    update.metadata
                                                                      ?.changes ?? {};

                                                                  return (
                                                                    <div
                                                                      key={update.id}
                                                                      className="rounded-lg border border-slate-200 bg-white p-3"
                                                                    >
                                                                      <div className="flex items-center justify-between gap-3">
                                                                        <span className="text-xs font-medium text-slate-500">
                                                                          {formatDateTime(
                                                                            update.createdAt,
                                                                          )}
                                                                        </span>
                                                                      </div>

                                                                      <div className="mt-2 space-y-1.5">
                                                                        {Object.entries(
                                                                          updateChanges,
                                                                        ).map(
                                                                          ([
                                                                            field,
                                                                            change,
                                                                          ]) => {
                                                                            const typedChange =
                                                                              change as ActivityChange;

                                                                            return (
                                                                              <div
                                                                                key={field}
                                                                                className="text-sm"
                                                                              >
                                                                                <span className="font-medium text-slate-700">
                                                                                  {formatFieldName(
                                                                                    field,
                                                                                  )}
                                                                                  :
                                                                                </span>{" "}

                                                                                <span className="text-slate-400 line-through">
                                                                                  {formatChangeValue(
                                                                                    field,
                                                                                    typedChange.from,
                                                                                  )}
                                                                                </span>

                                                                                {" → "}

                                                                                <span className="font-semibold text-slate-900">
                                                                                  {formatChangeValue(
                                                                                    field,
                                                                                    typedChange.to,
                                                                                  )}
                                                                                </span>
                                                                              </div>
                                                                            );
                                                                          },
                                                                        )}
                                                                      </div>

                                                                      {update.description && (
                                                                        <div className="mt-3 rounded-md bg-slate-50 px-3 py-2">
                                                                          <p className="text-xs font-semibold text-slate-500">
                                                                            Notitie
                                                                          </p>

                                                                          <p className="mt-1 text-sm text-slate-700">
                                                                            {update.description}
                                                                          </p>
                                                                        </div>
                                                                      )}
                                                                    </div>
                                                                  );
                                                                },
                                                              )}
                                                            </div>
                                                          </div>
                                                        )}
                                                      </div>
                                                    )}

                                                  {changeEntries.length >
                                                    0 && (
                                                    <div className="mt-3 space-y-2">
                                                      {changeEntries.map(
                                                        ([
                                                          field,
                                                          change,
                                                        ]) => {
                                                          const typedChange =
                                                            change as ActivityChange;

                                                          return (
                                                            <div
                                                              key={
                                                                field
                                                              }
                                                              className="rounded-lg bg-white/70 px-3 py-2 text-sm"
                                                            >
                                                              <span className="font-medium text-slate-700">
                                                                {formatFieldName(
                                                                  field,
                                                                )}
                                                                :
                                                              </span>{" "}
                                                              <span className="text-slate-500 line-through">
                                                                {formatChangeValue(
                                                                  field,
                                                                  typedChange.from,
                                                                )}
                                                              </span>
                                                              {" → "}
                                                              <span className="font-medium text-slate-900">
                                                                {formatChangeValue(
                                                                  field,
                                                                  typedChange.to,
                                                                )}
                                                              </span>
                                                            </div>
                                                          );
                                                        },
                                                      )}
                                                    </div>
                                                  )}

                                                  {changeEntries.length ===
                                                    0 &&
                                                    activity.description &&
                                                    activity.type !==
                                                      "TRANSACTION_CREATED" && (
                                                      <p className="mt-1 text-sm text-slate-600">
                                                        {
                                                          activity.description
                                                        }
                                                      </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4">
                                                  <span className="whitespace-nowrap text-xs text-slate-500">
                                                    {formatDateTime(
                                                      activity.createdAt,
                                                    )}
                                                  </span>

                                                  {linkedTransaction && (
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        openTransactionEdit(
                                                          linkedTransaction,
                                                        )
                                                      }
                                                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                                    >
                                                      Bewerken
                                                    </button>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      },
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCustomerDetailsOpen &&
        selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {
                      selectedCustomer.name
                    }
                  </h2>

                  <p className="text-sm text-slate-500">
                    Klantgegevens
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setIsCustomerDetailsOpen(
                      false,
                    )
                  }
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-5 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      E-mailadres
                    </p>

                    <p className="mt-1 text-sm text-slate-800">
                      {
                        selectedCustomer.email
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Bedrijf
                    </p>

                    <p className="mt-1 text-sm text-slate-800">
                      {selectedCustomer.company ||
                        "Geen bedrijf"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Status
                    </p>

                    <span
                      className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getCustomerStatusClasses(
                        selectedCustomer.status,
                      )}`}
                    >
                      {getCustomerStatusLabel(
                        selectedCustomer.status,
                      )}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Aangemaakt
                    </p>

                    <p className="mt-1 text-sm text-slate-800">
                      {formatDate(
                        selectedCustomer.createdAt,
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Totale verkoop
                    </p>

                    <p className="mt-1 font-bold">
                      {formatCurrency(
                        selectedBalance
                          ?.totalSales ??
                          0,
                        selectedBalance
                          ?.currency ??
                          "EUR",
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Betaald
                    </p>

                    <p className="mt-1 font-bold text-emerald-700">
                      {formatCurrency(
                        selectedBalance
                          ?.totalPaid ??
                          0,
                        selectedBalance
                          ?.currency ??
                          "EUR",
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Openstaand
                    </p>

                    <p
                      className={`mt-1 font-bold ${getOutstandingClasses(
                        selectedBalance
                          ?.outstanding ??
                          0,
                      )}`}
                    >
                      {formatCurrency(
                        selectedBalance
                          ?.outstanding ??
                          0,
                        selectedBalance
                          ?.currency ??
                          "EUR",
                      )}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-500">
                  Aantal transacties:{" "}
                  <strong>
                    {
                      selectedTransactions.length
                    }
                  </strong>
                </p>
              </div>
            </div>
          </div>
        )}

      {isCustomerEditOpen &&
        selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  Klant bewerken
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setIsCustomerEditOpen(
                      false,
                    )
                  }
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <form
                onSubmit={
                  handleCustomerSubmit
                }
                className="space-y-4"
              >
                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Naam
                  </label>

                  <input
                    value={
                      customerForm.name
                    }
                    onChange={(event) =>
                      setCustomerForm(
                        (current) => ({
                          ...current,
                          name:
                            event.target.value,
                        }),
                      )
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    E-mailadres
                  </label>

                  <input
                    type="email"
                    value={
                      customerForm.email
                    }
                    onChange={(event) =>
                      setCustomerForm(
                        (current) => ({
                          ...current,
                          email:
                            event.target.value,
                        }),
                      )
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Bedrijf
                  </label>

                  <input
                    value={
                      customerForm.company
                    }
                    onChange={(event) =>
                      setCustomerForm(
                        (current) => ({
                          ...current,
                          company:
                            event.target.value,
                        }),
                      )
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Status
                  </label>

                  <select
                    value={
                      customerForm.status
                    }
                    onChange={(event) =>
                      setCustomerForm(
                        (current) => ({
                          ...current,
                          status:
                            event.target
                              .value as CustomerStatus,
                        }),
                      )
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <option value="ACTIVE">
                      Actief
                    </option>

                    <option value="INACTIVE">
                      Inactief
                    </option>

                    <option value="SUSPENDED">
                      Geschorst
                    </option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() =>
                      setIsCustomerEditOpen(
                        false,
                      )
                    }
                    className="rounded-lg px-4 py-2 text-sm text-slate-600"
                  >
                    Annuleren
                  </button>

                  <button
                    type="submit"
                    disabled={
                      isSaving
                    }
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {isSaving
                      ? "Opslaan..."
                      : "Opslaan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {isTransactionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingTransaction
                  ? "Transactie bewerken"
                  : "Nieuwe transactie"}
              </h2>

              <button
                type="button"
                onClick={
                  closeTransactionModal
                }
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form
              onSubmit={
                handleTransactionSubmit
              }
            >
              <div className="space-y-4 p-6">
                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Klant
                  </label>

                  {editingTransaction ? (
                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      {
                        editingTransaction
                          .customer.name
                      }
                    </div>
                  ) : (
                    <select
                      value={
                        transactionForm.customerId
                      }
                      onChange={(event) =>
                        setTransactionForm(
                          (current) => ({
                            ...current,
                            customerId:
                              event.target.value,
                          }),
                        )
                      }
                      required
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    >
                      <option value="">
                        Selecteer klant
                      </option>

                      {activeCustomers.map(
                        (
                          customer,
                        ) => (
                          <option
                            key={
                              customer.id
                            }
                            value={
                              customer.id
                            }
                          >
                            {
                              customer.name
                            }
                          </option>
                        ),
                      )}
                    </select>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Type transactie
                  </label>

                  <select
                    value={
                      transactionForm.type
                    }
                    onChange={(event) =>
                      setTransactionForm(
                        (current) => ({
                          ...current,
                          type:
                            event.target
                              .value as TransactionType,
                        }),
                      )
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <option value="SALE">
                      Verkoop
                    </option>

                    <option value="PAYMENT">
                      Betaling
                    </option>
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Bedrag
                    </label>

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={
                        transactionForm.amount
                      }
                      onChange={(event) =>
                        setTransactionForm(
                          (current) => ({
                            ...current,
                            amount:
                              event.target.value,
                          }),
                        )
                      }
                      required
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Valuta
                    </label>

                    <select
                      value={
                        transactionForm.currency
                      }
                      onChange={(event) =>
                        setTransactionForm(
                          (current) => ({
                            ...current,
                            currency:
                              event.target.value,
                          }),
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    >
                      <option value="EUR">
                        EUR
                      </option>
                      <option value="USD">
                        USD
                      </option>
                      <option value="GBP">
                        GBP
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Status
                    </label>

                    <select
                      value={
                        transactionForm.status
                      }
                      onChange={(event) =>
                        setTransactionForm(
                          (current) => ({
                            ...current,
                            status:
                              event.target
                                .value as TransactionStatus,
                          }),
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    >
                      <option value="COMPLETED">
                        Voltooid
                      </option>

                      <option value="PENDING">
                        In behandeling
                      </option>

                      <option value="FAILED">
                        Mislukt
                      </option>

                      <option value="REFUNDED">
                        Terugbetaald
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Transactiedatum
                    </label>

                    <input
                      type="date"
                      value={
                        transactionForm.transactionDate
                      }
                      onChange={(event) =>
                        setTransactionForm(
                          (current) => ({
                            ...current,
                            transactionDate:
                              event.target.value,
                          }),
                        )
                      }
                      required
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Omschrijving
                  </label>




            {editingTransaction && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Wijzigingsnotitie
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <textarea
                  rows={3}
                  value={
                    transactionForm.changeNote
                  }
                  onChange={(event) =>
                    setTransactionForm(
                      (current) => ({
                        ...current,

                        changeNote:
                          event.target.value,
                      }),
                    )
                  }
                  required
                  minLength={3}
                  placeholder="Waarom wordt deze transactie gewijzigd?"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Deze notitie wordt opgeslagen in de wijzigingsgeschiedenis.
                </p>
              </div>
            )}








                  <textarea
                    rows={3}
                    value={
                      transactionForm.description
                    }
                    onChange={(event) =>
                      setTransactionForm(
                        (current) => ({
                          ...current,
                          description:
                            event.target.value,
                        }),
                      )
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  onClick={
                    closeTransactionModal
                  }
                  disabled={
                    isSaving
                  }
                  className="rounded-lg px-4 py-2 text-sm text-slate-600 disabled:opacity-60"
                >
                  Annuleren
                </button>

                <button
                  type="submit"
                  disabled={
                    isSaving
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {isSaving
                    ? "Opslaan..."
                    : "Opslaan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}