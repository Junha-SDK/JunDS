import { describe, it, expect } from "vitest";
import {
  classifyDisclosure,
  CATEGORY_LABELS,
  TONE_TOKENS,
} from "@/ds/finance/lib/disclosureTone";

describe("classifyDisclosure", () => {
  it("returns neutral/other with zero confidence when nothing matches", () => {
    const r = classifyDisclosure("정기주주총회 소집 안내");
    expect(r.tone).toBe("neutral");
    expect(r.category).toBe("other");
    expect(r.confidence).toBe(0);
    expect(r.matched).toEqual([]);
  });

  it("classifies 유상증자 as negative financing", () => {
    const r = classifyDisclosure("유상증자 결정");
    expect(r.tone).toBe("negative");
    expect(r.category).toBe("financing");
    expect(r.matched).toContain("유상증자");
    expect(r.confidence).toBeGreaterThan(0);
  });

  it("classifies 자사주 소각 as positive treasury", () => {
    const r = classifyDisclosure("주요사항보고서 (자사주 소각 결정)");
    expect(r.tone).toBe("positive");
    expect(r.category).toBe("treasury");
    expect(r.matched).toContain("자사주 소각");
  });

  it("caps confidence at 1 for heavy keywords like 상장폐지", () => {
    const r = classifyDisclosure("상장폐지 사유 발생");
    expect(r.tone).toBe("negative");
    expect(r.category).toBe("litigation");
    expect(r.confidence).toBe(1); // weight 2.0 / 1.5 → capped
  });

  it("stays neutral for weak neutral-tone keywords", () => {
    const r = classifyDisclosure("합병 관련 안내");
    expect(r.tone).toBe("neutral");
    expect(r.category).toBe("governance");
  });

  it("also scans the optional body text", () => {
    const r = classifyDisclosure("주요사항보고서", "전환사채 발행 결정의 건");
    expect(r.tone).toBe("negative");
    expect(r.category).toBe("financing");
    expect(r.matched).toContain("전환사채");
  });

  it("lets multiple rules vote on category and tone", () => {
    const r = classifyDisclosure("현금배당 및 자사주 매입 결정");
    expect(r.tone).toBe("positive");
    // treasury(1.0) outweighs dividend(0.7)
    expect(r.category).toBe("treasury");
    expect(r.matched).toEqual(expect.arrayContaining(["현금배당", "자사주 매입"]));
  });
});

describe("CATEGORY_LABELS / TONE_TOKENS", () => {
  it("has a Korean label for every category", () => {
    for (const label of Object.values(CATEGORY_LABELS)) {
      expect(label.length).toBeGreaterThan(0);
    }
    expect(CATEGORY_LABELS.litigation).toBe("분쟁/제재");
  });

  it("maps tones to labeled token pairs", () => {
    expect(TONE_TOKENS.positive.label).toBe("호재");
    expect(TONE_TOKENS.negative.label).toBe("악재");
    expect(TONE_TOKENS.neutral.label).toBe("중립");
    for (const t of Object.values(TONE_TOKENS)) {
      expect(t.fg).toMatch(/^var\(--/);
      expect(t.bg).toMatch(/^var\(--/);
    }
  });
});
