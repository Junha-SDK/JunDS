import { describe, it, expect } from "vitest";
import { heatmapColor } from "@/ds/finance/lib/heatmapColor";
import { buildFlow } from "@/ds/finance/lib/investorFlow";
import {
  buildAccentTokens,
  isValidHex,
  DEFAULT_ACCENT,
} from "@/ds/finance/lib/accentColor";

describe("heatmapColor", () => {
  it("returns neutral gray near zero", () => {
    expect(heatmapColor(0)).toBe("hsl(220, 10%, 52%)");
    expect(heatmapColor(0.05)).toBe("hsl(220, 10%, 52%)");
    expect(heatmapColor(-0.09)).toBe("hsl(220, 10%, 52%)");
  });

  it("uses red hue (358) for gains and blue hue (218) for losses", () => {
    expect(heatmapColor(2)).toMatch(/^hsl\(358, /);
    expect(heatmapColor(-2)).toMatch(/^hsl\(218, /);
  });

  it("saturates at the scale bound — larger moves clamp to the same color", () => {
    expect(heatmapColor(6)).toBe(heatmapColor(100));
    expect(heatmapColor(-6)).toBe(heatmapColor(-100));
  });

  it("hits the exact endpoints at full scale", () => {
    expect(heatmapColor(6)).toBe("hsl(358, 92%, 44%)");
    expect(heatmapColor(-6)).toBe("hsl(218, 92%, 42%)");
  });

  it("deepens as magnitude grows", () => {
    // lightness falls with |pct|: 3% → 58-14*0.5 = 51 ; 6% → 44
    expect(heatmapColor(3)).toBe("hsl(358, 84%, 51%)");
  });
});

describe("buildFlow", () => {
  it("builds the requested number of days in MM-DD order", () => {
    const flow = buildFlow("삼성전자", 5);
    expect(flow).toHaveLength(5);
    for (const d of flow) expect(d.date).toMatch(/^\d{2}-\d{2}$/);
    // last entry is the anchor date 2026-05-06
    expect(flow[flow.length - 1].date).toBe("05-06");
  });

  it("is deterministic per name", () => {
    expect(buildFlow("삼성전자", 10)).toEqual(buildFlow("삼성전자", 10));
  });

  it("varies by name (different hash seeds)", () => {
    const a = buildFlow("삼성전자", 10);
    const b = buildFlow("카카오", 10);
    expect(a).not.toEqual(b);
  });

  it("keeps integer 억원 values", () => {
    for (const d of buildFlow("현대차", 8)) {
      expect(Number.isInteger(d.foreign)).toBe(true);
      expect(Number.isInteger(d.institution)).toBe(true);
      expect(Number.isInteger(d.individual)).toBe(true);
    }
  });
});

describe("isValidHex", () => {
  it("accepts 6-digit and 3-digit hex, with or without #", () => {
    expect(isValidHex("#1a2b3c")).toBe(true);
    expect(isValidHex("1a2b3c")).toBe(true);
    expect(isValidHex("#abc")).toBe(true);
    expect(isValidHex("ABC")).toBe(true); // lowercased internally
  });

  it("rejects malformed input", () => {
    expect(isValidHex("")).toBe(false);
    expect(isValidHex("#12")).toBe(false);
    expect(isValidHex("#12345g")).toBe(false);
    expect(isValidHex("not-a-color")).toBe(false);
  });
});

describe("buildAccentTokens", () => {
  it("normalizes the accent and derives rgba soft backgrounds", () => {
    const t = buildAccentTokens("FF0000");
    expect(t.accent).toBe("#ff0000");
    expect(t.softBgLight).toBe("rgba(255, 0, 0, 0.1)");
    expect(t.softBgDark).toBe("rgba(255, 0, 0, 0.18)");
    expect(t.gradient).toContain("#ff0000");
    expect(t.focusRing).toBe("0 0 0 3px rgba(255, 0, 0, 0.35)");
  });

  it("falls back to DEFAULT_ACCENT on invalid input", () => {
    const t = buildAccentTokens("zzz");
    expect(t.accent).toBe(DEFAULT_ACCENT);
  });

  it("derives light/strong/soft as valid hex colors", () => {
    const t = buildAccentTokens("#1a73e8");
    for (const c of [t.light, t.strong, t.soft]) {
      expect(c).toMatch(/^#[0-9a-f]{6}$/);
    }
    expect(t.light).not.toBe(t.strong);
  });
});
