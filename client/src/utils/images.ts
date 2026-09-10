export function isPersistentImageUrl(url: string | undefined | null): boolean {
  const value = (url || "").trim();
  if (!value) return false;
  if (/^(blob:|data:|javascript:|file:)/i.test(value)) return false;
  if (value.includes("..")) return false;
  return value.startsWith("/uploads/") || value.startsWith("/images/") || /^https?:\/\//i.test(value);
}

export function revokeIfBlob(url: string | undefined | null) {
  if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
}
