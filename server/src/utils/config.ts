import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, "../../../.env") });

export const config = {
  port: Number(process.env.PORT || 3001),
  nodeEnv: process.env.NODE_ENV || "development",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  demoMode: (process.env.DEMO_MODE || "true").toLowerCase() === "true",
  uploadDir: process.env.UPLOAD_DIR || "server/uploads",
  maxImageMb: Number(process.env.MAX_IMAGE_MB || 8)
};
