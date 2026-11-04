import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Share2, Ticket, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { TopBar, SiteFooter, Verified, Sheet } from "@/components/shop/chrome";
import { products, store, brl, discountPct, type Product, type Variant } from "@/lib/catalog";
import { useCheckout, addToCart } from "@/lib/checkout";

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
  const { state, update } = useCheckout();
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [quickProduct, setQuickProduct] = useState<Product | null>(null);
  const [quickVariant, setQuickVariant] = useState<string | null>(null);
  const shelfRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const following = state.following;
  const normalizedQuery = state.searchTerm.trim().toLocaleLowerCase("pt-BR");
  const searchedProducts = products.filter((product) =>
    [product.title, product.cardTitle, product.category]
      .some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedQuery)),
  );
  const categoryFilters: { label: string; match: (p: Product) => boolean }[] = [
    { label: "Todos", match: () => true },
    { label: "Natal", match: (p) => p.category.toLocaleLowerCase("pt-BR").includes("natal") },
    { label: "Casa & Utilidades", match: (p) => /cama|mesa|banho|toalha|casa|utilidade/i.test(p.category) },
    { label: "Eletrônicos", match: (p) => /eletr/i.test(p.category) },
    { label: "Moda", match: (p) => /moda|roupa|calçado|acessório/i.test(p.category) },
    { label: "Recomendados", match: () => true },
  ];
  const visibleProducts = searchedProducts.filter(categoryFilters.find((c) => c.label === activeCategory)?.match ?? (() => true));
  const selectedVariant = quickProduct?.variants.find((v) => v.id === quickVariant) ?? null;
  function addQuickToCart(product: Product, variant: Variant | null = null) {
    update({ cart: addToCart(state.cart, product.id, variant?.id ?? null, 1) });
    window.dispatchEvent(new CustomEvent("shop-cart-flight", { detail: { image: variant?.image ?? product.image, source: document.querySelector(`[data-cart-product="${product.id}"]`)?.getBoundingClientRect().toJSON() } }));
    setQuickProduct(null); setQuickVariant(null);
  }
  const updateShelfEdges = () => {
    const el = shelfRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  useEffect(() => { const frame = requestAnimationFrame(updateShelfEdges); return () => cancelAnimationFrame(frame); }, [activeCategory, visibleProducts.length]);

  return (
    <div className="app-frame bg-surface">
      <TopBar />
      <div className="relative h-[116px] overflow-hidden bg-ink">
        <img src="/banner%20loja.png" alt="" loading="eager" fetchPriority="high" decoding="async" width={1200} height={240} className="absolute inset-0 h-full w-full object-cover object-center" />
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
                  onClick={() => update({ following: !following })}
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

      <div className="px-3.5 pt-7">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[21px] font-extrabold">Produtos da loja</h2>
          <button type="button" onClick={() => setActiveCategory("Todos")} className="shrink-0 text-[14px] font-bold text-primary">Ver todos</button>
        </div>
        <div className="-mx-3.5 mb-4 flex gap-6 overflow-x-auto border-b border-border px-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categoryFilters.map((tab) => (
            <button key={tab.label} type="button" onClick={() => setActiveCategory(tab.label)} className={"relative min-h-11 shrink-0 whitespace-nowrap text-[14px] font-semibold " + (activeCategory === tab.label ? "text-foreground" : "text-muted-foreground")}>
              {tab.label}{activeCategory === tab.label && <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-primary" />}
            </button>
          ))}
        </div>        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-primary" />
            <h3 className="text-[17px] font-extrabold">{activeCategory === "Natal" ? "Especial de Natal" : activeCategory === "Recomendados" ? "Recomendados para você" : "Todos os produtos"}</h3>
          </div>
          <span className="text-[12px] text-muted-foreground">{visibleProducts.length} {visibleProducts.length === 1 ? "produto" : "produtos"}</span>
        </div>
      </div>
      <div className="relative pb-9">
        {canScrollLeft && <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-7 bg-gradient-to-r from-surface to-transparent" />}
        {canScrollRight && visibleProducts.length > 1 && <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-8 bg-gradient-to-l from-surface to-transparent" />}
        <div ref={shelfRef} onScroll={updateShelfEdges} className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-3.5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visibleProducts.map((p) => (
            <div key={p.id} className="relative flex w-[min(44vw,190px)] shrink-0 snap-start flex-col rounded-lg bg-card p-2.5 pb-3">
              <Link to="/produto/$id" params={{ id: p.id }}>
                <div className="relative"><img src={p.image} alt={p.title} loading="lazy" decoding="async" width={600} height={600} className="aspect-square w-full object-contain" />{activeCategory === "Natal" && <span className="absolute right-1 top-1 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-extrabold text-primary-foreground">25.12</span>}</div>
                {(p.rating != null || p.sold) && <div className="mt-2 flex items-center gap-1 text-[11px]">{p.rating != null && <><span className="relative text-muted-foreground">★★★★★<span className="absolute inset-y-0 left-0 overflow-hidden text-amber-500" style={{ width: ((p.rating / 5) * 100) + "%" }}>★★★★★</span></span><b>{p.rating.toFixed(1)}</b></>}{p.sold && <span className="text-muted-foreground">{p.sold} vendidos</span>}</div>}
                <h3 className="mt-1.5 line-clamp-2 text-[14px] leading-snug">{p.cardTitle}</h3>
              </Link>
              <div className="mt-3 flex items-baseline gap-1.5"><span className="text-[19px] font-bold"><span className="text-[13px]">R$ </span>{brl(p.price).slice(3)}</span><span className="text-[11px] text-muted-foreground line-through">{brl(p.original)}</span></div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]"><span className="flex items-center gap-0.5 font-bold text-primary"><Ticket className="h-3 w-3" />{discountPct(p.price, p.original)}% OFF</span><span className="rounded bg-teal-soft px-1 font-semibold text-teal-ink">Frete grátis</span></div>
              <button type="button" aria-label={"Adicionar " + p.title + " ao carrinho"} onClick={() => { if (p.variants.length) { setQuickProduct(p); setQuickVariant(null); } else addQuickToCart(p); }} className="mx-auto mt-2 grid h-9 w-10 place-items-center rounded-full bg-primary-soft text-primary active:scale-90"><ShoppingCart className="h-5 w-5" /></button>
            </div>
          ))}
          {visibleProducts.length === 0 && (
            <div className="w-full rounded-xl border border-dashed border-border bg-card px-5 py-9 text-center">
              <h3 className="text-[16px] font-bold">{activeCategory === "Natal" ? "Novidades de Natal em breve" : "Nenhum produto encontrado"}</h3>
              <p className="mt-2 text-[13px] text-muted-foreground">{activeCategory === "Natal" ? "Ainda não há produtos cadastrados nesta coleção." : "Tente buscar por outro nome ou categoria."}</p>
              <button type="button" onClick={() => { setActiveCategory("Todos"); update({ searchTerm: "" }); }} className="mt-4 text-[14px] font-semibold text-primary">Ver todos os produtos</button>
            </div>
          )}
        </div>
        {visibleProducts.length > 1 && (
          <div className="mt-2 flex justify-end gap-2 px-3.5">
            <button type="button" aria-label="Produtos anteriores" disabled={!canScrollLeft} onClick={() => shelfRef.current?.scrollBy({left:-220,behavior:"smooth"})} className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            <button type="button" aria-label="Próximos produtos" disabled={!canScrollRight} onClick={() => shelfRef.current?.scrollBy({left:220,behavior:"smooth"})} className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
          </div>
        )}
      </div>
      {["Mais vendidos", "Novidades"].map((title) => (
        <div key={title} className="px-3.5 pb-9">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-primary" />
            <h3 className="text-[17px] font-extrabold">{title}</h3>
          </div>
          <div className="rounded-xl border border-dashed border-border bg-card px-5 py-8 text-center">
            <p className="text-[14px] font-bold">Em breve</p>
            <p className="mt-1 text-[13px] text-muted-foreground">Novos produtos chegando nesta seção.</p>
          </div>
        </div>
      ))}
      <SiteFooter />
      {quickProduct && <Sheet title="Escolha sua opção" onClose={() => { setQuickProduct(null); setQuickVariant(null); }}>
        <div className="py-3"><div className="flex items-center gap-3"><img src={selectedVariant?.image ?? quickProduct.image} alt="" className="h-20 w-20 rounded-xl object-contain" /><div><p className="text-[14px] font-semibold">{quickProduct.title}</p><p className="mt-1 text-[17px] font-extrabold text-primary">{brl(selectedVariant?.price ?? quickProduct.price)}</p></div></div>
        <p className="mb-2 mt-4 text-[14px] font-bold">Modelo e cor</p><div className="space-y-2">{quickProduct.variants.map((v) => <button key={v.id} type="button" onClick={() => setQuickVariant(v.id)} className={"flex w-full items-center gap-3 rounded-xl border-2 p-2 text-left " + (quickVariant === v.id ? "border-primary bg-primary/5" : "border-border")}><img src={v.image} alt="" className="h-14 w-14 rounded-lg object-cover" /><span className="min-w-0 flex-1 text-[13px] font-semibold">{v.line} · {v.color}</span><b className="text-[13px]">{brl(v.price)}</b></button>)}</div>
        <button type="button" disabled={!selectedVariant} onClick={() => addQuickToCart(quickProduct, selectedVariant)} className="mt-4 h-12 w-full rounded-full bg-primary text-[15px] font-extrabold text-primary-foreground disabled:opacity-40">Adicionar ao carrinho</button></div>
      </Sheet>}
    </div>
  );
}
