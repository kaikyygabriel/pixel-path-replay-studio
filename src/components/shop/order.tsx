import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, ChevronRight, ShieldCheck, Smile, ShieldUser, PackageCheck, Zap, Lock, Ticket } from "lucide-react";
import { Verified } from "./chrome";
import { brl, discountPct, getProduct, orderTotals, store, type Product, type Variant } from "@/lib/catalog";
import { useCheckout, useOfferEnd } from "@/lib/checkout";

export function useOrder() {
  const { state, ready } = useCheckout();
  const product: Product | undefined = state.productId ? getProduct(state.productId) : undefined;
  const variant: Variant | null = product?.variants.find((v) => v.id === state.variantId) ?? null;
  if (!product) return { ready, product: null as null };
  const unitPrice = variant?.price ?? product.price;
  const unitOriginal = variant?.original ?? product.original;
  const pieces = (variant?.pieces ?? 1) * state.qty;
  const totals = orderTotals(unitPrice * state.qty, unitOriginal * state.qty);
  const title = variant ? `${product.checkoutTitle} · ${variant.color}` : product.checkoutTitle;
  const image = variant?.image ?? product.image;
  return { ready, product, variant, pieces, totals, title, image, unitPrice, unitOriginal, qty: state.qty };
}

export type Order = Exclude<ReturnType<typeof useOrder>, { product: null }>;

export function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`mb-2 bg-background ${className}`}>{children}</section>;
}

export function ItemCard({ order, right }: { order: Order; right?: ReactNode }) {
  const offer = useOfferEnd();
  const { totals } = order;
  return (
    <Section className="px-3.5 py-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[14px] font-extrabold">
          {store.name} <Verified />
        </div>
        {right}
      </div>
      <div className="mt-3 grid grid-cols-[64px_minmax(0,1fr)] gap-3">
        <img src={order.image} alt="" className="h-16 w-16 rounded-lg border border-border object-contain p-1" />
        <div className="min-w-0">
          <div className="text-[13.5px] font-semibold leading-snug">{order.title}</div>
          <div className="mt-1 flex items-center gap-1.5 text-[10px]">
            <span className="flex items-center gap-0.5 rounded-sm bg-primary px-1.5 py-0.5 font-semibold text-primary-foreground"><Zap className="h-2.5 w-2.5 fill-current" />Oferta Relâmpago</span>
            <span className="rounded-sm bg-primary-soft px-1.5 py-0.5 text-primary">{offer.mm}:{offer.ss}</span>
          </div>
          <div className="mt-1 inline-flex items-center gap-1 rounded-sm bg-secondary px-1 text-[10px] font-bold">
            <span className="h-2 w-2 rounded-full bg-gold" />Devolução gratuita
          </div>
        </div>
      </div>
      <div className="mt-1 flex items-baseline justify-between">
        <div className="text-[15px]">
          <span className="text-primary">-{discountPct(totals.subtotal, totals.original)}%</span>{" "}
          <span className="font-medium">{brl(order.unitPrice)}</span>{" "}
          <span className="text-muted-foreground line-through">{brl(order.unitOriginal)}</span>
        </div>
        <span className="text-[14px] text-muted-foreground">x{order.pieces}</span>
      </div>
    </Section>
  );
}

export function OrderSummary({ order }: { order: Order }) {
  const [a, setA] = useState(true);
  const [b, setB] = useState(true);
  const t = order.totals;
  const Row = ({ l, r, red, sub }: { l: string; r: ReactNode; red?: boolean; sub?: boolean }) => (
    <div className={`flex items-center justify-between ${sub ? "ml-0 border-l-2 border-border pl-3" : ""} py-1.5 text-[15px]`}>
      <span>{l}</span>
      <span className={red ? "text-primary" : ""}>{r}</span>
    </div>
  );
  return (
    <Section className="px-3.5 py-4">
      <h2 className="mb-2 text-[21px] font-extrabold">Resumo do pedido</h2>
      <button onClick={() => setA(!a)} className="flex w-full items-center justify-between py-1.5 text-left text-[15px]">
        <span>Subtotal do produto</span>
        <span className="flex items-center gap-1">{brl(t.subtotal)}{a ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}</span>
      </button>
      {a && (
        <>
          <Row sub l="Preço original" r={brl(t.original)} />
          <Row sub red l="Desconto no produto" r={`– ${brl(t.discount)}`} />
        </>
      )}
      <button onClick={() => setB(!b)} className="mt-1.5 flex w-full items-center justify-between py-1.5 text-left text-[15px]">
        <span>Subtotal do envio</span>
        <span className="flex items-center gap-1">{brl(0)}{b ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}</span>
      </button>
      {b && <Row sub l="Taxa de envio" r={brl(t.shipping)} />}
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[21px] font-bold">
        <span>Total</span><span>{brl(t.total)}</span>
      </div>
    </Section>
  );
}

const prots = [
  { i: ShieldCheck, t: "Pagamentos seguros" },
  { i: ShieldUser, t: "Privacidade de dados" },
  { i: PackageCheck, t: "Garantia de reembolso" },
];

export function Protections({ collapsible }: { collapsible?: boolean }) {
  const [open, setOpen] = useState(true);
  return (
    <section className="bg-surface px-3.5 py-4">
      {collapsible ? (
        <button onClick={() => setOpen(!open)} className="mb-4 flex w-full items-center justify-between text-left">
          <span className="flex items-center gap-2 text-[19px] font-bold"><ShieldCheck className="h-6 w-6" />Proteções da loja</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "" : "-rotate-90"}`} />
        </button>
      ) : (
        <h2 className="mb-3 text-[17px] font-bold">Proteções da loja</h2>
      )}
      {(!collapsible || open) && (
        <>
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] items-center divide-x divide-border">
            {prots.map(({ i: I, t }) => (
              <div key={t} className="px-2.5 first:pl-0">
                <I className="mb-1.5 h-5 w-5" />
                <div className="text-[13px] leading-tight">{t}</div>
              </div>
            ))}
            <ChevronRight className="h-4 w-4 pl-1" />
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
            Ao fazer um pedido, você concorda com os <b>Termos de uso e venda</b> e com a <b>Política de privacidade</b> de {store.brandName}.
          </p>
        </>
      )}
    </section>
  );
}

export function SavingsBar({ saved }: { saved: number }) {
  return (
    <div className="flex items-center gap-2 bg-primary-soft px-3.5 py-2 text-[13px] font-semibold text-primary">
      <Smile className="h-5 w-5" />Você está economizando {brl(saved)} nesse pedido.
    </div>
  );
}

export function BottomBar({ order, label, onClick, icon, note }: { order: Order; label: string; onClick: () => void; icon?: ReactNode; note?: ReactNode }) {
  return (
    <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 bg-background shadow-[0_-2px_10px_oklch(0_0_0/0.06)]">
      {note}
      <SavingsBar saved={order.totals.discount} />
      <div className="flex items-baseline justify-between px-3.5 pt-2.5">
        <span className="text-[14px] font-bold">Total ({order.pieces} itens)</span>
        <span className="text-[19px] font-extrabold">{brl(order.totals.total)}</span>
      </div>
      <div className="px-3.5 pb-safe pt-2">
        <button onClick={onClick} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-[17px] font-extrabold text-primary-foreground">
          {icon}{label}
        </button>
      </div>
    </div>
  );
}

export const LockNote = ({ children }: { children: ReactNode }) => (
  <p className="flex items-center justify-center gap-1.5 py-4 text-[12px] text-muted-foreground"><Lock className="h-3.5 w-3.5 text-success" />{children}</p>
);

export { Ticket };
