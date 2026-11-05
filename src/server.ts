import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

const MOBILE_USER_AGENT = /(?:android.*mobile|iphone|ipod|windows phone|blackberry|iemobile|opera mini|mobile safari)/i;
const TABLET_USER_AGENT = /(?:ipad|tablet|playbook|silk)/i;

function isMobileDeviceRequest(request: Request): boolean {
  const userAgent = request.headers.get("user-agent") ?? "";
  return MOBILE_USER_AGENT.test(userAgent) || TABLET_USER_AGENT.test(userAgent);
}

function isHtmlNavigation(request: Request): boolean {
  const accept = request.headers.get("accept") ?? "";
  const destination = request.headers.get("sec-fetch-dest");
  return request.method === "GET" && accept.includes("text/html") &&
    (destination === null || destination === "document");
}

// Lovable renders the project inside an editor preview, often from a desktop
// browser and inside an iframe. Keep the production access gate, but never
// block the development/preview hosts used to inspect the project.
function isPreviewRequest(request: Request): boolean {
  const hostname = new URL(request.url).hostname.toLowerCase();
  return hostname === "localhost" || hostname === "127.0.0.1" ||
    hostname.endsWith(".lovable.app") ||
    hostname.endsWith(".lovableproject.com") ||
    hostname.endsWith(".lovable.dev");
}

function applySecurityHeaders(response: Response, isDocument: boolean, allowEmbedding: boolean): Response {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  if (!allowEmbedding) headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  headers.set("X-Permitted-Cross-Domain-Policies", "none");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Content-Security-Policy", allowEmbedding
    ? "base-uri 'self'; object-src 'none'"
    : "base-uri 'self'; object-src 'none'; frame-ancestors 'none'");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  if (isDocument) {
    headers.set("Vary", "User-Agent");
    headers.set("Cache-Control", "no-store");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const documentNavigation = isHtmlNavigation(request);
    const previewRequest = isPreviewRequest(request);

    if (documentNavigation && !previewRequest && !isMobileDeviceRequest(request)) {
      return applySecurityHeaders(
        new Response(null, {
          status: 302,
          headers: { Location: "https://google.com" },
        }),
        true,
        false,
      );
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return applySecurityHeaders(normalized, documentNavigation, previewRequest);
    } catch (error) {
      console.error(error);
      return applySecurityHeaders(new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      }), documentNavigation, previewRequest);
    }
  },
};
