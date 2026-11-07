import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  ChevronLeft, ChevronRight, ChevronDown, Bookmark, Truck, ShieldCheck, Check, Store,
  ShoppingCart, X, Plus, Minus, Star, RotateCcw, Wallet, Lock, Clock,
} from "lucide-react";
import { TopBar, SiteFooter, Verified, Sheet } from "@/components/shop/chrome";
import { getProduct, store, brl, unitPrice, type Variant } from "@/lib/catalog";
import { useCheckout, addToCart, type CartItem } from "@/lib/checkout";
import { CartAddButton } from "@/components/shop/cart-add-button";
import { formatEstimatedDelivery } from "@/lib/delivery";
import { ProductRecommendations } from "@/components/shop/product-recommendations";
import { FlashOfferBadge, ProductBadges, ReviewMediaRating } from "@/components/shop/product-presentation";

const cartCount = (c: CartItem[]) => c.reduce((n, i) => n + i.qty, 0);
const getOptionKind = (variants: Variant[]) => {
  if (variants.length && variants.every((v) => /^(127|220)\s?V$/i.test(v.color.trim()))) return "voltage";
  const colorPattern = /branco|preto|azul|vermelho|verde|amarelo|rosa|roxo|lil[aá]s|cinza|bege|marrom|dourado|prata|cobre|transparente|inox|creme|off.?white|grafite|turquesa|colorido/i;
  if (variants.length && variants.every((v) => colorPattern.test(v.color))) return "color";
  return "model";
};

export const Route = createFileRoute("/produto/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.product.title ?? "Produto"} · ${store.brandName}` },
      { name: "description", content: `${loaderData?.product.title ?? "Produto"} com frete grátis e pagamento via PIX.` },
      { property: "og:title", content: loaderData?.product.title ?? "Produto" },
      { property: "og:description", content: "Frete grátis e pagamento via PIX." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  notFoundComponent: () => (
    <div className="app-frame page-enter grid place-items-center p-8 text-center">
      <div>
        <p className="mb-4">Produto não encontrado.</p>
        <Link to="/" className="font-semibold text-primary">Voltar à loja</Link>
      </div>
    </div>
  ),
  component: ProductPage,
});

const strip = ["FRETE GRÁTIS BRASIL", "ESPECIAL 25.12", "COMPRA PROTEGIDA", "ATÉ 70% OFF"];
type DemoReview = { id: string; name: string; date: string; rating: number; text: string; media: string | null };
const demoReviewCopy = [
  'Gostei muitoo, é bem bonito e ficou ótimo aqui em casa',
  'Chegou direitinho e bem embalado, gostei da qualidade',
  'Muito prático pro dia a dia, era exatamente o que eu precisava',
  'É igual aparece nas fotos, gostei bastante da compra',
  'Tô usando bastante e até agora tá tudo certinho',
  'Valeu a pena, produto bonito e fácil de usar',
];
// Dados locais de demonstração para uso interno; substituir por avaliações reais antes de publicar em produção.
function makeDemoReviews(productId: string, gallery: string[]): DemoReview[] {
  if (productId === "arvore-natal-kit-87-enfeites" || productId === "liquidificador-mondial-l99-fb") return []; // Não inventar depoimentos textuais sem conteúdo fornecido.
  const towel = productId === 'jogo-toalhas-karsten';
  const names = ['Mariana S.', 'Rafaela M.', 'Camila R.', 'João P.', 'Ana C.', 'Patrícia L.'];
  const ratings = towel ? [5, 5, 5, 5, 4, 5] : [5, 5, 4, 5, 5, 4];
  return names.map((name, i) => ({ id: 'demo-' + productId + '-' + i, name, date: ['há 2 dias', 'há 3 dias', 'há 5 dias', 'há 1 semana', 'há 10 dias', 'há 2 semanas'][i] ?? '', rating: ratings[i] ?? 5, text: demoReviewCopy[(i + (towel ? 0 : 2)) % demoReviewCopy.length] ?? '', media: i < Math.min(2, gallery.length) ? gallery[i % gallery.length] ?? null : null }));
}
function formatDemoSales(product: { id: string; sold: string | null }) { return product.sold ? `${product.sold} vendidos` : ""; }
function estimateReviewCount(sold: string | null): number {
  if (!sold) return 0;
  const normalized = sold.toLowerCase().replace(/\s/g, "");
  const numeric = normalized.replace(/[^0-9.,]/g, "");
  // "1.000+" usa ponto de milhar; "7,8 mil" usa vírgula decimal.
  const amount = normalized.includes("mil")
    ? Number.parseFloat(numeric.replace(",", "."))
    : Number.parseFloat(numeric.replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(amount)) return 0;
  const units = normalized.includes("mil") ? amount * 1000 : amount;
  // Cerca de 20% das vendas, com pequena variação e sem arredondar em dezenas/centenas.
  const variation = ((Math.round(units) % 21) - 10) / 1000;
  return Math.max(1, Math.round(units * (0.2 + variation)));
}
function getEstimatedRatingDistribution(total: number, rating: number): Record<number, number> {
  if (!total) return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const fiveStars = Math.round(total * Math.max(0, Math.min(1, rating - 4)));
  return { 5: fiveStars, 4: total - fiveStars, 3: 0, 2: 0, 1: 0 };
}

function ReviewStars({ rating, size = "h-3.5 w-3.5" }: { rating: number; size?: string }) {
  return <span className="inline-flex items-center" aria-label={rating.toFixed(1) + " de 5 estrelas"}>{[1,2,3,4,5].map((n) => {
    const fill = Math.max(0, Math.min(1, rating - (n - 1)));
    return <span key={n} className={"relative inline-block " + size}><Star className="absolute inset-0 h-full w-full text-border" /><span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: (fill * 100) + "%" }}><Star className="h-full w-full fill-[#FFC43B] text-[#FFC43B]" /></span></span>;
  })}</span>;
}

