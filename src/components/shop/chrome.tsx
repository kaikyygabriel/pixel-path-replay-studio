import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ChevronLeft, Search, User, Truck, Package, ShieldCheck, CreditCard, Lock, Headphones,
  Plus, Minus, Instagram, Facebook, Youtube, Mail, BadgeCheck, ShoppingBag,
  ShoppingCart, Bookmark, Store as StoreIcon, Scale, LogOut, X, Trash2,
} from "lucide-react";
import { store, getProduct, brl } from "@/lib/catalog";
import { useCheckout, setCartQty } from "@/lib/checkout";

export function Verified({ className = "h-4 w-4" }: { className?: string }) {
  return <BadgeCheck className={`${className} shrink-0 fill-link text-background`} />;
}

/** Store brand mark used where the reference shows the marketplace logo. */
export function BrandMark({ small }: { small?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <img src={store.logo} alt="" className={`${small ? "h-5 w-5" : "h-7 w-7"} shrink-0 rounded-md`} />
      <span className={`truncate font-bold leading-tight ${small ? "text-[11px]" : "text-[13px]"}`}>
        {store.brandName}
      </span>
    </span>
  );
}

export function TopBar({ back = false }: { back?: boolean }) {
  const router = useRouter();
  const navigate = useNavigate();
  const { state, update } = useCheckout();
  const [menu, setMenu] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menu) return;
    const h = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setMenu(false); };
    document.addEventListener("pointerdown", h);
    return () => document.removeEventListener("pointerdown", h);
  }, [menu]);
  const count = state.cart.reduce((n, i) => n + i.qty, 0);
  const items: { icon: typeof User; t: string; dot?: boolean; on: () => void }[] = [
    { icon: ShoppingBag, t: "Comprar", on: () => navigate({ to: "/" }) },
    { icon: ShoppingCart, t: "Meu carrinho", dot: count > 0, on: () => update({ cartOpen: true }) },
    { icon: Bookmark, t: "Favoritos", on: () => setInfo("Favoritos") },
    { icon: StoreIcon, t: "Vender", on: () => setInfo("Vender") },
    { icon: Headphones, t: "Atendimento", on: () => setInfo("Atendimento") },
    { icon: Scale, t: "Jurídico", on: () => setInfo("Jurídico") },
    { icon: LogOut, t: "Sair", on: () => { localStorage.removeItem("checkout-state-v2"); sessionStorage.clear(); update({ cart: [], favorites: [], following: false, customer: null, address: null, productId: null, variantId: null }); navigate({ to: "/" }); } },
  ];
  return (
    <>
      <header className={`sticky top-0 z-30 grid ${back ? "grid-cols-[auto_auto_minmax(0,1fr)_auto]" : "grid-cols-[auto_minmax(0,1fr)_auto]"} items-center gap-2 bg-background px-3 py-2`}>
        {back && (
          <button aria-label="Voltar" onClick={() => (window.history.length > 1 ? router.history.back() : navigate({ to: "/" }))} className="-ml-1 grid h-10 w-8 place-items-center">
            <ChevronLeft className="h-7 w-7" />
          </button>
        )}
        <Link to="/" aria-label="TikTok Shopping" className="flex h-10 w-[72px] shrink-0 items-center justify-center overflow-visible"><img src="/Design%20sem%20nome%20%2811%29.png" alt="TikTok Shopping" width={68} height={48} loading="eager" decoding="async" className="block h-12 w-[68px] max-w-none shrink-0 object-contain" /></Link>
        <label className="flex h-10 min-w-0 items-center gap-2 rounded-xl border-[1.5px] border-primary px-3">
          <Search className="h-5 w-5 shrink-0 text-primary" />
          <input
            aria-label="Buscar produtos"
            type="search"
            value={state.searchTerm}
            onChange={(event) => update({ searchTerm: event.target.value })}
            placeholder="Buscar produtos"
            className="w-full min-w-0 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          />
          {state.searchTerm && (
            <button
              type="button"
              aria-label="Limpar busca"
              onClick={() => update({ searchTerm: "" })}
              className="shrink-0 rounded-md px-2 py-1 text-[13px] font-semibold text-primary"
            >
              Limpar
            </button>
          )}
        </label>
        <div ref={ref} className="relative">
          <button aria-label="Menu da conta" aria-expanded={menu} onClick={() => setMenu(!menu)} className="relative grid h-10 w-10 place-items-center rounded-full bg-secondary">
            <User className="h-6 w-6" />
            {count > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">{count}</span>}
          </button>
          {menu && (
            <div role="menu" className="absolute right-0 top-[52px] z-50 w-[240px] rounded-2xl border border-border bg-popover py-2 shadow-[0_8px_30px_oklch(0_0_0/0.14)]">
              {items.map(({ icon: I, t, dot, on }) => (
                <button key={t} role="menuitem" onClick={() => { setMenu(false); on(); }} className="flex w-full items-center gap-4 px-5 py-3.5 text-left text-[17px] font-semibold active:bg-secondary">
                  <I className="h-6 w-6 shrink-0" />
                  <span className="flex-1">{t}</span>
                  {dot && <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-soft"><span className="h-2.5 w-2.5 rounded-full bg-primary" /></span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>
      {state.cartOpen && <CartSheet />}
      {info && (
        <Sheet title={info} onClose={() => setInfo(null)}>
          <p className="py-8 text-center text-[16px] text-muted-foreground">
            {info === "Favoritos" && state.favorites.length > 0
              ? state.favorites.map((id) => getProduct(id)?.title).filter(Boolean).join(" · ")
              : info === "Favoritos" ? "Você ainda não salvou nenhum produto." : "Informações em breve. O lojista ainda vai cadastrar este conteúdo."}
          </p>
        </Sheet>
      )}
    </>
  );
}

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-overlay" onClick={onClose}>
      <div className="max-h-[85dvh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl bg-background pb-safe animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background px-4 py-3.5">
          <h2 className="text-[19px] font-bold">{title}</h2>
          <button aria-label="Fechar" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-secondary"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-4">{children}</div>
      </div>
    </div>
  );
}

function CartSheet() {
  const { state, update } = useCheckout();
  const navigate = useNavigate();
  const close = () => update({ cartOpen: false });
  const rows = state.cart.map((i) => {
    const p = getProduct(i.productId);
    const v = p?.variants.find((x) => x.id === i.variantId) ?? null;
    return p ? { i, p, v, price: v?.price ?? p.price, image: v?.image ?? p.image } : null;
  }).filter((r): r is NonNullable<typeof r> => !!r);
  const total = rows.reduce((n, r) => n + r.price * r.i.qty, 0);
  return (
    <Sheet title="Meu carrinho" onClose={close}>
      {rows.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-[19px] font-bold text-muted-foreground">Sua sacola está vazia</p>
          <p className="mt-2 text-[16px] text-muted-foreground">Escolha um produto e aproveite a oferta com frete grátis.</p>
          <button onClick={() => { close(); navigate({ to: "/" }); }} className="mt-6 h-14 w-full rounded-full bg-primary text-[18px] font-bold text-primary-foreground">Ver ofertas</button>
        </div>
      ) : (
        <div className="py-3">
          {rows.map(({ i, p, v, price, image }) => (
            <div key={i.key} className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 border-b border-border py-3">
              <img src={image} alt="" loading="lazy" decoding="async" width={72} height={72} className="h-[72px] w-[72px] rounded-xl border border-border object-contain p-1" />
              <div className="min-w-0">
                <div className="line-clamp-2 text-[15px] font-semibold leading-snug">{p.title}</div>
                {v && <div className="text-[13px] text-muted-foreground">{v.line} · {v.color}</div>}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-[17px] font-extrabold">{brl(price * i.qty)}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg border border-border">
                      <button aria-label="Diminuir" onClick={() => update({ cart: setCartQty(state.cart, i.key, i.qty - 1) })} className="grid h-9 w-9 place-items-center"><Minus className="h-4 w-4" /></button>
                      <span className="w-7 text-center text-[16px] font-semibold">{i.qty}</span>
                      <button aria-label="Aumentar" onClick={() => update({ cart: setCartQty(state.cart, i.key, i.qty + 1) })} className="grid h-9 w-9 place-items-center"><Plus className="h-4 w-4" /></button>
                    </div>
                    <button aria-label="Remover" onClick={() => update({ cart: setCartQty(state.cart, i.key, 0) })} className="grid h-9 w-9 place-items-center rounded-lg bg-secondary"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <button
                  onClick={() => { update({ productId: p.id, variantId: i.variantId, qty: i.qty, cartOpen: false }); navigate({ to: "/checkout" }); }}
                  className="mt-2 h-10 w-full rounded-full bg-primary text-[15px] font-bold text-primary-foreground"
                >Comprar este item</button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between py-4 text-[18px] font-bold"><span>Total do carrinho</span><span>{brl(total)}</span></div>
        </div>
      )}
    </Sheet>
  );
}

const features = [
  { icon: Truck, t: "Frete grátis", s: "Em todos os produtos" },
  { icon: Package, t: "Envio expresso", s: "Embalagem protegida" },
  { icon: ShieldCheck, t: "Compra protegida", s: "Lacrada com nota fiscal" },
  { icon: CreditCard, t: "Pagamento PIX", s: "Aprovação imediata" },
  { icon: Lock, t: "Site seguro", s: "Criptografia SSL 256-bit" },
  { icon: Headphones, t: "Suporte 7 dias", s: "Atendimento humanizado" },
];

function TikTokMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.9 2.9 0 0 1-2.9 2.9 2.9 2.9 0 1 1 2.9-2.9c0-.16-.01-.32-.04-.47V11.7a6.34 6.34 0 1 0 3.49 5.67V9.94a8.2 8.2 0 0 0 4.8 1.54V8.04a4.85 4.85 0 0 1-1.03-.11Z" />
    </svg>
  );
}

function Accordion({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  const content = title === "Comece a comprar" ? (
    <ul className="space-y-2 px-4 pb-4 text-[14px] leading-relaxed text-muted-foreground">
      <li><strong className="text-foreground">1.</strong> Explore a vitrine e escolha seu achadinho.</li>
      <li><strong className="text-foreground">2.</strong> Confira fotos, detalhes e opções do produto.</li>
      <li><strong className="text-foreground">3.</strong> Adicione ao carrinho e finalize seu pedido com segurança.</li>
    </ul>
  ) : title === "Suporte ao cliente" ? (
    <div className="px-4 pb-4 text-[14px] leading-relaxed text-muted-foreground">
      <p>Precisa de ajuda com um pedido ou produto? Fale com nosso atendimento por e-mail.</p>
      <a href="mailto:sac@multiachadinhos.tiktokshop" className="mt-2 inline-flex items-center gap-2 font-semibold text-primary">
        <Mail className="h-4 w-4" /> sac@multiachadinhos.tiktokshop
      </a>
    </div>
  ) : (
    <p className="px-4 pb-4 text-[14px] text-muted-foreground">As políticas e os termos da loja serão publicados aqui em breve.</p>
  );
  return (
    <div className="border-b border-border">
      <button aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-4 text-[16px] font-semibold">
        {title}
        {open ? <Minus className="h-3.5 w-3.5 text-muted-foreground" /> : <Plus className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
      {open && content}
    </div>
  );
}

export function SiteFooter() {
  const l = store.legal;
  const rows: [string, string | null][] = [
    ["Razão social", l.razaoSocial],
    ["CNPJ", l.cnpj],
    ["Sede", l.sede],
    ["Atendimento", l.atendimento],
  ];
  return (
    <footer className="bg-background">
      <div className="flex items-center justify-between bg-ink px-4 py-4 text-ink-foreground">
        <BrandMark small />
        <div className="text-right text-[13px] leading-snug">
          <div className="font-semibold">Compre com segurança</div>
          <div className="opacity-80">Pagamento via PIX</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
        {features.map(({ icon: I, t, s }) => (
          <div key={t} className="flex items-center gap-2.5 rounded-xl border border-border p-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary"><I className="h-3.5 w-3.5" /></span>
            <div className="min-w-0">
              <div className="truncate text-[14px] font-semibold">{t}</div>
              <div className="truncate text-[12.5px] text-muted-foreground">{s}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <Accordion title="Comece a comprar" />
        <Accordion title="Suporte ao cliente" />
        <Accordion title="Política e termos" />
      </div>
      <div className="border-b border-border px-4 py-5">
        <div className="mb-1 text-[10px] font-semibold tracking-wide text-muted-foreground">ACOMPANHE O TIKTOK</div>
        <p className="mb-3 text-[13px] text-muted-foreground">Siga os canais oficiais do TikTok Brasil e descubra novidades, tendências e oportunidades do TikTok Shop.</p>
        <div className="flex gap-3">
          {[
            { Icon: TikTokMark, label: "TikTok", href: "https://www.tiktok.com/@tiktokbrasil" },
            { Icon: Instagram, label: "Instagram", href: "https://www.instagram.com/tiktok/" },
            { Icon: Facebook, label: "Facebook", href: "https://www.facebook.com/tiktokbrasil.official/" },
            { Icon: Youtube, label: "YouTube", href: "https://www.youtube.com/channel/UCGCMBzXBLn8CxGw5aHj0_IA" },
          ].map(({ Icon, label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`TikTok Brasil no ${label}`} title={`TikTok Brasil no ${label}`} className="grid h-9 w-9 place-items-center rounded-full border border-border transition-colors hover:bg-secondary">
              <Icon />
            </a>
          ))}
        </div>
      </div>
      <div className="p-4">
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="flex items-center gap-3 p-4">
            <img src={store.logo} alt="" loading="lazy" decoding="async" width={48} height={48} className="h-12 w-12 shrink-0 rounded-xl" />
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-[16px] font-bold">{store.brandName} <Verified /></div>
              <div className="text-[12px] text-muted-foreground">Loja oficial</div>
            </div>
          </div>
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[110px_minmax(0,1fr)] gap-2 border-t border-border px-4 py-3 text-[13px]">
              <span className="text-muted-foreground">{k}</span>
              <span className={v ? "font-medium" : "italic text-muted-foreground"}>{v ?? "A informar pelo lojista"}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="border-t border-border py-5 text-center text-[12px] text-muted-foreground">
        © 2026 TikTok Shop · Todos os direitos reservados
      </p>
    </footer>
  );
}

export function PageHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 grid grid-cols-[40px_minmax(0,1fr)_40px] items-center border-b border-border bg-background px-3 py-3">
      <button aria-label="Voltar" onClick={onBack ?? (() => router.history.back())}>
        <ChevronLeft className="h-7 w-7" />
      </button>
      <h1 className="truncate text-center text-[19px] font-bold">{title}</h1>
      <span />
    </header>
  );
}

export { ShoppingBag };
