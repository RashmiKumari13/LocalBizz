import { Router } from "express";
import { db, shopsTable } from "@workspace/db";
import { eq, and, ilike, or, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { CreateShopBody, ListShopsQueryParams, UpdateShopBody } from "@workspace/api-zod";

const router = Router();

router.get("/shops", async (req, res) => {
  const parse = ListShopsQueryParams.safeParse(req.query);
  const params = parse.success ? parse.data : {};

  const conditions = [eq(shopsTable.status, "verified")];

  if (params.category) {
    conditions.push(eq(shopsTable.category, params.category as any));
  }
  if (params.locality) {
    conditions.push(ilike(shopsTable.locality, `%${params.locality}%`));
  }
  if (params.search) {
    conditions.push(
      or(
        ilike(shopsTable.name, `%${params.search}%`),
        ilike(shopsTable.locality, `%${params.search}%`)
      )!
    );
  }

  const shops = await db
    .select()
    .from(shopsTable)
    .where(and(...conditions))
    .orderBy(shopsTable.createdAt);

  res.json(
    shops.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() }))
  );
});

router.get("/shops/stats/summary", async (_req, res) => {
  const all = await db
    .select()
    .from(shopsTable)
    .where(eq(shopsTable.status, "verified"));

  const byCategory: Record<string, number> = {};
  const localitiesSet = new Set<string>();

  for (const shop of all) {
    byCategory[shop.category] = (byCategory[shop.category] ?? 0) + 1;
    localitiesSet.add(shop.locality);
  }

  res.json({
    total: all.length,
    byCategory,
    localities: Array.from(localitiesSet),
  });
});

router.get("/shops/featured", async (_req, res) => {
  const shops = await db
    .select()
    .from(shopsTable)
    .where(eq(shopsTable.status, "verified"))
    .limit(8)
    .orderBy(sql`RANDOM()`);

  res.json(shops.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() })));
});

router.get("/shops/my", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const shops = await db
    .select()
    .from(shopsTable)
    .where(eq(shopsTable.ownerId, user.id))
    .orderBy(shopsTable.createdAt);
  res.json(shops.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() })));
});

router.get("/shops/:shopId", async (req, res) => {
  const shopId = parseInt(req.params.shopId);
  if (isNaN(shopId)) {
    res.status(400).json({ error: "bad_request", message: "Invalid shopId" });
    return;
  }
  const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.id, shopId));
  if (!shop) {
    res.status(404).json({ error: "not_found", message: "Shop not found" });
    return;
  }
  res.json({ ...shop, createdAt: shop.createdAt.toISOString() });
});

router.patch("/shops/:shopId", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const shopId = parseInt(String(req.params.shopId));
  if (isNaN(shopId)) {
    res.status(400).json({ error: "bad_request", message: "Invalid shopId" });
    return;
  }

  const [existing] = await db.select().from(shopsTable).where(eq(shopsTable.id, shopId));
  if (!existing) {
    res.status(404).json({ error: "not_found", message: "Shop not found" });
    return;
  }
  if (existing.ownerId !== user.id && user.role !== "admin") {
    res.status(403).json({ error: "forbidden", message: "Not your shop" });
    return;
  }

  const parse = UpdateShopBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "validation_error", message: parse.error.message });
    return;
  }

  const [updated] = await db
    .update(shopsTable)
    .set({ ...parse.data, status: "pending" })
    .where(eq(shopsTable.id, shopId))
    .returning();

  res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
});

router.post("/shops", requireAuth, async (req, res) => {
  const user = (req as any).user;
  if (user.status !== "verified") {
    res.status(403).json({ error: "forbidden", message: "Account not yet verified by admin" });
    return;
  }

  const parse = CreateShopBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "validation_error", message: parse.error.message });
    return;
  }

  const [shop] = await db
    .insert(shopsTable)
    .values({
      ...parse.data,
      category: parse.data.category as any,
      status: "pending",
      ownerId: user.id,
    })
    .returning();

  res.status(201).json({ ...shop, createdAt: shop.createdAt.toISOString() });
});

export default router;
