import { createPixPayment } from "./payments.functions";
import type { CreatePixResult } from "./types";

export type PixPaymentData = {
  items: Array<{ productId: string; variantId: string | null; quantity: number }>;
  customer: { name: string; email: string; phone: string; cpf: string };
};

const pixRequestsInFlight = new Map<string, Promise<CreatePixResult>>();

export function getPixRequestKey(data: PixPaymentData): string {
  const value = JSON.stringify(data);
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36) + "-" + value.length.toString(36);
}

/** Reutiliza a cobrança válida ou a requisição em andamento para evitar espera e duplicidade. */
export function createPixPaymentOnce(requestKey: string, data: PixPaymentData): Promise<CreatePixResult> {
  const cacheKey = `multi-achadinhos:pix-charge:v3:${requestKey}`;
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as CreatePixResult;
      if (parsed?.ok && parsed.charge?.paymentId && parsed.charge?.pixCode && Date.parse(parsed.charge.expiresAt) > Date.now()) {
        return Promise.resolve(parsed);
      }
    }
  } catch {
    // Se o armazenamento estiver indisponível, a chamada ainda pode prosseguir.
  }

  const existing = pixRequestsInFlight.get(requestKey);
  if (existing) return existing;

  const request = createPixPayment({ data })
    .then((result) => {
      if (result.ok) {
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(result));
        } catch {
          // A cobrança continua disponível no estado atual da página.
        }
      }
      return result;
    })
    .finally(() => pixRequestsInFlight.delete(requestKey));

  pixRequestsInFlight.set(requestKey, request);
  return request;
}
