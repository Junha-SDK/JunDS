export interface LeaderStock {
  name: string;
  /** End-of-day close price in won */
  close: number;
  /** Daily change in % */
  pct: number;
}

export interface DailyThemeEntry {
  date: string; // YYYY-MM-DD
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sun
  거래대금변동: number; // %
  코스피변동: number; // %
  /** Daily KOSPI close index value */
  kospiClose: number;
  /** User's portfolio value at end of day (won) */
  portfolio: number;
  themes: string[];
  leaders?: LeaderStock[]; // 왕관 종목
  isHoliday?: boolean;
  isToday?: boolean;
}

// Computed back from current KOSPI 7,402.77 and current portfolio ~76M, applying daily changes in reverse
const RAW: DailyThemeEntry[] = [
  { date: "2026-04-06", weekday: 1, 거래대금변동: 1.36, 코스피변동: -1.54, kospiClose: 6960.4, portfolio: 70_120_000, themes: ["광통신", "알루미늄"] },
  { date: "2026-04-07", weekday: 2, 거래대금변동: 0.82, 코스피변동: -1.02, kospiClose: 6889.4, portfolio: 70_580_000, themes: ["중동전쟁", "반도체"] },
  { date: "2026-04-08", weekday: 3, 거래대금변동: 6.87, 코스피변동: -5.12, kospiClose: 6536.5, portfolio: 67_710_000, themes: ["반도체", "중동재건"], leaders: [{ name: "SK하이닉스", close: 254_500, pct: 8.7 }, { name: "대우건설", close: 6_120, pct: 12.4 }] },
  { date: "2026-04-09", weekday: 4, 거래대금변동: 1.61, 코스피변동: -1.27, kospiClose: 6453.5, portfolio: 68_240_000, themes: ["광통신", "방산"] },
  { date: "2026-04-10", weekday: 5, 거래대금변동: 1.40, 코스피변동: -1.64, kospiClose: 6347.7, portfolio: 67_800_000, themes: ["광통신", "반도체소재"] },

  { date: "2026-04-13", weekday: 1, 거래대금변동: -0.86, 코스피변동: -0.57, kospiClose: 6311.5, portfolio: 67_950_000, themes: ["광통신", "알루미늄"] },
  { date: "2026-04-14", weekday: 2, 거래대금변동: 2.74, 코스피변동: -2.00, kospiClose: 6185.3, portfolio: 68_410_000, themes: ["반도체", "우주항공"], leaders: [{ name: "SK하이닉스", close: 261_000, pct: 4.2 }] },
  { date: "2026-04-15", weekday: 3, 거래대금변동: 2.07, 코스피변동: -2.72, kospiClose: 6017.0, portfolio: 67_010_000, themes: ["송배전", "중동재건", "반도체"] },
  { date: "2026-04-16", weekday: 4, 거래대금변동: 2.21, 코스피변동: -0.91, kospiClose: 5962.2, portfolio: 67_300_000, themes: ["보안"] },
  { date: "2026-04-17", weekday: 5, 거래대금변동: -0.55, 코스피변동: -0.61, kospiClose: 5925.8, portfolio: 67_180_000, themes: ["광통신", "우주항공", "2차전지"] },

  { date: "2026-04-20", weekday: 1, 거래대금변동: 0.44, 코스피변동: -0.41, kospiClose: 5901.5, portfolio: 67_120_000, themes: ["반도체", "보안/양자"] },
  { date: "2026-04-21", weekday: 2, 거래대금변동: 2.72, 코스피변동: -0.36, kospiClose: 5880.3, portfolio: 68_350_000, themes: ["2차전지", "반도체", "중동재건"], leaders: [{ name: "삼성SDI", close: 498_000, pct: 6.8 }, { name: "SK하이닉스", close: 268_500, pct: 3.4 }] },
  { date: "2026-04-22", weekday: 3, 거래대금변동: 0.46, 코스피변동: -0.18, kospiClose: 5869.7, portfolio: 68_570_000, themes: ["반도체", "2차전지", "조선/기자재"] },
  { date: "2026-04-23", weekday: 4, 거래대금변동: 0.90, 코스피변동: -0.58, kospiClose: 5835.7, portfolio: 68_810_000, themes: ["송배전", "반도체", "원전"] },
  { date: "2026-04-24", weekday: 5, 거래대금변동: 0.0, 코스피변동: -2.51, kospiClose: 5689.3, portfolio: 67_350_000, themes: ["반도체소재", "스페이스X", "조선"] },

  { date: "2026-04-27", weekday: 1, 거래대금변동: 2.15, 코스피변동: -1.86, kospiClose: 5583.5, portfolio: 67_900_000, themes: ["반도체", "로봇", "송배전"], leaders: [{ name: "한미반도체", close: 118_500, pct: 9.6 }, { name: "SK하이닉스", close: 273_000, pct: 5.1 }] },
  { date: "2026-04-28", weekday: 2, 거래대금변동: 0.39, 코스피변동: -0.86, kospiClose: 5535.5, portfolio: 67_520_000, themes: ["철강", "로봇"] },
  { date: "2026-04-29", weekday: 3, 거래대금변동: 0.75, 코스피변동: -0.39, kospiClose: 5513.9, portfolio: 68_180_000, themes: ["송배전"] },
  { date: "2026-04-30", weekday: 4, 거래대금변동: -1.38, 코스피변동: -2.29, kospiClose: 5387.6, portfolio: 67_720_000, themes: ["송배전", "로봇"] },
  { date: "2026-05-01", weekday: 5, 거래대금변동: 0, 코스피변동: 0, kospiClose: 5387.6, portfolio: 67_720_000, themes: [], isHoliday: true },

  { date: "2026-05-04", weekday: 1, 거래대금변동: 5.12, 코스피변동: -1.79, kospiClose: 5291.2, portfolio: 70_410_000, themes: ["송배전", "반도체"], leaders: [{ name: "SK하이닉스", close: 281_500, pct: 7.4 }] },
  { date: "2026-05-05", weekday: 2, 거래대금변동: 0, 코스피변동: 0, kospiClose: 5291.2, portfolio: 70_410_000, themes: [], isHoliday: true },
  { date: "2026-05-06", weekday: 3, 거래대금변동: 6.68, 코스피변동: 6.71, kospiClose: 7402.77, portfolio: 76_736_461, themes: ["반도체", "송배전", "유리기판", "증권"], leaders: [{ name: "삼성전자", close: 98_400, pct: 6.5 }, { name: "SKC", close: 152_300, pct: 7.8 }], isToday: true },
  { date: "2026-05-07", weekday: 4, 거래대금변동: 0, 코스피변동: 0, kospiClose: 0, portfolio: 0, themes: [] },
  { date: "2026-05-08", weekday: 5, 거래대금변동: 0, 코스피변동: 0, kospiClose: 0, portfolio: 0, themes: [] },
];

export const DAILY_THEMES: DailyThemeEntry[] = RAW;

export function weeklyRows(entries: DailyThemeEntry[]): DailyThemeEntry[][] {
  const weeks: DailyThemeEntry[][] = [];
  let week: DailyThemeEntry[] = [];
  for (const entry of entries) {
    if (entry.weekday === 1 && week.length > 0) {
      weeks.push(week);
      week = [];
    }
    week.push(entry);
  }
  if (week.length > 0) weeks.push(week);
  return weeks;
}
