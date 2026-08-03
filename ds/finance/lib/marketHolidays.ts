/**
 * 한국거래소(KRX) 공식 휴장일.
 * 음력 명절·대체공휴일은 매년 달라지므로 연도별로 명시합니다.
 * 토·일은 자동으로 휴장(주말)이며, 아래 목록은 평일 휴장일 + 폐장일을 포함합니다.
 *
 * 각 연도에 마지막 항목으로 12월 31일(연말 폐장)을 포함합니다.
 * — 12월 31일이 토·일과 겹치면 직전 영업일이 마지막 거래일이 됩니다.
 */

export interface MarketHoliday {
  /** YYYY-MM-DD */
  date: string;
  name: string;
}

const HOLIDAYS: MarketHoliday[] = [
  // 2024
  { date: "2024-01-01", name: "신정" },
  { date: "2024-02-09", name: "설날 연휴" },
  { date: "2024-02-12", name: "설날 대체" },
  { date: "2024-03-01", name: "삼일절" },
  { date: "2024-04-10", name: "국회의원선거일" },
  { date: "2024-05-01", name: "근로자의 날" },
  { date: "2024-05-06", name: "어린이날 대체" },
  { date: "2024-05-15", name: "부처님오신날" },
  { date: "2024-06-06", name: "현충일" },
  { date: "2024-08-15", name: "광복절" },
  { date: "2024-09-16", name: "추석 연휴" },
  { date: "2024-09-17", name: "추석" },
  { date: "2024-09-18", name: "추석 다음날" },
  { date: "2024-10-01", name: "국군의 날" },
  { date: "2024-10-03", name: "개천절" },
  { date: "2024-10-09", name: "한글날" },
  { date: "2024-12-25", name: "성탄절" },
  { date: "2024-12-31", name: "연말 폐장" },

  // 2025
  { date: "2025-01-01", name: "신정" },
  { date: "2025-01-28", name: "설날 연휴" },
  { date: "2025-01-29", name: "설날" },
  { date: "2025-01-30", name: "설날 다음날" },
  { date: "2025-03-03", name: "삼일절 대체" },
  { date: "2025-05-01", name: "근로자의 날" },
  { date: "2025-05-05", name: "어린이날·부처님오신날" },
  { date: "2025-05-06", name: "어린이날 대체" },
  { date: "2025-06-03", name: "대통령선거일" },
  { date: "2025-06-06", name: "현충일" },
  { date: "2025-08-15", name: "광복절" },
  { date: "2025-10-03", name: "개천절" },
  { date: "2025-10-06", name: "추석 연휴" },
  { date: "2025-10-07", name: "추석" },
  { date: "2025-10-08", name: "추석 다음날" },
  { date: "2025-10-09", name: "한글날" },
  { date: "2025-12-25", name: "성탄절" },
  { date: "2025-12-31", name: "연말 폐장" },

  // 2026
  { date: "2026-01-01", name: "신정" },
  { date: "2026-02-16", name: "설날 연휴" },
  { date: "2026-02-17", name: "설날" },
  { date: "2026-02-18", name: "설날 다음날" },
  { date: "2026-03-02", name: "삼일절 대체" },
  { date: "2026-05-01", name: "근로자의 날" },
  { date: "2026-05-05", name: "어린이날" },
  { date: "2026-05-25", name: "부처님오신날 대체" },
  { date: "2026-06-03", name: "전국동시지방선거일" },
  { date: "2026-09-25", name: "추석 연휴" },
  { date: "2026-09-28", name: "추석 대체" },
  { date: "2026-10-09", name: "한글날" },
  { date: "2026-12-25", name: "성탄절" },
  { date: "2026-12-31", name: "연말 폐장" },

  // 2027
  { date: "2027-01-01", name: "신정" },
  { date: "2027-02-08", name: "설날 연휴" },
  { date: "2027-02-09", name: "설날" },
  { date: "2027-02-10", name: "설날 다음날" },
  { date: "2027-03-01", name: "삼일절" },
  { date: "2027-05-05", name: "어린이날" },
  { date: "2027-05-13", name: "부처님오신날" },
  { date: "2027-08-16", name: "광복절 대체" },
  { date: "2027-09-15", name: "추석 연휴" },
  { date: "2027-09-16", name: "추석" },
  { date: "2027-09-17", name: "추석 다음날" },
  { date: "2027-10-04", name: "개천절 대체" },
  { date: "2027-10-11", name: "한글날 대체" },
  { date: "2027-12-31", name: "연말 폐장" },
];

