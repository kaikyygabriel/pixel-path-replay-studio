import type { Product } from "@/lib/catalog";

/** A deadline must come from a configured offer, never from the visitor's arrival. */
export function activeFlashDeadline(product: Pick<Product, "flashOffer">, now: number): number | null {
  const deadline = product.flashOffer?.endsAt;
  return typeof deadline === "number" && Number.isFinite(deadline) && deadline > now ? deadline : null;
}