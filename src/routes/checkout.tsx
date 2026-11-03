import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, ChevronRight, Ticket } from "lucide-react";
import { PageHeader } from "@/components/shop/chrome";
import { BottomBar, ItemCard, OrderSummary, Protections, Section, useOrder } from "@/components/shop/order";
import { AddressSheet, CustomerSheet } from "@/components/shop/checkout-sheets";
import { useCheckout } from "@/lib/checkout";
import { brl } from "@/lib/catalog";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Produto selecionado · Finalizar compra" },
      { name: "description", content: "Revise o produto selecionado, informe seus dados e o endereço de entrega." },
      { property: "og:title", content: "Produto selecionado" },
      { property: "og:description", content: "Revise o produto e informe o endereço de entrega." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const order = useOrder();
  const { state } = useCheckout();
  const navigate = useNavigate();
  const [step, setStep] = useState<0 | 1 | 2>(0);

  if (!order.ready) return <div className="app-frame" />;
  if (!order.product) return <Navigate to="/" />;

  return (
    <div className="app-frame bg-surface pb-[150px]">
      <PageHeader title="Produto selecionado" />
      <Section className="mt-2 flex items-center justify-between px-3.5 py-4">
        <span className="flex items-center gap-2 text-[17px] font-bold"><MapPin className="h-5 w-5" />Endereço de envio</span>
        <button onClick={() => setStep(state.customer ? 2 : 1)} className="text-[14px] text-primary">+ Adicionar endereço</button>
      </Section>
      <ItemCard
        order={order}
        right={
          <button onClick={() => navigate({ to: "/produto/$id", params: { id: order.product.id } })} className="flex items-center text-[13px] text-muted-foreground">
            Alterar produto <ChevronRight className="h-3.5 w-3.5" />
          </button>
        }
      />
      <div className="-mt-1 mb-2 bg-background px-3.5 pb-3">
        <div className="flex items-center justify-between rounded-lg bg-teal-soft px-3 py-3 text-[13px]">
          <span>Receba até 4 – 5 de nov.</span>
          <span className="flex items-center gap-1.5"><s className="text-muted-foreground">R$ 26,20</s><b>Frete grátis</b></span>
        </div>
      </div>
      <Section className="flex items-center justify-between px-3.5 py-5">
        <span className="flex items-center gap-2 text-[14px] font-bold"><Ticket className="h-5 w-5 text-primary" />Descontos do pedido</span>
        <span className="flex items-center gap-2">
          <span className="flex flex-col items-end gap-1 text-[12px]">
            <span className="rounded-sm bg-teal-soft px-2 py-0.5 text-teal-ink">Frete grátis</span>
            <span className="rounded-sm bg-primary-soft px-2 py-0.5 text-primary">– {brl(order.totals.discount)}</span>
          </span>
          <ChevronRight className="h-4 w-4" />
        </span>
      </Section>
      <OrderSummary order={order} />
      <Section className="px-3.5 py-4">
        <h2 className="mb-3 text-[17px] font-bold">Forma de pagamento</h2>
        <div className="flex items-start gap-3">
          <PixIcon className="mt-1 h-7 w-7" />
          <div className="flex-1">
            <div className="text-[17px] font-bold">PIX</div>
            <div className="text-[12.5px] text-muted-foreground">Pagamento instantâneo · Aprovação imediata</div>
            <div className="mt-2 text-[12px] text-success">PIX oficial BCB · Sem taxas</div>
          </div>
          <span className="mt-2 h-6 w-6 rounded-full border-[6px] border-primary bg-background" />
        </div>
      </Section>
      <Protections collapsible />
      <BottomBar order={order} label="Adicionar endereço de envio" onClick={() => setStep(state.customer ? 2 : 1)} />
      {step === 1 && <CustomerSheet onClose={() => setStep(0)} onNext={() => setStep(2)} />}
      {step === 2 && (
        <AddressSheet onClose={() => setStep(0)} onBack={() => setStep(1)} onDone={() => navigate({ to: "/resumo" })} />
      )}
    </div>
  );
}

export function PixIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-label="PIX">
      <g fill="oklch(0.7 0.12 180)">
        <path d="M16 2.8 9.9 8.9a3 3 0 0 0 0 4.2l2.2 2.2h1.2L10.9 12.9a1.6 1.6 0 0 1 0-2.3L16 5.5l5.1 5.1a1.6 1.6 0 0 1 0 2.3l-2.4 2.4h1.2l2.2-2.2a3 3 0 0 0 0-4.2z" />
        <path d="m16 29.2 6.1-6.1a3 3 0 0 0 0-4.2l-2.2-2.2h-1.2l2.4 2.4a1.6 1.6 0 0 1 0 2.3L16 26.5l-5.1-5.1a1.6 1.6 0 0 1 0-2.3l2.4-2.4h-1.2l-2.2 2.2a3 3 0 0 0 0 4.2z" />
        <path d="m2.8 16 6.1-6.1h1.2L7.9 12l.9.9H11a2.6 2.6 0 0 1 1.8.8l2 2a1.6 1.6 0 0 0 2.2 0l2-2a2.6 2.6 0 0 1 1.8-.8h2.2l.9-.9-2.2-2.1h1.2L29.2 16l-6.1 6.1h-1.2l2.2-2.1-.9-.9H21a2.6 2.6 0 0 1-1.8-.8l-2-2a1.6 1.6 0 0 0-2.2 0l-2 2a2.6 2.6 0 0 1-1.8.8H8.8l-.9.9 2.2 2.1H8.9z" />
      </g>
    </svg>
  );
}
