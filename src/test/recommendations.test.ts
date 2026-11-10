import { describe, expect, it } from "vitest";
import { products } from "@/lib/catalog";
import { recommendedProducts, relatedProductIds } from "@/lib/recommendations";

describe("product recommendations", () => {
  it("puts the four editorially related products first", () => {
    for (const current of products) {
      const result = recommendedProducts(current.id, () => 0);
      expect(result.slice(0, 4).map((p) => p.id).sort()).toEqual([...relatedProductIds[current.id]].sort());
    }
  });
  it("shows six distinct products and never recommends the current product", () => {
    for (const current of products) {
      const ids = recommendedProducts(current.id, () => 0).map((p) => p.id);
      expect(ids).toHaveLength(6);
      expect(new Set(ids).size).toBe(6);
      expect(ids).not.toContain(current.id);
    }
  });
  it("alternates the positions while preserving the same four related products", () => {
    const a = recommendedProducts("jogo-toalhas-karsten", () => 0).slice(0, 4).map((p) => p.id);
    const b = recommendedProducts("jogo-toalhas-karsten", () => 0.99).slice(0, 4).map((p) => p.id);
    expect(a).not.toEqual(b);
    expect([...a].sort()).toEqual([...b].sort());
  });
  it("uses four valid and unique related IDs for every product", () => {
    const ids = new Set(products.map((p) => p.id));
    for (const [current, related] of Object.entries(relatedProductIds)) {
      expect(ids.has(current)).toBe(true);
      expect(related).toHaveLength(4);
      expect(new Set(related).size).toBe(4);
      expect(related).not.toContain(current);
      related.forEach((id) => expect(ids.has(id)).toBe(true));
    }
  });
});
