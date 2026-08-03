import { describe, it, expect } from "vitest";
import {
  fmtNumber,
  fmtPct,
  fmtSignedPct,
  fmtSigned,
  priceColorClass,
  fmtKR억,
  fmtTime,
  fmtDate,
} from "@/ds/finance/lib/format";

describe("fmtNumber", () => {
  it("rounds and groups with ko-KR separators", () => {
    expect(fmtNumber(1234567.6)).toBe("1,234,568");
    expect(fmtNumber(0)).toBe("0");
  });

  it("appends a unit when provided", () => {
    expect(fmtNumber(1500, { unit: "원" })).toBe("1,500원");
  });
});

describe("fmtPct", () => {
  it("formats with default 2 decimals and a % suffix", () => {
    expect(fmtPct(3.14159)).toBe("3.14%");
    expect(fmtPct(-2.5)).toBe("-2.50%");
  });

  it("honors a custom decimal count", () => {
    expect(fmtPct(1.2345, 1)).toBe("1.2%");
  });
});

describe("fmtSignedPct", () => {
  it("prefixes + for positive values only", () => {
    expect(fmtSignedPct(1.5)).toBe("+1.50%");
    expect(fmtSignedPct(-1.5)).toBe("-1.50%");
    expect(fmtSignedPct(0)).toBe("0.00%");
  });
});

describe("fmtSigned", () => {
  it("prefixes + for positive values and groups digits", () => {
    expect(fmtSigned(12000)).toBe("+12,000");
    expect(fmtSigned(-12000)).toBe("-12,000");
    expect(fmtSigned(0)).toBe("0");
  });
});

describe("priceColorClass", () => {
  it("maps sign to bm color classes", () => {
    expect(priceColorClass(3)).toBe("bm-up");
    expect(priceColorClass(-3)).toBe("bm-down");
    expect(priceColorClass(0)).toBe("bm-muted");
  });
});

describe("fmtKR억", () => {
  it("keeps 억 under 1조", () => {
    expect(fmtKR억(500)).toBe("500억");
    expect(fmtKR억(9999)).toBe("9,999억");
  });

  it("switches to 조 at 10,000억 and trims trailing .0", () => {
    expect(fmtKR억(10_000)).toBe("1조");
    expect(fmtKR억(12_345)).toBe("1.2조");
  });
});

describe("fmtTime", () => {
  it("zero-pads hours and minutes", () => {
    expect(fmtTime(new Date(2026, 0, 1, 9, 5))).toBe("09:05");
    expect(fmtTime(new Date(2026, 0, 1, 15, 31))).toBe("15:31");
  });
});

describe("fmtDate", () => {
  it("formats MM-DD with the Korean weekday", () => {
    // 2024-01-01 was a Monday
    expect(fmtDate(new Date(2024, 0, 1))).toBe("01-01(월)");
    // 2026-01-03 is a Saturday
    expect(fmtDate(new Date(2026, 0, 3))).toBe("01-03(토)");
  });
});
