const API = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(init?.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || "Request failed");
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return data as T;
}

export const api = {
  health: () => request<{ ok: boolean; demoMode: boolean }>("/health"),
  products: (params?: Record<string, string | number | undefined>) => {
    const q = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== "") q.set(k, String(v));
    });
    const qs = q.toString();
    return request<{ products: Product[] }>(`/products${qs ? `?${qs}` : ""}`);
  },
  product: (id: string) => request<{ product: Product }>(`/products/${id}`),
  createProduct: (body: unknown) =>
    request<{ product: Product }>("/products", { method: "POST", body: JSON.stringify(body) }),
  categories: () => request<{ categories: Category[] }>("/products/categories"),
  artisans: () => request<{ artisans: Artisan[] }>("/products/artisans"),
  analyzeImage: (file: File | null, hint?: string) => {
    const fd = new FormData();
    if (file) fd.append("image", file);
    if (hint) fd.append("hint", hint);
    return request<{ analysis: ImageAnalysis; imageUrl?: string; demo: boolean }>("/ai/analyze-image", {
      method: "POST",
      body: fd
    });
  },
  enhanceImage: (url: string) =>
    request<{ originalUrl: string; enhancedUrl: string; operations: string[]; demo: boolean }>("/ai/enhance-image", {
      method: "POST",
      body: JSON.stringify({ url })
    }),
  transcribe: (text: string, language: string) =>
    request<TranscriptResult>("/ai/transcribe", {
      method: "POST",
      body: JSON.stringify({ text, language })
    }),
  generateDescription: (body: Record<string, string>) =>
    request<GeneratedDescription>("/ai/generate-description", { method: "POST", body: JSON.stringify(body) }),
  generateProduct: (body: Record<string, string>) =>
    request<GeneratedDescription>("/ai/generate-product", { method: "POST", body: JSON.stringify(body) }),
  suggestPrice: (body: Record<string, string>) =>
    request<PriceSuggestion>("/ai/suggest-price", { method: "POST", body: JSON.stringify(body) }),
  translate: (text: string, language: string) =>
    request<{ text: string; translated: string; language: string; demo: boolean }>("/ai/translate", {
      method: "POST",
      body: JSON.stringify({ text, language })
    }),
  research: (craft: string) => request<CraftResearch>("/ai/research", { method: "POST", body: JSON.stringify({ craft }) }),
  generatePromotion: (body: Record<string, string>) =>
    request<PromotionContent>("/ai/generate-promotion", { method: "POST", body: JSON.stringify(body) }),
  calculateDelivery: (body: Record<string, string>) =>
    request<DeliveryEstimate>("/ai/calculate-delivery", { method: "POST", body: JSON.stringify(body) }),
  demoStatus: () => request<{ demoMode: boolean; notice: string }>("/ai/status"),
  getCart: (guestId: string) => request<{ cart: Cart | null; subtotal: number }>(`/cart?guestId=${guestId}`),
  addToCart: (guestId: string, productId: string, quantity = 1) =>
    request<{ cart: Cart; subtotal: number }>("/cart", {
      method: "POST",
      body: JSON.stringify({ guestId, productId, quantity })
    }),
  updateCart: (guestId: string, productId: string, quantity: number) =>
    request<{ cart: Cart; subtotal: number }>("/cart", {
      method: "PUT",
      body: JSON.stringify({ guestId, productId, quantity })
    }),
  clearCart: (guestId: string) =>
    request<{ cart: Cart; subtotal: number }>("/cart", { method: "DELETE", body: JSON.stringify({ guestId }) }),
  createOrder: (body: Record<string, string>) =>
    request<{ order: Order; delivery: DeliveryEstimate }>("/orders", { method: "POST", body: JSON.stringify(body) }),
  getOrder: (id: string) => request<{ order: Order }>(`/orders/${id}`),
  createReview: (body: Record<string, string | number>) =>
    request<{ review: Review }>("/reviews", { method: "POST", body: JSON.stringify(body) })
};

export interface Product {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  material: string;
  craft: string;
  features: string[];
  artisanStory: string;
  basePrice: number;
  originState: string;
  originCity: string;
  size: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  popular: boolean;
  category: { id: string; slug: string; name: string; nameHi: string };
  seller: {
    id: string;
    craft: string;
    bio: string;
    originState: string;
    originCity: string;
    story: string;
    avatarUrl: string | null;
    user: { name: string };
  };
  images: { id: string; url: string; alt: string; isPrimary: boolean }[];
  reviews?: Review[];
  promotion?: { script: string; caption: string; hashtags: string[]; reelText: string } | null;
}

export interface Review {
  id: string;
  rating: number;
  text: string;
  createdAt: string;
  user: { name: string };
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  nameHi: string;
  description: string;
  _count?: { products: number };
}

export interface Artisan {
  id: string;
  craft: string;
  bio: string;
  originState: string;
  originCity: string;
  avatarUrl: string | null;
  user: { name: string };
}

export interface ImageAnalysis {
  productType: string;
  material: string;
  craft: string;
  colorPalette: string[];
  confidence: number;
  notes: string;
  demo: boolean;
}

export interface TranscriptResult {
  transcript: string;
  parsedPrice: number | null;
  demo: boolean;
  productName: string;
  material: string;
  duration: string;
  extra: string;
  category: string;
  categorySlug: string;
  craft: string;
  tags: string[];
}

export interface GeneratedDescription {
  title: string;
  description?: string;
  shortDescription: string;
  longDescription: string;
  story?: string;
  category?: string;
  categorySlug?: string;
  craft: string;
  craftType?: string;
  material: string;
  tags?: string[];
  suggestedPrice?: number;
  image?: string | null;
  features: string[];
  artisanStory: string;
  demo: boolean;
}

export interface PriceSuggestion {
  suggestedPrice: number;
  currency: string;
  rationale: string;
  demo: boolean;
}

export interface PromotionContent {
  reelText: string;
  script: string;
  caption: string;
  hashtags: string[];
  demo: boolean;
}

export interface DeliveryEstimate {
  originState: string;
  destinationState: string;
  size: string;
  baseFee: number;
  distanceFee: number;
  sizeFee: number;
  total: number;
  etaDays: number;
  demo: boolean;
}

export interface CraftResearch {
  craft: string;
  origin: string;
  history: string;
  techniques: string[];
  culturalNotes: string;
  demo: boolean;
}

export interface Cart {
  id: string;
  items: { id: string; quantity: number; product: Product }[];
}

export interface Order {
  id: string;
  buyerName: string;
  buyerState: string;
  buyerCity: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  createdAt: string;
  items: { id: string; quantity: number; unitPrice: number; title: string; productId: string }[];
}

export function guestId(): string {
  let id = localStorage.getItem("karigar.guest");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("karigar.guest", id);
  }
  return id;
}

export function formatInr(n: number) {
  return `Rs ${n.toLocaleString("en-IN")}`;
}
