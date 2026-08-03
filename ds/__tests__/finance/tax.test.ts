import { describe, it, expect } from "vitest";
import {
  estimateDomesticGain,
  estimateForeignGain,
  estimateDividends,
  TRANSACTION_TAX_RATE,
  KR_BASIC_DEDUCTION,
} from "@/ds/finance/lib/tax";

describe("estimateDomesticGain", () => {
  it("charges only transaction tax for a small shareholder", () => {
    const r = estimateDomesticGain({
      buyAmount: 10_000_000,
      sellAmount: 12_000_000,
      isLargeShareholder: false,
    });
    expect(r.netGain).toBe(2_000_000);
    expect(r.capitalGainsTax).toBe(0);
    expect(r.transactionTax).toBeCloseTo(12_000_000 * TRANSACTION_TAX_RATE, 6); // 21,600
    expect(r.totalTax).toBeCloseTo(21_600, 6);
    expect(r.afterTax).toBeCloseTo(12_000_000 - 21_600, 6);
    expect(r.notes.join(" ")).toContain("소액주주");
  });

  it("applies the basic deduction before taxing a large shareholder", () => {
    // netGain 102.5M → taxable 100M (≤ 3억) → 22%
    const r = estimateDomesticGain({
      buyAmount: 100_000_000,
      sellAmount: 202_500_000,
      isLargeShareholder: true,
    });
    expect(r.taxable).toBe(100_000_000);
    expect(r.capitalGainsTax).toBeCloseTo(22_000_000, 4);
    expect(r.transactionTax).toBeCloseTo(202_500_000 * TRANSACTION_TAX_RATE, 4);
    expect(r.totalTax).toBeCloseTo(22_000_000 + 364_500, 4);
  });

  it("applies the higher bracket above the 3억 threshold", () => {
    // taxable 400M → 300M*22% + 100M*27.5% = 93.5M
    const r = estimateDomesticGain({
      buyAmount: 0,
      sellAmount: 402_500_000,
      isLargeShareholder: true,
    });
    expect(r.taxable).toBe(400_000_000);
    expect(r.capitalGainsTax).toBeCloseTo(93_500_000, 2);
  });

  it("subtracts commissions from the net gain", () => {
    const r = estimateDomesticGain({
      buyAmount: 1_000_000,
      sellAmount: 1_100_000,
      commissions: 10_000,
      isLargeShareholder: false,
    });
    expect(r.netGain).toBe(90_000);
    expect(r.afterTax).toBeCloseTo(1_100_000 - 1_100_000 * TRANSACTION_TAX_RATE - 10_000, 6);
  });

  it("never reports negative taxable amounts on a loss", () => {
    const r = estimateDomesticGain({
      buyAmount: 2_000_000,
      sellAmount: 1_000_000,
      isLargeShareholder: true,
    });
    expect(r.netGain).toBe(-1_000_000);
    expect(r.taxable).toBe(0);
    expect(r.capitalGainsTax).toBe(0);
  });
});

describe("estimateForeignGain", () => {
  it("taxes FX-inclusive gains at 22% after the deduction", () => {
    // buy 10,000 @1000 = 10M ; sell 10,000 @1300 = 13M → gain 3M → taxable 500K → tax 110K
    const r = estimateForeignGain({
      buyForeign: 10_000,
      sellForeign: 10_000,
      buyFx: 1000,
      sellFx: 1300,
    });
    expect(r.netGainKRW).toBe(3_000_000);
    expect(r.taxable).toBe(3_000_000 - KR_BASIC_DEDUCTION);
    expect(r.capitalGainsTax).toBeCloseTo(500_000 * 0.22, 4);
    expect(r.afterTaxKRW).toBeCloseTo(13_000_000 - 110_000, 4);
  });

  it("owes nothing when the gain is under the basic deduction", () => {
    const r = estimateForeignGain({
      buyForeign: 1_000,
      sellForeign: 1_000,
      buyFx: 1000,
      sellFx: 1100, // gain 100K < 250만
    });
    expect(r.netGainKRW).toBe(100_000);
    expect(r.taxable).toBe(0);
    expect(r.capitalGainsTax).toBe(0);
  });

  it("converts foreign commissions at the sell FX rate", () => {
    const r = estimateForeignGain({
      buyForeign: 1_000,
      sellForeign: 1_000,
      buyFx: 1000,
      sellFx: 1000,
      commissionsForeign: 10,
    });
    expect(r.netGainKRW).toBe(-10_000);
    expect(r.afterTaxKRW).toBe(1_000_000 - 10_000);
  });
});

describe("estimateDividends", () => {
  it("withholds 15.4% domestic and 15%+1.4% for US dividends", () => {
    const r = estimateDividends({ domestic: 1_000_000, us: 1_000_000 });
    expect(r.domesticTax).toBeCloseTo(154_000, 4);
    expect(r.domesticNet).toBeCloseTo(846_000, 4);
    expect(r.usLocalTax).toBeCloseTo(150_000, 4);
    expect(r.usKrAddon).toBeCloseTo(14_000, 4);
    expect(r.usNet).toBeCloseTo(836_000, 4);
    expect(r.totalTax).toBeCloseTo(318_000, 4);
    expect(r.totalNet).toBeCloseTo(1_682_000, 4);
  });

  it("handles zero inputs", () => {
    const r = estimateDividends({ domestic: 0, us: 0 });
    expect(r.totalTax).toBe(0);
    expect(r.totalNet).toBe(0);
  });
});
