/**
 * Internal payment model. These states are OUR states — they are not
 * TriboPay status values. A verified mapping from provider statuses goes in
 * the TriboPay adapter once the official documentation is available.
 */
export type PaymentStatus = "pending" | "processing" | "paid" | "failed" | "cancelled" | "expired";

export type PixCharge = {
  paymentId: string;
  status: PaymentStatus;
  amountCents: number;
  /** PIX "copia e cola" payload, issued by the provider. */
  pixCode: string;
  expiresAt: string; // ISO
};

export type CreatePixInput = {
  amountCents: number;
  description: string;
  customer: { name: string; email: string; phone: string; cpf: string };
};

/** Result returned to the browser. `unavailable` = provider not configured yet. */
export type CreatePixResult =
  | { ok: true; charge: PixCharge }
  | { ok: false; reason: "unavailable" | "error"; message: string };

export interface PaymentProvider {
  readonly name: string;
  isConfigured(): boolean;
  createPixCharge(input: CreatePixInput): Promise<PixCharge>;
  getStatus(paymentId: string): Promise<PaymentStatus>;
  cancel?(paymentId: string): Promise<void>;
  /** Verify signature + parse a webhook. Must throw on invalid signature. */
  parseWebhook(rawBody: string, headers: Headers): Promise<{ eventId: string; paymentId: string; status: PaymentStatus }>;
}

export class ProviderNotConfiguredError extends Error {
  constructor(provider: string) {
    super(`${provider} integration is not configured`);
  }
}
