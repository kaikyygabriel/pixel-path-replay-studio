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
function makeStructuredDemoReviews(
  photos: { id: string; src: string }[],
  names: string[],
  dates: string[],
  ratings: number[],
  texts: string[],
): DemoReview[] {
  return photos.map((photo, index) => ({
    id: photo.id,
    name: names[index % names.length],
    date: dates[index % dates.length],
    rating: ratings[index % ratings.length],
    text: texts[index % texts.length],
    media: photo.src,
  }));
}
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
  const legacyDemoReviews: DemoReview[] = isBedsheetSet
    ? makeStructuredDemoReviews(
        bedsheetReviewPhotos,
        ["Mariana C.", "Rafaela M.", "Camila R.", "João P.", "Ana L.", "Patrícia S.", "Bruna F.", "Diego A."],
        ["há 1 dia", "há 3 dias", "há 5 dias", "há 1 semana", "há 8 dias", "há 10 dias", "há 12 dias", "há 2 semanas"],
        [5, 5, 5, 5, 5, 5, 5, 5],
        [
          "O tecido é bem macio ao toque e o lençol ficou firme no colchão. Gostei do acabamento das fronhas.",
          "A cor veio como eu esperava e o conjunto deixou a cama bem arrumada. Pelo preço, gostei bastante.",
          "As fronhas têm um acabamento delicado e o lençol com elástico veste bem o colchão.",
          "Comprei para renovar o quarto. É leve, seca rápido e ficou bonito na cama.",
          "Gostei da textura e da praticidade para colocar e retirar. As medidas atenderam ao meu colchão.",
          "O conjunto é simples e bonito. O ponto palito dá um detalhe legal nas fronhas.",
          "Chegou bem embalado e a cor ficou muito bonita pessoalmente. Estou satisfeita com a compra.",
          "Bom para o uso diário. O elástico ajuda a manter o lençol no lugar durante a noite.",
        ],
      )
    : isTramontinaKnives
      ? [
          ...makeStructuredDemoReviews(
            tramontinaKnifeReviewPhotos,
            ["Marcos A.", "Juliana R.", "Camila F.", "Rogério P."],
            ["há 2 dias", "há 4 dias", "há 1 semana", "há 9 dias"],
            [5, 5, 5, 4],
            [
              "O conjunto é bem completo para a rotina. As peças têm bom acabamento e ficam organizadas na cozinha.",
              "Gostei da variedade de facas. Os cabos são confortáveis e as lâminas cortam bem os alimentos do dia a dia.",
              "Comprei pensando nos preparos de fim de semana. É prático ter tamanhos diferentes no mesmo conjunto.",
              "Visual bonito e conjunto útil. Para cortes mais delicados, escolho a faca adequada entre as peças.",
            ],
          ),
          { id: "tramontina-text-5", name: "Patrícia M.", date: "há 5 dias", rating: 5, text: "As facas são leves e fáceis de manusear. O suporte ajuda a deixar tudo no mesmo lugar.", media: null },
          { id: "tramontina-text-6", name: "Eduardo T.", date: "há 8 dias", rating: 5, text: "Gostei do custo-benefício e da quantidade de peças. Já usei para legumes, pão e carnes.", media: null },
          { id: "tramontina-text-7", name: "Lívia C.", date: "há 11 dias", rating: 5, text: "Conjunto prático para quem está montando a cozinha. As peças têm aparência discreta.", media: null },
          { id: "tramontina-text-8", name: "André V.", date: "há 2 semanas", rating: 5, text: "Chegou tudo certo e bem acondicionado. Atendeu ao que eu procurava para o uso diário.", media: null },
        ]
      : isIntelbrasCamera
        ? [
            ...makeStructuredDemoReviews(
              intelbrasReviewPhotos,
              ["Rafael M.", "Camila S.", "Bruno A.", "Fernanda L.", "Diego R.", "Mariana P.", "Lucas T.", "Patrícia G.", "André C.", "Juliana F.", "Renata B.", "Thiago V."],
              ["há 1 dia", "há 2 dias", "há 4 dias", "há 5 dias", "há 1 semana", "há 8 dias", "há 9 dias", "há 11 dias", "há 12 dias", "há 2 semanas", "há 15 dias", "há 18 dias"],
              [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
              [
                "A imagem fica nítida e a instalação foi tranquila seguindo o guia. O acesso pelo celular facilita bastante.",
                "Gostei da visão noturna colorida. Consigo acompanhar o quintal pelo aplicativo mesmo à noite.",
                "A câmera tem boa definição e o áudio ajuda a ouvir e falar pelo aplicativo. Atendeu ao que precisava.",
                "Instalei na área externa e a conexão ficou estável no ponto onde coloquei. A imagem é bem definida.",
                "O alerta de movimento é útil e gostei de poder ajustar as notificações pelo celular.",
                "A imagem Full HD atende bem para monitorar a entrada. O aplicativo tem várias opções de configuração.",
                "Boa câmera para acompanhar a área externa. A proteção IP67 foi um dos pontos que considerei na compra.",
                "O holofote ajuda bastante quando escurece. A imagem fica clara e consigo acompanhar pelo telefone.",
                "A configuração inicial exigiu atenção ao Wi-Fi de 2,4 GHz, mas depois ficou funcionando direitinho.",
                "Gostei da possibilidade de gravar no cartão de memória e consultar as imagens quando preciso.",
                "O áudio bidirecional é um recurso interessante. Consigo falar pelo celular quando alguém está perto da câmera.",
                "Produto bem acabado e com bons recursos para monitoramento residencial. A instalação ficou discreta.",
              ],
            ),
            { id: "intelbras-text-13", name: "Aline D.", date: "há 3 dias", rating: 5, text: "A detecção de pessoas ajuda a filtrar os avisos. Ajustei a sensibilidade conforme o movimento da rua.", media: null },
            { id: "intelbras-text-14", name: "Gustavo N.", date: "há 7 dias", rating: 5, text: "Gostei do zoom e da qualidade da imagem. Vale conferir o sinal do Wi-Fi no local antes de instalar.", media: null },
            { id: "intelbras-text-15", name: "Sônia R.", date: "há 10 dias", rating: 5, text: "Uso para acompanhar o corredor externo. O aplicativo é prático para consultar a câmera quando estou fora.", media: null },
            { id: "intelbras-text-16", name: "Felipe H.", date: "há 16 dias", rating: 5, text: "Chegou com os acessórios de instalação e a fonte. Funcionou bem depois de conectar à rede 2,4 GHz.", media: null },
          ]
        : isPurifierElectrolux
          ? [
              ...makeStructuredDemoReviews(
                purifierReviewPhotos,
                ["Mariana F.", "Camila R.", "Patrícia M.", "Juliana A.", "Fernanda C.", "Renata S.", "Aline P.", "Bruna L.", "Débora T.", "Carolina G.", "Vanessa B.", "Priscila D.", "Michele V.", "Sabrina H.", "Elaine R."],
                ["há 1 dia", "há 2 dias", "há 3 dias", "há 5 dias", "há 6 dias", "há 1 semana", "há 8 dias", "há 9 dias", "há 10 dias", "há 12 dias", "há 2 semanas", "há 15 dias", "há 16 dias", "há 18 dias", "há 3 semanas"],
                [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 5],
                [
                  "A água gelada sai na temperatura que eu gosto e o painel é simples de usar. O acabamento prata ficou bonito na cozinha.",
                  "Gostei de poder escolher água natural ou gelada. A bandeja removível também facilita a limpeza.",
                  "O purificador ficou ótimo na bancada e a seleção de porções é prática para encher garrafas.",
                  "A instalação foi tranquila depois de conferir a pressão da água. O alerta do filtro é um detalhe útil.",
                  "O painel touch responde bem e o fluxo de água é fácil de controlar. Atendeu à rotina da família.",
                  "Gostei do visual e da praticidade. Ter água gelada sem precisar de garrafas na geladeira ajuda bastante.",
                  "O aparelho é silencioso para o ambiente em que está instalado. A água sai com bom fluxo.",
                  "A bandeja flexível ajuda com copos de tamanhos diferentes. Achei fácil manter a área limpa.",
                  "A opção de água natural e gelada atende bem aqui em casa. O acabamento combina com os eletros.",
                  "Produto bonito e funcional. Só é importante verificar a pressão da água antes de instalar, como orienta o fabricante.",
                  "Gostei do painel e da facilidade para selecionar a quantidade. Ficou prático para o uso diário.",
                  "A filtragem em dois estágios e o alerta de troca foram pontos que pesaram na minha escolha.",
                  "Chegou bem embalado e o aparelho funciona como esperado. O visual prata é discreto.",
                  "Gostei do produto, mas precisei ajustar o ponto de instalação para respeitar a pressão mínima indicada.",
                  "O purificador deixou a rotina mais prática. A água gelada e o controle de porções são os recursos que mais uso.",
                ],
              ),
              { id: "purifier-text-16", name: "Roberto L.", date: "há 4 dias", rating: 5, text: "O painel é intuitivo e a bandeja sai para lavar. Foi uma boa escolha para a cozinha.", media: null },
              { id: "purifier-text-17", name: "Tatiane O.", date: "há 8 dias", rating: 5, text: "Uso várias vezes ao dia e gosto de não precisar ocupar espaço com garrafas de água na geladeira.", media: null },
              { id: "purifier-text-18", name: "André P.", date: "há 13 dias", rating: 4, text: "O produto atende bem. Vale conferir a pressão da rede hidráulica e o espaço para instalação antes da compra.", media: null },
              { id: "purifier-text-19", name: "Beatriz K.", date: "há 17 dias", rating: 5, text: "Gostei do acabamento e da praticidade de ter água natural ou gelada com um toque.", media: null },
            ]
          : isChandonReserve ? [
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
  ] : makeDemoReviews(p.id, p.gallery);;
  // Textos de exemplo, escritos para cada produto. Não são relatos de compradores.
  const demoReviewTexts: Record<string, string[]> = {
    "jogo-toalhas-karsten": [
      "O que mais gostei foi a absorção. Depois do banho a toalha não fica só espalhando água, sabe?",
      "As peças têm uma aparência bonita e deixam o banheiro com cara de arrumado. Gostei do conjunto.",
      "bem macias mesmo, principalmente depois de lavar. achei uma boa opção pra renovar as toalhas"
    ],
    "chaleira-unitermi-atacama": [
      "O visual é bonito e a proposta é prática. Deixar a água pronta para o café sem ocupar muito espaço é o que chama atenção.",
      "Gostei do formato, parece combinar bem com uma cozinha mais compacta. É aquele tipo de item útil na rotina.",
      "Acho interessante para quem prepara chá ou café várias vezes ao dia. Simples, sem muita complicação."
    ],
    "arvore-natal-kit-87-enfeites": [
      "O kit ajuda bastante a montar uma decoração de Natal mais completa sem precisar escolher cada enfeite separado.",
      "Tem bastante variedade para brincar com a composição. Dá para deixar a árvore com uma aparência bem mais preenchida.",
      "Para quem gosta de montar a decoração em família, esse conjunto já rende um bom começo."
    ],
    "smart-tv-tcl-55p8k-qled-4k": [
      "Uma tela desse tamanho muda bastante a experiência de assistir filme. A proposta QLED 4K é o grande atrativo aqui.",
      "Gostei de ver um conjunto de recursos tão completo numa TV de 55 polegadas. Boa opção para montar uma sala de entretenimento.",
      "Pra jogar e assistir séries, tela grande faz diferença. O design também fica bem discreto no ambiente."
    ],
    "liquidificador-mondial-l99-fb": [
      "O legal desse modelo é ter potência para preparos do cotidiano sem ocupar o espaço de um aparelho enorme.",
      "É aquele eletrodoméstico que acaba sendo usado para várias coisas: suco, vitamina, massa leve e por aí vai.",
      "Gostei da proposta mais direta. Para equipar a cozinha com um liquidificador funcional, faz sentido."
    ],
    "micro-ondas-philco-pmo31s": [
      "O tamanho de 31 litros é interessante para quem usa travessas maiores e quer mais espaço interno.",
      "Visual limpo e funções que ajudam na rotina. É um aparelho que combina com uma cozinha prática.",
      "Pra esquentar refeições e resolver as tarefas do dia a dia, a capacidade é um ponto que chama atenção."
    ],
    "ar-condicionado-lg-ai-voice-9000": [
      "A integração com comandos inteligentes é um diferencial interessante, principalmente para quem já usa automação em casa.",
      "Um aparelho de 9.000 BTUs pode ser uma alternativa para ambientes compatíveis. Vale conferir a metragem antes de escolher.",
      "Gostei da proposta de controlar funções pelo celular e por voz. Tecnologia útil quando facilita a rotina."
    ],
    "air-fryer-oven-mondial-afon-12l": [
      "O formato oven e a capacidade de 12 litros dão mais possibilidades do que uma fritadeira compacta tradicional.",
      "Achei interessante ter espaço para preparar porções maiores e visualizar o preparo pela porta.",
      "Para quem gosta de variar as receitas, o formato com várias funções parece bem versátil."
    ],
    "squishy-surpresa-colecionavel": [
      "É uma lembrancinha divertida para quem gosta de itens surpresa e colecionáveis. A graça está justamente em descobrir o modelo.",
      "bem fofinho e com aquela proposta de apertar e brincar. parece uma opção legal pra presentear",
      "A ideia de surpresa deixa a brincadeira mais interessante, principalmente para quem curte colecionar personagens."
    ],
    "barbie-casa-dos-sonhos-hmx10": [
      "É um presente de impacto para quem gosta de brincar de casinha. Os ambientes dão bastante espaço para inventar histórias.",
      "A quantidade de detalhes é o que chama atenção. É daquelas peças que viram o centro da brincadeira.",
      "Uma casa grande abre muitas possibilidades de brincadeira com outras bonecas e acessórios."
    ],
    "projetor-hy300-duoseg": [
      "A proposta portátil é interessante para montar uma sessão de filmes em diferentes cômodos. Só vale planejar bem a iluminação.",
      "Gostei da ideia de ter uma tela maior sem precisar de uma TV ocupando espaço na parede.",
      "Para assistir vídeos de vez em quando ou levar em uma viagem, o formato compacto chama atenção."
    ],
    "brastoy-controle-remoto-k602": [
      "Um controle extra pode ser bem útil para substituir um que parou de funcionar. O importante é conferir a compatibilidade.",
      "A proposta é simples e resolve uma necessidade específica. Bom lembrar de verificar o modelo do aparelho antes.",
      "Para quem perdeu o controle original, ter uma opção de reposição facilita bastante."
    ],
    "air-fryer-mondial-afn-40-bft": [
      "A capacidade de 4 litros atende bem quem prepara porções menores ou médias e quer praticidade na cozinha.",
      "É um eletrodoméstico que ajuda a variar o preparo dos alimentos sem depender tanto de óleo.",
      "Gostei do tamanho mais compacto. Parece uma escolha interessante para cozinhas com pouco espaço na bancada."
    ],
    "hot-wheels-kit-10-mattel-164": [
      "Dez carrinhos no mesmo kit é um começo ótimo para montar uma coleção ou ampliar uma que já existe.",
      "Presente fácil de agradar quem curte carrinhos. Cada modelo dá margem para inventar uma corrida diferente.",
      "O conjunto é interessante tanto para brincar quanto para guardar os modelos na coleção."
    ],
    "conjunto-panelas-antiaderente-10-pecas": [
      "Um conjunto com várias peças ajuda a deixar a cozinha mais equipada de uma vez. O acabamento também conta na escolha.",
      "Gostei da variedade de tamanhos para alternar entre preparos rápidos e refeições maiores.",
      "Para montar a cozinha ou substituir panelas antigas, ter as peças combinando é um ponto positivo."
    ],
    "kit-24-bolas-natalinas-5cm": [
      "As 24 unidades ajudam a preencher a árvore sem misturar muitos tipos diferentes de enfeite.",
      "O tamanho de 5 cm é versátil para distribuir entre galhos e combinar com outros detalhes da decoração.",
      "Uma forma simples de dar unidade à decoração de Natal. Fica fácil combinar com luzes e outros enfeites."
    ],
    "jbl-boombox-4": [
      "Esse é um produto para quem realmente valoriza som potente. O porte já deixa claro que a proposta é animar ambientes.",
      "A ideia de levar uma caixa desse tamanho para encontros e áreas externas é muito boa. O visual também chama atenção.",
      "Não é só uma caixinha para ouvir música baixinho: a proposta aqui é presença sonora e graves marcantes."
    ],
    "smartwatch-t900-s10-ultra-pro": [
      "O visual de relógio inteligente chama atenção e combina com quem gosta de acompanhar informações direto no pulso.",
      "Curti a proposta de reunir notificações e funções do dia a dia num acessório só. Antes de comprar, vale conferir a compatibilidade com o celular.",
      "É um acessório que complementa o visual e pode deixar algumas tarefas rápidas mais práticas."
    ],
    "omo-lavanderia-profissional-7l": [
      "A embalagem de 7 litros é interessante para quem tem bastante roupa para lavar e prefere comprar em maior volume.",
      "Produto de lavanderia é aquele item de reposição da rotina. O tamanho maior pode ser conveniente para famílias.",
      "Gostei da proposta econômica de ter uma quantidade maior disponível, especialmente em uma casa com lavagem frequente."
    ],
    "controle-sem-fio-xbox-branco": [
      "Para quem joga bastante, um controle extra é sempre bem-vindo. O acabamento branco também fica muito bonito no setup.",
      "O formato familiar e a conexão sem fio são os pontos que mais pesam para quem quer jogar com conforto.",
      "Presente certeiro para quem tem Xbox ou joga no PC compatível. Só conferir a compatibilidade com o dispositivo."
    ],
    "ventilador-mondial-super-turbo-8-pas-40cm": [
      "O diâmetro de 40 cm e as oito pás chamam atenção para quem procura uma ventilação mais ampla no ambiente.",
      "Gostei de poder escolher entre três velocidades e ajustar a direção do vento conforme o cômodo.",
      "A grade removível facilita pensar na limpeza periódica. Um detalhe importante para um aparelho de uso frequente."
    ],
    "power-bank-basike-10000mah-preto": [
      "Ter bateria extra na mochila dá tranquilidade em dias longos fora de casa. A capacidade de 10.000 mAh é o destaque.",
      "O formato portátil é o que mais me agrada na proposta. Dá para levar junto sem precisar carregar uma bateria enorme.",
      "Interessante ter diferentes opções de conexão e cabos integrados. Só lembrar que a velocidade depende do aparelho compatível."
    ],
    "espumante-chandon-reserve-brut-750ml": [
      "Uma opção para brindar em datas especiais. O perfil Brut e as notas frutadas combinam com quem prefere espumantes menos doces.",
      "Gosto da versatilidade para acompanhar entradas, frutos do mar e momentos de comemoração. Servir bem gelado faz diferença.",
      "A combinação de Chardonnay, Pinot Noir e Riesling Itálico dá personalidade ao rótulo. Boa ideia para uma ocasião especial."
    ],
    "purificador-electrolux-pa26g": [
      "Ter água natural e gelada no mesmo aparelho deixa a rotina mais simples. O painel touch também dá um visual moderno.",
      "O alerta de troca do filtro é um detalhe útil para lembrar da manutenção. Importante conferir a pressão da água na instalação.",
      "Gostei da proposta de controlar a quantidade de água e retirar a bandeja para limpar. São detalhes práticos no uso diário."
    ],
    "jogo-facas-tramontina-plenus-9-pecas": [
      "Ter facas de formatos diferentes ajuda bastante na preparação dos alimentos. O suporte também mantém tudo mais organizado.",
      "O conjunto de nove peças é uma boa forma de equipar a cozinha sem comprar cada faca separadamente.",
      "Visual discreto e proposta funcional. Para o preparo cotidiano, a variedade de lâminas é o que mais chama atenção."
    ],
    "camera-intelbras-im5-plus": [
      "A possibilidade de acompanhar a área pelo celular é o principal atrativo. A conexão de 2,4 GHz precisa ser considerada na instalação.",
      "Full Color, áudio bidirecional e proteção IP67 formam um conjunto interessante para monitoramento externo.",
      "Gostei de ver opções de gravação e alertas ajustáveis. É importante escolher um ponto com bom sinal de rede."
    ],
    "jogo-lencol-casal-400-fios": [
      "O lençol com elástico em toda a volta é um detalhe que ajuda a manter a cama arrumada. As fronhas com ponto palito completam o conjunto.",
      "A combinação de tecido leve e secagem prática é interessante para a rotina. O visual fica delicado sem exagero.",
      "Gostei da proposta de renovar o enxoval com três peças coordenadas. Só conferir a altura do colchão para garantir o ajuste."
    ],
  };
  const selectedReviewTexts = demoReviewTexts[p.id] ?? [
    "Uma opção interessante para quem procura praticidade e quer comparar os recursos antes de escolher.",
    "O destaque fica na proposta do produto e em como ele pode se encaixar na rotina.",
    "Vale conferir as características e medidas para ver se atende exatamente ao que você precisa."
  ];
  const demoReviews: DemoReview[] = selectedReviewTexts.map((text, index) => ({
    id: `sample-${p.id}-${index + 1}`,
    name: "Exemplo ilustrativo",
    date: "Conteúdo demonstrativo",
    rating: 0,
    text,
    media: legacyDemoReviews[index]?.media ?? null,
  }));
  const filteredReviews = reviewFilter == null ? demoReviews : demoReviews.filter((review) => review.rating === reviewFilter);
  const reviewAverage = p.rating ?? 0;
  const ratedReviews = demoReviews.filter((review) => review.rating > 0);
  const reviewCount = ratedReviews.length;
  const reviewDistribution = ratedReviews.reduce<Record<number, number>>((distribution, review) => {
    distribution[review.rating] = (distribution[review.rating] ?? 0) + 1;
    return distribution;
  }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const reviewMedia = demoReviews
    .filter((review) => review.media)
    .map((review) => ({
      id: review.id,
      media: review.media!,
      rating: review.rating,
    }));
  const hasRatedReviews = ratedReviews.length > 0;
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
        <h2 className="text-[19px] font-extrabold">Conteúdo demonstrativo do produto</h2>\n        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">Exemplos ilustrativos para apresentar o produto na vitrine. Não são avaliações reais nem relatos de compradores.</p>
        <div className="mt-4 grid grid-cols-[104px_minmax(0,1fr)] items-center gap-3 rounded-2xl bg-surface p-3 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-4 sm:p-4">
          <div className="flex min-w-0 flex-col items-center justify-center border-r border-border pr-2 text-center sm:pr-4">
            <strong className="text-[32px] font-extrabold leading-none tabular-nums sm:text-[36px]">{reviewAverage.toFixed(1).replace(".", ",")}</strong>
            <ReviewStars rating={reviewAverage} size="h-4 w-4" />
            <span className="mt-1 text-[10px] leading-tight text-muted-foreground">nota ilustrativa</span>
          </div>
          <div className="min-w-0 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviewDistribution[stars] ?? 0;
              const percent = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
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
            <h3 className="text-[15px] font-bold">Imagens ilustrativas do produto</h3>
            <button onClick={() => setShowAllReviewMedia(true)} className="shrink-0 text-[12px] font-bold text-primary">Ver tudo <ChevronRight className="inline h-4 w-4" /></button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {reviewMedia.slice(0, 15).map((review) => <button key={review.id} onClick={() => setShowAllReviewMedia(true)} className="w-[104px] shrink-0 text-left">
              <div className="relative"><img src={review.media!} alt="Imagem ilustrativa do produto" loading="lazy" className="aspect-square w-full rounded-xl bg-surface object-cover" />{"rating" in review && <ReviewMediaRating rating={review.rating} />}</div>
              {"rating" in review ? <span className="mt-1.5 flex items-center justify-center gap-1 text-[11px] font-semibold"><Star className="h-3 w-3 fill-[#FFC43B] text-[#FFC43B]" />{review.rating.toFixed(1).replace(".", ",")}</span> : isProjector ? <span className="mt-1.5 flex items-center justify-center gap-1 text-[11px] font-semibold"><Star className="h-3 w-3 fill-[#FFC43B] text-[#FFC43B]" />{reviewAverage.toFixed(1).replace(".", ",")}</span> : null}
            </button>)}
          </div>
        </div>}
{!isProjector && hasRatedReviews && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button onClick={() => { setReviewFilter(null); setVisibleReviews(3); }} className={"rounded-full border px-3 py-1.5 text-[12px] font-semibold " + (reviewFilter == null ? "border-ink bg-ink text-ink-foreground" : "border-border")}>Todas</button>
          {[5,4,3,2,1].map((stars) => <button key={stars} onClick={() => { setReviewFilter(reviewFilter === stars ? null : stars); setVisibleReviews(3); }} className={"rounded-full border px-3 py-1.5 text-[12px] font-semibold " + (reviewFilter === stars ? "border-ink bg-ink text-ink-foreground" : "border-border")}>{stars} estrelas</button>)}
        </div>
        )}
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
          {filteredReviews.slice(0, visibleReviews).map((review) => <article key={review.id} id={review.id} className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {review.media && <img src={review.media} alt="Foto enviada junto à avaliação do produto" loading="lazy" className="aspect-[4/3] w-full bg-surface object-cover" />}
            {(review.rating > 0 || review.text || review.date) && <div className="flex flex-col p-2.5">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-bold">{review.name.split(" ").map((part) => part[0]).slice(0,2).join("")}</span>
                <div className="min-w-0"><div className="truncate text-[12px] font-semibold">{review.name}</div><div className="text-[10px] text-muted-foreground">{review.date}</div></div>
              </div>
              {review.rating > 0 && <div className="mt-2"><ReviewStars rating={review.rating} size="h-3 w-3" /></div>}
              {review.text && <p className="mt-2 text-[12px] leading-snug">{review.text}</p>}
            </div>}
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
          <div role="dialog" aria-modal="true" aria-label="Galeria de imagens ilustrativas" className="relative max-h-[90dvh] w-full max-w-[560px] overflow-y-auto rounded-t-3xl bg-background p-4 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div><h2 className="text-[18px] font-extrabold">Fotos e vídeos das avaliações</h2><p className="text-[12px] text-muted-foreground">{reviewMedia.length} mídias</p></div>
              <button aria-label="Fechar galeria" onClick={() => setShowAllReviewMedia(false)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">{reviewMedia.map((review) => <div key={review.id} className="min-w-0"><div className="relative"><img src={review.media!} alt="Imagem ilustrativa do produto" loading="lazy" className="aspect-square w-full rounded-xl bg-surface object-cover" />{"rating" in review && <ReviewMediaRating rating={review.rating} />}</div><span className="mt-1.5 flex items-center justify-center gap-1 text-[11px] font-semibold"><Star className="h-3 w-3 fill-[#FFC43B] text-[#FFC43B]" />{("rating" in review ? review.rating : reviewAverage).toFixed(1).replace(".", ",")}</span></div>)}</div>
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
