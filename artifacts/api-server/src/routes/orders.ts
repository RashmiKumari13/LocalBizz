import { Router } from "express";
import { db, ordersTable, orderItemsTable, productsTable, shopsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireShopOwnerOrAdmin } from "../lib/auth";
import { CreateOrderBody, UpdateOrderStatusBody } from "@workspace/api-zod";

const router = Router();

router.get("/orders", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const orders = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.userId, user.id))
    .orderBy(desc(ordersTable.createdAt));

  const enrichedOrders = await Promise.all(
    orders.map(async (order) => {
      const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
      return { ...order, items, createdAt: order.createdAt.toISOString() };
    })
  );

  res.json(enrichedOrders);
});

router.post("/orders", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const parse = CreateOrderBody.safeParse(req.body);
  
  if (!parse.success) {
    res.status(400).json({ error: "validation_error", message: parse.error.message });
    return;
  }

  const { shopId, deliveryAddress, items } = parse.data;

  // Validate items and calculate total amount
  let totalAmount = 0;
  const orderItemsData = [];

  for (const item of items) {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    if (!product || !product.available) {
      res.status(400).json({ error: "bad_request", message: `Product ${item.productId} is not available.` });
      return;
    }
    if (product.shopId !== shopId) {
      res.status(400).json({ error: "bad_request", message: `Product ${item.productId} does not belong to shop ${shopId}.` });
      return;
    }
    
    totalAmount += product.price * item.quantity;
    orderItemsData.push({
      productId: product.id,
      quantity: item.quantity,
      priceAtTime: product.price,
    });
  }

  if (orderItemsData.length === 0) {
    res.status(400).json({ error: "bad_request", message: "Order must contain at least one item." });
    return;
  }

  // Create Order
  const [order] = await db
    .insert(ordersTable)
    .values({
      userId: user.id,
      shopId,
      totalAmount,
      deliveryAddress,
      status: "pending",
    })
    .returning();

  // Create Order Items
  const itemsWithOrderId = orderItemsData.map((data) => ({
    ...data,
    orderId: order.id,
  }));
  
  const createdItems = await db.insert(orderItemsTable).values(itemsWithOrderId).returning();

  res.status(201).json({ ...order, items: createdItems, createdAt: order.createdAt.toISOString() });
});

router.patch("/orders/:orderId/status", requireShopOwnerOrAdmin, async (req, res) => {
  const orderId = parseInt(String(req.params.orderId));
  if (isNaN(orderId)) {
    res.status(400).json({ error: "bad_request", message: "Invalid orderId" });
    return;
  }

  const parse = UpdateOrderStatusBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "validation_error", message: parse.error.message });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) {
    res.status(404).json({ error: "not_found", message: "Order not found" });
    return;
  }

  const user = (req as any).user;
  if (user.role !== "admin") {
    // Check if shop owner owns the shop for this order
    const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.id, order.shopId));
    if (!shop || shop.ownerId !== user.id) {
      res.status(403).json({ error: "forbidden", message: "Not authorized to update this order" });
      return;
    }
  }

  const [updatedOrder] = await db
    .update(ordersTable)
    .set({ status: parse.data.status as any })
    .where(eq(ordersTable.id, orderId))
    .returning();

  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));

  res.json({ ...updatedOrder, items, createdAt: updatedOrder.createdAt.toISOString() });
});

export default router;
