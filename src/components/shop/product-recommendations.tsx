import { Link } from "@tanstack/react-router";
import { Ticket } from "lucide-react";
import { brl, discountPct } from "@/lib/catalog";
import { recommendedProducts } from "@/lib/recommendations";

export function ProductRecommendations({ productId }: { productId: string }) {
  return (
    <section aria-label="Você também pode gostar" className="border-t-8 border-surface bg-surface px-4 py-5">
      <h2 className="mb-4 text-[19px] font-extrabold">Você também pode gostar</h2>
      <div className="grid grid-cols-2 gap-3">
        {recommendedProducts(productId).map((product) => (
          <Link key={product.id} to="/produto/$id" params={{ id: product.id }} preload="intent" className="flex min-w-0 flex-col rounded-lg bg-card p-2.5 text-card-foreground focus-visible:outline-2 focus-visible:outline-ring">
            <div className="relative">
              <img src={product.image} alt={product.title} loading="lazy" decoding="async" width={600} height={600} className="aspect-square w-full object-contain" />
              {/natal/i.test(product.category) && <span className="absolute right-1 top-1 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-extrabold text-primary-foreground">25.12</span>}
            </div>
            <h3 className="mt-1.5 line-clamp-2 min-h-10 text-[14px] leading-snug">{product.cardTitle}</h3>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              <span className="whitespace-nowrap text-[19px] font-bold">{brl(product.price)}</span>
              <span className="text-[11px] text-muted-foreground line-through">{brl(product.original)}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="flex items-center gap-0.5 font-bold text-primary"><Ticket className="h-3 w-3" />{discountPct(product.price, product.original)}% OFF</span>
              <span className="rounded bg-teal-soft px-1 font-semibold text-teal-ink">Frete grátis</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}