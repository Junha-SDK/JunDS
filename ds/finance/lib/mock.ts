// Deterministic pseudo-random for stable mock
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedSeries(seed: number, count = 30, base = 100, vol = 0.04): number[] {
  const r = mulberry32(seed);
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < count; i++) {
    v = v * (1 + (r() - 0.5) * 2 * vol);
    out.push(Math.max(1, v));
  }
  return out;
}

export interface Candle {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  t: string;
}

export function seedCandles(seed: number, count = 90, base = 60_000, vol = 0.012): Candle[] {
  const r = mulberry32(seed);
  const out: Candle[] = [];
  let prevClose = base;
  for (let i = 0; i < count; i++) {
    const drift = (r() - 0.48) * 2 * vol;
    const o = prevClose;
    const c = Math.max(1, o * (1 + drift));
    const high = Math.max(o, c) * (1 + r() * vol * 0.6);
    const low = Math.min(o, c) * (1 - r() * vol * 0.6);
    const v = Math.round(50000 + r() * 200000);
    out.push({ o, h: high, l: low, c, v, t: `${i}` });
    prevClose = c;
  }
  return out;
}

export function seedSurgeCandles(
  seed: number,
  count = 90,
  base = 60_000,
  surgeAt = 60,
  surgeMag = 0.27,
): Candle[] {
  const baseCandles = seedCandles(seed, count, base, 0.008);
  let scale = 1;
  for (let i = 0; i < count; i++) {
    if (i >= surgeAt && i < surgeAt + 12) {
      scale *= 1 + (surgeMag / 12) * (1 - (i - surgeAt) / 14);
    }
    const c = baseCandles[i];
    const factor = scale;
    baseCandles[i] = {
      o: c.o * factor,
      h: c.h * factor * (1 + 0.005),
      l: c.l * factor,
      c: c.c * factor,
      v: i >= surgeAt && i < surgeAt + 14 ? c.v * 6 : c.v,
      t: c.t,
    };
  }
  return baseCandles;
}

export interface ThemeStock {
  name: string;
  price: number;
  pct: number;
  amount억: number;
  time?: string;
  hot?: boolean;
  king?: boolean;
  sparkSeed: number;
  posLow: number;
  posHigh: number;
  posCur: number;
}

export interface ThemeBlock {
  name: string;
  total억: number;
  headline: string;
  tone: "teal" | "yellow";
  starred: boolean;
  stocks: ThemeStock[];
}

