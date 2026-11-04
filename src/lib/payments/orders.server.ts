type OrderStatus = "pending" | "processing" | "paid" | "failed" | "cancelled" | "expired";

type OrderItemSnapshot = {
  product_id: string;
  variant_id: string | null;
  title: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
};

type OrderRecord = {
  order_id: string;
  status: OrderStatus;
  amount_cents: number;
  items: OrderItemSnapshot[];
  customer: { name: string; email: string; phone: string };
  provider_payment_id: string | null;
  pix_code: string | null;
  expires_at: string | null;
  provider_status: string | null;
  paid_at: string | null;
};

function supabaseConfig() {
  const url = process.env["SUPABASE_URL"]?.trim().replace(/\/+$/, "");
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"]?.trim();
  if (!url || !key) return null;
  return { url, key };
}

export function isOrderStorageConfigured() {
  return Boolean(supabaseConfig());
}

async function supabaseRequest(path: string, init: RequestInit = {}) {
  const config = supabaseConfig();
  if (!config) throw new Error("Armazenamento de pedidos não configurado.");
  const response = await fetch(config.url + "/rest/v1/" + path, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: "Bearer " + config.key,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Falha no banco de pedidos:", response.status, detail.slice(0, 300));
    throw new Error("Não foi possível salvar ou consultar o pedido.");
  }
  return response;
}

export async function createPendingOrder(input: {
  orderId: string;
  amountCents: number;
  items: OrderItemSnapshot[];
  customer: { name: string; email: string; phone: string };
}) {
  await supabaseRequest("orders", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      order_id: input.orderId,
      status: "pending",
      amount_cents: input.amountCents,
      items: input.items,
      customer: input.customer,
    }),
  });
}

export async function attachPixCharge(input: {
  orderId: string;
  paymentId: string;
  pixCode: string;
  expiresAt: string;
}) {
  await supabaseRequest("orders?order_id=eq." + encodeURIComponent(input.orderId), {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      provider_payment_id: input.paymentId,
      pix_code: input.pixCode,
      expires_at: input.expiresAt,
      provider_status: "pending",
    }),
  });
}

export async function markOrderCreationFailed(orderId: string) {
  await supabaseRequest("orders?order_id=eq." + encodeURIComponent(orderId) + "&status=neq.paid", {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ status: "failed", updated_at: new Date().toISOString() }),
  });
}

export async function getOrder(orderId: string): Promise<OrderRecord | null> {
  const response = await supabaseRequest(
    "orders?order_id=eq." + encodeURIComponent(orderId) + "&select=order_id,status,amount_cents,items,customer,provider_payment_id,pix_code,expires_at,provider_status,paid_at&limit=1",
    { method: "GET" },
  );
  const rows = await response.json() as OrderRecord[];
  return rows[0] ?? null;
}

export async function updateOrderPaymentStatus(orderId: string, status: OrderStatus) {
  const now = new Date().toISOString();
  await supabaseRequest("orders?order_id=eq." + encodeURIComponent(orderId) + "&status=neq.paid", {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      status,
      provider_status: status,
      updated_at: now,
      ...(status === "paid" ? { paid_at: now } : {}),
    }),
  });
}
