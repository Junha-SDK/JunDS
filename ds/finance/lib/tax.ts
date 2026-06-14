/**
 * 한국 거주자 기준 세금 추정 유틸 (2026년 시점 일반론).
 *
 * 본 모듈은 추정·교육 목적이며 실제 신고에는 사용하지 마세요.
 * 세법은 매년 바뀌니 운영 시 수치만 손쉽게 조정할 수 있도록 상수로 분리합니다.
 */

/* ========================== 상수 (운영 시 조정) ========================== */

// 국내 상장주식 양도소득세 — 대주주 과세 가정. 2026년에도 일반 소액주주는 비과세 유지.
// 일반 소수주주는 0%, 대주주는 20% (3억 초과분 25%) — 단순화 위해 22%/27.5% (지방세 포함) 적용.
export const KR_LARGE_SHAREHOLDER_RATE_LOW = 0.22; // 3억 이하분 (지방세 10% 포함)
export const KR_LARGE_SHAREHOLDER_RATE_HIGH = 0.275; // 3억 초과분
export const KR_LARGE_SHAREHOLDER_THRESHOLD = 300_000_000; // 3억원 (양도소득 기준)
export const KR_BASIC_DEDUCTION = 2_500_000; // 기본공제 250만원

// 해외 상장주식 양도소득세 — 분리과세 22% (지방세 포함). 기본공제 250만원.
export const FOREIGN_GAIN_RATE = 0.22;

// 배당소득세
// - 국내: 원천징수 15.4% (지방세 포함). 합산소득 2천만 초과 시 종합과세, 단순화 위해 미반영.
export const KR_DIVIDEND_WITHHOLDING = 0.154;
// - 미국: 현지 15% + 한국 추가 1.4% (조세조약 반영, 일반적인 케이스). 단순화.
export const US_DIVIDEND_LOCAL = 0.15;
export const US_DIVIDEND_KR_ADDON = 0.014;

// 증권거래세 — 매도 시. KOSPI/KOSDAQ 모두 0.18% (2026년 단계 인하 후 가정).
export const TRANSACTION_TAX_RATE = 0.0018;

/* ============================== 계산 함수 ============================== */

export interface DomesticGainInput {
  buyAmount: number;
  sellAmount: number;
  /** 위탁수수료 합계 (선택) */
  commissions?: number;
  /** 대주주 여부 — 일반 소액주주이면 false */
  isLargeShareholder: boolean;
}

export interface DomesticGainResult {
  netGain: number;
  taxable: number;
  capitalGainsTax: number;
  transactionTax: number;
  totalTax: number;
  /** 매도 후 손에 떨어지는 금액 */
  afterTax: number;
  notes: string[];
}

/** 국내 상장주식 매도 한 건의 세금 추정. */
export function estimateDomesticGain(input: DomesticGainInput): DomesticGainResult {
  const { buyAmount, sellAmount, commissions = 0, isLargeShareholder } = input;
  const netGain = sellAmount - buyAmount - commissions;
  const transactionTax = Math.max(0, sellAmount) * TRANSACTION_TAX_RATE;

  let capitalGainsTax = 0;
  const notes: string[] = [];
  if (!isLargeShareholder) {
    notes.push("일반 소액주주: 양도소득세 비과세 (증권거래세만 부과).");
  } else {
    const taxableBase = Math.max(0, netGain - KR_BASIC_DEDUCTION);
    if (taxableBase <= KR_LARGE_SHAREHOLDER_THRESHOLD) {
      capitalGainsTax = taxableBase * KR_LARGE_SHAREHOLDER_RATE_LOW;
    } else {
      const lower = KR_LARGE_SHAREHOLDER_THRESHOLD * KR_LARGE_SHAREHOLDER_RATE_LOW;
      const upper =
        (taxableBase - KR_LARGE_SHAREHOLDER_THRESHOLD) * KR_LARGE_SHAREHOLDER_RATE_HIGH;
      capitalGainsTax = lower + upper;
    }
    notes.push(
      `대주주 양도소득세: ${(KR_LARGE_SHAREHOLDER_RATE_LOW * 100).toFixed(1)}% (3억 이하) / ${(KR_LARGE_SHAREHOLDER_RATE_HIGH * 100).toFixed(1)}% (3억 초과). 기본공제 250만원 적용.`,
    );
  }

  const totalTax = capitalGainsTax + transactionTax;
  const afterTax = sellAmount - transactionTax - capitalGainsTax - commissions;
  // 소액주주는 양도세 과세 대상 자체가 없으므로 taxable 도 0.
  // (대주주 기준 과세표준이 다른 소비처로 새지 않도록 소스에서 게이팅한다.)
  const taxable = isLargeShareholder ? Math.max(0, netGain - KR_BASIC_DEDUCTION) : 0;
  return { netGain, taxable, capitalGainsTax, transactionTax, totalTax, afterTax, notes };
}

