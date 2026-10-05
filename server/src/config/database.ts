import mongoose from "mongoose";
import { config } from "./env.js";

let inMemoryServer: any = null;

export async function connectDatabase(): Promise<string> {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.host || "Connected";
  }

  let uri = config.mongodb.uri;

  if (!uri && !inMemoryServer) {
    console.log("ℹ️ No MONGODB_URI provided in environment. Initializing high-performance in-memory MongoDB engine...");
    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      inMemoryServer = await MongoMemoryServer.create();
      uri = inMemoryServer.getUri();
      console.log(`✅ In-memory MongoDB started at: ${uri}`);
    } catch (err: any) {
      console.error("❌ Failed to start in-memory MongoDB:", err.message);
      throw err;
    }
  } else if (inMemoryServer) {
    uri = inMemoryServer.getUri();
  }

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ Connected to MongoDB: ${mongoose.connection.host || "In-Memory"}`);
    return uri;
  } catch (err: any) {
    if (!inMemoryServer && !config.isProduction) {
      console.warn(`⚠️ Could not connect to configured MONGODB_URI (${err.message}). Falling back to in-memory MongoDB...`);
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      inMemoryServer = await MongoMemoryServer.create();
      uri = inMemoryServer.getUri();
      await mongoose.connect(uri);
      console.log(`✅ Connected to fallback In-Memory MongoDB: ${uri}`);
      return uri;
    }
    console.error("❌ Fatal MongoDB Connection Error:", err.message);
    throw err;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    if (inMemoryServer) {
      await inMemoryServer.stop();
    }
    console.log("MongoDB disconnected cleanly.");
  } catch (err) {
    console.error("Error disconnecting MongoDB:", err);
  }
}
