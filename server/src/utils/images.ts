import { AppError } from "../middleware/errorHandler.js";

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif"
};

export function extensionForMime(mime: string): string | null {
  return ALLOWED_MIME[mime] || null;
}

export function isAllowedImageMime(mime: string): boolean {
  return Boolean(ALLOWED_MIME[mime]);
}

export function isPersistentImageUrl(url: string): boolean {
  const value = url.trim();
  if (!value) return false;
  if (/^(blob:|data:|javascript:|file:)/i.test(value)) return false;
  if (value.includes("..") || value.includes("\0")) return false;
  if (value.startsWith("/uploads/") || value.startsWith("/images/")) return true;
  return /^https?:\/\//i.test(value);
}

export function assertPersistentImageUrl(url: string): string {
  const value = url.trim();
  if (!isPersistentImageUrl(value)) {
    throw new AppError(400, "Product photos must be uploaded first. Temporary browser image URLs cannot be saved.");
  }
  return value;
}
