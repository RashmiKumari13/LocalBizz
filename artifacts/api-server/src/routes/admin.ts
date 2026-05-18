import { Router } from "express";
import { db, usersTable, shopsTable } from "@workspace/db";
import { eq, and, count, sql } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import { VerifyUserBody, VerifyShopBody, AdminCreateShopBody } from "@workspace/api-zod";
import { sendUserApprovalEmail, sendShopApprovalEmail } from "../lib/mailer";

const router = Router();

router.get("/admin/pending-users", requireAdmin, async (_req, res) => {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.status, "pending"))
    .orderBy(usersTable.createdAt);

  res.json(
    users.map(({ passwordHash: _ph, ...u }) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    }))
  );
});

router.post("/admin/users/:userId/verify", requireAdmin, async (req, res) => {
  const userId = parseInt(String(req.params.userId));
  if (isNaN(userId)) {
    res.status(400).json({ error: "bad_request", message: "Invalid userId" });
    return;
  }

  const parse = VerifyUserBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "validation_error", message: parse.error.message });
    return;
  }

  const { action, reason } = parse.data;
  const newStatus = action === "approve" ? "verified" : "rejected";

  const [user] = await db
    .update(usersTable)
    .set({
      status: newStatus,
      rejectionReason: reason ?? null,
    })
    .where(eq(usersTable.id, userId))
    .returning();

  if (!user) {
    res.status(404).json({ error: "not_found", message: "User not found" });
    return;
  }

  sendUserApprovalEmail({
    userName: user.name,
    userEmail: user.email,
    approved: action === "approve",
    reason: reason ?? null,
  }).catch(() => {});

  const { passwordHash: _ph, ...safeUser } = user;
  res.json({ ...safeUser, createdAt: safeUser.createdAt.toISOString() });
});

router.get("/admin/pending-shops", requireAdmin, async (_req, res) => {
  const shops = await db
    .select()
    .from(shopsTable)
    .where(eq(shopsTable.status, "pending"))
    .orderBy(shopsTable.createdAt);

  res.json(shops.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() })));
});

router.post("/admin/shops/:shopId/verify", requireAdmin, async (req, res) => {
  const shopId = parseInt(String(req.params.shopId));
  if (isNaN(shopId)) {
    res.status(400).json({ error: "bad_request", message: "Invalid shopId" });
    return;
  }

  const parse = VerifyShopBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "validation_error", message: parse.error.message });
    return;
  }

  const { action, reason } = parse.data;
  const newStatus = action === "approve" ? "verified" : "rejected";

  const [shop] = await db
    .update(shopsTable)
    .set({
      status: newStatus,
      rejectionReason: reason ?? null,
    })
    .where(eq(shopsTable.id, shopId))
    .returning();

  if (!shop) {
    res.status(404).json({ error: "not_found", message: "Shop not found" });
    return;
  }

  if (shop.ownerId) {
    const [owner] = await db.select().from(usersTable).where(eq(usersTable.id, shop.ownerId));
    if (owner) {
      sendShopApprovalEmail({
        ownerName: owner.name,
        ownerEmail: owner.email,
        shopName: shop.name,
        approved: action === "approve",
        reason: reason ?? null,
      }).catch(() => {});
    }
  }

  res.json({ ...shop, createdAt: shop.createdAt.toISOString() });
});

router.post("/admin/shops", requireAdmin, async (req, res) => {
  const parse = AdminCreateShopBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "validation_error", message: parse.error.message });
    return;
  }

  const [shop] = await db
    .insert(shopsTable)
    .values({
      ...parse.data,
      category: parse.data.category as any,
      status: "verified",
    })
    .returning();

  res.status(201).json({ ...shop, createdAt: shop.createdAt.toISOString() });
});

router.get("/admin/stats", requireAdmin, async (_req, res) => {
  const allUsers = await db.select().from(usersTable);
  const allShops = await db.select().from(shopsTable);

  const pendingUsers = allUsers.filter((u) => u.status === "pending").length;
  const pendingShops = allShops.filter((s) => s.status === "pending").length;
  const totalUsers = allUsers.filter((u) => u.role !== "admin").length;
  const totalCustomers = allUsers.filter((u) => u.role === "customer").length;
  const totalShopOwners = allUsers.filter((u) => u.role === "shop_owner").length;
  const verifiedShops = allShops.filter((s) => s.status === "verified").length;

  res.json({
    pendingUsers,
    pendingShops,
    totalUsers,
    totalShops: allShops.length,
    totalCustomers,
    totalShopOwners,
    verifiedShops,
  });
});

export default router;
