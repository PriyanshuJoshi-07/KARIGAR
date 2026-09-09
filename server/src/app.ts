import express from "express";
import cors from "cors";
import path from "node:path";
import { productRoutes } from "./routes/productRoutes.js";
import { aiRoutes } from "./routes/aiRoutes.js";
import { cartRoutes } from "./routes/cartRoutes.js";
import { orderRoutes } from "./routes/orderRoutes.js";
import { reviewRoutes } from "./routes/reviewRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { config } from "./utils/config.js";

export function createApp() {
  const app = express();
  app.use(
    cors({
      origin: [config.clientOrigin, "http://localhost:5173", "http://127.0.0.1:5173"],
      credentials: true
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  const uploadRoot = path.resolve(process.cwd(), "..", config.uploadDir);
  app.use("/uploads", express.static(uploadRoot));
  app.use("/images", express.static(path.resolve(process.cwd(), "../client/public/images")));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, demoMode: config.demoMode, name: "KARIGAR" });
  });

  app.use("/api/products", productRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/reviews", reviewRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