export const THEMES: ThemeBlock[] = [
  {
    name: "증권",
    total억: 50735,
    headline: "'불장'에 증권사도 활짝 웃었다…",
    tone: "teal",
    starred: true,
    stocks: [
      {
        name: "유안타증권",
        price: 7810,
        pct: 29.52,
        amount억: 2238,
        time: "12:44",
        hot: true,
        sparkSeed: 11,
        posLow: 0.55,
        posHigh: 1,
        posCur: 0.95,
      },
      {
        name: "미래에셋증권",
        price: 87400,
        pct: 24.32,
        amount억: 30977,
        sparkSeed: 22,
        posLow: 0.4,
        posHigh: 0.95,
        posCur: 0.78,
      },
      {
        name: "한화투자증권",
        price: 9360,
        pct: 14.29,
        amount억: 3145,
        sparkSeed: 33,
        posLow: 0.3,
        posHigh: 0.7,
        posCur: 0.55,
      },
      {
        name: "삼성증권",
        price: 151900,
        pct: 10.15,
        amount억: 14374,
        sparkSeed: 44,
        posLow: 0.25,
        posHigh: 0.6,
        posCur: 0.45,
      },
    ],
  },
  {
    name: "송배전1",
    total억: 30525,
    headline: "K-전력, AI 데이터센터 해결사…",
    tone: "teal",
    starred: true,
    stocks: [
      {
        name: "KBI메탈",
        price: 8610,
        pct: 29.86,
        amount억: 1242,
        time: "09:02",
        hot: true,
        sparkSeed: 55,
        posLow: 0.6,
        posHigh: 1,
        posCur: 0.97,
      },
      {
        name: "선도전기",
        price: 13470,
        pct: 22.68,
        amount억: 2263,
        time: "09:02",
        sparkSeed: 66,
        posLow: 0.4,
        posHigh: 0.85,
        posCur: 0.65,
      },
      {
        name: "대한전선",
        price: 68300,
        pct: 12.52,
        amount억: 17471,
        sparkSeed: 77,
        posLow: 0.35,
        posHigh: 0.75,
        posCur: 0.6,
      },
      {
        name: "LS ELECTRIC",
        price: 316000,
        pct: 7.48,
        amount억: 9548,
        sparkSeed: 88,
        posLow: 0.3,
        posHigh: 0.55,
        posCur: 0.42,
      },
    ],
  },
  {
    name: "반도체",
    total억: 318553,
    headline: "인텔 13%, 마이크론 11% 급등…",
    tone: "teal",
    starred: true,
    stocks: [
      {
        name: "삼성전자",
        price: 267500,
        pct: 15.05,
        amount억: 178194,
        king: true,
        sparkSeed: 1,
        posLow: 0.4,
        posHigh: 0.7,
        posCur: 0.62,
      },
      {
        name: "SK하이닉스",
        price: 1599000,
        pct: 10.5,
        amount억: 116001,
        sparkSeed: 2,
        posLow: 0.45,
        posHigh: 0.65,
        posCur: 0.5,
      },
      {
        name: "SK스퀘어",
        price: 1084000,
        pct: 9.38,
        amount억: 21865,
        sparkSeed: 3,
        posLow: 0.35,
        posHigh: 0.7,
        posCur: 0.6,
      },
      {
        name: "고영",
        price: 40750,
        pct: 4.62,
        amount억: 2492,
        sparkSeed: 4,
        posLow: 0.3,
        posHigh: 0.5,
        posCur: 0.4,
      },
    ],
  },
  {
    name: "유리기판",
    total억: 18664,
    headline: "엔비디아 '전력·열 한계' 해결…",
    tone: "teal",
    starred: false,
    stocks: [
      {
        name: "SKC",
        price: 161200,
        pct: 30.0,
        amount억: 8741,
        time: "10:00",
        hot: true,
        sparkSeed: 12,
        posLow: 0.5,
        posHigh: 1,
        posCur: 0.98,
      },
      {
        name: "HB테크놀러지",
        price: 4020,
        pct: 29.89,
        amount억: 780,
        time: "09:23",
        hot: true,
        sparkSeed: 13,
        posLow: 0.55,
        posHigh: 1,
        posCur: 0.97,
      },
      {
        name: "필옵틱스",
        price: 62000,
        pct: 27.44,
        amount억: 5985,
        time: "10:13",
        sparkSeed: 14,
        posLow: 0.4,
        posHigh: 0.95,
        posCur: 0.86,
      },
      {
        name: "켐트로닉스",
        price: 44600,
        pct: 17.21,
        amount억: 3157,
        sparkSeed: 15,
        posLow: 0.35,
        posHigh: 0.78,
        posCur: 0.65,
      },
    ],
  },
  {
    name: "보안/양자",
    total억: 5756,
    headline: "양자 통신 사업화 본격화…",
    tone: "teal",
    starred: false,
    stocks: [],
  },
  {
    name: "밸류업",
    total억: 14350,
    headline: "정부, 기업 밸류업 후속 정책…",
    tone: "teal",
    starred: false,
    stocks: [],
  },
];

export interface NxtRow {
  name: string;
  cap천억: number;
  price: number;
  pct: number;
  prevClose: number;
  prevPct: number;
  pre억: number;
  cumul억: number;
  candleSeed: number;
}