function ProductPage() {
  const { product: p } = Route.useLoaderData();
  const navigate = useNavigate();
  const { state, update } = useCheckout();
  const [idx, setIdx] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [sheet, setSheet] = useState<null | "buy" | "cart">(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [pickedVoltage, setPickedVoltage] = useState<string | null>(null);
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [opened, setOpened] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [protect, setProtect] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<number | null>(null);
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [showAllReviewMedia, setShowAllReviewMedia] = useState(false);
  const isTclTv = p.id === "smart-tv-tcl-55p8k-qled-4k";
  const isKettle = p.id === "chaleira-unitermi-atacama";
  const isKarstenTowel = p.id === "jogo-toalhas-karsten";
  const isChristmasTree = p.id === "arvore-natal-kit-87-enfeites";
  const isMondialBlender = p.id === "liquidificador-mondial-l99-fb";
  const isMondialAirFryer = p.id === "air-fryer-oven-mondial-afon-12l";
  const isSquishyToy = p.id === "squishy-surpresa-colecionavel";
  const kettleReviewPhotos = isKettle ? [
    { id: "kettle-review-1", src: "/avalia%C3%A7%C3%A3o%20chaleira%201.png" },
    { id: "kettle-review-2", src: "/avalia%C3%A7%C3%A3o%20chaleira%202.png" },
    { id: "kettle-review-3", src: "/avalia%C3%A7%C3%A3o%20chaleira%203.png" },
    { id: "kettle-review-4", src: "/avalia%C3%A7%C3%A3o%20chaleira%204.png" },
    { id: "kettle-review-5", src: "/avalia%C3%A7%C3%A3o%20chaleira%205.png" },
    { id: "kettle-review-6", src: "/avalia%C3%A7%C3%A3o%20chaleira%206.png" },
    { id: "kettle-review-7", src: "/avalia%C3%A7%C3%A3o%20chaleira%207.png" },
  ] : [];
  const christmasTreeReviewPhotos = isChristmasTree ? [
    { id: "christmas-tree-review-1", src: "/products/arvore-natal-kit-87-enfeites/reviews/avaliacao-arvore-natal-1.png" },
    { id: "christmas-tree-review-2", src: "/products/arvore-natal-kit-87-enfeites/reviews/avaliacao-arvore-natal-2.png" },
    { id: "christmas-tree-review-3", src: "/products/arvore-natal-kit-87-enfeites/reviews/avaliacao-arvore-natal-3.png" },
    { id: "christmas-tree-review-4", src: "/products/arvore-natal-kit-87-enfeites/reviews/avaliacao-arvore-natal-4.png" },
    { id: "christmas-tree-review-5", src: "/products/arvore-natal-kit-87-enfeites/reviews/avaliacao-arvore-natal-5.png" },
  ] : [];
  const towelReviewPhotos = isKarstenTowel ? [
    { id: "karsten-review-1", src: "/products/jogo-toalhas-karsten/reviews/avaliacao-toalha-01.png" },
    { id: "karsten-review-2", src: "/products/jogo-toalhas-karsten/reviews/avaliacao-toalha-02.png" },
    { id: "karsten-review-3", src: "/products/jogo-toalhas-karsten/reviews/avaliacao-toalha-03.png" },
    { id: "karsten-review-4", src: "/products/jogo-toalhas-karsten/reviews/avaliacao-toalha-04.png" },
    { id: "karsten-review-5", src: "/products/jogo-toalhas-karsten/reviews/avaliacao-toalha-05.png" },
    { id: "karsten-review-6", src: "/products/jogo-toalhas-karsten/reviews/avaliacao-toalha-06.png" },
    { id: "karsten-review-7", src: "/products/jogo-toalhas-karsten/reviews/avaliacao-toalha-07.png" },
    { id: "karsten-review-8", src: "/products/jogo-toalhas-karsten/reviews/avaliacao-toalha-08.png" },
    { id: "karsten-review-9", src: "/products/jogo-toalhas-karsten/reviews/avaliacao-toalha-09.png" },
    { id: "karsten-review-10", src: "/products/jogo-toalhas-karsten/reviews/avaliacao-toalha-10.png" }
  ] : [];
  const mondialReviewPhotos = isMondialBlender ? [
    { id: "mondial-review-1", src: "/products/liquidificador-mondial-l99-fb/reviews/avaliacao-liquidificador-mondial-1.webp" },
    { id: "mondial-review-2", src: "/products/liquidificador-mondial-l99-fb/reviews/avaliacao-liquidificador-mondial-2.webp" },
    { id: "mondial-review-3", src: "/products/liquidificador-mondial-l99-fb/reviews/avaliacao-liquidificador-mondial-3.webp" },
    { id: "mondial-review-4", src: "/products/liquidificador-mondial-l99-fb/reviews/avaliacao-liquidificador-mondial-4.webp" },
    { id: "mondial-review-5", src: "/products/liquidificador-mondial-l99-fb/reviews/avaliacao-liquidificador-mondial-5.webp" },
    { id: "mondial-review-6", src: "/products/liquidificador-mondial-l99-fb/reviews/avaliacao-liquidificador-mondial-6.webp" },
    { id: "mondial-review-7", src: "/products/liquidificador-mondial-l99-fb/reviews/avaliacao-liquidificador-mondial-7.webp" },
    { id: "mondial-review-8", src: "/products/liquidificador-mondial-l99-fb/reviews/avaliacao-liquidificador-mondial-8.webp" },
    { id: "mondial-review-9", src: "/products/liquidificador-mondial-l99-fb/reviews/avaliacao-liquidificador-mondial-9.webp" },
  ] : [];
  const airFryerReviewPhotos = isMondialAirFryer ? [
    { id: "air-fryer-review-1", src: "/products/air-fryer-oven-mondial-afon-12l/reviews/avaliacao-air-fryer-mondial-01.png" },
    { id: "air-fryer-review-2", src: "/products/air-fryer-oven-mondial-afon-12l/reviews/avaliacao-air-fryer-mondial-02.png" },
    { id: "air-fryer-review-3", src: "/products/air-fryer-oven-mondial-afon-12l/reviews/avaliacao-air-fryer-mondial-03.png" },
    { id: "air-fryer-review-4", src: "/products/air-fryer-oven-mondial-afon-12l/reviews/avaliacao-air-fryer-mondial-04.png" },
    { id: "air-fryer-review-5", src: "/products/air-fryer-oven-mondial-afon-12l/reviews/avaliacao-air-fryer-mondial-05.png" },
    { id: "air-fryer-review-6", src: "/products/air-fryer-oven-mondial-afon-12l/reviews/avaliacao-air-fryer-mondial-06.png" },
    { id: "air-fryer-review-7", src: "/products/air-fryer-oven-mondial-afon-12l/reviews/avaliacao-air-fryer-mondial-07.png" },
    { id: "air-fryer-review-8", src: "/products/air-fryer-oven-mondial-afon-12l/reviews/avaliacao-air-fryer-mondial-08.png" },
    { id: "air-fryer-review-9", src: "/products/air-fryer-oven-mondial-afon-12l/reviews/avaliacao-air-fryer-mondial-09.png" },
    { id: "air-fryer-review-10", src: "/products/air-fryer-oven-mondial-afon-12l/reviews/avaliacao-air-fryer-mondial-10.png" }
  ] : [];
  const squishyReviewPhotos = isSquishyToy ? [
    { id: "squishy-review-1", src: "/products/squishy-surpresa-colecionavel/reviews/avaliacao-squishy-01.png" },
    { id: "squishy-review-2", src: "/products/squishy-surpresa-colecionavel/reviews/avaliacao-squishy-02.png" },
    { id: "squishy-review-3", src: "/products/squishy-surpresa-colecionavel/reviews/avaliacao-squishy-03.png" },
    { id: "squishy-review-4", src: "/products/squishy-surpresa-colecionavel/reviews/avaliacao-squishy-04.png" },
    { id: "squishy-review-5", src: "/products/squishy-surpresa-colecionavel/reviews/avaliacao-squishy-05.png" },
    { id: "squishy-review-6", src: "/products/squishy-surpresa-colecionavel/reviews/avaliacao-squishy-06.png" },
    { id: "squishy-review-7", src: "/products/squishy-surpresa-colecionavel/reviews/avaliacao-squishy-07.png" },
    { id: "squishy-review-8", src: "/products/squishy-surpresa-colecionavel/reviews/avaliacao-squishy-08.png" },
    { id: "squishy-review-9", src: "/products/squishy-surpresa-colecionavel/reviews/avaliacao-squishy-09.png" },
  ] : [];
  const tclReviewPhotos = isTclTv ? [
    { id: "tcl-review-1", src: "/products/smart-tv-tcl-55p8k-qled-4k/reviews/tcl%20tv%20avalia%C3%A7%C3%A3o%201.png", caption: "TV instalada e em uso, com a interface de jogos aberta" },
    { id: "tcl-review-2", src: "/products/smart-tv-tcl-55p8k-qled-4k/reviews/tcl%20tv%20avalia%C3%A7%C3%A3o%202.png", caption: "Registro da embalagem recebida" },
    { id: "tcl-review-3", src: "/products/smart-tv-tcl-55p8k-qled-4k/reviews/tcl%20tv%20avalia%C3%A7%C3%A3o%203.png", caption: "Primeira inicialização do Google TV" },
    { id: "tcl-review-4", src: "/products/smart-tv-tcl-55p8k-qled-4k/reviews/tcl%20tv%20avalia%C3%A7%C3%A3o%204.png", caption: "Tela em reprodução de conteúdo" },
    { id: "tcl-review-5", src: "/products/smart-tv-tcl-55p8k-qled-4k/reviews/tcl%20tv%20avalia%C3%A7%C3%A3o%205.png", caption: "TV em uso durante uma partida" },
  ] : [];
  const isLgAirConditioner = p.id === "ar-condicionado-lg-ai-voice-9000";
  const lgReviewPhotos = isLgAirConditioner ? [
    { id: "lg-review-1", src: "/products/ar-condicionado-lg-ai-voice-9000/reviews/avaliacao-lg-ar-1.png" },
    { id: "lg-review-2", src: "/products/ar-condicionado-lg-ai-voice-9000/reviews/avaliacao-lg-ar-2.png" },
    { id: "lg-review-3", src: "/products/ar-condicionado-lg-ai-voice-9000/reviews/avaliacao-lg-ar-3.png" },
    { id: "lg-review-4", src: "/products/ar-condicionado-lg-ai-voice-9000/reviews/avaliacao-lg-ar-4.png" },
    { id: "lg-review-5", src: "/products/ar-condicionado-lg-ai-voice-9000/reviews/avaliacao-lg-ar-5.png" },
    { id: "lg-review-6", src: "/products/ar-condicionado-lg-ai-voice-9000/reviews/avaliacao-lg-ar-6.png" },
    { id: "lg-review-7", src: "/products/ar-condicionado-lg-ai-voice-9000/reviews/avaliacao-lg-ar-7.png" },
    { id: "lg-review-8", src: "/products/ar-condicionado-lg-ai-voice-9000/reviews/avaliacao-lg-ar-8.png" },
    { id: "lg-review-9", src: "/products/ar-condicionado-lg-ai-voice-9000/reviews/avaliacao-lg-ar-9.png" },
    { id: "lg-review-10", src: "/products/ar-condicionado-lg-ai-voice-9000/reviews/avaliacao-lg-ar-10.png" },
  ] : [];
  const isBarbieDreamhouse = p.id === "barbie-casa-dos-sonhos-hmx10";
  const isPhilcoMicrowave = p.id === "micro-ondas-philco-pmo31s";
  const philcoReviewPhotos = isPhilcoMicrowave ? [
    { id: "philco-review-1", src: "/products/micro-ondas-philco-pmo31s/reviews/avaliacao-micro-ondas-philco-1.png" },
    { id: "philco-review-2", src: "/products/micro-ondas-philco-pmo31s/reviews/avaliacao-micro-ondas-philco-2.png" },
    { id: "philco-review-3", src: "/products/micro-ondas-philco-pmo31s/reviews/avaliacao-micro-ondas-philco-3.png" },
    { id: "philco-review-4", src: "/products/micro-ondas-philco-pmo31s/reviews/avaliacao-micro-ondas-philco-4.png" },
    { id: "philco-review-5", src: "/products/micro-ondas-philco-pmo31s/reviews/avaliacao-micro-ondas-philco-5.png" },
    { id: "philco-review-6", src: "/products/micro-ondas-philco-pmo31s/reviews/avaliacao-micro-ondas-philco-6.png" },
    { id: "philco-review-7", src: "/products/micro-ondas-philco-pmo31s/reviews/avaliacao-micro-ondas-philco-7.png" },
  ] : [];
  const barbieReviewPhotos = isBarbieDreamhouse ? [
    { id: "barbie-review-1", src: "/products/barbie-casa-dos-sonhos/reviews/avaliacao-barbie-01.png" },
    { id: "barbie-review-2", src: "/products/barbie-casa-dos-sonhos/reviews/avaliacao-barbie-02.png" },
    { id: "barbie-review-3", src: "/products/barbie-casa-dos-sonhos/reviews/avaliacao-barbie-03.png" },
    { id: "barbie-review-4", src: "/products/barbie-casa-dos-sonhos/reviews/avaliacao-barbie-04.png" },
    { id: "barbie-review-5", src: "/products/barbie-casa-dos-sonhos/reviews/avaliacao-barbie-05.png" },
    { id: "barbie-review-6", src: "/products/barbie-casa-dos-sonhos/reviews/avaliacao-barbie-06.png" },
    { id: "barbie-review-7", src: "/products/barbie-casa-dos-sonhos/reviews/avaliacao-barbie-07.png" },
    { id: "barbie-review-8", src: "/products/barbie-casa-dos-sonhos/reviews/avaliacao-barbie-08.png" },
  ] : [];
  // Oito registros demonstrativos para validar o layout: cinco fotos 5★, duas notas 4★ e uma nota 5★.
  const demoReviews: DemoReview[] = isKarstenTowel ? [
    ...towelReviewPhotos.map((photo, i) => ({
      id: photo.id,
      name: ["Mariana S.", "Rafael M.", "Camila R.", "João P.", "Ana C.", "Patrícia L.", "Lucas F.", "Beatriz M.", "Fernanda A.", "Diego R."][i] ?? "",
      date: ["há 2 dias", "há 3 dias", "há 5 dias", "há 6 dias", "há 8 dias", "há 10 dias", "há 12 dias", "há 14 dias", "há 16 dias", "há 18 dias"][i] ?? "",
      rating: i === 8 ? 4 : 5,
      text: [
        "As toalhas são bem macias e vieram do jeitinho que eu esperava",
        "Gostei bastante da qualidade, são bonitas e têm um toque muito bom",
        "O jogo chegou certinho, as peças são bonitas e parecem bem resistentes",
        "São macias e têm um tamanho ótimo para usar no dia a dia",
        "A cor é linda pessoalmente e o tecido é bem gostoso",
        "Gostei do acabamento, ficaram lindas no meu banheiro",
        "Boa absorção e um toque bem agradável, compraria novamente",
        "Chegaram bem embaladas e são ainda mais bonitas de perto",
        "Gostei do conjunto, só achei a textura um pouco diferente do que imaginei",
        "Produto muito bonito, as toalhas têm uma qualidade ótima",
      ][i] ?? "",
      media: photo.src,
    })),
    { id: "karsten-review-text-11", name: "Bruno M.", date: "há 4 dias", rating: 5, text: "O conjunto ficou lindo no banheiro, gostei muito das cores e do toque", media: null },
    { id: "karsten-review-text-12", name: "Larissa G.", date: "há 9 dias", rating: 4, text: "São bonitas e macias, atenderam bem o que eu precisava", media: null },
    { id: "karsten-review-text-13", name: "Eduardo V.", date: "há 17 dias", rating: 5, text: "Gostei da compra, as quatro peças vieram certinhas e bem embaladas", media: null },
  ] : isChristmasTree ? [
    ...christmasTreeReviewPhotos.map((photo, i) => ({
      id: photo.id,
      name: ["Gabriela M.", "Renato P.", "Camila F.", "Bruno A.", "Larissa C."][i] ?? "",
      date: ["há 2 dias", "há 4 dias", "há 6 dias", "há 9 dias", "há 12 dias"][i] ?? "",
      rating: 5,
      text: [
        "Ficou linda montada aqui em casa, deu um charme especial na sala",
        "Veio tudo certinho e os enfeites deixaram a árvore bem bonita",
        "Gostei do tamanho, ficou perfeita no cantinho que eu tinha separado",
        "A montagem foi tranquila e depois de enfeitada ficou uma graça",
        "Adorei o conjunto, os enfeites dão um efeito bem bonito na decoração",
      ][i] ?? "",
      media: photo.src,
    })),
    { id: "christmas-tree-review-text-6", name: "Mariana R.", date: "há 3 dias", rating: 5, text: "Montei no fim de semana e ficou muito bonita, gostei bastante do resultado", media: null },
    { id: "christmas-tree-review-text-7", name: "Felipe S.", date: "há 8 dias", rating: 5, text: "O kit já vem bem completo e facilitou bastante na hora de decorar", media: null },
    { id: "christmas-tree-review-text-8", name: "Aline T.", date: "há 13 dias", rating: 5, text: "É compacta e ficou ótima na minha sala, os enfeites deram o toque final", media: null },
  ] : isTclTv ? [
    ...tclReviewPhotos.map((photo, i) => ({ id: photo.id, name: ["Mariana S.", "Rafael M.", "Camila R.", "João P.", "Ana C."][i] ?? "", date: ["há 2 dias", "há 3 dias", "há 5 dias", "há 1 semana", "há 2 semanas"][i] ?? "", rating: 5, text: ["Gostei muitoo, já tô aproveitando pra jogar e a imagem ficou linda", "Chegou bem embaladinha e tudo certinho, adorei", "Na primeira configuração foi bem tranquilo, já comecei a usar", "Já tô assistindo meus conteúdos e a imagem tá muito boa", "Usei pra jogar e ficou muito bom, gostei demais"][i] ?? "", media: photo.src })),
    { id: "tcl-review-text-6", name: "Patrícia L.", date: "há 10 dias", rating: 4, text: "Imagem muito bonita e o sistema é bem fácil de mexer, gostei bastante", media: null },
    { id: "tcl-review-text-7", name: "Lucas F.", date: "há 2 semanas", rating: 4, text: "Chegou bem embalada e a televisão é muito boa, gostei da compra", media: null },
    { id: "tcl-review-text-8", name: "Beatriz M.", date: "há 12 dias", rating: 5, text: "A imagem é linda, já tô aproveitando pra assistir meus filmes", media: null },
  ] : isMondialBlender ? mondialReviewPhotos.map((photo, i) => ({
    id: photo.id,
    name: ["Mariana S.", "Rafael M.", "Camila R.", "João P.", "Ana C.", "Patrícia L.", "Lucas F.", "Beatriz M.", "Fernanda A."][i] ?? "",
    date: ["há 1 dia", "há 2 dias", "há 4 dias", "há 5 dias", "há 7 dias", "há 9 dias", "há 10 dias", "há 12 dias", "há 13 dias"][i] ?? "",
    rating: 5,
    text: ["Gostei muitoo, bate bem e não ocupa muito espaço aqui na cozinha", "Chegou certinho e já fiz vitamina, gostei bastante", "É simples de usar e tritura bem as frutas", "O liquidificador é bonito e funcionou direitinho aqui", "Já usei pra fazer suco e ficou ótimo", "Gostei do tamanho e da potência, atende bem no dia a dia", "Veio bem embalado e tá funcionando certinho", "Muito bom pelo preço, gostei da compra", "Tô usando bastante pra vitaminas e tá dando conta tranquilo"][i] ?? "",
    media: photo.src,
  })) : isMondialAirFryer ? [
    ...airFryerReviewPhotos.map((photo, i) => ({
      id: photo.id,
      name: ["Mariana S.", "Rafael M.", "Camila R.", "João P.", "Ana C.", "Patrícia L.", "Lucas F.", "Beatriz M.", "Fernanda A.", "Diego R."][i] ?? "",
      date: ["há 2 dias", "há 3 dias", "há 4 dias", "há 5 dias", "há 6 dias", "há 7 dias", "há 8 dias", "há 10 dias", "há 11 dias", "há 13 dias"][i] ?? "",
      rating: i === 9 ? 4 : 5,
      text: [
        "Amei o espaço interno, consegui preparar tudo de uma vez e ficou ótimo",
        "Painel bem simples de mexer. As funções prontas ajudam bastante na correria",
        "Gostei da janela com luz, dá pra acompanhar sem ficar abrindo toda hora",
        "Usei as prateleiras e o cesto, achei bem versátil pra fazer coisas diferentes",
        "Esquenta rápido e a capacidade é ótima pra preparar porções maiores",
        "Muito bonita e espaçosa. Já testei batata e frango e gostei do resultado",
        "O painel digital é intuitivo, só escolher a função e ajustar se precisar",
        "Chegou certinho, as peças vieram bem acomodadas e o forno é bem espaçoso",
        "Gostei bastante, principalmente da iluminação interna e das três prateleiras",
        "Atendeu bem aqui em casa e tem bastante espaço. Só precisei me acostumar com o tamanho dela na bancada"
      ][i] ?? "",
      media: photo.src,
    })),
    { id: "air-fryer-review-text-11", name: "Bruno M.", date: "há 2 dias", rating: 5, text: "A capacidade faz diferença, consigo adiantar o preparo das refeições sem precisar fazer várias etapas", media: null },
    { id: "air-fryer-review-text-12", name: "Larissa G.", date: "há 9 dias", rating: 5, text: "Gostei muito do cesto e das prateleiras, ficou bem prático para variar os preparos", media: null },
    { id: "air-fryer-review-text-13", name: "Eduardo V.", date: "há 12 dias", rating: 5, text: "A janela iluminada ajuda bastante e o painel é fácil de entender. Estou usando direto", media: null },
  ] : isSquishyToy ? [
    ...squishyReviewPhotos.map((photo, i) => ({
      id: photo.id,
      name: ["Gabriela N.", "Felipe C.", "Bianca L.", "Mateus R.", "Letícia A.", "Renan F.", "Carolina P.", "Aline V.", "Diego M."][i] ?? "",
      date: ["há 11 dias", "há 2 dias", "há 8 dias", "há 4 dias", "há 13 dias", "há 6 dias", "há 1 dia", "há 10 dias", "há 3 dias"][i] ?? "",
      rating: 5,
      text: [
        "O meu veio nesse tom verdinho com brilho, achei muito fofo. A embalagem também é uma graça.",
        "Veio roxinho e a abertura foi a parte mais divertida, porque eu não sabia qual cor ia aparecer.",
        "",
        "O azul chegou bem brilhante, gostei de abrir e descobrir qual modelo tinha vindo.",
        "O meu veio azul clarinho, bem delicado. O brilho aparece bastante quando bate luz.",
        "Recebi o lilás. A textura é gostosa de apertar e ele fica guardadinho no próprio potinho.",
        "Gostei da proposta de abrir sem saber qual modelo vem. A surpresa deixa a brincadeira mais divertida.",
        "Veio douradinho com bastante brilho, achei diferente e muito fofo. Gostei da surpresa.",
        "Recebi um verdinho e gostei da cor. É fácil de segurar e divertido de apertar.",
      ][i] ?? "",
      media: photo.src,
    })).filter((review) => review.id !== "squishy-review-3"),
    { id: "squishy-review-text-10", name: "Bruna H.", date: "há 7 dias", rating: 5, text: "Comprei para dar de lembrancinha e achei a proposta muito divertida. A pessoa adorou descobrir o modelo.", media: null },
    { id: "squishy-review-text-11", name: "Gustavo E.", date: "há 12 dias", rating: 5, text: "Gostei de receber uma cor surpresa! O meu veio bem brilhante e achei o potinho individual uma graça.", media: null },
    { id: "squishy-review-text-12", name: "Júlia D.", date: "há 5 dias", rating: 5, text: "É macio para apertar e tem um acabamento muito fofo. Achei uma ideia diferente para presentear.", media: null },
  ] : isKettle ? kettleReviewPhotos.map((photo, i) => ({
    id: photo.id,
    name: ["Mariana S.", "Rafael M.", "Camila R.", "João P.", "Ana C.", "Patrícia L.", "Lucas F."][i] ?? "",
    date: ["há 2 dias", "há 3 dias", "há 5 dias", "há 1 semana", "há 9 dias", "há 11 dias", "há 13 dias"][i] ?? "",
    rating: 5,
    text: ["Gostei muitoo, esquenta rapidinho e já tô usando todo dia", "Muito prática pra fazer meu café, gostei bastante", "É bem bonita e funciona direitinho, adorei", "Uso pra preparar chá e facilita muito minha rotina", "Chegou tudo certinho e tô gostando bastante", "Esquenta bem rapidinho, valeu muito a pena", "Tô usando direto aqui em casa, gostei demais"][i] ?? "",
    media: photo.src,
  })) : isLgAirConditioner ? [
    { id: "lg-review-1", name: "Marcos A.", date: "há 2 dias", rating: 5, text: "Pelo aplicativo consigo programar o horário para ligar e desligar, facilita muito minha rotina", media: lgReviewPhotos[0]?.src ?? null },
    { id: "lg-review-2", name: "Juliana R.", date: "há 4 dias", rating: 5, text: "Sem comentários, esse está entre os melhores que já tive", media: lgReviewPhotos[1]?.src ?? null },
    { id: "lg-review-3", name: "Carlos M.", date: "há 5 dias", rating: 5, text: "Produto de qualidade, acabamento muito bom", media: lgReviewPhotos[2]?.src ?? null },
    { id: "lg-review-4", name: "Fernanda S.", date: "há 7 dias", rating: 5, text: "Produto excelente e muito econômico, gostei bastante", media: lgReviewPhotos[3]?.src ?? null },
    { id: "lg-review-5", name: "André P.", date: "há 8 dias", rating: 5, text: "O ar gela bem e o controle pelo celular é muito prático", media: lgReviewPhotos[4]?.src ?? null },
    { id: "lg-review-6", name: "Camila T.", date: "há 9 dias", rating: 5, text: "Bem silencioso e mantém o quarto numa temperatura agradável", media: lgReviewPhotos[5]?.src ?? null },
    { id: "lg-review-7", name: "Roberto L.", date: "há 11 dias", rating: 5, text: "Gostei da função inverter e de poder ajustar tudo pelo app", media: lgReviewPhotos[6]?.src ?? null },
    { id: "lg-review-8", name: "Patrícia F.", date: "há 13 dias", rating: 5, text: "Instalado e funcionando direitinho, atende muito bem", media: lgReviewPhotos[7]?.src ?? null },
    { id: "lg-review-9", name: "Diego C.", date: "há 15 dias", rating: 5, text: "Ótimo aparelho, gostei principalmente da conexão Wi-Fi", media: lgReviewPhotos[8]?.src ?? null },
    { id: "lg-review-10", name: "Renata B.", date: "há 18 dias", rating: 5, text: "Gela rápido e é fácil de programar pelo celular", media: lgReviewPhotos[9]?.src ?? null },
    { id: "lg-review-text-11", name: "Thiago N.", date: "há 3 dias", rating: 5, text: "Muito bom, funciona bem e quase não faz barulho", media: null },
    { id: "lg-review-text-12", name: "Aline G.", date: "há 10 dias", rating: 5, text: "Gostei da praticidade e do conforto que ele proporciona", media: null },
    { id: "lg-review-text-13", name: "Eduardo V.", date: "há 17 dias", rating: 5, text: "Atendeu minhas expectativas, resfria o ambiente direitinho", media: null },
  ] : isBarbieDreamhouse ? [
    ...barbieReviewPhotos.map((photo, i) => ({
      id: photo.id,
      name: ["Camila R.", "Fernanda M.", "Juliana P.", "Rafaela C.", "Aline S.", "Bruna T.", "Patrícia L.", "Mariana F."][i] ?? "",
      date: ["há 12 dias", "há 4 dias", "há 9 dias", "há 2 dias", "há 13 dias", "há 6 dias", "há 1 dia", "há 10 dias"][i] ?? "",
      rating: 5,
      text: [
        "A casinha é linda!! Minha filha ficou encantada quando viu tudo montado. A piscina e o escorregador já viraram os favoritos kkkk.",
        "Ela é enorme mesmo, precisei separar um cantinho pra montar. Depois de pronta fica maravilhosa e tem bastante espaço pra brincar.",
        "Levamos um tempinho na montagem, mas seguindo o manual deu certo. Minha pequena ficou toda animada quando viu a casa pronta.",
        "Os detalhes dos cômodos são muito bonitos, tem vários espaços pra inventar histórias. Gostei bastante do resultado.",
        "Minha menina amou!! O escorregador e a piscininha fizeram sucesso por aqui. Ficou linda montada.",
        "Veio com bastante acessório e a casa fica bem grandona. Dá pra brincar de vários jeitos.",
        "O elevador e o escorregador são muito legais, deixam a brincadeira mais completa. Minha filha adorou.",
        "Foi um presentão, ficou linda depois de montada. Só recomendo deixar um espaço reservado porque ela é grande.",
      ][i] ?? "",
      media: photo.src,
    })),
    { id: "barbie-review-text-9", name: "Débora A.", date: "há 7 dias", rating: 5, text: "Chegou bem embalada e com as peças organizadas. A montagem exige um pouco de paciência, mas o resultado fica lindo.", media: null },
    { id: "barbie-review-text-10", name: "Renata V.", date: "há 3 dias", rating: 5, text: "Minha sobrinha ficou apaixonada pela casa! Ela tem muitos cantinhos e acessórios pra imaginar várias brincadeiras.", media: null },
    { id: "barbie-review-text-11", name: "Priscila G.", date: "há 11 dias", rating: 5, text: "Gostei muito da casa, só é importante lembrar que a boneca não acompanha. No restante, é bem completa.", media: null },
  ] : isPhilcoMicrowave ? [
    { id: "philco-review-1", name: "Mariana S.", date: "há 2 dias", rating: 5, text: "Chegou direitinho e ficou ótimo na minha cozinha, gostei bastante", media: philcoReviewPhotos[0]?.src ?? null },
    { id: "philco-review-2", name: "Rafael M.", date: "há 4 dias", rating: 5, text: "É bem espaçoso por dentro e achei fácil de mexer", media: philcoReviewPhotos[1]?.src ?? null },
    { id: "philco-review-3", name: "Camila R.", date: "há 6 dias", rating: 5, text: "O design é bonito e esquenta super bem, atendeu ao que eu precisava", media: philcoReviewPhotos[2]?.src ?? null },
    { id: "philco-review-4", name: "João P.", date: "há 8 dias", rating: 5, text: "Gostei das funções e principalmente do tira odor, bem prático", media: philcoReviewPhotos[3]?.src ?? null },
    { id: "philco-review-5", name: "Ana C.", date: "há 10 dias", rating: 5, text: "Muito bonito, fácil de limpar e chegou bem embalado", media: philcoReviewPhotos[4]?.src ?? null },
    { id: "philco-review-6", name: "Fernanda L.", date: "há 13 dias", rating: 4, text: "Bom tamanho e várias opções de uso, estou gostando", media: philcoReviewPhotos[5]?.src ?? null },
    { id: "philco-review-7", name: "Lucas A.", date: "há 16 dias", rating: 5, text: "Funcionou certinho desde que chegou, recomendo conferir a voltagem antes", media: philcoReviewPhotos[6]?.src ?? null },
    { id: "philco-review-text-8", name: "Patrícia R.", date: "há 5 dias", rating: 5, text: "O espaço interno é ótimo e o painel é simples de entender", media: null },
    { id: "philco-review-text-9", name: "Bruno F.", date: "há 11 dias", rating: 4, text: "Atendeu bem aqui em casa, gostei do aquecimento e do acabamento", media: null },
    { id: "philco-review-text-10", name: "Juliana M.", date: "há 18 dias", rating: 5, text: "Gostei bastante das funções, principalmente para o dia a dia", media: null },
  ] : makeDemoReviews(p.id, p.gallery);
  const filteredReviews = reviewFilter == null ? demoReviews : demoReviews.filter((review) => review.rating === reviewFilter);
  const reviewAverage = p.rating ?? 0;
  const reviewMedia = demoReviews
    .filter((review) => review.media)
    .map((review) => ({
      id: review.id,
      media: review.media!,
      rating: review.rating,
    }));
  const colorVariants = isMondialBlender ? p.variants.filter((v, i, all) => all.findIndex((item) => item.color === v.color) === i) : [];
  const variant = isMondialBlender ? p.variants.find((v) => v.line === pickedVoltage && v.color === pickedColor) ?? null : p.variants.find((v: Variant) => v.id === picked) ?? null;
  const hasVariants = p.variants.length > 0;
  const optionKind = getOptionKind(p.variants);
  const unitCount = variant ? variant.pieces : 1;
  const shownPrice = variant ? variant.price : p.price;
  const shownOriginal = variant ? variant.original : p.original;
  const fav = state.favorites.includes(p.id);

  function goTo(i: number) {
    const el = galleryRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setIdx(i);
  }
  function startBuy() {
    if (hasVariants) setSheet("buy");
    else go();
  }
  function startCart() {
    if (hasVariants) setSheet("cart");
    else putInCart();
  }
  function putInCart() {
    update({ cart: addToCart(state.cart, p.id, variant?.id ?? null, qty) });
    window.dispatchEvent(new CustomEvent("shop-cart-added", { detail: { productId: p.id } }));
    setSheet(null);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }
  function go() {
    update({ checkoutItems: [], productId: p.id, variantId: variant?.id ?? null, qty });
    navigate({ to: "/checkout" });
  }

  return (
    <div className="app-frame page-enter pb-[84px]">
      <TopBar back />
      <div className="overflow-hidden bg-ink py-2.5 text-[13px] font-bold tracking-[0.12em] text-ink-foreground">
        <div className="marquee flex w-max gap-6 whitespace-nowrap">
          {[...strip, ...strip].map((t, i) => (
            <span key={i} className="flex items-center gap-6">
              <span className="text-teal">◆</span>{t}
            </span>
          ))}
        </div>
      </div>

      <div className="relative bg-card">
        <div
          ref={galleryRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== idx) setIdx(i);
          }}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ touchAction: "pan-x pan-y" }}
        >
          {p.gallery.map((src, i) => (
            <img key={src + i} src={src} alt={i === 0 ? p.title : ""} loading="eager" fetchPriority={i === 0 ? "high" : "low"} decoding="async" draggable={false} width={600} height={600} className="aspect-square w-full shrink-0 snap-center object-contain p-4" />
          ))}
        </div>
        {p.gallery.length > 1 && (
          <>
            <button aria-label="Anterior" onClick={() => goTo((idx + p.gallery.length - 1) % p.gallery.length)} className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-background/85 shadow">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button aria-label="Próxima" onClick={() => goTo((idx + 1) % p.gallery.length)} className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-background/85 shadow">
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
        <span className="absolute bottom-3 right-3 rounded-full bg-ink/60 px-3 py-1 text-[13px] text-ink-foreground">
          {idx + 1}/{p.gallery.length}
        </span>
      </div>

      {p.flashOffer ? (
        <div className="bg-flash grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 text-primary-foreground">
          <div className="min-w-0">
            <span className="truncate text-[24px] font-extrabold leading-none">{brl(shownPrice)}</span>
            <div className="mt-1.5 text-[13px] opacity-90">De <s>{brl(shownOriginal)}</s></div>
          </div>
          <FlashOfferBadge product={p} className="justify-end" />
        </div>
      ) : (
        <div className="bg-card px-4 py-3">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-[24px] font-extrabold leading-none text-primary">{brl(shownPrice)}</span>
            <s className="text-[14px] text-muted-foreground">{brl(shownOriginal)}</s>
          </div>
          <ProductBadges product={p} price={shownPrice} original={shownOriginal} />
        </div>
      )}

      <div className="px-4 pt-4">
        <div className="text-[15px] font-semibold text-success">{brl(shownPrice)} no PIX</div>
        <div className="mt-2 mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
          <ReviewStars rating={reviewAverage} /><b className="text-[13px]">{reviewAverage.toFixed(1)}</b><span className="text-muted-foreground">·</span><span className="text-muted-foreground">{formatDemoSales(p)}</span>
        </div>
        <div className="mt-1.5 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <h1 className="text-[17px] font-bold leading-snug">{p.title}</h1>
          <button aria-label={fav ? "Remover dos favoritos" : "Salvar nos favoritos"} onClick={() => update({ favorites: fav ? state.favorites.filter((x) => x !== p.id) : [...state.favorites, p.id] })} className="-mr-1 grid h-10 w-10 place-items-center">
            <Bookmark className={`h-7 w-7 ${fav ? "fill-primary text-primary" : ""}`} />
          </button>
        </div>
        <div className="mt-1 text-[13px] text-muted-foreground">{p.category}</div>
      </div>

      {hasVariants && (
        <>
          <div className="mt-6 flex items-center justify-between gap-3 px-4">
            <h2 className="text-[16px] font-bold">{isMondialBlender ? "Escolha a voltagem e a cor" : optionKind === "voltage" ? "Escolha a voltagem" : optionKind === "color" ? "Escolha o modelo e a cor" : "Selecionar modelo"}</h2>
            <span className="truncate text-[13px] text-muted-foreground">{variant ? `${variant.line} · ${variant.color}` : isMondialBlender ? "2 voltagens · 3 cores" : `${p.variants.length} opções`}</span>
          </div>
          {isMondialBlender ? (
            <div className="space-y-4 px-4 pt-3">
              <div><div className="mb-2 text-[13px] font-bold">1. Voltagem</div><div className="flex gap-2">
                {["127V", "220V"].map((voltage) => <button key={voltage} type="button" onClick={() => setPickedVoltage(voltage)} aria-pressed={pickedVoltage === voltage} className={`inline-flex h-10 min-w-[88px] items-center justify-center gap-2 rounded-lg border px-4 text-[13px] font-bold transition-colors ${pickedVoltage === voltage ? "border-primary bg-primary/5 text-primary" : "border-border bg-card"}`}>{voltage}{pickedVoltage === voltage && <Check className="h-3.5 w-3.5" />}</button>)}
              </div></div>
              <div><div className="mb-2 text-[13px] font-bold">2. Cor</div><div className="space-y-2">
                {colorVariants.map((v) => <button key={v.color} type="button" onClick={() => setPickedColor(v.color)} aria-pressed={pickedColor === v.color} className={`flex w-full min-w-0 items-center gap-3 rounded-xl border p-2.5 text-left transition-colors ${pickedColor === v.color ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                  <img src={v.image} alt={v.color} loading="lazy" decoding="async" width={56} height={56} className="h-14 w-14 shrink-0 rounded-lg bg-surface object-contain" />
                  <span className="min-w-0 flex-1"><span className="block text-[13px] font-bold">{v.color}</span><span className="mt-0.5 block text-[11px] text-muted-foreground">Turbo Power L-99 FB · 550W</span><span className="mt-1 block text-[13px] font-extrabold">{brl(v.price)}</span></span>
                  {pickedColor === v.color && <Check className="h-4 w-4 shrink-0 text-primary" />}
                </button>)}
              </div></div>
            </div>
          ) : optionKind === "voltage" ? (
            <div className="flex items-center justify-start gap-2 px-4 pt-3">
              {p.variants.map((v: Variant) => (
                <button key={v.id} type="button" onClick={() => setPicked(v.id)} aria-pressed={picked === v.id}
                  className={`inline-flex h-9 min-w-[76px] items-center justify-center gap-2 rounded-lg border px-3 text-[13px] font-bold transition-colors ${picked === v.id ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-foreground"}`}>
                  {v.color}
                  {picked === v.id && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          ) : optionKind === "color" ? (
            <div className="grid grid-cols-2 gap-2 px-4 pt-3">
              {p.variants.map((v: Variant) => (
                <button key={v.id} type="button" onClick={() => setPicked(v.id)} aria-pressed={picked === v.id}
                  className={`flex min-w-0 items-center gap-2.5 rounded-xl border p-2 text-left transition-colors ${picked === v.id ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                  <img src={v.image} alt="" loading="lazy" decoding="async" width={52} height={52} className="h-[52px] w-[52px] shrink-0 rounded-lg bg-surface object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold">{v.line}</span>
                    <span className="mt-0.5 block line-clamp-2 text-[12px] leading-snug text-muted-foreground">{v.color}</span>
                    <span className="mt-1 block text-[13px] font-extrabold">{brl(v.price)}</span>
                    {v.original > v.price && <span className="block text-[11px] text-muted-foreground line-through">{brl(v.original)}</span>}
                  </span>
                  {picked === v.id && <Check className="h-4 w-4 shrink-0 text-primary" />}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5 px-4 pt-3">
              {p.variants.map((v: Variant) => (
                <button key={v.id} onClick={() => setPicked(v.id)}
                  className={`grid w-full grid-cols-[60px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-xl border-2 bg-card p-2.5 text-left transition-colors duration-200 ${picked === v.id ? "border-primary" : "border-border"}`}>
                  <img src={v.image} alt="" loading="lazy" decoding="async" width={60} height={60} className="h-[60px] w-[60px] rounded-lg object-cover" />
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-bold leading-tight">{v.line} · {v.color}</div>
                    <div className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-muted-foreground">{v.description}</div>
                    <span className="mt-1.5 inline-block rounded-md bg-success-soft px-1.5 py-0.5 text-[12px] font-semibold text-success">Economize {brl(v.original - v.price)}</span>
                  </div>
                  <div className="text-right">
                    <div className="whitespace-nowrap text-[15px] font-extrabold">{brl(v.price)}</div>
                    <div className="text-[12px] text-muted-foreground line-through">{brl(v.original)}</div>
                    <div className="text-[11.5px] text-muted-foreground">{brl(unitPrice(v))}/un.</div>
                    <span className={`ml-auto mt-1.5 block h-5 w-5 rounded-full border-2 ${picked === v.id ? "border-[6px] border-primary" : "border-border"}`} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <div className="mt-5 flex items-center justify-between border-y border-border px-4 py-3">
        <div>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-teal-soft text-teal-ink ring-1 ring-teal-ink/10"><Truck className="h-4 w-4" /></span>
            <span className="rounded-full bg-teal-soft px-3 py-1 font-bold tracking-tight text-teal-ink">Frete grátis</span>
            <span className="text-muted-foreground line-through">R$ 26,20</span>
          </div>
          <div className="mt-1 text-[14.5px] font-bold capitalize">Receba até {formatEstimatedDelivery()}</div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>

      <button onClick={() => setProtect(true)} className="mx-4 mt-4 block w-[calc(100%-2rem)] rounded-2xl border border-border p-3.5 text-left">
        <div className="flex items-center justify-between text-[15.5px] font-bold">
          <span className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-gold" />Proteção do cliente</span>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-x-2 gap-y-1.5 text-[13px]">
          {["Devolução gratuita", "Proteção e reembolso", "Pagamento seguro", "Garantia de pontualidade"].map((t) => (
            <span key={t} className="flex items-start gap-1.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{t}</span>
          ))}
        </div>
      </button>

      <div className="mt-5 border-t-8 border-surface p-4">
        <div className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3">
          <img src={store.logo} alt="" className="h-[52px] w-[52px] rounded-full" />
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[16px] font-extrabold"><span className="truncate">{store.name}</span><Verified className="h-4 w-4" /></div>
            <p className="line-clamp-2 text-[13px] leading-snug text-muted-foreground">{store.bio}</p>
          </div>
          <Link to="/" className="flex h-10 items-center rounded-full bg-secondary px-3 text-[14px] font-bold">Ver loja<ChevronRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-3 grid grid-cols-2 items-center gap-3 text-[12px] leading-tight text-muted-foreground">
          <p><span className="font-semibold text-foreground">100%</span> responde em 24 horas</p>
          <p className="text-right"><span className="font-semibold text-foreground">99%</span> envios pontuais</p>
        </div>
      </div>

      <div className="border-t-8 border-surface px-4 py-5">
        <h2 className="mb-2 text-[19px] font-extrabold">Sobre este produto</h2>
        {["Detalhes", "Descrição do produto"].map((t) => (
          <div key={t} className="border-b border-border">
            <button onClick={() => setOpened(opened === t ? null : t)} className="flex w-full items-center justify-between py-4 text-[16px] font-semibold">
              {t}<ChevronDown className={`h-5 w-5 transition-transform ${opened === t ? "rotate-180" : ""}`} />
            </button>
            {opened === t && <p className="whitespace-pre-line pb-4 text-[14px] leading-relaxed text-muted-foreground">{p.description ?? p.title}</p>}
          </div>
        ))}
      </div>
      <section className="mt-5 border-t-8 border-surface px-4 py-5" aria-label="Avaliações do produto">
        <h2 className="text-[19px] font-extrabold">Avaliações do produto</h2>
        <div className="mt-4 grid grid-cols-[112px_minmax(0,1fr)] gap-3 rounded-2xl bg-surface p-3">
          <div className="flex flex-col items-center justify-center border-r border-border pr-3 text-center">
            <strong className="text-[34px] leading-none">{reviewAverage.toFixed(1)}</strong>
            <ReviewStars rating={reviewAverage} size="h-4 w-4" />
            <span className="mt-1 text-[11px] text-muted-foreground">~{estimateReviewCount(p.sold).toLocaleString("pt-BR")} avaliações</span>
          </div>
          <div className="space-y-1.5">
            {[5,4,3,2,1].map((stars) => {
              const total = estimateReviewCount(p.sold);
              const distribution = p.id === "ar-condicionado-lg-ai-voice-9000"
                ? { 5: Math.max(0, total - 6), 4: Math.min(6, total), 3: 0, 2: 0, 1: 0 }
                : getEstimatedRatingDistribution(total, reviewAverage);
              const count = distribution[stars] ?? 0;
              const percent = total ? (count / total) * 100 : 0;
              return <button key={stars} onClick={() => { setReviewFilter(reviewFilter === stars ? null : stars); setVisibleReviews(3); }} className={"flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-left " + (reviewFilter === stars ? "bg-background" : "")}>
                <span className="w-3 text-[11px] text-muted-foreground">{stars}</span>
                <Star className="h-3 w-3 fill-gold text-gold" />
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-border"><span className="block h-full rounded-full bg-ink" style={{ width: percent + "%" }} /></span>
                <span className="w-4 text-right text-[10px] text-muted-foreground">{count}</span>
              </button>;
            })}
          </div>
        </div>
        {(reviewMedia.length > 0 || tclReviewPhotos.length > 0) && <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-[15px] font-bold">Fotos e vídeos das avaliações</h3>
            <button onClick={() => setShowAllReviewMedia(true)} className="shrink-0 text-[12px] font-bold text-primary">Ver tudo <ChevronRight className="inline h-4 w-4" /></button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {reviewMedia.slice(0, 15).map((review) => <button key={review.id} onClick={() => setShowAllReviewMedia(true)} className="w-[104px] shrink-0 text-left">
              <div className="relative"><img src={review.media!} alt="Foto enviada junto à avaliação do produto" loading="lazy" className="aspect-square w-full rounded-xl bg-surface object-cover" /><ReviewMediaRating rating={review.rating} /></div>
            </button>)}
          </div>
        </div>}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button onClick={() => { setReviewFilter(null); setVisibleReviews(3); }} className={"rounded-full border px-3 py-1.5 text-[12px] font-semibold " + (reviewFilter == null ? "border-ink bg-ink text-ink-foreground" : "border-border")}>Todas</button>
          {[5,4,3,2,1].map((stars) => <button key={stars} onClick={() => { setReviewFilter(reviewFilter === stars ? null : stars); setVisibleReviews(3); }} className={"rounded-full border px-3 py-1.5 text-[12px] font-semibold " + (reviewFilter === stars ? "border-ink bg-ink text-ink-foreground" : "border-border")}>{stars} estrelas</button>)}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
          {filteredReviews.slice(0, visibleReviews).map((review) => <article key={review.id} id={review.id} className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {review.media && <img src={review.media} alt="Foto enviada junto à avaliação do produto" loading="lazy" className="aspect-[4/3] w-full bg-surface object-cover" />}
            <div className="flex flex-col p-2.5">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-bold">{review.name.split(" ").map((part) => part[0]).slice(0,2).join("")}</span>
                <div className="min-w-0"><div className="truncate text-[12px] font-semibold">{review.name}</div><div className="text-[10px] text-muted-foreground">{review.date}</div></div>
              </div>
              {review.rating > 0 && <div className="mt-2"><ReviewStars rating={review.rating} size="h-3 w-3" /></div>}
              {review.text && <p className="mt-2 text-[12px] leading-snug">{review.text}</p>}

            </div>
          </article>)}
        </div>
        {filteredReviews.length === 0 && <p className="py-6 text-center text-[13px] text-muted-foreground">{isSquishyToy ? "As fotos compartilhadas por clientes estão disponíveis acima. Relatos escritos individuais serão exibidos quando houver conteúdo original cadastrado." : reviewFilter == null ? "Nenhuma avaliação individual cadastrada para este produto." : "Nenhuma avaliação nesta faixa de estrelas."}</p>}
        {filteredReviews.length > visibleReviews && <button onClick={() => setVisibleReviews((count) => count + 3)} className="mt-2 w-full rounded-full border border-border py-3 text-[13px] font-bold">Ver mais avaliações</button>}
      </section>
      <ProductRecommendations key={p.id} productId={p.id} />
      <div className="h-10 bg-surface" />
      <SiteFooter />

      {showAllReviewMedia && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-overlay sm:items-center" onClick={() => setShowAllReviewMedia(false)}>
          <div role="dialog" aria-modal="true" aria-label="Fotos e vídeos das avaliações" className="relative max-h-[90dvh] w-full max-w-[560px] overflow-y-auto rounded-t-3xl bg-background p-4 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div><h2 className="text-[18px] font-extrabold">Fotos e vídeos das avaliações</h2><p className="text-[12px] text-muted-foreground">{reviewMedia.length} mídias</p></div>
              <button aria-label="Fechar galeria" onClick={() => setShowAllReviewMedia(false)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">{reviewMedia.map((review) => <div key={review.id} className="min-w-0"><div className="relative"><img src={review.media!} alt="Mídia enviada junto à avaliação do produto" loading="lazy" className="aspect-square w-full rounded-xl bg-surface object-cover" /><ReviewMediaRating rating={review.rating} /></div></div>)}</div>
          </div>
        </div>
      )}

      {protect && (
        <Sheet title="Proteção do cliente" onClose={() => setProtect(false)}>
          <div className="space-y-4 py-4">
            {[
              { I: RotateCcw, t: "Devolução gratuita", d: "Devolução sem custo em até 7 dias após o recebimento, conforme o Código de Defesa do Consumidor." },
              { I: Wallet, t: "Proteção e reembolso", d: "Se o pedido não chegar ou vier diferente do anunciado, você recebe o valor de volta." },
              { I: Lock, t: "Pagamento seguro", d: "Pagamento via PIX com dados protegidos por criptografia." },
              { I: Clock, t: "Garantia de pontualidade", d: "Acompanhe seu pedido do envio até a entrega no prazo informado." },
            ].map(({ I, t, d }) => (
              <div key={t} className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary"><I className="h-4.5 w-4.5 text-gold" /></span>
                <div><div className="text-[15px] font-bold">{t}</div><p className="text-[13.5px] leading-snug text-muted-foreground">{d}</p></div>
              </div>
            ))}
          </div>
        </Sheet>
      )}

      {added && (
        <div className="fixed bottom-[104px] left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-5 py-3 text-[15px] font-semibold text-ink-foreground shadow-lg">
          Adicionado ao carrinho
        </div>
      )}

      <div className="fixed bottom-0 left-1/2 z-40 grid w-full max-w-[480px] -translate-x-1/2 grid-cols-[auto_auto_48px_minmax(0,1fr)] items-center gap-3 border-t border-border bg-background px-3 pt-2.5 pb-safe">
        <Link to="/" className="flex flex-col items-center gap-0.5 text-[12px]"><Store className="h-6 w-6" />Loja</Link>
        <button onClick={() => update({ cartOpen: true })} className="relative flex flex-col items-center gap-0.5 text-[12px]">
          <ShoppingCart className="h-6 w-6" />Carrinho
          {cartCount(state.cart) > 0 && <span className="absolute -right-2 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">{cartCount(state.cart)}</span>}
        </button>
        <CartAddButton productId={p.id} label="Adicionar ao carrinho" onClick={startCart} className="h-12 w-12 rounded-2xl" />
        <button onClick={startBuy} className="h-12 rounded-full bg-primary text-primary-foreground shadow-[0_6px_18px_color-mix(in_oklab,var(--primary)_35%,transparent)]">
          <div className="text-[16px] font-extrabold leading-tight">Comprar agora</div>
          <div className="text-[12px] leading-tight opacity-90">{brl(shownPrice)} | Frete grátis</div>
        </button>
      </div>

      {sheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay" onClick={() => setSheet(null)}>
          <div className="relative w-full max-w-[480px]" onClick={(e) => e.stopPropagation()}>
            <button aria-label="Fechar" onClick={() => setSheet(null)} className="absolute -top-14 right-3 grid h-11 w-11 place-items-center rounded-full border-2 border-primary bg-background">
              <X className="h-5 w-5" />
            </button>
            <div className="max-h-[80dvh] overflow-y-auto rounded-t-3xl bg-background px-4 pb-safe pt-4">
              <div className="flex gap-2.5">
                <img src={(variant ?? p.variants[0])?.image} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-bold leading-snug">
                    {p.title} {variant ? `· ${variant.color}` : ""}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[12px]">
                    <span className="flex items-center gap-0.5 rounded bg-primary px-1 font-bold text-primary-foreground"><Zap className="h-3 w-3 fill-current" />Oferta Relâmpago</span>
                    <span className="font-bold text-primary"><OfferTimer /></span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[20px] font-extrabold text-primary">{brl(shownPrice * qty)}</span>
                      <span className="text-[12px] text-muted-foreground">no PIX</span>
                      
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-[12px]">
                      <span className="text-muted-foreground line-through">{brl(shownOriginal)}</span>{" "}
                      <span className="rounded bg-primary-soft px-1 font-bold text-primary">-{discountPct(shownPrice, shownOriginal)}%</span>
                    </div>
                    <div className="flex items-center rounded-lg border border-border text-[16px]">
                      <button aria-label="Diminuir" onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-9 w-9 place-items-center"><Minus className="h-4 w-4" /></button>
                      <span className="w-8 text-center font-semibold">{qty}</span>
                      <button aria-label="Aumentar" onClick={() => setQty(qty + 1)} className="grid h-9 w-9 place-items-center"><Plus className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between rounded-lg bg-teal-soft px-3 py-2.5 text-[13px]">
                <span className="capitalize">Receba até {formatEstimatedDelivery()}</span>
                <span><s className="text-muted-foreground">R$ 26,20</s> <b className="text-teal-ink">Grátis</b></span>
              </div>
              <div className="mt-4 text-[14.5px] font-bold">{isMondialBlender ? "Escolha a voltagem e depois a cor" : p.id === "arvore-natal-kit-87-enfeites" ? "Escolha a voltagem" : `Escolha modelo e cor (${p.variants.length})`}</div>
              {isMondialBlender ? (
                <div className="mt-3 space-y-4">
                  <div><div className="mb-2 text-[13px] font-bold">1. Voltagem</div><div className="flex gap-2">{["127V", "220V"].map((voltage) => <button key={voltage} type="button" onClick={() => setPickedVoltage(voltage)} aria-pressed={pickedVoltage === voltage} className={`inline-flex h-9 min-w-[78px] items-center justify-center gap-2 rounded-lg border px-3 text-[12px] font-bold ${pickedVoltage === voltage ? "border-primary bg-primary/5 text-primary" : "border-border bg-card"}`}>{voltage}{pickedVoltage === voltage && <Check className="h-3 w-3" />}</button>)}</div></div>
                  <div><div className="mb-2 text-[13px] font-bold">2. Cor</div><div className="grid grid-cols-3 gap-2">{colorVariants.map((v) => <button key={v.color} type="button" onClick={() => setPickedColor(v.color)} aria-pressed={pickedColor === v.color} className={`min-w-0 rounded-xl border p-1.5 text-center ${pickedColor === v.color ? "border-primary bg-primary/5" : "border-border bg-card"}`}><img src={v.image} alt={v.color} loading="lazy" decoding="async" width={64} height={64} className="mx-auto aspect-square w-full rounded-lg bg-surface object-contain" /><span className="mt-1 block text-[11px] font-bold">{v.color}</span>{pickedColor === v.color && <Check className="mx-auto mt-1 h-3 w-3 text-primary" />}</button>)}</div></div>
                </div>
              ) : optionKind === "voltage" ? (
                <div className="mt-2.5 flex items-center justify-start gap-2">{p.variants.map((v: Variant) => <button key={v.id} type="button" onClick={() => setPicked(v.id)} aria-pressed={picked === v.id} className={`inline-flex h-9 min-w-[76px] items-center justify-center gap-2 rounded-lg border px-3 text-[13px] font-bold transition-colors ${picked === v.id ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-foreground"}`}>{v.color}{picked === v.id && <Check className="h-3.5 w-3.5" />}</button>)}</div>
              ) : (
                <div className="mt-2.5 grid grid-cols-2 gap-2">{p.variants.map((v: Variant) => <button key={v.id} type="button" onClick={() => setPicked(v.id)} aria-pressed={picked === v.id} className={`flex min-w-0 items-center gap-2 rounded-xl border bg-card p-2 text-left transition-colors ${picked === v.id ? "border-primary bg-primary/5" : "border-border"}`}><img src={v.image} alt="" loading="lazy" decoding="async" width={48} height={48} className="h-12 w-12 shrink-0 rounded-lg bg-surface object-cover" /><span className="min-w-0 flex-1"><span className="block truncate text-[11.5px] font-bold">{v.line}</span><span className="mt-0.5 block line-clamp-2 text-[11px] leading-tight text-muted-foreground">{v.color}</span><span className="mt-1 block text-[12px] font-extrabold">{brl(v.price)}</span></span>{picked === v.id && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}</button>)}</div>
              )}
              <p className="mt-3 text-[13px] text-muted-foreground">{variant ? " " : "Selecione uma opção para continuar."}</p>
              <div className="mt-4 flex items-baseline justify-between border-t border-border pt-3">
                <span className="text-[16px] font-bold">Total ({unitCount * qty} itens)</span>
                <span className="text-[20px] font-extrabold">{brl(shownPrice * qty)}</span>
              </div>
              <button
                disabled={!variant}
                onClick={sheet === "cart" ? putInCart : go}
                className="mb-2 mt-2 h-12 w-full rounded-full bg-primary text-[16px] font-extrabold text-primary-foreground disabled:opacity-40"
              >
                {sheet === "cart" ? "Adicionar ao carrinho" : "Comprar agora"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
