import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronLeft, Search, User, Truck, Package, ShieldCheck, CreditCard, Lock, Headphones,
  Plus, Minus, Instagram, Facebook, Youtube, Mail, BadgeCheck, ShoppingBag,
} from "lucide-react";
import { store } from "@/lib/catalog";

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

export function TopBar() {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-2 bg-background px-3 py-2.5">
      <button aria-label="Voltar" onClick={() => router.history.back()} className="p-1">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <Link to="/" className="max-w-[110px]"><BrandMark /></Link>
      <label className="flex h-9 min-w-0 items-center gap-2 rounded-lg border border-primary px-3">
        <Search className="h-4 w-4 shrink-0 text-primary" />
        <input aria-label="Procurar" className="w-full min-w-0 bg-transparent text-sm outline-none" />
        <span className="shrink-0 text-sm text-primary">Procurar</span>
      </label>
      <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary">
        <User className="h-5 w-5" />
      </span>
    </header>
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

function Accordion({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-4 text-[14px] font-semibold">
        {title}
        {open ? <Minus className="h-3.5 w-3.5 text-muted-foreground" /> : <Plus className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
      {open && <p className="px-4 pb-4 text-[13px] text-muted-foreground">Conteúdo em breve.</p>}
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
        <div className="text-right text-[11px] leading-snug">
          <div className="font-semibold">Compre com segurança</div>
          <div className="opacity-80">Pagamento via PIX</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
        {features.map(({ icon: I, t, s }) => (
          <div key={t} className="flex items-center gap-2.5 rounded-xl border border-border p-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary"><I className="h-3.5 w-3.5" /></span>
            <div className="min-w-0">
              <div className="truncate text-[12px] font-semibold">{t}</div>
              <div className="truncate text-[11px] text-muted-foreground">{s}</div>
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
        <div className="mb-3 text-[10px] font-semibold tracking-wide text-muted-foreground">SIGA A GENTE</div>
        <div className="flex gap-3">
          {[Instagram, Facebook, Youtube, Mail].map((I, i) => (
            <span key={i} className="grid h-9 w-9 place-items-center rounded-full border border-border"><I className="h-4 w-4" /></span>
          ))}
        </div>
      </div>
      <div className="p-4">
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="flex items-center gap-3 p-4">
            <img src={store.logo} alt="" className="h-12 w-12 shrink-0 rounded-xl" />
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-[16px] font-bold">{store.brandName} <Verified /></div>
              <div className="text-[12px] text-muted-foreground">Loja oficial</div>
            </div>
          </div>
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[96px_minmax(0,1fr)] gap-2 border-t border-border px-4 py-3 text-[11px]">
              <span className="text-muted-foreground">{k}</span>
              <span className={v ? "font-medium" : "italic text-muted-foreground"}>{v ?? "A informar pelo lojista"}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="border-t border-border py-5 text-center text-[10px] text-muted-foreground">
        © 2026 {store.brandName} · Todos os direitos reservados
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