export const NXT_ROWS: NxtRow[] = [
  { name: "삼성전자", cap천억: 15624, price: 267250, pct: 14.95, prevClose: 230000, prevPct: 3.37, pre억: 28039, cumul억: 178227, candleSeed: 21 },
  { name: "SK하이닉스", cap천억: 11388, price: 1598000, pct: 10.44, prevClose: 1438000, prevPct: 11.13, pre억: 25631, cumul억: 116025, candleSeed: 22 },
  { name: "미래에셋증권", cap천억: 489, price: 87300, pct: 24.18, prevClose: 69900, prevPct: 6.88, pre억: 4555, cumul억: 31004, candleSeed: 23 },
  { name: "SK스퀘어", cap천억: 1429, price: 1083000, pct: 9.28, prevClose: 999000, prevPct: 16.98, pre억: 3839, cumul억: 21872, candleSeed: 24 },
  { name: "현대차", cap천억: 1124, price: 549000, pct: 1.86, prevClose: 539000, prevPct: 0.75, pre억: 2638, cumul억: 16522, candleSeed: 25 },
  { name: "삼성전기", cap천억: 685, price: 918000, pct: 0.0, prevClose: 909000, prevPct: 9.12, pre억: 2564, cumul억: 15136, candleSeed: 26 },
  { name: "삼성증권", cap천억: 135, price: 151600, pct: 9.93, prevClose: 139700, prevPct: 29.23, pre억: 5739, cumul억: 14379, candleSeed: 27 },
  { name: "한미반도체", cap천억: 365, price: 384500, pct: 1.72, prevClose: 374000, prevPct: 1.08, pre억: 3884, cumul억: 10602, candleSeed: 28 },
  { name: "삼성SDI", cap천억: 564, price: 701000, pct: -0.57, prevClose: 702000, prevPct: 0.0, pre억: 1809, cumul억: 9963, candleSeed: 29 },
];

export type ScheduleKind =
  | "earnings_us"
  | "earnings_kr"
  | "expo"
  | "ipo"
  | "policy_us"
  | "policy_kr"
  | "dividend"
  | "split";

export interface IpoMeta {
  /** 공모가 밴드 하단 (원) */
  offerPriceLow?: number;
  /** 공모가 밴드 상단 (원) */
  offerPriceHigh?: number;
  /** 확정 공모가 (원) — 청약 진행 중에 노출 */
  offerPriceFinal?: number;
  /** 청약 일자 (YYYY-MM-DD ~ YYYY-MM-DD) */
  bookbuildingRange?: string;
  /** 상장 예정일 (YYYY-MM-DD) */
  listingDate?: string;
  /** 주관사 */
  underwriter?: string;
  /** 시장 (KOSPI/KOSDAQ/KONEX/NXT) */
  market?: string;
  /** 상태 */
  status?: "수요예측" | "청약" | "환불" | "상장";
}

export interface ScheduleItem {
  kind: ScheduleKind;
  title: string;
  /** ISO 시작일 YYYY-MM-DD */
  date: string;
  /** ISO 종료일 (다일정 행사) */
  endDate?: string;
  /** 텍스트 표시용 기간 */
  range?: string;
  /** IPO 전용 메타데이터 */
  ipo?: IpoMeta;
}

