import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/configs/db/schema",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST as string,
    user: process.env.DB_USER as string,
    database: process.env.DB_NAME as string,
  },
});
