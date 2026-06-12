import { DAILY_THEMES, type DailyThemeEntry, type LeaderStock } from "./dailyThemes";

export interface MonthlyThemeEntry {
  /** YYYY-MM */
  month: string;
  /** 한국어 라벨 (예: "2025년 11월") */
  label: string;
  /** 거래일 수 */
  tradingDays: number;
  /** 월초 KOSPI 종가 */
  kospiOpen: number;
  /** 월말 KOSPI 종가 */
  kospiClose: number;
  /** 월초 평가금액 (원) */
  portfolioOpen: number;
  /** 월말 평가금액 (원) */
  portfolioClose: number;
  /** 등장 빈도 상위 주도 테마 */
  topThemes: { name: string; count: number }[];
  /** 등장 빈도 상위 왕관 종목 */
  topLeaders: { name: string; count: number; lastClose: number; lastPct: number }[];
  /** 월간 베스트 단일 일자 (코스피 변동 최대) */
  bestDay?: { date: string; pct: number };
  /** 월간 워스트 단일 일자 (코스피 변동 최저) */
  worstDay?: { date: string; pct: number };
  /** 휴장일 수 (주말 제외, 평일 휴장) */
  weekdayHolidays: number;
  /** 핵심 메모 (사용자 표시용) */
  note?: string;
  isCurrent?: boolean;
}

function monthKey(date: string): string {
  return date.slice(0, 7);
}

function monthLabel(month: string): string {
  const [y, m] = month.split("-");
  return `${y}년 ${Number(m)}월`;
}

