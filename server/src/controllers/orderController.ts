import type { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import { cleanText } from "../utils/sanitize.js";
import { calculateDelivery } from "../ai/pricing.js";

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const buyerName = cleanText(req.body.buyerName, 80);
    const buyerState = cleanText(req.body.buyerState, 80);
    const buyerCity = cleanText(req.body.buyerCity, 80);
    const guestId = typeof req.body.guestId === "string" ? req.body.guestId : undefined;
    if (!buyerName) throw new AppError(400, "Buyer name is required");
    if (!buyerState) throw new AppError(400, "Delivery state is required");

    const email = guestId ? `guest-${guestId}@karigar.demo` : "ananya@karigar.demo";
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        cart: {
          include: {
            items: { include: { product: true } }
          }
        }
      }
    });
    if (!user?.cart || user.cart.items.length === 0) {
      throw new AppError(400, "Your cart is empty");
    }

    const items = user.cart.items;
    const subtotal = items.reduce(
      (s: number, i: { quantity: number; product: { basePrice: number } }) => s + i.quantity * i.product.basePrice,
      0
    );
    const first = items[0].product;
    const delivery = calculateDelivery({
      originState: first.originState,
      destinationState: buyerState,
      size: first.size
    });
    const extraItemsFee = Math.max(0, items.length - 1) * 30;
    const deliveryFee = delivery.total + extraItemsFee;
    const total = subtotal + deliveryFee;

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        buyerName,
        buyerState,
        buyerCity,
        subtotal,
        deliveryFee,
        total,
        status: "CONFIRMED",
        items: {
          create: items.map((i: { productId: string; quantity: number; product: { basePrice: number; title: string } }) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.product.basePrice,
            title: i.product.title
          }))
        }
      },
      include: { items: true }
    });

    await prisma.cartItem.deleteMany({ where: { cartId: user.cart.id } });
    res.status(201).json({ order, delivery });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });
    if (!order) throw new AppError(404, "Order not found");
    res.json({ order });
  } catch (err) {
    next(err);
  }
}
