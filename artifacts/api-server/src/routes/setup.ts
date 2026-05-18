import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/setup/admin", async (req, res) => {
  const { setupKey, email, password, name } = req.body as {
    setupKey?: string;
    email?: string;
    password?: string;
    name?: string;
  };

  const expectedKey = process.env.ADMIN_SETUP_KEY;
  if (!expectedKey || setupKey !== expectedKey) {
    res.status(403).json({ error: "forbidden", message: "Invalid setup key" });
    return;
  }

  if (!email || !password || !name) {
    res.status(400).json({ error: "bad_request", message: "email, password and name are required" });
    return;
  }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    if (existing.role === "admin") {
      res.json({ message: "Admin already exists", email: existing.email });
      return;
    }
    await db.update(usersTable).set({ role: "admin", status: "verified" }).where(eq(usersTable.id, existing.id));
    res.json({ message: "Existing user promoted to admin", email });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(usersTable).values({
    name,
    email,
    passwordHash,
    role: "admin",
    status: "verified",
  });

  res.status(201).json({ message: "Admin account created successfully", email });
});

export default router;
