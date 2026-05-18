import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { shopsTable } from "./shops";

export const medicinesTable = sqliteTable("medicines", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  shopId: integer("shop_id").notNull().references(() => shopsTable.id),
  name: text("name").notNull(),
  available: integer("available", { mode: "boolean" }).notNull().default(true),
  price: real("price"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const insertMedicineSchema = createInsertSchema(medicinesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertMedicine = z.infer<typeof insertMedicineSchema>;
export type Medicine = typeof medicinesTable.$inferSelect;
