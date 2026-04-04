import type { JwtPayload } from "../utils/auth";

declare module "express-serve-static-core" {
  interface Request {
    auth?: JwtPayload;
  }
}

export {};
