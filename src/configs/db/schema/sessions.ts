import { datetime, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { workspaces } from "./workspaces";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';


export const sessions = mysqlTable("sessions", {
    id: varchar("id", {
		length: 255
	}).primaryKey(),
	userId: varchar("workspaceId", {
		length: 255
	})
		.notNull()
		.references(() => workspaces.id),
	expiresAt: datetime("expires_at").notNull()
})