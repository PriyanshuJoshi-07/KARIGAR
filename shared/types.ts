export type AppLanguage =
  | "en"
  | "hi"
  | "bn"
  | "mr"
  | "te"
  | "ta"
  | "gu"
  | "kn"
  | "ml"
  | "pa"
  | "or"
  | "as"
  | "ur";

export type Role = "BUYER" | "SELLER";

export interface ImageAnalysis {
  productType: string;
  material: string;
  craft: string;
  colorPalette: string[];
  confidence: number;
  notes: string;
  demo: boolean;
}

export interface GeneratedDescription {
  title: string;
  shortDescription: string;
  longDescription: string;
  material: string;
  craft: string;
  features: string[];
  artisanStory: string;
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

export interface ProductDto {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  material: string;
  craft: string;
  features: string[];
  artisanStory: string;
  basePrice: number;
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
  originState: string;
  originCity: string;
  size: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  popular: boolean;
  images: { id: string; url: string; alt: string; isPrimary: boolean }[];
  reviews?: ReviewDto[];
  promotion?: PromotionContent | null;
}

export interface ReviewDto {
  id: string;
  rating: number;
  text: string;
  createdAt: string;
  user: { name: string };
}

export interface CartDto {
  id: string;
  items: {
    id: string;
    quantity: number;
    product: ProductDto;
  }[];
  subtotal: number;
}

export interface OrderDto {
  id: string;
  buyerName: string;
  buyerState: string;
  buyerCity: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    title: string;
    productId: string;
  }[];
}
