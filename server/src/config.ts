import "dotenv/config";

export const config = {
  port: Number(process.env.PORT) || 4001,
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-in-production",
  nodeEnv: process.env.NODE_ENV || "development",
  /** Dev only: skip JWT on protected routes (must pair with client VITE_BYPASS_AUTH). Never enable in production. */
  authBypass: process.env.AUTH_BYPASS === "true",
};
