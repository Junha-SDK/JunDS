/**
 * 한국투자증권 KIS Open API 래퍼.
 *
 * ⚠ 정책: 시세/차트/지수 조회 전용. 주문(매수·매도) API는 의도적으로 구현하지 않는다.
 *    실거래는 사용자가 한국투자증권 공식 앱에서 직접 수행해야 한다.
 *
 * 환경변수 (`.env.local` — git 미추적):
 *   KIS_BASE_URL        실전 https://openapi.koreainvestment.com:9443
 *                       모의 https://openapivts.koreainvestment.com:29443
 *   KIS_APP_KEY         apiportal.koreainvestment.com 에서 발급
 *   KIS_APP_SECRET      동일
 *   KIS_CANO            계좌 앞 8자리
 *   KIS_ACNT_PRDT_CD    계좌 뒤 2자리 (보통 "01")
 *
 * 토큰: OAuth2 Client Credentials. 24시간 유효 → 메모리 캐시.
 * 한 분당 호출 제한: REST 약 20건/초. 폭주 방지를 위해 호출부에서 캐싱 권장.
 */

import { TICKER_MAP } from "./tickers";

interface KisConfig {
  baseUrl: string;
  appKey: string;
  appSecret: string;
  cano: string;
  acntPrdtCd: string;
}

function getConfig(): KisConfig {
  const baseUrl = process.env.KIS_BASE_URL;
  const appKey = process.env.KIS_APP_KEY;
  const appSecret = process.env.KIS_APP_SECRET;
  const cano = process.env.KIS_CANO ?? "";
  const acntPrdtCd = process.env.KIS_ACNT_PRDT_CD ?? "01";
  if (!baseUrl || !appKey || !appSecret) {
    throw new Error(
      "KIS env missing: KIS_BASE_URL, KIS_APP_KEY, KIS_APP_SECRET 모두 설정 필요",
    );
  }
  return { baseUrl, appKey, appSecret, cano, acntPrdtCd };
}

/* ──────────────────────────── 토큰 캐시 ──────────────────────────── */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * SERVER-ONLY 런타임 가드.
 *
 * 이 모듈은 Node 빌트인(`node:fs`/`node:os`/`node:path`)과 KIS API 시크릿
 * 환경변수에 의존하므로 **반드시 서버 컴포넌트 / route handler / Server
 * Action에서만 import**해야 한다.
 *
 * 클라이언트 번들에 포함되려는 경우는 Next.js bundler가
 * `Module not found: Can't resolve 'node:fs'` 로 빌드 단계에서 막는다.
 * 우회 빌드 설정 등 클라이언트에서 평가되는 시나리오를 막기 위해 모듈
 * 평가 시점에 `window` 가 있으면 즉시 throw 한다.
 */
if (typeof window !== "undefined") {
  throw new Error(
    "[@junds/ui/finance/lib/kis] 이 모듈은 server-only입니다. " +
    "Server Component / route handler / Server Action에서만 import하세요.",
  );
}

interface TokenCache {
  token: string;
  expiresAt: number; // epoch ms
}
let TOKEN: TokenCache | null = null;

/**
 * 토큰 디스크 캐시 — Next.js dev 모드 hot-reload 시 모듈이 재평가돼
 * 메모리 캐시가 날아가는데, KIS는 토큰 발급을 1분당 1회로 제한하므로
 * 디스크에 보관해 재발급 폭주를 막는다. (`/tmp/buttermoney-kis-token.json`)
 */
const TOKEN_FILE = join(tmpdir(), "buttermoney-kis-token.json");

