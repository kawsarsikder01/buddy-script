import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/http";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ message: "Validation failed", issues: err.flatten() });
  }

  if (err instanceof Error) {
    if (process.env.NODE_ENV === "development") {
      return res.status(500).json({ message: "Internal server error", error: err.message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }

  return res.status(500).json({ message: "Internal server error" });
}
