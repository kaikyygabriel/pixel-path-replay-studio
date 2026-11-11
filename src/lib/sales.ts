/** Formats a catalog sales label as "12,5+ mil" (≥1000) or "300+" (below). */
export function parseSales(value: string | null): number {
  if (!value) return 0;
  const v = value.toLowerCase();
  const n = Number(v.replace(/[^\d,.]/g, "").replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(n)) return 0;
  return v.includes("mil") ? n * 1000 : n;
}
export function formatSales(value: string | null): string | null {
  if (!value) return null;
  const n = parseSales(value);
  if (n >= 1000) {
    const k = Math.floor(n / 100) / 10;
    return `${k.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}+ mil`;
  }
  return value.includes("+") ? value : `${n}`;
}
