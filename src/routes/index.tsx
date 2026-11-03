import { createFileRoute, Link } from "@tanstack/react-router";
import { Share2, Ticket, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { TopBar, SiteFooter, Verified } from "@/components/shop/chrome";
import { products, store, brl, discountPct } from "@/lib/catalog";
import { useCheckout } from "@/lib/checkout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${store.brandName} · Produtos da loja` },
      { name: "description", content: "Variedade para o seu dia a dia: casa, utilidades e eletrônicos com frete grátis e pagamento via PIX." },
      { property: "og:title", content: `${store.brandName} · Produtos da loja` },
      { property: "og:description", content: "Casa, utilidades e eletrônicos com frete grátis e pagamento via PIX." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StorePage,
});

function StorePage() {
  const [following, setFollowing] = useState(false);
  const { state, update } = useCheckout();
  const normalizedQuery = state.searchTerm.trim().toLocaleLowerCase("pt-BR");
  const visibleProducts = products.filter((product) =>
    [product.title, product.cardTitle, product.category]
      .some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedQuery)),
  );
  return (
    <div className="app-frame bg-surface">
      <TopBar />
      <div className="relative h-[116px] overflow-hidden bg-ink">
        <img src="/banner%20loja.png" alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
      </div>
      <section className="relative mx-3.5 -mt-[34px] rounded-2xl bg-card p-4 shadow-[0_2px_12px_oklch(0_0_0/0.08)]">
        <div className="flex items-start gap-3">
          <img src={store.logo} alt={store.brandName} className="h-[58px] w-[58px] shrink-0 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-1.5 text-[20px] font-extrabold leading-tight">
              <span className="truncate">{store.name}</span> <Verified />
            </h1>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-[14px] text-muted-foreground">{store.followers}</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setFollowing(!following)}
                  className={`h-10 rounded-lg px-5 text-[15px] font-bold ${following ? "bg-secondary text-foreground" : "bg-link text-primary-foreground"}`}
                >
                  {following ? "Seguindo" : "Seguir"}
                </button>
                <button aria-label="Compartilhar" className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-link">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <hr className="my-3 border-t-2" />
        <p className="text-[14px] leading-snug text-muted-foreground">{store.bio}</p>
      </section>

      <div className="flex items-baseline justify-between px-3.5 pb-3 pt-7">
        <h2 className="text-[21px] font-extrabold">Produtos da loja</h2>
        <span className="text-[14px] text-muted-foreground">
          {visibleProducts.length} {visibleProducts.length === 1 ? "produto" : "produtos"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 px-3.5 pb-9">
        {visibleProducts.map((p) => (
          <Link key={p.id} to="/produto/$id" params={{ id: p.id }} className="flex flex-col rounded-lg bg-card p-2.5 pb-4">
            <img src={p.image} alt={p.title} className="aspect-square w-full object-contain" />
            <h3 className="mt-3 line-clamp-2 text-[15px] leading-snug">{p.cardTitle}</h3>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-[21px] font-bold"><span className="text-[14px]">R$ </span>{brl(p.price).slice(3)}</span>
              <span className="text-[12px] text-muted-foreground line-through">{brl(p.original)}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12.5px]">
              <span className="flex items-center gap-0.5 font-bold text-primary"><Ticket className="h-3 w-3" />{discountPct(p.price, p.original)}% OFF</span>
              <span className="rounded bg-teal-soft px-1 font-semibold text-teal-ink">Frete grátis</span>
            </div>
            <ShoppingCart className="mx-auto mt-3 h-5 w-5" />
          </Link>
        ))}
        {visibleProducts.length === 0 && (
          <div className="col-span-2 rounded-xl border border-dashed border-border bg-card px-5 py-10 text-center">
            <h3 className="text-[16px] font-bold">Nenhum produto encontrado</h3>
            <p className="mt-2 text-[14px] text-muted-foreground">
              Tente buscar por outro nome ou categoria.
            </p>
            <button
              type="button"
              onClick={() => {
                // The shared search field is controlled by the checkout context.
                update({ searchTerm: "" });
              }}
              className="mt-4 text-[14px] font-semibold text-primary"
            >
              Limpar busca
            </button>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
