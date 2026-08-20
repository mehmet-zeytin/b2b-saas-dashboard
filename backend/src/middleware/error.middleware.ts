import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";

// Verwerkt onverwachte fouten vanuit controllers en services.
export const errorMiddleware: ErrorRequestHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("Onverwachte serverfout:", error);

  res.status(500).json({
    message: "Er is een interne serverfout opgetreden.",
  });
};