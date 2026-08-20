import type { Request, Response } from "express";
import { getCustomerBalances } from "../services/customer-balance.service.js";

export async function listCustomerBalances(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const balances = await getCustomerBalances();

    response.status(200).json(balances);
  } catch (error) {
    console.error(
      "Fout bij het ophalen van klantbalansen:",
      error,
    );

    response.status(500).json({
      message:
        "De klantbalansen konden niet worden opgehaald.",
    });
  }
}