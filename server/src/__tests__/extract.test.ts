import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { extractDetailsFromTranscript } from "../ai/extract.js";
import { generateDescription } from "../ai/description.js";
import { suggestPrice } from "../ai/pricing.js";

const FLOWER =
  "This is a flower pot. It is made of clay and sand. It takes about 10 days to make. It is strong and usable.";
const BASKET =
  "This is a bamboo basket made by hand. It takes two days to make and is useful for storage.";

describe("transcript extraction", () => {
  it("extracts flower pot details from spoken words", () => {
    const d = extractDetailsFromTranscript(FLOWER);
    assert.equal(d.productName.toLowerCase(), "flower pot");
    assert.match(d.material.toLowerCase(), /clay and sand/);
    assert.match(d.duration.toLowerCase(), /10 days/);
    assert.match(d.extra.toLowerCase(), /strong and usable/);
    assert.equal(d.categorySlug, "pottery");
    assert.match(d.craft.toLowerCase(), /potter/);
  });

  it("extracts bamboo basket details from spoken words", () => {
    const d = extractDetailsFromTranscript(BASKET);
    assert.match(d.productName.toLowerCase(), /bamboo basket/);
    assert.match(d.material.toLowerCase(), /bamboo/);
    assert.match(d.duration.toLowerCase(), /two days|2 days/);
    assert.match(d.extra.toLowerCase(), /storage/);
    assert.equal(d.categorySlug, "baskets");
    assert.match(d.craft.toLowerCase(), /weav/);
  });

  it("does not pick a hardcoded product from transcript length", () => {
    const short = extractDetailsFromTranscript("This is a brass lamp.");
    const long = extractDetailsFromTranscript(FLOWER);
    assert.match(short.productName.toLowerCase(), /brass lamp|lamp/);
    assert.match(long.productName.toLowerCase(), /flower pot/);
    assert.notEqual(short.productName.toLowerCase(), long.productName.toLowerCase());
  });
});

describe("generated catalog from speech", () => {
  it("builds flower pot listing from the actual transcript", async () => {
    const d = await generateDescription({ transcript: FLOWER });
    assert.match(d.title.toLowerCase(), /flower pot/);
    assert.match(d.description.toLowerCase(), /clay and sand/);
    assert.match(d.story.toLowerCase(), /potter|artisan/);
    assert.equal(d.categorySlug, "pottery");
    assert.match(d.craftType.toLowerCase(), /potter/);
    assert.match(d.material.toLowerCase(), /clay and sand/);
    assert.ok(d.tags.length > 0);
    assert.ok(d.suggestedPrice > 0);
    assert.match(d.longDescription.toLowerCase(), /strong and usable|10 days/);
  });

  it("builds bamboo basket listing that reflects storage use", async () => {
    const d = await generateDescription({ transcript: BASKET });
    assert.match(d.title.toLowerCase(), /bamboo basket/);
    assert.match(d.material.toLowerCase(), /bamboo/);
    assert.match(`${d.description} ${d.longDescription}`.toLowerCase(), /storage/);
    assert.match(d.craft.toLowerCase(), /weav/);
  });

  it("suggests a price from extracted details", () => {
    const flower = extractDetailsFromTranscript(FLOWER);
    const price = suggestPrice({
      productName: flower.productName,
      material: flower.material,
      craft: flower.craft,
      categorySlug: flower.categorySlug,
      duration: flower.duration
    });
    assert.ok(price.suggestedPrice >= 150);
    assert.equal(price.currency, "INR");
  });
});
