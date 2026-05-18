import { Router } from "express";
import { db, shopsTable, medicinesTable } from "@workspace/db";
import { eq, and, ilike, sql } from "drizzle-orm";
import { ListHealthcareShopsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/healthcare", async (req, res) => {
  const parse = ListHealthcareShopsQueryParams.safeParse(req.query);
  const params = parse.success ? parse.data : {};

  const conditions = [
    eq(shopsTable.status, "verified"),
    eq(shopsTable.category, "healthcare"),
  ];

  if (params.subcategory) {
    conditions.push(eq(shopsTable.subcategory, params.subcategory) as any);
  }
  if (params.search) {
    conditions.push(ilike(shopsTable.name, `%${params.search}%`) as any);
  }

  const shops = await db
    .select()
    .from(shopsTable)
    .where(and(...conditions))
    .orderBy(shopsTable.name);

  res.json(shops.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() })));
});

router.get("/healthcare/:shopId/medicines", async (req, res) => {
  const shopId = parseInt(req.params.shopId);
  if (isNaN(shopId)) {
    res.status(400).json({ error: "bad_request", message: "Invalid shopId" });
    return;
  }

  const medicines = await db
    .select()
    .from(medicinesTable)
    .where(eq(medicinesTable.shopId, shopId))
    .orderBy(medicinesTable.name);

  res.json(medicines.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() })));
});

export default router;
