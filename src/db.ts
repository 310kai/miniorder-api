
import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const requiredKeys = ["DB_USER", "DB_PASSWORD", "DB_NAME"] as const;

for (const key of requiredKeys) {
  if (!process.env[key]) {
    throw new Error(`${key} is not set`);
  }
}

export const pool = new Pool({
  host: "127.0.0.1",
  port: 5433,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
