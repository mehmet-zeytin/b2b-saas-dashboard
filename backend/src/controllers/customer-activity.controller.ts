import type {
  Request,
  Response,
} from "express";

import {
  getCustomerActivities,
} from "../services/customer-activity.service.js";

function parseCustomerId(
  value: unknown,
): number | null {
  const customerId =
    Number(value);

  if (
    !Number.isInteger(
      customerId,
    ) ||
    customerId <= 0
  ) {
    return null;
  }

  return customerId;
}

// Stuurt de volledige klantgeschiedenis naar de frontend.
export async function listCustomerActivities(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const customerId =
      parseCustomerId(
        request.params.customerId,
      );

    if (
      customerId === null
    ) {
      response.status(400).json({
        message:
          "De klant-ID is ongeldig.",
      });

      return;
    }

    const activities =
      await getCustomerActivities(
        customerId,
      );

    response
      .status(200)
      .json(activities);
  } catch (error) {
    console.error(
      "Fout bij het ophalen van de klantgeschiedenis:",
      error,
    );

    response.status(500).json({
      message:
        "De klantgeschiedenis kon niet worden opgehaald.",
    });
  }
}