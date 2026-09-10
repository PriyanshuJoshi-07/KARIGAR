import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../app.js";

const app = createApp();

describe("API health and catalog", () => {
  let productId = "";

  before(async () => {
    const res = await request(app).get("/api/products");
    if (res.status === 200 && res.body.products?.[0]) {
      productId = res.body.products[0].id;
    }
  });

  it("health check", async () => {
    const res = await request(app).get("/api/health");
    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
  });

  it("lists products when database is ready", async () => {
    const res = await request(app).get("/api/products");
    if (res.status !== 200) return;
    assert.ok(Array.isArray(res.body.products));
    assert.ok(res.body.products.length >= 6);
  });

  it("rejects empty description requests", async () => {
    const res = await request(app).post("/api/ai/generate-description").send({});
    assert.equal(res.status, 400);
  });

  it("generates a demo description", async () => {
    const res = await request(app).post("/api/ai/generate-description").send({
      productName: "Test Basket",
      material: "Bamboo",
      craft: "Weaving"
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.demo, true);
    assert.ok(res.body.title);
  });

  it("extracts spoken product fields from transcript", async () => {
    const res = await request(app).post("/api/ai/transcribe").send({
      text: "This is a flower pot. It is made of clay and sand. It takes about 10 days to make. It is strong and usable.",
      language: "en"
    });
    assert.equal(res.status, 200);
    assert.match(res.body.productName.toLowerCase(), /flower pot/);
    assert.match(res.body.material.toLowerCase(), /clay and sand/);
    assert.match(res.body.duration.toLowerCase(), /10 days/);
    assert.match(res.body.extra.toLowerCase(), /strong and usable/);
  });

  it("generate-product uses the actual transcript", async () => {
    const res = await request(app).post("/api/ai/generate-product").send({
      transcript:
        "This is a flower pot. It is made of clay and sand. It takes about 10 days to make. It is strong and usable."
    });
    assert.equal(res.status, 200);
    assert.match(res.body.title.toLowerCase(), /flower pot/);
    assert.match(String(res.body.description).toLowerCase(), /clay and sand/);
    assert.ok(res.body.suggestedPrice > 0);
    assert.ok(res.body.category);
    assert.ok(res.body.craftType || res.body.craft);
    assert.ok(Array.isArray(res.body.tags));
  });

  it("suggests a price from speech details", async () => {
    const res = await request(app).post("/api/ai/suggest-price").send({
      transcript: "This is a bamboo basket made by hand. It takes two days to make and is useful for storage."
    });
    assert.equal(res.status, 200);
    assert.ok(res.body.suggestedPrice > 0);
  });

  it("translate does not hide missing text", async () => {
    const res = await request(app).post("/api/ai/translate").send({});
    assert.equal(res.status, 400);
  });

  it("rejects blob image URLs on publish", async () => {
    const res = await request(app).post("/api/products").send({
      title: "Flower Pot",
      shortDescription: "Clay pot",
      longDescription: "Clay and sand flower pot",
      material: "clay and sand",
      craft: "Pottery",
      basePrice: 800,
      images: [{ url: "blob:http://localhost:5173/abc", alt: "pot" }]
    });
    assert.equal(res.status, 400);
    assert.match(String(res.body.error), /upload|temporary|blob/i);
  });

  it("rejects invalid image uploads", async () => {
    const res = await request(app)
      .post("/api/ai/analyze-image")
      .attach("image", Buffer.from("not-an-image"), { filename: "notes.txt", contentType: "text/plain" });
    assert.equal(res.status, 400);
  });

  it("calculates delivery", async () => {
    const res = await request(app).post("/api/ai/calculate-delivery").send({
      originState: "Assam",
      destinationState: "Maharashtra",
      size: "medium"
    });
    assert.equal(res.status, 200);
    assert.ok(res.body.total > 0);
  });

  it("returns 404 for missing product", async () => {
    const res = await request(app).get("/api/products/does-not-exist");
    assert.equal(res.status, 404);
  });

  it("can fetch a seeded product", async () => {
    if (!productId) return;
    const res = await request(app).get(`/api/products/${productId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.product.id, productId);
  });
});
