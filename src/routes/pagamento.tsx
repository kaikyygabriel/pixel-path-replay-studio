import { createFileRoute, Navigate, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Clock, Copy, Check, ArrowDown, Smartphone, Landmark, Share2, ShieldCheck, AlertTriangle } from "lucide-react";
import { useOrder } from "@/components/shop/order";
import { useCheckout, useCountdown } from "@/lib/checkout";
import { brl } from "@/lib/catalog";
import { createPixPayment, getPixPaymentStatus } from "@/lib/payments/payments.functions";
import type { CreatePixResult, PaymentStatus } from "@/lib/payments/types";
import { createPixPaymentOnce, getPixRequestKey } from "@/lib/payments/pix-client";

export const Route = createFileRoute("/pagamento")({
  head: () => ({
    meta: [
      { title: "Pagamento PIX" },
      { name: "description", content: "Pague seu pedido com PIX copia e cola ou QR Code." },
      { property: "og:title", content: "Pagamento PIX" },
      { property: "og:description", content: "Pague com PIX copia e cola ou QR Code." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pagamento,
});

function Pagamento() {
  const order = useOrder();
  const { state, update } = useCheckout();
  const router = useRouter();
  const [result, setResult] = useState<CreatePixResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [expiryTransition, setExpiryTransition] = useState(false);
  const expiryHandled = useRef(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const paymentData = order.product && state.customer && state.address ? {
    items: order.items.map((item) => ({
      productId: item.product.id,
      variantId: item.variant?.id ?? null,
      quantity: item.qty,
    })),
    customer: { ...state.customer, cpf: state.address.cpf },
  } : null;
  const requestKey = paymentData ? getPixRequestKey(paymentData) : null;

  useEffect(() => {
    if (!paymentData || !requestKey) return;
    let active = true;
    createPixPaymentOnce(requestKey, paymentData)
      .then((paymentResult) => { if (active) setResult(paymentResult); })
      .catch(() => {
        if (active) setResult({ ok: false, reason: "error", message: "Não foi possível gerar o PIX." });
      });
    return () => { active = false; };
  }, [requestKey, order.ready]); // requestKey muda somente quando os dados do pedido mudam

  const charge = result?.ok ? result.charge : null;
  const timer = useCountdown(charge ? Date.parse(charge.expiresAt) : null);

  useEffect(() => {
    if (!charge || timer.left > 0 || paymentStatus === "paid" || expiryHandled.current) return;
    expiryHandled.current = true;
    setExpiryTransition(true);
    const timeout = window.setTimeout(() => {
      update({ checkoutItems: [], cartOpen: true });
      void router.navigate({ to: "/" });
    }, 1100);
    return () => window.clearTimeout(timeout);
  }, [charge?.paymentId, timer.left, paymentStatus]);

  useEffect(() => {
    if (!charge?.orderId) return;
    setPaymentStatus(charge.status);
    let active = true;
    const refreshStatus = async () => {
      try {
        const statusResult = await getPixPaymentStatus({ data: { paymentId: charge.paymentId } });
        if (active && statusResult.ok) setPaymentStatus(statusResult.status);
      } catch {
        // A próxima consulta automática tentará novamente.
      }
    };
    void refreshStatus();
    const interval = window.setInterval(() => void refreshStatus(), 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [charge?.paymentId]);

  if (!order.ready) return <div className="app-frame" />;
  if (!order.product) return <Navigate to="/" />;
  if (!state.customer || !state.address) return <Navigate to="/checkout" />;

  async function copy() {
    if (!charge || timer.left <= 0 || paymentStatus === "paid") return;
    let success = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(charge.pixCode);
        success = true;
      }
    } catch {
      // Tenta o método compatível com navegadores móveis mais antigos.
    }
    if (!success) {
      const field = document.createElement("textarea");
      field.value = charge.pixCode;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      field.style.pointerEvents = "none";
      document.body.appendChild(field);
      field.select();
      field.setSelectionRange(0, field.value.length);
      try { success = document.execCommand("copy"); } catch { success = false; }
      document.body.removeChild(field);
    }
    if (!success) {
      setCopyError(true);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToast(true);
      toastTimer.current = setTimeout(() => setToast(false), 2600);
      return;
    }
    setCopyError(false);
    setCopied(true);
    setToast(true);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    // O estado verde é temporário: o botão volta suavemente a "Copiar" para
    // permitir uma nova cópia sem recarregar a página.
    copiedTimer.current = setTimeout(() => setCopied(false), 2200);
    toastTimer.current = setTimeout(() => setToast(false), 2600);
  }

  async function sharePixCode() {
    if (!charge || timer.left <= 0) return;
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        // Envia exclusivamente o payload PIX, sem título, descrição ou dados do pedido.
        await navigator.share({ text: charge.pixCode });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        // Se o compartilhamento nativo falhar, oferece cópia como alternativa.
      }
    }
    await copy();
  }

  const unavailable = result && !result.ok;

  return (
    <div className="app-frame bg-surface pb-10">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-center border-b border-ink-foreground/10 bg-ink px-3 text-ink-foreground shadow-sm">
        <button aria-label="Voltar" onClick={() => router.history.back()} className="absolute left-3 grid h-8 w-8 place-items-center rounded-lg border border-ink-foreground/20 bg-ink-foreground/10">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <img src="/logo%20estendida%20tiktok%20shop.png" alt="TikTok Shop" width={168} height={44} loading="eager" decoding="async" className="h-11 w-[168px] object-contain brightness-0 invert" />
      </header>

      {toast && (
        <div className="fixed left-1/2 top-3 z-50 flex w-[86%] max-w-[420px] -translate-x-1/2 items-center gap-3 rounded-full bg-ink px-4 py-2.5 text-ink-foreground shadow-lg">
          <span className={`grid h-8 w-8 place-items-center rounded-full ${copyError ? "bg-destructive" : "bg-success"}`}>{copyError ? <AlertTriangle className="h-4 w-4" /> : <Check className="h-4 w-4" />}</span>
          <div className="text-[13px] leading-tight"><b className="block text-[15px]">{copyError ? "Não foi possível copiar" : "Código PIX copiado"}</b>{copyError ? "Selecione e copie o código manualmente." : "Cole em “PIX Copia e Cola” no seu banco"}</div>
        </div>
      )}

      <main className="mx-auto w-full max-w-[420px] space-y-2 px-2.5 py-2.5 sm:space-y-3 sm:px-3 sm:py-4">
        <div className="flex items-center gap-2.5 rounded-xl border border-primary/30 border-b-4 border-b-primary bg-primary-soft p-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
            {unavailable ? <AlertTriangle className="h-4 w-4" /> : paymentStatus === "paid" ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-bold">{unavailable ? "Pagamento indisponível" : paymentStatus === "paid" ? "Pagamento confirmado" : charge ? "Pedido reservado" : "Gerando PIX…"}</div>
            <div className="text-[13px] leading-tight text-muted-foreground">{unavailable ? result.message : paymentStatus === "paid" ? "Seu pedido foi identificado e está confirmado." : timer.left <= 0 && charge ? "Este PIX expirou. Gere uma nova cobrança para pagar." : "Pague antes de expirar"}</div>
          </div>
          {charge && paymentStatus !== "paid" && (
            <div className="flex shrink-0 items-center gap-1 text-[17px] font-extrabold">
              <span className="rounded-lg bg-ink px-2 py-1 text-ink-foreground">{timer.hms}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl bg-card p-3 shadow-sm">
          <div>
            <div className="text-[12px] font-bold tracking-wide text-muted-foreground">TOTAL A PAGAR</div>
            <div className="text-[clamp(1.4rem,6vw,1.65rem)] font-extrabold leading-tight tabular-nums">{brl(order.totals.total)}</div>
          </div>
          <span className="rounded-full bg-primary-soft px-3 py-1 text-[13px] font-bold text-primary">PIX à vista</span>
        </div>

        <section className="rounded-xl bg-card p-3 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[14px] font-extrabold">Itens do pedido</h2>
            {charge?.orderId && <span className="text-[10px] font-semibold text-muted-foreground">Pedido #{charge.orderId.slice(0, 8).toUpperCase()}</span>}
          </div>
          <div className="mt-2 space-y-2">
            {order.items.map((item) => (
              <div key={item.product.id + ":" + (item.variant?.id ?? "-")} className="flex items-center justify-between gap-2 text-[12px] leading-tight">
                <span className="min-w-0 flex-1">{item.title} <b className="whitespace-nowrap">× {item.qty}</b></span>
                <b className="shrink-0 tabular-nums">{brl(item.price)}</b>
              </div>
            ))}
          </div>
        </section>



        <section className="rounded-xl bg-card p-2.5 text-center shadow-sm sm:p-4" aria-label="QR Code PIX">
          <div className="mx-auto flex aspect-square w-full max-w-[200px] items-center justify-center rounded-2xl border border-border bg-white p-2.5 sm:p-3">
            {charge ? (
              <QRCodeSVG value={charge.pixCode} size={190} level="M" marginSize={1} style={{ width: "100%", height: "auto", maxWidth: "190px" }} />
            ) : (
              <span className="px-3 text-[12px] text-muted-foreground">{unavailable ? "QR Code será disponibilizado quando a integração de pagamento estiver configurada." : "Gerando seu QR Code…"}</span>
            )}
          </div>
          <p className="mt-2 text-[13px] leading-tight text-muted-foreground">Abra o aplicativo do seu banco e escaneie o código</p>
        </section>

        <div className="overflow-hidden rounded-xl bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-border px-3.5 py-2.5 text-[13px]">
            {copied ? (
              <span className="flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-[11px] font-bold text-primary-foreground"><Check className="h-3 w-3" />Código copiado</span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground"><Clock className="h-3 w-3" />FALTA 1 PASSO</span>
            )}
            <span className="text-muted-foreground">{paymentStatus === "paid" ? "Pagamento confirmado" : charge ? "Pedido reservado" : "Aguardando PIX"}</span>
          </div>
          <div className="p-3">
            <h2 className="text-[15px] font-extrabold">Pague com PIX Copia e Cola</h2>
            <p className="mt-1 text-[12px] leading-snug text-muted-foreground">Copie o código abaixo, cole no app do seu banco e confirme.</p>
            {!copied && <ArrowDown className="mx-auto mt-1.5 h-4 w-4 text-primary" />}
            <button
              onClick={copy}
              disabled={!charge || timer.left <= 0 || paymentStatus === "paid"}
              aria-live="polite"
              className={`relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl py-3 text-[15px] font-extrabold text-primary-foreground ring-4 transition-colors duration-300 ease-out active:scale-[0.985] disabled:opacity-40 ${copied ? "bg-success ring-success/25" : "bg-primary ring-primary/25"}`}
            >
              {copied && <span key="copy-progress" aria-hidden="true" className="pix-copy-progress pointer-events-none absolute inset-x-0 bottom-0 z-0 h-1 origin-left bg-white/80" />}
              <span className="relative z-10 inline-flex items-center justify-center gap-2">
                {copied ? <><span className="grid h-7 w-7 place-items-center rounded-full bg-background/30"><Check className="h-4 w-4" /></span>Código copiado</> : <><Copy className="h-5 w-5" />Copiar código PIX</>}
              </span>
            </button>
            <div className="mt-2.5 rounded-xl bg-surface p-2.5">
              <div className="flex items-center justify-between text-[12px] font-bold">
                <span className="tracking-wide text-muted-foreground">PIX COPIA E COLA</span>
                <button onClick={copy} disabled={!charge || timer.left <= 0} className={copied ? "text-success transition-colors duration-300" : "text-primary transition-colors duration-300 disabled:opacity-40"}>{copied ? "Copiado" : "Copiar"}</button>
              </div>
              <div className="mt-1.5 max-h-20 overflow-y-auto break-all [overflow-wrap:anywhere] rounded-lg border border-border bg-card p-2 text-left font-mono text-[10px] leading-snug sm:text-[11.5px]">
                {charge ? charge.pixCode : <span className="font-sans italic text-muted-foreground">O código PIX aparecerá aqui quando a integração de pagamento estiver ativa.</span>}
              </div>
              <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">Se preferir, toque e segure o código para copiar manualmente.</p>
            </div>
            <div className="mt-3 grid grid-cols-3 text-center text-[11px] text-muted-foreground">
              {[
                { n: 1, I: Copy, t: "Copiar código" },
                { n: 2, I: Smartphone, t: "Abrir o banco" },
                { n: 3, I: Landmark, t: "Colar e pagar" },
              ].map(({ n, I, t }) => {
                const done = n === 1 && copied;
                return (
                  <div key={n} className={`flex flex-col items-center gap-1 ${done ? "text-success" : ""}`}>
                    <span className={`grid h-8 w-8 place-items-center rounded-full border ${done ? "border-success bg-success text-primary-foreground" : "border-border"}`}>
                      {done ? <Check className="h-4 w-4" /> : n}
                    </span>
                    <I className="h-4 w-4" />{t}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-center gap-3 border-t border-border pt-2.5 text-[12px] font-bold">
              <button
                disabled={!charge || timer.left <= 0}
                onClick={sharePixCode}
                className="flex min-h-10 items-center gap-1 rounded-md px-2 text-primary transition-colors hover:bg-primary/5 active:scale-[0.98] disabled:opacity-40"
                aria-label="Compartilhar somente o código PIX"
              >
                <Share2 className="h-4 w-4" />Compartilhar código
              </button>
              <span className="h-4 w-px bg-border" />
              <span className="flex items-center gap-1 text-muted-foreground"><Landmark className="h-4 w-4" />Abrir app do banco</span>
            </div>
          </div>
        </div>
      </main>
      <footer className="mx-auto mt-2 w-full max-w-[520px] border-t border-border bg-background px-4 py-5 text-center">
        <img src="/Design%20sem%20nome%20%2811%29.png" alt="TikTok Shop" width={158} height={48} loading="lazy" decoding="async" className="mx-auto h-10 w-[158px] object-contain" />
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-success" />Ambiente protegido</span>
          <span className="inline-flex items-center gap-1"><Landmark className="h-3.5 w-3.5" />Pagamento via PIX</span>
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">Confira os dados e o valor antes de confirmar o pagamento no aplicativo do seu banco.</p>
        <p className="mt-2 text-[10px] text-muted-foreground">© 2026 TikTok Shop · Todos os direitos reservados</p>
      </footer>
    </div>
  );
}
