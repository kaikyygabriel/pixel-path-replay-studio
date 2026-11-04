import { randomUUID } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getProduct } from "@/lib/catalog";
import { attachPixCharge, createPendingOrder, getOrder, isOrderStorageConfigured, markOrderCreationFailed, updateOrderPaymentStatus } from "./orders.server";
import type { CreatePixResult, PaymentStatus } from "./types";

const input = z.object({
  items: z.array(z.object({ productId: z.string().min(1).max(100), variantId: z.string().max(100).nullable().optional(), quantity: z.number().int().min(1).max(99) })).min(1).max(20),
  customer: z.object({ name: z.string().min(2).max(120), email: z.string().email().max(200), phone: z.string().min(8).max(20), cpf: z.string().min(11).max(14) }),
});

/** Cria o pedido persistente e só então solicita o PIX com o UUID em externalId. */
export const createPixPayment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }): Promise<CreatePixResult> => {
    const items = data.items.map((entry) => {
      const product = getProduct(entry.productId);
      if (!product) throw new Error("Produto não encontrado no catálogo.");
      const variant = entry.variantId ? product.variants.find((candidate) => candidate.id === entry.variantId) : null;
      if (entry.variantId && !variant) throw new Error("Variação de produto inválida.");
      if (product.variants.length > 0 && !variant) throw new Error("Selecione uma variação do produto.");
      const unitPriceCents = variant?.price ?? product.price;
      const title = variant ? product.checkoutTitle + " · " + variant.color : product.checkoutTitle;
      return { productId: product.id, variantId: variant?.id ?? null, title, quantity: entry.quantity, unitPriceCents, lineTotalCents: unitPriceCents * entry.quantity };
    });
    const amountCents = items.reduce((total, item) => total + item.lineTotalCents, 0);
    if (!Number.isSafeInteger(amountCents) || amountCents <= 0 || amountCents > 10000000) return { ok: false, reason: "error", message: "Valor do pedido inválido." };
    const { tribopay } = await import("./tribopay.server");
    if (!tribopay.isConfigured()) return { ok: false, reason: "unavailable", message: "Configure o Secret TRIBOPAY_API_TOKEN no servidor para ativar a integração TriboPay." };
    if (!isOrderStorageConfigured()) return { ok: false, reason: "unavailable", message: "O banco de pedidos ainda não está configurado. Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no servidor." };
    const orderId = randomUUID();
    try {
      await createPendingOrder({
        orderId, amountCents,
        items: items.map((item) => ({ product_id: item.productId, variant_id: item.variantId, title: item.title, quantity: item.quantity, unit_price_cents: item.unitPriceCents, line_total_cents: item.lineTotalCents })),
        customer: { name: data.customer.name, email: data.customer.email, phone: data.customer.phone },
      });
    } catch (error) {
      console.error("Não foi possível persistir o pedido antes do PIX:", error instanceof Error ? error.message : "erro desconhecido");
      return { ok: false, reason: "unavailable", message: "Não foi possível registrar o pedido. Nenhuma cobrança PIX foi solicitada." };
    }
    try {
      const charge = await tribopay.createPixCharge({ orderId, amountCents, description: items.map((item) => item.title).join(", ").slice(0, 200), customer: data.customer, items: items.map(({ title, quantity, unitPriceCents }) => ({ title, quantity, unitPriceCents })) });
      await attachPixCharge({ orderId, paymentId: charge.paymentId, pixCode: charge.pixCode, expiresAt: charge.expiresAt });
      return { ok: true, charge };
    } catch (error) {
      await markOrderCreationFailed(orderId).catch(() => undefined);
      console.error("Falha ao criar/vincular cobrança PIX TriboPay:", error instanceof Error ? error.message : "erro desconhecido");
      return { ok: false, reason: "error", message: error instanceof Error ? error.message : "Não foi possível gerar o PIX." };
    }
  });

const orderStatusInput = z.object({ orderId: z.string().uuid() });

/** Consulta o depósito na Cash API e sincroniza o status do pedido no banco. */
export const getOrderPaymentStatus = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => orderStatusInput.parse(d))
  .handler(async ({ data }): Promise<{ ok: true; status: PaymentStatus } | { ok: false; message: string }> => {
    try {
      const order = await getOrder(data.orderId);
      if (!order) return { ok: false, message: "Pedido não encontrado." };
      if (order.status === "paid") return { ok: true, status: "paid" };
      if (!order.provider_payment_id) return { ok: true, status: order.status };
      const { tribopay } = await import("./tribopay.server");
      const status = await tribopay.getStatus(order.provider_payment_id);
      if (status !== order.status) await updateOrderPaymentStatus(data.orderId, status);
      return { ok: true, status };
    } catch (error) {
      console.error("Falha ao consultar status do pedido:", error instanceof Error ? error.message : "erro desconhecido");
      return { ok: false, message: "Não foi possível consultar o pagamento agora." };
    }
  });