export const SCHEDULE: ScheduleItem[] = [
  // ── 1주차 (5/4 ~ 5/8) ───────────────────────────────────────────
  { kind: "earnings_kr", title: "한화 1분기 실적발표", date: "2026-05-04" },
  { kind: "earnings_kr", title: "DB하이텍 1분기 실적발표", date: "2026-05-04" },
  { kind: "earnings_us", title: "美) 코히런트 1분기 실적발표 (현지시간)", date: "2026-05-04" },
  {
    kind: "expo",
    title: "국제인공지능대전 ‘AI EXPO KOREA 2026’",
    date: "2026-05-04",
    endDate: "2026-05-08",
    range: "~8일",
  },
  { kind: "earnings_us", title: "美) 앨버말 1분기 실적발표 (현지시간)", date: "2026-05-05" },
  { kind: "earnings_us", title: "美) 아이온큐 1분기 실적발표 (현지시간)", date: "2026-05-05" },
  { kind: "earnings_kr", title: "코나아이 1분기 실적발표", date: "2026-05-05" },
  {
    kind: "expo",
    title: "美) 미국안과학회 ARVO 2026 (현지시간)",
    date: "2026-05-05",
    endDate: "2026-05-11",
    range: "~7일",
  },
  { kind: "earnings_us", title: "美) 노보노디스크 1분기 실적발표 (현지시간)", date: "2026-05-06" },
  { kind: "earnings_us", title: "美) ARM 1분기 실적발표 (현지시간)", date: "2026-05-06" },
  { kind: "earnings_kr", title: "카카오그룹 1분기 실적발표", date: "2026-05-06" },
  { kind: "earnings_kr", title: "대덕전자 1분기 실적발표", date: "2026-05-06" },
  {
    kind: "policy_us",
    title: "김정관 산업부 장관 러트닉 상무장관 전략투자 예비협의 (현지시간)",
    date: "2026-05-06",
  },
  {
    kind: "policy_kr",
    title: "李대통령 ‘호르무즈 선박 화재’ 국무회의 — 美 작전 참여 제안 논의",
    date: "2026-05-06",
  },
  {
    kind: "ipo",
    title: "폴레드 공모청약",
    date: "2026-05-05",
    endDate: "2026-05-06",
    range: "~6일",
    ipo: {
      offerPriceLow: 16000,
      offerPriceHigh: 20000,
      offerPriceFinal: 19500,
      bookbuildingRange: "2026-05-05 ~ 2026-05-06",
      listingDate: "2026-05-15",
      underwriter: "미래에셋증권",
      market: "KOSDAQ",
      status: "청약",
    },
  },
  {
    kind: "ipo",
    title: "에이펙스랩 수요예측",
    date: "2026-05-04",
    endDate: "2026-05-07",
    range: "수요예측",
    ipo: {
      offerPriceLow: 24000,
      offerPriceHigh: 28000,
      bookbuildingRange: "2026-05-04 ~ 2026-05-07",
      listingDate: "2026-05-21",
      underwriter: "한국투자증권",
      market: "KOSDAQ",
      status: "수요예측",
    },
  },
  { kind: "earnings_us", title: "美) 디즈니 2분기 실적발표 (현지시간)", date: "2026-05-07" },
  { kind: "earnings_kr", title: "유니테크노 IR 개최", date: "2026-05-07", range: "~8일" },
  {
    kind: "expo",
    title: "美) 디스플레이 박람회 SID 2026 (현지시간)",
    date: "2026-05-07",
    endDate: "2026-05-13",
    range: "~7일",
  },
  { kind: "dividend", title: "삼성전자 분기배당 배당락", date: "2026-05-07" },
  { kind: "earnings_us", title: "美) 엔비디아 1분기 실적 가이던스 (현지시간)", date: "2026-05-08" },
  { kind: "policy_kr", title: "한국은행 금융통화위원회 (기준금리 결정)", date: "2026-05-08" },
  {
    kind: "expo",
    title: "美) 송배전 전시회 IEEE PES T&D 2026 (현지시간)",
    date: "2026-05-08",
    endDate: "2026-05-14",
    range: "~7일",
  },
  {
    kind: "expo",
    title: "동남아시아 반도체 전시회 SEMICON SEA 2026 (현지시간)",
    date: "2026-05-08",
    endDate: "2026-05-14",
    range: "~7일",
  },

  // ── 2주차 (5/11 ~ 5/15) ─────────────────────────────────────────
  { kind: "earnings_us", title: "美) JD.com 1분기 실적발표 (현지시간)", date: "2026-05-12" },
  { kind: "earnings_kr", title: "현대백화점 1분기 실적발표", date: "2026-05-12" },
  { kind: "policy_us", title: "美) 4월 CPI 발표 (현지시간)", date: "2026-05-12" },
  { kind: "earnings_kr", title: "셀트리온 1분기 실적발표", date: "2026-05-13" },
  { kind: "earnings_us", title: "美) 시스코 3분기 실적발표 (현지시간)", date: "2026-05-13" },
  { kind: "earnings_kr", title: "엔씨소프트 1분기 실적발표", date: "2026-05-14" },
  { kind: "earnings_us", title: "美) 월마트 1분기 실적발표 (현지시간)", date: "2026-05-14" },
  {
    kind: "ipo",
    title: "폴레드 KOSDAQ 신규상장",
    date: "2026-05-15",
    range: "상장",
    ipo: {
      offerPriceFinal: 19500,
      listingDate: "2026-05-15",
      underwriter: "미래에셋증권",
      market: "KOSDAQ",
      status: "상장",
    },
  },
  { kind: "split", title: "와이지엔터테인먼트 액면분할 거래정지 해제", date: "2026-05-15" },

  // ── 3주차 (5/18 ~ 5/22) ─────────────────────────────────────────
  { kind: "earnings_us", title: "美) 홈디포 1분기 실적발표 (현지시간)", date: "2026-05-19" },
  { kind: "earnings_kr", title: "LG에너지솔루션 1분기 실적발표", date: "2026-05-19" },
  { kind: "earnings_us", title: "美) 타깃 1분기 실적발표 (현지시간)", date: "2026-05-20" },
  { kind: "earnings_us", title: "美) 엔비디아 1분기 실적발표 (현지시간)", date: "2026-05-20" },
  { kind: "policy_us", title: "美) FOMC 의사록 공개 (현지시간)", date: "2026-05-20" },
  {
    kind: "ipo",
    title: "에이펙스랩 KOSDAQ 신규상장",
    date: "2026-05-21",
    range: "상장",
    ipo: {
      offerPriceFinal: 27000,
      listingDate: "2026-05-21",
      underwriter: "한국투자증권",
      market: "KOSDAQ",
      status: "상장",
    },
  },
  { kind: "earnings_kr", title: "삼성SDI 1분기 실적발표", date: "2026-05-21" },
  { kind: "policy_kr", title: "한국 4월 수출입 동향 발표", date: "2026-05-21" },
  { kind: "earnings_us", title: "美) 인튜이트 3분기 실적발표 (현지시간)", date: "2026-05-22" },

  // ── 4주차 (5/25 ~ 5/29) ─────────────────────────────────────────
  {
    kind: "ipo",
    title: "큐비트테라퓨틱스 수요예측",
    date: "2026-05-26",
    endDate: "2026-05-28",
    range: "수요예측",
    ipo: {
      offerPriceLow: 32000,
      offerPriceHigh: 38000,
      bookbuildingRange: "2026-05-26 ~ 2026-05-28",
      listingDate: "2026-06-12",
      underwriter: "NH투자증권",
      market: "KOSPI",
      status: "수요예측",
    },
  },
  { kind: "earnings_kr", title: "카카오뱅크 1분기 실적발표", date: "2026-05-26" },
  { kind: "earnings_us", title: "美) 베스트바이 1분기 실적발표 (현지시간)", date: "2026-05-27" },
  { kind: "policy_kr", title: "한국 1분기 GDP 잠정치 발표", date: "2026-05-27" },
  { kind: "earnings_us", title: "美) 세일즈포스 1분기 실적발표 (현지시간)", date: "2026-05-28" },
  { kind: "policy_us", title: "美) 1분기 GDP 잠정치 (현지시간)", date: "2026-05-29" },
  {
    kind: "ipo",
    title: "솔리도네트웍스 청약",
    date: "2026-05-28",
    endDate: "2026-05-29",
    range: "청약",
    ipo: {
      offerPriceLow: 11000,
      offerPriceHigh: 13500,
      offerPriceFinal: 13500,
      bookbuildingRange: "2026-05-28 ~ 2026-05-29",
      listingDate: "2026-06-09",
      underwriter: "삼성증권",
      market: "KOSDAQ",
      status: "청약",
    },
  },
  { kind: "dividend", title: "POSCO홀딩스 분기배당 배당락", date: "2026-05-28" },

  // ── 추가 배당 일정 ─────────────────────────────────────────────
  { kind: "dividend", title: "SK하이닉스 분기배당 배당락", date: "2026-05-14" },
  { kind: "dividend", title: "신한지주 분기배당 배당락", date: "2026-05-15" },
  { kind: "dividend", title: "KB금융 분기배당 배당락", date: "2026-05-15" },
  { kind: "dividend", title: "하나금융지주 분기배당 배당락", date: "2026-05-19" },
  { kind: "dividend", title: "현대차 분기배당 배당락", date: "2026-05-22" },
  { kind: "dividend", title: "삼성전자 분기배당 지급일", date: "2026-05-21" },
  { kind: "dividend", title: "POSCO홀딩스 분기배당 지급일", date: "2026-06-12" },
  { kind: "dividend", title: "현대차 분기배당 지급일", date: "2026-06-15" },
  { kind: "dividend", title: "KT&G 결산배당 지급일", date: "2026-04-30" },
  { kind: "split", title: "에코프로비엠 액면분할 매매재개", date: "2026-05-21" },
];

