import dotenv from "dotenv";
import path from "node:path";

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const config = {
  env: process.env.NODE_ENV || "development",
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isDev: process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test",
  isTest: process.env.NODE_ENV === "test",
  port: parseInt(process.env.PORT || "5000", 10),
  clientUrl: process.env.CLIENT_URL || "http://localhost:8443",
  
  mongodb: {
    uri: process.env.MONGODB_URI || "",
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || "libsync_default_jwt_secret_dev_2026",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  
  institution: {
    defaultDailyFineAmount: parseFloat(process.env.DEFAULT_DAILY_FINE_AMOUNT || "5"),
    defaultLoanPeriodDays: parseInt(process.env.DEFAULT_LOAN_PERIOD_DAYS || "14", 10),
    maxRenewalsAllowed: parseInt(process.env.MAX_RENEWALS_ALLOWED || "2", 10),
  },
  
  ai: {
    provider: process.env.AI_PROVIDER || "heuristic",
    apiKey: process.env.AI_API_KEY || "",
    model: process.env.AI_MODEL || "gemini-1.5-flash",
  },
  
  storage: {
    provider: process.env.STORAGE_PROVIDER || "local",
    dir: process.env.STORAGE_DIR || "uploads",
  },
  
  payment: {
    provider: process.env.PAYMENT_PROVIDER || "mock",
    secret: process.env.PAYMENT_SECRET || "mock_secret",
  },
};
