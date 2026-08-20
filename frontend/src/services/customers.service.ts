import {
  type CreateCustomerInput,
  type Customer,
  type CustomerDetails,
  type CustomerMutationResponse,
  type UpdateCustomerInput,
} from "../types/customer.types";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:5000";

async function handleResponse<T>(
  response: Response,
): Promise<T> {
  const data =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof data.message ===
        "string"
        ? data.message
        : "Er is een onverwachte fout opgetreden.";

    throw new Error(message);
  }

  return data as T;
}

// Haalt alle actieve klanten op.
export async function getCustomers(): Promise<
  Customer[]
> {
  const response = await fetch(
    `${API_URL}/api/customers`,
  );

  return handleResponse<Customer[]>(
    response,
  );
}

// Haalt alle gearchiveerde klanten op.
export async function getArchivedCustomers(): Promise<
  Customer[]
> {
  const response = await fetch(
    `${API_URL}/api/customers/archived`,
  );

  return handleResponse<Customer[]>(
    response,
  );
}

// Haalt één klant met relaties op.
export async function getCustomerById(
  customerId: number,
): Promise<CustomerDetails> {
  const response = await fetch(
    `${API_URL}/api/customers/${customerId}`,
  );

  return handleResponse<CustomerDetails>(
    response,
  );
}

// Maakt een nieuwe klant aan.
export async function createCustomer(
  input: CreateCustomerInput,
): Promise<CustomerMutationResponse> {
  const response = await fetch(
    `${API_URL}/api/customers`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(input),
    },
  );

  return handleResponse<CustomerMutationResponse>(
    response,
  );
}

// Werkt een bestaande klant bij.
export async function updateCustomer(
  customerId: number,
  input: UpdateCustomerInput,
): Promise<CustomerMutationResponse> {
  const response = await fetch(
    `${API_URL}/api/customers/${customerId}`,
    {
      method: "PATCH",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(input),
    },
  );

  return handleResponse<CustomerMutationResponse>(
    response,
  );
}

// Archiveert een klant.
export async function archiveCustomer(
  customerId: number,
): Promise<CustomerMutationResponse> {
  const response = await fetch(
    `${API_URL}/api/customers/${customerId}/archive`,
    {
      method: "PATCH",
    },
  );

  return handleResponse<CustomerMutationResponse>(
    response,
  );
}

// Herstelt een gearchiveerde klant.
export async function restoreCustomer(
  customerId: number,
): Promise<CustomerMutationResponse> {
  const response = await fetch(
    `${API_URL}/api/customers/${customerId}/restore`,
    {
      method: "PATCH",
    },
  );

  return handleResponse<CustomerMutationResponse>(
    response,
  );
}