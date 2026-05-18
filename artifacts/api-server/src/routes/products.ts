import { Router } from "express";
import { db, productsTable, shopsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireShopOwnerOrAdmin } from "../lib/auth";
import { CreateShopProductBody } from "@workspace/api-zod";

const router = Router();

router.get("/shops/:shopId/products", async (req, res) => {
  const shopId = parseInt(String(req.params.shopId));
  if (isNaN(shopId)) {
    res.status(400).json({ error: "bad_request", message: "Invalid shopId" });
    return;
  }

  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.shopId, shopId));

  res.json(products);
});

router.post("/shops/:shopId/products", requireShopOwnerOrAdmin, async (req, res) => {
  const shopId = parseInt(String(req.params.shopId));
  if (isNaN(shopId)) {
    res.status(400).json({ error: "bad_request", message: "Invalid shopId" });
    return;
  }

  // Ensure shop exists
  const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.id, shopId));
  if (!shop) {
    res.status(404).json({ error: "not_found", message: "Shop not found" });
    return;
  }

  // Ensure user owns this shop or is admin
  const user = (req as any).user;
  if (user.role !== "admin" && shop.ownerId !== user.id) {
    res.status(403).json({ error: "forbidden", message: "Not authorized to add products to this shop" });
    return;
  }

  const parse = CreateShopProductBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "validation_error", message: parse.error.message });
    return;
  }

  const [product] = await db
    .insert(productsTable)
    .values({
      ...parse.data,
      shopId,
      available: parse.data.available ?? true,
    })
    .returning();

  res.status(201).json(product);
});

export default router;
