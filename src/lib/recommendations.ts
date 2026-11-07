import { products, type Product } from "@/lib/catalog";

function salesCount(value: string | null): number {
  if (!value) return 0;
  const normalized = value.toLowerCase().replace(/\s/g, "");
  const thousands = normalized.includes("mil");
  const digits = normalized.replace(/[^0-9.,]/g, "");
  const amount = Number.parseFloat(thousands ? digits.replace(",", ".") : digits.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(amount) ? amount * (thousands ? 1000 : 1) : 0;
}

export function recommendedProducts(currentId: string): Product[] {
  const available = products.filter((product) => product.id !== currentId);
  const bestSellers = [...available].sort((a, b) => salesCount(b.sold) - salesCount(a.sold));
  const christmas = available.filter((product) => /natal/i.test(product.category));
  const selected = new Map<string, Product>();
  for (const product of bestSellers.slice(0, 3)) selected.set(product.id, product);
  for (const product of christmas) {
    if (selected.size >= 6) break;
    selected.set(product.id, product);
  }
  for (const product of bestSellers) {
    if (selected.size >= 6) break;
    selected.set(product.id, product);
  }
  return [...selected.values()];
}