import { findStock } from "./stocks";

export interface QuarterRow {
  label: string;
  revenue: number;
  operatingIncome: number;
  netIncome: number;
  eps: number;
}

export interface Disclosure {
  id: string;
  date: string;
  title: string;
  category: "정기" | "수시" | "주요사항" | "지분" | "기타";
}

function hashSeed(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}

export function quarterlyFor(name: string): QuarterRow[] {
  const stock = findStock(name);
  const seed = hashSeed(name);
  const r = (i: number) => ((seed * (i + 11)) % 1000) / 1000;
  const baseRevenue = (stock?.cap천억 ?? 200) * 7 + 4000;
  const labels = ["24.2Q", "24.3Q", "24.4Q", "25.1Q", "25.2Q", "25.3Q", "25.4Q", "26.1Q"];
  let prev = baseRevenue;
  return labels.map((label, i) => {
    const drift = 1 + (r(i) - 0.4) * 0.2;
    const rev = Math.round(prev * drift);
    prev = rev;
    const opIncome = Math.round(rev * (0.06 + r(i + 5) * 0.18));
    const net = Math.round(opIncome * (0.55 + r(i + 7) * 0.4));
    const eps = Math.round(net / Math.max(1, (stock?.cap천억 ?? 200) * 0.4));
    return { label, revenue: rev, operatingIncome: opIncome, netIncome: net, eps };
  });
}

const TITLES = [
  "분기보고서 (제 N기)",
  "주요사항보고서 (자기주식취득결정)",
  "특수관계인과의 거래내역 신고",
  "단일판매·공급계약체결",
  "유상증자결정",
  "최대주주변경",
  "현금·현물배당 결정",
  "신규사업 진출 결정",
  "타법인 주식 및 출자증권 처분결정",
  "임원·주요주주 특정증권등 소유상황보고서",
  "주식분할 결정",
  "회사합병 결정",
];

const CATEGORIES: Disclosure["category"][] = ["정기", "수시", "주요사항", "지분", "기타"];

export function disclosuresFor(name: string, count = 12): Disclosure[] {
  const seed = hashSeed(name);
  const out: Disclosure[] = [];
  let day = new Date(2026, 4, 6).getTime();
  for (let i = 0; i < count; i++) {
    const offset = ((seed * (i + 1)) % 8) + 1;
    day -= offset * 86400_000;
    const d = new Date(day);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
    const t = TITLES[(seed + i) % TITLES.length];
    const c = CATEGORIES[(seed + i * 3) % CATEGORIES.length];
    out.push({ id: `${name}-${i}`, date: dateStr, title: t, category: c });
  }
  return out;
}
