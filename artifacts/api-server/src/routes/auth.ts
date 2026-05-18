import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth } from "../lib/auth";
import { RegisterUserBody, LoginUserBody } from "@workspace/api-zod";
import { sendAdminNewRegistrationAlert, sendPasswordResetEmail } from "../lib/mailer";

const router = Router();

router.post("/auth/register", async (req, res) => {
  const parse = RegisterUserBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "validation_error", message: parse.error.message });
    return;
  }
  const { name, email, password, phone, role, businessName, locality } = parse.data;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(409).json({ error: "conflict", message: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(usersTable)
    .values({
      name,
      email,
      passwordHash,
      phone: phone ?? null,
      role: role as "customer" | "shop_owner",
      status: "pending",
      businessName: businessName ?? null,
      locality: locality ?? null,
    })
    .returning();

  const token = signToken(user.id);
  const { passwordHash: _ph, ...safeUser } = user;

  sendAdminNewRegistrationAlert({
    userName: user.name,
    userEmail: user.email,
    role: user.role,
    businessName: user.businessName,
    locality: user.locality,
  }).catch(() => {});

  res.status(201).json({
    token,
    user: {
      ...safeUser,
      createdAt: safeUser.createdAt.toISOString(),
    },
  });
});

router.post("/auth/login", async (req, res) => {
  const parse = LoginUserBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "validation_error", message: parse.error.message });
    return;
  }
  const { email, password } = parse.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "unauthorized", message: "Invalid credentials" });
    return;
  }

  const token = signToken(user.id);
  const { passwordHash: _ph, ...safeUser } = user;

  res.json({
    token,
    user: {
      ...safeUser,
      createdAt: safeUser.createdAt.toISOString(),
    },
  });
});

router.post("/auth/forgot-password", async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email) {
    res.status(400).json({ error: "bad_request", message: "Email is required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  // Always respond 200 to prevent email enumeration
  if (!user) {
    res.json({ message: "If that email exists, a reset link has been sent." });
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db
    .update(usersTable)
    .set({ resetToken: token, resetTokenExpiry: expiry })
    .where(eq(usersTable.id, user.id));

  sendPasswordResetEmail({ userName: user.name, userEmail: user.email, resetToken: token }).catch(() => {});

  res.json({ message: "If that email exists, a reset link has been sent." });
});

router.post("/auth/reset-password", async (req, res) => {
  const { token, password } = req.body as { token?: string; password?: string };
  if (!token || !password) {
    res.status(400).json({ error: "bad_request", message: "Token and password are required" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "bad_request", message: "Password must be at least 8 characters" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.resetToken, token));
  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    res.status(400).json({ error: "bad_request", message: "Reset link is invalid or has expired. Please request a new one." });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db
    .update(usersTable)
    .set({ passwordHash, resetToken: null, resetTokenExpiry: null })
    .where(eq(usersTable.id, user.id));

  res.json({ message: "Password updated successfully." });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { passwordHash: _ph, ...safeUser } = user;
  res.json({
    ...safeUser,
    createdAt: safeUser.createdAt.toISOString(),
  });
});

export default router;
