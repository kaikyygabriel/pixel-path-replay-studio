import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { brl, discountPct, type Product } from "@/lib/catalog";
import flashIconAsset from "@/assets/flash-lightning-original.png.asset.json";

type FlashTimerState = { deadline: number; cycle: number };
const flashTimerMemory = new Map<string, FlashTimerState>();
const flashTimerKey = (productId: string) => `multi-achadinhos:flash-offer:${productId}:v1`;

function hashFlashSeed(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** One independent deadline per product, persisted across reloads and navigation. */
function getFlashDeadline(product: Product, now: number): number | null {
  const offer = product.flashOffer;
  if (!offer) return null;
  if (typeof offer.endsAt === "number" && Number.isFinite(offer.endsAt) && offer.endsAt > now) {
    return offer.endsAt;
  }

  const key = flashTimerKey(product.id);
  let saved: FlashTimerState | null = null;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<FlashTimerState>;
      if (typeof parsed.deadline === "number" && Number.isFinite(parsed.deadline) && typeof parsed.cycle === "number") {
        saved = { deadline: parsed.deadline, cycle: parsed.cycle };
      }
    }
  } catch {
    saved = flashTimerMemory.get(key) ?? null;
  }
  if (!saved) saved = flashTimerMemory.get(key) ?? null;
  if (saved && saved.deadline > now) return saved.deadline;

  const cycle = saved ? saved.cycle + 1 : 0;
  // Vary active offers widely between products while keeping each product's timer stable.
  const minSeconds = Math.max(60, Math.floor(offer.minDurationSeconds ?? 43 * 60));
  const maxSeconds = Math.max(minSeconds, Math.floor(offer.maxDurationSeconds ?? (6 * 60 * 60 + 40 * 60)));
  const durationSeconds = minSeconds + (hashFlashSeed(`${product.id}:${cycle}`) % (maxSeconds - minSeconds + 1));
  const next = { deadline: now + durationSeconds * 1000, cycle };
  flashTimerMemory.set(key, next);
  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // Keep the countdown usable in memory when browser storage is unavailable.
  }
  return next.deadline;
}

function useFlashDeadline(product: Product) {
  const [state, setState] = useState<{ now: number | null; deadline: number | null }>({ now: null, deadline: null });
  useEffect(() => {
    if (!product.flashOffer) {
      setState({ now: null, deadline: null });
      return;
    }
    const key = flashTimerKey(product.id);
    const refresh = () => {
      const now = Date.now();
      setState({ now, deadline: getFlashDeadline(product, now) });
    };
    refresh();
    const timer = window.setInterval(refresh, 1000);
    const sync = (event: StorageEvent) => {
      if (event.key === key) refresh();
    };
    window.addEventListener("storage", sync);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", sync);
    };
  }, [product.id, product.flashOffer?.endsAt, product.flashOffer?.minDurationSeconds, product.flashOffer?.maxDurationSeconds]);
  return state;
}

export function FlashIcon({ className = "h-[1.6em]" }: { className?: string }) {
  return <img src={flashIconAsset.url} alt="" aria-hidden="true" draggable={false} width={1159} height={1357} className={`block shrink-0 w-auto object-contain ${className}`} />;
}

function DiscountIcon() {
  return <svg viewBox="0 0 20 16" className="h-3 w-3 shrink-0" aria-hidden="true" fill="currentColor"><path d="M2 1h16v4a3 3 0 0 0 0 6v4H2v-4a3 3 0 0 0 0-6V1z" /><path d="M10 2v12" stroke="var(--primary-soft)" strokeWidth="1.5" strokeDasharray="2 2" /></svg>;
}

export function FlashOfferBadge({ product, className = "" }: { product: Product; className?: string }) {
  const { now, deadline } = useFlashDeadline(product);
  if (now === null || deadline === null) return null;
  const seconds = Math.max(0, Math.floor((deadline - now) / 1000));
  const hms = [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), seconds % 60].map(n => String(n).padStart(2, "0")).join(":");
  return <div className={`flash-offer-badge w-fit max-w-full ${className}`} aria-label={`Oferta Relâmpago, termina em ${hms}`}>
    <span className="flash-offer-label"><FlashIcon />Oferta Relâmpago</span>
    <span className="flash-offer-time tabular-nums">{hms}</span>
  </div>;
}

export function ProductBadges({ product, price = product.price, original = product.original }: { product: Product; price?: number; original?: number }) {
  const shipping = <span className="inline-flex min-h-6 shrink-0 items-center justify-center whitespace-nowrap rounded-md bg-teal-soft px-1.5 py-1 text-[10px] font-semibold leading-none text-teal-ink">Frete grátis</span>;
  if (product.flashOffer) {
    return <div className="mt-1.5 flex flex-wrap items-center gap-1">
      <FlashOfferBadge product={product} className="shrink-0" />
      {shipping}
    </div>;
  }
  return <div className="mt-1.5 flex flex-wrap items-center gap-1">
    <span className="inline-flex min-h-6 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-md bg-[#FFE4EA] px-1.5 py-1 text-[10px] font-bold leading-none text-[#C91F4B]"><DiscountIcon />{discountPct(price, original)}% OFF</span>
    {shipping}
  </div>;
}

export function ProductMetrics({ product }: { product: Product }) {
  if (product.rating === null && product.sold === null) return null;
  return <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5 text-[11px] leading-snug text-muted-foreground" aria-label={`Avaliação ${product.rating ?? "não informada"} de 5; ${product.sold ?? "vendas não informadas"} vendidos`}>
    {product.rating !== null && <><Star className="h-3.5 w-3.5 shrink-0 fill-gold text-gold" /><span className="shrink-0 font-semibold text-foreground">{product.rating.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}</span></>}
    {product.sold !== null && <><span aria-hidden="true" className="mx-0.5 text-muted-foreground">|</span><span className="min-w-0 truncate">{product.sold} vendidos</span></>}
  </div>;
}
export function ProductCard({ product, className = "", children }: { product: Product; className?: string; children?: ReactNode }) {
  return <article data-product-card={product.id} data-cart-product={product.id} className={`relative flex min-w-0 flex-col rounded-lg bg-card p-2.5 pb-3 ${className}`}>
    <Link to="/produto/$id" params={{ id: product.id }} preload="intent" className="block focus-visible:outline-2 focus-visible:outline-ring">
      <div className="relative"><img src={product.image} alt={product.title} loading="lazy" decoding="async" width={600} height={600} className="aspect-square w-full object-contain" />{/natal/i.test(product.category) && <span className="absolute right-1 top-1 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-extrabold text-primary-foreground">25.12</span>}</div>
      <h3 className="mt-1.5 line-clamp-2 min-h-10 text-[14px] leading-snug">{product.cardTitle}</h3>
    </Link>
    <div className="mt-3 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
      <span className="whitespace-nowrap text-[19px] font-bold text-primary"><span className="text-[13px]">R$ </span>{brl(product.price).slice(3)}</span>
      <span className="text-[11px] text-muted-foreground line-through">{brl(product.original)}</span>
    </div>
    <ProductBadges product={product} />
    <ProductMetrics product={product} />
    {children}
  </article>;
}

export function ReviewMediaRating({ rating }: { rating: number }) {
  if (rating <= 0) return null;
  return <span className="absolute left-1.5 top-1.5 z-10 inline-flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-1 text-[11px] font-semibold text-white shadow-sm" aria-label={`${rating.toFixed(1)} de 5 estrelas`}><Star className="h-3 w-3 fill-white text-white" />{rating.toFixed(1).replace(".", ",")}</span>;
}
