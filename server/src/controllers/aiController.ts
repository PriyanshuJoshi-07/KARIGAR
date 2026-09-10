import type { Request, Response, NextFunction } from "express";
import { analyzeImage } from "../ai/vision.js";
import { enhanceImage } from "../ai/imageEnhancement.js";
import { transcribe } from "../ai/speech.js";
import { generateDescription } from "../ai/description.js";
import { researchCraft } from "../ai/research.js";
import { generatePromotion } from "../ai/promotion.js";
import { calculateDelivery, suggestPrice } from "../ai/pricing.js";
import { extractDetailsFromTranscript } from "../ai/extract.js";
import { AppError } from "../middleware/errorHandler.js";
import { cleanText } from "../utils/sanitize.js";
import { config } from "../utils/config.js";
import { assertPersistentImageUrl } from "../utils/images.js";

export async function analyzeImageHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    const hint = cleanText(req.body?.hint || req.body?.productHint, 120);
    if (!file && !hint) {
      throw new AppError(400, "Upload a photo or provide a product hint");
    }
    const result = await analyzeImage({ filename: file?.originalname, hint });
    const imageUrl = file ? new URL(`/uploads/${file.filename}`, config.serverOrigin).toString() : undefined;
    res.json({ analysis: result, imageUrl, demo: result.demo });
  } catch (err) {
    next(err);
  }
}

export async function enhanceImageHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const url = assertPersistentImageUrl(cleanText(req.body?.url, 500));
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

function descriptionInput(body: Record<string, unknown>) {
  const transcript = cleanText(body.transcript ?? body.text, 2000);
  const extracted = extractDetailsFromTranscript(transcript);
  return {
    transcript,
    productName: extracted.productName || cleanText(body.productName, 160),
    material: extracted.material || cleanText(body.material, 120),
    duration: extracted.duration || cleanText(body.duration, 80),
    extra: extracted.extra || cleanText(body.extra, 500),
    productType: extracted.productName || cleanText(body.productType, 80),
    craft: extracted.craft || cleanText(body.craft, 80),
    artisanName: cleanText(body.artisanName, 80),
    originCity: cleanText(body.originCity, 80),
    originState: cleanText(body.originState, 80),
    imageUrl: cleanText(body.imageUrl ?? body.image, 500),
    size: cleanText(body.size, 20)
  };
}

export async function generateDescriptionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as Record<string, unknown>;
    const input = descriptionInput(body);
    if (!input.productName && !input.productType && !input.material && !input.transcript) {
      throw new AppError(400, "Share product name, material, transcript or type to generate a description");
    }
    const result = await generateDescription(input);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function generateProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as Record<string, unknown>;
    const input = descriptionInput(body);
    if (!input.productName && !input.material && !input.transcript) {
      throw new AppError(400, "Share a transcript or product details to generate the listing");
    }
    const result = await generateDescription(input);
    res.json({
      title: result.title,
      description: result.description,
      story: result.story,
      category: result.category,
      craftType: result.craftType,
      craft: result.craft,
      material: result.material,
      tags: result.tags,
      suggestedPrice: result.suggestedPrice,
      image: result.image || input.imageUrl || null,
      shortDescription: result.shortDescription,
      longDescription: result.longDescription,
      artisanStory: result.artisanStory,
      features: result.features,
      categorySlug: result.categorySlug,
      demo: result.demo
    });
  } catch (err) {
    next(err);
  }
}

export async function suggestPriceHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as Record<string, unknown>;
    const transcript = cleanText(body.transcript ?? body.text, 2000);
    const extracted = extractDetailsFromTranscript(transcript);
    const productName = cleanText(body.productName, 160) || extracted.productName;
    const material = cleanText(body.material, 120) || extracted.material;
    if (!productName && !material && !transcript) {
      throw new AppError(400, "Share product details to suggest a price");
    }
    const result = suggestPrice({
      productName,
      material,
      craft: cleanText(body.craft, 80) || extracted.craft,
      categorySlug: cleanText(body.categorySlug, 40) || extracted.categorySlug,
      duration: cleanText(body.duration, 80) || extracted.duration,
      extra: cleanText(body.extra, 500) || extracted.extra,
      size: cleanText(body.size, 20)
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function translateHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const text = cleanText(req.body?.text ?? req.body?.q, 2000);
    const language = cleanText(req.body?.language ?? req.body?.target, 8) || "en";
    if (!text) throw new AppError(400, "Text to translate is required");
    res.json({
      text,
      translated: text,
      language,
      demo: true,
      notice: "Demo translation returns the original text so the walkthrough works without a paid provider."
    });
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
