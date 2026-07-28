/** FRED 클라이언트 계약 테스트 — fetch 모킹, 재시도·YoY 계산 검증. */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { jsonResponse, stubFetchByUrl } from "./helpers.js";
import { fetchFredSeries, fetchFredLatest, fetchFredYoY, fredKey } from "../src/fred.js";

beforeEach(() => {
  process.env.FRED_API_KEY = "fred-key";
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.FRED_API_KEY;
});

describe("fetchFredSeries", () => {
  it("결측('.')과 빈 값 필터, desc 순서 유지", async () => {
    const fetchMock = stubFetchByUrl([
      [
        "api.stlouisfed.org",
        () =>
          jsonResponse({
            observations: [
              { date: "2026-06-01", value: "321.5" },
              { date: "2026-05-01", value: "." }, // 결측 → 제외
              { date: "2026-04-01", value: "" }, // 빈 값 → 제외
              { date: "2026-03-01", value: "319.8" },
            ],
          }),
      ],
    ]);
    const s = await fetchFredSeries({ seriesId: "CPIAUCSL" });
    expect(s).not.toBeNull();
    expect(s!.seriesId).toBe("CPIAUCSL");
    expect(s!.points).toEqual([
      { date: "2026-06-01", value: 321.5 },
      { date: "2026-03-01", value: 319.8 },
    ]);
    const url = String(fetchMock.mock.calls[0]![0]);
    expect(url).toContain("series_id=CPIAUCSL");
    expect(url).toContain("sort_order=desc");
    expect(url).toContain("limit=24"); // 기본값
  });

  it("5xx는 1회 재시도 후 성공 수용", async () => {
    let calls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        calls++;
        if (calls === 1) return jsonResponse({}, 502);
        return jsonResponse({ observations: [{ date: "2026-06-01", value: "1.0" }] });
      }),
    );
    const s = await fetchFredSeries({ seriesId: "DGS10" });
    expect(calls).toBe(2);
    expect(s!.points).toHaveLength(1);
  });

  it("4xx는 재시도 없이 null", async () => {
    const fetchMock = stubFetchByUrl([["api.stlouisfed.org", () => jsonResponse({}, 403)]]);
    expect(await fetchFredSeries({ seriesId: "DGS10" })).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("키 없으면 네트워크 없이 null", async () => {
    delete process.env.FRED_API_KEY;
    const fetchMock = stubFetchByUrl([]);
    expect(await fetchFredSeries({ seriesId: "DGS10" })).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(fredKey()).toBeNull();
  });
});

describe("fetchFredLatest", () => {
  it("최신 1점만 (limit=1 요청)", async () => {
    const fetchMock = stubFetchByUrl([
      [
        "api.stlouisfed.org",
        () => jsonResponse({ observations: [{ date: "2026-06-01", value: "4.25" }] }),
      ],
    ]);
    const latest = await fetchFredLatest("DFF");
    expect(latest).toEqual({ date: "2026-06-01", value: 4.25 });
    expect(String(fetchMock.mock.calls[0]![0])).toContain("limit=1");
  });
});

describe("fetchFredYoY", () => {
  it("13개월치로 YoY % 계산 (desc: [0]=최신, [12]=12개월 전)", async () => {
    const observations = Array.from({ length: 14 }, (_, i) => ({
      date: `2026-${String(14 - i).padStart(2, "0")}-01`,
      value: String(110 - i), // 최신 110, 12개월 전 98
    }));
    stubFetchByUrl([["api.stlouisfed.org", () => jsonResponse({ observations })]]);
    const yoy = await fetchFredYoY("CPIAUCSL");
    expect(yoy).not.toBeNull();
    expect(yoy!.latest).toBe(110);
    expect(yoy!.yoyPct).toBeCloseTo(((110 - 98) / 98) * 100);
  });

  it("13개월치 미만이면 null", async () => {
    stubFetchByUrl([
      [
        "api.stlouisfed.org",
        () =>
          jsonResponse({
            observations: Array.from({ length: 5 }, (_, i) => ({
              date: `2026-0${i + 1}-01`,
              value: "1",
            })),
          }),
      ],
    ]);
    expect(await fetchFredYoY("CPIAUCSL")).toBeNull();
  });
});
