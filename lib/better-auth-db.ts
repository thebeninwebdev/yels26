import { MongoClient } from "mongodb";

const globalForAuth = globalThis as typeof globalThis & { betterAuthClient?: MongoClient };

export function getAuthDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured");
  globalForAuth.betterAuthClient ??= new MongoClient(uri);
  return globalForAuth.betterAuthClient.db();
}