export type ZoneKind = "F" | "SF" | "G" | "J";

export interface FZoneCard {
  name: string;
  /** Zone family. Defaults to "F" when omitted (back-compat with F존포착). */
  kind?: ZoneKind;
  status: string;
  price: number;
  pct: number;
  cap조: number;
  amount억: number;
  resistance: number;
  b1: number;
  b2: number;
  b3: number;
  marker: "high" | "mid" | "low";
}

export const FZONE_CARDS: FZoneCard[] = [
  { name: "보성파워텍", kind: "F", status: "F존임박", price: 15360, pct: 7.04, cap조: 0.8, amount억: 5152, resistance: 15940, b1: 15080, b2: 14750, b3: 14420, marker: "high" },
  { name: "씨아이에스", kind: "F", status: "F존임박", price: 16820, pct: -2.15, cap조: 1.3, amount억: 492, resistance: 17300, b1: 16490, b2: 16130, b3: 15770, marker: "mid" },
  { name: "대원전선", kind: "F", status: "B1", price: 17750, pct: 2.31, cap조: 1.4, amount억: 4799, resistance: 18400, b1: 17940, b2: 17550, b3: 17160, marker: "mid" },
  { name: "한국항공우주", kind: "F", status: "B1", price: 178300, pct: -0.94, cap조: 17.4, amount억: 3764, resistance: 184100, b1: 177700, b2: 173900, b3: 170000, marker: "mid" },
  { name: "서울반도체", kind: "F", status: "B2", price: 16740, pct: -6.64, cap조: 1.0, amount억: 343, resistance: 17050, b1: 16850, b2: 16480, b3: 16110, marker: "low" },
  { name: "SK이노베이션", kind: "F", status: "B2", price: 144400, pct: -0.89, cap조: 24.4, amount억: 2231, resistance: 145100, b1: 142900, b2: 139800, b3: 136700, marker: "low" },
];

