import { ProviderNotConfiguredError, type PaymentProvider } from "./types";

/**
 * TriboPay adapter — PREPARATION ONLY.
 *
 * No endpoints, headers, payloads or status values are implemented here on
 * purpose: they must come from TriboPay's official documentation. Until then
 * every method throws ProviderNotConfiguredError and no request is made.
 *
 * Server-only. Credentials are read from process.env inside methods and must
 * never be exposed through VITE_ variables. Placeholder names (to be
 * reconciled with the docs): TRIBOPAY_API_BASE_URL, TRIBOPAY_API_KEY,
 * TRIBOPAY_WEBHOOK_SECRET.
 */
export const tribopay: PaymentProvider = {
  name: "TriboPay",
  isConfigured() {
    // Stays false until the adapter is implemented against official docs,
    // even if env vars are present.
    return false;
  },
  async createPixCharge() {
    throw new ProviderNotConfiguredError(this.name);
  },
  async getStatus() {
    throw new ProviderNotConfiguredError(this.name);
  },
  async parseWebhook() {
    // TODO(docs): verify signature with TRIBOPAY_WEBHOOK_SECRET per official spec,
    // dedupe by event id (idempotency), map provider status -> PaymentStatus.
    throw new ProviderNotConfiguredError(this.name);
  },
};
