import type { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import { cleanText } from "../utils/sanitize.js";
import { assertPersistentImageUrl } from "../utils/images.js";

const productInclude = {
  category: true,
  seller: { include: { user: { select: { name: true } } } },
  images: { orderBy: { sortOrder: "asc" as const } },
  promotion: true
};

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const category = typeof req.query.category === "string" ? req.query.category : "";
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const minRating = req.query.minRating ? Number(req.query.minRating) : undefined;

    const products = await prisma.product.findMany({
      where: {
        AND: [
          q
            ? {
                OR: [
                  { title: { contains: q, mode: "insensitive" } },
                  { material: { contains: q, mode: "insensitive" } },
                  { craft: { contains: q, mode: "insensitive" } },
                  { category: { name: { contains: q, mode: "insensitive" } } }
                ]
              }
            : {},
          category ? { category: { slug: category } } : {},
          minPrice !== undefined && Number.isFinite(minPrice) ? { basePrice: { gte: minPrice } } : {},
          maxPrice !== undefined && Number.isFinite(maxPrice) ? { basePrice: { lte: maxPrice } } : {},
          minRating !== undefined && Number.isFinite(minRating) ? { rating: { gte: minRating } } : {}
        ]
      },
      include: productInclude,
      orderBy: [{ featured: "desc" }, { popular: "desc" }, { createdAt: "desc" }]
    });
    res.json({ products });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = typeof req.params.id === "string" ? req.params.id : "";
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        ...productInclude,
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" }
        }
      }
    });
    if (!product) throw new AppError(404, "Product not found");
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as Record<string, unknown>;
    const title = cleanText(body.title, 160);
    const shortDescription = cleanText(body.shortDescription, 280);
    const longDescription = cleanText(body.longDescription, 4000);
    const material = cleanText(body.material, 120);
    const craft = cleanText(body.craft, 120);
    const artisanStory = cleanText(body.artisanStory, 2000);
    const originState = cleanText(body.originState, 80) || "Maharashtra";
    const originCity = cleanText(body.originCity, 80) || "Pune";
    const size = cleanText(body.size, 20) || "medium";
    const basePrice = Number(body.basePrice);
    const sellerName = cleanText(body.sellerName, 80) || "Guest artisan";
    const sellerEmail = cleanText(body.sellerEmail, 120);
    const categorySlug = cleanText(body.categorySlug, 40) || "baskets";
    const features = Array.isArray(body.features)
      ? (body.features as unknown[]).map((f) => cleanText(f, 120)).filter(Boolean)
      : [];
    const images = Array.isArray(body.images)
      ? (body.images as { url?: string; alt?: string }[]).map((img, i) => ({
          url: assertPersistentImageUrl(cleanText(img.url, 500)),
          alt: cleanText(img.alt, 160) || title,
          isPrimary: i === 0,
          sortOrder: i
        }))
      : [];

    if (!title) throw new AppError(400, "Product title is required");
    if (!Number.isFinite(basePrice) || basePrice <= 0) throw new AppError(400, "Enter a valid price");
    if (images.length < 1) throw new AppError(400, "Add at least one product photo");
    if (images.length > 3) throw new AppError(400, "You can add up to 3 photos");

    let category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) {
      category = await prisma.category.findFirst();
    }
    if (!category) throw new AppError(500, "No categories available");

    const email = sellerEmail || `artisan-${Date.now()}@karigar.demo`;
    let user = await prisma.user.findUnique({
      where: { email },
      include: { sellerProfile: true }
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: sellerName,
          email,
          password: "demo-hashed",
          role: "SELLER",
          sellerProfile: {
            create: {
              craft,
              bio: artisanStory.slice(0, 280) || `${sellerName} is a practising artisan.`,
              originState,
              originCity,
              story: artisanStory || `${sellerName} works from ${originCity}.`
            }
          }
        },
        include: { sellerProfile: true }
      });
    }
    if (!user.sellerProfile) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          sellerProfile: {
            create: {
              craft,
              bio: artisanStory.slice(0, 280),
              originState,
              originCity,
              story: artisanStory
            }
          }
        },
        include: { sellerProfile: true }
      });
    }

    const promotion = body.promotion as
      | { script?: string; caption?: string; hashtags?: string[]; reelText?: string }
      | undefined;

    const product = await prisma.product.create({
      data: {
        title,
        shortDescription: shortDescription || title,
        longDescription: longDescription || shortDescription || title,
        material: material || "Natural material",
        craft: craft || "Handmade",
        features,
        artisanStory: artisanStory || `${sellerName} made this by hand in ${originCity}.`,
        basePrice: Math.round(basePrice),
        categoryId: category.id,
        sellerId: user.sellerProfile!.id,
        originState,
        originCity,
        size,
        images: { create: images },
        promotion: promotion
          ? {
              create: {
                script: cleanText(promotion.script, 2000) || "",
                caption: cleanText(promotion.caption, 500) || title,
                hashtags: Array.isArray(promotion.hashtags) ? promotion.hashtags.map((h) => cleanText(h, 40)) : [],
                reelText: cleanText(promotion.reelText, 400) || title
              }
            }
          : undefined
      },
      include: productInclude
    });

    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = typeof req.params.id === "string" ? req.params.id : "";
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) throw new AppError(404, "Product not found");
    const body = req.body as Record<string, unknown>;
    const data: Record<string, unknown> = {};
    if (body.title) data.title = cleanText(body.title, 160);
    if (body.shortDescription) data.shortDescription = cleanText(body.shortDescription, 280);
    if (body.longDescription) data.longDescription = cleanText(body.longDescription, 4000);
    if (body.material) data.material = cleanText(body.material, 120);
    if (body.craft) data.craft = cleanText(body.craft, 120);
    if (body.artisanStory) data.artisanStory = cleanText(body.artisanStory, 2000);
    if (body.basePrice !== undefined) {
      const price = Number(body.basePrice);
      if (!Number.isFinite(price) || price <= 0) throw new AppError(400, "Enter a valid price");
      data.basePrice = Math.round(price);
    }
    const product = await prisma.product.update({
      where: { id: productId },
      data,
      include: productInclude
    });
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = typeof req.params.id === "string" ? req.params.id : "";
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) throw new AppError(404, "Product not found");
    await prisma.product.delete({ where: { id: productId } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function listCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" }
    });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

export async function featuredArtisans(_req: Request, res: Response, next: NextFunction) {
  try {
    const artisans = await prisma.sellerProfile.findMany({
      include: {
        user: { select: { name: true } },
        products: { select: { id: true }, take: 1 }
      },
      take: 8
    });
    res.json({ artisans });
  } catch (err) {
    next(err);
  }
}
