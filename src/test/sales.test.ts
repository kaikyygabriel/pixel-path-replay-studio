import { describe, it, expect } from "vitest";
import { formatSales } from "@/lib/sales";
describe("formatSales", () => {
  it("12,5 mil", () => expect(formatSales("12,5 mil")).toBe("12,5+ mil"));
  it("15.000+", () => expect(formatSales("15.000+")).toBe("15+ mil"));
  it("10 mil+", () => expect(formatSales("10 mil+")).toBe("10+ mil"));
  it("300+", () => expect(formatSales("300+")).toBe("300+"));
});
