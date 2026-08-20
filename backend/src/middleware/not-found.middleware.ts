import type {
  Request,
  Response,
} from "express";

// Wordt uitgevoerd wanneer een opgevraagde route niet bestaat.
export function notFoundMiddleware(
  req: Request,
  res: Response
): void {
  res.status(404).json({
    message: `De route ${req.method} ${req.originalUrl} bestaat niet.`,
  });
}