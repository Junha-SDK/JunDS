import { findStock } from "./stocks";
import { seedSeries, seedCandles } from "./mock";

export interface CompareMetric {
  per?: number;
  pbr?: number;
  roe?: number;
  div?: number;
  high52?: number;
  low52?: number;
  cap천억?: number;
  foreign?: number;
}

function hashSeed(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h) || 1;
}

export function priceSeries(name: string, count = 60): number[] {
  const stock = findStock(name);
  const base = stock?.price ?? 100_000;
  return seedSeries(hashSeed(name), count, base, 0.018);
}

export function candleSeries(name: string, count = 60): ReturnType<typeof seedCandles> {
  const stock = findStock(name);
  const base = stock?.price ?? 100_000;
  return seedCandles(hashSeed(name), count, base, 0.012);
}

export function metricsFor(name: string): CompareMetric {
  const stock = findStock(name);
  const seed = hashSeed(name);
  const r = (i: number) => ((seed * (i + 7)) % 1000) / 1000;
  const price = stock?.price ?? 100_000;
  return {
    per: 6 + r(1) * 25,
    pbr: 0.5 + r(2) * 4,
    roe: 4 + r(3) * 18,
    div: r(4) * 5,
    high52: Math.round(price * (1.05 + r(5) * 0.4)),
    low52: Math.round(price * (0.55 + r(6) * 0.3)),
    cap천억: stock?.cap천억 ?? Math.round(50 + r(7) * 1500),
    foreign: 5 + r(8) * 50,
  };
}
