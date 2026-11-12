import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/shop/product-presentation";
import { recommendedProducts } from "@/lib/recommendations";
import { useCheckout } from "@/lib/checkout";

export function ProductRecommendations({ productId }: { productId: string }) {
  const { state } = useCheckout();
  const cartProductIds = state.cart.map((item) => item.productId);
  const cartKey = cartProductIds.slice().sort().join("|");
  const recommendations = useMemo(
    () => recommendedProducts(productId, cartKey ? cartKey.split("|") : []),
    [productId, cartKey],
  );
  const [visibleCount, setVisibleCount] = useState(6);
  const visibleRecommendations = recommendations.slice(0, visibleCount);

  return (
    <section aria-label="Você também pode gostar" className="border-t-8 border-surface bg-surface px-4 py-5">
      <h2 className="mb-4 text-[19px] font-extrabold">Você também pode gostar</h2>
      <div className="grid grid-cols-2 gap-3">
        {visibleRecommendations.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
      {visibleCount < recommendations.length && (
        <button
          type="button"
          onClick={() => setVisibleCount((count) => Math.min(count + 6, recommendations.length))}
          className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-[14px] font-bold"
        >
          Ver mais recomendações <ChevronDown className="h-4 w-4" />
        </button>
      )}
    </section>
  );
}
