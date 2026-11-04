/**
 * Internal payment model. These states are OUR states — not provider statuses.
 */
export type PaymentStatus = "pending" | "processing" | "paid" | "failed" | "cancelled" | "expired";

export type PixCharge = {
  paymentId: string;
  status: PaymentStatus;
  amountCents: number;
  /** PIX "copia e cola" payload issued by TriboPay. */
  pixCode: string;
  expiresAt: string;
};

export type CreatePixInput = {
  amountCents: number;
  description: string;
  customer: { name: string; email: string; phone: string; cpf: string };
  items: Array<{ title: string; quantity: number; unitPriceCents: number }>;
};

export type CreatePixResult =
  | { ok: true; charge: PixCharge }
  | { ok: false; reason: "unavailable" | "error"; message: string };

export interface PaymentProvider {
  readonly name: string;
  isConfigured(): boolean;
  createPixCharge(input: CreatePixInput): Promise<PixCharge>;
  getStatus(paymentId: string): Promise<PaymentStatus>;
  cancel?(paymentId: string): Promise<void>;
  parseWebhook(rawBody: string, headers: Headers): Promise<{ eventId: string; paymentId: string; status: PaymentStatus }>;
}

export class ProviderNotConfiguredError extends Error {
  constructor(provider: string) {
    super(`${provider} integration is not configured`);
  }
}
