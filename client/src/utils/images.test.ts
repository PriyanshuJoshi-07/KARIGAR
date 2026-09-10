import { describe, it, expect } from "vitest";
import { isPersistentImageUrl } from "./images";

describe("isPersistentImageUrl", () => {
  it("accepts uploaded and public image paths", () => {
    expect(isPersistentImageUrl("/uploads/123-photo.jpg")).toBe(true);
    expect(isPersistentImageUrl("/images/products/vase.svg")).toBe(true);
  });

  it("rejects blob and data URLs", () => {
    expect(isPersistentImageUrl("blob:http://localhost:5173/abc")).toBe(false);
    expect(isPersistentImageUrl("data:image/png;base64,abc")).toBe(false);
    expect(isPersistentImageUrl("")).toBe(false);
  });
});
