import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import {
  analyzeImageHandler,
  enhanceImageHandler,
  transcribeHandler,
  generateDescriptionHandler,
  researchHandler,
  generatePromotionHandler,
  calculateDeliveryHandler,
  demoStatus
} from "../controllers/aiController.js";
import { config } from "../utils/config.js";
import { AppError } from "../middleware/errorHandler.js";

const uploadRoot = path.resolve(process.cwd(), "..", config.uploadDir);
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxImageMb * 1024 * 1024, files: 3 },
  fileFilter: (_req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype);
    if (!ok) {
      cb(new AppError(400, "Only JPEG, PNG, WebP or GIF images are allowed"));
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
aiRoutes.post("/generate-description", generateDescriptionHandler);
aiRoutes.post("/research", researchHandler);
aiRoutes.post("/generate-promotion", generatePromotionHandler);
aiRoutes.post("/calculate-delivery", calculateDeliveryHandler);
