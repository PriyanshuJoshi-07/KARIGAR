import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isPersistentImageUrl, isAllowedImageMime } from "../utils/images.js";

describe("image URL persistence", () => {
  it("accepts stored upload paths", () => {
    assert.equal(isPersistentImageUrl("/uploads/123-photo.jpg"), true);
    assert.equal(isPersistentImageUrl("/images/products/vase.svg"), true);
  });

  it("rejects blob and data URLs", () => {
    assert.equal(isPersistentImageUrl("blob:http://localhost:5173/abc"), false);
    assert.equal(isPersistentImageUrl("data:image/png;base64,abc"), false);
    assert.equal(isPersistentImageUrl("http://localhost:5000/uploads/x.jpg"), true);
  });

  it("allows only image mime types", () => {
    assert.equal(isAllowedImageMime("image/jpeg"), true);
    assert.equal(isAllowedImageMime("text/plain"), false);
  });
});
