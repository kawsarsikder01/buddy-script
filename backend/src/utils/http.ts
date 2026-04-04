import type { Request, Response } from "express";

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}

export function notFound(_req: Request, _res: Response) {
  throw new HttpError(404, "Not found");
}
