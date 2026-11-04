import { createFileRoute, Navigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Clock, Copy, Check, ArrowDown, Smartphone, Landmark, Share2, ShieldCheck, AlertTriangle } from "lucide-react";
import { useOrder } from "@/components/shop/order";
import { useCheckout, useCountdown } from "@/lib/checkout";
import { brl } from "@/lib/catalog";
import { createPixPayment } from "@/lib/payments/payments.functions";
import type { CreatePixResult } from "@/lib/payments/types";

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
  const { state } = useCheckout();
  const router = useRouter();
  const [result, setResult] = useState<CreatePixResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!order.product || !state.customer || !state.address) return;
    createPixPayment({
      data: {
        amountCents: order.totals.total,
        description: order.title,
        customer: { ...state.customer, cpf: state.address.cpf },
      },
    })
      .then(setResult)
      .catch(() => setResult({ ok: false, reason: "error", message: "Não foi possível gerar o PIX." }));
  }, [order.ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const charge = result?.ok ? result.charge : null;
  const timer = useCountdown(charge ? Date.parse(charge.expiresAt) : null);

  if (!order.ready) return <div className="app-frame" />;
  if (!order.product) return <Navigate to="/" />;
  if (!state.customer || !state.address) return <Navigate to="/checkout" />;

  async function copy() {
    if (!charge) return;
    try {
      await navigator.clipboard.writeText(charge.pixCode);
    } catch {
      /* fall back to manual long-press */
    }
    setCopied(true);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  }

  const unavailable = result && !result.ok;

  return (
    <div className="app-frame bg-surface pb-10">
      <header className="sticky top-0 z-30 flex h-[58px] items-center gap-3 border-b border-ink-foreground/10 bg-ink px-3 text-ink-foreground shadow-sm">
        <button aria-label="Voltar" onClick={() => router.history.back()} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-ink-foreground/20 bg-ink-foreground/10">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <img src="/Design%20sem%20nome%20%2811%29.png" alt="TikTok Shop" width={92} height={46} loading="eager" decoding="async" className="h-11 w-[92px] object-contain object-left" />
      </header>

      {toast && (
        <div className="fixed left-1/2 top-3 z-50 flex w-[86%] max-w-[420px] -translate-x-1/2 items-center gap-3 rounded-full bg-ink px-4 py-2.5 text-ink-foreground shadow-lg">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-success"><Check className="h-4 w-4" /></span>
          <div className="text-[13px] leading-tight"><b className="block text-[15px]">Código PIX copiado</b>Cole em “PIX Copia e Cola” no seu banco</div>
        </div>
      )}

      <main className="mx-auto w-full max-w-[520px] space-y-3 p-3 sm:space-y-4 sm:p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-primary/30 border-b-4 border-b-primary bg-primary-soft p-3.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
            {unavailable ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-bold">{unavailable ? "Pagamento indisponível" : charge ? "Pedido reservado" : "Gerando PIX…"}</div>
            <div className="text-[13px] text-muted-foreground">{unavailable ? result.message : "Pague o PIX antes que expire"}</div>
          </div>
          {charge && (
            <div className="flex items-center gap-1 text-[22px] font-extrabold">
              <span className="rounded-lg bg-ink px-2 py-1 text-ink-foreground">{timer.mm}</span>:
              <span className="rounded-lg bg-ink px-2 py-1 text-ink-foreground">{timer.ss}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm">
          <div>
            <div className="text-[12px] font-bold tracking-wide text-muted-foreground">TOTAL A PAGAR</div>
            <div className="text-[clamp(1.65rem,7vw,1.9rem)] font-extrabold leading-tight tabular-nums">{brl(order.totals.total)}</div>
          </div>
          <span className="rounded-full bg-primary-soft px-3 py-1 text-[13px] font-bold text-primary">PIX à vista</span>
        </div>

        {!copied && (
          <div className="flex gap-3 rounded-2xl border border-primary/30 bg-primary-soft p-3.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Copy className="h-4 w-4" /></span>
            <div>
              <div className="text-[15px] font-bold">Para pagar, você precisa copiar o código PIX</div>
              <div className="text-[13px] text-muted-foreground">Toque no botão abaixo do QR Code e cole no app do seu banco.</div>
            </div>
          </div>
        )}

        <section className="rounded-2xl bg-card p-4 text-center shadow-sm sm:p-5" aria-label="QR Code PIX">
          <div className="mx-auto flex aspect-square w-full max-w-[280px] items-center justify-center rounded-2xl border border-border bg-white p-3 sm:p-4">
            {charge ? (
              <QRCodeSVG value={charge.pixCode} size={256} level="M" marginSize={1} style={{ width: "100%", height: "auto", maxWidth: "256px" }} />
            ) : (
              <span className="px-3 text-[12px] text-muted-foreground">{unavailable ? "QR Code será disponibilizado quando a integração de pagamento estiver configurada." : "Gerando seu QR Code…"}</span>
            )}
          </div>
          <p className="mt-3 text-[13px] text-muted-foreground">Abra o aplicativo do seu banco e escaneie o código</p>
        </section>

        <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-border px-3.5 py-2.5 text-[13px]">
            {copied ? (
              <span className="flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-[11px] font-bold text-primary-foreground"><Check className="h-3 w-3" />Código copiado</span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground"><Clock className="h-3 w-3" />FALTA 1 PASSO</span>
            )}
            <span className="text-muted-foreground">{charge ? "Pedido reservado" : "Aguardando PIX"}</span>
          </div>
          <div className="p-3.5">
            <h2 className="text-[18px] font-extrabold">Copie o código PIX para finalizar</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">Copie o código, cole em PIX Copia e Cola no aplicativo do seu banco e confirme o pagamento. Depois, volte aqui para acompanhar a confirmação.</p>
            {!copied && <ArrowDown className="mx-auto mt-2 h-4 w-4 text-primary" />}
            <button
              onClick={copy}
              disabled={!charge}
              className={`mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[17px] font-extrabold text-primary-foreground ring-4 disabled:opacity-40 ${copied ? "bg-success ring-success/25" : "bg-primary ring-primary/25"}`}
            >
              {copied ? <><span className="grid h-7 w-7 place-items-center rounded-full bg-background/30"><Check className="h-4 w-4" /></span>Código copiado</> : <><Copy className="h-5 w-5" />Copiar código PIX</>}
            </button>
            <div className="mt-3 rounded-xl bg-surface p-3">
              <div className="flex items-center justify-between text-[12px] font-bold">
                <span className="tracking-wide text-muted-foreground">PIX COPIA E COLA</span>
                <button onClick={copy} disabled={!charge} className={copied ? "text-success" : "text-primary disabled:opacity-40"}>{copied ? "Copiado" : "Copiar"}</button>
              </div>
              <div className="mt-2 max-h-32 overflow-y-auto break-all [overflow-wrap:anywhere] rounded-lg border border-border bg-card p-2.5 text-left font-mono text-[10px] leading-relaxed sm:text-[11.5px]">
                {charge ? charge.pixCode : <span className="font-sans italic text-muted-foreground">O código PIX aparecerá aqui quando a integração de pagamento estiver ativa.</span>}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">Não copiou? <b className="text-foreground">Toque e segure</b> no código e escolha <b className="text-foreground">Copiar.</b></p>
            </div>
            <div className="mt-4 grid grid-cols-3 text-center text-[12px] text-muted-foreground">
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
            <div className="mt-4 flex items-center justify-center gap-3 border-t border-border pt-3 text-[13px] font-bold">
              <button
                disabled={!charge}
                onClick={() => charge && navigator.share?.({ text: charge.pixCode }).catch(() => {})}
                className="flex items-center gap-1 text-primary disabled:opacity-40"
              >
                <Share2 className="h-4 w-4" />Compartilhar código
              </button>
              <span className="h-4 w-px bg-border" />
              <span className="flex items-center gap-1 text-muted-foreground"><Landmark className="h-4 w-4" />Abrir app do banco</span>
            </div>
          </div>
        </div>
        <p className="flex items-center justify-center gap-1.5 py-2 text-[11.5px] text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-success" />Pagamento processado com segurança · Confirmação automática</p>
      </main>
      <footer className="mx-auto mt-2 w-full max-w-[520px] border-t border-border bg-background px-4 py-5 text-center">
        <img src="/logo%20estendida%20tiktok%20shop.png" alt="TikTok Shop" width={170} height={52} loading="lazy" decoding="async" className="mx-auto h-10 w-[150px] object-contain" />
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
