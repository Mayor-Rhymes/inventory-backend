import { mysqlTable, text, varchar, timestamp } from 'drizzle-orm/mysql-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const workspaces = mysqlTable("workspaces", {
    id: varchar("id", { length: 256 }).primaryKey(),
    email: varchar("email", { length: 256 }).notNull(),
    password: text("password").notNull(),
    workspacename: text("workspacename").notNull().unique(),
    createdAt: timestamp("createdAt", { mode: 'string', fsp: 6 }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: 'string', fsp: 6 }).defaultNow().notNull(),
})


export const insertWorkspaceSchema = createInsertSchema(workspaces).pick({email: true, workspacename: true, password: true});

export const selectWorkspaceSchema = createSelectSchema(workspaces).pick({email: true, password: true});


