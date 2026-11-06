import { useEffect, useState } from "react";
import { Check, ShoppingCart } from "lucide-react";

type CartAddButtonProps = {
  productId: string;
  onClick: () => void;
  className?: string;
  label?: string;
};

export function CartAddButton({ productId, onClick, className = "", label = "Adicionar ao carrinho" }: CartAddButtonProps) {
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    let timeout: number | undefined;
    const handleAdded = (event: Event) => {
      const detail = (event as CustomEvent<{ productId?: string }>).detail;
      if (detail?.productId !== productId) return;
      setConfirmed(true);
      if (timeout) window.clearTimeout(timeout);
      timeout = window.setTimeout(() => setConfirmed(false), 2000);
    };
    window.addEventListener("shop-cart-added", handleAdded);
    return () => {
      window.removeEventListener("shop-cart-added", handleAdded);
      if (timeout) window.clearTimeout(timeout);
    };
  }, [productId]);

  return (
    <button
      type="button"
      aria-label={confirmed ? "Adicionado ao carrinho" : label}
      title={confirmed ? "Adicionado ao carrinho" : label}
      onClick={onClick}
      className={`grid h-9 w-10 place-items-center rounded-full transition-all duration-200 active:scale-90 ${confirmed ? "scale-105 bg-[#FE2C55] text-[#FFE4EA]" : "bg-primary-soft text-primary"} ${className}`}
    >
      {confirmed ? <Check className="h-5 w-5 animate-[cart-check-pop_220ms_ease-out]" strokeWidth={3} /> : <ShoppingCart className="h-5 w-5" />}
    </button>
  );
}
