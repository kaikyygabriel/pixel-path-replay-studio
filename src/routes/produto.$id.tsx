import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useLayoutEffect, useRef, useState } from "react";
import {
  ChevronLeft, ChevronRight, ChevronDown, Bookmark, Truck, ShieldCheck, Check, Store,
  ShoppingCart, X, Plus, Minus, Star, RotateCcw, Wallet, Lock, Clock,
} from "lucide-react";
import { TopBar, SiteFooter, Verified, Sheet } from "@/components/shop/chrome";
import { getProduct, store, brl, discountPct, unitPrice, type Variant } from "@/lib/catalog";
import { useCheckout, useOfferEnd, addToCart, type CartItem } from "@/lib/checkout";
import { CartAddButton } from "@/components/shop/cart-add-button";
import { formatEstimatedDelivery } from "@/lib/delivery";
import { ProductRecommendations } from "@/components/shop/product-recommendations";
import { FlashIcon, ReviewMediaRating } from "@/components/shop/product-presentation";

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

function OfferTimer() {
  const offer = useOfferEnd();
  return <>{offer.hms}</>;
}

const strip = ["FRETE GRÁTIS BRASIL", "ESPECIAL 25.12", "COMPRA PROTEGIDA", "ATÉ 90% OFF"];
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
  if (productId === "arvore-natal-kit-87-enfeites" || productId === "liquidificador-mondial-l99-fb" || productId === "projetor-hy300-duoseg") return []; // Não inventar depoimentos textuais sem conteúdo fornecido.
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
  // Mantém a maior concentração em 5 estrelas, mas representa também
  // avaliações de 4, 3, 2 e 1 estrela no gráfico.
  const fiveShare = Math.max(0, Math.min(0.98, (rating - 4) + 0.01));
  const fiveStars = Math.round(total * fiveShare);
  const threeStars = Math.round(total * 0.01);
  const twoStars = Math.round(total * 0.005);
  const oneStar = Math.round(total * 0.005);
  const fourStars = Math.max(0, total - fiveStars - threeStars - twoStars - oneStar);
  return { 5: fiveStars, 4: fourStars, 3: threeStars, 2: twoStars, 1: oneStar };
}

