import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const shopsTable = sqliteTable("shops", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category", { enum: [
    "grocery",
    "fashion",
    "healthcare",
    "services",
    "restaurants",
  ] }).notNull(),
  subcategory: text("subcategory"),
  locality: text("locality").notNull(),
  phone: text("phone"),
  imageUrl: text("image_url"),
  openingTime: text("opening_time"),
  closingTime: text("closing_time"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  status: text("status", { enum: ["pending", "verified", "rejected"] }).notNull().default("pending"),
  ownerId: integer("owner_id").references(() => usersTable.id),
  rating: real("rating"),
  reviewCount: integer("review_count").default(0),
  rejectionReason: text("rejection_reason"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const insertShopSchema = createInsertSchema(shopsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertShop = z.infer<typeof insertShopSchema>;
export type Shop = typeof shopsTable.$inferSelect;
