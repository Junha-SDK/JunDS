export interface DayFlow {
  date: string;
  /** 외국인 순매수 (억원) */
  foreign: number;
  /** 기관 순매수 (억원) */
  institution: number;
  /** 개인 순매수 (억원) */
  individual: number;
}

function hashSeed(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}

export function buildFlow(name: string, days = 30): DayFlow[] {
  const seed = hashSeed(name);
  const out: DayFlow[] = [];
  const today = new Date(2026, 4, 6).getTime();
  for (let i = days - 1; i >= 0; i--) {
    const r1 = ((seed * (i + 3)) % 1000) / 1000 - 0.5;
    const r2 = ((seed * (i + 7)) % 1000) / 1000 - 0.5;
    const r3 = ((seed * (i + 11)) % 1000) / 1000 - 0.5;
    const f = Math.round(r1 * 250);
    const inst = Math.round(r2 * 180);
    const ind = -(f + inst) + Math.round(r3 * 80);
    const d = new Date(today - i * 86400_000);
    out.push({
      date: `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      foreign: f,
      institution: inst,
      individual: ind,
    });
  }
  return out;
}