function ReviewStars({ rating, size = "h-3.5 w-3.5" }: { rating: number; size?: string }) {
  return <span className="inline-flex items-center" aria-label={rating.toFixed(1) + " de 5 estrelas"}>{[1,2,3,4,5].map((n) => {
    const fill = Math.max(0, Math.min(1, rating - (n - 1)));
    return <span key={n} className={"relative inline-block shrink-0 " + size}>
      <Star className="absolute inset-0 h-full w-full text-border" />
      <span className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - fill * 100}% 0 0)` }}>
        <Star className="absolute inset-0 h-full w-full fill-[#FFC43B] text-[#FFC43B]" />
      </span>
    </span>;
  })}</span>;
}

function ProductPage() {
  const { product: p } = Route.useLoaderData();
  const navigate = useNavigate();
  const { state, update } = useCheckout();
  const [idx, setIdx] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Cada nova abertura (ou troca) de produto começa sempre pela primeira foto.
  useLayoutEffect(() => {
    setIdx(0);
    if (galleryRef.current) galleryRef.current.scrollLeft = 0;
  }, [p.id]);
  const [sheet, setSheet] = useState<null | "buy" | "cart">(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [pickedVoltage, setPickedVoltage] = useState<string | null>(null);
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  // Ao navegar entre produtos, a descrição sempre volta ao estado recolhido.
  useLayoutEffect(() => {
    setDescriptionExpanded(false);
  }, [p.id]);
  const [added, setAdded] = useState(false);
  const [protect, setProtect] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<number | null>(null);
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [showAllReviewMedia, setShowAllReviewMedia] = useState(false);
  const isTclTv = p.id === "smart-tv-tcl-55p8k-qled-4k";
  const isKettle = p.id === "chaleira-unitermi-atacama";
  const isBrastoy = p.id === "brastoy-controle-remoto-k602";
  const isHotWheelsKit = p.id === "hot-wheels-kit-10-mattel-164";
  const isCookwareSet = p.id === "conjunto-panelas-antiaderente-10-pecas";
  const isChristmasOrnaments = p.id === "kit-24-bolas-natalinas-5cm";
  const isKarstenTowel = p.id === "jogo-toalhas-karsten";
  const isChristmasTree = p.id === "arvore-natal-kit-87-enfeites";
  const isMondialBlender = p.id === "liquidificador-mondial-l99-fb";
  const isMondialAirFryer = p.id === "air-fryer-oven-mondial-afon-12l";
  const isMondialAirFryer4L = p.id === "air-fryer-mondial-afn-40-bft";
  const isSquishyToy = p.id === "squishy-surpresa-colecionavel";
  const isProjector = p.id === "projetor-hy300-duoseg";


  const isChandonReserve = p.id === "espumante-chandon-reserve-brut-750ml";
  const chandonReviewPhotos = isChandonReserve ? [
    { id: "chandon-review-1", src: "/products/espumante-chandon-reserve-brut-750ml/reviews/avaliacao-chandon-1.png" },
    { id: "chandon-review-2", src: "/products/espumante-chandon-reserve-brut-750ml/reviews/avaliacao-chandon-2.png" },
    { id: "chandon-review-3", src: "/products/espumante-chandon-reserve-brut-750ml/reviews/avaliacao-chandon-3.png" },
    { id: "chandon-review-4", src: "/products/espumante-chandon-reserve-brut-750ml/reviews/avaliacao-chandon-4.png" },
    { id: "chandon-review-5", src: "/products/espumante-chandon-reserve-brut-750ml/reviews/avaliacao-chandon-5.png" },
    { id: "chandon-review-6", src: "/products/espumante-chandon-reserve-brut-750ml/reviews/avaliacao-chandon-6.png" },
    { id: "chandon-review-7", src: "/products/espumante-chandon-reserve-brut-750ml/reviews/avaliacao-chandon-7.png" },
    { id: "chandon-review-8", src: "/products/espumante-chandon-reserve-brut-750ml/reviews/avaliacao-chandon-8.png" },
    { id: "chandon-review-9", src: "/products/espumante-chandon-reserve-brut-750ml/reviews/avaliacao-chandon-9.png" },
    { id: "chandon-review-10", src: "/products/espumante-chandon-reserve-brut-750ml/reviews/avaliacao-chandon-10.png" },
    { id: "chandon-review-11", src: "/products/espumante-chandon-reserve-brut-750ml/reviews/avaliacao-chandon-11.png" },
    { id: "chandon-review-12", src: "/products/espumante-chandon-reserve-brut-750ml/reviews/avaliacao-chandon-12.png" },
    { id: "chandon-review-13", src: "/products/espumante-chandon-reserve-brut-750ml/reviews/avaliacao-chandon-13.png" },
    { id: "chandon-review-14", src: "/products/espumante-chandon-reserve-brut-750ml/reviews/avaliacao-chandon-14.png" }
  ] : [];

  const isBasikePowerBank = p.id === "power-bank-basike-10000mah-preto";
  const basikePowerBankReviewPhotos = isBasikePowerBank ? [
    { id: "basike-powerbank-review-1", src: "/products/power-bank-basike-10000mah-preto/reviews/avaliacao-powerbank-1.png" },
    { id: "basike-powerbank-review-2", src: "/products/power-bank-basike-10000mah-preto/reviews/avaliacao-powerbank-2.png" },
    { id: "basike-powerbank-review-3", src: "/products/power-bank-basike-10000mah-preto/reviews/avaliacao-powerbank-3.png" },
    { id: "basike-powerbank-review-4", src: "/products/power-bank-basike-10000mah-preto/reviews/avaliacao-powerbank-4.png" },
    { id: "basike-powerbank-review-5", src: "/products/power-bank-basike-10000mah-preto/reviews/avaliacao-powerbank-5.png" },
    { id: "basike-powerbank-review-6", src: "/products/power-bank-basike-10000mah-preto/reviews/avaliacao-powerbank-6.png" },
    { id: "basike-powerbank-review-7", src: "/products/power-bank-basike-10000mah-preto/reviews/avaliacao-powerbank-7.png" },
    { id: "basike-powerbank-review-8", src: "/products/power-bank-basike-10000mah-preto/reviews/avaliacao-powerbank-8.png" },
    { id: "basike-powerbank-review-9", src: "/products/power-bank-basike-10000mah-preto/reviews/avaliacao-powerbank-9.png" },
    { id: "basike-powerbank-review-10", src: "/products/power-bank-basike-10000mah-preto/reviews/avaliacao-powerbank-10.png" },
    { id: "basike-powerbank-review-11", src: "/products/power-bank-basike-10000mah-preto/reviews/avaliacao-powerbank-11.png" },
    { id: "basike-powerbank-review-12", src: "/products/power-bank-basike-10000mah-preto/reviews/avaliacao-powerbank-12.png" }
  ] : [];

  const isMondialFan = p.id === "ventilador-mondial-super-turbo-8-pas-40cm";
  const mondialFanReviewPhotos = isMondialFan ? [
    { id: "mondial-fan-review-1", src: "/products/ventilador-mondial-super-turbo-8-pas-40cm/reviews/avaliacao-ventilador-mondial-1.png" },
    { id: "mondial-fan-review-2", src: "/products/ventilador-mondial-super-turbo-8-pas-40cm/reviews/avaliacao-ventilador-mondial-2.png" },
    { id: "mondial-fan-review-3", src: "/products/ventilador-mondial-super-turbo-8-pas-40cm/reviews/avaliacao-ventilador-mondial-3.png" },
    { id: "mondial-fan-review-4", src: "/products/ventilador-mondial-super-turbo-8-pas-40cm/reviews/avaliacao-ventilador-mondial-4.png" },
    { id: "mondial-fan-review-5", src: "/products/ventilador-mondial-super-turbo-8-pas-40cm/reviews/avaliacao-ventilador-mondial-5.png" },
    { id: "mondial-fan-review-6", src: "/products/ventilador-mondial-super-turbo-8-pas-40cm/reviews/avaliacao-ventilador-mondial-6.png" },
    { id: "mondial-fan-review-7", src: "/products/ventilador-mondial-super-turbo-8-pas-40cm/reviews/avaliacao-ventilador-mondial-7.png" },
    { id: "mondial-fan-review-8", src: "/products/ventilador-mondial-super-turbo-8-pas-40cm/reviews/avaliacao-ventilador-mondial-8.png" },
    { id: "mondial-fan-review-9", src: "/products/ventilador-mondial-super-turbo-8-pas-40cm/reviews/avaliacao-ventilador-mondial-9.png" }
  ] : [];

  const isXboxWhiteController = p.id === "controle-sem-fio-xbox-branco";
  const xboxControllerReviewPhotos = isXboxWhiteController ? [
    { id: "xbox-controller-review-1", src: "/products/controle-sem-fio-xbox-branco/reviews/avaliacao-controle-xbox-1.png" },
    { id: "xbox-controller-review-2", src: "/products/controle-sem-fio-xbox-branco/reviews/avaliacao-controle-xbox-2.png" },
    { id: "xbox-controller-review-3", src: "/products/controle-sem-fio-xbox-branco/reviews/avaliacao-controle-xbox-3.png" },
    { id: "xbox-controller-review-4", src: "/products/controle-sem-fio-xbox-branco/reviews/avaliacao-controle-xbox-4.png" },
    { id: "xbox-controller-review-5", src: "/products/controle-sem-fio-xbox-branco/reviews/avaliacao-controle-xbox-5.png" },
    { id: "xbox-controller-review-6", src: "/products/controle-sem-fio-xbox-branco/reviews/avaliacao-controle-xbox-6.png" },
    { id: "xbox-controller-review-7", src: "/products/controle-sem-fio-xbox-branco/reviews/avaliacao-controle-xbox-7.png" },
    { id: "xbox-controller-review-8", src: "/products/controle-sem-fio-xbox-branco/reviews/avaliacao-controle-xbox-8.png" },
    { id: "xbox-controller-review-9", src: "/products/controle-sem-fio-xbox-branco/reviews/avaliacao-controle-xbox-9.png" },
    { id: "xbox-controller-review-10", src: "/products/controle-sem-fio-xbox-branco/reviews/avaliacao-controle-xbox-10.png" },
    { id: "xbox-controller-review-11", src: "/products/controle-sem-fio-xbox-branco/reviews/avaliacao-controle-xbox-11.png" }
  ] : [];

  const isOmoLaundry = p.id === "omo-lavanderia-profissional-7l";
  const omoReviewPhotos = isOmoLaundry ? [
    { id: "omo-laundry-review-1", src: "/products/omo-lavanderia-profissional-7l/reviews/avaliacao-omo-1.png" },
    { id: "omo-laundry-review-2", src: "/products/omo-lavanderia-profissional-7l/reviews/avaliacao-omo-2.png" },
    { id: "omo-laundry-review-3", src: "/products/omo-lavanderia-profissional-7l/reviews/avaliacao-omo-3.png" },
    { id: "omo-laundry-review-4", src: "/products/omo-lavanderia-profissional-7l/reviews/avaliacao-omo-4.png" },
    { id: "omo-laundry-review-5", src: "/products/omo-lavanderia-profissional-7l/reviews/avaliacao-omo-5.png" },
    { id: "omo-laundry-review-6", src: "/products/omo-lavanderia-profissional-7l/reviews/avaliacao-omo-6.png" },
    { id: "omo-laundry-review-7", src: "/products/omo-lavanderia-profissional-7l/reviews/avaliacao-omo-7.png" },
    { id: "omo-laundry-review-8", src: "/products/omo-lavanderia-profissional-7l/reviews/avaliacao-omo-8.png" },
    { id: "omo-laundry-review-9", src: "/products/omo-lavanderia-profissional-7l/reviews/avaliacao-omo-9.png" },
    { id: "omo-laundry-review-10", src: "/products/omo-lavanderia-profissional-7l/reviews/avaliacao-omo-10.png" },
    { id: "omo-laundry-review-11", src: "/products/omo-lavanderia-profissional-7l/reviews/avaliacao-omo-11.png" },
    { id: "omo-laundry-review-12", src: "/products/omo-lavanderia-profissional-7l/reviews/avaliacao-omo-12.png" },
    { id: "omo-laundry-review-13", src: "/products/omo-lavanderia-profissional-7l/reviews/avaliacao-omo-13.png" },
    { id: "omo-laundry-review-14", src: "/products/omo-lavanderia-profissional-7l/reviews/avaliacao-omo-14.png" }
  ] : [];

  const isT900Smartwatch = p.id === "smartwatch-t900-s10-ultra-pro";
  const smartwatchReviewPhotos = isT900Smartwatch ? [
    { id: "t900-smartwatch-review-1", src: "/products/smartwatch-t900-s10-ultra-pro/reviews/avaliacao-smartwatch-1.png" },
    { id: "t900-smartwatch-review-2", src: "/products/smartwatch-t900-s10-ultra-pro/reviews/avaliacao-smartwatch-2.png" },
    { id: "t900-smartwatch-review-3", src: "/products/smartwatch-t900-s10-ultra-pro/reviews/avaliacao-smartwatch-3.png" },
    { id: "t900-smartwatch-review-4", src: "/products/smartwatch-t900-s10-ultra-pro/reviews/avaliacao-smartwatch-4.png" },
    { id: "t900-smartwatch-review-5", src: "/products/smartwatch-t900-s10-ultra-pro/reviews/avaliacao-smartwatch-5.png" },
    { id: "t900-smartwatch-review-6", src: "/products/smartwatch-t900-s10-ultra-pro/reviews/avaliacao-smartwatch-6.png" },
    { id: "t900-smartwatch-review-7", src: "/products/smartwatch-t900-s10-ultra-pro/reviews/avaliacao-smartwatch-7.png" },
    { id: "t900-smartwatch-review-8", src: "/products/smartwatch-t900-s10-ultra-pro/reviews/avaliacao-smartwatch-8.png" },
    { id: "t900-smartwatch-review-9", src: "/products/smartwatch-t900-s10-ultra-pro/reviews/avaliacao-smartwatch-9.png" },
    { id: "t900-smartwatch-review-10", src: "/products/smartwatch-t900-s10-ultra-pro/reviews/avaliacao-smartwatch-10.png" },
    { id: "t900-smartwatch-review-11", src: "/products/smartwatch-t900-s10-ultra-pro/reviews/avaliacao-smartwatch-11.png" },
    { id: "t900-smartwatch-review-12", src: "/products/smartwatch-t900-s10-ultra-pro/reviews/avaliacao-smartwatch-12.png" },
    { id: "t900-smartwatch-review-13", src: "/products/smartwatch-t900-s10-ultra-pro/reviews/avaliacao-smartwatch-13.png" },
    { id: "t900-smartwatch-review-14", src: "/products/smartwatch-t900-s10-ultra-pro/reviews/avaliacao-smartwatch-14.png" }
  ] : [];

  const isJblBoombox = p.id === "jbl-boombox-4";
  const jblReviewPhotos = isJblBoombox ? [
    { id: "jbl-boombox-review-1", src: "/products/jbl-boombox-4/reviews/avaliacao-jbl-boombox-1.png" },
    { id: "jbl-boombox-review-2", src: "/products/jbl-boombox-4/reviews/avaliacao-jbl-boombox-2.png" },
    { id: "jbl-boombox-review-3", src: "/products/jbl-boombox-4/reviews/avaliacao-jbl-boombox-3.png" },
    { id: "jbl-boombox-review-4", src: "/products/jbl-boombox-4/reviews/avaliacao-jbl-boombox-4.png" },
    { id: "jbl-boombox-review-5", src: "/products/jbl-boombox-4/reviews/avaliacao-jbl-boombox-5.png" },
    { id: "jbl-boombox-review-6", src: "/products/jbl-boombox-4/reviews/avaliacao-jbl-boombox-6.png" },
    { id: "jbl-boombox-review-7", src: "/products/jbl-boombox-4/reviews/avaliacao-jbl-boombox-7.png" },
    { id: "jbl-boombox-review-8", src: "/products/jbl-boombox-4/reviews/avaliacao-jbl-boombox-8.png" },
    { id: "jbl-boombox-review-9", src: "/products/jbl-boombox-4/reviews/avaliacao-jbl-boombox-9.png" },
    { id: "jbl-boombox-review-10", src: "/products/jbl-boombox-4/reviews/avaliacao-jbl-boombox-10.png" },
    { id: "jbl-boombox-review-11", src: "/products/jbl-boombox-4/reviews/avaliacao-jbl-boombox-11.png" },
    { id: "jbl-boombox-review-12", src: "/products/jbl-boombox-4/reviews/avaliacao-jbl-boombox-12.png" },
    { id: "jbl-boombox-review-13", src: "/products/jbl-boombox-4/reviews/avaliacao-jbl-boombox-13.png" },
    { id: "jbl-boombox-review-14", src: "/products/jbl-boombox-4/reviews/avaliacao-jbl-boombox-14.png" },
    { id: "jbl-boombox-review-15", src: "/products/jbl-boombox-4/reviews/avaliacao-jbl-boombox-15.png" }
  ] : [];

  const projectorReviewPhotos = isProjector ? [
    { id: "projector-review-1", src: "/products/projetor-hy300-duoseg/reviews/avaliacao-projetor-hy300-01.png" },
    { id: "projector-review-2", src: "/products/projetor-hy300-duoseg/reviews/avaliacao-projetor-hy300-02.png" },
    { id: "projector-review-3", src: "/products/projetor-hy300-duoseg/reviews/avaliacao-projetor-hy300-03.png" },
    { id: "projector-review-4", src: "/products/projetor-hy300-duoseg/reviews/avaliacao-projetor-hy300-04.png" },
    { id: "projector-review-5", src: "/products/projetor-hy300-duoseg/reviews/avaliacao-projetor-hy300-05.png" },
    { id: "projector-review-6", src: "/products/projetor-hy300-duoseg/reviews/avaliacao-projetor-hy300-06.png" },
    { id: "projector-review-7", src: "/products/projetor-hy300-duoseg/reviews/avaliacao-projetor-hy300-07.png" },
    { id: "projector-review-8", src: "/products/projetor-hy300-duoseg/reviews/avaliacao-projetor-hy300-08.png" },
    { id: "projector-review-9", src: "/products/projetor-hy300-duoseg/reviews/avaliacao-projetor-hy300-09.png" },
    { id: "projector-review-10", src: "/products/projetor-hy300-duoseg/reviews/avaliacao-projetor-hy300-10.png" },
    { id: "projector-review-11", src: "/products/projetor-hy300-duoseg/reviews/avaliacao-projetor-hy300-11.png" },
  ] : [];
  const kettleReviewPhotos = isKettle ? [
    { id: "kettle-review-1", src: "/products/chaleira-unitermi-atacama/reviews/avaliacao-chaleira-1.png" },
    { id: "kettle-review-2", src: "/products/chaleira-unitermi-atacama/reviews/avaliacao-chaleira-2.png" },
    { id: "kettle-review-3", src: "/products/chaleira-unitermi-atacama/reviews/avaliacao-chaleira-3.png" },
    { id: "kettle-review-4", src: "/products/chaleira-unitermi-atacama/reviews/avaliacao-chaleira-4.png" },
    { id: "kettle-review-5", src: "/products/chaleira-unitermi-atacama/reviews/avaliacao-chaleira-5.png" },
    { id: "kettle-review-6", src: "/products/chaleira-unitermi-atacama/reviews/avaliacao-chaleira-6.png" },
    { id: "kettle-review-7", src: "/products/chaleira-unitermi-atacama/reviews/avaliacao-chaleira-7.png" },
  ] : [];
  const christmasOrnamentsReviewPhotos = isChristmasOrnaments ? [
    { id: "christmas-ornaments-review-1", src: "/products/kit-24-bolas-natalinas-5cm/reviews/avaliacao-bolas-natalinas-1.png" },
    { id: "christmas-ornaments-review-2", src: "/products/kit-24-bolas-natalinas-5cm/reviews/avaliacao-bolas-natalinas-2.png" },
    { id: "christmas-ornaments-review-3", src: "/products/kit-24-bolas-natalinas-5cm/reviews/avaliacao-bolas-natalinas-3.png" },
    { id: "christmas-ornaments-review-4", src: "/products/kit-24-bolas-natalinas-5cm/reviews/avaliacao-bolas-natalinas-4.png" },
    { id: "christmas-ornaments-review-5", src: "/products/kit-24-bolas-natalinas-5cm/reviews/avaliacao-bolas-natalinas-5.png" },
    { id: "christmas-ornaments-review-6", src: "/products/kit-24-bolas-natalinas-5cm/reviews/avaliacao-bolas-natalinas-6.png" },
    { id: "christmas-ornaments-review-7", src: "/products/kit-24-bolas-natalinas-5cm/reviews/avaliacao-bolas-natalinas-7.png" }
  ] : [];
  const cookwareReviewPhotos = isCookwareSet ? [
    { id: "cookware-review-1", src: "/products/conjunto-panelas-antiaderente-10-pecas/reviews/avaliacao-panelas-1.png" },
    { id: "cookware-review-2", src: "/products/conjunto-panelas-antiaderente-10-pecas/reviews/avaliacao-panelas-2.png" },
    { id: "cookware-review-3", src: "/products/conjunto-panelas-antiaderente-10-pecas/reviews/avaliacao-panelas-3.png" },
    { id: "cookware-review-4", src: "/products/conjunto-panelas-antiaderente-10-pecas/reviews/avaliacao-panelas-4.png" },
    { id: "cookware-review-5", src: "/products/conjunto-panelas-antiaderente-10-pecas/reviews/avaliacao-panelas-5.png" },
    { id: "cookware-review-6", src: "/products/conjunto-panelas-antiaderente-10-pecas/reviews/avaliacao-panelas-6.png" },
    { id: "cookware-review-7", src: "/products/conjunto-panelas-antiaderente-10-pecas/reviews/avaliacao-panelas-7.png" },
    { id: "cookware-review-8", src: "/products/conjunto-panelas-antiaderente-10-pecas/reviews/avaliacao-panelas-8.png" },
    { id: "cookware-review-9", src: "/products/conjunto-panelas-antiaderente-10-pecas/reviews/avaliacao-panelas-9.png" },
    { id: "cookware-review-10", src: "/products/conjunto-panelas-antiaderente-10-pecas/reviews/avaliacao-panelas-10.png" },
    { id: "cookware-review-11", src: "/products/conjunto-panelas-antiaderente-10-pecas/reviews/avaliacao-panelas-11.png" },
    { id: "cookware-review-12", src: "/products/conjunto-panelas-antiaderente-10-pecas/reviews/avaliacao-panelas-12.png" }
  ] : [];
  const hotWheelsReviewPhotos = isHotWheelsKit ? [
    { id: "hotwheels-review-1", src: "/products/hot-wheels-kit-10-mattel-164/reviews/avaliacao-hotwheels-1.png" },
    { id: "hotwheels-review-2", src: "/products/hot-wheels-kit-10-mattel-164/reviews/avaliacao-hotwheels-2.png" },
    { id: "hotwheels-review-3", src: "/products/hot-wheels-kit-10-mattel-164/reviews/avaliacao-hotwheels-3.png" },
    { id: "hotwheels-review-4", src: "/products/hot-wheels-kit-10-mattel-164/reviews/avaliacao-hotwheels-4.png" },
    { id: "hotwheels-review-5", src: "/products/hot-wheels-kit-10-mattel-164/reviews/avaliacao-hotwheels-5.png" },
    { id: "hotwheels-review-6", src: "/products/hot-wheels-kit-10-mattel-164/reviews/avaliacao-hotwheels-6.png" },
    { id: "hotwheels-review-7", src: "/products/hot-wheels-kit-10-mattel-164/reviews/avaliacao-hotwheels-7.png" },
    { id: "hotwheels-review-8", src: "/products/hot-wheels-kit-10-mattel-164/reviews/avaliacao-hotwheels-8.png" },
    { id: "hotwheels-review-9", src: "/products/hot-wheels-kit-10-mattel-164/reviews/avaliacao-hotwheels-9.png" }
  ] : [];
  const brastoyReviewPhotos = isBrastoy ? [
    { id: "brastoy-review-1", src: "/products/brastoy-controle-remoto-k602/reviews/avaliacao-brastoy-1.png" },
    { id: "brastoy-review-2", src: "/products/brastoy-controle-remoto-k602/reviews/avaliacao-brastoy-2.png" },
    { id: "brastoy-review-3", src: "/products/brastoy-controle-remoto-k602/reviews/avaliacao-brastoy-3.png" },
    { id: "brastoy-review-4", src: "/products/brastoy-controle-remoto-k602/reviews/avaliacao-brastoy-4.png" },
    { id: "brastoy-review-5", src: "/products/brastoy-controle-remoto-k602/reviews/avaliacao-brastoy-5.png" },
    { id: "brastoy-review-6", src: "/products/brastoy-controle-remoto-k602/reviews/avaliacao-brastoy-6.png" },
    { id: "brastoy-review-7", src: "/products/brastoy-controle-remoto-k602/reviews/avaliacao-brastoy-7.png" },
    { id: "brastoy-review-8", src: "/products/brastoy-controle-remoto-k602/reviews/avaliacao-brastoy-8.png" }
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
  const airFryer4LReviewPhotos = isMondialAirFryer4L ? [
    { id: "air-fryer-4l-review-1", src: "/products/air-fryer-mondial-afn-40-bft/reviews/avaliacao-airfryer-afn40-1.png" },
    { id: "air-fryer-4l-review-2", src: "/products/air-fryer-mondial-afn-40-bft/reviews/avaliacao-airfryer-afn40-2.png" },
    { id: "air-fryer-4l-review-3", src: "/products/air-fryer-mondial-afn-40-bft/reviews/avaliacao-airfryer-afn40-3.png" },
    { id: "air-fryer-4l-review-4", src: "/products/air-fryer-mondial-afn-40-bft/reviews/avaliacao-airfryer-afn40-4.png" },
    { id: "air-fryer-4l-review-5", src: "/products/air-fryer-mondial-afn-40-bft/reviews/avaliacao-airfryer-afn40-5.png" },
    { id: "air-fryer-4l-review-6", src: "/products/air-fryer-mondial-afn-40-bft/reviews/avaliacao-airfryer-afn40-6.png" },
    { id: "air-fryer-4l-review-7", src: "/products/air-fryer-mondial-afn-40-bft/reviews/avaliacao-airfryer-afn40-7.png" },
    { id: "air-fryer-4l-review-8", src: "/products/air-fryer-mondial-afn-40-bft/reviews/avaliacao-airfryer-afn40-8.png" },
    { id: "air-fryer-4l-review-9", src: "/products/air-fryer-mondial-afn-40-bft/reviews/avaliacao-airfryer-afn40-9.png" },
    { id: "air-fryer-4l-review-10", src: "/products/air-fryer-mondial-afn-40-bft/reviews/avaliacao-airfryer-afn40-10.png" },
    { id: "air-fryer-4l-review-11", src: "/products/air-fryer-mondial-afn-40-bft/reviews/avaliacao-airfryer-afn40-11.png" }
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
  // Mídias e textos demonstrativos do produto; não representam avaliações verificadas de compradores.
  const isBedsheetSet = p.id === "jogo-lencol-casal-400-fios";
  const bedsheetReviewPhotos = isBedsheetSet ? [
    { id: "bedsheet-review-1", src: "/products/jogo-lencol-casal-400-fios/reviews/avaliacao-lencol-1.png" },
    { id: "bedsheet-review-2", src: "/products/jogo-lencol-casal-400-fios/reviews/avaliacao-lencol-2.png" },
    { id: "bedsheet-review-3", src: "/products/jogo-lencol-casal-400-fios/reviews/avaliacao-lencol-3.png" },
    { id: "bedsheet-review-4", src: "/products/jogo-lencol-casal-400-fios/reviews/avaliacao-lencol-4.png" },
    { id: "bedsheet-review-5", src: "/products/jogo-lencol-casal-400-fios/reviews/avaliacao-lencol-5.png" },
    { id: "bedsheet-review-6", src: "/products/jogo-lencol-casal-400-fios/reviews/avaliacao-lencol-6.png" },
    { id: "bedsheet-review-7", src: "/products/jogo-lencol-casal-400-fios/reviews/avaliacao-lencol-7.png" },
    { id: "bedsheet-review-8", src: "/products/jogo-lencol-casal-400-fios/reviews/avaliacao-lencol-8.png" }
  ] : [];
  const isTramontinaKnives = p.id === "jogo-facas-tramontina-plenus-9-pecas";
  const tramontinaKnifeReviewPhotos = isTramontinaKnives ? [
    { id: "tramontina-knives-review-1", src: "/products/jogo-facas-tramontina-plenus/reviews/avaliacao-facas-tramontina-1.png" },
    { id: "tramontina-knives-review-2", src: "/products/jogo-facas-tramontina-plenus/reviews/avaliacao-facas-tramontina-2.png" },
    { id: "tramontina-knives-review-4", src: "/products/jogo-facas-tramontina-plenus/reviews/avaliacao-facas-tramontina-4.png" },
    { id: "tramontina-knives-review-5", src: "/products/jogo-facas-tramontina-plenus/reviews/avaliacao-facas-tramontina-5.png" }
  ] : [];
  // Oito registros demonstrativos para validar o layout: cinco fotos 5★, duas notas 4★ e uma nota 5★.
  const isIntelbrasCamera = p.id === "camera-intelbras-im5-plus";
  const intelbrasReviewPhotos = isIntelbrasCamera ? [
    { id: "intelbras-review-1", src: "/products/camera-intelbras-im5-plus/reviews/camera-avaliacao-1.png" },
    { id: "intelbras-review-2", src: "/products/camera-intelbras-im5-plus/reviews/camera-avaliacao-2.png" },
    { id: "intelbras-review-3", src: "/products/camera-intelbras-im5-plus/reviews/camera-avaliacao-3.png" },
    { id: "intelbras-review-4", src: "/products/camera-intelbras-im5-plus/reviews/camera-avaliacao-4.png" },
    { id: "intelbras-review-5", src: "/products/camera-intelbras-im5-plus/reviews/camera-avaliacao-5.png" },
    { id: "intelbras-review-6", src: "/products/camera-intelbras-im5-plus/reviews/camera-avaliacao-6.png" },
    { id: "intelbras-review-7", src: "/products/camera-intelbras-im5-plus/reviews/camera-avaliacao-7.png" },
    { id: "intelbras-review-8", src: "/products/camera-intelbras-im5-plus/reviews/camera-avaliacao-8.png" },
    { id: "intelbras-review-9", src: "/products/camera-intelbras-im5-plus/reviews/camera-avaliacao-9.png" },
    { id: "intelbras-review-10", src: "/products/camera-intelbras-im5-plus/reviews/camera-avaliacao-10.png" },
    { id: "intelbras-review-11", src: "/products/camera-intelbras-im5-plus/reviews/camera-avaliacao-11.png" },
    { id: "intelbras-review-12", src: "/products/camera-intelbras-im5-plus/reviews/camera-avaliacao-12.png" }
  ] : [];
  const isPurifierElectrolux = p.id === "purificador-electrolux-pa26g";
  const purifierReviewPhotos = isPurifierElectrolux ? [{ id: "purifier-review-1", src: "/products/purificador-electrolux-pa26g/reviews/avaliacao-purificador-1.webp" }, { id: "purifier-review-2", src: "/products/purificador-electrolux-pa26g/reviews/avaliacao-purificador-2.webp" }, { id: "purifier-review-3", src: "/products/purificador-electrolux-pa26g/reviews/avaliacao-purificador-3.webp" }, { id: "purifier-review-4", src: "/products/purificador-electrolux-pa26g/reviews/avaliacao-purificador-4.webp" }, { id: "purifier-review-5", src: "/products/purificador-electrolux-pa26g/reviews/avaliacao-purificador-5.webp" }, { id: "purifier-review-6", src: "/products/purificador-electrolux-pa26g/reviews/avaliacao-purificador-6.webp" }, { id: "purifier-review-7", src: "/products/purificador-electrolux-pa26g/reviews/avaliacao-purificador-7.webp" }, { id: "purifier-review-8", src: "/products/purificador-electrolux-pa26g/reviews/avaliacao-purificador-8.webp" }, { id: "purifier-review-9", src: "/products/purificador-electrolux-pa26g/reviews/avaliacao-purificador-9.webp" }, { id: "purifier-review-10", src: "/products/purificador-electrolux-pa26g/reviews/avaliacao-purificador-10.webp" }, { id: "purifier-review-11", src: "/products/purificador-electrolux-pa26g/reviews/avaliacao-purificador-11.webp" }, { id: "purifier-review-12", src: "/products/purificador-electrolux-pa26g/reviews/avaliacao-purificador-12.webp" }, { id: "purifier-review-13", src: "/products/purificador-electrolux-pa26g/reviews/avaliacao-purificador-13.webp" }, { id: "purifier-review-14", src: "/products/purificador-electrolux-pa26g/reviews/avaliacao-purificador-14.webp" }, { id: "purifier-review-15", src: "/products/purificador-electrolux-pa26g/reviews/avaliacao-purificador-15.webp" }] : [];
  const demoReviews: DemoReview[] = isBedsheetSet ? bedsheetReviewPhotos.map((photo) => ({
    id: photo.id, name: "Registro de imagem", date: "", rating: 0,
    text: "Imagem disponibilizada na pasta de mídias do produto.", media: photo.src,
  })) : isTramontinaKnives ? [
    ...tramontinaKnifeReviewPhotos.map((photo, i) => ({
      id: photo.id,
      name: ["Marina T.", "Rogério A.", "Camila F.", "Sérgio M."][i] ?? "",
      date: ["há 2 dias", "há 6 dias", "há 11 dias", "há 4 dias"][i] ?? "",
      rating: [5, 5, 4, 5][i] ?? 5,
      text: [
        "O conjunto é bem completo para a rotina. Deixei as peças mais usadas no suporte e ficou tudo organizado na cozinha.",
        "Comprei pensando nos churrascos de domingo. Gostei de ter facas diferentes à mão, sem precisar improvisar com as que uso para outras coisas.",
        "As lâminas têm bom acabamento e os cabos são confortáveis de segurar. Pelo tamanho do conjunto, achei uma compra interessante.",
        "Visual simples e bonito, combina com a cozinha. As facas cortam bem os alimentos que preparei até agora."
      ][i] ?? "",
      media: photo.src,
    })),
    { id: "tramontina-knives-text-5", name: "Patrícia R.", date: "há 5 dias", rating: 5, text: "Gostei de ter várias opções para cada preparo. O cabo preto tem aparência discreta e o conjunto fica bonito guardado.", media: null },
    { id: "tramontina-knives-text-6", name: "Eduardo C.", date: "há 9 dias", rating: 5, text: "Chegou bem acondicionado. As peças parecem resistentes e já usei algumas para cortar legumes, carnes e pão.", media: null },
    { id: "tramontina-knives-text-7", name: "Lívia P.", date: "há 13 dias", rating: 4, text: "É um kit prático para quem está montando a cozinha. Eu só recomendo conferir o espaço disponível para guardar todas as peças.", media: null },
    { id: "tramontina-knives-text-8", name: "Marcelo G.", date: "há 7 dias", rating: 5, text: "Comprei para substituir facas antigas e gostei da variedade. Para os preparos do dia a dia, está atendendo muito bem.", media: null },
  ] : isIntelbrasCamera ? intelbrasReviewPhotos.map((photo) => ({
    id: photo.id, name: "Registro de imagem", date: "", rating: 0,
    text: "Imagem disponibilizada na pasta de mídias do produto.", media: photo.src,
  })) : isPurifierElectrolux ? [
    ...purifierReviewPhotos.map((photo, i) => ({
      id: photo.id, name: ["Mariana C.","Rafael M.","Camila S.","André P.","Juliana R.","Fernanda L.","Bruno T.","Patrícia A.","Lucas M.","Renata F.","Diego C.","Aline V.","Marcelo G.","Beatriz N.","Carolina D."][i] ?? "", date: ["há 2 dias","há 5 dias","há 1 dia","há 8 dias","há 4 dias","há 11 dias","há 6 dias","há 3 dias","há 13 dias","há 7 dias","há 15 dias","há 9 dias","há 12 dias","há 16 dias","há 10 dias"][i] ?? "",
      rating: [5,5,5,5,5,4,5,5,5,5,5,4,5,5,5][i] ?? 5, text: ["A água sai bem gelada e o painel é simples de usar. O acabamento prata ficou bonito na cozinha.","Gostei bastante do purificador. A opção de água natural e gelada facilita muito no dia a dia.","Instalei na cozinha e ficou ótimo. A bandeja ajuda a apoiar o copo e é fácil de retirar para limpar.","O painel touch responde bem e achei prático escolher a quantidade de água.","Chegou certinho e está funcionando direitinho. A água gelada é ótima para os dias quentes.","Produto bonito e compacto para o espaço que eu tinha. Só precisei conferir a pressão da água antes da instalação.","Gostei da praticidade do fluxo contínuo e da opção de controlar a quantidade servida.","O acabamento é bonito e combina com os outros eletrodomésticos. Até agora, tudo certo com o funcionamento.","A água fica em uma temperatura agradável e o painel é bem intuitivo. Foi uma boa escolha para casa.","Achei fácil de usar e gostei do aviso luminoso para lembrar da troca do filtro.","Instalado e funcionando. A opção bivolt ajudou porque não precisei escolher tensão na compra.","Gostei do design e da filtragem. A instalação exigiu atenção à pressão da água, então vale conferir isso antes.","O purificador atende bem nossa rotina. A bandeja removível facilita bastante a limpeza.","Muito prático para encher garrafas e copos. O fluxo contínuo ajuda quando preciso de mais água.","Ficou bonito na bancada e a água gelada sai bem. Gostei da experiência até aqui."][i] ?? "", media: photo.src,
    })),
    { id: "purifier-review-text-16", name: "Elaine M.", date: "há 4 dias", rating: 5, text: "O painel é fácil de entender e gostei de poder escolher a quantidade de água. Está sendo bem útil na rotina.", media: null },
    { id: "purifier-review-text-17", name: "Thiago R.", date: "há 9 dias", rating: 5, text: "O acabamento prata é bonito e a água gelada funciona bem. Antes de instalar, conferi a pressão da água como recomendado.", media: null },
    { id: "purifier-review-text-18", name: "Sônia P.", date: "há 14 dias", rating: 4, text: "Gostei do produto e da praticidade. A bandeja sai para limpar e o alerta do filtro é um detalhe importante.", media: null },
    { id: "purifier-review-text-19", name: "Gabriel A.", date: "há 6 dias", rating: 5, text: "Boa opção para ter água natural ou gelada sem ocupar muito espaço. O uso pelo painel touch é simples.", media: null },
  ] : isChandonReserve ? [
    ...chandonReviewPhotos.map((photo, i) => ({
      id: photo.id,
      name: ["Mariana F.","Camila R.","Patrícia M.","Juliana A.","Fernanda C.","Renata S.","Aline P.","Bruna L.","Débora T.","Carolina G.","Vanessa B.","Priscila D.","Michele V.","Sabrina H."][i] ?? "",
      date: ["há 2 dias","há 7 dias","há 1 dia","há 12 dias","há 4 dias","há 16 dias","há 9 dias","há 3 dias","há 18 dias","há 6 dias","há 14 dias","há 5 dias","há 10 dias","há 8 dias"][i] ?? "",
      rating: 5,
      text: ["Levei para um jantar em família e todo mundo gostou. É leve e bem agradável.","Comprei para comemorar uma data especial. Chegou bem embalado e geladinho depois de colocar na geladeira.","Tem um sabor delicado, sem ficar enjoativo. Servi com petiscos e combinou muito.","Foi para um almoço aqui em casa e fez sucesso. Gostei bastante das borbulhas e do equilíbrio.","Já conhecia o Chandon e comprei novamente para receber uns amigos. Veio tudo certinho.","Usei no brinde do nosso aniversário. Uma opção gostosa para uma ocasião especial.","Gostei bastante, principalmente servido bem gelado. Harmonizou com os frutos do mar.","Comprei para presentear e a pessoa adorou. A embalagem chegou em boas condições.","Espumante leve e fresco, ótimo para acompanhar uma refeição sem pesar.","Foi minha escolha para um jantar de comemoração. Todo mundo elogiou o sabor.","Chegou direitinho. Deixei gelar e servi no fim de semana, combinou super com a ocasião.","Gostei do aroma frutado e do sabor equilibrado. Compraria novamente para uma celebração.","Uma escolha certeira para brindar em casa. Não é muito doce e achei bem agradável.","Comprei para levar em um encontro com amigas e foi aprovado por todas."][i] ?? "",
      media: photo.src,
    })),
    { id: "chandon-review-text-15", name: "Elaine R.", date: "há 5 dias", rating: 5, text: "Servi com sushi num jantar em casa e achei que combinou muito bem. Bem fresco quando servido gelado.", media: null },
    { id: "chandon-review-text-16", name: "Lívia N.", date: "há 11 dias", rating: 5, text: "Comprei para presentear meus pais numa comemoração. Eles gostaram bastante e chegou tudo certo.", media: null },
    { id: "chandon-review-text-17", name: "André P.", date: "há 17 dias", rating: 4, text: "Bom espumante para celebrações. Sabor equilibrado e agradável; recomendo servir bem gelado.", media: null },
    { id: "chandon-review-text-18", name: "Beatriz K.", date: "há 8 dias", rating: 5, text: "Gostei para um brinde especial, leve e fácil de harmonizar com petiscos e entradas.", media: null },
  ] : isBasikePowerBank ? [
    ...basikePowerBankReviewPhotos.map((photo, i) => ({
      id: photo.id,
      name: ["Carolina M.","Juliana R.","Fernanda P.","Aline C.","Patrícia S.","Bruna T.","Mariana L.","Débora F.","Camila G.","Renata B.","Vanessa D.","Priscila A."][i] ?? "",
      date: ["há 2 dias","há 7 dias","há 1 dia","há 12 dias","há 4 dias","há 16 dias","há 9 dias","há 3 dias","há 18 dias","há 6 dias","há 14 dias","há 5 dias"][i] ?? "",
      rating: [5,5,5,5,5,4,5,5,5,5,5,5][i] ?? 5,
      text: ["Salvou minha vida no passeio! Fiquei o dia todo fora e consegui carregar o celular sem precisar procurar tomada.","É pequeno e cabe direitinho na bolsa. Já deixei como item fixo para quando saio.","Carrega rápido e veio com os cabos que aparecem nas fotos. Gostei bastante pela praticidade.","Comprei para uma viagem e foi muito útil no aeroporto. Não achei pesado para levar na mochila.","Gostei porque já tem as opções de cabo, então não preciso ficar procurando um monte de fio. Até agora está funcionando direitinho.","Produto bom, tamanho compacto e acabamento bonito. Só precisa lembrar de carregar o power bank antes de sair, claro.","Uso no trabalho quando fico longe da tomada. Consigo dar uma carga no celular e continuar usando.","Chegou bem embalado e carregado o suficiente para testar. A entrada USB-C facilitou bastante para mim.","Comprei para deixar na bolsa e adorei. É discreto, não ocupa muito espaço e quebra um galho enorme.","Meu celular estava sempre ficando sem bateria no meio da rua. Agora levo esse comigo e fico bem mais tranquila.","Gostei do custo-benefício. Os cabos integrados ajudam muito, principalmente quando estou com pressa.","É prático para viagens e para o dia a dia. O peso é ok considerando que é uma bateria portátil."][i] ?? "",
      media: photo.src,
    })),
    { id: "basike-powerbank-review-text-13", name: "Larissa V.", date: "há 5 dias", rating: 5, text: "Deixei um na bolsa e outro em casa para não esquecer. Para mim, o melhor é não depender de levar cabo separado.", media: null },
    { id: "basike-powerbank-review-text-14", name: "Michele H.", date: "há 11 dias", rating: 5, text: "Usei durante um fim de semana fora e foi bem útil. A recarga pelo USB-C foi tranquila com meu carregador compatível.", media: null },
    { id: "basike-powerbank-review-text-15", name: "Sabrina E.", date: "há 17 dias", rating: 4, text: "Gostei do produto e da praticidade dos cabos. Só confiram se a potência e as conexões atendem ao modelo do celular de vocês.", media: null },
    { id: "basike-powerbank-review-text-16", name: "Elaine K.", date: "há 8 dias", rating: 5, text: "Pequeno, bonito e útil. Já virou companhia na bolsa, principalmente nos dias em que passo muitas horas fora.", media: null },
  ] : isMondialFan ? [
    ...mondialFanReviewPhotos.map((photo, i) => ({
      id: photo.id,
      name: ["Patrícia M.","Camila R.","Juliana S.","Fernanda A.","Márcia L.","Renata C.","Aline P.","Débora T.","Vanessa G."][i] ?? "",
      date: ["há 2 dias","há 7 dias","há 1 dia","há 12 dias","há 4 dias","há 16 dias","há 9 dias","há 3 dias","há 18 dias"][i] ?? "",
      rating: [5,5,5,5,5,4,5,5,5][i] ?? 5,
      text: ["Ventila muito bem! Coloquei na sala e o vento chega até a cozinha. Gostei bastante.","Comprei para o quarto porque aqui faz muito calor. Na velocidade média já refresca bem e não incomoda tanto para dormir.","Chegou direitinho e foi fácil de montar. O tamanho é ótimo, venta bastante.","Gostei das 8 pás, espalha bem o vento pelo ambiente. Uso mais na sala e estou satisfeita.","É forte mesmo! Na velocidade máxima dá conta dos dias mais quentes. A oscilação ajuda bastante.","Bom ventilador e fácil de limpar. Só achei um pouco grande para o cantinho onde eu queria colocar, então medi melhor e mudei de lugar.","Comprei para minha mãe e ela adorou. A alça facilita levar de um cômodo para o outro.","Fiquei surpresa com a força do vento. Na mínima já fica agradável e na máxima refresca rapidinho.","Gostei do produto, chegou bem embalado e funcionando. A inclinação ajuda a direcionar o ar para a cama."][i] ?? "",
      media: photo.src,
    })),
    { id: "mondial-fan-review-text-10", name: "Sueli F.", date: "há 5 dias", rating: 5, text: "Aqui em casa somos quatro e o ventilador fica ligado boa parte do dia. Gostei porque distribui bem o ar e é simples de ajustar.", media: null },
    { id: "mondial-fan-review-text-11", name: "Bruna D.", date: "há 11 dias", rating: 5, text: "O porta-fio é um detalhe que achei muito útil para guardar. O vento é forte e as velocidades fazem diferença.", media: null },
    { id: "mondial-fan-review-text-12", name: "Elaine V.", date: "há 15 dias", rating: 4, text: "Atendeu ao que eu precisava para a sala. Antes de comprar, confiram direitinho a voltagem da casa para escolher a versão certa.", media: null },
    { id: "mondial-fan-review-text-13", name: "Carolina B.", date: "há 8 dias", rating: 5, text: "Gostei muito da compra. A montagem foi tranquila e a limpeza parece prática porque dá para remover as grades e a hélice.", media: null },
  ] : isXboxWhiteController ? [
    ...xboxControllerReviewPhotos.map((photo, i) => ({
      id: photo.id,
      name: ["Mariana C.","Rafael M.","Juliana P.","Bruno A.","Camila R.","Diego F.","Patrícia L.","Lucas T.","Fernanda G.","André V.","Beatriz N."][i] ?? "",
      date: ["há 2 dias","há 7 dias","há 1 dia","há 12 dias","há 4 dias","há 16 dias","há 9 dias","há 3 dias","há 18 dias","há 6 dias","há 14 dias"][i] ?? "",
      rating: [5,5,5,5,5,4,5,5,5,5,5][i] ?? 5,
      text: ["Comprei para jogar no PC e gostei bastante. O branco é bonito e o controle ficou confortável na mão.","Dei de presente e a pessoa curtiu muito. Conectou por Bluetooth e já foi jogar.","Chegou certinho, bem embalado. Meu filho gostou bastante e está usando nas partidas depois da escola.","Peguei para jogar no computador sem ficar com fio atravessando a mesa. Até agora a conexão está estável.","Gostei do acabamento e da pegada. Os botões respondem bem nos jogos que costumo jogar.","É confortável e funciona bem, só precisei conferir as configurações do Bluetooth no computador para parear na primeira vez.","Comprei para meu marido e ele aprovou. O controle é bonito e o cabo que acompanha também ajuda quando precisa.","Gostei! O tamanho é bom e não fica escorregando na mão. A vibração deixa os jogos mais legais.","Meu sobrinho queria um controle branco e ficou todo feliz. Foi simples conectar no PC dele.","Uso para jogar nas horas vagas. O controle é leve, tem boa pegada e não fico preso ao cabo.","Boa compra pelo preço. Veio com o cabo e consegui fazer a conexão seguindo as instruções do computador."][i] ?? "",
      media: photo.src,
    })),
    { id: "xbox-controller-review-text-12", name: "Aline D.", date: "há 5 dias", rating: 5, text: "Comprei para jogar com meu irmão e foi tranquilo de configurar. O branco é ainda mais bonito pessoalmente.", media: null },
    { id: "xbox-controller-review-text-13", name: "Thiago B.", date: "há 11 dias", rating: 5, text: "Boa opção para quem quer jogar no PC sem fio. A pegada é confortável até depois de algumas partidas.", media: null },
    { id: "xbox-controller-review-text-14", name: "Renata S.", date: "há 17 dias", rating: 4, text: "Presente para meu filho. Ele gostou bastante; só tivemos que conferir a compatibilidade e ajustar o pareamento no computador.", media: null },
    { id: "xbox-controller-review-text-15", name: "Gustavo H.", date: "há 8 dias", rating: 5, text: "Chegou tudo certo e o cabo de 1 metro veio junto. Atendeu ao que eu estava procurando.", media: null },
  ] : isOmoLaundry ? [
    ...omoReviewPhotos.map((photo, i) => ({
      id: photo.id,
      name: ["Juliana M.","Patrícia R.","Aline S.","Camila F.","Renata C.","Márcia T.","Fernanda L.","Vanessa P.","Débora A.","Luciana G.","Carolina B.","Elaine D.","Priscila N.","Mariana V."][i] ?? "",
      date: ["há 2 dias","há 6 dias","há 1 dia","há 11 dias","há 4 dias","há 15 dias","há 8 dias","há 3 dias","há 18 dias","há 9 dias","há 5 dias","há 13 dias","há 7 dias","há 19 dias"][i] ?? "",
      rating: [5,5,5,5,4,5,5,5,5,5,5,4,5,5][i] ?? 5,
      text: ["Uso na lavanderia de casa e gostei bastante. O galão rende muito.","Comprei para adiantar as lavagens da semana. Limpa bem e a embalagem grande compensa.","Gostei do resultado nas roupas do dia a dia. Chegou tudo certinho.","Tenho bastante roupa para lavar e esse tamanho ajuda demais. Só lembrar de seguir a medida indicada no rótulo.","Produto bom, fez bastante espuma e deixou as peças limpas. O galão é grandinho, então já separa um espaço para guardar.","Já conhecia OMO e resolvi pegar essa versão maior. Para quem lava roupa com frequência, facilita não precisar comprar toda hora.","Usei em roupas claras e coloridas e gostei do resultado. Vou comprar novamente quando acabar.","Chegou bem embalado e sem vazamento. O tamanho de 7 litros é ótimo para quem tem bastante roupa na rotina.","Estou usando na rotina da família e rende bastante. A limpeza me agradou, inclusive nas peças mais pesadas.","Gostei muito, principalmente pelo rendimento. Coloco a quantidade conforme a orientação e tem funcionado bem.","Comprei para a lavanderia do pequeno negócio e está atendendo bem à demanda. Bom custo-benefício pelo tamanho.","Cumpre o que promete na limpeza. Só achei o galão pesado para manusear cheio, mas isso já era esperado pelo volume.","Vale a pena para quem lava bastante roupa. O produto rende e não preciso ficar repondo toda hora.","Gostei da compra. As roupas saíram limpas e o galão veio direitinho, bem fechado."][i] ?? "",
      media: photo.src,
    })),
    { id: "omo-laundry-review-text-15", name: "Sabrina H.", date: "há 3 dias", rating: 5, text: "O galão é grande mesmo! Para quem lava roupa quase todo dia, achei bem mais prático comprar o de 7 litros.", media: null },
    { id: "omo-laundry-review-text-16", name: "Andréa K.", date: "há 10 dias", rating: 5, text: "Usei nas roupas de cama e nas peças do trabalho. Gostei da limpeza; estou seguindo a dosagem da embalagem para aproveitar o rendimento.", media: null },
    { id: "omo-laundry-review-text-17", name: "Mônica E.", date: "há 16 dias", rating: 4, text: "Chegou tudo certo. É uma embalagem pesada para levantar, mas o volume compensa para minha rotina de lavanderia.", media: null },
    { id: "omo-laundry-review-text-18", name: "Tatiane O.", date: "há 12 dias", rating: 5, text: "Produto que facilita bastante aqui em casa. Rende bem e gostei do resultado nas lavagens do dia a dia.", media: null },
  ] : isT900Smartwatch ? [
    ...smartwatchReviewPhotos.map((photo, i) => ({
      id: photo.id,
      name: ["Larissa M.","Eduardo R.","Priscila A.","Matheus C.","Sônia F.","Gabriel T.","Renata P.","João V.","Camila D.","Rafael N.","Beatriz L.","André C.","Mariana F.","Felipe G."][i] ?? "",
      date: ["há 1 dia","há 4 dias","há 2 dias","há 7 dias","há 5 dias","há 11 dias","há 3 dias","há 9 dias","há 6 dias","há 14 dias","há 8 dias","há 17 dias","há 12 dias","há 19 dias"][i] ?? "",
      rating: [5,5,5,4,5,5,5,5,4,5,5,5,5,5][i] ?? 5,
      text: ["Ficou muito bonito no pulso! Já comecei usando a pulseira laranja, achei que deu outra cara pro relógio.","Comprei para acompanhar as notificações e gostei. A configuração inicial pede um pouco de atenção, mas depois fica bem mais simples.","Veio com as três pulseiras mesmo. Eu achei que teria que escolher uma cor, então gostei bastante dessa surpresa.","A tela é grande e fácil de visualizar. Levei um tempinho para me acostumar com os menus, mas no geral gostei.","Presente para minha filha e ela adorou. A laranja foi a favorita dela 😊","Gostei do acabamento e do tamanho. No meu braço ficou confortável, não achei pesado.","Bem legal pelo preço. Uso mais para ver as horas, alarmes e notificações durante o trabalho.","Troquei para a pulseira branca e ficou lindo. Bom poder mudar o visual sem comprar acessório por fora.","Chegou certinho e corresponde ao anúncio. Só precisei olhar o passo a passo para conectar no celular.","Estou usando nas caminhadas para consultar o horário e o cronômetro. Até agora está atendendo ao que eu precisava.","A pulseira preta é discreta e combina com tudo. As outras duas são um bônus que gostei de receber.","Tem bastante função no menu, ainda estou explorando. Para as tarefas básicas do dia a dia está sendo útil.","Gostei mais do que esperava! A tela chama atenção e a pulseira de silicone é macia. A laranja ficou minha preferida.","Relógio bonito, leve e com várias opções. Pelo valor, achei que valeu a compra."][i] ?? "",
      media: photo.src,
    })),

    { id: "t900-smartwatch-review-text-15", name: "Ana Paula R.", date: "há 2 dias", rating: 5, text: "A pulseira branca ficou linda! Gostei de poder trocar quando quiser.", media: null },
    { id: "t900-smartwatch-review-text-16", name: "Leandro S.", date: "há 8 dias", rating: 5, text: "Chegou tudo certinho. Ainda estou conhecendo as funções, mas para ver as horas e notificações já está sendo bem útil.", media: null },
    { id: "t900-smartwatch-review-text-17", name: "Michele B.", date: "há 15 dias", rating: 4, text: "Gostei do relógio, principalmente do visual e das três pulseiras incluídas. A configuração inicial exigiu um pouco de paciência, mas consegui conectar.", media: null },
  ] : isJblBoombox ? [
    ...jblReviewPhotos.map((photo, i) => ({
      id: photo.id,
      name: ["Marcos A.", "Renata C.", "Felipe M.", "Camila R.", "Diego P.", "Aline S.", "Rafael T.", "Bruna L.", "Lucas F.", "Patrícia V.", "André G.", "Juliana M.", "Gustavo N.", "Fernanda B.", "Caio D."][i] ?? "",
      date: ["há 1 dia", "há 2 dias", "há 3 dias", "há 4 dias", "há 5 dias", "há 6 dias", "há 8 dias", "há 9 dias", "há 10 dias", "há 12 dias", "há 13 dias", "há 14 dias", "há 16 dias", "há 18 dias", "há 19 dias"][i] ?? "",
      rating: i === 8 ? 4 : 5,
      text: [
        "Já tive a Boombox 3 e gostei muito da evolução. Essa é maior, tem presença e continua fácil de levar.",
        "O som me surpreendeu, principalmente os graves. Em volume alto continua bem definido aqui.",
        "A construção passa uma sensação ótima de resistência. O acabamento é bonito e os detalhes são bem feitos.",
        "Gostei bastante da potência e da clareza. Usei em um encontro com amigos e preencheu bem o ambiente.",
        "A bateria é um dos pontos que mais gostei. Consigo ouvir música por bastante tempo sem ficar procurando tomada.",
        "Os graves têm bastante impacto e gostei de poder alternar o Bass Boost conforme o tipo de música.",
        "Caixa robusta, mas achei mais leve do que imaginava pelo tamanho. O som também tem bastante presença.",
        "O áudio é limpo e os graves são fortes. Para ouvir em área aberta fez bastante diferença.",
        "Gostei muito do som e da potência. Só achei o tamanho maior do que eu esperava, então vale conferir as medidas antes.",
        "Chegou bem protegida e o acabamento me agradou. Já conectei no celular e funcionou sem complicação.",
        "Usei perto da piscina e gostei da tranquilidade de ter proteção contra água e poeira. Som muito bom.",
        "O pareamento foi simples e a caixa entrega um som encorpado. Os controles pelo aplicativo ajudam bastante.",
        "É potente mesmo, os graves aparecem bastante sem deixar a voz sumir. Gostei da experiência.",
        "Gostei do formato e da alça para transportar. Levei para um espaço aberto e o volume deu conta.",
        "Produto muito bonito e com ótima qualidade sonora. A diferença nos graves é o que mais chama atenção."
      ][i] ?? "",
      media: photo.src,
    })),
    { id: "jbl-boombox-review-text-16", name: "Roberto H.", date: "há 3 dias", rating: 5, text: "O som tem bastante corpo e os graves são fortes. Para ouvir música na área de casa ficou excelente.", media: null },
    { id: "jbl-boombox-review-text-17", name: "Isabela F.", date: "há 7 dias", rating: 5, text: "Gostei da conexão e dos ajustes pelo aplicativo. É uma caixa grande, mas a alça facilita levar de um lugar para outro.", media: null },
    { id: "jbl-boombox-review-text-18", name: "Thiago C.", date: "há 11 dias", rating: 5, text: "A potência impressiona e o áudio continua agradável mesmo quando aumento o volume. Compra que me agradou bastante.", media: null },
    { id: "jbl-boombox-review-text-19", name: "Mônica P.", date: "há 17 dias", rating: 4, text: "Gostei muito da qualidade e da bateria. É um equipamento maior, então é bom ter espaço para guardar.", media: null },
  ] : isProjector ? [
    ...projectorReviewPhotos.map((photo, i) => ({
      id: photo.id,
      name: ["Mariana S.", "Rafael M.", "Camila R.", "João P.", "Ana C.", "Patrícia L.", "Lucas F.", "Beatriz M.", "Fernanda A.", "Diego R.", "Juliana T."][i] ?? "",
      date: ["há 2 dias", "há 4 dias", "há 5 dias", "há 7 dias", "há 8 dias", "há 10 dias", "há 12 dias", "há 13 dias", "há 15 dias", "há 17 dias", "há 19 dias"][i] ?? "",
      rating: i === 8 ? 4 : 5,
      text: [
        "A imagem fica bem legal no quarto, principalmente com a luz apagada. Já usei para assistir séries.",
        "Chegou tudo certinho, veio com controle e os cabos. Consegui configurar o Wi-Fi sem dificuldade.",
        "Gostei bastante para assistir filme na parede. O ajuste de foco ajuda a deixar a imagem mais nítida.",
        "É compacto e fácil de mudar de lugar. A rotação ajuda bastante para posicionar a projeção.",
        "Veio com os acessórios e manual. Conectei e consegui começar a usar seguindo as instruções.",
        "A imagem ficou boa para assistir à noite e os aplicativos deixam tudo mais prático.",
        "Gostei do tamanho, não ocupa muito espaço e consigo levar para outros cômodos.",
        "O projetor é bem prático. Ajustei a posição e consegui deixar a tela do tamanho que queria.",
        "Funciona direitinho, mas precisei deixar o ambiente mais escuro para aproveitar melhor a imagem.",
        "Conectei no Wi-Fi e já consegui abrir os aplicativos. Para assistir no quarto está ótimo.",
        "Gostei da experiência, principalmente por poder projetar direto na parede e usar o controle.",
      ][i] ?? "",
      media: photo.src,
    })),
    { id: "projector-review-text-12", name: "Bruno M.", date: "há 3 dias", rating: 5, text: "Muito prático para assistir alguma coisa antes de dormir. A configuração foi tranquila por aqui.", media: null },
    { id: "projector-review-text-13", name: "Larissa G.", date: "há 11 dias", rating: 5, text: "Gostei bastante do tamanho e da possibilidade de ajustar a posição. Já virou companhia para os filmes.", media: null },
    { id: "projector-review-text-14", name: "Eduardo V.", date: "há 16 dias", rating: 4, text: "Atendeu ao que eu procurava. A imagem fica melhor com o quarto escuro, e o aparelho é bem compacto.", media: null },
  ] : isKarstenTowel ? [
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
  ] : isMondialBlender ? [
    ...mondialReviewPhotos.map((photo, i) => ({
      id: photo.id,
      name: ["Mariana S.", "Rafael M.", "Camila R.", "João P.", "Ana C.", "Patrícia L.", "Lucas F.", "Beatriz M.", "Fernanda A."][i] ?? "",
      date: ["há 1 dia", "há 2 dias", "há 4 dias", "há 5 dias", "há 7 dias", "há 9 dias", "há 10 dias", "há 12 dias", "há 13 dias"][i] ?? "",
      rating: 5,
      text: ["Gostei muitoo, bate bem e não ocupa muito espaço aqui na cozinha", "Chegou certinho e já fiz vitamina, gostei bastante", "É simples de usar e tritura bem as frutas", "O liquidificador é bonito e funcionou direitinho aqui", "Já usei pra fazer suco e ficou ótimo", "Gostei do tamanho e da potência, atende bem no dia a dia", "Veio bem embalado e tá funcionando certinho", "Muito bom pelo preço, gostei da compra", "Tô usando bastante pra vitaminas e tá dando conta tranquilo"][i] ?? "",
      media: photo.src,
    })),
    { id: "mondial-review-text-10", name: "Bruno A.", date: "há 3 dias", rating: 5, text: "Uso quase todo dia para vitaminas, bate rápido e é bem simples de lavar", media: null },
    { id: "mondial-review-text-11", name: "Letícia C.", date: "há 14 dias", rating: 4, text: "Gostei bastante, tritura bem e o tamanho fica bom na bancada. Faz um pouco de barulho, mas nada fora do esperado", media: null },
  ] : isMondialAirFryer ? [
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
  ] : isMondialAirFryer4L ? [
    ...airFryer4LReviewPhotos.map((photo, i) => ({
      id: photo.id,
      name: ["Mariana C.", "Rafael P.", "Camila R.", "João M.", "Ana L.", "Patrícia S.", "Lucas F.", "Beatriz A.", "Fernanda T.", "Diego V.", "Juliana B."][i] ?? "",
      date: ["há 1 dia", "há 2 dias", "há 4 dias", "há 5 dias", "há 7 dias", "há 8 dias", "há 10 dias", "há 12 dias", "há 14 dias", "há 16 dias", "há 18 dias"][i] ?? "",
      rating: i === 9 ? 4 : 5,
      text: [
        "Gostei bastante, é compacta e cabe certinho na bancada. Já fiz batata e ficou ótima.",
        "O cesto quadrado aproveita bem o espaço, consigo acomodar os alimentos sem amontoar.",
        "Muito prática para o dia a dia. Ajusto a temperatura e o timer e ela desliga sozinha.",
        "Esquenta rápido e achei fácil de usar. O cesto também é tranquilo de lavar.",
        "Gostei do tamanho de 4 litros, atende bem aqui em casa e não ocupa tanto espaço.",
        "Faz pouca sujeira e os alimentos não ficam grudados no cesto. Boa compra.",
        "Bem simples de mexer, o aviso sonoro ajuda bastante quando termina o tempo.",
        "Chegou direitinho e funciona muito bem. Já estou usando para várias receitas.",
        "O antiaderente facilita a limpeza e o formato do cesto ajuda a distribuir melhor os alimentos.",
        "Atendeu ao que eu precisava. Só é bom conferir a voltagem antes de escolher.",
        "Gostei muito, é compacta, fácil de limpar e deixa o preparo bem mais prático."
      ][i] ?? "",
      media: photo.src,
    })),
    { id: "air-fryer-4l-review-text-12", name: "Bruno G.", date: "há 3 dias", rating: 5, text: "Uso quase todo dia para preparar porções rápidas. O timer e o desligamento automático são bem úteis.", media: null },
    { id: "air-fryer-4l-review-text-13", name: "Larissa M.", date: "há 9 dias", rating: 5, text: "O cesto é espaçoso para o tamanho dela e a limpeza é simples. Gostei bastante para a rotina.", media: null },
    { id: "air-fryer-4l-review-text-14", name: "Eduardo R.", date: "há 15 dias", rating: 4, text: "Boa fritadeira, compacta e fácil de regular. O preparo fica prático e não preciso ficar acompanhando o tempo.", media: null },
    ] : isChristmasOrnaments ? [
    ...christmasOrnamentsReviewPhotos.map((photo, i) => ({
      id: photo.id,
      name: ["Mariana C.", "Rafael P.", "Camila S.", "João V.", "Bruna M.", "Lucas A.", "Fernanda R."][i] ?? "",
      date: ["há 1 dia", "há 3 dias", "há 5 dias", "há 7 dias", "há 10 dias", "há 14 dias", "há 18 dias"][i] ?? "",
      rating: 5,
      text: [
        "As bolinhas douradas ficaram lindas na árvore. Gostei da mistura de brilho e glitter.",
        "Vieram bem bonitas e leves, foi fácil distribuir os enfeites pela árvore.",
        "Gostei de ter os três acabamentos no kit. Deu um efeito bem bonito com as luzinhas.",
        "O tamanho ficou ótimo na minha árvore e o dourado combina com os outros enfeites.",
        "Chegou tudo certinho. As bolinhas são leves e deixaram a decoração mais caprichada.",
        "Escolhi a versão vermelha e gostei bastante da cor. Ficou linda junto com os festões.",
        "Kit bem prático para completar a decoração de Natal. Gostei da variedade de acabamentos."
      ][i] ?? "",
      media: photo.src,
    })),
    { id: "christmas-ornaments-review-text-8", name: "Patrícia L.", date: "há 4 dias", rating: 5, text: "Usei para completar a decoração da árvore e gostei muito da combinação dos acabamentos.", media: null },
    { id: "christmas-ornaments-review-text-9", name: "Diego M.", date: "há 9 dias", rating: 5, text: "As 24 unidades ajudam bastante a preencher a árvore. O tamanho é delicado e fácil de combinar.", media: null },
    { id: "christmas-ornaments-review-text-10", name: "Aline F.", date: "há 13 dias", rating: 5, text: "Gostei do efeito do glitter com as bolinhas foscas. Ficou uma decoração bem bonita.", media: null },
    { id: "christmas-ornaments-review-text-11", name: "Renata G.", date: "há 17 dias", rating: 5, text: "Comprei a cor dourada e ficou muito elegante na árvore. Vou guardar para usar nos próximos Natais.", media: null },
    ] : isCookwareSet ? [
    ...cookwareReviewPhotos.map((photo, i) => ({
      id: photo.id,
      name: ["Juliana M.", "Renata C.", "Patrícia A.", "Camila R.", "Bruna S.", "Aline F.", "Marcos V.", "Débora L.", "Vanessa P.", "Rafaela T.", "Simone G.", "Carolina N."][i] ?? "",
      date: ["há 1 dia", "há 2 dias", "há 4 dias", "há 5 dias", "há 7 dias", "há 9 dias", "há 10 dias", "há 12 dias", "há 13 dias", "há 15 dias", "há 17 dias", "há 19 dias"][i] ?? "",
      rating: 5,
      text: [
        "O conjunto é bem completo e gostei bastante do acabamento. A cor cereja ficou linda na cozinha.",
        "Chegou tudo certinho. As peças são leves e o antiaderente facilita bastante na hora de lavar.",
        "Gostei da variedade de tamanhos, dá para preparar desde coisas pequenas até uma refeição maior.",
        "As panelas são bonitas e vieram bem embaladas. Os acessórios também ajudam bastante no dia a dia.",
        "Bom custo-benefício pelo tanto de peças. Já usei algumas e a limpeza foi tranquila.",
        "Escolhi a preta e gostei muito do visual. As tampas de vidro são práticas para acompanhar a comida.",
        "Conjunto útil para equipar a cozinha. Tem vários tamanhos e não ocupa tanto espaço.",
        "Gostei muito das panelas, são leves e fáceis de manusear. Vieram conforme a opção escolhida.",
        "A cor é bonita e o conjunto atende bem às receitas do cotidiano. Fiquei satisfeita com a compra.",
        "As tampas ajudam bastante e o revestimento parece fácil de limpar. Ótimo ter vários tamanhos.",
        "Comprei para montar minha cozinha e achei o kit bem completo. Os acessórios vieram sortidos.",
        "Gostei do conjunto e da variedade de peças. Para o uso diário está sendo bem prático."
      ][i] ?? "",
      media: photo.src,
    })),
    { id: "cookware-review-text-13", name: "Michele D.", date: "há 3 dias", rating: 5, text: "Gostei da quantidade de peças e dos tamanhos diferentes. É um conjunto versátil para a rotina.", media: null },
    { id: "cookware-review-text-14", name: "Eduarda B.", date: "há 8 dias", rating: 5, text: "A panela é fácil de limpar e as tampas de vidro são muito úteis para acompanhar o preparo.", media: null },
    { id: "cookware-review-text-15", name: "Sônia K.", date: "há 14 dias", rating: 5, text: "Escolhi a versão preto com bege e achei muito bonita. O kit veio completo.", media: null },
    { id: "cookware-review-text-16", name: "Tatiane H.", date: "há 18 dias", rating: 5, text: "Conjunto prático para o dia a dia, com peças de tamanhos variados. Gostei da compra.", media: null },
  ] : isHotWheelsKit ? [
    ...hotWheelsReviewPhotos.map((photo, i) => ({
      id: photo.id,
      name: ["Mariana P.", "Lucas A.", "Camila R.", "Rafael S.", "Bruna M.", "Diego T.", "Ana C.", "Pedro V.", "Fernanda L."][i] ?? "",
      date: ["há 1 dia", "há 3 dias", "há 4 dias", "há 6 dias", "há 8 dias", "há 10 dias", "há 13 dias", "há 16 dias", "há 18 dias"][i] ?? "",
      rating: 5,
      text: [
        "Kit muito legal! Vieram dez carrinhos diferentes e meu filho já escolheu os favoritos para brincar.",
        "Gostei da variedade dos modelos. É uma ótima opção para quem está começando uma coleção.",
        "Os carrinhos são pequenos, bem detalhados e chegaram direitinho. Meu sobrinho adorou.",
        "Comprei para presentear e foi um sucesso. A graça é justamente descobrir quais modelos vêm.",
        "Boa seleção de carrinhos, todos diferentes entre si. Já estamos usando nas pistas aqui de casa.",
        "Curti bastante o kit, tem modelos variados e o tamanho 1:64 é ótimo para colecionar.",
        "Vieram dez modelos sortidos sem repetição no kit. Achei um presente bem divertido.",
        "Gostei do acabamento das miniaturas e da variedade. As crianças ficaram empolgadas para abrir.",
        "Muito bacana para aumentar a coleção. Só lembrando que os modelos são surpresa, não dá para escolher."
      ][i] ?? "",
      media: photo.src,
    })),
    { id: "hotwheels-review-text-10", name: "Gustavo N.", date: "há 2 dias", rating: 5, text: "Presenteei meu afilhado e ele ficou animado para descobrir cada carrinho. Vieram modelos variados.", media: null },
    { id: "hotwheels-review-text-11", name: "Isabela F.", date: "há 7 dias", rating: 5, text: "Gostei para completar a coleção. As miniaturas têm bastante detalhe pelo tamanho.", media: null },
    { id: "hotwheels-review-text-12", name: "André C.", date: "há 12 dias", rating: 5, text: "Kit divertido, principalmente pela surpresa dos modelos. Bom para brincar e guardar.", media: null },
    { id: "hotwheels-review-text-13", name: "Letícia M.", date: "há 17 dias", rating: 5, text: "Comprei para dar de presente e achei a proposta ótima. São dez carrinhos sortidos e diferentes.", media: null },
  ] : isBrastoy ? [
    ...brastoyReviewPhotos.map((photo, i) => ({
      id: photo.id,
      name: ["Mariana F.", "Lucas R.", "Camila S.", "Rafael M.", "Bruna T.", "Diego A.", "Patrícia L.", "João V."][i] ?? "",
      date: ["há 2 dias", "há 4 dias", "há 6 dias", "há 8 dias", "há 10 dias", "há 12 dias", "há 15 dias", "há 18 dias"][i] ?? "",
      rating: i === 5 ? 4 : 5,
      text: [
        "Nossa, carrinho muito bom mesmo! Gostei demais da compra. Só senti falta das três pilhas AA do controle, mas o carrinho é top.",
        "Muito bom, toooop de verdade! Anda super bem e responde rápido aos comandos.",
        "Carrinho espetacular! Faz curvas bem rápidas e encara os obstáculos daqui de casa numa boa.",
        "Gostei bastante, tem força e a tração 4x4 faz diferença quando brinca no quintal.",
        "Meu filho adorou! A bateria recarregável é prática e a brincadeira rende bastante.",
        "É rápido e divertido, só precisa de um espaço maior pra aproveitar melhor.",
        "Chegou certinho e achei a construção bem resistente. Estamos nos divertindo bastante.",
        "Faz manobras muito legais e o controle responde direitinho. Curti demais!",
      ][i] ?? "",
      media: photo.src,
    })),
    { id: "brastoy-review-text-9", name: "Felipe C.", date: "há 3 dias", rating: 5, text: "Pegamos uma rampinha e ele sobe muito bem. Gostei da estabilidade e de como responde nas curvas.", media: null },
    { id: "brastoy-review-text-10", name: "Ana P.", date: "há 7 dias", rating: 5, text: "É bem divertido de controlar, tem boa velocidade e a bateria segura uma boa sessão de brincadeira.", media: null },
    { id: "brastoy-review-text-11", name: "Gustavo N.", date: "há 11 dias", rating: 5, text: "Gostei do tamanho e do visual off-road. O controle tem bom alcance e é fácil pegar o jeito.", media: null },
    { id: "brastoy-review-text-12", name: "Renata D.", date: "há 16 dias", rating: 4, text: "Carrinho muito legal, anda bem e chama atenção. Só recomendo conferir as pilhas do controle antes de começar.", media: null },
  ] : isKettle ? [
    ...kettleReviewPhotos.map((photo, i) => ({
      id: photo.id,
      name: ["Mariana S.", "Rafael M.", "Camila R.", "João P.", "Ana C.", "Patrícia L.", "Lucas F."][i] ?? "",
      date: ["há 2 dias", "há 3 dias", "há 5 dias", "há 1 semana", "há 9 dias", "há 11 dias", "há 13 dias"][i] ?? "",
      rating: 5,
      text: ["Gostei muitoo, esquenta rapidinho e já tô usando todo dia", "Muito prática pra fazer meu café, gostei bastante", "É bem bonita e funciona direitinho, adorei", "Uso pra preparar chá e facilita muito minha rotina", "Chegou tudo certinho e tô gostando bastante", "Esquenta bem rapidinho, valeu muito a pena", "Tô usando direto aqui em casa, gostei demais"][i] ?? "",
      media: photo.src,
    })),
    { id: "kettle-review-text-8", name: "Bruna M.", date: "há 4 dias", rating: 5, text: "Uso bastante para preparar chá e café, é prática e não ocupa muito espaço na bancada", media: null },
    { id: "kettle-review-text-9", name: "Carlos R.", date: "há 12 dias", rating: 4, text: "Aquece rápido e é fácil de limpar. Só senti falta de um aviso sonoro mais discreto", media: null },
  ] : isLgAirConditioner ? [
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
  const fav = Array.isArray(state.favorites) && state.favorites.includes(p.id);

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

      <div className="bg-flash grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 text-primary-foreground">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-[20px] shrink-0 items-center justify-center rounded-[6px] bg-white px-[5.5px] text-[13.5px] font-bold leading-none text-[#D9164B]">-{discountPct(shownPrice, shownOriginal)}%</span>
            <span className="truncate text-[24px] font-extrabold leading-none">{brl(shownPrice)}</span>
          </div>
          <div className="mt-1.5 text-[13px] opacity-90">De <s>{brl(shownOriginal)}</s></div>
        </div>
        <div className="text-right text-[12.5px] leading-tight">
          <div className="flex items-center justify-end gap-0.5 font-bold"><FlashIcon className="h-[18px]" />Oferta Relâmpago</div>
          <div className="mt-1">Termina em <b className="tabular-nums"><OfferTimer /></b></div>
        </div>
      </div>

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
        <h2 className="mb-5 text-[19px] font-extrabold">Sobre este produto</h2>
        <div>
          <h3 className="mb-2 text-[16px] font-semibold">Descrição do produto</h3>
          <div className="relative">
            <p
              className="whitespace-pre-line text-[14px] leading-relaxed text-muted-foreground"
              style={descriptionExpanded ? undefined : { maxHeight: "16.25em", overflow: "hidden" }}
            >
              {p.description ?? p.title}
            </p>
            {!descriptionExpanded && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent" />
            )}
          </div>
          <button
            type="button"
            onClick={() => setDescriptionExpanded((expanded) => !expanded)}
            className="mt-2 block w-full py-1.5 text-center text-[15px] font-bold text-primary"
            aria-expanded={descriptionExpanded}
          >
            {descriptionExpanded ? "Ver menos" : "Ver mais"}
          </button>
        </div>
      </div>
      <section className="mt-5 border-t-8 border-surface px-4 py-5" aria-label="Avaliações do produto">
        <h2 className="text-[19px] font-extrabold">Avaliações do produto</h2>
        <div className="mt-4 grid grid-cols-[104px_minmax(0,1fr)] items-center gap-3 rounded-2xl bg-surface p-3 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-4 sm:p-4">
          <div className="flex min-w-0 flex-col items-center justify-center border-r border-border pr-2 text-center sm:pr-4">
            <strong className="text-[32px] font-extrabold leading-none tabular-nums sm:text-[36px]">{reviewAverage.toFixed(1).replace(".", ",")}</strong>
            <ReviewStars rating={reviewAverage} size="h-4 w-4" />
            <span className="mt-1 text-[10px] leading-tight text-muted-foreground">~{estimateReviewCount(p.sold).toLocaleString("pt-BR")} avaliações</span>
          </div>
          <div className="min-w-0 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const total = estimateReviewCount(p.sold);
              const distribution = p.id === "ar-condicionado-lg-ai-voice-9000"
                ? { 5: Math.max(0, total - 6), 4: Math.min(6, total), 3: 0, 2: 0, 1: 0 }
                : getEstimatedRatingDistribution(total, reviewAverage);
              const count = distribution[stars] ?? 0;
              const percent = total > 0 ? Math.max(0, Math.min(100, (count / total) * 100)) : 0;
              return (
                <button key={stars} type="button" aria-label={`${stars} estrelas: ${count} avaliações`} aria-pressed={reviewFilter === stars} onClick={() => { setReviewFilter(reviewFilter === stars ? null : stars); setVisibleReviews(3); }} className={"flex w-full min-w-0 items-center gap-2 rounded-md px-1 py-1 text-left transition-colors " + (reviewFilter === stars ? "bg-background" : "hover:bg-background/60")}>
                  <span className="w-3 shrink-0 text-right text-[11px] font-medium tabular-nums text-muted-foreground">{stars}</span>
                  <Star className="h-3 w-3 shrink-0 fill-[#FFC43B] text-[#FFC43B]" />
                  <span className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-border">
                    <span className="absolute inset-y-0 left-0 rounded-full bg-ink transition-[width]" style={{ width: `${percent}%` }} />
                  </span>
                  <span className="w-8 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">{count.toLocaleString("pt-BR")}</span>
                </button>
              );
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
              <div className="relative"><img src={review.media!} alt="Foto enviada junto à avaliação do produto" loading="lazy" className="aspect-square w-full rounded-xl bg-surface object-cover" />{"rating" in review && <ReviewMediaRating rating={review.rating} />}</div>
              {"rating" in review ? <span className="mt-1.5 flex items-center justify-center gap-1 text-[11px] font-semibold"><Star className="h-3 w-3 fill-[#FFC43B] text-[#FFC43B]" />{review.rating.toFixed(1).replace(".", ",")}</span> : isProjector ? <span className="mt-1.5 flex items-center justify-center gap-1 text-[11px] font-semibold"><Star className="h-3 w-3 fill-[#FFC43B] text-[#FFC43B]" />{reviewAverage.toFixed(1).replace(".", ",")}</span> : null}
            </button>)}
          </div>
        </div>}
{!isProjector && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button onClick={() => { setReviewFilter(null); setVisibleReviews(3); }} className={"rounded-full border px-3 py-1.5 text-[12px] font-semibold " + (reviewFilter == null ? "border-ink bg-ink text-ink-foreground" : "border-border")}>Todas</button>
          {[5,4,3,2,1].map((stars) => <button key={stars} onClick={() => { setReviewFilter(reviewFilter === stars ? null : stars); setVisibleReviews(3); }} className={"rounded-full border px-3 py-1.5 text-[12px] font-semibold " + (reviewFilter === stars ? "border-ink bg-ink text-ink-foreground" : "border-border")}>{stars} estrelas</button>)}
        </div>
        )}
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
        {filteredReviews.length === 0 && <p className="py-6 text-center text-[13px] text-muted-foreground">{reviewFilter == null ? "Nenhuma avaliação individual cadastrada para este produto." : "Nenhuma avaliação nesta faixa de estrelas."}</p>}
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
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">{reviewMedia.map((review) => <div key={review.id} className="min-w-0"><div className="relative"><img src={review.media!} alt="Mídia enviada junto à avaliação do produto" loading="lazy" className="aspect-square w-full rounded-xl bg-surface object-cover" />{"rating" in review && <ReviewMediaRating rating={review.rating} />}</div><span className="mt-1.5 flex items-center justify-center gap-1 text-[11px] font-semibold"><Star className="h-3 w-3 fill-[#FFC43B] text-[#FFC43B]" />{("rating" in review ? review.rating : reviewAverage).toFixed(1).replace(".", ",")}</span></div>)}</div>
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

      <div className="fixed bottom-0 left-1/2 z-40 grid w-full max-w-[480px] -translate-x-1/2 grid-cols-[auto_auto_68px_minmax(0,1fr)] items-center gap-2 border-t border-border bg-background px-3 pt-2.5 pb-safe">
        <Link to="/" className="flex flex-col items-center gap-0.5 text-[12px]"><Store className="h-6 w-6" />Loja</Link>
        <button onClick={() => update({ cartOpen: true })} className="relative flex flex-col items-center gap-0.5 text-[12px]">
          <ShoppingCart className="h-6 w-6" />Carrinho
          {cartCount(state.cart) > 0 && <span className="absolute -right-2 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">{cartCount(state.cart)}</span>}
        </button>
        <CartAddButton productId={p.id} label="Adicionar ao carrinho" onClick={startCart} className="h-12 w-full" />
        <button onClick={startBuy} className="h-12 min-w-0 rounded-full bg-primary px-1.5 text-primary-foreground shadow-[0_6px_18px_color-mix(in_oklab,var(--primary)_35%,transparent)]">
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
                    <span className="flex items-center gap-0.5 rounded bg-primary px-1 font-bold text-primary-foreground"><FlashIcon className="h-[14px]" />Oferta Relâmpago</span>
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
