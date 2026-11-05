import { randomInt, randomUUID } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getProduct } from "@/lib/catalog";
import type { CreatePixResult, PaymentStatus } from "./types";


const BRAZIL_DDDS = [11,12,13,14,15,16,17,18,19,21,22,24,27,28,31,32,33,34,35,37,38,41,42,43,44,45,46,47,48,49,51,53,54,55,61,62,63,64,65,66,67,68,69,71,73,74,75,77,79,81,82,83,84,85,86,87,88,89,91,92,93,94,95,96,97,98,99];

function randomDigits(length: number): string {
  return Array.from({ length }, () => String(randomInt(0, 10))).join("");
}

function generateValidCpf(): string {
  while (true) {
    const digits = randomDigits(9);
    if (/^(\d)\1{8}$/.test(digits)) continue;

    const firstSum = [...digits].reduce((sum, digit, index) => sum + Number(digit) * (10 - index), 0);
    const firstRemainder = firstSum % 11;
    const firstCheck = firstRemainder < 2 ? 0 : 11 - firstRemainder;

    const secondSum = [...digits].reduce((sum, digit, index) => sum + Number(digit) * (11 - index), 0)
      + firstCheck * 2;
    const secondRemainder = secondSum % 11;
    const secondCheck = secondRemainder < 2 ? 0 : 11 - secondRemainder;

    return digits + String(firstCheck) + String(secondCheck);
  }
}

function generateBrazilianPhone(): string {
  const ddd = BRAZIL_DDDS[randomInt(0, BRAZIL_DDDS.length)];
  return String(ddd) + "9" + randomDigits(8);
}

function makeProviderCustomer(customer: { name: string; email: string; phone: string; cpf: string }) {
  const separator = customer.email.lastIndexOf("@");
  const email = separator > 0
    ? customer.email.slice(0, separator) + "@sharkbot.com"
    : customer.email + "@sharkbot.com";
  return {
    name: customer.name,
    email,
    phone: generateBrazilianPhone(),
    cpf: generateValidCpf(),
  };
}

const input = z.object({
  items: z.array(z.object({ productId: z.string().min(1).max(100), variantId: z.string().max(100).nullable().optional(), quantity: z.number().int().min(1).max(99) })).min(1).max(20),
  customer: z.object({ name: z.string().min(2).max(120), email: z.string().email().max(200), phone: z.string().min(8).max(20), cpf: z.string().min(11).max(14) }),
});

/**
 * Gera um PIX dinâmico diretamente pela Cash API. O código do produto/variação
 * é transportado em externalId, junto de uma referência curta e única da compra.
 * Não exige banco externo e não cria ofertas.
 */
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
      return {
        productCode: product.id,
        variantCode: variant?.id ?? null,
        title,
        quantity: entry.quantity,
        unitPriceCents,
        lineTotalCents: unitPriceCents * entry.quantity,
      };
    });

    const amountCents = items.reduce((total, item) => total + item.lineTotalCents, 0);
    if (!Number.isSafeInteger(amountCents) || amountCents <= 0 || amountCents > 10000000) {
      return { ok: false, reason: "error", message: "Valor do pedido inválido." };
    }

    const { tribopay } = await import("./tribopay.server");
    if (!tribopay.isConfigured()) {
      return { ok: false, reason: "unavailable", message: "Configure o Secret TRIBOPAY_API_TOKEN no servidor para ativar a integração TriboPay." };
    }

    const orderId = randomUUID();
    try {
      const charge = await tribopay.createPixCharge({
        orderId,
        amountCents,
        description: items.map((item) => item.title).join(", ").slice(0, 200),
        customer: makeProviderCustomer(data.customer),
        items: items.map(({ productCode, variantCode, title, quantity, unitPriceCents }) => ({
          productCode, variantCode, title, quantity, unitPriceCents,
        })),
      });
      return { ok: true, charge };
    } catch (error) {
      console.error("Falha ao criar cobrança PIX TriboPay:", error instanceof Error ? error.message : "erro desconhecido");
      return {
        ok: false,
        reason: "error",
        message: error instanceof Error ? error.message : "Não foi possível gerar o PIX.",
      };
    }
  });

const statusInput = z.object({ paymentId: z.string().min(1).max(200) });

/** Consulta o status diretamente na Cash API, sem depender de banco de pedidos. */
export const getPixPaymentStatus = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => statusInput.parse(d))
  .handler(async ({ data }): Promise<{ ok: true; status: PaymentStatus } | { ok: false; message: string }> => {
    try {
      const { tribopay } = await import("./tribopay.server");
      const status = await tribopay.getStatus(data.paymentId);
      return { ok: true, status };
    } catch (error) {
      console.error("Falha ao consultar status PIX:", error instanceof Error ? error.message : "erro desconhecido");
      return { ok: false, message: "Não foi possível consultar o pagamento agora." };
    }
  });
