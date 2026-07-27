"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

export interface SeoDefaults {
  /** 페이지 제목이 없을 때 쓸 기본 제목 */
  title: string;
  /** 제목 뒤에 붙일 브랜드명. 주면 `"글 제목 | 브랜드"` 형태로 조립된다 */
  titleTemplate?: string;
  /** 기본 설명문 */
  description: string;
  /** 기본 OG 이미지 (절대 URL 권장 — 스크래퍼는 상대 경로를 못 읽는다) */
  ogImage?: string;
  /** 기본 파비콘 URL */
  favicon?: string;
  /** 기본 og:type (기본 `"website"`) */
  ogType?: string;
  /** og:site_name */
  siteName?: string;
  /** 사이트 루트 절대 URL. 상대 경로를 절대 URL 로 승격할 때 쓴다 */
  siteUrl?: string;
  /** 기본 로케일 (og:locale) */
  locale?: string;
  /** 기본 twitter 계정 핸들 (`@` 포함) */
  twitterSite?: string;
}

const FALLBACK: SeoDefaults = {
  title: "",
  description: "",
  ogType: "website",
};

const SeoContext = createContext<SeoDefaults>(FALLBACK);

export interface SeoProviderProps {
  /** 사이트 전역 SEO 기본값 */
  defaults: SeoDefaults;
  children: ReactNode;
}

/**
 * 사이트 전역 SEO 기본값을 내려주는 프로바이더.
 *
 * `SeoHead` / `useSeo` 는 페이지가 지정하지 않은 필드를 여기서 채운다. 앱 루트에
 * 한 번만 두면, 각 페이지는 달라지는 값(제목·설명·커버)만 넘기면 된다.
 * 페이지를 떠날 때 되돌릴 "원래 상태"도 이 기본값이 기준이 된다.
 *
 * @example
 * ```tsx
 * <SeoProvider defaults={{
 *   title: "junome",
 *   titleTemplate: "%s | junome",
 *   description: "개발 블로그 & 포트폴리오",
 *   siteUrl: "https://www.junome.info",
 *   ogImage: "https://www.junome.info/og/home.png",
 * }}>
 *   <App />
 * </SeoProvider>
 * ```
 */
export function SeoProvider({ defaults, children }: SeoProviderProps) {
  const value = useMemo(
    () => ({ ...FALLBACK, ...defaults }),
    // 객체 리터럴을 그대로 넘겨도 매 렌더 컨텍스트가 갈리지 않도록 필드 단위로 비교
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      defaults.title,
      defaults.titleTemplate,
      defaults.description,
      defaults.ogImage,
      defaults.favicon,
      defaults.ogType,
      defaults.siteName,
      defaults.siteUrl,
      defaults.locale,
      defaults.twitterSite,
    ],
  );

  return <SeoContext.Provider value={value}>{children}</SeoContext.Provider>;
}

/** 현재 유효한 SEO 기본값. `SeoProvider` 없이도 빈 기본값으로 안전하게 동작한다. */
export function useSeoDefaults(): SeoDefaults {
  return useContext(SeoContext);
}
