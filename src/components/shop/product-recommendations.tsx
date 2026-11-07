import { ProductCard } from "@/components/shop/product-presentation";
import { recommendedProducts } from "@/lib/recommendations";

export function ProductRecommendations({ productId }: { productId: string }) {
  return (
    <section aria-label="Você também pode gostar" className="border-t-8 border-surface bg-surface px-4 py-5">
      <h2 className="mb-4 text-[19px] font-extrabold">Você também pode gostar</h2>
      <div className="grid grid-cols-2 gap-3">
        {recommendedProducts(productId).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
