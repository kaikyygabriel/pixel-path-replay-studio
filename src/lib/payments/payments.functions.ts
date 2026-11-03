import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { CreatePixResult } from "./types";

const input = z.object({
  amountCents: z.number().int().positive().max(10_000_000),
  description: z.string().min(1).max(200),
  customer: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(200),
    phone: z.string().min(8).max(20),
    cpf: z.string().min(11).max(14),
  }),
});

/**
 * Creates a PIX charge through the configured provider. While TriboPay is in
 * preparation mode this always returns `unavailable` — it never fabricates a
 * PIX code or a payment confirmation. The amount should be recomputed from the
 * catalog server-side once orders are persisted.
 */
export const createPixPayment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }): Promise<CreatePixResult> => {
    const { tribopay } = await import("./tribopay.server");
    if (!tribopay.isConfigured()) {
      return { ok: false, reason: "unavailable", message: "Integração de pagamento ainda não configurada." };
    }
    try {
      const charge = await tribopay.createPixCharge(data);
      return { ok: true, charge };
    } catch (e) {
      console.error("createPixPayment failed", e);
      return { ok: false, reason: "error", message: "Não foi possível gerar o PIX." };
    }
  });
