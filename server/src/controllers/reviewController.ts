import type { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import { cleanText } from "../utils/sanitize.js";

export async function createReview(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = cleanText(req.body.productId, 80);
    const text = cleanText(req.body.text, 1000);
    const rating = Number(req.body.rating);
    const guestId = typeof req.body.guestId === "string" ? req.body.guestId : undefined;
    const reviewerName = cleanText(req.body.reviewerName, 80) || "Guest buyer";
    if (!productId) throw new AppError(400, "Product is required");
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new AppError(400, "Rating must be between 1 and 5 stars");
    }
    if (!text) throw new AppError(400, "Please write a short review");

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError(404, "Product not found");

    const email = guestId ? `guest-${guestId}@karigar.demo` : `reviewer-${Date.now()}@karigar.demo`;
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: reviewerName,
          email,
          password: "demo-hashed",
          role: "BUYER",
          buyerProfile: { create: {} }
        }
      });
    }

    const review = await prisma.review.create({
      data: { productId, userId: user.id, rating, text },
      include: { user: { select: { name: true } } }
    });

    const agg = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true }
    });
    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round((agg._avg.rating || 0) * 10) / 10,
        reviewCount: agg._count.rating
      }
    });

    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
}
