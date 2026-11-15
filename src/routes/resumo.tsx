import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { MapPin, Truck, ChevronRight, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shop/chrome";
import { BottomBar, ItemCard, LockNote, OrderSummary, Protections, Section, useOrder } from "@/components/shop/order";
import { PixIcon } from "@/components/shop/pix-icon";
import { formatEstimatedDelivery } from "@/lib/delivery";
import { useCheckout } from "@/lib/checkout";
import { createPixPaymentOnce, getPixRequestKey } from "@/lib/payments/pix-client";

export const Route = createFileRoute("/resumo")({
  head: () => ({
    meta: [
      { title: "Resumo do pedido" },
      { name: "description", content: "Confira endereço, produto e valores antes de finalizar o pedido." },
      { property: "og:title", content: "Resumo do pedido" },
      { property: "og:description", content: "Confira seu pedido antes de finalizar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Resumo,
});

function Resumo() {
  const order = useOrder();
  const { state } = useCheckout();
  const navigate = useNavigate();
  if (!order.ready) return <div className="app-frame" />;
  if (!order.product) return <Navigate to="/" />;
  if (!state.address || !state.customer) return <Navigate to="/checkout" />;
  const paymentData = order.product && state.customer && state.address ? {
    items: order.items.map((item) => ({
      productId: item.product.id,
      variantId: item.variant?.id ?? null,
      quantity: item.qty,
    })),
    customer: { ...state.customer, cpf: state.address.cpf },
  } : null;
  const startPayment = () => {
    if (paymentData) {
      void createPixPaymentOnce(getPixRequestKey(paymentData), paymentData).catch(() => {
        // A página de pagamento apresenta a mensagem de erro e permite tentar novamente.
      });
    }
    void navigate({ to: "/pagamento" });
  };
  const a = state.address;
  return (
    <div className="app-frame page-enter bg-surface pb-[150px]">
      <PageHeader title="Resumo do pedido" />
      <Section className="mt-2 px-3.5 py-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[17px] font-bold"><MapPin className="h-5 w-5" />Endereço de envio</span>
          <button onClick={() => navigate({ to: "/checkout" })} className="text-[14px] text-primary">Alterar</button>
        </div>
        <div className="mt-2 pl-7 text-[13px] text-muted-foreground">
          {a.street}, {a.number}{a.complement ? ` · ${a.complement}` : ""} · {a.city} / {a.uf}
        </div>
      </Section>
      <ItemCard order={order} />
      <div className="-mt-3 mb-2 flex items-center justify-between bg-background px-3.5 pb-4 pt-2 text-[13px]">
        <span className="text-muted-foreground">Forma de pagamento</span>
        <span className="flex items-center gap-1 font-bold"><PixIcon className="h-4 w-4" />PIX</span>
      </div>
      <div className="border-y border-border bg-background px-3.5 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <Truck className="h-6 w-6 shrink-0 text-foreground" strokeWidth={2} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-1.5">
              <span className="text-[15px] font-normal leading-tight text-teal-ink">Frete grátis</span>
              <s className="text-[13px] leading-tight text-muted-foreground">R$ 26,60</s>
            </div>
            <p className="mt-0.5 text-[13px] leading-snug text-foreground">Receba até {formatEstimatedDelivery()}</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </div>
      </div>
      <OrderSummary order={order} />
      <Protections />
      <LockNote>Confirme seus dados antes de finalizar a compra.</LockNote>
      <BottomBar order={order} label="Fazer pedido" icon={<ShieldCheck className="h-5 w-5" />} onClick={startPayment} />
    </div>
  );
}
