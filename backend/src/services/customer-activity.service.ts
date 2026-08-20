import {
  CustomerActivityType,
} from "../generated/prisma/client.js";

import type {
  Prisma,
} from "../generated/prisma/client.js";

import { prisma } from "../config/database.js";

type ActivityDatabase = Pick<
  Prisma.TransactionClient,
  "customerActivity"
>;

interface CreateCustomerActivityInput {
  customerId: number;
  transactionId?: number | null;
  type: CustomerActivityType;
  title: string;
  description?: string | null;
  metadata?: unknown;
}

// Haalt de volledige klantgeschiedenis op.
export async function getCustomerActivities(
  customerId: number,
) {
  return prisma.customerActivity.findMany({
    where: {
      customerId,
    },

    include: {
      transaction: {
        select: {
          id: true,
          type: true,
          amount: true,
          currency: true,
          status: true,
          description: true,
          transactionDate: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

// Slaat een nieuwe gebeurtenis in de klantgeschiedenis op.
export async function createCustomerActivity(
  input: CreateCustomerActivityInput,
  database: ActivityDatabase = prisma,
) {
  return database.customerActivity.create({
    data: {
      customerId:
        input.customerId,

      transactionId:
        input.transactionId ??
        null,

      type:
        input.type,

      title:
        input.title,

      description:
        input.description ??
        null,

      metadata:
        input.metadata === undefined
          ? undefined
          : JSON.parse(
              JSON.stringify(
                input.metadata,
              ),
            ),
    },
  });
}

// Registreert het aanmaken van een nieuwe klant.
export async function logCustomerCreated(
  customerId: number,
  database: ActivityDatabase = prisma,
) {
  return createCustomerActivity(
    {
      customerId,

      type:
        CustomerActivityType.CUSTOMER_CREATED,

      title:
        "Klant aangemaakt",

      description:
        "De klant is toegevoegd aan het systeem.",
    },
    database,
  );
}

// Registreert wijzigingen aan klantgegevens.
export async function logCustomerUpdated(
  customerId: number,
  changes: Record<
    string,
    {
      from: unknown;
      to: unknown;
    }
  >,
  database: ActivityDatabase = prisma,
) {
  if (
    Object.keys(changes).length === 0
  ) {
    return null;
  }

  return createCustomerActivity(
    {
      customerId,

      type:
        CustomerActivityType.CUSTOMER_UPDATED,

      title:
        "Klantgegevens gewijzigd",

      description:
        "De gegevens van de klant zijn bijgewerkt.",

      metadata: {
        changes,
      },
    },
    database,
  );
}

// Registreert het archiveren van een klant.
export async function logCustomerArchived(
  customerId: number,
  database: ActivityDatabase = prisma,
) {
  return createCustomerActivity(
    {
      customerId,

      type:
        CustomerActivityType.CUSTOMER_ARCHIVED,

      title:
        "Klant gearchiveerd",

      description:
        "De klant is naar het archief verplaatst.",
    },
    database,
  );
}

// Registreert het herstellen van een klant.
export async function logCustomerRestored(
  customerId: number,
  database: ActivityDatabase = prisma,
) {
  return createCustomerActivity(
    {
      customerId,

      type:
        CustomerActivityType.CUSTOMER_RESTORED,

      title:
        "Klant hersteld",

      description:
        "De klant is uit het archief hersteld.",
    },
    database,
  );
}

// Registreert het aanmaken van een transactie.
export async function logTransactionCreated(
  transaction: {
    id: number;
    customerId: number;
    type: "SALE" | "PAYMENT";
    amount: unknown;
    currency: string;
    status?: unknown;
    description?: string | null;
    transactionDate?: Date;
  },
  database: ActivityDatabase = prisma,
) {
  const typeLabel =
    transaction.type === "SALE"
      ? "Verkoop"
      : "Betaling";

  return createCustomerActivity(
    {
      customerId:
        transaction.customerId,

      transactionId:
        transaction.id,

      type:
        CustomerActivityType.TRANSACTION_CREATED,

      title:
        `${typeLabel} toegevoegd`,

      description:
        transaction.description ??
        `${typeLabel} toegevoegd.`,

      metadata: {
        transactionType:
          transaction.type,

        amount:
          String(
            transaction.amount,
          ),

        currency:
          transaction.currency,

        status:
          transaction.status,

        description:
          transaction.description ??
          null,

        transactionDate:
          transaction.transactionDate
            ?.toISOString(),
      },
    },
    database,
  );
}

// Registreert wijzigingen aan een bestaande transactie.
export async function logTransactionUpdated(
  customerId: number,
  transactionId: number,
  changes: Record<
    string,
    {
      from: unknown;
      to: unknown;
    }
  >,
  note: string,
  database: ActivityDatabase = prisma,
) {
  if (
    Object.keys(changes).length === 0
  ) {
    return null;
  }

  return createCustomerActivity(
    {
      customerId,

      transactionId,

      type:
        CustomerActivityType.TRANSACTION_UPDATED,

      title:
        "Transactie gewijzigd",

      description:
        note,

      metadata: {
        changes,
        note,
      },
    },
    database,
  );
}