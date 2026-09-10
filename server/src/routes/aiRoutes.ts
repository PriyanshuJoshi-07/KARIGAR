import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { extensionForMime, isAllowedImageMime } from "../utils/images.js";
import {
  analyzeImageHandler,
  enhanceImageHandler,
  transcribeHandler,
  generateDescriptionHandler,
  generateProductHandler,
  suggestPriceHandler,
  translateHandler,
  researchHandler,
  generatePromotionHandler,
  calculateDeliveryHandler,
  demoStatus
} from "../controllers/aiController.js";
import { config } from "../utils/config.js";
import { AppError } from "../middleware/errorHandler.js";

const uploadRoot = path.resolve(process.cwd(), "..", config.uploadDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      fs.mkdirSync(uploadRoot, { recursive: true });
      cb(null, uploadRoot);
    } catch (err) {
      cb(err instanceof Error ? err : new Error("Failed to create upload directory"), uploadRoot);
    }
  },
  filename: (_req, file, cb) => {
    const ext = extensionForMime(file.mimetype) || ".jpg";
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxImageMb * 1024 * 1024, files: 3 },
  fileFilter: (_req, file, cb) => {
    if (!isAllowedImageMime(file.mimetype)) {
      cb(new AppError(400, "Only JPEG, PNG, WebP or GIF images are allowed"));
      return;
    }
    const original = path.basename(file.originalname || "");
    if (original.includes("..") || original.includes("/") || original.includes("\\")) {
      cb(new AppError(400, "Invalid image file name"));
      return;
    }
    cb(null, true);
  }
});

export const aiRoutes = Router();

aiRoutes.get("/status", demoStatus);
aiRoutes.post("/analyze-image", upload.single("image"), analyzeImageHandler);
aiRoutes.post("/enhance-image", enhanceImageHandler);
aiRoutes.post("/transcribe", transcribeHandler);
aiRoutes.post("/extract", transcribeHandler);
aiRoutes.post("/generate-description", generateDescriptionHandler);
aiRoutes.post("/generate-product", generateProductHandler);
aiRoutes.post("/suggest-price", suggestPriceHandler);
aiRoutes.post("/translate", translateHandler);
aiRoutes.post("/research", researchHandler);
aiRoutes.post("/generate-promotion", generatePromotionHandler);
aiRoutes.post("/calculate-delivery", calculateDeliveryHandler);
