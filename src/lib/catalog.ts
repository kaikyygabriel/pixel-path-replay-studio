import towelMain from "@/assets/towel_main.jpg.asset.json";
import kettle from "@/assets/kettle.jpg.asset.json";
import storeLogo from "@/assets/store_logo.jpg.asset.json";
import v0 from "@/assets/var0.jpg.asset.json";
import v1 from "@/assets/var1.jpg.asset.json";
import v2 from "@/assets/var2.jpg.asset.json";
import v3 from "@/assets/var3.jpg.asset.json";
import v4 from "@/assets/var4.jpg.asset.json";

/**
 * Store identity. Fields set to null are business details the owner has not
 * supplied yet — the UI shows them as pending instead of inventing values.
 */
export const store = {
  name: "MULTI ACHADINHOS",
  brandName: "Multi Achadinhos",
  logo: storeLogo.url,
  followers: "+21 mil seguidores",
  bio: "Multi Achadinhos | Variedade para o seu dia a dia! Eletrônicos, casa, utilidades e muito mais. Explore nossa vitrine e encontre seu próximo achado! 💙",
  legal: {
    razaoSocial: null as string | null,
    cnpj: null as string | null,
    sede: null as string | null,
    atendimento: null as string | null,
  },
};

export type Variant = {
  id: string;
  line: string;
  color: string;
  description: string;
  price: number; // cents
  original: number; // cents
  pieces: number;
  image: string;
};

export type Product = {
  id: string;
  title: string;
  cardTitle: string;
  checkoutTitle: string;
  category: string;
  price: number;
  original: number;
  shippingOriginal: number;
  image: string;
  gallery: string[];
  variants: Variant[];
  /** Real store metrics only; null = not shown. */
  rating: number | null;
  reviews: number | null;
  sold: string | null;
};

const towelVariants: Variant[] = [
  { id: "bosco-azul", line: "Bosco", color: "Azul Serena/Azul Naval", description: "2 toalhas de banho e 2 de rosto · Bosco · Azul Serena/Azul Naval · frete grátis", price: 3798, original: 12841, pieces: 4, image: v0.url },
  { id: "provence-branco", line: "Provence", color: "Branco/Argila", description: "2 toalhas de banho e 2 de rosto · Provence · Branco/Argila · frete grátis", price: 4691, original: 17990, pieces: 4, image: v3.url },
  { id: "bosco-cinza", line: "Bosco", color: "Cinza", description: "2 toalhas de banho e 2 de rosto · Bosco · Cinza · frete grátis", price: 3472, original: 10491, pieces: 4, image: v1.url },
  { id: "provence-verde", line: "Provence", color: "Verde", description: "2 toalhas de banho e 2 de rosto · Provence · Verde · frete grátis", price: 4491, original: 12990, pieces: 4, image: v4.url },
  { id: "bosco-bege", line: "Bosco", color: "Bege/Marrom", description: "2 toalhas de banho e 2 de rosto · Bosco · Bege/Marrom · frete grátis", price: 3499, original: 10899, pieces: 4, image: v2.url },
];

export const products: Product[] = [
  {
    id: "jogo-toalhas-karsten",
    title: "Jogo de Toalhas Karsten · 4 Peças · Bosco e Provence",
    cardTitle: "Jogo de Toalhas Karsten · 4 Peças · Bosco e...",
    checkoutTitle: "Jogo de Toalhas Karsten Bosco · 4 Peças 100% Algodão",
    category: "Karsten · Cama, mesa e banho",
    price: 3798,
    original: 12841,
    shippingOriginal: 2620,
    image: towelMain.url,
    gallery: [towelMain.url, v0.url, v1.url, v2.url],
    variants: towelVariants,
    rating: null, reviews: null, sold: null,
  },
  {
    id: "chaleira-unitermi-atacama",
    title: "Chaleira Elétrica Unitermi Atacama · 1,8L",
    cardTitle: "Chaleira Elétrica Unitermi Atacama · 1,8L",
    checkoutTitle: "Chaleira Elétrica Unitermi Atacama · 1,8L",
    category: "Unitermi · Eletroportáteis",
    price: 3623,
    original: 4990,
    shippingOriginal: 2620,
    image: kettle.url,
    gallery: [kettle.url],
    variants: [],
    rating: null, reviews: null, sold: null,
  },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);

export const brl = (cents: number) =>
  "R$ " +
  (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const discountPct = (price: number, original: number) =>
  Math.round((1 - price / original) * 100);

export const unitPrice = (v: Variant) => Math.round(v.price / v.pieces);

/** Order totals: shipping is free, discount = original − price. */
export function orderTotals(price: number, original: number) {
  return { subtotal: price, original, discount: original - price, shipping: 0, total: price };
}