export interface ForeignGainInput {
  /** 외화 매수 금액 */
  buyForeign: number;
  /** 외화 매도 금액 */
  sellForeign: number;
  /** 매수 시점 환율 (KRW per 1 unit of foreign currency) */
  buyFx: number;
  /** 매도 시점 환율 */
  sellFx: number;
  commissionsForeign?: number;
}

export interface ForeignGainResult {
  netGainKRW: number;
  taxable: number;
  capitalGainsTax: number;
  afterTaxKRW: number;
  notes: string[];
}

/** 해외 주식 양도소득세 추정 (분리과세 22%, 기본공제 250만원, 환차손익 포함). */
export function estimateForeignGain(input: ForeignGainInput): ForeignGainResult {
  const { buyForeign, sellForeign, buyFx, sellFx, commissionsForeign = 0 } = input;
  const buyKRW = buyForeign * buyFx;
  const sellKRW = sellForeign * sellFx;
  const commissionsKRW = commissionsForeign * sellFx;
  const netGainKRW = sellKRW - buyKRW - commissionsKRW;
  const taxable = Math.max(0, netGainKRW - KR_BASIC_DEDUCTION);
  const capitalGainsTax = taxable * FOREIGN_GAIN_RATE;
  const afterTaxKRW = sellKRW - commissionsKRW - capitalGainsTax;
  const notes: string[] = [
    "해외주식 양도소득세는 연 1회 5월 종합소득세 신고 시 분리과세 22% (지방세 포함).",
    "환차손익은 양도가-취득가 차이 안에 포함됩니다.",
  ];
  return { netGainKRW, taxable, capitalGainsTax, afterTaxKRW, notes };
}

export interface DividendInput {
  /** 국내 배당소득 (원) */
  domestic: number;
  /** 미국 배당소득 (원 기준 환산) */
  us: number;
}

export interface DividendResult {
  domesticGross: number;
  domesticTax: number;
  domesticNet: number;
  usGross: number;
  usLocalTax: number;
  usKrAddon: number;
  usNet: number;
  totalNet: number;
  totalTax: number;
  notes: string[];
}

/** 국내·미국 배당세 원천징수 추정. */
export function estimateDividends(input: DividendInput): DividendResult {
  const dt = input.domestic * KR_DIVIDEND_WITHHOLDING;
  const usLocalTax = input.us * US_DIVIDEND_LOCAL;
  const usKrAddon = input.us * US_DIVIDEND_KR_ADDON;
  const usNet = input.us - usLocalTax - usKrAddon;
  const domesticNet = input.domestic - dt;
  return {
    domesticGross: input.domestic,
    domesticTax: dt,
    domesticNet,
    usGross: input.us,
    usLocalTax,
    usKrAddon,
    usNet,
    totalTax: dt + usLocalTax + usKrAddon,
    totalNet: domesticNet + usNet,
    notes: [
      "국내 배당: 원천징수 15.4% (소득세 14% + 지방세 1.4%).",
      "미국 배당: 현지 15% 원천징수 + 한국 1.4% 가산 (조세조약 일반 케이스).",
      "배당+이자 합산소득이 연 2천만원 초과 시 종합과세 적용 — 본 추정에는 미반영.",
    ],
  };
}
