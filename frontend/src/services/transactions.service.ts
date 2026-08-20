import { apiRequest } from "./api";

import type {
  CreateTransactionInput,
  Transaction,
  UpdateTransactionInput,
} from "../types/transaction.types";

export async function getTransactions(): Promise<Transaction[]> {
  return apiRequest<Transaction[]>("/api/transactions");
}

export async function getTransactionById(
  id: number,
): Promise<Transaction> {
  return apiRequest<Transaction>(
    `/api/transactions/${id}`,
  );
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<Transaction> {
  return apiRequest<Transaction>("/api/transactions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateTransaction(
  id: number,
  input: UpdateTransactionInput,
): Promise<Transaction> {
  return apiRequest<Transaction>(
    `/api/transactions/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}