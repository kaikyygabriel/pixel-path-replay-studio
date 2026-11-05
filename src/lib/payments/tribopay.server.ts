import { ProviderNotConfiguredError, type CreatePixInput, type PaymentProvider, type PixCharge } from "./types";

const API_BASE = "https://api.tribopay.com.br/api/public/v1";
// Código do produto-mãe no painel TriboPay: todos os itens do carrinho
// são registrados sob este produto, mantendo título, preço e quantidade individuais.
const PARENT_PRODUCT_HASH = "hnz0ihobyy";

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


    // Token permanece exclusivamente no servidor. Nunca registrar esta URL,
    // pois a TriboPay recebe a credencial como query param.
    const url = new URL(`${API_BASE}/transactions`);
    url.searchParams.set("api_token", token);

    const payload = {
      amount: input.amountCents,
      payment_method: "pix",
      customer: {
        name: input.customer.name,
        email: input.customer.email,
        phone_number: input.customer.phone.replace(/\D/g, ""),
        document: input.customer.cpf.replace(/\D/g, ""),
      },
      cart: input.items.map((item) => ({
        // A documentação define offer_hash somente no nível da transação.
        // Dentro de cada item do cart deve existir apenas o product_hash.
        product_hash: PARENT_PRODUCT_HASH,
        title: item.title,
        price: item.unitPriceCents,
        quantity: item.quantity,
        operation_type: 1,
        tangible: true,
      })),
    };

    // Única operação realizada aqui: POST /transactions. Não há chamadas para
    // endpoints de criação/edição de produtos ou ofertas; os hashes abaixo são
    // referências fixas de registros já existentes no painel.
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new Error(`Resposta inválida da TriboPay (HTTP ${response.status}).`);
    }

    if (!response.ok) {
      // Não incluir token nem URL na mensagem/console.
      throw new Error(`TriboPay HTTP ${response.status}: ${providerMessage(body)}`);
    }

    const pixCode = findString(body, [
      "pix_code", "pixCode", "pix_copy_paste", "pixCopyPaste",
      "copy_paste", "copyPaste", "qr_code_text", "qrCodeText",
      "brcode", "emv", "payload", "qr_code", "qrcode", "pix_qr_code",
    ]);
    const paymentId = findString(body, [
      "transaction_hash", "transactionHash", "hash", "payment_id", "paymentId",
    ]);

    if (!pixCode || !paymentId) {
      // Resposta sem os campos necessários não deve ser apresentada como PIX válido.
      throw new Error("A TriboPay respondeu, mas não retornou o identificador e o código PIX esperados.");
    }

    const expiresAt = findDate(body, [
      "expires_at", "expiresAt", "expiration_date", "expirationDate", "expire_at", "valid_until",
    ]) ?? new Date(Date.now() + 15 * 60 * 1000).toISOString();

    return {
      orderId: input.orderId,
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
