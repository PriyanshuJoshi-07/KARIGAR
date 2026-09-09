import type { Request, Response, NextFunction } from "express";
import { analyzeImage } from "../ai/vision.js";
import { enhanceImage } from "../ai/imageEnhancement.js";
import { transcribe } from "../ai/speech.js";
import { generateDescription } from "../ai/description.js";
import { researchCraft } from "../ai/research.js";
import { generatePromotion } from "../ai/promotion.js";
import { calculateDelivery } from "../ai/pricing.js";
import { AppError } from "../middleware/errorHandler.js";
import { cleanText } from "../utils/sanitize.js";
import { config } from "../utils/config.js";

export async function analyzeImageHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    const hint = cleanText(req.body?.hint || req.body?.productHint, 120);
    if (!file && !hint) {
      throw new AppError(400, "Upload a photo or provide a product hint");
    }
    const result = await analyzeImage({ filename: file?.originalname, hint });
    const imageUrl = file ? `/uploads/${file.filename}` : undefined;
    res.json({ analysis: result, imageUrl, demo: result.demo });
  } catch (err) {
    next(err);
  }
}

export async function enhanceImageHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const url = cleanText(req.body?.url, 500);
    if (!url) throw new AppError(400, "Image URL is required");
    const result = await enhanceImage(url);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function transcribeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const text = cleanText(req.body?.text, 2000);
    const language = cleanText(req.body?.language, 8) || "hi";
    if (!text) throw new AppError(400, "No speech text received. Try again or type the details.");
    const result = await transcribe({ text, language });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function generateDescriptionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as Record<string, string>;
    if (!body.productName && !body.productType && !body.material) {
      throw new AppError(400, "Share product name, material or type to generate a description");
    }
    const result = await generateDescription({
      productName: cleanText(body.productName, 160),
      material: cleanText(body.material, 120),
      duration: cleanText(body.duration, 80),
      extra: cleanText(body.extra, 500),
      productType: cleanText(body.productType, 80),
      craft: cleanText(body.craft, 80),
      artisanName: cleanText(body.artisanName, 80),
      originCity: cleanText(body.originCity, 80),
      originState: cleanText(body.originState, 80)
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function researchHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const craft = cleanText(req.body?.craft, 80);
    if (!craft) throw new AppError(400, "Craft name is required");
    const result = await researchCraft(craft);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function generatePromotionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const title = cleanText(req.body?.title, 160);
    const craft = cleanText(req.body?.craft, 80);
    if (!title) throw new AppError(400, "Product title is required");
    const result = await generatePromotion({
      title,
      craft: craft || "handmade craft",
      artisanName: cleanText(req.body?.artisanName, 80),
      originCity: cleanText(req.body?.originCity, 80),
      originState: cleanText(req.body?.originState, 80),
      material: cleanText(req.body?.material, 120)
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function calculateDeliveryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const originState = cleanText(req.body?.originState, 80);
    const destinationState = cleanText(req.body?.destinationState, 80);
    const size = cleanText(req.body?.size, 20) || "medium";
    if (!originState || !destinationState) {
      throw new AppError(400, "Origin and destination states are required");
    }
    const result = calculateDelivery({ originState, destinationState, size });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export function demoStatus(_req: Request, res: Response) {
  res.json({
    demoMode: config.demoMode,
    notice: config.demoMode
      ? "Running in demo mode. Image, speech and copy features use on-device and sample logic, not live commercial AI APIs."
      : "Live AI providers may be used when keys are configured."
  });
}
