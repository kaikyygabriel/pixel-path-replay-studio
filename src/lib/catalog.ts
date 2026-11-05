import towelMain from "@/assets/towel_main.jpg.asset.json";
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
  logo: "/logo%20loja.png",
  followers: "+43 mil seguidores",
  bio: "Multi Achadinhos | Variedade para o seu dia a dia! Eletrônicos, casa, utilidades e muito mais. Explore nossa vitrine e encontre seus próximos achadinhos! ❤️",
  legal: {
    razaoSocial: "MULTI ACHADINHOS LTDA" as string | null,
    cnpj: "67.705.006/0001-35" as string | null,
    sede: "São Paulo - SP" as string | null,
    atendimento: "sac@multiachadinhos.tiktokshop" as string | null,
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
  description?: string;
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
    rating: 4.8, reviews: null, sold: "7,8 mil",
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
    image: "/chaleira%20uniterm%201.png",
    gallery: [
      "/chaleira%20uniterm%201.png",
      "/chaleira%20uniterm%202.png",
      "/chaleira%20uniterm%203.png",
      "/chaleira%20uniterm%204.png",
      "/chaleira%20uniterm%205.png",
    ],
    variants: [
      { id: "chaleira-127v", line: "Tensão", color: "127V", description: "Versão 127V", price: 3623, original: 4990, pieces: 1, image: "/chaleira%20uniterm%201.png" },
      { id: "chaleira-220v", line: "Tensão", color: "220V", description: "Versão 220V", price: 3623, original: 4990, pieces: 1, image: "/chaleira%20uniterm%201.png" },
    ],
    description: "Prepare café, chá, chimarrão e outras bebidas com praticidade. A chaleira elétrica tem capacidade de 1,8 L, acabamento em aço inox e aquecimento rápido, ideal para casa ou trabalho.\n\nDisponível em 127V ou 220V. Não é bivolt: selecione a voltagem compatível com sua residência antes de comprar.",
    rating: 4.7, reviews: null, sold: "2,4 mil",
  },
  {
    id: "arvore-natal-kit-87-enfeites",
    title: "Árvore de Natal 1,20 m + Kit com 87 Enfeites",
    cardTitle: "Árvore de Natal 1,20 m + 87 Enfeites",
    checkoutTitle: "Árvore de Natal 1,20 m com Kit de 87 Enfeites",
    category: "Natal · Decoração",
    price: 4285,
    original: 9299,
    shippingOriginal: 2620,
    image: "/products/arvore-natal-kit-87-enfeites/arvore-de-natal-1.png",
    gallery: [
      "/products/arvore-natal-kit-87-enfeites/arvore-de-natal-1.png",
      "/products/arvore-natal-kit-87-enfeites/arvore-de-natal-2.png",
      "/products/arvore-natal-kit-87-enfeites/arvore-de-natal-3.png",
      "/products/arvore-natal-kit-87-enfeites/arvore-de-natal-4.png",
      "/products/arvore-natal-kit-87-enfeites/arvore-de-natal-5.png",
      "/products/arvore-natal-kit-87-enfeites/arvore-de-natal-6.png",
      "/products/arvore-natal-kit-87-enfeites/arvore-de-natal-7.png",
    ],
    variants: [
      { id: "arvore-127v", line: "Tensão", color: "127V", description: "Versão 127V · Árvore de Natal com pisca-pisca", price: 4285, original: 9299, pieces: 1, image: "/products/arvore-natal-kit-87-enfeites/arvore-de-natal-1.png" },
      { id: "arvore-220v", line: "Tensão", color: "220V", description: "Versão 220V · Árvore de Natal com pisca-pisca", price: 4285, original: 9299, pieces: 1, image: "/products/arvore-natal-kit-87-enfeites/arvore-de-natal-1.png" },
    ],
    description: "Deixe a decoração de fim de ano pronta com uma árvore de 1,20 m e um kit com 87 enfeites variados. Compacta, reutilizável e fácil de montar, é ideal para ambientes internos.\n\nA árvore possui 110 galhos verdes, estrutura flexível e pés em PVC reforçado. O kit inclui ponteira estrela, pisca-pisca, festão, 6 laços, 12 bolinhas e 66 pendentes decorativos.\n\nEscolha a voltagem do pisca-pisca: 127V ou 220V. Cores e modelos dos enfeites podem variar conforme a disponibilidade. Imagens ilustrativas.",
    rating: 5,
    reviews: null,
    sold: "800+",
  },
  {
    id: "smart-tv-tcl-55p8k-qled-4k",
    title: "Smart TV TCL 55” QLED 4K Google TV · 144 Hz",
    cardTitle: "Smart TV TCL 55” QLED 4K · 144 Hz",
    checkoutTitle: "Smart TV TCL 55P8K QLED 4K 55 polegadas",
    category: "Eletrônicos · Natal · Recomendados",
    price: 83765,
    original: 275405,
    shippingOriginal: 2620,
    image: "/products/smart-tv-tcl-55p8k-qled-4k/gallery/tcl%20tv%201.png",
    gallery: [
      "/products/smart-tv-tcl-55p8k-qled-4k/gallery/tcl%20tv%201.png",
      "/products/smart-tv-tcl-55p8k-qled-4k/gallery/tcl%20tv%202.png",
      "/products/smart-tv-tcl-55p8k-qled-4k/gallery/tcl%20tv%203.png",
      "/products/smart-tv-tcl-55p8k-qled-4k/gallery/tcl%20tv%204.png",
      "/products/smart-tv-tcl-55p8k-qled-4k/gallery/tcl%20tv%205.png",
      "/products/smart-tv-tcl-55p8k-qled-4k/gallery/tcl%20tv%206.png",
    ],
    variants: [],
    description: "Tenha uma experiência de entretenimento imersiva com a Smart TV TCL 55P8K. Tela QLED 4K de 55 polegadas, painel HVA e frequência real de 144 Hz para imagens nítidas, cores vibrantes e movimentos fluidos.\n\nCom Google TV, Google Assistente, Google Cast, Wi-Fi Dual Band e Bluetooth 5.4, oferece acesso prático aos principais aplicativos de streaming. Conta ainda com HDR10+, Dolby Vision e sistema de áudio 2.1 canais com subwoofer e Dolby Audio.\n\nPossui 4 entradas HDMI, 2 USB, HDMI 2.1, eARC e padrão VESA 300 × 300 mm. Alimentação automática de 100–240 V.\n\nDimensões com pedestal: 77,5 × 122,6 × 28,9 cm. Peso: 11,5 kg. Acompanha controle remoto e manual.",
    rating: 4.9, reviews: null, sold: "10 mil+",
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
