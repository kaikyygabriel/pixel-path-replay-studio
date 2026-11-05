import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

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
export type CheckoutItem = { productId: string; variantId: string | null; qty: number };

export type CheckoutState = {
  cart: CartItem[];
  checkoutItems: CheckoutItem[];
  favorites: string[];
  following: boolean;
  cartOpen: boolean;
  searchTerm: string;
  productId: string | null;
  variantId: string | null;
  qty: number;
  customer: Customer | null;
  address: Address | null;
  offerEndsAt: number | null;
  offerCycleStartedAt: number | null;
};

const empty: CheckoutState = {
  cart: [],
  checkoutItems: [],
  favorites: [],
  following: false,
  cartOpen: false,
  searchTerm: "",
  productId: null,
  variantId: null,
  qty: 1,
  customer: null,
  address: null,
  offerEndsAt: null,
  offerCycleStartedAt: null,
};
const KEY = "checkout-state-v2";
const LEGACY_KEY = "checkout-state-v1";

type Ctx = { state: CheckoutState; update: (p: Partial<CheckoutState>) => void; ready: boolean };
const CheckoutCtx = createContext<Ctx | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CheckoutState>(empty);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY) ?? sessionStorage.getItem(LEGACY_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<CheckoutState>;
        setState({ ...empty, ...saved, cartOpen: false });
      }
    } catch {
      /* ignore invalid or unavailable session storage */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const now = Date.now();
    const cycleStarted = state.offerCycleStartedAt ?? now;
    const dailyReset = now - cycleStarted >= 24 * 60 * 60 * 1000;
    if (dailyReset || !state.offerEndsAt || state.offerEndsAt <= now) {
      setState((current) => ({
        ...current,
        offerCycleStartedAt: dailyReset || !current.offerCycleStartedAt ? now : current.offerCycleStartedAt,
        offerEndsAt: now + 55 * 60 * 1000,
      }));
      return;
    }
    const timeout = window.setTimeout(() => {
      setState((current) => current.offerEndsAt && current.offerEndsAt <= Date.now()
        ? { ...current, offerEndsAt: Date.now() + 55 * 60 * 1000 }
        : current);
    }, state.offerEndsAt - now + 25);
    return () => window.clearTimeout(timeout);
  }, [ready, state.offerEndsAt, state.offerCycleStartedAt]);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* Storage may be unavailable or full; checkout remains usable in memory. */
    }
  }, [state, ready]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== KEY || !event.newValue) return;
      try {
        setState({ ...empty, ...JSON.parse(event.newValue), cartOpen: false });
      } catch {
        /* Ignore malformed updates from another tab. */
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const update = useCallback((p: Partial<CheckoutState>) => setState((s) => ({ ...s, ...p })), []);
  const value = useMemo(() => ({ state, update, ready }), [state, update, ready]);
  return <CheckoutCtx.Provider value={value}>{children}</CheckoutCtx.Provider>;
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

/** Shared flash-offer end time; initialized and renewed centrally for the whole visit. */
export function useOfferEnd() {
  const { state } = useCheckout();
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
