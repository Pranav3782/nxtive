import { describe, it, expect } from "vitest";
import { formatCurrency, toPaise, fromPaise } from "@/utils/format-currency";

describe("formatCurrency utility", () => {
  it("formats integer amounts in INR currency format", () => {
    const formatted = formatCurrency(1499);
    expect(formatted).toContain("1,499");
  });

  it("formats zero correctly", () => {
    const formatted = formatCurrency(0);
    expect(formatted).toContain("0");
  });

  it("converts INR rupees to paise for Razorpay", () => {
    expect(toPaise(799)).toBe(79900);
    expect(toPaise(1499.50)).toBe(149950);
  });

  it("converts paise back to rupees", () => {
    expect(fromPaise(79900)).toBe(799);
    expect(fromPaise(149950)).toBe(1499.5);
  });
});
