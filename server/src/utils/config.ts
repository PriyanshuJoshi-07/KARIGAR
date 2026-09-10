import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, "../../../.env") });

const port = Number(process.env.PORT || 3001);

export const config = {
  port,
  nodeEnv: process.env.NODE_ENV || "development",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  serverOrigin: process.env.SERVER_ORIGIN || process.env.PUBLIC_BASE_URL || `http://localhost:${port}`,
  demoMode: (process.env.DEMO_MODE || "true").toLowerCase() === "true",
  uploadDir: process.env.UPLOAD_DIR || "server/uploads",
  maxImageMb: Number(process.env.MAX_IMAGE_MB || 8)
};