export const SFZONE_CARDS: FZoneCard[] = [
  { name: "리노공업", kind: "SF", status: "SF임박", price: 213500, pct: 1.62, cap조: 3.2, amount억: 982, resistance: 219800, b1: 209400, b2: 204100, b3: 199500, marker: "high" },
  { name: "에코프로비엠", kind: "SF", status: "SF1", price: 178200, pct: -1.83, cap조: 17.4, amount억: 4127, resistance: 184500, b1: 177900, b2: 172500, b3: 168000, marker: "mid" },
  { name: "포스코퓨처엠", kind: "SF", status: "SF1", price: 226000, pct: 0.44, cap조: 17.5, amount억: 2810, resistance: 232400, b1: 225600, b2: 219000, b3: 213400, marker: "mid" },
  { name: "엘앤에프", kind: "SF", status: "SF2", price: 95400, pct: -2.65, cap조: 3.5, amount억: 681, resistance: 98700, b1: 96900, b2: 95100, b3: 92800, marker: "low" },
];

export const GOLDZONE_CARDS: FZoneCard[] = [
  { name: "삼성전자", kind: "G", status: "G존임박", price: 73400, pct: 0.55, cap조: 438.4, amount억: 18720, resistance: 75900, b1: 72800, b2: 70200, b3: 67500, marker: "high" },
  { name: "현대차", kind: "G", status: "G1", price: 234500, pct: -0.42, cap조: 49.1, amount억: 5310, resistance: 241000, b1: 233800, b2: 226400, b3: 219000, marker: "mid" },
  { name: "KB금융", kind: "G", status: "G1", price: 78600, pct: 0.77, cap조: 31.6, amount억: 2418, resistance: 81200, b1: 78400, b2: 76100, b3: 73800, marker: "mid" },
  { name: "LG화학", kind: "G", status: "G2", price: 312000, pct: -1.27, cap조: 22.0, amount억: 3940, resistance: 320500, b1: 318000, b2: 311500, b3: 304200, marker: "low" },
  { name: "NAVER", kind: "G", status: "G2", price: 187300, pct: 0.16, cap조: 30.7, amount억: 2104, resistance: 192800, b1: 191000, b2: 187100, b3: 182700, marker: "low" },
];

