/** 추출 요약기 계약 테스트 — 순수 함수 (네트워크 없음). */
import { describe, it, expect } from "vitest";
import { summarizeNews, type SummarizableNews } from "../src/newsSummary.js";

const item = (title: string, description?: string): SummarizableNews => ({
  title,
  description,
  publishedAt: "2026-07-24T00:00:00.000Z",
});

describe("summarizeNews", () => {
  it("빈 입력은 영요약", () => {
    const s = summarizeNews([]);
    expect(s).toEqual({ summary: "", sentences: [], keyTerms: [], tone: 0, itemCount: 0 });
  });

  it("빈도 높은 핵심어 추출 (제목 가중 2배)", () => {
    const s = summarizeNews([
      item("반도체 수출 증가", "반도체 업황이 좋아졌다는 평가."),
      item("반도체 장비 투자 확대"),
      item("자동차 판매 부진"),
    ]);
    expect(s.itemCount).toBe(3);
    expect(s.keyTerms.length).toBeGreaterThan(0);
    expect(s.keyTerms[0]!.term).toBe("반도체"); // 최다 빈도
    expect(s.keyTerms.length).toBeLessThanOrEqual(8);
  });

  it("문장은 서로 다른 기사에서 다양화, maxSentences 준수", () => {
    const s = summarizeNews(
      [
        item("반도체 슈퍼사이클 진입", "반도체 가격이 오른다. 수요가 강하다."),
        item("반도체 소재주 강세", "소재 업체 실적이 좋다."),
        item("반도체 장비주도 상승"),
      ],
      2,
    );
    expect(s.sentences.length).toBeLessThanOrEqual(2);
    expect(s.summary).toBe(s.sentences.join(" "));
  });

  it("tone: 긍정어만 → +1, 부정어만 → -1, 혼합 → 중간", () => {
    expect(summarizeNews([item("흑자전환에 신고가 돌파")]).tone).toBe(1);
    expect(summarizeNews([item("급락에 거래정지, 소송 리스크")]).tone).toBe(-1);
    const mixed = summarizeNews([item("급등 후 급락")]).tone;
    expect(mixed).toBeGreaterThan(-1);
    expect(mixed).toBeLessThan(1);
  });
});
