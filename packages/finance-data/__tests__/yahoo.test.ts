/** yahoo-finance2 싱글턴 계약 테스트 — 라이브러리 자체를 모킹 (실 API 호출 금지). */
import { describe, it, expect, vi, beforeEach } from "vitest";

const ctorSpy = vi.fn();

vi.mock("yahoo-finance2", () => ({
  default: class MockYahooFinance {
    opts: unknown;
    constructor(opts: unknown) {
      ctorSpy(opts);
      this.opts = opts;
    }
  },
}));

beforeEach(() => {
  vi.resetModules();
  ctorSpy.mockClear();
});

describe("yahoo()", () => {
  it("동일 인스턴스 재사용 (싱글턴)", async () => {
    const { yahoo } = await import("../src/yahoo.js");
    const a = yahoo();
    const b = yahoo();
    expect(a).toBe(b);
    expect(ctorSpy).toHaveBeenCalledTimes(1);
  });

  it("v2 와 동일한 생성 옵션 (survey/ripHistorical 공지 억제)", async () => {
    const { yahoo } = await import("../src/yahoo.js");
    yahoo();
    expect(ctorSpy).toHaveBeenCalledWith({
      suppressNotices: ["yahooSurvey", "ripHistorical"],
    });
  });
});
