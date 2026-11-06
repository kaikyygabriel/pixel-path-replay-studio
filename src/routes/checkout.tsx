import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, ChevronRight, Ticket, Truck } from "lucide-react";
import { PageHeader } from "@/components/shop/chrome";
import { BottomBar, ItemCard, OrderSummary, Protections, Section, useOrder } from "@/components/shop/order";
import { AddressSheet, CustomerSheet } from "@/components/shop/checkout-sheets";
import { useCheckout } from "@/lib/checkout";
import { brl } from "@/lib/catalog";
import { PixIcon } from "@/components/shop/pix-icon";
import { formatEstimatedDelivery } from "@/lib/delivery";

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
  const [couponOpen, setCouponOpen] = useState(false);

  if (!order.ready) return <div className="app-frame" />;
  if (!order.product) return <Navigate to="/" />;

  return (
    <div className="app-frame page-enter bg-surface pb-[150px]">
      <PageHeader title="Produto selecionado" />
      <Section className="mt-2 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-[18px] font-bold"><MapPin className="h-6 w-6" />Endereço de envio</span>
          <button onClick={() => setStep(state.customer ? 2 : 1)} className="h-10 shrink-0 text-[15px] font-semibold text-primary">
            {state.address ? "Editar" : "+ Adicionar endereço"}
          </button>
        </div>
        {state.address && (
          <button onClick={() => setStep(1)} className="mt-2 w-full rounded-xl bg-surface p-3 text-left text-[15px] leading-snug">
            <b>{state.customer?.name}</b> · {state.customer?.phone}<br />
            {state.address.street}, {state.address.number}{state.address.complement ? ` – ${state.address.complement}` : ""}<br />
            {state.address.district} · {state.address.city}/{state.address.uf} · {state.address.cep}
          </button>
        )}
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
          <span className="capitalize">Receba até {formatEstimatedDelivery()}</span>
          <span className="flex items-center gap-1.5"><s className="text-muted-foreground">R$ 26,20</s><b>Frete grátis</b></span>
        </div>
      </div>
      <Section className="px-3.5 py-4">
        <button onClick={() => setCouponOpen(true)} className="flex w-full items-center justify-between text-left">
          <span className="flex items-center gap-2 text-[14px] font-bold"><Ticket className="h-5 w-5 text-primary" />Descontos do pedido</span>
          <span className="flex items-center gap-2">
            <span className="flex flex-col items-end gap-1 text-[12px]">
              <span className="rounded-sm bg-teal-soft px-2 py-0.5 text-teal-ink">Frete grátis</span>
              <span className="rounded-sm bg-primary-soft px-2 py-0.5 text-primary">– {brl(order.totals.discount)}</span>
            </span>
            <ChevronRight className="h-4 w-4" />
          </span>
        </button>
      </Section>
      <OrderSummary order={order} />
      {couponOpen && <div className="fixed inset-0 z-[70] flex items-end justify-center bg-overlay" onClick={() => setCouponOpen(false)}><div className="w-full max-w-[480px] rounded-t-3xl bg-background p-5" onClick={(event) => event.stopPropagation()}><div className="mb-4 flex items-center justify-between"><h2 className="text-[18px] font-bold">Cupons do pedido</h2><button onClick={() => setCouponOpen(false)} className="text-[14px] font-semibold text-primary">Fechar</button></div><div className="flex items-center gap-3 rounded-xl border border-teal-ink/30 p-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-teal-soft text-teal-ink"><Truck className="h-6 w-6" /></span><div className="min-w-0 flex-1"><div className="font-bold">Frete grátis</div><div className="text-[12px] text-muted-foreground">Cupom obrigatório da primeira compra</div></div><span className="rounded-full bg-teal-soft px-3 py-1 text-[12px] font-bold text-teal-ink">Ativo</span></div><p className="mt-3 text-[13px] text-muted-foreground">O desconto de {brl(order.totals.discount)} é calculado automaticamente sobre os produtos e não é um cupom.</p></div></div>}
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
      <BottomBar order={order} label={state.address ? "Continuar" : "Adicionar endereço de envio"} onClick={() => (state.address && state.customer ? navigate({ to: "/resumo" }) : setStep(state.customer ? 2 : 1))} />
      {step === 1 && <CustomerSheet onClose={() => setStep(0)} onNext={() => setStep(2)} />}
      {step === 2 && (
        <AddressSheet onClose={() => setStep(0)} onBack={() => setStep(1)} onDone={() => navigate({ to: "/resumo" })} />
      )}
    </div>
  );
}
