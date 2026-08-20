import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  archiveCustomer,
  createCustomer,
  getActiveCustomers,
  getArchivedCustomers,
  getCustomerByEmail,
  getCustomerById,
  restoreCustomer,
  updateCustomer,
} from "../services/customer.service.js";

type CustomerStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

interface CustomerBody {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  status?: unknown;
}

const customerStatuses: CustomerStatus[] = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
];

function parseCustomerId(value: string): number | null {
  const customerId = Number(value);

  if (!Number.isInteger(customerId) || customerId <= 0) {
    return null;
  }

  return customerId;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeOptionalCompany(
  value: unknown
): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const company = value.trim();

  return company.length > 0 ? company : null;
}

// Stuurt alle niet-gearchiveerde klanten naar de frontend.
export async function getCustomersController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customers = await getActiveCustomers();

    res.status(200).json(customers);
  } catch (error) {
    next(error);
  }
}

// Stuurt alle gearchiveerde klanten naar de frontend.
export async function getArchivedCustomersController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customers = await getArchivedCustomers();

    res.status(200).json(customers);
  } catch (error) {
    next(error);
  }
}

// Stuurt één klant met transacties en abonnementen naar de frontend.
export async function getCustomerByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customerId = parseCustomerId(req.params.id);

    if (!customerId) {
      res.status(400).json({
        message: "Het klantnummer is ongeldig.",
      });
      return;
    }

    const customer = await getCustomerById(customerId);

    if (!customer) {
      res.status(404).json({
        message: "De klant is niet gevonden.",
      });
      return;
    }

    res.status(200).json(customer);
  } catch (error) {
    next(error);
  }
}

// Maakt een nieuwe klant aan.
export async function createCustomerController(
  req: Request<unknown, unknown, CustomerBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const name =
      typeof req.body.name === "string"
        ? req.body.name.trim()
        : "";

    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const company = normalizeOptionalCompany(req.body.company);

    if (name.length < 2) {
      res.status(400).json({
        message: "De klantnaam moet minimaal twee tekens bevatten.",
      });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({
        message: "Het e-mailadres is ongeldig.",
      });
      return;
    }

    if (
      req.body.company !== undefined &&
      company === undefined
    ) {
      res.status(400).json({
        message: "De bedrijfsnaam is ongeldig.",
      });
      return;
    }

    const existingCustomer = await getCustomerByEmail(email);

    if (existingCustomer) {
      res.status(409).json({
        message: "Er bestaat al een klant met dit e-mailadres.",
      });
      return;
    }

    const customer = await createCustomer({
      name,
      email,
      company: company ?? undefined,
    });

    res.status(201).json({
      message: "De klant is succesvol aangemaakt.",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}

// Werkt de gegevens van een bestaande klant bij.
export async function updateCustomerController(
  req: Request<{ id: string }, unknown, CustomerBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customerId = parseCustomerId(req.params.id);

    if (!customerId) {
      res.status(400).json({
        message: "Het klantnummer is ongeldig.",
      });
      return;
    }

    const existingCustomer = await getCustomerById(customerId);

    if (!existingCustomer) {
      res.status(404).json({
        message: "De klant is niet gevonden.",
      });
      return;
    }

    const name =
      typeof req.body.name === "string"
        ? req.body.name.trim()
        : undefined;

    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : undefined;

    const company = normalizeOptionalCompany(req.body.company);

    const status =
      typeof req.body.status === "string" &&
      customerStatuses.includes(req.body.status as CustomerStatus)
        ? (req.body.status as CustomerStatus)
        : undefined;

    if (name !== undefined && name.length < 2) {
      res.status(400).json({
        message: "De klantnaam moet minimaal twee tekens bevatten.",
      });
      return;
    }

    if (email !== undefined && !isValidEmail(email)) {
      res.status(400).json({
        message: "Het e-mailadres is ongeldig.",
      });
      return;
    }

    if (
      req.body.company !== undefined &&
      company === undefined
    ) {
      res.status(400).json({
        message: "De bedrijfsnaam is ongeldig.",
      });
      return;
    }

    if (
      req.body.status !== undefined &&
      status === undefined
    ) {
      res.status(400).json({
        message: "De klantstatus is ongeldig.",
      });
      return;
    }

    if (email && email !== existingCustomer.email) {
      const customerWithEmail = await getCustomerByEmail(email);

      if (customerWithEmail) {
        res.status(409).json({
          message: "Er bestaat al een klant met dit e-mailadres.",
        });
        return;
      }
    }

    const customer = await updateCustomer(customerId, {
      name,
      email,
      company,
      status,
    });

    res.status(200).json({
      message: "De klantgegevens zijn succesvol bijgewerkt.",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}

// Archiveert een klant op basis van het klantnummer.
export async function archiveCustomerController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customerId = parseCustomerId(req.params.id);

    if (!customerId) {
      res.status(400).json({
        message: "Het klantnummer is ongeldig.",
      });
      return;
    }

    const customer = await archiveCustomer(customerId);

    if (!customer) {
      res.status(404).json({
        message: "De klant is niet gevonden.",
      });
      return;
    }

    res.status(200).json({
      message: "De klant is succesvol gearchiveerd.",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}

// Herstelt een klant vanuit het archief.
export async function restoreCustomerController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customerId = parseCustomerId(req.params.id);

    if (!customerId) {
      res.status(400).json({
        message: "Het klantnummer is ongeldig.",
      });
      return;
    }

    const customer = await restoreCustomer(customerId);

    if (!customer) {
      res.status(404).json({
        message: "De klant is niet gevonden.",
      });
      return;
    }

    res.status(200).json({
      message: "De klant is succesvol hersteld.",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}