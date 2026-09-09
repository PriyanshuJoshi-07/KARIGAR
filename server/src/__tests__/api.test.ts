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
