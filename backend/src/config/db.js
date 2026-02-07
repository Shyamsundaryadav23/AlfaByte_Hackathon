import pkg from "pg";
import { env } from "./env.js";

const { Pool } = pkg;

export const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 10
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL Connected");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL error:", err);
  process.exit(1);
});

// Utility function
export const query = (text, params) => pool.query(text, params);
