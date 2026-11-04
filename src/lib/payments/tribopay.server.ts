import { randomUUID } from "node:crypto";
import { ProviderNotConfiguredError, type CreatePixInput, type PaymentProvider, type PixCharge } from "./types";

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

export const tribopay: PaymentProvider = {
  name: "TriboPay",
  isConfigured() {
    const token = (process.env['TRIBOPAY_API_TOKEN'] ?? process.env['TRIBOPAY_API_KEY'])?.trim();
    return Boolean(token);
  },
  async createPixCharge(input: CreatePixInput): Promise<PixCharge> {
    const token = (process.env['TRIBOPAY_API_TOKEN'] ?? process.env['TRIBOPAY_API_KEY'])?.trim();
    if (!token) throw new ProviderNotConfiguredError(this.name);


    // Cash-In gera um depósito PIX diretamente, sem usar /transactions
    // e sem enviar product_hash ou offer_hash.
    const externalId = randomUUID();
    const configuredPostback = process.env["TRIBOPAY_POSTBACK_URL"]?.trim();
    const appUrl = process.env["APP_URL"]?.trim() || process.env["VITE_APP_URL"]?.trim();
    const postbackUrl = configuredPostback || (appUrl
      ? `${appUrl.replace(/\\/$/, "")}/api/public/webhooks/tribopay`
      : undefined);

    const payload = {
      amount: input.amountCents,
      externalId,
      ...(postbackUrl ? { postbackUrl } : {}),
      method: "pix",
      transactionOrigin: "cashin",
      payer: {
        name: input.customer.name,
        email: input.customer.email,
        document: input.customer.cpf.replace(/\\D/g, ""),
        phone: { number: input.customer.phone.replace(/\\D/g, "") },
      },
    };

    const response = await fetch(`${CASH_API_BASE}/deposits/pix`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new Error(`Resposta inválida da Cash API (HTTP ${response.status}).`);
    }

    if (!response.ok) {
      throw new Error(`Cash API HTTP ${response.status}: ${providerMessage(body)}`);
    }

    const pix = asObject(asObject(body)?.pix);
    const pixCode = typeof pix?.code === "string" && pix.code.trim()
      ? pix.code.trim()
      : null;
    const paymentId = findString(body, ["id"]);

    if (!pixCode || !paymentId) {
      throw new Error("A Cash API respondeu, mas não retornou pix.code e id.");
    }

    const expiresAt = findDate(body, ["expiresAt", "expires_at", "expirationDate", "expiration_date"])
      ?? new Date(Date.now() + 15 * 60 * 1000).toISOString();

    return {
      paymentId,
      status: "pending",
      amountCents: input.amountCents,
      pixCode,
      expiresAt,
    };
  },
  async getStatus() {
    throw new Error("Consulta de status TriboPay ainda não foi implementada.");
  },
  async parseWebhook() {
    throw new Error("Validação de webhook TriboPay ainda não foi implementada.");
  },
};
