import { db } from "./index";
import { usersTable } from "./schema/users";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function createTestUsers() {
  console.log("Creating test users...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // Check if admin exists
  const [existingAdmin] = await db.select().from(usersTable).where(eq(usersTable.email, "admin@localbiz.com"));
  if (!existingAdmin) {
    await db.insert(usersTable).values({
      name: "Admin User",
      email: "admin@localbiz.com",
      passwordHash,
      role: "admin",
      status: "verified",
    });
    console.log("Admin user created: admin@localbiz.com / password123");
  }

  // Check if customer exists
  const [existingCustomer] = await db.select().from(usersTable).where(eq(usersTable.email, "customer@localbiz.com"));
  if (!existingCustomer) {
    await db.insert(usersTable).values({
      name: "Test Customer",
      email: "customer@localbiz.com",
      passwordHash,
      role: "customer",
      status: "verified",
    });
    console.log("Customer user created: customer@localbiz.com / password123");
  }

  console.log("Done.");
}

createTestUsers().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
