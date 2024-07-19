import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { DrizzleMySQLAdapter } from "@lucia-auth/adapter-drizzle";
import { sessions } from "./schema/sessions";
import { workspaces } from "./schema/workspaces";
import { config } from "dotenv";

config();
export const connection = await mysql.createConnection({
  host: process.env.DB_HOST as string,
  user: process.env.DB_USER as string,
  database: process.env.DB_NAME as string,
});

export const db = drizzle(connection);

export const adapter = new DrizzleMySQLAdapter(db, sessions, workspaces);
