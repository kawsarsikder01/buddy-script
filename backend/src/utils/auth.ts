import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { env } from "../config/env";

export interface JwtPayload {
  sub: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(userId: ObjectId, email: string): string {
  const expiresIn = env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"];

  return jwt.sign({ sub: userId.toHexString(), email }, env.JWT_SECRET, {
    expiresIn,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
