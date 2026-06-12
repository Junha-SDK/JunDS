/**
 * Market signals — mock data for "today's limit hits" and "tomorrow's picks".
 * All values are deterministic so the dashboard renders identically across reloads.
 *
 * Disclaimer: synthetic demo data. NOT investment advice.
 */

export interface LimitHit {
  /** 종목명 */
  name: string;
  /** 등락률 (보통 29.7~29.99 범위) */
  pct: number;
  /** 상한가 잠긴 시각 (HH:MM) */
  lockedAt: string;
  /** 한 번에 잠겼는지 (false = 풀렸다 다시 잠김) */
  lockedFirstAttempt: boolean;
  /** 거래대금 (억) */
  amount억: number;
  /** 한 줄 모멘텀 요약 */
  catalyst: string;
}

export interface PickItem {
  /** 종목명 */
  name: string;
  /** 예상 변동률 (시초가/종가 기준) */
  expectedPct: number;
  /** 한 줄 추천 사유 */
  reason: string;
  /** 신호 강도 — high/medium/low */
  strength: "high" | "medium" | "low";
}

/**
 * 오늘 상한가에 도달해 매매가 잠긴 종목들.
 * lockedAt이 빠를수록 강한 시그널로 본다.
 */
export const LIMIT_HITS: LimitHit[] = [
  {
    name: "두산에너빌리티",
    pct: 29.97,
    lockedAt: "10:32",
    lockedFirstAttempt: true,
    amount억: 4520,
    catalyst: "체코 원전 본계약 임박 보도",
  },
  {
    name: "한국항공우주",
    pct: 29.86,
    lockedAt: "11:08",
    lockedFirstAttempt: false,
    amount억: 3210,
    catalyst: "FA-50 폴란드 추가 수출 모멘텀",
  },
  {
    name: "보성파워텍",
    pct: 29.92,
    lockedAt: "09:47",
    lockedFirstAttempt: true,
    amount억: 1780,
    catalyst: "송전망 증설 수혜주 부각",
  },
  {
    name: "씨아이에스",
    pct: 29.74,
    lockedAt: "13:21",
    lockedFirstAttempt: false,
    amount억: 1340,
    catalyst: "2차전지 장비 신규 수주",
  },
  {
    name: "대원전선",
    pct: 29.99,
    lockedAt: "09:12",
    lockedFirstAttempt: true,
    amount억: 2680,
    catalyst: "초고압 케이블 증설 발표",
  },
  {
    name: "SK이노베이션",
    pct: 29.81,
    lockedAt: "14:05",
    lockedFirstAttempt: false,
    amount억: 5120,
    catalyst: "배터리 분사 가치 재평가",
  },
];

/**
 * 내일 시초가 강세 추천 — 갭 상승 가능성이 높은 종목.
 * 보통 장 마감 후 실적 / 공시 / 모멘텀이 발표된 종목.
 */
export const OPEN_PICKS: PickItem[] = [
  {
    name: "한미반도체",
    expectedPct: 4.2,
    reason: "HBM TC본더 추가 수주 공시",
    strength: "high",
  },
  {
    name: "에코프로비엠",
    expectedPct: 3.6,
    reason: "삼성SDI 신규 양극재 단독 공급",
    strength: "high",
  },
  {
    name: "LG에너지솔루션",
    expectedPct: 2.8,
    reason: "북미 ESS 수주 800GWh급 보도",
    strength: "medium",
  },
  {
    name: "삼성전자",
    expectedPct: 1.7,
    reason: "DRAM 현물가 +3% 반등",
    strength: "medium",
  },
  {
    name: "KBI메탈",
    expectedPct: 5.1,
    reason: "구리 가격 강세 + 송전망 수혜",
    strength: "high",
  },
  {
    name: "SKC",
    expectedPct: 2.1,
    reason: "유리기판 양산 진척",
    strength: "low",
  },
];

/**
 * 내일 종가 강세 추천 — 장 후반 매수세가 유입될 가능성이 높은 종목.
 * 기관/연기금 매수 패턴, 외국인 누적 순매수 등을 근거로 함.
 */
export const CLOSE_PICKS: PickItem[] = [
  {
    name: "현대차",
    expectedPct: 2.4,
    reason: "외국인 5거래일 연속 순매수",
    strength: "high",
  },
  {
    name: "POSCO홀딩스",
    expectedPct: 1.9,
    reason: "기관 종가베팅 패턴 재현",
    strength: "medium",
  },
  {
    name: "네이버",
    expectedPct: 2.0,
    reason: "AI 광고 매출 가이던스 상향",
    strength: "medium",
  },
  {
    name: "셀트리온",
    expectedPct: 3.1,
    reason: "짐펜트라 미국 처방 데이터 호조",
    strength: "high",
  },
  {
    name: "카카오",
    expectedPct: 1.5,
    reason: "프로그램 매수 잔량 증가",
    strength: "low",
  },
  {
    name: "기아",
    expectedPct: 2.6,
    reason: "전기차 보조금 확대 기대",
    strength: "medium",
  },
];

/** 상한가 종목을 잠긴 시각 빠른 순으로 정렬 */
export function limitHitsByTime(): LimitHit[] {
  return [...LIMIT_HITS].sort((a, b) => a.lockedAt.localeCompare(b.lockedAt));
}

/** 추천 종목을 신호 강도 + 예상 변동률 순으로 정렬 */
export function sortedPicks(picks: PickItem[]): PickItem[] {
  const rank: Record<PickItem["strength"], number> = { high: 3, medium: 2, low: 1 };
  return [...picks].sort((a, b) => {
    const r = rank[b.strength] - rank[a.strength];
    if (r !== 0) return r;
    return b.expectedPct - a.expectedPct;
  });
}
