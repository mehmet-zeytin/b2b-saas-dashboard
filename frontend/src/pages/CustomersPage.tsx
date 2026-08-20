import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Archive,
  Check,
  Edit3,
  Loader2,
  RefreshCw,
  RotateCcw,
  UserPlus,
  X,
} from "lucide-react";

import {
  archiveCustomer,
  createCustomer,
  getArchivedCustomers,
  getCustomers,
  restoreCustomer,
  updateCustomer,
} from "../services/customers.service";

import {
  type Customer,
  type CustomerStatus,
} from "../types/customer.types";

interface CustomersPageProps {
  searchTerm?: string;
}

interface CustomerFormData {
  name: string;
  email: string;
  company: string;
  status: CustomerStatus;
}

type CustomerView = "active" | "archived";

const initialFormData: CustomerFormData = {
  name: "",
  email: "",
  company: "",
  status: "ACTIVE",
};

const statusLabels: Record<CustomerStatus, string> = {
  ACTIVE: "Actief",
  INACTIVE: "Inactief",
  SUSPENDED: "Geschorst",
};

export default function CustomersPage({
  searchTerm = "",
}: CustomersPageProps) {
  console.log(
  "CustomersPage searchTerm:",
  searchTerm,
);
  const [activeCustomers, setActiveCustomers] = useState<
    Customer[]
  >([]);

  const [archivedCustomers, setArchivedCustomers] =
    useState<Customer[]>([]);

  const [currentView, setCurrentView] =
    useState<CustomerView>("active");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [processingCustomerId, setProcessingCustomerId] =
    useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState<
    string | null
  >(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  const [formData, setFormData] =
    useState<CustomerFormData>(initialFormData);

  async function loadCustomers(): Promise<void> {
    try {
      setIsLoading(true);
      setError(null);

      const [activeData, archivedData] =
        await Promise.all([
          getCustomers(),
          getArchivedCustomers(),
        ]);

      setActiveCustomers(activeData);
      setArchivedCustomers(archivedData);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "De klanten konden niet worden geladen.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCustomers();
  }, []);

  const displayedCustomers =
    currentView === "active"
      ? activeCustomers
      : archivedCustomers;


  const filteredCustomers =
    useMemo(() => {
      const normalizedSearchTerm =
        searchTerm
          .trim()
          .toLowerCase();

      if (!normalizedSearchTerm) {
        return displayedCustomers;
      }

      const searchableCustomers = [
        ...activeCustomers,
        ...archivedCustomers,
      ];

      return searchableCustomers.filter(
        (customer) => {
          const company =
            customer.company ?? "";

          const searchableText = [
            customer.name,
            customer.email,
            company,
            String(customer.id),
          ]
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            normalizedSearchTerm,
          );
        },
      );
    }, [
      displayedCustomers,
      activeCustomers,
      archivedCustomers,
      searchTerm,
    ]);

  console.log({
    searchTerm,
    activeCustomers:
      activeCustomers.length,
    archivedCustomers:
      archivedCustomers.length,
    filteredCustomers:
      filteredCustomers.map(
        (customer) => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          archived:
            customer.isArchived,
        }),
      ),
  });

  function resetMessages(): void {
    setError(null);
    setSuccessMessage(null);
  }

  function handleChangeView(view: CustomerView): void {
    resetMessages();
    setCurrentView(view);
  }

  function handleOpenAddModal(): void {
    resetMessages();
    setEditingCustomer(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  }

  function handleOpenEditModal(
    customer: Customer
  ): void {
    resetMessages();

    setEditingCustomer(customer);

    setFormData({
      name: customer.name,
      email: customer.email,
      company: customer.company ?? "",
      status: customer.status,
    });

    setIsModalOpen(true);
  }

  function handleCloseModal(): void {
    if (isSaving || processingCustomerId !== null) {
      return;
    }

    setIsModalOpen(false);
    setEditingCustomer(null);
    setFormData(initialFormData);
  }

  function updateFormField<
    Key extends keyof CustomerFormData
  >(
    field: Key,
    value: CustomerFormData[Key]
  ): void {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    const name = formData.name.trim();

    const email = formData.email
      .trim()
      .toLowerCase();

    const company = formData.company.trim();

    if (name.length < 2) {
      setError(
        "De klantnaam moet minimaal twee tekens bevatten."
      );
      return;
    }

    if (!email) {
      setError("Vul een geldig e-mailadres in.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      if (editingCustomer) {
        const response = await updateCustomer(
          editingCustomer.id,
          {
            name,
            email,
            company: company || null,
            status: formData.status,
          }
        );

        setActiveCustomers((currentCustomers) =>
          currentCustomers.map((customer) =>
            customer.id === editingCustomer.id
              ? response.data
              : customer
          )
        );

        setSuccessMessage(response.message);
      } else {
        const response = await createCustomer({
          name,
          email,
          company: company || undefined,
        });

        setActiveCustomers((currentCustomers) => [
          response.data,
          ...currentCustomers,
        ]);

        setSuccessMessage(response.message);
      }

      setIsModalOpen(false);
      setEditingCustomer(null);
      setFormData(initialFormData);
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

  async function handleArchiveCustomer(
    customer: Customer
  ): Promise<boolean> {
    const confirmed = window.confirm(
      `Weet u zeker dat u ${customer.name} wilt archiveren?`
    );

    if (!confirmed) {
      return false;
    }

    try {
      setProcessingCustomerId(customer.id);
      setError(null);
      setSuccessMessage(null);

      const response = await archiveCustomer(
        customer.id
      );

      setActiveCustomers((currentCustomers) =>
        currentCustomers.filter(
          (currentCustomer) =>
            currentCustomer.id !== customer.id
        )
      );

      setArchivedCustomers((currentCustomers) => [
        response.data,
        ...currentCustomers,
      ]);

      setSuccessMessage(response.message);

      return true;
    } catch (archiveError) {
      const message =
        archiveError instanceof Error
          ? archiveError.message
          : "De klant kon niet worden gearchiveerd.";

      setError(message);

      return false;
    } finally {
      setProcessingCustomerId(null);
    }
  }

  async function handleRestoreCustomer(
    customer: Customer
  ): Promise<void> {
    const confirmed = window.confirm(
      `Weet u zeker dat u ${customer.name} wilt herstellen?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingCustomerId(customer.id);
      setError(null);
      setSuccessMessage(null);

      const response = await restoreCustomer(
        customer.id
      );

      setArchivedCustomers((currentCustomers) =>
        currentCustomers.filter(
          (currentCustomer) =>
            currentCustomer.id !== customer.id
        )
      );

      setActiveCustomers((currentCustomers) => [
        response.data,
        ...currentCustomers,
      ]);

      setSuccessMessage(response.message);
    } catch (restoreError) {
      const message =
        restoreError instanceof Error
          ? restoreError.message
          : "De klant kon niet worden hersteld.";

      setError(message);
    } finally {
      setProcessingCustomerId(null);
    }
  }

  async function handleArchiveFromModal(): Promise<void> {
    if (!editingCustomer) {
      return;
    }

    const archived = await handleArchiveCustomer(
      editingCustomer
    );

    if (!archived) {
      return;
    }

    setIsModalOpen(false);
    setEditingCustomer(null);
    setFormData(initialFormData);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Klanten
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Beheer actieve en gearchiveerde klanten.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => void loadCustomers()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isLoading ? "animate-spin" : ""
              }`}
            />

            Vernieuwen
          </button>

          {currentView === "active" && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4" />
              Nieuwe klant
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => handleChangeView("active")}
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            currentView === "active"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Actieve klanten

          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {activeCustomers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleChangeView("archived")}
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            currentView === "archived"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Archief

          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {archivedCustomers.length}
          </span>
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {successMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex min-h-56 items-center justify-center gap-3 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Klanten worden geladen...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-4 font-semibold">
                    Klant
                  </th>

                  <th className="p-4 font-semibold">
                    Bedrijf
                  </th>

                  <th className="p-4 font-semibold">
                    Status
                  </th>

                  <th className="p-4 font-semibold">
                    {currentView === "active"
                      ? "Aangemaakt"
                      : "Gearchiveerd"}
                  </th>

                  <th className="p-4 text-right font-semibold">
                    Acties
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="p-4">
                        <div className="font-medium text-slate-900">
                          {customer.name}
                        </div>

                        <div className="text-xs text-slate-400">
                          {customer.email}
                        </div>
                      </td>

                      <td className="p-4 text-slate-600">
                        {customer.company || "Geen bedrijf"}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            customer.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-700"
                              : customer.status ===
                                  "SUSPENDED"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {statusLabels[customer.status]}
                        </span>
                      </td>

                      <td className="p-4 text-slate-600">
                        {new Intl.DateTimeFormat(
                          "nl-NL",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        ).format(
                          new Date(
                            currentView === "active"
                              ? customer.createdAt
                              : customer.archivedAt ??
                                  customer.updatedAt
                          )
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          {currentView === "active" ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenEditModal(
                                    customer
                                  )
                                }
                                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                title="Klant bewerken"
                                aria-label={`${customer.name} bewerken`}
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void handleArchiveCustomer(
                                    customer
                                  )
                                }
                                disabled={
                                  processingCustomerId ===
                                  customer.id
                                }
                                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Klant archiveren"
                                aria-label={`${customer.name} archiveren`}
                              >
                                {processingCustomerId ===
                                customer.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Archive className="h-4 w-4" />
                                )}
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                void handleRestoreCustomer(
                                  customer
                                )
                              }
                              disabled={
                                processingCustomerId ===
                                customer.id
                              }
                              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {processingCustomerId ===
                              customer.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RotateCcw className="h-4 w-4" />
                              )}

                              Herstellen
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-10 text-center text-slate-400"
                    >
                      {searchTerm
                        ? "Geen klanten gevonden voor deze zoekopdracht."
                        : currentView === "active"
                          ? "Er zijn nog geen actieve klanten."
                          : "Het archief is leeg."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800">
                {editingCustomer
                  ? "Klant bewerken"
                  : "Nieuwe klant"}
              </h2>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={
                  isSaving ||
                  processingCustomerId !== null
                }
                className="rounded-lg p-1 text-slate-400 transition-colors hover:text-slate-600 disabled:cursor-not-allowed"
                aria-label="Venster sluiten"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(event) =>
                void handleSubmit(event)
              }
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="customer-name"
                  className="mb-1 block text-xs font-semibold text-slate-600"
                >
                  Naam
                </label>

                <input
                  id="customer-name"
                  type="text"
                  required
                  minLength={2}
                  value={formData.name}
                  onChange={(event) =>
                    updateFormField(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Jan de Vries"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="customer-email"
                  className="mb-1 block text-xs font-semibold text-slate-600"
                >
                  E-mailadres
                </label>

                <input
                  id="customer-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(event) =>
                    updateFormField(
                      "email",
                      event.target.value
                    )
                  }
                  placeholder="jan@bedrijf.nl"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="customer-company"
                  className="mb-1 block text-xs font-semibold text-slate-600"
                >
                  Bedrijf
                </label>

                <input
                  id="customer-company"
                  type="text"
                  value={formData.company}
                  onChange={(event) =>
                    updateFormField(
                      "company",
                      event.target.value
                    )
                  }
                  placeholder="De Vries Software B.V."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {editingCustomer && (
                <div>
                  <label
                    htmlFor="customer-status"
                    className="mb-1 block text-xs font-semibold text-slate-600"
                  >
                    Status
                  </label>

                  <select
                    id="customer-status"
                    value={formData.status}
                    onChange={(event) =>
                      updateFormField(
                        "status",
                        event.target
                          .value as CustomerStatus
                      )
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
              )}

              <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div>
                  {editingCustomer && (
                    <button
                      type="button"
                      onClick={() =>
                        void handleArchiveFromModal()
                      }
                      disabled={
                        isSaving ||
                        processingCustomerId ===
                          editingCustomer.id
                      }
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {processingCustomerId ===
                      editingCustomer.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Archive className="h-4 w-4" />
                      )}

                      Klant archiveren
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={
                      isSaving ||
                      processingCustomerId !== null
                    }
                    className="rounded-lg px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Annuleren
                  </button>

                  <button
                    type="submit"
                    disabled={
                      isSaving ||
                      processingCustomerId !== null
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}

                    {isSaving
                      ? "Opslaan..."
                      : "Opslaan"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}