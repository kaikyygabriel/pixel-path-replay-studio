import { describe, expect, it } from "vitest";
import { activeFlashDeadline } from "@/lib/flash-offers";

describe("configured flash offers", () => {
  it("does not turn ordinary products into flash offers", () => {
    expect(activeFlashDeadline({}, 1000)).toBeNull();
  });
  it("preserves distinct configured deadlines for different products", () => {
    expect(activeFlashDeadline({ flashOffer: { endsAt: 21600000 } }, 1000)).toBe(21600000);
    expect(activeFlashDeadline({ flashOffer: { endsAt: 54000000 } }, 1000)).toBe(54000000);
  });
  it("expires without renewing the countdown", () => {
    expect(activeFlashDeadline({ flashOffer: { endsAt: 2000 } }, 2000)).toBeNull();
    expect(activeFlashDeadline({ flashOffer: { endsAt: 2000 } }, 3000)).toBeNull();
  });
});