/** Aggregates DAILY_THEMES into a single MonthlyThemeEntry. */
function aggregateMonth(month: string, entries: DailyThemeEntry[]): MonthlyThemeEntry {
  const trading = entries.filter((e) => !e.isHoliday && e.kospiClose > 0);
  const themeCount = new Map<string, number>();
  trading.forEach((d) =>
    d.themes.forEach((t) => themeCount.set(t, (themeCount.get(t) ?? 0) + 1)),
  );
  const topThemes = [...themeCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const leaderCount = new Map<string, { count: number; last: LeaderStock | null }>();
  trading.forEach((d) => {
    d.leaders?.forEach((l) => {
      const cur = leaderCount.get(l.name) ?? { count: 0, last: null };
      cur.count += 1;
      cur.last = l;
      leaderCount.set(l.name, cur);
    });
  });
  const topLeaders = [...leaderCount.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([name, v]) => ({
      name,
      count: v.count,
      lastClose: v.last?.close ?? 0,
      lastPct: v.last?.pct ?? 0,
    }));

  const sortedByPct = [...trading].sort((a, b) => a.코스피변동 - b.코스피변동);
  const worst = sortedByPct[0];
  const best = sortedByPct[sortedByPct.length - 1];

  const first = trading[0];
  const last = trading[trading.length - 1];

  const weekdayHolidays = entries.filter((e) => e.isHoliday).length;

  return {
    month,
    label: monthLabel(month),
    tradingDays: trading.length,
    kospiOpen: first?.kospiClose ?? 0,
    kospiClose: last?.kospiClose ?? 0,
    portfolioOpen: first?.portfolio ?? 0,
    portfolioClose: last?.portfolio ?? 0,
    topThemes,
    topLeaders,
    bestDay: best ? { date: best.date, pct: best.코스피변동 } : undefined,
    worstDay: worst ? { date: worst.date, pct: worst.코스피변동 } : undefined,
    weekdayHolidays,
    isCurrent: entries.some((e) => e.isToday),
  };
}

const APRIL_2026 = aggregateMonth(
  "2026-04",
  DAILY_THEMES.filter((d) => monthKey(d.date) === "2026-04"),
);

const MAY_2026 = aggregateMonth(
  "2026-05",
  DAILY_THEMES.filter((d) => monthKey(d.date) === "2026-05"),
);

/**
 * 과거 월별 데이터 — 일별 데이터가 없는 월은 시드 통계로 채워둠.
 * 신규 백테스트가 들어오면 점진 교체하면 됨.
 */
const HISTORICAL: MonthlyThemeEntry[] = [
  {
    month: "2025-06",
    label: "2025년 6월",
    tradingDays: 21,
    kospiOpen: 2645.1,
    kospiClose: 2823.4,
    portfolioOpen: 41_500_000,
    portfolioClose: 44_120_000,
    topThemes: [
      { name: "방산", count: 11 },
      { name: "조선", count: 9 },
      { name: "AI 반도체", count: 8 },
      { name: "원전", count: 6 },
      { name: "전력", count: 5 },
    ],
    topLeaders: [
      { name: "한화에어로스페이스", count: 8, lastClose: 612000, lastPct: 4.1 },
      { name: "HD현대중공업", count: 6, lastClose: 401000, lastPct: 2.6 },
      { name: "두산퓨얼셀", count: 5, lastClose: 32100, lastPct: 5.7 },
    ],
    bestDay: { date: "2025-06-12", pct: 2.34 },
    worstDay: { date: "2025-06-26", pct: -1.62 },
    weekdayHolidays: 1,
    note: "관세 협상 진전·여름 휴가철 거래대금 회복.",
  },
  {
    month: "2025-07",
    label: "2025년 7월",
    tradingDays: 22,
    kospiOpen: 2823.4,
    kospiClose: 2941.7,
    portfolioOpen: 44_120_000,
    portfolioClose: 47_280_000,
    topThemes: [
      { name: "AI 반도체", count: 12 },
      { name: "전력", count: 9 },
      { name: "데이터센터", count: 7 },
      { name: "유리기판", count: 5 },
      { name: "방산", count: 4 },
    ],
    topLeaders: [
      { name: "SK하이닉스", count: 11, lastClose: 218000, lastPct: 3.2 },
      { name: "한미반도체", count: 7, lastClose: 152000, lastPct: 6.1 },
      { name: "LS ELECTRIC", count: 5, lastClose: 263000, lastPct: 3.9 },
    ],
    bestDay: { date: "2025-07-14", pct: 1.92 },
    worstDay: { date: "2025-07-29", pct: -1.41 },
    weekdayHolidays: 0,
    note: "AI 인프라 모멘텀이 송배전·전력 섹터로 확장.",
  },
  {
    month: "2025-08",
    label: "2025년 8월",
    tradingDays: 20,
    kospiOpen: 2941.7,
    kospiClose: 2887.0,
    portfolioOpen: 47_280_000,
    portfolioClose: 46_410_000,
    topThemes: [
      { name: "AI 반도체", count: 9 },
      { name: "조선", count: 7 },
      { name: "방산", count: 6 },
      { name: "원전", count: 5 },
      { name: "2차전지", count: 4 },
    ],
    topLeaders: [
      { name: "삼성전자", count: 9, lastClose: 76800, lastPct: -1.8 },
      { name: "SK하이닉스", count: 6, lastClose: 211000, lastPct: -2.3 },
    ],
    bestDay: { date: "2025-08-08", pct: 1.42 },
    worstDay: { date: "2025-08-22", pct: -2.18 },
    weekdayHolidays: 1,
    note: "광복절·휴가철 변동성 + 잭슨홀 미팅 경계감.",
  },
  {
    month: "2025-09",
    label: "2025년 9월",
    tradingDays: 19,
    kospiOpen: 2887.0,
    kospiClose: 3014.6,
    portfolioOpen: 46_410_000,
    portfolioClose: 49_180_000,
    topThemes: [
      { name: "AI 반도체", count: 10 },
      { name: "유리기판", count: 8 },
      { name: "데이터센터", count: 6 },
      { name: "디스플레이", count: 5 },
      { name: "전력", count: 4 },
    ],
    topLeaders: [
      { name: "SK하이닉스", count: 9, lastClose: 234500, lastPct: 4.7 },
      { name: "SKC", count: 6, lastClose: 142000, lastPct: 8.2 },
      { name: "필옵틱스", count: 5, lastClose: 56400, lastPct: 6.9 },
    ],
    bestDay: { date: "2025-09-19", pct: 2.04 },
    worstDay: { date: "2025-09-04", pct: -1.13 },
    weekdayHolidays: 3,
    note: "엔비디아 GTC 영향 + 추석 연휴 후 반등.",
  },
  {
    month: "2025-10",
    label: "2025년 10월",
    tradingDays: 17,
    kospiOpen: 3014.6,
    kospiClose: 2962.3,
    portfolioOpen: 49_180_000,
    portfolioClose: 48_640_000,
    topThemes: [
      { name: "방산", count: 7 },
      { name: "전력", count: 6 },
      { name: "AI 반도체", count: 5 },
      { name: "조선", count: 5 },
      { name: "광통신", count: 4 },
    ],
    topLeaders: [
      { name: "한화에어로스페이스", count: 5, lastClose: 654000, lastPct: 1.4 },
      { name: "SK하이닉스", count: 4, lastClose: 232500, lastPct: -0.8 },
    ],
    bestDay: { date: "2025-10-22", pct: 1.78 },
    worstDay: { date: "2025-10-31", pct: -2.41 },
    weekdayHolidays: 4,
    note: "추석·개천절·한글날로 거래일 적음. FOMC 매파 발언에 차익실현.",
  },
  {
    month: "2025-11",
    label: "2025년 11월",
    tradingDays: 20,
    kospiOpen: 2962.3,
    kospiClose: 2890.8,
    portfolioOpen: 48_640_000,
    portfolioClose: 47_280_000,
    topThemes: [
      { name: "보험", count: 6 },
      { name: "은행", count: 5 },
      { name: "방산", count: 5 },
      { name: "AI 반도체", count: 4 },
      { name: "조선", count: 4 },
    ],
    topLeaders: [
      { name: "삼성생명", count: 4, lastClose: 121000, lastPct: 2.3 },
      { name: "KB금융", count: 4, lastClose: 79800, lastPct: 1.9 },
    ],
    bestDay: { date: "2025-11-12", pct: 1.32 },
    worstDay: { date: "2025-11-25", pct: -1.95 },
    weekdayHolidays: 0,
    note: "밸류업 후속 정책 기대 → 금융주 강세, IT 차익실현.",
  },
  {
    month: "2025-12",
    label: "2025년 12월",
    tradingDays: 19,
    kospiOpen: 2890.8,
    kospiClose: 3104.2,
    portfolioOpen: 47_280_000,
    portfolioClose: 51_320_000,
    topThemes: [
      { name: "AI 반도체", count: 9 },
      { name: "유리기판", count: 7 },
      { name: "데이터센터", count: 6 },
      { name: "전력", count: 5 },
      { name: "조선", count: 4 },
    ],
    topLeaders: [
      { name: "SK하이닉스", count: 8, lastClose: 256000, lastPct: 5.2 },
      { name: "삼성전자", count: 6, lastClose: 88400, lastPct: 3.4 },
      { name: "SKC", count: 5, lastClose: 168000, lastPct: 7.1 },
    ],
    bestDay: { date: "2025-12-18", pct: 2.61 },
    worstDay: { date: "2025-12-08", pct: -0.78 },
    weekdayHolidays: 2,
    note: "연말 산타랠리 — AI 인프라 종목 주도.",
  },
  {
    month: "2026-01",
    label: "2026년 1월",
    tradingDays: 19,
    kospiOpen: 3104.2,
    kospiClose: 3210.5,
    portfolioOpen: 51_320_000,
    portfolioClose: 53_880_000,
    topThemes: [
      { name: "유리기판", count: 8 },
      { name: "AI 반도체", count: 7 },
      { name: "전력", count: 6 },
      { name: "송배전", count: 5 },
      { name: "데이터센터", count: 5 },
    ],
    topLeaders: [
      { name: "SKC", count: 7, lastClose: 182000, lastPct: 4.5 },
      { name: "SK하이닉스", count: 6, lastClose: 269500, lastPct: 2.8 },
      { name: "필옵틱스", count: 5, lastClose: 61500, lastPct: 6.2 },
    ],
    bestDay: { date: "2026-01-15", pct: 2.18 },
    worstDay: { date: "2026-01-23", pct: -1.04 },
    weekdayHolidays: 1,
    note: "CES 2026 발 AI 인프라 후속 강세.",
  },
  {
    month: "2026-02",
    label: "2026년 2월",
    tradingDays: 17,
    kospiOpen: 3210.5,
    kospiClose: 3088.4,
    portfolioOpen: 53_880_000,
    portfolioClose: 51_240_000,
    topThemes: [
      { name: "조선", count: 6 },
      { name: "방산", count: 5 },
      { name: "원전", count: 5 },
      { name: "AI 반도체", count: 4 },
      { name: "은행", count: 4 },
    ],
    topLeaders: [
      { name: "HD현대중공업", count: 5, lastClose: 418000, lastPct: 2.4 },
      { name: "한화에어로스페이스", count: 4, lastClose: 638000, lastPct: 1.8 },
    ],
    bestDay: { date: "2026-02-20", pct: 1.51 },
    worstDay: { date: "2026-02-05", pct: -2.12 },
    weekdayHolidays: 3,
    note: "설 연휴 + AI 차익실현, 경기방어주 부각.",
  },
  {
    month: "2026-03",
    label: "2026년 3월",
    tradingDays: 19,
    kospiOpen: 3088.4,
    kospiClose: 3198.2,
    portfolioOpen: 51_240_000,
    portfolioClose: 53_410_000,
    topThemes: [
      { name: "송배전", count: 8 },
      { name: "전력", count: 7 },
      { name: "AI 반도체", count: 5 },
      { name: "데이터센터", count: 5 },
      { name: "원전", count: 4 },
    ],
    topLeaders: [
      { name: "LS ELECTRIC", count: 6, lastClose: 298000, lastPct: 3.3 },
      { name: "대한전선", count: 5, lastClose: 64500, lastPct: 5.1 },
      { name: "두산퓨얼셀", count: 4, lastClose: 38400, lastPct: 4.0 },
    ],
    bestDay: { date: "2026-03-12", pct: 1.78 },
    worstDay: { date: "2026-03-28", pct: -1.20 },
    weekdayHolidays: 1,
    note: "데이터센터 전력 수요 → 송배전 슈퍼사이클 부각.",
  },
];

export const MONTHLY_THEMES: MonthlyThemeEntry[] = [
  ...HISTORICAL,
  APRIL_2026,
  { ...MAY_2026, isCurrent: true, note: "‘대박’ 6.71% 단일 상승일이 이달 평균을 끌어올림." },
];

export function findMonthly(month: string): MonthlyThemeEntry | undefined {
  return MONTHLY_THEMES.find((m) => m.month === month);
}

export function ytdReturn(): { kospi: number; portfolio: number } {
  const ytd = MONTHLY_THEMES.filter((m) => m.month.startsWith("2026"));
  if (ytd.length === 0) return { kospi: 0, portfolio: 0 };
  const first = ytd[0];
  const last = ytd[ytd.length - 1];
  const kospi = first.kospiOpen
    ? ((last.kospiClose - first.kospiOpen) / first.kospiOpen) * 100
    : 0;
  const portfolio = first.portfolioOpen
    ? ((last.portfolioClose - first.portfolioOpen) / first.portfolioOpen) * 100
    : 0;
  return { kospi, portfolio };
}
