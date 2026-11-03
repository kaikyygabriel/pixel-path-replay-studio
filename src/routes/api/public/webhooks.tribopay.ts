import { createFileRoute } from "@tanstack/react-router";

/**
 * TriboPay webhook endpoint — PREPARATION ONLY.
 * Public route: it must authenticate every call by verifying the provider
 * signature (per official docs) before trusting anything in the body.
 * Until the adapter is implemented it rejects all calls and changes nothing.
 */
export const Route = createFileRoute("/api/public/webhooks/tribopay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { tribopay } = await import("@/lib/payments/tribopay.server");
        if (!tribopay.isConfigured()) {
          return new Response(JSON.stringify({ error: "not_configured" }), {
            status: 503,
            headers: { "content-type": "application/json" },
          });
        }
        try {
          const raw = await request.text();
          const event = await tribopay.parseWebhook(raw, request.headers);
          // TODO: idempotent update of the stored order by event.eventId / paymentId.
          void event;
          return new Response(null, { status: 204 });
        } catch {
          return new Response(null, { status: 401 });
        }
      },
    },
  },
});
