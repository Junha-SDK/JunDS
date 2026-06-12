export function fmtNumber(n: number, opts?: { unit?: string }): string {
  const v = Math.round(n).toLocaleString("ko-KR");
  return opts?.unit ? `${v}${opts.unit}` : v;
}

export function fmtPct(n: number, decimals = 2): string {
  return `${n >= 0 ? "" : ""}${n.toFixed(decimals)}%`;
}

export function fmtSignedPct(n: number, decimals = 2): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(decimals)}%`;
}

export function fmtSigned(n: number): string {
  if (n > 0) return `+${n.toLocaleString("ko-KR")}`;
  return n.toLocaleString("ko-KR");
}

export function priceColorClass(n: number): string {
  if (n > 0) return "bm-up";
  if (n < 0) return "bm-down";
  return "bm-muted";
}

export function fmtKR억(n: number): string {
  if (n >= 10_000) return `${(n / 10_000).toFixed(1).replace(/\.0$/, "")}조`;
  return `${Math.round(n).toLocaleString("ko-KR")}억`;
}

export function fmtTime(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function fmtDate(d: Date): string {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}-${dd}(${days[d.getDay()]})`;
}
