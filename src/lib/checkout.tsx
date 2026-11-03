import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Customer = { name: string; phone: string; email: string };
export type Address = {
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  uf: string;
  cpf: string;
  isDefault: boolean;
};

export type CartItem = { key: string; productId: string; variantId: string | null; qty: number };

export type CheckoutState = {
  cart: CartItem[];
  favorites: string[];
  cartOpen: boolean;
  productId: string | null;
  variantId: string | null;
  qty: number;
  customer: Customer | null;
  address: Address | null;
  offerEndsAt: number | null;
};

const empty: CheckoutState = {
  cart: [],
  favorites: [],
  cartOpen: false,
  productId: null,
  variantId: null,
  qty: 1,
  customer: null,
  address: null,
  offerEndsAt: null,
};
const KEY = "checkout-state-v1";

type Ctx = { state: CheckoutState; update: (p: Partial<CheckoutState>) => void; ready: boolean };
const CheckoutCtx = createContext<Ctx | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CheckoutState>(empty);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) setState({ ...empty, ...JSON.parse(raw), cartOpen: false });
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) sessionStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);
  const update = (p: Partial<CheckoutState>) => setState((s) => ({ ...s, ...p }));
  return <CheckoutCtx.Provider value={{ state, update, ready }}>{children}</CheckoutCtx.Provider>;
}

export function useCheckout() {
  const c = useContext(CheckoutCtx);
  if (!c) throw new Error("useCheckout outside provider");
  return c;
}

/** Countdown to a timestamp, formatted hh:mm:ss or mm:ss. */
export function useCountdown(target: number | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, Math.floor(((target ?? now) - now) / 1000));
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return { left, hms: `${p(h)}:${p(m)}:${p(s)}`, mm: p(Math.floor(left / 60)), ss: p(s) };
}

/** Flash-offer end time, kept for the session (32 minutes from first visit). */
export function useOfferEnd() {
  const { state, update, ready } = useCheckout();
  useEffect(() => {
    if (ready && (!state.offerEndsAt || state.offerEndsAt < Date.now()))
      update({ offerEndsAt: Date.now() + 32 * 60 * 1000 });
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  return useCountdown(state.offerEndsAt);
}

/** Cart helpers: add merges same product+variant; qty 0 removes. */
export function addToCart(cart: CartItem[], productId: string, variantId: string | null, qty: number): CartItem[] {
  const key = `${productId}:${variantId ?? "-"}`;
  const hit = cart.find((i) => i.key === key);
  if (hit) return cart.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
  return [...cart, { key, productId, variantId, qty }];
}
export function setCartQty(cart: CartItem[], key: string, qty: number): CartItem[] {
  return qty <= 0 ? cart.filter((i) => i.key !== key) : cart.map((i) => (i.key === key ? { ...i, qty } : i));
}
