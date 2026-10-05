import app from "./app.js";
import { config } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { User } from "./models/User.js";
import { seedDatabase } from "./scripts/seed.js";

async function startServer() {
  try {
    console.log("Connecting to MongoDB database...");
    await connectDatabase();

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("Database is empty. Populating initial seed data...");
      await seedDatabase();
    }

    const server = app.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(`  LibSync Centralized Library API Server Running    `);
      console.log(`  URL: http://localhost:${config.port}              `);
      console.log(`  Health Check: http://localhost:${config.port}/api/health `);
      console.log(`  Environment: ${config.nodeEnv}                    `);
      console.log(`====================================================`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDatabase();
        console.log("Server closed and database disconnected.");
        process.exit(0);
      });

      // Force close if it takes too long
      setTimeout(() => {
        console.error("Forcefully terminating process.");
        process.exit(1);
      }, 5000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
