import { config } from "../utils/config.js";

export interface PromotionContent {
  reelText: string;
  script: string;
  caption: string;
  hashtags: string[];
  demo: boolean;
}

export async function generatePromotion(input: {
  title: string;
  craft: string;
  artisanName?: string;
  originCity?: string;
  originState?: string;
  material?: string;
}): Promise<PromotionContent> {
  const who = input.artisanName || "the maker";
  const where = [input.originCity, input.originState].filter(Boolean).join(", ") || "India";
  const script = `Open on ${who} at work in ${where}. Cut to close-up of ${input.material || "the material"}. End on the finished ${input.title}. Voice: "Made by hand. Sold with a name."`;
  const caption = `${input.title} — ${input.craft} by ${who} in ${where}. Honest materials, fair price.`;
  const hashtags = ["#Karigar", "#HandmadeIndia", `#${input.craft.replace(/\s+/g, "")}`, "#ArtisanMade", "#CraftNotFactory"];
  const reelText = `${input.title}\n${who} · ${where}\n${input.craft}`;
  return {
    reelText,
    script,
    caption,
    hashtags,
    demo: config.demoMode || !process.env.OPENAI_API_KEY
  };
}
