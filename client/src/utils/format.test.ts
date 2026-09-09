import { describe, it, expect } from "vitest";
import { formatInr } from "../services/api";

describe("formatInr", () => {
  it("formats rupees", () => {
    expect(formatInr(850)).toContain("850");
    expect(formatInr(2400)).toContain("2,400");
  });
});
