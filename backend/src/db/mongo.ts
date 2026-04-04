import { MongoClient } from "mongodb";
import { env } from "../config/env";

const client = new MongoClient(env.DATABASE_URL, {
  maxPoolSize: 30,
  minPoolSize: 5,
});

let connected = false;

export async function connectToDatabase() {
  if (connected) {
    return client.db();
  }

  await client.connect();
  connected = true;
  return client.db();
}

export function getDb() {
  if (!connected) {
    throw new Error("Database is not connected yet.");
  }

  return client.db();
}

export async function closeDatabase() {
  if (!connected) {
    return;
  }

  await client.close();
  connected = false;
}
