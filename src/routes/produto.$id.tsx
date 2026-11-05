import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronLeft, ChevronRight, ChevronDown, Bookmark, Zap, Truck, ShieldCheck, Check, Store,
  ShoppingCart, X, Plus, Minus, Star, RotateCcw, Wallet, Lock, Clock,
} from "lucide-react";
import { TopBar, SiteFooter, Verified, Sheet } from "@/components/shop/chrome";
import { getProduct, store, brl, discountPct, unitPrice, type Variant } from "@/lib/catalog";
import { useCheckout, useOfferEnd, addToCart, type CartItem } from "@/lib/checkout";

const cartCount = (c: CartItem[]) => c.reduce((n, i) => n + i.qty, 0);

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
    <div className="app-frame grid place-items-center p-8 text-center">
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

const strip = ["FRETE GRÁTIS BRASIL", "ESPECIAL 25.12", "COMPRA PROTEGIDA", "ATÉ 70% OFF"];
type DemoReview = { id: string; name: string; date: string; rating: number; text: string; media: string | null };
const demoReviewCopy = [
  'Produto muito bonito e corresponde ao que eu esperava. Gostei bastante da compra!',
  'Chegou direitinho e bem embalado. A qualidade me surpreendeu.',
  'Gostei do acabamento e da praticidade. Atendeu bem às minhas expectativas.',
  'Boa compra! O produto é como aparece nas fotos e parece ser bem resistente.',
  'Tudo certo com o pedido. Estou satisfeita com o produto.',
  'Valeu a pena. Produto bonito, útil e fácil de usar no dia a dia.',
];
// Dados locais de demonstração para uso interno; substituir por avaliações reais antes de publicar em produção.
function makeDemoReviews(productId: string, gallery: string[]): DemoReview[] {
  if (productId === "arvore-natal-kit-87-enfeites") return []; // Não exibir depoimentos sem avaliações reais.
  const towel = productId === 'jogo-toalhas-karsten';
  const names = ['Mariana S.', 'Rafaela M.', 'Camila R.', 'João P.', 'Ana C.', 'Patrícia L.'];
  const ratings = towel ? [5, 5, 5, 5, 4, 5] : [5, 5, 4, 5, 5, 4];
  return names.map((name, i) => ({ id: 'demo-' + productId + '-' + i, name, date: ['há 2 dias', 'há 5 dias', 'há 1 semana', 'há 2 semanas', 'há 3 semanas', 'há 1 mês'][i] ?? '', rating: ratings[i] ?? 5, text: demoReviewCopy[(i + (towel ? 0 : 2)) % demoReviewCopy.length] ?? '', media: i < Math.min(2, gallery.length) ? gallery[i % gallery.length] ?? null : null }));
}
function formatDemoSales(productId: string) { return productId === "arvore-natal-kit-87-enfeites" ? "800+ vendidos" : productId === "jogo-toalhas-karsten" ? "7,8 mil vendidos" : "2,4 mil vendidos"; }
function ReviewStars({ rating, size = "h-3.5 w-3.5" }: { rating: number; size?: string }) {
  return <span className="inline-flex items-center" aria-label={rating.toFixed(1) + " de 5 estrelas"}>{[1,2,3,4,5].map((n) => {
    const fill = Math.max(0, Math.min(1, rating - (n - 1)));
    return <span key={n} className={"relative inline-block " + size}><Star className="absolute inset-0 h-full w-full text-border" /><span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: (fill * 100) + "%" }}><Star className="h-full w-full fill-ink text-ink" /></span></span>;
  })}</span>;
}

