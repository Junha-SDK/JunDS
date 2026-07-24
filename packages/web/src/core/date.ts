/**
 * 날짜·시간 코어 유틸 (07-rollout §6 R8 — 픽커 계열이 공유하는 1회 구현).
 *
 * 규범 3가지:
 *  1. **현재 시각을 읽지 않는다.** 03-web-arch §3.1-3(결정적 render)에 따라 "오늘"은
 *     컴포넌트가 connected() 이후에 한 번 읽어 주입한다. 여기 함수는 전부 순수다 —
 *     같은 인자면 언제 호출해도 같은 값이라 프리렌더 스냅샷 diff가 안정하다.
 *  2. **날짜 문자열은 로컬 자정 기준 "YYYY-MM-DD"**. `new Date("2026-07-24")`는 스펙상
 *     UTC로 해석돼 UTC+9에서 하루가 밀린다 — 수기 파서만 쓴다(v2 DateRangePicker가
 *     Date 객체를 그대로 들고 다니며 이 함정을 우회하던 자리를 문자열 값으로 정리).
 *  3. 월 인덱스는 **0-based(Date 규약)**, 사용자 표면 값은 1-based. 함수명에 명시한다.
 */

export const WEEKDAY_LABELS_KO: readonly string[] = ["일", "월", "화", "수", "목", "금", "토"];

export const MONTH_LABELS_KO: readonly string[] = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

export const pad2 = (n: number): string => (n < 10 && n >= 0 ? `0${n}` : String(n));

/** "YYYY-MM-DD"(선행 부분 일치 허용) → 로컬 자정 Date. 형식·실재 불일치면 null */
export function parseISODate(s: unknown): Date | null {
  if (s instanceof Date) return Number.isNaN(s.getTime()) ? null : toDayStart(s);
  if (typeof s !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const date = new Date(y, mo - 1, d);
  // 2026-02-31 같은 값은 3월로 굴러간다 — 되돌려 확인해 거른다
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date;
}

export function formatISODate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** v2 DateRangePicker 표시 형식 "YYYY.MM.DD" */
export function formatDotDate(d: Date): string {
  return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`;
}

export function toDayStart(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** 일 단위 비교 — a<b이면 음수 */
export function compareDay(a: Date, b: Date): number {
  return toDayStart(a).getTime() - toDayStart(b).getTime();
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

/** 월 이동 — 말일 보정(1/31 +1개월 = 2/28) */
export function addMonths(d: Date, n: number): Date {
  const y = d.getFullYear();
  const m = d.getMonth() + n;
  const day = Math.min(d.getDate(), daysInMonth(y, m));
  return new Date(y, m, day);
}

/** month는 0-based. 범위를 벗어난 값도 Date가 정규화한다 */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** 그 달 1일의 요일(0=일). month는 0-based */
export function firstWeekdayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/**
 * 달력 셀 배열 — 앞쪽 빈칸(null) + 1일~말일. month는 0-based.
 * 뒤쪽은 채우지 않는다(v2 DateRangePicker 동형 — 마지막 주가 짧게 끝난다).
 */
export function monthGrid(year: number, month: number): (Date | null)[] {
  const cells: (Date | null)[] = [];
  const lead = firstWeekdayOfMonth(year, month);
  for (let i = 0; i < lead; i += 1) cells.push(null);
  const total = daysInMonth(year, month);
  for (let d = 1; d <= total; d += 1) cells.push(new Date(year, month, d));
  return cells;
}

/** min/max(둘 다 일 단위, 포함)를 벗어나는지 */
export function isDayOutOfRange(date: Date, min: Date | null, max: Date | null): boolean {
  if (min && compareDay(date, min) < 0) return true;
  if (max && compareDay(date, max) > 0) return true;
  return false;
}

export interface YearMonth {
  year: number;
  /** 1-based */
  month: number;
}

/** "YYYY-MM" → {year, month(1-based)} */
export function parseYearMonth(s: unknown): YearMonth | null {
  if (typeof s !== "string") return null;
  const m = /^(\d{4})-(\d{1,2})$/.exec(s.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

export function formatYearMonth(year: number, month: number): string {
  return `${year}-${pad2(month)}`;
}

/** a가 b보다 이른 달이면 true */
export function isYearMonthBefore(a: YearMonth, b: YearMonth): boolean {
  return a.year < b.year || (a.year === b.year && a.month < b.month);
}

export interface HourMinute {
  hour: number;
  minute: number;
}

/** "HH:mm"(선행 부분 일치 허용) → {hour, minute}. 범위를 벗어나면 null */
export function parseTime(s: unknown): HourMinute | null {
  if (typeof s !== "string") return null;
  const m = /^(\d{1,2}):(\d{2})/.exec(s.trim());
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

export function formatTime(hour: number, minute: number): string {
  return `${pad2(hour)}:${pad2(minute)}`;
}

/** 24시제 시각 → 12시제 표시 시(1~12) */
export function to12Hour(hour24: number): number {
  return hour24 % 12 || 12;
}

/** 12시제 표시 시 + 오전/오후 → 24시제 */
export function from12Hour(hour12: number, pm: boolean): number {
  if (pm) return hour12 === 12 ? 12 : hour12 + 12;
  return hour12 === 12 ? 0 : hour12;
}

export interface DurationParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** 남은 시간이 0 이하 */
  done: boolean;
}

/** 밀리초 잔량 → 일/시/분/초 (음수는 0으로 클램프). v2 Countdown compute 동형 */
export function splitDuration(remainingMs: number): DurationParts {
  const clamped = Math.max(0, remainingMs);
  const total = Math.floor(clamped / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    done: clamped === 0,
  };
}

/** Date | number | "…" 무엇이 오든 epoch ms로. 못 읽으면 NaN */
export function toEpochMs(v: unknown): number {
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.getTime();
  if (typeof v !== "string" || !v.trim()) return Number.NaN;
  // 날짜만 있는 문자열은 로컬 자정으로(§규범 2) — 그 외는 Date 파서에 위임
  const dateOnly = parseISODate(v);
  if (dateOnly && !/[T ]\d/.test(v)) return dateOnly.getTime();
  return new Date(v).getTime();
}