function loadTokenFromDisk(): TokenCache | null {
  try {
    const raw = readFileSync(TOKEN_FILE, "utf8");
    const j = JSON.parse(raw) as TokenCache;
    if (j && typeof j.token === "string" && typeof j.expiresAt === "number") {
      return j;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function saveTokenToDisk(t: TokenCache): void {
  try {
    mkdirSync(tmpdir(), { recursive: true });
    writeFileSync(TOKEN_FILE, JSON.stringify(t), { mode: 0o600 });
  } catch {
    /* ignore — 캐시 미스 정도의 문제 */
  }
}

/**
 * Access token 발급/캐시 반환.
 * KIS는 토큰 발급이 1분당 1회 제한이며, 토큰 자체는 24시간 유효 →
 *   1) 메모리 캐시 (만료 30분 전까지 재사용)
 *   2) 디스크 캐시 (서버 재시작·hot reload 대응)
 *   3) 신규 발급
 */
async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (TOKEN && TOKEN.expiresAt - 30 * 60_000 > now) return TOKEN.token;

  const disk = loadTokenFromDisk();
  if (disk && disk.expiresAt - 30 * 60_000 > now) {
    TOKEN = disk;
    return disk.token;
  }

  const cfg = getConfig();
  const res = await fetch(`${cfg.baseUrl}/oauth2/tokenP`, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      appkey: cfg.appKey,
      appsecret: cfg.appSecret,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`KIS oauth2 ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    access_token: string;
    token_type: string;
    expires_in: number; // seconds
  };
  TOKEN = {
    token: json.access_token,
    expiresAt: now + json.expires_in * 1000,
  };
  saveTokenToDisk(TOKEN);
  return TOKEN.token;
}

/* ──────────────────────────── 글로벌 레이트 리미터 ──────────────────────────── */

/**
 * KIS 실전 REST는 초당 ~5건 제한. 여러 컴포넌트가 병렬로 요청해도 차단되지 않도록
 * 모든 시세/지수/차트 호출을 단일 큐로 직렬화하고 호출 사이 200ms 갭을 둔다.
 */
const RATE_LIMIT_GAP_MS = 200;
let rateChain: Promise<void> = Promise.resolve();
let lastCallAt = 0;

async function withRateLimit<T>(fn: () => Promise<T>): Promise<T> {
  const myTurn = rateChain.then(async () => {
    const since = Date.now() - lastCallAt;
    if (since < RATE_LIMIT_GAP_MS) {
      await new Promise<void>((r) => setTimeout(r, RATE_LIMIT_GAP_MS - since));
    }
    lastCallAt = Date.now();
  });
  rateChain = myTurn.catch(() => undefined);
  await myTurn;
  return fn();
}

/* ──────────────────────────── 종목코드 매핑 ──────────────────────────── */

/**
 * 입력 → KIS 6자리 종목코드.
 *
 * 허용 입력:
 *   - 6자리 숫자 코드: "005930" → "005930"
 *   - Yahoo 티커: "005930.KS" / "036830.KQ" → "005930" / "036830"
 *   - 정적 한글명 매핑: "삼성전자" → TICKER_MAP 조회 후 6자리 추출
 *
 * 정적 매핑에 없는 한글명(예: "솔브레인")은 호출부에서 검색을 통해 코드/티커로
 * 변환한 뒤 이 함수를 호출해야 한다 — 이 함수 자체는 외부 데이터에 의존하지 않음.
 */
export function kisCodeFor(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^\d{6}$/.test(trimmed)) return trimmed;
  const tickerMatch = trimmed.match(/^(\d{6})\.(KS|KQ)$/i);
  if (tickerMatch) return tickerMatch[1];
  const yahoo = TICKER_MAP[trimmed];
  if (yahoo) {
    const m = yahoo.match(/^(\d{6})\.(KS|KQ)$/);
    if (m) return m[1];
  }
  return null;
}

/* ──────────────────────────── 시세 조회 (현재가) ──────────────────────────── */

export interface KisQuote {
  symbol: string;       // 종목명 (입력값 그대로)
  code: string;         // 6자리 종목코드
  market: "KOSPI" | "KOSDAQ" | "UNKNOWN";
  price: number;        // 현재가
  change: number;       // 전일대비 (원)
  changePct: number;    // 전일대비 (%)
  open: number;         // 시가
  high: number;         // 고가
  low: number;          // 저가
  prevClose: number;    // 전일종가
  volume: number;       // 누적거래량
  amount: number;       // 누적거래대금 (원)
  marketCap: number;    // 시가총액 (원)
  per: number | null;
  pbr: number | null;
  eps: number | null;
  bps: number | null;
  high52: number | null;
  low52: number | null;
  /** 외국인 보유율 (%) — KIS 응답의 hts_frgn_ehrt */
  foreignOwnership: number | null;
  asOf: string;         // ISO timestamp
}

/**
 * 국내주식 현재가 조회.
 * KIS 문서: 국내주식 → 기본시세 → "주식현재가 시세" (TR_ID FHKST01010100)
 */
/** REST 시세 venue.
 *   "J":  정규장 (KRX 주식·ETF·ELW)
 *   "NX": NXT (env KIS_REST_MRKT_NXT 로 override 가능)
 *   "UN": 통합 시세 (KRX+NXT, env KIS_REST_MRKT_UNIFIED)
 */
type KisRestVenue = "J" | "NX" | "UN";

function fidMrktForVenue(venue: KisRestVenue): string {
  if (venue === "J") return "J";
  if (venue === "NX") return process.env.KIS_REST_MRKT_NXT ?? "NX";
  return process.env.KIS_REST_MRKT_UNIFIED ?? "UN";
}

export async function fetchQuote(
  name: string,
  venue: KisRestVenue = "J",
): Promise<KisQuote | null> {
  const code = kisCodeFor(name);
  if (!code) return null;
  const cfg = getConfig();
  const token = await getAccessToken();

  const url = new URL(`${cfg.baseUrl}/uapi/domestic-stock/v1/quotations/inquire-price`);
  url.searchParams.set("FID_COND_MRKT_DIV_CODE", fidMrktForVenue(venue));
  url.searchParams.set("FID_INPUT_ISCD", code);

  const res = await withRateLimit(() =>
    fetch(url, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        authorization: `Bearer ${token}`,
        appkey: cfg.appKey,
        appsecret: cfg.appSecret,
        tr_id: "FHKST01010100",
      },
      cache: "no-store",
    }),
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`KIS inquire-price ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    rt_cd: string;
    msg1?: string;
    output?: Record<string, string>;
  };
  if (json.rt_cd !== "0" || !json.output) {
    throw new Error(`KIS inquire-price rt_cd=${json.rt_cd}: ${json.msg1 ?? ""}`);
  }
  const o = json.output;
  const num = (k: string): number => {
    const v = o[k];
    if (v == null || v === "") return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const numOrNull = (k: string): number | null => {
    const v = o[k];
    if (v == null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const yahoo = TICKER_MAP[name] ?? "";
  const market: KisQuote["market"] = yahoo.endsWith(".KS")
    ? "KOSPI"
    : yahoo.endsWith(".KQ")
    ? "KOSDAQ"
    : "UNKNOWN";

  return {
    symbol: name,
    code,
    market,
    price: num("stck_prpr"),
    change: num("prdy_vrss"),
    changePct: num("prdy_ctrt"),
    open: num("stck_oprc"),
    high: num("stck_hgpr"),
    low: num("stck_lwpr"),
    prevClose: num("stck_sdpr"),
    volume: num("acml_vol"),
    amount: num("acml_tr_pbmn"),
    marketCap: num("hts_avls") * 100_000_000, // 단위: 억원 → 원
    per: numOrNull("per"),
    pbr: numOrNull("pbr"),
    eps: numOrNull("eps"),
    bps: numOrNull("bps"),
    high52: numOrNull("w52_hgpr"),
    low52: numOrNull("w52_lwpr"),
    foreignOwnership: numOrNull("hts_frgn_ehrt"),
    asOf: new Date().toISOString(),
  };
}

/* ──────────────────────────── 일/주/월봉 차트 ──────────────────────────── */

export type ChartPeriod = "D" | "W" | "M" | "Y";

export interface KisCandle {
  date: string;     // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  changePct: number;
}

/**
 * 국내주식 기간별 시세 (일/주/월/년) 조회.
 * KIS 문서: "국내주식기간별시세(일/주/월/년)" (TR_ID FHKST03010100)
 */
export async function fetchChart(
  name: string,
  period: ChartPeriod = "D",
  fromDate?: string,
  toDate?: string,
): Promise<KisCandle[]> {
  const code = kisCodeFor(name);
  if (!code) return [];
  const cfg = getConfig();
  const token = await getAccessToken();

  // 기본: 최근 100영업일 (KIS는 최대 100건 반환)
  const today = new Date();
  const fmt = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const start =
    fromDate ??
    fmt(new Date(today.getTime() - 365 * 24 * 60 * 60_000)); // 1년 전
  const end = toDate ?? fmt(today);

  const url = new URL(
    `${cfg.baseUrl}/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice`,
  );
  url.searchParams.set("FID_COND_MRKT_DIV_CODE", "J");
  url.searchParams.set("FID_INPUT_ISCD", code);
  url.searchParams.set("FID_INPUT_DATE_1", start);
  url.searchParams.set("FID_INPUT_DATE_2", end);
  url.searchParams.set("FID_PERIOD_DIV_CODE", period);
  url.searchParams.set("FID_ORG_ADJ_PRC", "0"); // 0=수정주가, 1=원주가

  const res = await withRateLimit(() =>
    fetch(url, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        authorization: `Bearer ${token}`,
        appkey: cfg.appKey,
        appsecret: cfg.appSecret,
        tr_id: "FHKST03010100",
      },
      cache: "no-store",
    }),
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`KIS inquire-daily-itemchartprice ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    rt_cd: string;
    msg1?: string;
    output2?: Array<Record<string, string>>;
  };
  if (json.rt_cd !== "0") {
    throw new Error(`KIS chart rt_cd=${json.rt_cd}: ${json.msg1 ?? ""}`);
  }
  const rows = json.output2 ?? [];
  return rows
    .filter((r) => r.stck_bsop_date && r.stck_clpr)
    .map<KisCandle>((r) => {
      const d = r.stck_bsop_date; // YYYYMMDD
      const date = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
      const num = (k: string) => {
        const v = r[k];
        if (v == null || v === "") return 0;
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      };
      return {
        date,
        open: num("stck_oprc"),
        high: num("stck_hgpr"),
        low: num("stck_lwpr"),
        close: num("stck_clpr"),
        volume: num("acml_vol"),
        changePct: num("prdy_ctrt"),
      };
    })
    .reverse(); // KIS는 최신→과거 순. 시간순 정렬을 위해 뒤집음
}

/* ──────────────────────────── 호가창 (1~10단계) ──────────────────────────── */

export interface KisAskBidLevel {
  /** 호가 가격 */
  price: number;
  /** 호가 잔량 */
  qty: number;
}

export interface KisOrderBook {
  symbol: string;
  code: string;
  current: number;
  /** 매도 호가 1~10단계 (1번이 최우선) */
  asks: KisAskBidLevel[];
  /** 매수 호가 1~10단계 (1번이 최우선) */
  bids: KisAskBidLevel[];
  totalAskQty: number;
  totalBidQty: number;
  asOf: string;
}

/**
 * 주식 호가/예상체결 — KIS TR FHKST01010200.
 * URL: /uapi/domestic-stock/v1/quotations/inquire-asking-price-exp-ccn
 */
export async function fetchOrderBook(name: string): Promise<KisOrderBook | null> {
  const code = kisCodeFor(name);
  if (!code) return null;
  const cfg = getConfig();
  const token = await getAccessToken();

  const url = new URL(
    `${cfg.baseUrl}/uapi/domestic-stock/v1/quotations/inquire-asking-price-exp-ccn`,
  );
  url.searchParams.set("FID_COND_MRKT_DIV_CODE", "J");
  url.searchParams.set("FID_INPUT_ISCD", code);

  const res = await withRateLimit(() =>
    fetch(url, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        authorization: `Bearer ${token}`,
        appkey: cfg.appKey,
        appsecret: cfg.appSecret,
        tr_id: "FHKST01010200",
      },
      cache: "no-store",
    }),
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`KIS asking-price ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    rt_cd: string;
    msg1?: string;
    output1?: Record<string, string>;
    output2?: Record<string, string>;
  };
  if (json.rt_cd !== "0" || !json.output1) {
    throw new Error(`KIS asking-price rt_cd=${json.rt_cd}: ${json.msg1 ?? ""}`);
  }
  const o = json.output1;
  const num = (k: string): number => {
    const v = o[k];
    if (v == null || v === "") return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const asks: KisAskBidLevel[] = [];
  const bids: KisAskBidLevel[] = [];
  // 매도호가 1~10단계: askp1..10, askp_rsqn1..10
  // 매수호가 1~10단계: bidp1..10, bidp_rsqn1..10
  for (let i = 1; i <= 10; i++) {
    asks.push({ price: num(`askp${i}`), qty: num(`askp_rsqn${i}`) });
    bids.push({ price: num(`bidp${i}`), qty: num(`bidp_rsqn${i}`) });
  }
  const current = num("stck_prpr");
  const totalAskQty = num("total_askp_rsqn");
  const totalBidQty = num("total_bidp_rsqn");
  return {
    symbol: name,
    code,
    current,
    asks,
    bids,
    totalAskQty,
    totalBidQty,
    asOf: new Date().toISOString(),
  };
}

/* ──────────────────────────── 시장 투자자 매매 동향 ──────────────────────────── */

export interface KisInvestorFlow {
  /** 외국인 순매수 (억원, +매수 / -매도) */
  foreign: number;
  /** 기관 순매수 (억원) */
  institution: number;
  /** 개인 순매수 (억원) */
  individual: number;
  asOf: string;
}

/**
 * 시장별 외국인/기관 합산 매매동향 — KIS "외인기관매매종목가집계" TR (FHPTJ04400000).
 * URL: /uapi/domestic-stock/v1/quotations/foreign-institution-total
 *
 * 응답: 종목별로 외국인/기관 누적 매수·매도가 array로 옴 → 합산해서 시장 단위 추정.
 */
export async function fetchInvestorFlow(): Promise<KisInvestorFlow> {
  const cfg = getConfig();
  const token = await getAccessToken();

  const url = new URL(
    `${cfg.baseUrl}/uapi/domestic-stock/v1/quotations/foreign-institution-total`,
  );
  url.searchParams.set("FID_COND_MRKT_DIV_CODE", "V"); // V: 코스피·코스닥 통합
  url.searchParams.set("FID_COND_SCR_DIV_CODE", "16449");
  url.searchParams.set("FID_INPUT_ISCD", "0000"); // 0000: 전체
  url.searchParams.set("FID_DIV_CLS_CODE", "1"); // 1: 순매수
  url.searchParams.set("FID_RANK_SORT_CLS_CODE", "0"); // 0: 금액 순
  url.searchParams.set("FID_ETC_CLS_CODE", "0");

  const res = await withRateLimit(() =>
    fetch(url, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        authorization: `Bearer ${token}`,
        appkey: cfg.appKey,
        appsecret: cfg.appSecret,
        tr_id: "FHPTJ04400000",
      },
      cache: "no-store",
    }),
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`KIS foreign-institution-total ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    rt_cd: string;
    msg1?: string;
    output?: Array<Record<string, string>>;
  };
  if (json.rt_cd !== "0" || !json.output) {
    throw new Error(`KIS investor rt_cd=${json.rt_cd}: ${json.msg1 ?? ""}`);
  }
  // output array 의 각 행을 합산해 시장 단위 외국인/기관 순매수 추정
  let foreignSum = 0;
  let institutionSum = 0;
  const num = (o: Record<string, string>, keys: string[]): number => {
    for (const k of keys) {
      const v = o[k];
      if (v != null && v !== "") {
        const n = Number(v);
        if (Number.isFinite(n)) return n;
      }
    }
    return 0;
  };
  for (const row of json.output) {
    foreignSum += num(row, ["frgn_ntby_tr_pbmn", "frgn_ntby_qty"]);
    institutionSum += num(row, ["orgn_ntby_tr_pbmn", "orgn_ntby_qty"]);
  }
  // KIS는 백만원 단위로 응답 → 억원 환산 (÷100)
  const norm = (v: number) =>
    Math.abs(v) > 100_000 ? Math.round(v / 100) : Math.round(v);
  return {
    foreign: norm(foreignSum),
    institution: norm(institutionSum),
    individual: 0, // 이 TR은 개인 데이터 미포함
    asOf: new Date().toISOString(),
  };
}

/* ──────────────────────────── 코스피/코스닥 인덱스 ──────────────────────────── */

export type IndexCode = "KOSPI" | "KOSDAQ" | "KOSPI200";

const INDEX_CODE_MAP: Record<IndexCode, string> = {
  KOSPI: "0001",
  KOSDAQ: "1001",
  KOSPI200: "2001",
};

export interface KisIndex {
  code: IndexCode;
  value: number;
  change: number;
  changePct: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  asOf: string;
}

/**
 * 국내업종/지수 현재가.
 * KIS 문서: "국내업종 현재지수" (TR_ID FHPUP02100000)
 */
export async function fetchIndex(code: IndexCode): Promise<KisIndex> {
  const cfg = getConfig();
  const token = await getAccessToken();
  const isCd = INDEX_CODE_MAP[code];

  const url = new URL(`${cfg.baseUrl}/uapi/domestic-stock/v1/quotations/inquire-index-price`);
  url.searchParams.set("FID_COND_MRKT_DIV_CODE", "U"); // U: 업종/지수
  url.searchParams.set("FID_INPUT_ISCD", isCd);

  const res = await withRateLimit(() =>
    fetch(url, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        authorization: `Bearer ${token}`,
        appkey: cfg.appKey,
        appsecret: cfg.appSecret,
        tr_id: "FHPUP02100000",
      },
      cache: "no-store",
    }),
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`KIS inquire-index-price ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    rt_cd: string;
    msg1?: string;
    output?: Record<string, string>;
  };
  if (json.rt_cd !== "0" || !json.output) {
    throw new Error(`KIS index rt_cd=${json.rt_cd}: ${json.msg1 ?? ""}`);
  }
  const o = json.output;
  const num = (k: string): number => {
    const v = o[k];
    if (v == null || v === "") return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const value = num("bstp_nmix_prpr");
  const change = num("bstp_nmix_prdy_vrss");
  // 일부 응답은 prdy_ctrt 가 0으로 비어 오는 케이스가 있어 직접 계산으로 보완
  const prdyCtrt = num("prdy_ctrt");
  // 인덱스 전일종가는 응답 키가 누락되는 경우가 있어 value-change 로 역산
  const prevClose = num("prdy_nmix") || (value - change);
  const changePct =
    prdyCtrt !== 0 ? prdyCtrt : prevClose > 0 ? (change / prevClose) * 100 : 0;
  return {
    code,
    value,
    change,
    changePct,
    open: num("bstp_nmix_oprc"),
    high: num("bstp_nmix_hgpr"),
    low: num("bstp_nmix_lwpr"),
    prevClose,
    asOf: new Date().toISOString(),
  };
}