function ProductPage() {
  const { product: p } = Route.useLoaderData();
  const navigate = useNavigate();
  const { state, update } = useCheckout();
  const [idx, setIdx] = useState(0);
  const [sheet, setSheet] = useState<null | "buy" | "cart">(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [opened, setOpened] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [protect, setProtect] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<number | null>(null);
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [showAllReviewMedia, setShowAllReviewMedia] = useState(false);
  const demoReviews = makeDemoReviews(p.id, p.gallery);
  const filteredReviews = reviewFilter == null ? demoReviews : demoReviews.filter((review) => review.rating === reviewFilter);
  const reviewAverage = demoReviews.length ? demoReviews.reduce((sum, review) => sum + review.rating, 0) / demoReviews.length : (p.rating ?? 0);
  const reviewMedia = demoReviews.filter((review) => review.media);
  const variant = p.variants.find((v: Variant) => v.id === picked) ?? null;
  const hasVariants = p.variants.length > 0;
  const isVoltageOnly = p.id === "arvore-natal-kit-87-enfeites";
  const unitCount = variant ? variant.pieces : 1;
  const shownPrice = variant ? variant.price : p.price;
  const shownOriginal = variant ? variant.original : p.original;
  const fav = state.favorites.includes(p.id);

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
    setSheet(null);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }
  function go() {
    update({ checkoutItems: [], productId: p.id, variantId: variant?.id ?? null, qty });
    navigate({ to: "/checkout" });
  }

  return (
    <div className="app-frame pb-[84px]">
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
        <img src={p.gallery[idx]} alt={p.title} loading="eager" fetchPriority="high" decoding="async" width={600} height={600} className="mx-auto aspect-square w-full object-contain p-4" />
        {p.gallery.length > 1 && (
          <>
            <button aria-label="Anterior" onClick={() => setIdx((idx + p.gallery.length - 1) % p.gallery.length)} className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-background/85 shadow">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button aria-label="Próxima" onClick={() => setIdx((idx + 1) % p.gallery.length)} className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-background/85 shadow">
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
            <span className="shrink-0 rounded-md bg-background/25 px-2 py-0.5 text-[14px] font-bold">-{discountPct(shownPrice, shownOriginal)}%</span>
            <span className="truncate text-[24px] font-extrabold leading-none">{brl(shownPrice)}</span>
          </div>
          <div className="mt-1.5 text-[13px] opacity-90">De <s>{brl(shownOriginal)}</s></div>
        </div>
        <div className="text-right text-[12.5px] leading-tight">
          <div className="flex items-center justify-end gap-1 font-bold"><Zap className="h-4 w-4 fill-current" />Oferta Relâmpago</div>
          <div className="mt-1">Termina em <b className="tabular-nums"><OfferTimer /></b></div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="text-[15px] font-semibold text-success">{brl(shownPrice)} no PIX</div>
        <div className="mt-2 mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
          <ReviewStars rating={Math.round(reviewAverage)} /><b className="text-[13px]">{reviewAverage.toFixed(1)}</b><span className="text-muted-foreground">·</span><span className="text-muted-foreground">{formatDemoSales(p.id)}</span>
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
            <h2 className="text-[16px] font-bold">{p.id === "arvore-natal-kit-87-enfeites" ? "Escolha a voltagem" : "Selecionar modelo e cor"}</h2>
            <span className="truncate text-[13px] text-muted-foreground">{variant ? `${variant.line} · ${variant.color}` : `${p.variants.length} opções`}</span>
          </div>
          {isVoltageOnly ? (
            <div className="flex items-center justify-start gap-2 px-4 pt-3">
              {p.variants.map((v: Variant) => (
                <button key={v.id} type="button" onClick={() => setPicked(v.id)} aria-pressed={picked === v.id}
                  className={`inline-flex h-9 min-w-[76px] items-center justify-center gap-2 rounded-lg border px-3 text-[13px] font-bold transition-colors ${picked === v.id ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-foreground"}`}>
                  {v.color}
                  {picked === v.id && <Check className="h-3.5 w-3.5" />}
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
            <Truck className="h-5 w-5" />
            <span className="rounded-md bg-teal-soft px-2 py-0.5 font-semibold text-teal-ink">Frete grátis</span>
            <span className="text-muted-foreground line-through">R$ 26,20</span>
          </div>
          <div className="mt-1 text-[14.5px] font-bold">Receba até 4 – 5 de nov.</div>
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
        <>
        <div className="mt-4 grid grid-cols-[112px_minmax(0,1fr)] gap-3 rounded-2xl bg-surface p-3">
          <div className="flex flex-col items-center justify-center border-r border-border pr-3 text-center"><strong className="text-[34px] leading-none">{reviewAverage.toFixed(1)}</strong><ReviewStars rating={Math.round(reviewAverage)} size="h-4 w-4" /><span className="mt-1 text-[11px] text-muted-foreground">{demoReviews.length} avaliações</span></div>
          <div className="space-y-1.5">{[5,4,3,2,1].map((stars) => { const count = demoReviews.filter((review) => review.rating === stars).length; const percent = demoReviews.length ? (count / demoReviews.length) * 100 : 0; return <button key={stars} onClick={() => { setReviewFilter(reviewFilter === stars ? null : stars); setVisibleReviews(3); }} className={"flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-left " + (reviewFilter === stars ? "bg-background" : "")}><span className="w-3 text-[11px] text-muted-foreground">{stars}</span><Star className="h-3 w-3 fill-ink text-ink" /><span className="h-1.5 flex-1 overflow-hidden rounded-full bg-border"><span className="block h-full rounded-full bg-ink" style={{ width: percent + "%" }} /></span><span className="w-4 text-right text-[10px] text-muted-foreground">{count}</span></button>; })}</div>
        </div>
        {reviewMedia.length > 0 && <div className="mt-5"><div className="mb-2 flex items-center justify-between gap-2"><h3 className="text-[15px] font-bold">Fotos e vídeos das avaliações</h3><button onClick={() => setShowAllReviewMedia(true)} className="shrink-0 text-[12px] font-bold text-primary">Ver tudo <ChevronRight className="inline h-4 w-4" /></button></div><div className="flex gap-2 overflow-x-auto pb-2">{reviewMedia.slice(0, 6).map((review) => <button key={review.id} onClick={() => setShowAllReviewMedia(true)} className="w-[88px] shrink-0 text-left"><img src={review.media!} alt="Imagem da avaliação" loading="lazy" className="aspect-square w-full rounded-xl bg-surface object-cover" /><p className="mt-1 truncate text-[11px] font-semibold">{review.name}</p><ReviewStars rating={review.rating} size="h-3 w-3" /></button>)}</div></div>}
        <div className="mt-4 flex flex-wrap items-center gap-2"><button onClick={() => { setReviewFilter(null); setVisibleReviews(3); }} className={"rounded-full border px-3 py-1.5 text-[12px] font-semibold " + (reviewFilter == null ? "border-ink bg-ink text-ink-foreground" : "border-border")}>Todas</button>{[5,4,3,2,1].map((stars) => <button key={stars} onClick={() => { setReviewFilter(reviewFilter === stars ? null : stars); setVisibleReviews(3); }} className={"rounded-full border px-3 py-1.5 text-[12px] font-semibold " + (reviewFilter === stars ? "border-ink bg-ink text-ink-foreground" : "border-border")}>{stars} estrelas</button>)}</div>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">{filteredReviews.slice(0, visibleReviews).map((review) => <article key={review.id} id={review.id} className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">{review.media && <img src={review.media} alt="Imagem associada à avaliação" loading="lazy" className="aspect-[4/3] w-full bg-surface object-cover" />}<div className="flex flex-col p-2.5"><div className="flex items-center gap-2"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-bold">{review.name.split(" ").map((part) => part[0]).slice(0,2).join("")}</span><div className="min-w-0"><div className="truncate text-[12px] font-semibold">{review.name}</div><div className="text-[10px] text-muted-foreground">{review.date}</div></div></div><div className="mt-2"><ReviewStars rating={review.rating} size="h-3 w-3" /></div><p className="mt-2 text-[12px] leading-snug">{review.text}</p></div></article>)}</div>
        {filteredReviews.length === 0 && <p className="py-6 text-center text-[13px] text-muted-foreground">Nenhuma avaliação nesta faixa de estrelas na amostra.</p>}
        {filteredReviews.length > visibleReviews && <button onClick={() => setVisibleReviews((count) => count + 3)} className="mt-2 w-full rounded-full border border-border py-3 text-[13px] font-bold">Ver mais avaliações</button>}
        </>}
      </section>
      <div className="h-10 bg-surface" />
      <SiteFooter />

      {showAllReviewMedia && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-overlay sm:items-center" onClick={() => setShowAllReviewMedia(false)}>
          <div role="dialog" aria-modal="true" aria-label="Fotos e vídeos das avaliações" className="relative max-h-[90dvh] w-full max-w-[560px] overflow-y-auto rounded-t-3xl bg-background p-4 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div><h2 className="text-[18px] font-extrabold">Fotos e vídeos das avaliações</h2><p className="text-[12px] text-muted-foreground">{reviewMedia.length} mídias</p></div>
              <button aria-label="Fechar galeria" onClick={() => setShowAllReviewMedia(false)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">{reviewMedia.map((review) => <div key={review.id} className="min-w-0"><img src={review.media!} alt="Imagem da avaliação" loading="lazy" className="aspect-square w-full rounded-xl bg-surface object-cover" /><div className="mt-1.5 flex items-center justify-between gap-1"><span className="truncate text-[11px] font-semibold">{review.name}</span><ReviewStars rating={review.rating} size="h-3 w-3" /></div></div>)}</div>
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
        <button aria-label="Adicionar ao carrinho" onClick={startCart} className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
          <ShoppingCart className="h-6 w-6" /><Plus className="-mt-3 h-3.5 w-3.5" />
        </button>
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
                <span>Receba até 4 – 5 de nov.</span>
                <span><s className="text-muted-foreground">R$ 26,20</s> <b className="text-teal-ink">Grátis</b></span>
              </div>
              <div className="mt-4 text-[14.5px] font-bold">{p.id === "arvore-natal-kit-87-enfeites" ? "Escolha a voltagem" : `Escolha modelo e cor (${p.variants.length})`}</div>
              {isVoltageOnly ? (
                <div className="mt-2.5 flex items-center justify-start gap-2">
                  {p.variants.map((v: Variant) => (
                    <button key={v.id} type="button" onClick={() => setPicked(v.id)} aria-pressed={picked === v.id}
                      className={`inline-flex h-9 min-w-[76px] items-center justify-center gap-2 rounded-lg border px-3 text-[13px] font-bold transition-colors ${picked === v.id ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-foreground"}`}>
                      {v.color}
                      {picked === v.id && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-2.5 grid grid-cols-3 gap-2.5">
                  {p.variants.map((v: Variant) => (
                    <button key={v.id} onClick={() => setPicked(v.id)} className={`min-w-0 rounded-xl border-2 bg-card p-1.5 text-center transition-colors duration-200 ${picked === v.id ? "border-primary" : "border-border"}`}>
                      <img src={v.image} alt="" className="aspect-[4/3] w-full rounded object-cover" />
                      <div className="mt-1 text-[11.5px] font-semibold leading-tight">{v.line}</div><div className="line-clamp-2 break-words text-[11px] leading-tight text-muted-foreground">{v.color}</div>
                    </button>
                  ))}
                </div>
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
