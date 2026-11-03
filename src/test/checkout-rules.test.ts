import { describe, expect, it } from "vitest";
import { orderTotals, discountPct, brl } from "@/lib/catalog";
import { isValidCpf, maskCep } from "@/lib/br";

describe("checkout rules", () => {
  it("towel set totals: R$128,41 original, R$37,98 paid, R$90,43 discount, free shipping", () => {
    const t = orderTotals(3798, 12841);
    expect(t).toEqual({ subtotal: 3798, original: 12841, discount: 9043, shipping: 0, total: 3798 });
    expect(brl(t.discount)).toBe("R$ 90,43");
  });
  it("towel set discount shows 70%", () => expect(discountPct(3798, 12841)).toBe(70));
  it("CPF checksum", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("111.111.111-11")).toBe(false);
  });
  it("CEP mask", () => expect(maskCep("01310100")).toBe("01310-100"));
});
