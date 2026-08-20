import type {
  Request,
  Response,
} from "express";

import {
  TransactionStatus,
  TransactionType,
} from "../generated/prisma/client.js";

import {
  createTransaction,
  getTransactionById,
  getTransactions,
  updateTransaction,
} from "../services/transaction.service.js";

function parsePositiveInteger(
  value: unknown,
): number | null {
  const parsedValue =
    Number(value);

  if (
    !Number.isInteger(
      parsedValue,
    ) ||
    parsedValue <= 0
  ) {
    return null;
  }

  return parsedValue;
}

function parsePositiveAmount(
  value: unknown,
): number | null {
  const parsedValue =
    Number(value);

  if (
    !Number.isFinite(
      parsedValue,
    ) ||
    parsedValue <= 0
  ) {
    return null;
  }

  return parsedValue;
}

function parseTransactionDate(
  value: unknown,
): Date | null {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    return null;
  }

  const parsedDate =
    new Date(value);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return null;
  }

  return parsedDate;
}

function isTransactionType(
  value: unknown,
): value is TransactionType {
  return (
    value ===
      TransactionType.SALE ||
    value ===
      TransactionType.PAYMENT
  );
}

function isTransactionStatus(
  value: unknown,
): value is TransactionStatus {
  return (
    value ===
      TransactionStatus.PENDING ||
    value ===
      TransactionStatus.COMPLETED ||
    value ===
      TransactionStatus.FAILED ||
    value ===
      TransactionStatus.REFUNDED
  );
}

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return "Er is een onbekende fout opgetreden.";
}

// Haalt alle transacties op.
export async function listTransactions(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const customerIdValue =
      request.query.customerId;

    const typeValue =
      request.query.type;

    const statusValue =
      request.query.status;

    let customerId:
      number | undefined;

    let type:
      TransactionType | undefined;

    let status:
      TransactionStatus | undefined;

    if (
      customerIdValue !== undefined
    ) {
      const parsedCustomerId =
        parsePositiveInteger(
          customerIdValue,
        );

      if (
        parsedCustomerId === null
      ) {
        response.status(400).json({
          message:
            "De klant-ID is ongeldig.",
        });

        return;
      }

      customerId =
        parsedCustomerId;
    }

    if (
      typeValue !== undefined
    ) {
      if (
        !isTransactionType(
          typeValue,
        )
      ) {
        response.status(400).json({
          message:
            "Het transactietype is ongeldig.",
        });

        return;
      }

      type = typeValue;
    }

    if (
      statusValue !== undefined
    ) {
      if (
        !isTransactionStatus(
          statusValue,
        )
      ) {
        response.status(400).json({
          message:
            "De transactiestatus is ongeldig.",
        });

        return;
      }

      status =
        statusValue;
    }

    const transactions =
      await getTransactions({
        customerId,
        type,
        status,
      });

    response
      .status(200)
      .json(transactions);
  } catch (error) {
    console.error(
      "Fout bij het ophalen van transacties:",
      error,
    );

    response.status(500).json({
      message:
        "De transacties konden niet worden opgehaald.",
    });
  }
}

// Haalt één transactie op.
export async function showTransaction(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const transactionId =
      parsePositiveInteger(
        request.params.id,
      );

    if (
      transactionId === null
    ) {
      response.status(400).json({
        message:
          "De transactie-ID is ongeldig.",
      });

      return;
    }

    const transaction =
      await getTransactionById(
        transactionId,
      );

    if (!transaction) {
      response.status(404).json({
        message:
          "Transactie niet gevonden.",
      });

      return;
    }

    response
      .status(200)
      .json(transaction);
  } catch (error) {
    console.error(
      "Fout bij het ophalen van de transactie:",
      error,
    );

    response.status(500).json({
      message:
        "De transactie kon niet worden opgehaald.",
    });
  }
}

