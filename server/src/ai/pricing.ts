import { config } from "../utils/config.js";

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

const REGION: Record<string, string> = {
  "Andhra Pradesh": "south",
  Telangana: "south",
  Karnataka: "south",
  Kerala: "south",
  "Tamil Nadu": "south",
  Maharashtra: "west",
  Gujarat: "west",
  Goa: "west",
  Rajasthan: "west",
  "Madhya Pradesh": "central",
  Chhattisgarh: "central",
  Delhi: "north",
  Haryana: "north",
  Punjab: "north",
  "Himachal Pradesh": "north",
  Uttarakhand: "north",
  "Uttar Pradesh": "north",
  Bihar: "east",
  Jharkhand: "east",
  Odisha: "east",
  "West Bengal": "east",
  Assam: "northeast"
};

const SIZE_FEE: Record<string, number> = { small: 40, medium: 70, large: 120 };

export function calculateDelivery(input: {
  originState: string;
  destinationState: string;
  size?: string;
}): DeliveryEstimate {
  const size = (input.size || "medium").toLowerCase();
  const originRegion = REGION[input.originState] || "central";
  const destRegion = REGION[input.destinationState] || "central";
  const sameState = input.originState === input.destinationState;
  const sameRegion = originRegion === destRegion;
  const distanceFee = sameState ? 0 : sameRegion ? 60 : 140;
  const sizeFee = SIZE_FEE[size] ?? 70;
  const baseFee = 50;
  const total = baseFee + distanceFee + sizeFee;
  const etaDays = sameState ? 3 : sameRegion ? 5 : 8;
  return {
    originState: input.originState,
    destinationState: input.destinationState,
    size,
    baseFee,
    distanceFee,
    sizeFee,
    total,
    etaDays,
    demo: config.demoMode
  };
}
