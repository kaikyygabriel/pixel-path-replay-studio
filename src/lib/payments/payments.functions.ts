import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getProduct } from "@/lib/catalog";
import type { CreatePixResult } from "./types";

const input = z.object({
  items: z.array(z.object({
    productId: z.string().min(1).max(100),
    variantId: z.string().max(100).nullable().optional(),
    quantity: z.number().int().min(1).max(99),
  })).min(1).max(20),
  customer: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(200),
    phone: z.string().min(8).max(20),
    cpf: z.string().min(11).max(14),
  }),
});

/** O servidor recalcula os preços usando o catálogo; o navegador não define o valor cobrado. */
export const createPixPayment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }): Promise<CreatePixResult> => {
    const items = data.items.map((entry) => {
      const product = getProduct(entry.productId);
      if (!product) throw new Error("Produto não encontrado no catálogo.");
      const variant = entry.variantId
        ? product.variants.find((candidate) => candidate.id === entry.variantId)
        : null;
      if (entry.variantId && !variant) throw new Error("Variação de produto inválida.");
      if (product.variants.length > 0 && !variant) throw new Error("Selecione uma variação do produto.");
      const unitPriceCents = variant?.price ?? product.price;
      const title = variant
        ? `${product.checkoutTitle} · ${variant.color}`
        : product.checkoutTitle;
      return {
        title,
        quantity: entry.quantity,
        unitPriceCents,
        lineTotalCents: unitPriceCents * entry.quantity,
      };
    });

    const amountCents = items.reduce((total, item) => total + item.lineTotalCents, 0);
    if (!Number.isSafeInteger(amountCents) || amountCents <= 0 || amountCents > 10_000_000) {
      return { ok: false, reason: "error", message: "Valor do pedido inválido." };
    }

    const { tribopay } = await import("./tribopay.server");
    if (!tribopay.isConfigured()) {
      return { ok: false, reason: "unavailable", message: "Configure o Secret TRIBOPAY_API_TOKEN no servidor para ativar a integração TriboPay." };
    }

    try {
      const charge = await tribopay.createPixCharge({
        amountCents,
        description: items.map((item) => item.title).join(", ").slice(0, 200),
        customer: data.customer,
        items: items.map(({ title, quantity, unitPriceCents }) => ({ title, quantity, unitPriceCents })),
      });
      return { ok: true, charge };
    } catch (error) {
      // Mensagem sanitizada: nunca registrar token, URL autenticada ou corpo completo da API.
      console.error("Falha ao criar cobrança PIX TriboPay:", error instanceof Error ? error.message : "erro desconhecido");
      return {
        ok: false,
        reason: "error",
        message: error instanceof Error ? error.message : "Não foi possível gerar o PIX.",
      };
    }
  });
