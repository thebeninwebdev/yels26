import mongoose from "mongoose";

const globalForMongoose = global as typeof globalThis & {
  mongooseConnection?: Promise<typeof mongoose>;
};

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (!globalForMongoose.mongooseConnection) {
    globalForMongoose.mongooseConnection = mongoose.connect(uri, { bufferCommands: false });
  }
  return globalForMongoose.mongooseConnection;
}
