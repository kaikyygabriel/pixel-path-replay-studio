import { useEffect, useState } from "react";
import { Check } from "lucide-react";

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
      className={`grid h-12 w-full min-w-0 shrink-0 place-items-center rounded-full bg-[#FFF0F3] text-[#D9164B] transition-all duration-200 active:scale-95 ${confirmed ? "bg-[#FFE1E8] text-[#C81045]" : ""} ${className}`}
    >
      {confirmed ? <Check className="h-6 w-6 animate-[cart-check-pop_220ms_ease-out]" strokeWidth={3} /> : (
        <img src="/cart-add-icon.png" alt="" aria-hidden="true" draggable={false} className="h-[34px] w-[34px] object-contain" />
      )}
    </button>
  );
}
