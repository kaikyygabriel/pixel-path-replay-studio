import { describe, expect, it } from "vitest";
import { products } from "@/lib/catalog";
import { recommendedProducts } from "@/lib/recommendations";

describe("product recommendations", () => {
  it("includes the highest selling products from the catalog", () => {
    expect(recommendedProducts("jogo-toalhas-karsten").slice(0, 3).map((p) => p.id)).toEqual([
      "air-fryer-oven-mondial-afon-12l", "liquidificador-mondial-l99-fb", "smart-tv-tcl-55p8k-qled-4k",
    ]);
  });
  it("includes other Christmas products on every product page", () => {
    for (const current of products) {
      expect(recommendedProducts(current.id).some((p) => /natal/i.test(p.category) && p.id !== current.id)).toBe(true);
    }
  });
  it("shows six distinct other products on every product page", () => {
    for (const current of products) {
      const ids = recommendedProducts(current.id).map((p) => p.id);
      expect(ids).not.toContain(current.id);
      expect(ids).toHaveLength(6);
      expect(new Set(ids).size).toBe(6);
    }
  });
});