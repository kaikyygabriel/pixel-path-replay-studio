import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/shop/product-presentation";
import { TopBar, SiteFooter, Verified, Sheet } from "@/components/shop/chrome";
import { products, store, brl, type Product, type Variant } from "@/lib/catalog";
import { useCheckout, addToCart } from "@/lib/checkout";

const salesCount = (value: string | null) => {
  if (!value) return 0;
  const normalized = value.toLowerCase().replace(/\s/g, "");
  const inThousands = normalized.includes("mil");
  const numeric = normalized.replace(/[^0-9.,]/g, "");
  const amount = Number.parseFloat(inThousands ? numeric.replace(",", ".") : numeric.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(amount) ? amount * (inThousands ? 1000 : 1) : 0;
};
const hasCategory = (product: Product, category: string) => product.category.split("·").some((item) => item.trim().toLocaleLowerCase("pt-BR") === category.toLocaleLowerCase("pt-BR"));

const getOptionKind = (variants: Variant[]) => {
  if (variants.length && variants.every((v) => /^(127|220)\s?V$/i.test(v.color.trim()))) return "voltage";
  const colorPattern = /branco|preto|azul|vermelho|verde|amarelo|rosa|roxo|lil[aá]s|cinza|bege|marrom|dourado|prata|cobre|transparente|inox|creme|off.?white|grafite|turquesa|colorido/i;
  if (variants.length && variants.every((v) => colorPattern.test(v.color))) return "color";
  return "model";
};

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
  const [catalogView, setCatalogView] = useState<"home" | "all" | "category">("home");
  const [quickProduct, setQuickProduct] = useState<Product | null>(null);
  const [quickVariant, setQuickVariant] = useState<string | null>(null);
  const [quickVoltage, setQuickVoltage] = useState<string | null>(null);
  const [quickColor, setQuickColor] = useState<string | null>(null);
  const shelfRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const shelfFrame = useRef<number | null>(null);
  const following = state.following;
  const openCatalogView = (category: string, view: "all" | "category") => {
    setActiveCategory(category);
    setCatalogView(view);
    // Leva a vitrine de volta ao cabeçalho antes de apresentar a grade completa.
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const normalizedQuery = state.searchTerm.trim().toLocaleLowerCase("pt-BR");
  const searchedProducts = products.filter((product) =>
    [product.title, product.cardTitle, product.category]
      .some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedQuery)),
  );
  const categoryFilters: { label: string; match: (p: Product) => boolean }[] = [
    { label: "Todos", match: () => true },
    { label: "Natal", match: (p) => hasCategory(p, "Natal") },
    { label: "Casa & Utilidades", match: (p) => hasCategory(p, "Casa & Utilidades") },
    { label: "Cozinha", match: (p) => hasCategory(p, "Cozinha") },
    { label: "Cama, Mesa e Banho", match: (p) => hasCategory(p, "Cama, Mesa e Banho") },
    { label: "Eletroportáteis", match: (p) => hasCategory(p, "Eletroportáteis") },
    { label: "Climatização", match: (p) => hasCategory(p, "Climatização") },
    { label: "Eletrônicos", match: (p) => hasCategory(p, "Eletrônicos") },
    { label: "Brinquedos", match: (p) => hasCategory(p, "Brinquedos") },
    { label: "Games", match: (p) => hasCategory(p, "Games") },
    { label: "Decoração", match: (p) => hasCategory(p, "Decoração") },
    { label: "Limpeza", match: (p) => hasCategory(p, "Limpeza") },
    { label: "Bebidas", match: (p) => hasCategory(p, "Bebidas") },
    { label: "Presentes", match: (p) => hasCategory(p, "Presentes") },
    { label: "Recomendados", match: (p) => hasCategory(p, "Recomendados") },
  ];
  const visibleProducts = searchedProducts.filter(categoryFilters.find((c) => c.label === activeCategory)?.match ?? (() => true)).sort((a, b) => salesCount(b.sold) - salesCount(a.sold));
  const isMondialBlender = quickProduct?.id === "liquidificador-mondial-l99-fb";
  const quickColorVariants = isMondialBlender ? quickProduct!.variants.filter((v, i, all) => all.findIndex((item) => item.color === v.color) === i) : [];
  const selectedVariant = quickProduct ? (isMondialBlender ? quickProduct.variants.find((v) => v.line === quickVoltage && v.color === quickColor) ?? null : quickProduct.variants.find((v) => v.id === quickVariant) ?? null) : null;
  function addQuickToCart(product: Product, variant: Variant | null = null) {
    update({ cart: addToCart(state.cart, product.id, variant?.id ?? null, 1) });
    window.dispatchEvent(new CustomEvent("shop-cart-added", { detail: { productId: product.id } }));
    window.dispatchEvent(new CustomEvent("shop-cart-flight", { detail: { image: variant?.image ?? product.image, source: document.querySelector(`[data-cart-product="${product.id}"]`)?.getBoundingClientRect().toJSON() } }));
    setQuickProduct(null); setQuickVariant(null); setQuickVoltage(null); setQuickColor(null);
  }
  const updateShelfEdges = () => {
    if (shelfFrame.current !== null) return;
    shelfFrame.current = requestAnimationFrame(() => {
      shelfFrame.current = null;
      const el = shelfRef.current;
      if (!el) return;
      const left = el.scrollLeft > 4;
      const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
      setCanScrollLeft((current) => current === left ? current : left);
      setCanScrollRight((current) => current === right ? current : right);
    });
  };
  useEffect(() => {
    const el = shelfRef.current;
    if (el) el.scrollLeft = 0;
    updateShelfEdges();
    return () => { if (shelfFrame.current !== null) cancelAnimationFrame(shelfFrame.current); shelfFrame.current = null; };
  }, [activeCategory, visibleProducts.length, catalogView]);

  return (
    <div className="app-frame bg-surface page-enter">
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
        <div className="mt-3 flex w-full min-w-0 flex-nowrap items-center justify-between gap-1.5 text-[clamp(10px,2.8vw,12px)] leading-tight text-muted-foreground">
          <p className="whitespace-nowrap"><span className="font-semibold text-foreground">100%</span> responde em 24 horas</p>
          <p className="whitespace-nowrap text-right"><span className="font-semibold text-foreground">99%</span> envios pontuais</p>
        </div>
      </section>

      <div className="px-3.5 pt-7">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[21px] font-extrabold">Produtos da loja</h2>
          {catalogView === "home" ? (
            <button type="button" onClick={() => openCatalogView(activeCategory, "all")} className="shrink-0 text-[14px] font-bold leading-none text-[#FE2C55] active:opacity-70">Ver todos</button>
          ) : (
            <button type="button" onClick={() => setCatalogView("home")} className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-[#FE2C55]"><ChevronLeft className="h-4 w-4" />Voltar à vitrine</button>
          )}
        </div>
        <div data-shelf className="-mx-3.5 mb-4 flex gap-6 overflow-x-auto border-b border-border px-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categoryFilters.map((tab) => (
            <button key={tab.label} type="button" onClick={() => { setActiveCategory(tab.label); setCatalogView("category"); }} className={"relative min-h-11 shrink-0 whitespace-nowrap text-[14px] font-semibold " + (activeCategory === tab.label ? "text-foreground" : "text-muted-foreground")}>
              {tab.label}{activeCategory === tab.label && <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-primary" />}
            </button>
          ))}
        </div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-primary" />
            <h3 className="text-[17px] font-extrabold">{catalogView === "all" ? (activeCategory === "Todos" ? "Todos os produtos" : activeCategory) : activeCategory === "Natal" ? "Especial de Natal" : activeCategory === "Recomendados" ? "Recomendados para você" : activeCategory === "Todos" ? "Todos os produtos" : activeCategory}</h3>
          </div>
          <span className="text-[12px] text-muted-foreground">{visibleProducts.length} {visibleProducts.length === 1 ? "produto" : "produtos"}</span>
        </div>
      </div>
      <div key={`${catalogView}-${activeCategory}`} className={catalogView === "home" ? "relative pb-9" : "catalog-grid-enter px-3.5 pb-9"}>
        {catalogView === "home" && canScrollLeft && <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-7 bg-gradient-to-r from-surface to-transparent" />}
        {catalogView === "home" && canScrollRight && visibleProducts.length > 1 && <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-8 bg-gradient-to-l from-surface to-transparent" />}
        <div data-shelf ref={shelfRef} onScroll={updateShelfEdges} className={catalogView === "home" ? "flex snap-x snap-mandatory gap-3 overflow-x-auto pr-3.5 pb-2 pl-0 [scroll-padding-left:14px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" : "grid grid-cols-2 items-start gap-3"}>
          {visibleProducts.map((p, index) => (
            <ProductCard key={p.id} product={p} className={catalogView === "home" ? `w-[min(44vw,190px)] shrink-0 snap-start ${index === 0 ? "ml-3.5" : ""}` : "w-full"} />
          ))}
          {visibleProducts.length === 0 && (
            <div className="w-full rounded-xl border border-dashed border-border bg-card px-5 py-9 text-center">
              <h3 className="text-[16px] font-bold">{activeCategory === "Natal" ? "Novidades de Natal em breve" : "Nenhum produto encontrado"}</h3>
              <p className="mt-2 text-[13px] text-muted-foreground">{activeCategory === "Natal" ? "Ainda não há produtos cadastrados nesta coleção." : "Tente buscar por outro nome ou categoria."}</p>
              <button type="button" onClick={() => { setActiveCategory("Todos"); setCatalogView("home"); update({ searchTerm: "" }); }} className="mt-4 text-[14px] font-semibold text-primary">Ver todos os produtos</button>
            </div>
          )}
        </div>
        {catalogView === "home" && visibleProducts.length > 1 && (
          <div className="mt-2 flex justify-end gap-2 px-3.5">
            <button type="button" aria-label="Produtos anteriores" disabled={!canScrollLeft} onClick={() => shelfRef.current?.scrollBy({left:-220,behavior:"smooth"})} className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            <button type="button" aria-label="Próximos produtos" disabled={!canScrollRight} onClick={() => shelfRef.current?.scrollBy({left:220,behavior:"smooth"})} className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
          </div>
        )}
      </div>
      {catalogView === "home" && activeCategory === "Todos" && (
        <>
          <div className="px-3.5 pb-9">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-primary" />
              <h3 className="text-[17px] font-extrabold">Especial <span className="text-[#FE2C55]">25.12</span></h3>
            </div>
            <div className="relative"><div data-shelf className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-0 pb-2 pr-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {products.filter((p) => hasCategory(p, "Natal")).sort((a, b) => salesCount(b.sold) - salesCount(a.sold)).map((p) => (
                <ProductCard key={p.id} product={p} className="w-[min(44vw,190px)] shrink-0 snap-start" />
              ))}
              <button type="button" onClick={() => openCatalogView("Natal", "category")} className="flex min-h-[190px] w-[min(28vw,112px)] shrink-0 snap-start flex-col items-center justify-center gap-2 px-1 text-center text-[#FE2C55] transition-opacity active:opacity-60">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-[#FE2C55]/20 bg-[#FE2C55]/15 text-[#FE2C55]"><ChevronRight className="h-5 w-5" /></span>
                <span className="text-[14px] font-bold text-[#FE2C55]">Ver todos</span>
                <span className="text-[11px] text-muted-foreground">Produtos de Natal</span>
              </button>
            </div><div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-surface to-transparent" />
          </div>
          <div className="px-3.5 pb-9">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-primary" />
              <h3 className="text-[17px] font-extrabold">Mais vendidos</h3>
            </div>
            <div className="relative"><div data-shelf className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pr-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {products.filter((p) => hasCategory(p, "Mais vendidos")).sort((a, b) => salesCount(b.sold) - salesCount(a.sold)).map((p) => (
                <ProductCard key={p.id} product={p} className="w-[min(44vw,190px)] shrink-0 snap-start" />
              ))}
              <button type="button" onClick={() => openCatalogView("Todos", "all")} className="flex min-h-[190px] w-[min(28vw,112px)] shrink-0 snap-start flex-col items-center justify-center gap-2 px-1 text-center text-[#FE2C55] transition-opacity active:opacity-60">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-[#FE2C55]/20 bg-[#FE2C55]/15 text-[#FE2C55]"><ChevronRight className="h-5 w-5" /></span>
                <span className="text-[14px] font-bold text-[#FE2C55]">Ver todos</span>
                <span className="text-[11px] text-muted-foreground">Todos os produtos</span>
              </button>
            </div><div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-surface to-transparent" />
          </div>
        </>
      )}
      <SiteFooter />
      {quickProduct && <Sheet title={isMondialBlender ? "Escolha a voltagem e a cor" : getOptionKind(quickProduct.variants) === "voltage" ? "Escolha a voltagem" : getOptionKind(quickProduct.variants) === "color" ? "Escolha o modelo e a cor" : "Escolha sua opção"} onClose={() => { setQuickProduct(null); setQuickVariant(null); setQuickVoltage(null); setQuickColor(null); }}>
        <div className="py-3">
          <div className="flex items-center gap-3">
            <img src={selectedVariant?.image ?? quickProduct.image} alt="" className="h-20 w-20 rounded-xl object-contain" />
            <div><p className="text-[14px] font-semibold">{quickProduct.title}</p><p className="mt-1 text-[17px] font-extrabold text-primary">{brl(selectedVariant?.price ?? quickProduct.price)}</p></div>
          </div>
          {isMondialBlender ? (
            <div className="mt-4 space-y-4">
              <div><div className="mb-2 text-[13px] font-bold">1. Escolha a voltagem</div><div className="flex gap-2">{["127V", "220V"].map((voltage) => <button key={voltage} type="button" onClick={() => setQuickVoltage(voltage)} aria-pressed={quickVoltage === voltage} className={"inline-flex h-9 min-w-[78px] items-center justify-center gap-2 rounded-lg border px-3 text-[12px] font-bold " + (quickVoltage === voltage ? "border-primary bg-primary/5 text-primary" : "border-border bg-card")}>{voltage}{quickVoltage === voltage && <span aria-hidden="true">✓</span>}</button>)}</div></div>
              <div><div className="mb-2 text-[13px] font-bold">2. Escolha a cor</div><div className="space-y-2">{quickColorVariants.map((v) => <button key={v.color} type="button" onClick={() => setQuickColor(v.color)} aria-pressed={quickColor === v.color} className={"flex w-full min-w-0 items-center gap-3 rounded-xl border p-2.5 text-left " + (quickColor === v.color ? "border-primary bg-primary/5" : "border-border bg-card")}><img src={v.image} alt={v.color} loading="lazy" decoding="async" width={56} height={56} className="h-14 w-14 shrink-0 rounded-lg bg-surface object-contain" /><span className="min-w-0 flex-1"><span className="block text-[13px] font-bold">{v.color}</span><span className="mt-0.5 block text-[11px] text-muted-foreground">Turbo Power L-99 FB · 550W</span><span className="mt-1 block text-[12px] font-extrabold">{brl(v.price)}</span></span>{quickColor === v.color && <span className="shrink-0 font-bold text-primary">✓</span>}</button>)}</div></div>
            </div>
          ) : getOptionKind(quickProduct.variants) === "voltage" ? (
            <div className="mt-4 flex flex-wrap justify-start gap-2">
              {quickProduct.variants.map((v) => <button key={v.id} type="button" onClick={() => setQuickVariant(v.id)} aria-pressed={quickVariant === v.id} className={"inline-flex h-9 min-w-[76px] items-center justify-center gap-2 rounded-lg border px-3 text-[13px] font-bold " + (quickVariant === v.id ? "border-primary bg-primary/5 text-primary" : "border-border bg-card")}>{v.color}{quickVariant === v.id && <span aria-hidden="true">✓</span>}</button>)}
            </div>
          ) : getOptionKind(quickProduct.variants) === "color" ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {quickProduct.variants.map((v) => <button key={v.id} type="button" onClick={() => setQuickVariant(v.id)} aria-pressed={quickVariant === v.id} className={"flex min-w-0 items-center gap-2 rounded-xl border p-2 text-left transition-colors " + (quickVariant === v.id ? "border-primary bg-primary/5" : "border-border bg-card")}>
                <img src={v.image} alt="" loading="lazy" decoding="async" width={48} height={48} className="h-12 w-12 shrink-0 rounded-lg bg-surface object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11.5px] font-bold">{v.line}</span>
                  <span className="mt-0.5 block line-clamp-2 text-[11px] leading-tight text-muted-foreground">{v.color}</span>
                  <span className="mt-1 block text-[12px] font-extrabold">{brl(v.price)}</span>
                </span>
                {quickVariant === v.id && <span aria-hidden="true" className="shrink-0 text-primary">✓</span>}
              </button>)}
            </div>
          ) : (
            <div className="mt-4 space-y-2">{quickProduct.variants.map((v) => <button key={v.id} type="button" onClick={() => setQuickVariant(v.id)} className={"flex w-full items-center gap-3 rounded-xl border-2 p-2 text-left " + (quickVariant === v.id ? "border-primary bg-primary/5" : "border-border")}><img src={v.image} alt="" className="h-14 w-14 rounded-lg object-cover" /><span className="min-w-0 flex-1 text-[13px] font-semibold">{v.line} · {v.color}</span><b className="text-[13px]">{brl(v.price)}</b></button>)}</div>
          )}
          <button type="button" disabled={!selectedVariant} onClick={() => addQuickToCart(quickProduct, selectedVariant)} className="mt-4 h-12 w-full rounded-full bg-primary text-[15px] font-extrabold text-primary-foreground disabled:opacity-40">Adicionar ao carrinho</button>
        </div>
      </Sheet>}
    </div>
  );
}
