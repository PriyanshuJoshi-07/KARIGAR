import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateDelivery } from "../ai/pricing.js";
import { parsePriceFromSpeech } from "../utils/sanitize.js";
import { generateDescription } from "../ai/description.js";

describe("delivery estimate", () => {
  it("charges less for same-state delivery", () => {
    const same = calculateDelivery({ originState: "Assam", destinationState: "Assam", size: "medium" });
    const far = calculateDelivery({ originState: "Assam", destinationState: "Kerala", size: "medium" });
    assert.equal(same.distanceFee, 0);
    assert.ok(far.total > same.total);
    assert.ok(far.etaDays > same.etaDays);
  });

  it("applies size fees", () => {
    const small = calculateDelivery({ originState: "Delhi", destinationState: "Delhi", size: "small" });
    const large = calculateDelivery({ originState: "Delhi", destinationState: "Delhi", size: "large" });
    assert.equal(small.sizeFee, 40);
    assert.equal(large.sizeFee, 120);
  });
});

describe("speech price parse", () => {
  it("reads rupees from voice text", () => {
    assert.equal(parsePriceFromSpeech("800 rupees"), 800);
    assert.equal(parsePriceFromSpeech("बारह सौ 1200 रुपये"), 1200);
    assert.equal(parsePriceFromSpeech("no number"), null);
  });
});

describe("description generator", () => {
  it("uses supplied product data", async () => {
    const d = await generateDescription({
      productName: "Cane Basket",
      material: "Cane",
      craft: "Weaving",
      artisanName: "Meera",
      originCity: "Silchar"
    });
    assert.match(d.title, /Cane Basket/);
    assert.match(d.longDescription, /Cane/);
    assert.equal(d.demo, true);
  });
});
