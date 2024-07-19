import { mysqlTable, text, varchar, timestamp, int, mysqlEnum, decimal } from 'drizzle-orm/mysql-core';
import { createId } from '@paralleldrive/cuid2';
import { workspaces } from './workspaces';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from "zod";

export const products = mysqlTable("products", {
    id: varchar("id", { length: 256 }).$defaultFn(() => createId()).primaryKey(),
    brand: text("brand").notNull(),
    name: text("name").notNull(),
    price: decimal("price", {precision: 19, scale: 4}).notNull(),
    quantity: int("quantity", { unsigned: true }).notNull(),
    color: mysqlEnum("color", ["red", "green", "yellow", "blue", "indigo", "purple", "brown", "gold", "black", "maroon"]),
    category: mysqlEnum("category", ["Fashion", "Electronics", "Beauty and Personal Care", "Baby", "Arts and Crafts", "Computers", "Mobile Phone"]),
    createdAt: timestamp("createdAt", { mode: 'string', fsp: 6 }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: 'string', fsp: 6 }).defaultNow().notNull(),
    workspaceId: varchar("workspaceId", {length: 256}).references(() => workspaces.id).notNull(),
})


export const createProductSchema = createInsertSchema(products).pick({ brand: true, name: true, price: true, quantity: true, color: true, category: true });

export const patchProductSchema = z.object({
    brand: z.string().optional(),
    name: z.string().optional(),
    price: z.string().optional(),
    quantity: z.number().optional(),
    color: z.enum(["red", "green", "yellow", "blue", "indigo", "purple", "brown", "gold", "black", "maroon"]).optional(),
    category: z.enum(["Fashion", "Electronics", "Beauty and Personal Care", "Baby", "Arts and Crafts", "Computers", "Mobile Phone"]).optional(),
})



