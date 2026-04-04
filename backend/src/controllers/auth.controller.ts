import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { getDb } from "../db/mongo";
import { hashPassword, signToken, verifyPassword } from "../utils/auth";
import { HttpError } from "../utils/http";
import { parseObjectId } from "../utils/object-id";

export interface UserDoc {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  emailLower: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const registerSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.email().transform((value) => value.trim()),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.email().transform((value) => value.trim()),
  password: z.string().min(8).max(72),
});

export function toPublicUser(user: UserDoc) {
  return {
    id: user._id.toHexString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export const register = async (req: Request, res: Response) => {
  const payload = registerSchema.parse(req.body);
  const db = getDb();
  const users = db.collection<UserDoc>("users");

  const emailLower = payload.email.toLowerCase();
  const existing = await users.findOne({ emailLower });
  if (existing) {
    throw new HttpError(409, "Email already exists");
  }

  const now = new Date();
  const passwordHash = await hashPassword(payload.password);

  const user: UserDoc = {
    _id: new ObjectId(),
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    emailLower,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  await users.insertOne(user);

  const token = signToken(user._id, user.email);
  res.status(201).json({ token, user: toPublicUser(user) });
};

export const login = async (req: Request, res: Response) => {
  const payload = loginSchema.parse(req.body);
  const db = getDb();
  const users = db.collection<UserDoc>("users");

  const emailLower = payload.email.toLowerCase();
  const user = await users.findOne({ emailLower });

  if (!user) {
    throw new HttpError(401, "Invalid credentials");
  }

  const isValid = await verifyPassword(payload.password, user.passwordHash);
  if (!isValid) {
    throw new HttpError(401, "Invalid credentials");
  }

  const token = signToken(user._id, user.email);
  res.status(200).json({ token, user: toPublicUser(user) });
};

export const getMe = async (req: Request, res: Response) => {
  const userId = parseObjectId(req.auth!.sub);
  if (!userId) {
    throw new HttpError(401, "Invalid token");
  }

  const db = getDb();
  const users = db.collection<UserDoc>("users");
  const user = await users.findOne({ _id: userId });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  res.status(200).json({ user: toPublicUser(user) });
};
