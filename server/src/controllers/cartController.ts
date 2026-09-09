import type { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

async function resolveBuyer(guestId?: string) {
  const email = guestId ? `guest-${guestId}@karigar.demo` : "ananya@karigar.demo";
  let user = await prisma.user.findUnique({ where: { email }, include: { cart: true } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Guest buyer",
        email,
        password: "demo-hashed",
        role: "BUYER",
        buyerProfile: { create: {} }
      },
      include: { cart: true }
    });
  }
  if (!user.cart) {
    const cart = await prisma.cart.create({ data: { userId: user.id } });
    return { user, cartId: cart.id };
  }
  return { user, cartId: user.cart.id };
}

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          images: true,
          category: true,
          seller: { include: { user: { select: { name: true } } } }
        }
      }
    }
  }
};

export async function getCart(req: Request, res: Response, next: NextFunction) {
  try {
    const guestId = typeof req.query.guestId === "string" ? req.query.guestId : undefined;
    const { cartId } = await resolveBuyer(guestId);
    const cart = await prisma.cart.findUnique({ where: { id: cartId }, include: cartInclude });
    const subtotal =
      cart?.items.reduce((s: number, i: { quantity: number; product: { basePrice: number } }) => s + i.quantity * i.product.basePrice, 0) ?? 0;
    res.json({ cart, subtotal });
  } catch (err) {
    next(err);
  }
}

export async function addToCart(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = String(req.body.productId || "");
    const quantity = Math.max(1, Number(req.body.quantity || 1));
    const guestId = typeof req.body.guestId === "string" ? req.body.guestId : undefined;
    if (!productId) throw new AppError(400, "Product is required");
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError(404, "Product not found");
    const { cartId } = await resolveBuyer(guestId);
    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId, productId } },
      update: { quantity: { increment: quantity } },
      create: { cartId, productId, quantity }
    });
    const cart = await prisma.cart.findUnique({ where: { id: cartId }, include: cartInclude });
    const subtotal =
      cart?.items.reduce((s: number, i: { quantity: number; product: { basePrice: number } }) => s + i.quantity * i.product.basePrice, 0) ?? 0;
    res.status(201).json({ cart, subtotal });
  } catch (err) {
    next(err);
  }
}

export async function updateCart(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = String(req.body.productId || "");
    const quantity = Number(req.body.quantity);
    const guestId = typeof req.body.guestId === "string" ? req.body.guestId : undefined;
    if (!productId) throw new AppError(400, "Product is required");
    if (!Number.isFinite(quantity) || quantity < 0) throw new AppError(400, "Quantity is invalid");
    const { cartId } = await resolveBuyer(guestId);
    if (quantity === 0) {
      await prisma.cartItem.deleteMany({ where: { cartId, productId } });
    } else {
      await prisma.cartItem.updateMany({ where: { cartId, productId }, data: { quantity } });
    }
    const cart = await prisma.cart.findUnique({ where: { id: cartId }, include: cartInclude });
    const subtotal =
      cart?.items.reduce((s: number, i: { quantity: number; product: { basePrice: number } }) => s + i.quantity * i.product.basePrice, 0) ?? 0;
    res.json({ cart, subtotal });
  } catch (err) {
    next(err);
  }
}

export async function clearCart(req: Request, res: Response, next: NextFunction) {
  try {
    const guestId = typeof req.body.guestId === "string" ? req.body.guestId : undefined;
    const { cartId } = await resolveBuyer(guestId);
    await prisma.cartItem.deleteMany({ where: { cartId } });
    const cart = await prisma.cart.findUnique({ where: { id: cartId }, include: cartInclude });
    res.json({ cart, subtotal: 0 });
  } catch (err) {
    next(err);
  }
}
