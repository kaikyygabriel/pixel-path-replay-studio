import { ProviderNotConfiguredError, type CreatePixInput, type PaymentProvider, type PaymentStatus, type PixCharge } from "./types";

const CASH_API_BASE = "https://api.tribopay.com.br/api/public/cash";

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : null;
}

function findString(source: unknown, keys: string[], depth = 0): string | null {
  if (depth > 5) return null;
  const obj = asObject(source);
  if (!obj) return null;
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  for (const value of Object.values(obj)) {
    const found = findString(value, keys, depth + 1);
    if (found) return found;
  }
  return null;
}

function findDate(source: unknown, keys: string[], depth = 0): string | null {
  const raw = findString(source, keys, depth);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function providerMessage(body: unknown): string {
  return findString(body, ["message", "msg", "error", "description"]) ?? "A TriboPay não conseguiu criar a cobrança PIX.";
}

function mapProviderStatus(raw: string | null): PaymentStatus {
  switch ((raw ?? "").toLowerCase()) {
    case "pending": return "pending";
    case "processing": return "processing";
    case "paid":
    case "completed": return "paid";
    case "expired": return "expired";
    case "cancelled":
    case "canceled": return "cancelled";
    case "failed":
    case "rejected": return "failed";
    default: throw new Error("A TriboPay retornou um status de depósito não reconhecido.");
  }
}

function apiToken() {
  return (process.env["TRIBOPAY_API_TOKEN"] ?? process.env["TRIBOPAY_API_KEY"])?.trim();
}

async function readApiResponse(response: Response): Promise<unknown> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("Resposta inválida da Cash API (HTTP " + response.status + ").");
  }
  if (!response.ok) {
    throw new Error("Cash API HTTP " + response.status + ": " + providerMessage(body));
  }
  return body;
}

export const tribopay: PaymentProvider = {
  name: "TriboPay",
  isConfigured() {
    return Boolean(apiToken());
  },
  async createPixCharge(input: CreatePixInput): Promise<PixCharge> {
    const token = apiToken();
    if (!token) throw new ProviderNotConfiguredError(this.name);

    // O UUID do pedido é enviado como externalId. Não há product_hash/offer_hash
    // nem chamada a /transactions: cada carrinho gera somente um Cash-In PIX.
    const payload = {
      amount: input.amountCents,
      externalId: input.orderId,
      method: "pix",
      transactionOrigin: "cashin",
      payer: {
        name: input.customer.name,
        email: input.customer.email,
        document: input.customer.cpf.replace(/[^0-9]/g, ""),
        phone: { number: input.customer.phone.replace(/[^0-9]/g, "") },
      },
    };

    const response = await fetch(CASH_API_BASE + "/deposits/pix", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const body = await readApiResponse(response);
    const pix = asObject(asObject(body)?.pix);
    const pixCode = typeof pix?.code === "string" && pix.code.trim() ? pix.code.trim() : null;
    const paymentId = findString(body, ["id", "hash"]);

    if (!pixCode || !paymentId) {
      throw new Error("A Cash API respondeu, mas não retornou pix.code e id.");
    }

    const expiresAt = findDate(body, ["expiresAt", "expires_at", "expirationDate", "expiration_date"])
      ?? new Date(Date.now() + 15 * 60 * 1000).toISOString();

    return {
      orderId: input.orderId,
      paymentId,
      status: "pending",
      amountCents: input.amountCents,
      pixCode,
      expiresAt,
    };
  },
  async getStatus(paymentId: string): Promise<PaymentStatus> {
    const token = apiToken();
    if (!token) throw new ProviderNotConfiguredError(this.name);
    const response = await fetch(CASH_API_BASE + "/deposits/" + encodeURIComponent(paymentId), {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    const body = await readApiResponse(response);
    const rawStatus = findString(body, ["status"]);
    return mapProviderStatus(rawStatus);
  },
  async parseWebhook() {
    // Não aceitar postbacks até recebermos a especificação oficial de assinatura
    // e formato. A confirmação ativa é feita pela consulta autenticada de depósito.
    throw new Error("Webhook TriboPay não habilitado: documentação de assinatura pendente.");
  },
};
