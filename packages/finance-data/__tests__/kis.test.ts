/**
 * KIS 래퍼 계약 테스트 — 실 API 호출 금지, fetch/node:fs 전면 모킹.
 * 파싱·정규화(문자열→숫자, 단위 환산, 정렬 방향)가 검증 대상.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// 디스크 토큰 캐시 무력화 — 머신에 남은 실캐시(/tmp/buttermoney-kis-token.json)가
// 테스트에 새어들지 않게 하고, 테스트가 실파일을 쓰지도 않게 한다.
vi.mock("node:fs", () => ({
  readFileSync: vi.fn(() => {
    throw new Error("no disk cache in tests");
  }),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

const TOKEN_BODY = { access_token: "tok-123", token_type: "Bearer", expires_in: 86400 };

function setKisEnv(): void {
  process.env.KIS_BASE_URL = "https://kis.test:9443";
  process.env.KIS_APP_KEY = "app-key";
  process.env.KIS_APP_SECRET = "app-secret";
}

async function importKis() {
  return import("../src/kis.js");
}

beforeEach(() => {
  vi.resetModules();
  setKisEnv();
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.KIS_BASE_URL;
  delete process.env.KIS_APP_KEY;
  delete process.env.KIS_APP_SECRET;
});

import { jsonResponse, stubFetchByUrl } from "./helpers.js";

describe("kisCodeFor", () => {
  it("6자리 숫자 코드는 그대로", async () => {
    const { kisCodeFor } = await importKis();
    expect(kisCodeFor("005930")).toBe("005930");
  });

  it("Yahoo 티커에서 6자리 추출 (.KS/.KQ, 대소문자 무관)", async () => {
    const { kisCodeFor } = await importKis();
    expect(kisCodeFor("005930.KS")).toBe("005930");
    expect(kisCodeFor("036830.kq")).toBe("036830");
  });

  it("정적 한글명 매핑 경유", async () => {
    const { kisCodeFor } = await importKis();
    expect(kisCodeFor("삼성전자")).toBe("005930");
    expect(kisCodeFor("  삼성전자  ")).toBe("005930"); // trim
  });

  it("미지 입력은 null", async () => {
    const { kisCodeFor } = await importKis();
    expect(kisCodeFor("")).toBeNull();
    expect(kisCodeFor("솔브레인")).toBeNull();
    expect(kisCodeFor("12345")).toBeNull(); // 5자리
  });
});

describe("fetchQuote", () => {
  it("응답 문자열을 숫자로 정규화하고 시총 억원→원 환산", async () => {
    const { fetchQuote } = await importKis();
    const fetchMock = stubFetchByUrl([
      ["/oauth2/tokenP", () => jsonResponse(TOKEN_BODY)],
      [
        "/inquire-price",
        () =>
          jsonResponse({
            rt_cd: "0",
            output: {
              stck_prpr: "71200",
              prdy_vrss: "1200",
              prdy_ctrt: "1.71",
              stck_oprc: "70100",
              stck_hgpr: "71600",
              stck_lwpr: "69900",
              stck_sdpr: "70000",
              acml_vol: "12345678",
              acml_tr_pbmn: "876543210000",
              hts_avls: "4250000", // 억원
              per: "12.3",
              pbr: "", // 빈 문자열 → null
              eps: "5788",
              bps: "50817",
              w52_hgpr: "88800",
              w52_lwpr: "49900",
              hts_frgn_ehrt: "51.2",
            },
          }),
      ],
    ]);

    const q = await fetchQuote("삼성전자");
    expect(q).not.toBeNull();
    expect(q!.code).toBe("005930");
    expect(q!.market).toBe("KOSPI");
    expect(q!.price).toBe(71200);
    expect(q!.changePct).toBe(1.71);
    expect(q!.marketCap).toBe(4250000 * 100_000_000);
    expect(q!.per).toBe(12.3);
    expect(q!.pbr).toBeNull();
    expect(q!.foreignOwnership).toBe(51.2);
    expect(typeof q!.asOf).toBe("string");

    // 요청 검증: 토큰 1회 + 시세 1회, 헤더/쿼리 정확성
    const quoteCall = fetchMock.mock.calls.find(([u]) => String(u).includes("inquire-price"))!;
    const url = String(quoteCall[0]);
    expect(url).toContain("FID_INPUT_ISCD=005930");
    expect(url).toContain("FID_COND_MRKT_DIV_CODE=J");
    const headers = (quoteCall[1] as RequestInit).headers as Record<string, string>;
    expect(headers.tr_id).toBe("FHKST01010100");
    expect(headers.authorization).toBe("Bearer tok-123");
  });

  it("미지 종목은 네트워크 없이 null", async () => {
    const { fetchQuote } = await importKis();
    const fetchMock = stubFetchByUrl([]);
    expect(await fetchQuote("솔브레인")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rt_cd 비정상은 throw", async () => {
    const { fetchQuote } = await importKis();
    stubFetchByUrl([
      ["/oauth2/tokenP", () => jsonResponse(TOKEN_BODY)],
      ["/inquire-price", () => jsonResponse({ rt_cd: "1", msg1: "quota" })],
    ]);
    await expect(fetchQuote("005930")).rejects.toThrow(/rt_cd=1/);
  });

  it("토큰은 메모리 캐시 재사용 (모듈당 발급 1회)", async () => {
    const { fetchQuote } = await importKis();
    const fetchMock = stubFetchByUrl([
      ["/oauth2/tokenP", () => jsonResponse(TOKEN_BODY)],
      ["/inquire-price", () => jsonResponse({ rt_cd: "0", output: { stck_prpr: "100" } })],
    ]);
    await fetchQuote("005930");
    await fetchQuote("000660");
    const tokenCalls = fetchMock.mock.calls.filter(([u]) => String(u).includes("tokenP"));
    expect(tokenCalls).toHaveLength(1);
  }, 10_000); // 레이트리미터 200ms 갭 포함

  it("KIS env 미설정이면 의미 있는 에러", async () => {
    delete process.env.KIS_BASE_URL;
    const { fetchQuote } = await importKis();
    stubFetchByUrl([]);
    await expect(fetchQuote("005930")).rejects.toThrow(/KIS env missing/);
  });
});

describe("fetchChart", () => {
  it("YYYYMMDD→YYYY-MM-DD 변환, 불량 행 필터, 시간순 뒤집기", async () => {
    const { fetchChart } = await importKis();
    stubFetchByUrl([
      ["/oauth2/tokenP", () => jsonResponse(TOKEN_BODY)],
      [
        "/inquire-daily-itemchartprice",
        () =>
          jsonResponse({
            rt_cd: "0",
            output2: [
              // KIS 는 최신→과거 순으로 준다
              {
                stck_bsop_date: "20260724",
                stck_oprc: "70100",
                stck_hgpr: "71600",
                stck_lwpr: "69900",
                stck_clpr: "71200",
                acml_vol: "1000",
                prdy_ctrt: "1.71",
              },
              { stck_bsop_date: "", stck_clpr: "1" }, // 날짜 없음 → 제외
              { stck_bsop_date: "20260723", stck_clpr: "" }, // 종가 없음 → 제외
              {
                stck_bsop_date: "20260722",
                stck_oprc: "69000",
                stck_hgpr: "70500",
                stck_lwpr: "68800",
                stck_clpr: "70000",
                acml_vol: "900",
                prdy_ctrt: "-0.5",
              },
            ],
          }),
      ],
    ]);
    const candles = await fetchChart("삼성전자", "D");
    expect(candles).toHaveLength(2);
    // 뒤집혀서 과거→최신
    expect(candles[0]!.date).toBe("2026-07-22");
    expect(candles[1]!.date).toBe("2026-07-24");
    expect(candles[1]!.close).toBe(71200);
    expect(candles[0]!.changePct).toBe(-0.5);
  });

  it("기간/날짜 파라미터 전달", async () => {
    const { fetchChart } = await importKis();
    const fetchMock = stubFetchByUrl([
      ["/oauth2/tokenP", () => jsonResponse(TOKEN_BODY)],
      ["/inquire-daily-itemchartprice", () => jsonResponse({ rt_cd: "0", output2: [] })],
    ]);
    await fetchChart("005930", "M", "20250101", "20260101");
    const url = String(
      fetchMock.mock.calls.find(([u]) => String(u).includes("itemchartprice"))![0],
    );
    expect(url).toContain("FID_PERIOD_DIV_CODE=M");
    expect(url).toContain("FID_INPUT_DATE_1=20250101");
    expect(url).toContain("FID_INPUT_DATE_2=20260101");
  });

  it("미지 종목은 빈 배열", async () => {
    const { fetchChart } = await importKis();
    const fetchMock = stubFetchByUrl([]);
    expect(await fetchChart("모르는종목")).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("fetchOrderBook", () => {
  it("호가 10단계 + 총잔량 파싱", async () => {
    const { fetchOrderBook } = await importKis();
    const output1: Record<string, string> = {
      stck_prpr: "71200",
      total_askp_rsqn: "45000",
      total_bidp_rsqn: "39000",
    };
    for (let i = 1; i <= 10; i++) {
      output1[`askp${i}`] = String(71200 + i * 100);
      output1[`askp_rsqn${i}`] = String(i * 10);
      output1[`bidp${i}`] = String(71200 - i * 100);
      output1[`bidp_rsqn${i}`] = String(i * 20);
    }
    stubFetchByUrl([
      ["/oauth2/tokenP", () => jsonResponse(TOKEN_BODY)],
      ["/inquire-asking-price-exp-ccn", () => jsonResponse({ rt_cd: "0", output1 })],
    ]);
    const ob = await fetchOrderBook("삼성전자");
    expect(ob).not.toBeNull();
    expect(ob!.asks).toHaveLength(10);
    expect(ob!.bids).toHaveLength(10);
    expect(ob!.asks[0]).toEqual({ price: 71300, qty: 10 }); // 1번이 최우선
    expect(ob!.bids[9]).toEqual({ price: 70200, qty: 200 });
    expect(ob!.current).toBe(71200);
    expect(ob!.totalAskQty).toBe(45000);
    expect(ob!.totalBidQty).toBe(39000);
  });
});

describe("fetchInvestorFlow", () => {
  it("종목 행 합산 + 백만원→억원 환산 (큰 값만)", async () => {
    const { fetchInvestorFlow } = await importKis();
    stubFetchByUrl([
      ["/oauth2/tokenP", () => jsonResponse(TOKEN_BODY)],
      [
        "/foreign-institution-total",
        () =>
          jsonResponse({
            rt_cd: "0",
            output: [
              { frgn_ntby_tr_pbmn: "12000000", orgn_ntby_tr_pbmn: "-3000000" },
              { frgn_ntby_tr_pbmn: "8000000", orgn_ntby_tr_pbmn: "1000000" },
            ],
          }),
      ],
    ]);
    const flow = await fetchInvestorFlow();
    // (12M + 8M) 백만원 = 2000만 > 100_000 → ÷100
    expect(flow.foreign).toBe(200000);
    expect(flow.institution).toBe(-20000);
    expect(flow.individual).toBe(0); // TR 미포함 → 항상 0
  });

  it("작은 값은 환산 없이 반올림만", async () => {
    const { fetchInvestorFlow } = await importKis();
    stubFetchByUrl([
      ["/oauth2/tokenP", () => jsonResponse(TOKEN_BODY)],
      [
        "/foreign-institution-total",
        () =>
          jsonResponse({
            rt_cd: "0",
            output: [{ frgn_ntby_tr_pbmn: "1234.6", orgn_ntby_tr_pbmn: "10" }],
          }),
      ],
    ]);
    const flow = await fetchInvestorFlow();
    expect(flow.foreign).toBe(1235);
    expect(flow.institution).toBe(10);
  });
});

describe("fetchIndex", () => {
  it("정상 응답 파싱 + 지수코드 매핑", async () => {
    const { fetchIndex } = await importKis();
    const fetchMock = stubFetchByUrl([
      ["/oauth2/tokenP", () => jsonResponse(TOKEN_BODY)],
      [
        "/inquire-index-price",
        () =>
          jsonResponse({
            rt_cd: "0",
            output: {
              bstp_nmix_prpr: "7402.77",
              bstp_nmix_prdy_vrss: "-12.3",
              prdy_ctrt: "-0.17",
              prdy_nmix: "7415.07",
              bstp_nmix_oprc: "7410.1",
              bstp_nmix_hgpr: "7431.9",
              bstp_nmix_lwpr: "7388.2",
            },
          }),
      ],
    ]);
    const idx = await fetchIndex("KOSPI");
    expect(idx.code).toBe("KOSPI");
    expect(idx.value).toBe(7402.77);
    expect(idx.changePct).toBe(-0.17);
    expect(idx.prevClose).toBe(7415.07);
    const url = String(fetchMock.mock.calls.find(([u]) => String(u).includes("index-price"))![0]);
    expect(url).toContain("FID_INPUT_ISCD=0001"); // KOSPI → 0001
  });

  it("prdy_ctrt/prdy_nmix 누락 시 역산 보완", async () => {
    const { fetchIndex } = await importKis();
    stubFetchByUrl([
      ["/oauth2/tokenP", () => jsonResponse(TOKEN_BODY)],
      [
        "/inquire-index-price",
        () =>
          jsonResponse({
            rt_cd: "0",
            output: {
              bstp_nmix_prpr: "1010",
              bstp_nmix_prdy_vrss: "10",
              // prdy_ctrt, prdy_nmix 없음
            },
          }),
      ],
    ]);
    const idx = await fetchIndex("KOSDAQ");
    expect(idx.prevClose).toBe(1000); // value - change 역산
    expect(idx.changePct).toBeCloseTo(1.0); // change/prevClose*100
  });
});
