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
  const rawBody = await response.text();
  let body: unknown = null;
  let isJson = false;

  if (rawBody.trim()) {
    try {
      body = JSON.parse(rawBody);
      isJson = true;
    } catch {
      // Gateways/proxies podem responder HTML ou texto, especialmente em 5xx.
    }
  }

  if (!response.ok) {
    if (isJson) {
      throw new Error("Cash API HTTP " + response.status + ": " + providerMessage(body));
    }
    if (response.status === 521) {
      throw new Error("Cash API HTTP 521: o servidor de origem da TriboPay não aceitou a conexão (Cloudflare). A requisição não chegou a uma resposta da API; verifique a disponibilidade do gateway.");
    }
    const contentType = response.headers.get("content-type") ?? "desconhecido";
    throw new Error("Cash API HTTP " + response.status + ": resposta não JSON (Content-Type: " + contentType + ").");
  }

  if (!isJson) {
    throw new Error("Cash API HTTP " + response.status + ": resposta vazia ou fora do formato JSON esperado.");
  }
  return body;
}

function makeExternalId(input: CreatePixInput): string {
  const suffix = input.orderId.replace(/-/g, "").slice(0, 8);
  const productRefs = [...new Set(input.items.map((item) =>
    item.variantCode ? item.productCode + ":" + item.variantCode : item.productCode
  ))];
  const reference = productRefs.length === 1
    ? productRefs[0]
    : "multi-" + productRefs.join("+");
  // Preserva o código real do produto e diferencia cobranças do mesmo produto.
  return (reference + "-" + suffix).slice(0, 120);
}

export const tribopay: PaymentProvider = {
  name: "TriboPay",
  isConfigured() {
    return Boolean(apiToken());
  },
  async createPixCharge(input: CreatePixInput): Promise<PixCharge> {
    const token = apiToken();
    if (!token) throw new ProviderNotConfiguredError(this.name);

    // Cash-In gera somente a cobrança PIX. Sem offer_hash/product_hash e sem /transactions.
    const payload = {
      amount: input.amountCents,
      externalId: makeExternalId(input),
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
    const pix = asObject(asObject(body)?["pix"]);
    const pixCode = typeof pix?["code"] === "string" && pix["code"].trim() ? pix["code"].trim() : null;
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
    throw new Error("Webhook TriboPay não habilitado: documentação de assinatura pendente.");
  },
};
