/** ECOS 클라이언트 계약 테스트 — fetch 모킹, graceful null 경로 검증. */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { jsonResponse, stubFetchByUrl } from "./helpers.js";
import { fetchSeries, ecosKey, ymd, ym } from "../src/ecos.js";

beforeEach(() => {
  process.env.ECOS_API_KEY = "test-key";
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.ECOS_API_KEY;
});

describe("ecosKey", () => {
  it("공백 트림, 미설정/빈 값은 null", () => {
    expect(ecosKey()).toBe("test-key");
    process.env.ECOS_API_KEY = "  ";
    expect(ecosKey()).toBeNull();
    delete process.env.ECOS_API_KEY;
    expect(ecosKey()).toBeNull();
  });
});

describe("fetchSeries", () => {
  const ROW = {
    STAT_CODE: "731Y001",
    STAT_NAME: "환율",
    ITEM_CODE1: "0000001",
    ITEM_NAME1: "원/달러",
    UNIT_NAME: "원",
  };

  it("행을 시계열로 정규화, 비수치 값 필터", async () => {
    stubFetchByUrl([
      [
        "ecos.bok.or.kr",
        () =>
          jsonResponse({
            StatisticSearch: {
              row: [
                { ...ROW, TIME: "20260722", DATA_VALUE: "1385.2" },
                { ...ROW, TIME: "20260723", DATA_VALUE: "약보합" }, // 비수치 → 제외
                { ...ROW, TIME: "20260724", DATA_VALUE: "1390.0" },
              ],
            },
          }),
      ],
    ]);
    const s = await fetchSeries({
      statCode: "731Y001",
      cycle: "D",
      start: "20260701",
      end: "20260724",
      itemCode: "0000001",
    });
    expect(s).not.toBeNull();
    expect(s!.statName).toBe("환율");
    expect(s!.unit).toBe("원");
    expect(s!.cycle).toBe("D");
    expect(s!.points).toEqual([
      { date: "20260722", value: 1385.2 },
      { date: "20260724", value: 1390.0 },
    ]);
  });

  it("연 주기는 URL에서 A로 매핑되고 반환 cycle은 Y 유지", async () => {
    const fetchMock = stubFetchByUrl([
      [
        "ecos.bok.or.kr",
        () =>
          jsonResponse({
            StatisticSearch: { row: [{ ...ROW, TIME: "2025", DATA_VALUE: "2.5" }] },
          }),
      ],
    ]);
    const s = await fetchSeries({
      statCode: "902Y015",
      cycle: "Y",
      start: "2020",
      end: "2025",
      itemCode: "KOR",
    });
    expect(s!.cycle).toBe("Y");
    const url = String(fetchMock.mock.calls[0]![0]);
    expect(url).toContain("/902Y015/A/2020/2025/KOR");
    expect(url).toContain("/1/500/"); // rows 기본 500
  });

  it("키 없으면 네트워크 없이 null", async () => {
    delete process.env.ECOS_API_KEY;
    const fetchMock = stubFetchByUrl([]);
    const s = await fetchSeries({ statCode: "x", cycle: "D", start: "1", end: "2", itemCode: "i" });
    expect(s).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("HTTP 실패/빈 행/네트워크 예외는 전부 null (graceful)", async () => {
    stubFetchByUrl([["ecos.bok.or.kr", () => jsonResponse({}, 500)]]);
    expect(
      await fetchSeries({ statCode: "x", cycle: "D", start: "1", end: "2", itemCode: "i" }),
    ).toBeNull();

    stubFetchByUrl([["ecos.bok.or.kr", () => jsonResponse({ StatisticSearch: { row: [] } })]]);
    expect(
      await fetchSeries({ statCode: "x", cycle: "D", start: "1", end: "2", itemCode: "i" }),
    ).toBeNull();

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("net down");
      }),
    );
    expect(
      await fetchSeries({ statCode: "x", cycle: "D", start: "1", end: "2", itemCode: "i" }),
    ).toBeNull();
  });
});

describe("date helpers", () => {
  it("ymd/ym 0패딩", () => {
    const d = new Date(2026, 0, 5); // 2026-01-05
    expect(ymd(d)).toBe("20260105");
    expect(ym(d)).toBe("202601");
  });
});