const HOLIDAY_INDEX = new Map<string, string>(HOLIDAYS.map((h) => [h.date, h.name]));

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function fmtISO(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Returns the holiday name for that date, or null. Weekends are not counted here — use isMarketClosed() for that. */
export function holidayName(date: Date | string): string | null {
  const key = typeof date === "string" ? date : fmtISO(date);
  return HOLIDAY_INDEX.get(key) ?? null;
}

export function isWeekend(date: Date): boolean {
  const d = date.getDay();
  return d === 0 || d === 6;
}

/** True when KRX is closed: weekend or registered holiday. */
export function isMarketClosed(date: Date): boolean {
  return isWeekend(date) || HOLIDAY_INDEX.has(fmtISO(date));
}

/**
 * Returns the KST (UTC+9) wall-clock parts for the given instant, regardless of the
 * machine's local timezone. KRX trading hours are defined in KST.
 *
 * date.getTime()은 이미 UTC epoch ms를 반환하므로, 9시간만 더해 `getUTC*`로 읽으면
 * KST 벽시계가 그대로 떨어진다.
 */
function toKST(date: Date): {
  year: number;
  month1: number;
  day: number;
  weekday: number;
  hour: number;
  minute: number;
} {
  const kst = new Date(date.getTime() + 9 * 60 * 60_000);
  return {
    year: kst.getUTCFullYear(),
    month1: kst.getUTCMonth() + 1,
    day: kst.getUTCDate(),
    weekday: kst.getUTCDay(),
    hour: kst.getUTCHours(),
    minute: kst.getUTCMinutes(),
  };
}

/**
 * KRX 정규장 운영 여부를 판정합니다 (KST 기준).
 * - 평일 09:00 ~ 15:30 (KST)
 * - 주말·공휴일은 휴장
 *
 * ⚠ NXT 세션은 포함하지 않음 — KRX 정규장 거래 가능 여부 판단용.
 * NXT 포함 "라이브 시장 시간" 판정은 `isLiveSession(marketStatusLabel())` 사용.
 */
export function isMarketOpenNow(now: Date = new Date()): boolean {
  const k = toKST(now);
  if (k.weekday === 0 || k.weekday === 6) return false;
  const iso = `${k.year}-${pad2(k.month1)}-${pad2(k.day)}`;
  if (HOLIDAY_INDEX.has(iso)) return false;
  const minutes = k.hour * 60 + k.minute;
  return minutes >= 9 * 60 && minutes < 15 * 60 + 30;
}

/** 시장 상태 라벨.
 *   - "장중":     KRX 정규장 (평일 09:00~15:30)
 *   - "프리장":   NXT 프리장 (평일 08:00~08:50, 정규장 직전)
 *   - "애프터장": NXT 애프터장 (평일 15:30~20:00, 정규장 종료 후)
 *   - "장마감":   평일이지만 위 세션 모두 종료
 *   - "휴장":     주말·공휴일
 */
export type MarketSessionLabel = "장중" | "프리장" | "애프터장" | "장마감" | "휴장";

export function marketStatusLabel(now: Date = new Date()): MarketSessionLabel {
  const k = toKST(now);
  if (k.weekday === 0 || k.weekday === 6) return "휴장";
  const iso = `${k.year}-${pad2(k.month1)}-${pad2(k.day)}`;
  if (HOLIDAY_INDEX.has(iso)) return "휴장";
  const minutes = k.hour * 60 + k.minute;
  // 우선순위: KRX 정규장 > NXT 세션 > 그 외 시간 = 장마감
  if (minutes >= 9 * 60 && minutes < 15 * 60 + 30) return "장중";
  if (minutes >= 8 * 60 && minutes < 8 * 60 + 50) return "프리장";
  if (minutes >= 15 * 60 + 30 && minutes < 20 * 60) return "애프터장";
  return "장마감";
}

/** 라이브 거래가 가능한 세션인지 — KRX 정규장 + NXT 프리/애프터 모두 포함.
 * 차트 폴링·실시간 데이터 갱신·UI live indicator 등의 게이트로 사용. */
export function isLiveSession(status: MarketSessionLabel): boolean {
  return status === "장중" || status === "프리장" || status === "애프터장";
}

/** NXT 세션 중인지 (KRX 정규장 시간 제외). */
export function isNxtSession(status: MarketSessionLabel): boolean {
  return status === "프리장" || status === "애프터장";
}

/** Returns the list of holidays (excluding weekends) within a given month. */
export function holidaysInMonth(year: number, month0: number): MarketHoliday[] {
  const prefix = `${year}-${pad2(month0 + 1)}-`;
  return HOLIDAYS.filter((h) => h.date.startsWith(prefix));
}

/** Returns all weekday closures + weekends for the given month, in date order. */
export interface MonthDay {
  date: string;
  day: number;
  weekday: number; // 0 = Sun
  isWeekend: boolean;
  holiday: string | null;
  isClosed: boolean;
}

export function buildMonthDays(year: number, month0: number): MonthDay[] {
  const out: MonthDay[] = [];
  const last = new Date(year, month0 + 1, 0).getDate();
  for (let d = 1; d <= last; d++) {
    const dt = new Date(year, month0, d);
    const iso = fmtISO(dt);
    const weekend = isWeekend(dt);
    const name = HOLIDAY_INDEX.get(iso) ?? null;
    out.push({
      date: iso,
      day: d,
      weekday: dt.getDay(),
      isWeekend: weekend,
      holiday: name,
      isClosed: weekend || name != null,
    });
  }
  return out;
}
