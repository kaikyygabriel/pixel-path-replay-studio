import { products, type Product } from "@/lib/catalog";

/** Quatro produtos relacionados escolhidos editorialmente para cada página. */
export const relatedProductIds: Record<string, string[]> = {
  "jogo-lencol-casal-400-fios": ["jogo-toalhas-karsten", "omo-lavanderia-profissional-7l", "purificador-electrolux-pa26g", "conjunto-panelas-antiaderente-10-pecas"],
  "jogo-facas-tramontina-plenus-9-pecas": ["conjunto-panelas-antiaderente-10-pecas", "chaleira-unitermi-atacama", "air-fryer-mondial-afn-40-bft", "micro-ondas-philco-pmo31s"],
  "camera-intelbras-im5-plus": ["smartwatch-t900-s10-ultra-pro", "power-bank-basike-10000mah-preto", "ar-condicionado-lg-ai-voice-9000", "purificador-electrolux-pa26g"],
  "purificador-electrolux-pa26g": ["chaleira-unitermi-atacama", "liquidificador-mondial-l99-fb", "micro-ondas-philco-pmo31s", "conjunto-panelas-antiaderente-10-pecas"],
  ,

  "jogo-toalhas-karsten": [
    "omo-lavanderia-profissional-7l",
    "conjunto-panelas-antiaderente-10-pecas",
    "ventilador-mondial-super-turbo-8-pas-40cm",
    "air-fryer-mondial-afn-40-bft"
  ],
  "chaleira-unitermi-atacama": [
    "liquidificador-mondial-l99-fb",
    "micro-ondas-philco-pmo31s",
    "purificador-electrolux-pa26g",
    "conjunto-panelas-antiaderente-10-pecas",
    "air-fryer-oven-mondial-afon-12l"
  ],
  "arvore-natal-kit-87-enfeites": [
    "kit-24-bolas-natalinas-5cm",
    "hot-wheels-kit-10-mattel-164",
    "barbie-casa-dos-sonhos-hmx10",
    "squishy-surpresa-colecionavel"
  ],
  "smart-tv-tcl-55p8k-qled-4k": [
    "projetor-hy300-duoseg",
    "jbl-boombox-4",
    "controle-sem-fio-xbox-branco",
    "smartwatch-t900-s10-ultra-pro"
  ],
  "liquidificador-mondial-l99-fb": [
    "chaleira-unitermi-atacama",
    "air-fryer-oven-mondial-afon-12l",
    "air-fryer-mondial-afn-40-bft",
    "conjunto-panelas-antiaderente-10-pecas"
  ],
  "micro-ondas-philco-pmo31s": [
    "air-fryer-oven-mondial-afon-12l",
    "air-fryer-mondial-afn-40-bft",
    "conjunto-panelas-antiaderente-10-pecas",
    "chaleira-unitermi-atacama"
  ],
  "ar-condicionado-lg-ai-voice-9000": [
    "ventilador-mondial-super-turbo-8-pas-40cm",
    "air-fryer-oven-mondial-afon-12l",
    "smartwatch-t900-s10-ultra-pro",
    "power-bank-basike-10000mah-preto"
  ],
  "air-fryer-oven-mondial-afon-12l": [
    "air-fryer-mondial-afn-40-bft",
    "conjunto-panelas-antiaderente-10-pecas",
    "micro-ondas-philco-pmo31s",
    "liquidificador-mondial-l99-fb"
  ],
  "squishy-surpresa-colecionavel": [
    "barbie-casa-dos-sonhos-hmx10",
    "hot-wheels-kit-10-mattel-164",
    "brastoy-controle-remoto-k602",
    "kit-24-bolas-natalinas-5cm"
  ],
  "barbie-casa-dos-sonhos-hmx10": [
    "hot-wheels-kit-10-mattel-164",
    "brastoy-controle-remoto-k602",
    "squishy-surpresa-colecionavel",
    "kit-24-bolas-natalinas-5cm"
  ],
  "projetor-hy300-duoseg": [
    "smart-tv-tcl-55p8k-qled-4k",
    "jbl-boombox-4",
    "controle-sem-fio-xbox-branco",
    "smartwatch-t900-s10-ultra-pro"
  ],
  "brastoy-controle-remoto-k602": [
    "hot-wheels-kit-10-mattel-164",
    "barbie-casa-dos-sonhos-hmx10",
    "squishy-surpresa-colecionavel",
    "controle-sem-fio-xbox-branco"
  ],
  "air-fryer-mondial-afn-40-bft": [
    "air-fryer-oven-mondial-afon-12l",
    "conjunto-panelas-antiaderente-10-pecas",
    "micro-ondas-philco-pmo31s",
    "liquidificador-mondial-l99-fb"
  ],
  "hot-wheels-kit-10-mattel-164": [
    "brastoy-controle-remoto-k602",
    "barbie-casa-dos-sonhos-hmx10",
    "squishy-surpresa-colecionavel",
    "kit-24-bolas-natalinas-5cm"
  ],
  "conjunto-panelas-antiaderente-10-pecas": [
    "jogo-facas-tramontina-plenus-9-pecas",
    "air-fryer-oven-mondial-afon-12l",
    "air-fryer-mondial-afn-40-bft",
    "micro-ondas-philco-pmo31s",
    "chaleira-unitermi-atacama"
  ],
  "kit-24-bolas-natalinas-5cm": [
    "arvore-natal-kit-87-enfeites",
    "barbie-casa-dos-sonhos-hmx10",
    "hot-wheels-kit-10-mattel-164",
    "squishy-surpresa-colecionavel"
  ],
  "jbl-boombox-4": [
    "smart-tv-tcl-55p8k-qled-4k",
    "projetor-hy300-duoseg",
    "controle-sem-fio-xbox-branco",
    "smartwatch-t900-s10-ultra-pro"
  ],
  "smartwatch-t900-s10-ultra-pro": [
    "power-bank-basike-10000mah-preto",
    "jbl-boombox-4",
    "smart-tv-tcl-55p8k-qled-4k",
    "controle-sem-fio-xbox-branco"
  ],
  "omo-lavanderia-profissional-7l": [
    "jogo-toalhas-karsten",
    "ventilador-mondial-super-turbo-8-pas-40cm",
    "conjunto-panelas-antiaderente-10-pecas",
    "air-fryer-mondial-afn-40-bft"
  ],
  "controle-sem-fio-xbox-branco": [
    "smart-tv-tcl-55p8k-qled-4k",
    "projetor-hy300-duoseg",
    "jbl-boombox-4",
    "power-bank-basike-10000mah-preto"
  ],
  "ventilador-mondial-super-turbo-8-pas-40cm": [
    "ar-condicionado-lg-ai-voice-9000",
    "jogo-toalhas-karsten",
    "air-fryer-mondial-afn-40-bft",
    "chaleira-unitermi-atacama"
  ],
  "power-bank-basike-10000mah-preto": [
    "smartwatch-t900-s10-ultra-pro",
    "jbl-boombox-4",
    "controle-sem-fio-xbox-branco",
    "projetor-hy300-duoseg"
  ],
  "espumante-chandon-reserve-brut-750ml": [
    "jbl-boombox-4",
    "conjunto-panelas-antiaderente-10-pecas",
    "kit-24-bolas-natalinas-5cm",
    "smartwatch-t900-s10-ultra-pro"
  ]
};

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const current = result[index] as T;
    result[index] = result[swap] as T;
    result[swap] = current;
  }
  return result;
}

/** Ordem estável por produto: servidor e cliente precisam calcular a mesma lista. */
function seededRandom(seed: string): () => number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  let state = hash >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

export function recommendedProducts(currentId: string, random: () => number = seededRandom(currentId)): Product[] {
  const available = products.filter((product) => product.id !== currentId);
  const byId = new Map<string, Product>(available.map((product) => [product.id, product] as const));
  const related = (relatedProductIds[currentId] ?? []).map((id) => byId.get(id)).filter((product): product is Product => Boolean(product));
  const relatedIds = new Set(related.map((product) => product.id));
  const remaining = shuffle(available.filter((product) => !relatedIds.has(product.id)), random);
  return [...shuffle(related, random), ...remaining].slice(0, 6);
}
