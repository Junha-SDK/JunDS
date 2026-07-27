"use client";

import { useEffect, useState } from "react";

export interface DominantColor {
  /** 밝은 대표색 — 글로우/강조에 쓴다 */
  tint: string;
  /** 같은 색조의 어두운 톤 — 배경 바닥에 쓴다 */
  deep: string;
  /** 추출이 끝났는지 (false 면 아직 폴백 색) */
  ready: boolean;
}

interface Pair {
  tint: string;
  deep: string;
}

/** 이미지도 seed 도 없을 때 쓰는 무채색 폴백 */
const NEUTRAL: Pair = { tint: "hsl(230 15% 38%)", deep: "hsl(230 18% 12%)" };

/** src → 추출 결과. 같은 이미지를 두 번 디코드하지 않기 위한 모듈 캐시 */
const CACHE = new Map<string, Pair>();

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}

/** 이미지가 없을 때 문자열 seed 에서 무광 색을 파생한다 (생성 커버와 톤 일치) */
function fromSeed(seed: string): Pair {
  const hue = hashStr(seed) % 360;
  return { tint: `hsl(${hue} 22% 36%)`, deep: `hsl(${hue} 22% 12%)` };
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, l];
}

/**
 * 이미지를 24×24 캔버스로 줄인 뒤 채도 가중 색조 히스토그램에서 지배 색조를 고른다.
 * 외부 라이브러리 없이 동작하며, 캔버스 taint(교차 출처 이미지)나 CSP 로 실패하면
 * 조용히 NEUTRAL 로 떨어진다.
 */
function extract(src: string, crossOrigin?: string): Promise<Pair> {
  return new Promise((resolve) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = crossOrigin;
    img.decoding = "async";

    img.onload = () => {
      try {
        const N = 24;
        const canvas = document.createElement("canvas");
        canvas.width = N;
        canvas.height = N;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(NEUTRAL);
        ctx.drawImage(img, 0, 0, N, N);
        const { data } = ctx.getImageData(0, 0, N, N);

        const BUCKETS = 24; // 색조를 15° 단위로 나눈다
        const weight = new Array(BUCKETS).fill(0);
        const sSum = new Array(BUCKETS).fill(0);
        const lSum = new Array(BUCKETS).fill(0);
        const count = new Array(BUCKETS).fill(0);
        let ar = 0;
        let ag = 0;
        let ab = 0;
        let an = 0;

        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 125) continue; // 거의 투명한 픽셀은 무시
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          ar += r;
          ag += g;
          ab += b;
          an += 1;
          const [h, s, l] = rgbToHsl(r, g, b);
          // 무채색·너무 어둡거나 밝은 픽셀은 색조 투표에서 제외
          if (s > 0.15 && l > 0.12 && l < 0.9) {
            const bi = Math.floor(h / (360 / BUCKETS)) % BUCKETS;
            weight[bi] += s;
            sSum[bi] += s;
            lSum[bi] += l;
            count[bi] += 1;
          }
        }

        let best = -1;
        let bestW = 0;
        for (let i = 0; i < BUCKETS; i += 1) {
          if (weight[i] > bestW) {
            bestW = weight[i];
            best = i;
          }
        }

        let H: number;
        let S: number;
        let L: number;
        if (best >= 0 && count[best] > 0) {
          H = best * (360 / BUCKETS) + 360 / BUCKETS / 2;
          S = Math.min(0.72, Math.max(0.34, (sSum[best] / count[best]) * 1.15));
          L = Math.min(0.56, Math.max(0.36, lSum[best] / count[best]));
        } else if (an > 0) {
          // 유채색 픽셀이 하나도 없으면(흑백 이미지) 평균색의 색조를 쓴다
          const [h, s] = rgbToHsl(ar / an, ag / an, ab / an);
          H = h;
          S = Math.max(0.18, Math.min(0.48, s));
          L = 0.42;
        } else {
          return resolve(NEUTRAL);
        }

        const hue = Math.round(H);
        resolve({
          tint: `hsl(${hue} ${Math.round(S * 100)}% ${Math.round(L * 100)}%)`,
          deep: `hsl(${hue} ${Math.round(Math.min(0.6, S * 0.9) * 100)}% 13%)`,
        });
      } catch {
        resolve(NEUTRAL);
      }
    };

    img.onerror = () => resolve(NEUTRAL);
    img.src = src;
  });
}

export interface UseDominantColorOptions {
  /** 교차 출처 이미지에서 색을 뽑아야 할 때 `"anonymous"` 를 준다 */
  crossOrigin?: "anonymous" | "use-credentials";
}

/**
 * 이미지에서 대표색 한 쌍(밝은 `tint` / 어두운 `deep`)을 뽑아내는 훅.
 *
 * 앨범 커버나 책 표지에서 색을 뽑아 배경을 물들이는, 음악 앱 스타일의 몰입형
 * 배경을 만들 때 쓴다. 이미지를 작은 캔버스로 축소해 채도 가중 히스토그램으로
 * 지배 색조를 고르며, 외부 라이브러리를 쓰지 않는다.
 *
 * - 결과는 `src` 기준으로 모듈 캐시되어, 같은 이미지는 한 번만 디코드한다.
 * - `src` 가 없으면 `seed` 문자열에서 무광 색을 파생한다.
 * - 교차 출처 이미지는 캔버스가 taint 되어 읽기가 막힐 수 있다. 이때는 예외를
 *   삼키고 무채색으로 떨어지므로 UI 가 깨지지 않는다. CORS 헤더가 있는
 *   이미지라면 `crossOrigin: "anonymous"` 를 주면 정상 추출된다.
 * - SSR/프리렌더에서는 아무것도 하지 않고 폴백 색을 그대로 반환한다.
 *
 * @param src - 색을 뽑을 이미지 URL
 * @param seed - 이미지가 없을 때 색을 파생할 문자열 (제목 등)
 *
 * @example
 * ```tsx
 * const { tint, deep, ready } = useDominantColor(album.cover, album.title);
 * <div style={{ background: `linear-gradient(${tint}, ${deep})` }} />
 * ```
 */
export function useDominantColor(
  src?: string,
  seed?: string,
  options: UseDominantColorOptions = {},
): DominantColor {
  const { crossOrigin } = options;

  const initial = (): Pair => {
    if (src && CACHE.has(src)) return CACHE.get(src)!;
    if (!src && seed) return fromSeed(seed);
    return NEUTRAL;
  };

  const [pair, setPair] = useState<Pair>(initial);
  const [ready, setReady] = useState<boolean>(() =>
    src ? CACHE.has(src) : Boolean(seed),
  );

  useEffect(() => {
    let cancelled = false;

    if (!src) {
      setPair(seed ? fromSeed(seed) : NEUTRAL);
      setReady(Boolean(seed));
      return;
    }
    if (CACHE.has(src)) {
      setPair(CACHE.get(src)!);
      setReady(true);
      return;
    }
    if (typeof window === "undefined" || typeof document === "undefined") return;

    setReady(false);
    extract(src, crossOrigin).then((c) => {
      CACHE.set(src, c);
      if (cancelled) return;
      setPair(c);
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [src, seed, crossOrigin]);

  return { tint: pair.tint, deep: pair.deep, ready };
}