export const SWING38_CARDS: FZoneCard[] = [
  { name: "필옵틱스", kind: "J", status: "38임박", price: 62000, pct: 5.91, cap조: 1.5, amount억: 5986, resistance: 64500, b1: 60700, b2: 58400, b3: 56200, marker: "high" },
  { name: "한미반도체", kind: "J", status: "J1", price: 142800, pct: -1.85, cap조: 13.9, amount억: 4502, resistance: 147500, b1: 142400, b2: 138100, b3: 134000, marker: "mid" },
  { name: "두산에너빌리티", kind: "J", status: "J1", price: 21450, pct: 2.14, cap조: 13.7, amount억: 3211, resistance: 22100, b1: 21380, b2: 20720, b3: 20100, marker: "mid" },
  { name: "SKC", kind: "J", status: "J2", price: 161200, pct: -3.02, cap조: 6.1, amount억: 2748, resistance: 167500, b1: 165200, b2: 160900, b3: 156400, marker: "low" },
];

export const PORTFOLIO_DAYS = [
  { date: "2026.05.06", profit: 98391, pct: 4.69, sellAmount: 2200200, buyAmount: 765040, sellQty: 120, buyQty: 73, fees: 4679 },
  { date: "2026.05.04", profit: 142500, pct: 3.21, sellAmount: 4500000, buyAmount: 2200000, sellQty: 95, buyQty: 60, fees: 6300 },
  { date: "2026.04.30", profit: -52340, pct: -1.45, sellAmount: 1850000, buyAmount: 980000, sellQty: 70, buyQty: 40, fees: 3500 },
  { date: "2026.04.29", profit: 213400, pct: 5.88, sellAmount: 3850000, buyAmount: 1620000, sellQty: 110, buyQty: 80, fees: 5400 },
  { date: "2026.04.28", profit: 31200, pct: 1.04, sellAmount: 1500000, buyAmount: 1200000, sellQty: 50, buyQty: 45, fees: 2900 },
];

export interface OrderRow {
  price: number;
  qty: number;
  pct: number;
  marker?: "SF";
}

export function makeOrderBook(base: number) {
  const tick = 100;
  const asks: OrderRow[] = [];
  const bids: OrderRow[] = [];
  for (let i = 5; i >= 1; i--) {
    const p = base + tick * i;
    asks.push({ price: p, qty: 200 + Math.round(Math.random() * 1800), pct: ((p / 60600 - 1) * 100) });
  }
  asks.push({ price: base, qty: 1628, pct: ((base / 60600 - 1) * 100), marker: "SF" });
  bids.push({ price: base - tick, qty: 523, pct: ((base - tick) / 60600 - 1) * 100 });
  for (let i = 2; i <= 6; i++) {
    const p = base - tick * i;
    bids.push({ price: p, qty: 600 + Math.round(Math.random() * 5000), pct: ((p / 60600 - 1) * 100) });
  }
  return { asks, bids };
}
