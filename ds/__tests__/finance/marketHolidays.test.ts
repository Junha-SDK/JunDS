import { describe, it, expect } from "vitest";
import {
  pad2,
  fmtISO,
  holidayName,
  isWeekend,
  isMarketClosed,
  isMarketOpenNow,
  marketStatusLabel,
  isLiveSession,
  isNxtSession,
  holidaysInMonth,
  buildMonthDays,
} from "@/ds/finance/lib/marketHolidays";

// KST = UTC+9. Z-시각으로 만들면 머신 타임존과 무관하게 KST 벽시계가 고정된다.
const kst = (iso: string) => new Date(iso);

describe("pad2 / fmtISO", () => {
  it("zero-pads to two digits", () => {
    expect(pad2(3)).toBe("03");
    expect(pad2(12)).toBe("12");
  });

  it("formats a local date as YYYY-MM-DD", () => {
    expect(fmtISO(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("holidayName", () => {
  it("accepts a string date", () => {
    expect(holidayName("2026-01-01")).toBe("신정");
    expect(holidayName("2026-12-25")).toBe("성탄절");
  });

  it("accepts a Date object", () => {
    expect(holidayName(new Date(2026, 1, 17))).toBe("설날");
  });

  it("returns null for ordinary days", () => {
    expect(holidayName("2026-01-05")).toBeNull();
  });
});

describe("isWeekend / isMarketClosed", () => {
  it("flags Saturday and Sunday", () => {
    expect(isWeekend(new Date(2026, 0, 3))).toBe(true); // Sat
    expect(isWeekend(new Date(2026, 0, 4))).toBe(true); // Sun
    expect(isWeekend(new Date(2026, 0, 5))).toBe(false); // Mon
  });

  it("closes on weekends, holidays, and opens on ordinary weekdays", () => {
    expect(isMarketClosed(new Date(2026, 0, 3))).toBe(true); // weekend
    expect(isMarketClosed(new Date(2026, 0, 1))).toBe(true); // 신정 (Thu)
    expect(isMarketClosed(new Date(2026, 0, 5))).toBe(false); // ordinary Monday
  });
});

describe("isMarketOpenNow (KST regular session)", () => {
  it("is open on a weekday between 09:00 and 15:30 KST", () => {
    // 2026-01-05 is a Monday; 01:00Z = 10:00 KST
    expect(isMarketOpenNow(kst("2026-01-05T01:00:00Z"))).toBe(true);
  });

  it("is closed just before 09:00 and from 15:30 KST", () => {
    expect(isMarketOpenNow(kst("2026-01-04T23:59:00Z"))).toBe(false); // 08:59 KST
    expect(isMarketOpenNow(kst("2026-01-05T06:30:00Z"))).toBe(false); // 15:30 KST
    expect(isMarketOpenNow(kst("2026-01-05T06:29:00Z"))).toBe(true); // 15:29 KST
  });

  it("is closed on weekends and holidays even at midday", () => {
    expect(isMarketOpenNow(kst("2026-01-03T02:00:00Z"))).toBe(false); // Sat 11:00 KST
    expect(isMarketOpenNow(kst("2026-01-01T02:00:00Z"))).toBe(false); // 신정 11:00 KST
  });
});

describe("marketStatusLabel", () => {
  it("labels the KRX regular session 장중", () => {
    expect(marketStatusLabel(kst("2026-01-05T01:00:00Z"))).toBe("장중");
  });

  it("labels the NXT pre-market 프리장 (08:00–08:50 KST)", () => {
    expect(marketStatusLabel(kst("2026-01-04T23:10:00Z"))).toBe("프리장"); // 08:10 KST Mon
    expect(marketStatusLabel(kst("2026-01-04T23:55:00Z"))).toBe("장마감"); // 08:55 gap
  });

  it("labels the NXT after-market 애프터장 (15:30–20:00 KST)", () => {
    expect(marketStatusLabel(kst("2026-01-05T07:00:00Z"))).toBe("애프터장"); // 16:00 KST
    expect(marketStatusLabel(kst("2026-01-05T11:00:00Z"))).toBe("장마감"); // 20:00 KST
  });

  it("labels weekends and holidays 휴장", () => {
    expect(marketStatusLabel(kst("2026-01-03T02:00:00Z"))).toBe("휴장"); // Sat
    expect(marketStatusLabel(kst("2026-12-25T02:00:00Z"))).toBe("휴장"); // 성탄절 (Fri)
  });
});

describe("isLiveSession / isNxtSession", () => {
  it("treats 장중 and both NXT sessions as live", () => {
    expect(isLiveSession("장중")).toBe(true);
    expect(isLiveSession("프리장")).toBe(true);
    expect(isLiveSession("애프터장")).toBe(true);
    expect(isLiveSession("장마감")).toBe(false);
    expect(isLiveSession("휴장")).toBe(false);
  });

  it("marks only 프리장/애프터장 as NXT", () => {
    expect(isNxtSession("프리장")).toBe(true);
    expect(isNxtSession("애프터장")).toBe(true);
    expect(isNxtSession("장중")).toBe(false);
  });
});

describe("holidaysInMonth", () => {
  it("returns the registered weekday closures for a month", () => {
    const dec = holidaysInMonth(2026, 11);
    expect(dec.map((h) => h.date)).toEqual(["2026-12-25", "2026-12-31"]);
    expect(dec[1].name).toBe("연말 폐장");
  });

  it("returns [] for a month with no holidays", () => {
    expect(holidaysInMonth(2026, 6)).toEqual([]); // 2026-07
  });
});

describe("buildMonthDays", () => {
  it("builds one entry per calendar day", () => {
    const feb = buildMonthDays(2026, 1);
    expect(feb).toHaveLength(28);
    expect(feb[0].date).toBe("2026-02-01");
    expect(feb[27].date).toBe("2026-02-28");
  });

  it("marks holidays and weekends as closed", () => {
    const feb = buildMonthDays(2026, 1);
    const seollal = feb.find((d) => d.date === "2026-02-17")!;
    expect(seollal.holiday).toBe("설날");
    expect(seollal.isClosed).toBe(true);
    const sat = feb.find((d) => d.date === "2026-02-07")!;
    expect(sat.isWeekend).toBe(true);
    expect(sat.isClosed).toBe(true);
    const ordinary = feb.find((d) => d.date === "2026-02-04")!; // Wed
    expect(ordinary.isClosed).toBe(false);
  });
});
