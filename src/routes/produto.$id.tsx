import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronLeft, ChevronRight, ChevronDown, Bookmark, Zap, Truck, ShieldCheck, Check, Store,
  MessageCircle, ShoppingCart, X, Plus, Minus, Ticket,
} from "lucide-react";
import { TopBar, SiteFooter, Verified } from "@/components/shop/chrome";
import { getProduct, store, brl, discountPct, unitPrice, type Variant } from "@/lib/catalog";
import { useCheckout, useOfferEnd } from "@/lib/checkout";

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

const strip = ["LOJA SANTA EFIGÊNIA", "FRETE GRÁTIS BRASIL"];

function ProductPage() {
  const { product: p } = Route.useLoaderData();
  const navigate = useNavigate();
  const { update } = useCheckout();
  const offer = useOfferEnd();
  const [idx, setIdx] = useState(0);
  const [sheet, setSheet] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [opened, setOpened] = useState<string | null>(null);
  const variant = p.variants.find((v: Variant) => v.id === picked) ?? null;
  const hasVariants = p.variants.length > 0;
  const unitCount = variant ? variant.pieces : 1;
  const shownPrice = variant ? variant.price : p.price;
  const shownOriginal = variant ? variant.original : p.original;

  function startBuy() {
    if (hasVariants) setSheet(true);
    else go();
  }
  function go() {
    update({ productId: p.id, variantId: variant?.id ?? null, qty });
    navigate({ to: "/checkout" });
  }

  return (
    <div className="app-frame pb-[72px]">
      <TopBar />
      <div className="overflow-hidden bg-ink py-2 text-[10px] font-bold tracking-wider text-ink-foreground">
        <div className="marquee flex w-max gap-6 whitespace-nowrap">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="flex items-center gap-6">
              <span className="text-teal">◆</span>{strip[i % 2]}
            </span>
          ))}
        </div>
      </div>

      <div className="relative bg-card">
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5">
          <img src={store.logo} alt="" className="h-7 w-7 rounded-full" />
        </div>
        <img src={p.gallery[idx]} alt={p.title} className="mx-auto aspect-square w-full object-contain p-6" />
        {p.gallery.length > 1 && (
          <>
            <button aria-label="Anterior" onClick={() => setIdx((idx + p.gallery.length - 1) % p.gallery.length)} className="absolute left-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-background/80 shadow">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button aria-label="Próxima" onClick={() => setIdx((idx + 1) % p.gallery.length)} className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-background/80 shadow">
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
        <span className="absolute bottom-3 right-3 rounded-full bg-ink/60 px-2 py-0.5 text-[10px] text-ink-foreground">
          {idx + 1}/{p.gallery.length}
        </span>
      </div>

      <div className="bg-flash flex items-center justify-between px-3 py-2 text-primary-foreground">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-background/25 px-1.5 text-[10px] font-bold">-{discountPct(shownPrice, shownOriginal)}%</span>
            <span className="text-[20px] font-extrabold">{brl(shownPrice)}</span>
          </div>
          <div className="text-[10px] opacity-90">{brl(shownOriginal)} no PIX</div>
        </div>
        <div className="text-right text-[11px]">
          <div className="flex items-center justify-end gap-1 font-semibold"><Zap className="h-3 w-3 fill-current" />Oferta Relâmpago</div>
          <div>Termina em <b>{offer.hms}</b></div>
        </div>
      </div>

      <div className="px-3 pt-3">
        <div className="text-[11px] text-success">{brl(shownPrice)} no PIX</div>
        <div className="mt-1 flex items-start justify-between gap-2">
          <h1 className="text-[14px] font-bold leading-snug">{p.title}</h1>
          <Bookmark className="mt-0.5 h-4 w-4 shrink-0" />
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">{p.category}</div>
      </div>

      {hasVariants && (
        <>
          <div className="mt-4 flex items-center justify-between px-3">
            <h2 className="text-[13px] font-bold">Selecionar modelo e cor</h2>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              {variant ? `${variant.line} · ${variant.color}` : "Escolha uma opção"}<ChevronDown className="h-3 w-3" />
            </span>
          </div>
          <div className="space-y-2 px-3 pt-3">
            {p.variants.map((v: Variant) => (
              <button
                key={v.id}
                onClick={() => setPicked(v.id)}
                className={`grid w-full grid-cols-[48px_minmax(0,1fr)_auto_16px] items-center gap-2 rounded-lg border bg-card p-2.5 text-left ${picked === v.id ? "border-primary" : "border-border"}`}
              >
                <img src={v.image} alt="" className="h-12 w-12 rounded object-cover" />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold leading-tight">{v.line} · {v.color}</div>
                  <div className="text-[8px] leading-tight text-muted-foreground">{v.description}</div>
                  <span className="mt-1 inline-block rounded bg-success-soft px-1 text-[8px] font-semibold text-success">
                    Economia R$ {((v.original - v.price) / 100).toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-[12px] font-extrabold">{brl(v.price)}</div>
                  <div className="text-[8px] text-muted-foreground line-through">{brl(v.original)}</div>
                  <div className="text-[7px] text-muted-foreground">{brl(unitPrice(v))} por unidade</div>
                </div>
                <span className={`h-3.5 w-3.5 rounded-full border ${picked === v.id ? "border-4 border-primary" : "border-border"}`} />
              </button>
            ))}
          </div>
        </>
      )}

      <div className="mt-4 flex items-center justify-between border-y border-border px-3 py-3">
        <div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <Truck className="h-4 w-4" />
            <span className="rounded bg-teal-soft px-1 font-semibold text-teal-ink">Frete grátis</span>
            <span className="text-muted-foreground line-through">R$ 26,20</span>
          </div>
          <div className="mt-1 text-[11px] font-bold">Receba até 4 – 5 de nov.</div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="mx-3 mt-3 rounded-lg border border-border p-3">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-gold" />Proteção do cliente</span>
          <ChevronRight className="h-3 w-3" />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-y-1 text-[10px] text-muted-foreground">
          {["Devolução gratuita", "Proteção e reembolso", "Pagamento seguro", "Garantia de pontualidade"].map((t) => (
            <span key={t} className="flex items-center gap-1"><Check className="h-3 w-3" />{t}</span>
          ))}
        </div>
      </div>

      <div className="mt-4 border-t-8 border-surface p-3">
        <div className="flex items-center gap-3">
          <img src={store.logo} alt="" className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 text-[12px] font-extrabold"><span className="truncate">{store.name}</span><Verified className="h-3.5 w-3.5" /></div>
            <p className="line-clamp-4 text-[10px] leading-snug text-muted-foreground">{store.bio}</p>
          </div>
          <Link to="/" className="flex shrink-0 items-center text-[10px] font-bold">Ver loja<ChevronRight className="h-3 w-3" /></Link>
        </div>
      </div>

      <div className="border-t-8 border-surface px-3 py-4">
        <h2 className="mb-3 text-[14px] font-extrabold">Sobre este produto</h2>
        {["Detalhes", "Descrição do produto"].map((t) => (
          <div key={t} className="border-b border-border">
            <button onClick={() => setOpened(opened === t ? null : t)} className="flex w-full items-center justify-between py-3 text-[11px] font-semibold">
              {t}<ChevronDown className={`h-3.5 w-3.5 transition-transform ${opened === t ? "rotate-180" : ""}`} />
            </button>
            {opened === t && <p className="pb-3 text-[11px] text-muted-foreground">{p.title}</p>}
          </div>
        ))}
      </div>
      <div className="h-10 bg-surface" />
      <SiteFooter />

      <div className="fixed bottom-0 left-1/2 z-40 grid w-full max-w-[480px] -translate-x-1/2 grid-cols-[auto_auto_44px_minmax(0,1fr)] items-center gap-3 border-t border-border bg-background px-3 py-2 pb-safe">
        <Link to="/" className="flex flex-col items-center text-[9px]"><Store className="h-4 w-4" />Loja</Link>
        <span className="flex flex-col items-center text-[9px]"><MessageCircle className="h-4 w-4" />Chat</span>
        <span className="grid h-10 w-11 place-items-center rounded-lg bg-primary-soft text-primary"><ShoppingCart className="h-4 w-4" /></span>
        <button onClick={startBuy} className="rounded-full bg-primary py-1.5 text-primary-foreground">
          <div className="text-[14px] font-extrabold leading-tight">Comprar agora</div>
          <div className="text-[9px] leading-tight opacity-90">{brl(shownPrice)} | Frete grátis</div>
        </button>
      </div>

      {sheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay" onClick={() => setSheet(false)}>
          <div className="relative w-full max-w-[480px]" onClick={(e) => e.stopPropagation()}>
            <button aria-label="Fechar" onClick={() => setSheet(false)} className="absolute -top-11 right-3 grid h-8 w-8 place-items-center rounded-full border-2 border-primary bg-background">
              <X className="h-4 w-4" />
            </button>
            <div className="rounded-t-2xl bg-background px-3 pb-safe pt-3">
              <div className="flex gap-2.5">
                <img src={(variant ?? p.variants[0]).image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold leading-snug">
                    Karsten {variant ? `${variant.line} · ${variant.color}` : "Bosco · Azul Serena/Azul Naval"} · 4 toalhas
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[9px]">
                    <span className="flex items-center gap-0.5 rounded bg-primary px-1 font-bold text-primary-foreground"><Zap className="h-2.5 w-2.5 fill-current" />Oferta Relâmpago</span>
                    <span className="font-bold text-primary">{offer.hms}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[15px] font-extrabold text-primary">{brl(shownPrice * qty)}</span>
                      <span className="text-[8px] text-muted-foreground">no PIX</span>
                      <span className="rounded bg-primary-soft px-1 text-[8px] font-bold text-primary"><Ticket className="inline h-2 w-2" /></span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-[8px]">
                      <span className="text-muted-foreground line-through">{brl(shownOriginal)}</span>{" "}
                      <span className="rounded bg-primary-soft px-1 font-bold text-primary">-{discountPct(shownPrice, shownOriginal)}%</span>
                    </div>
                    <div className="flex items-center rounded border border-border text-[11px]">
                      <button aria-label="Diminuir" onClick={() => setQty(Math.max(1, qty - 1))} className="px-1.5 py-0.5"><Minus className="h-3 w-3" /></button>
                      <span className="w-7 text-center">{qty}</span>
                      <button aria-label="Aumentar" onClick={() => setQty(qty + 1)} className="px-1.5 py-0.5"><Plus className="h-3 w-3" /></button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between rounded-md bg-teal-soft px-2 py-1.5 text-[9px]">
                <span>Receba até 4 – 5 de nov.</span>
                <span><s className="text-muted-foreground">R$ 26,20</s> <b className="text-teal-ink">Grátis</b></span>
              </div>
              <div className="mt-3 text-[11px]">Karsten · Escolha modelo e cor ({p.variants.length})</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {p.variants.map((v: Variant) => (
                  <button key={v.id} onClick={() => setPicked(v.id)} className={`rounded-lg border p-1.5 text-center ${picked === v.id ? "border-primary" : "border-border"}`}>
                    <img src={v.image} alt="" className="aspect-[4/3] w-full rounded object-cover" />
                    <div className="mt-1 text-[8.5px] font-medium leading-tight">{v.line} · {v.color}</div>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[9px] text-muted-foreground">{variant ? " " : "Selecione uma opção para continuar."}</p>
              <div className="mt-4 flex items-baseline justify-between border-t border-border pt-3">
                <span className="text-[12px] font-bold">Total ({unitCount * qty} itens)</span>
                <span className="text-[15px] font-extrabold">{brl(shownPrice * qty)}</span>
              </div>
              <button
                disabled={!variant}
                onClick={go}
                className="mb-2 mt-2 w-full rounded-full bg-primary py-3 text-[14px] font-extrabold text-primary-foreground disabled:opacity-40"
              >
                Comprar agora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
