"use client";

export interface NumberFormatterProps {
  /** 포맷할 숫자 값 */
  value: number;
  /** 출력 포맷 종류 */
  format?: "decimal" | "currency" | "percent" | "compact";
  /** ISO 4217 통화 코드 */
  currency?: string;
  /** BCP 47 로케일 */
  locale?: string;
  /** 소수점 자릿수 */
  decimals?: number;
  /** 값 앞에 붙일 문자열 */
  prefix?: string;
  /** 값 뒤에 붙일 문자열 */
  suffix?: string;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 로케일 기반 숫자/통화/퍼센트 포맷 텍스트.
 * @example
 * <NumberFormatter value={1234567} format="currency" currency="KRW" />
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export function NumberFormatter({
  value,
  format = "decimal",
  currency = "KRW",
  locale = "ko-KR",
  decimals,
  prefix,
  suffix,
  className,
}: NumberFormatterProps) {
  let formatted: string;

  switch (format) {
    case "currency":
      formatted = new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: decimals ?? (currency === "KRW" ? 0 : 2),
        maximumFractionDigits: decimals ?? (currency === "KRW" ? 0 : 2),
      }).format(value);
      break;
    case "percent":
      formatted = new Intl.NumberFormat(locale, {
        style: "percent",
        minimumFractionDigits: decimals ?? 0,
        maximumFractionDigits: decimals ?? 1,
      }).format(value);
      break;
    case "compact":
      formatted = new Intl.NumberFormat(locale, {
        notation: "compact",
        maximumFractionDigits: decimals ?? 1,
      }).format(value);
      break;
    default:
      formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
  }

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
