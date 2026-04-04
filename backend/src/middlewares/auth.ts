import type { NextFunction, Request, Response } from "express";
import { parseObjectId } from "../utils/object-id";
import { verifyToken } from "../utils/auth";
import { HttpError } from "../utils/http";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");

  if (!header?.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing bearer token");
  }

  const token = header.slice("Bearer ".length).trim();
  const payload = verifyToken(token);

  const userId = parseObjectId(payload.sub);
  if (!userId) {
    throw new HttpError(401, "Invalid token subject");
  }

  req.auth = payload;
  next();
}