// Maakt een nieuwe transactie aan.
export async function storeTransaction(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const {
      customerId,
      type,
      amount,
      currency,
      status,
      description,
      transactionDate,
    } = request.body;

    const parsedCustomerId =
      parsePositiveInteger(
        customerId,
      );

    if (
      parsedCustomerId === null
    ) {
      response.status(400).json({
        message:
          "Selecteer een geldige klant.",
      });

      return;
    }

    if (
      !isTransactionType(
        type,
      )
    ) {
      response.status(400).json({
        message:
          "Selecteer een geldig transactietype.",
      });

      return;
    }

    const parsedAmount =
      parsePositiveAmount(
        amount,
      );

    if (
      parsedAmount === null
    ) {
      response.status(400).json({
        message:
          "Voer een geldig bedrag groter dan nul in.",
      });

      return;
    }

    if (
      status !== undefined &&
      !isTransactionStatus(
        status,
      )
    ) {
      response.status(400).json({
        message:
          "Selecteer een geldige transactiestatus.",
      });

      return;
    }

    let parsedTransactionDate:
      Date | undefined;

    if (
      transactionDate !== undefined
    ) {
      const date =
        parseTransactionDate(
          transactionDate,
        );

      if (!date) {
        response.status(400).json({
          message:
            "De transactiedatum is ongeldig.",
        });

        return;
      }

      parsedTransactionDate =
        date;
    }

    const transaction =
      await createTransaction({
        customerId:
          parsedCustomerId,

        type,

        amount:
          parsedAmount,

        currency:
          typeof currency ===
            "string" &&
          currency.trim()
            ? currency
                .trim()
                .toUpperCase()
            : "EUR",

        status,

        description:
          typeof description ===
          "string"
            ? description.trim() ||
              null
            : null,

        transactionDate:
          parsedTransactionDate,
      });

    response
      .status(201)
      .json(transaction);
  } catch (error) {
    console.error(
      "Fout bij het aanmaken van de transactie:",
      error,
    );

    response.status(400).json({
      message:
        getErrorMessage(error),
    });
  }
}

// Werkt een bestaande transactie bij.
export async function modifyTransaction(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const transactionId =
      parsePositiveInteger(
        request.params.id,
      );

    if (
      transactionId === null
    ) {
      response.status(400).json({
        message:
          "De transactie-ID is ongeldig.",
      });

      return;
    }

    const {
      type,
      amount,
      currency,
      status,
      description,
      transactionDate,
      changeNote,
    } = request.body;

    if (
      typeof changeNote !==
        "string" ||
      changeNote.trim().length <
        3
    ) {
      response.status(400).json({
        message:
          "Vul een wijzigingsnotitie van minimaal 3 tekens in.",
      });

      return;
    }

    if (
      type !== undefined &&
      !isTransactionType(
        type,
      )
    ) {
      response.status(400).json({
        message:
          "Het transactietype is ongeldig.",
      });

      return;
    }

    let parsedAmount:
      number | undefined;

    if (
      amount !== undefined
    ) {
      const result =
        parsePositiveAmount(
          amount,
        );

      if (
        result === null
      ) {
        response.status(400).json({
          message:
            "Voer een geldig bedrag groter dan nul in.",
        });

        return;
      }

      parsedAmount =
        result;
    }

    if (
      status !== undefined &&
      !isTransactionStatus(
        status,
      )
    ) {
      response.status(400).json({
        message:
          "De transactiestatus is ongeldig.",
      });

      return;
    }

    let parsedTransactionDate:
      Date | undefined;

    if (
      transactionDate !==
      undefined
    ) {
      const date =
        parseTransactionDate(
          transactionDate,
        );

      if (!date) {
        response.status(400).json({
          message:
            "De transactiedatum is ongeldig.",
        });

        return;
      }

      parsedTransactionDate =
        date;
    }

    const transaction =
      await updateTransaction(
        transactionId,
        {
          type,

          amount:
            parsedAmount,

          currency:
            typeof currency ===
            "string"
              ? currency
                  .trim()
                  .toUpperCase()
              : undefined,

          status,

          description:
            description ===
            undefined
              ? undefined
              : typeof description ===
                  "string"
                ? description.trim() ||
                  null
                : null,

          transactionDate:
            parsedTransactionDate,

          changeNote:
            changeNote.trim(),
        },
      );

    response
      .status(200)
      .json(transaction);
  } catch (error) {
    console.error(
      "Fout bij het wijzigen van de transactie:",
      error,
    );

    response.status(400).json({
      message:
        getErrorMessage(error),
    });
  }
}