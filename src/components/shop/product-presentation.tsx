import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { brl, discountPct, type Product } from "@/lib/catalog";
import { activeFlashDeadline } from "@/lib/flash-offers";

export function FlashIcon({ className = "h-4 w-4" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor"><path d="M10.5 2.5h9L14 10h5.3L5.6 22l3.3-10H4.5z" /></svg>;
}

function DiscountIcon() {
  return <svg viewBox="0 0 20 16" className="h-3 w-3 shrink-0" aria-hidden="true" fill="currentColor"><path d="M2 1h16v4a3 3 0 0 0 0 6v4H2v-4a3 3 0 0 0 0-6V1z" /><path d="M10 2v12" stroke="var(--primary-soft)" strokeWidth="1.5" strokeDasharray="2 2" /></svg>;
}

function useFlashDeadline(product: Product) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    if (!product.flashOffer) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [product.flashOffer?.endsAt]);
  return { now, deadline: now === null ? null : activeFlashDeadline(product, now) };
}

export function FlashOfferBadge({ product, className = "" }: { product: Product; className?: string }) {
  const { now, deadline } = useFlashDeadline(product);
  if (now === null || deadline === null) return null;
  const seconds = Math.max(0, Math.floor((deadline - now) / 1000));
  const hms = [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), seconds % 60].map(n => String(n).padStart(2, "0")).join(":");
  return <div className={`flash-offer-badge ${className}`} aria-label={`Oferta Relâmpago, termina em ${hms}`}>
    <span className="flash-offer-label"><FlashIcon />Oferta Relâmpago</span>
    <span className="flash-offer-time tabular-nums">{hms}</span>
  </div>;
}

export function ProductBadges({ product }: { product: Product }) {
  const { deadline } = useFlashDeadline(product);
  return <div className="mt-1.5">
    {deadline !== null ? <FlashOfferBadge product={product} /> : <span className="inline-flex items-center gap-1 rounded-sm bg-primary-soft px-1.5 py-0.5 text-[11px] font-bold text-primary"><DiscountIcon />{discountPct(product.price, product.original)}% OFF</span>}
    <span className="mt-1 inline-block rounded-sm bg-teal-soft px-1.5 py-0.5 text-[11px] font-semibold text-teal-ink">Frete grátis</span>
  </div>;
}

export function ProductMetrics({ product }: { product: Product }) {
  if (product.rating === null && product.sold === null && product.reviews === null) return null;
  return <div className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[11px] leading-snug text-muted-foreground">
    {product.rating !== null && <><Star className="h-3.5 w-3.5 shrink-0 fill-gold text-gold" /><span>{product.rating.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}</span></>}
    {product.reviews !== null && <span>({product.reviews.toLocaleString("pt-BR")})</span>}
    {product.sold !== null && <><span aria-hidden="true">|</span><span>{product.sold} vendidos</span></>}
  </div>;
}

export function ProductCard({ product, className = "", children, recommendation = false }: { product: Product; className?: string; children?: ReactNode; recommendation?: boolean }) {
  return <article data-product-card={product.id} className={`relative flex min-w-0 flex-col rounded-lg bg-card p-2.5 pb-3 ${className}`}>
    <Link to="/produto/$id" params={{ id: product.id }} preload="intent" className="block focus-visible:outline-2 focus-visible:outline-ring">
      <div className="relative"><img src={product.image} alt={product.title} loading="lazy" decoding="async" width={600} height={600} className="aspect-square w-full object-contain" />{/natal/i.test(product.category) && <span className="absolute right-1 top-1 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-extrabold text-primary-foreground">25.12</span>}</div>
      <h3 className="mt-1.5 line-clamp-2 min-h-10 text-[14px] leading-snug">{product.cardTitle}</h3>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
        <span className="whitespace-nowrap text-[19px] font-bold text-primary">{recommendation ? brl(product.price) : <><span className="text-[13px]">R$ </span>{brl(product.price).slice(3)}</>}</span>
        <span className="text-[11px] text-muted-foreground line-through">{brl(product.original)}</span>
      </div>
      <ProductBadges product={product} />
      <ProductMetrics product={product} />
    </Link>
    {children}
  </article>;
}

export function ReviewMediaRating({ rating }: { rating: number }) {
  if (rating <= 0) return null;
  return <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-sm bg-ink/60 px-1.5 py-0.5 text-[12px] font-semibold text-ink-foreground" aria-label={`${rating} estrelas`}><Star className="h-3 w-3 fill-current" />{rating.toLocaleString("pt-BR")}</span>;
}