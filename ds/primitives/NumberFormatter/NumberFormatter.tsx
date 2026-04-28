"use client";

export interface NumberFormatterProps {
  value: number;
  format?: "decimal" | "currency" | "percent" | "compact";
  currency?: string;
  locale?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

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
      {prefix}{formatted}{suffix}
    </span>
  );
}
