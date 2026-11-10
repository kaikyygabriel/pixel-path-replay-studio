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
      className={`grid h-14 w-[92px] shrink-0 place-items-center rounded-full bg-[#FFF0F3] text-[#D9164B] transition-all duration-200 active:scale-95 ${confirmed ? "bg-[#FFE1E8] text-[#C81045]" : ""} ${className}`}
    >
      {confirmed ? <Check className="h-6 w-6 animate-[cart-check-pop_220ms_ease-out]" strokeWidth={3} /> : (
        <svg aria-hidden="true" viewBox="0 0 40 40" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 7h4l3.5 18.2a3.2 3.2 0 003.1 2.6h14.2a3.2 3.2 0 003.1-2.5L36 14H12" />
          <path d="M16 19h12M22 13v12" />
          <circle cx="17" cy="33" r="1.8" fill="currentColor" stroke="none" />
          <circle cx="29" cy="33" r="1.8" fill="currentColor" stroke="none" />
        </svg>
      )}
    </button>
  );
}
