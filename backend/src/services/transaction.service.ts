import {
  TransactionStatus,
  TransactionType,
} from "../generated/prisma/client.js";

import { prisma } from "../config/database.js";

import {
  logTransactionCreated,
  logTransactionUpdated,
} from "./customer-activity.service.js";

interface TransactionFilters {
  customerId?: number;
  type?: TransactionType;
  status?: TransactionStatus;
}

interface CreateTransactionInput {
  customerId: number;
  type: TransactionType;
  amount: number;
  currency?: string;
  status?: TransactionStatus;
  description?: string | null;
  transactionDate?: Date;
}

interface UpdateTransactionInput {
  type?: TransactionType;
  amount?: number;
  currency?: string;
  status?: TransactionStatus;
  description?: string | null;
  transactionDate?: Date;
  changeNote: string;
}

function valuesDiffer(
  first: unknown,
  second: unknown,
): boolean {
  if (
    first instanceof Date &&
    second instanceof Date
  ) {
    return (
      first.getTime() !==
      second.getTime()
    );
  }

  return (
    String(first ?? "") !==
    String(second ?? "")
  );
}

// Haalt transacties op met optionele filters.
export async function getTransactions(
  filters: TransactionFilters = {},
) {
  return prisma.transaction.findMany({
    where: {
      customerId:
        filters.customerId,

      type:
        filters.type,

      status:
        filters.status,
    },

    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          status: true,
          isArchived: true,
        },
      },
    },

    orderBy: [
      {
        transactionDate:
          "desc",
      },
      {
        createdAt:
          "desc",
      },
    ],
  });
}

// Haalt één transactie op.
export async function getTransactionById(
  id: number,
) {
  return prisma.transaction.findUnique({
    where: {
      id,
    },

    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          status: true,
          isArchived: true,
        },
      },
    },
  });
}

// Maakt een nieuwe transactie en auditregistratie atomair aan.
export async function createTransaction(
  input: CreateTransactionInput,
) {
  return prisma.$transaction(
    async (tx) => {
      const customer =
        await tx.customer.findUnique({
          where: {
            id: input.customerId,
          },

          select: {
            id: true,
            isArchived: true,
          },
        });

      if (!customer) {
        throw new Error(
          "Klant niet gevonden.",
        );
      }

      if (customer.isArchived) {
        throw new Error(
          "Er kan geen nieuwe transactie voor een gearchiveerde klant worden aangemaakt.",
        );
      }

      const transaction =
        await tx.transaction.create({
          data: {
            customerId:
              input.customerId,

            type:
              input.type,

            amount:
              input.amount,

            currency:
              input.currency ??
              "EUR",

            status:
              input.status ??
              TransactionStatus.PENDING,

            description:
              input.description ??
              null,

            transactionDate:
              input.transactionDate ??
              new Date(),
          },

          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                company: true,
                status: true,
                isArchived: true,
              },
            },
          },
        });

      await logTransactionCreated(
        {
          id:
            transaction.id,

          customerId:
            transaction.customerId,

          type:
            transaction.type,

          amount:
            transaction.amount,

          currency:
            transaction.currency,

          status:
            transaction.status,

          description:
            transaction.description,

          transactionDate:
            transaction.transactionDate,
        },
        tx,
      );

      return transaction;
    },
  );
}

// Werkt een transactie en de auditregistratie atomair bij.
export async function updateTransaction(
  id: number,
  input: UpdateTransactionInput,
) {
  return prisma.$transaction(
    async (tx) => {
      const existingTransaction =
        await tx.transaction.findUnique({
          where: {
            id,
          },
        });

      if (!existingTransaction) {
        throw new Error(
          "Transactie niet gevonden.",
        );
      }

      const changes: Record<
        string,
        {
          from: unknown;
          to: unknown;
        }
      > = {};

      if (
        input.type !== undefined &&
        valuesDiffer(
          existingTransaction.type,
          input.type,
        )
      ) {
        changes.type = {
          from:
            existingTransaction.type,

          to:
            input.type,
        };
      }

      if (
        input.amount !== undefined &&
        valuesDiffer(
          existingTransaction.amount,
          input.amount,
        )
      ) {
        changes.amount = {
          from:
            String(
              existingTransaction.amount,
            ),

          to:
            String(
              input.amount,
            ),
        };
      }

      if (
        input.currency !== undefined &&
        valuesDiffer(
          existingTransaction.currency,
          input.currency,
        )
      ) {
        changes.currency = {
          from:
            existingTransaction.currency,

          to:
            input.currency,
        };
      }

      if (
        input.status !== undefined &&
        valuesDiffer(
          existingTransaction.status,
          input.status,
        )
      ) {
        changes.status = {
          from:
            existingTransaction.status,

          to:
            input.status,
        };
      }

      if (
        input.description !== undefined &&
        valuesDiffer(
          existingTransaction.description,
          input.description,
        )
      ) {
        changes.description = {
          from:
            existingTransaction.description,

          to:
            input.description,
        };
      }

      if (
        input.transactionDate !== undefined &&
        valuesDiffer(
          existingTransaction.transactionDate,
          input.transactionDate,
        )
      ) {
        changes.transactionDate = {
          from:
            existingTransaction
              .transactionDate
              .toISOString(),

          to:
            input.transactionDate
              .toISOString(),
        };
      }

      if (
        Object.keys(changes).length === 0
      ) {
        throw new Error(
          "Er zijn geen wijzigingen om op te slaan.",
        );
      }

      const transaction =
        await tx.transaction.update({
          where: {
            id,
          },

          data: {
            type:
              input.type,

            amount:
              input.amount,

            currency:
              input.currency,

            status:
              input.status,

            description:
              input.description,

            transactionDate:
              input.transactionDate,
          },

          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                company: true,
                status: true,
                isArchived: true,
              },
            },
          },
        });

      await logTransactionUpdated(
        transaction.customerId,
        transaction.id,
        changes,
        input.changeNote,
        tx,
      );

      return transaction;
    },
  );
}