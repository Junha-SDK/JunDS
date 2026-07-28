"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { applyBrand, brandPresets, type BrandPreset } from "../tokens/brands";

interface BrandContextValue {
  /** 현재 활성 브랜드 (SSR 단계에서는 null) */
  brand: BrandPreset | null;
  /** 사용 가능한 브랜드 프리셋 */
  presets: BrandPreset[];
  /** 브랜드 변경 — id 또는 BrandPreset */
  setBrand: (idOrPreset: string | BrandPreset) => void;
}

const BrandContext = createContext<BrandContextValue | null>(null);

export interface BrandProviderProps {
  children: ReactNode;
  /** 초기 브랜드 id (기본 "default") */
  brand?: string;
  /** localStorage에서 마지막 선택을 자동 복원 (기본 true) */
  persist?: boolean;
}

/**
 * 멀티 브랜드 컨텍스트. 한 번 감싸면 자식 트리 전체가 같은 브랜드 토큰을
 * 공유한다.
 *
 * @example
 *   <BrandProvider brand="ocean">
 *     <App />
 *   </BrandProvider>
 *
 *   const { brand, setBrand, presets } = useBrand();
 */
export function BrandProvider({ children, brand = "default", persist = true }: BrandProviderProps) {
  const [active, setActive] = useState<BrandPreset | null>(null);

  useEffect(() => {
    let initial = brand;
    if (persist) {
      try {
        const saved = localStorage.getItem("junds-brand");
        if (saved && brandPresets.some((b) => b.id === saved)) initial = saved;
      } catch {}
    }
    const applied = applyBrand(initial);
    if (applied) setActive(applied);
  }, [brand, persist]);

  const setBrand = (idOrPreset: string | BrandPreset) => {
    const applied = applyBrand(idOrPreset);
    if (applied) setActive(applied);
  };

  return (
    <BrandContext.Provider value={{ brand: active, presets: brandPresets, setBrand }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand(): BrandContextValue {
  const ctx = useContext(BrandContext);
  if (!ctx) {
    // No-op fallback so components don't crash when used outside provider.
    return {
      brand: null,
      presets: brandPresets,
      setBrand: (idOrPreset) => {
        applyBrand(idOrPreset);
      },
    };
  }
  return ctx;
}
