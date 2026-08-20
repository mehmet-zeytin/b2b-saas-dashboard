import {
  CustomerStatus,
} from "../generated/prisma/client.js";

import { prisma } from "../config/database.js";

import {
  logCustomerArchived,
  logCustomerCreated,
  logCustomerRestored,
  logCustomerUpdated,
} from "./customer-activity.service.js";

interface CreateCustomerInput {
  name: string;
  email: string;
  company?: string | null;
  status?: CustomerStatus;
}

interface UpdateCustomerInput {
  name?: string;
  email?: string;
  company?: string | null;
  status?: CustomerStatus;
}

function valuesDiffer(
  first: unknown,
  second: unknown,
): boolean {
  return (
    String(first ?? "") !==
    String(second ?? "")
  );
}

// Haalt alle niet-gearchiveerde klanten op.
export async function getCustomers() {
  return prisma.customer.findMany({
    where: {
      isArchived: false,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

// Haalt alleen actieve, niet-gearchiveerde klanten op.
export async function getActiveCustomers() {
  return prisma.customer.findMany({
    where: {
      isArchived: false,
      status: CustomerStatus.ACTIVE,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

// Haalt alle gearchiveerde klanten op.
export async function getArchivedCustomers() {
  return prisma.customer.findMany({
    where: {
      isArchived: true,
    },

    orderBy: {
      archivedAt: "desc",
    },
  });
}

// Haalt één klant met gekoppelde gegevens op.
export async function getCustomerById(
  id: number,
) {
  return prisma.customer.findUnique({
    where: {
      id,
    },

    include: {
      transactions: {
        orderBy: {
          transactionDate:
            "desc",
        },
      },

      subscriptions: {
        orderBy: {
          createdAt:
            "desc",
        },
      },

      activities: {
        orderBy: {
          createdAt:
            "desc",
        },
      },
    },
  });
}

// Zoekt één klant op basis van e-mailadres.
export async function getCustomerByEmail(
  email: string,
) {
  return prisma.customer.findUnique({
    where: {
      email,
    },
  });
}

// Maakt een klant en de auditregistratie atomair aan.
export async function createCustomer(
  input: CreateCustomerInput,
) {
  return prisma.$transaction(
    async (tx) => {
      const customer =
        await tx.customer.create({
          data: {
            name:
              input.name,

            email:
              input.email,

            company:
              input.company ??
              null,

            status:
              input.status ??
              CustomerStatus.ACTIVE,
          },
        });

      await logCustomerCreated(
        customer.id,
        tx,
      );

      return customer;
    },
  );
}

// Werkt klantgegevens en auditregistratie atomair bij.
export async function updateCustomer(
  id: number,
  input: UpdateCustomerInput,
) {
  return prisma.$transaction(
    async (tx) => {
      const existingCustomer =
        await tx.customer.findUnique({
          where: {
            id,
          },
        });

      if (!existingCustomer) {
        throw new Error(
          "Klant niet gevonden.",
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
        input.name !== undefined &&
        valuesDiffer(
          existingCustomer.name,
          input.name,
        )
      ) {
        changes.name = {
          from:
            existingCustomer.name,

          to:
            input.name,
        };
      }

      if (
        input.email !== undefined &&
        valuesDiffer(
          existingCustomer.email,
          input.email,
        )
      ) {
        changes.email = {
          from:
            existingCustomer.email,

          to:
            input.email,
        };
      }

      if (
        input.company !== undefined &&
        valuesDiffer(
          existingCustomer.company,
          input.company,
        )
      ) {
        changes.company = {
          from:
            existingCustomer.company,

          to:
            input.company,
        };
      }

      if (
        input.status !== undefined &&
        valuesDiffer(
          existingCustomer.status,
          input.status,
        )
      ) {
        changes.status = {
          from:
            existingCustomer.status,

          to:
            input.status,
        };
      }

      if (
        Object.keys(changes).length ===
        0
      ) {
        return existingCustomer;
      }

      const customer =
        await tx.customer.update({
          where: {
            id,
          },

          data: {
            name:
              input.name,

            email:
              input.email,

            company:
              input.company,

            status:
              input.status,
          },
        });

      await logCustomerUpdated(
        customer.id,
        changes,
        tx,
      );

      return customer;
    },
  );
}

// Archiveert een klant en registreert dit atomair.
export async function archiveCustomer(
  id: number,
) {
  return prisma.$transaction(
    async (tx) => {
      const existingCustomer =
        await tx.customer.findUnique({
          where: {
            id,
          },
        });

      if (!existingCustomer) {
        throw new Error(
          "Klant niet gevonden.",
        );
      }

      if (
        existingCustomer.isArchived
      ) {
        throw new Error(
          "Deze klant is al gearchiveerd.",
        );
      }

      const customer =
        await tx.customer.update({
          where: {
            id,
          },

          data: {
            isArchived:
              true,

            archivedAt:
              new Date(),

            status:
              CustomerStatus.INACTIVE,
          },
        });

      await logCustomerArchived(
        customer.id,
        tx,
      );

      return customer;
    },
  );
}

// Herstelt een klant en registreert dit atomair.
export async function restoreCustomer(
  id: number,
) {
  return prisma.$transaction(
    async (tx) => {
      const existingCustomer =
        await tx.customer.findUnique({
          where: {
            id,
          },
        });

      if (!existingCustomer) {
        throw new Error(
          "Klant niet gevonden.",
        );
      }

      if (
        !existingCustomer.isArchived
      ) {
        throw new Error(
          "Deze klant is niet gearchiveerd.",
        );
      }

      const customer =
        await tx.customer.update({
          where: {
            id,
          },

          data: {
            isArchived:
              false,

            archivedAt:
              null,

            status:
              CustomerStatus.ACTIVE,
          },
        });

      await logCustomerRestored(
        customer.id,
        tx,
      );

      return customer;
    },
  );
}