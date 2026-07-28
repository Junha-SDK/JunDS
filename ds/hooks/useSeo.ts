"use client";

import { useEffect } from "react";
import { useSeoDefaults, type SeoDefaults } from "../providers/SeoProvider";

export interface SeoProps {
  /** 페이지 제목. `titleTemplate` 이 있으면 그 안에 끼워 넣는다 */
  title?: string;
  /** 이 페이지만 `titleTemplate` 을 무시하고 제목을 그대로 쓸지 */
  rawTitle?: boolean;
  /** 페이지 설명 (meta description / og:description / twitter:description) */
  description?: string;
  /** OG 이미지 URL. 상대 경로면 `siteUrl` 을 붙여 절대 URL 로 승격한다 */
  ogImage?: string;
  /** OG 이미지 대체 텍스트 (기본: 제목) */
  ogImageAlt?: string;
  /** og:type — 글 페이지면 `"article"` */
  ogType?: string;
  /** 파비콘 URL */
  favicon?: string;
  /** 애플 터치 아이콘 URL (없으면 `favicon` 을 쓴다) */
  appleTouchIcon?: string;
  /** canonical URL. 상대 경로면 `siteUrl` 기준으로 절대화한다 */
  canonical?: string;
  /** meta keywords */
  keywords?: string[];
  /** 검색엔진 색인 제외 (`noindex, nofollow`) */
  noIndex?: boolean;
  /** 사이트 기본값을 이 호출에서만 덮어쓰고 싶을 때 */
  defaults?: Partial<SeoDefaults>;
}

/** name= 이 아니라 property= 로 붙여야 하는 메타 키 */
function isProperty(name: string): boolean {
  return name.startsWith("og:") || name.startsWith("article:");
}

function setMeta(name: string, content: string) {
  let el = document.querySelector<HTMLElement>(`meta[property="${name}"], meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(isProperty(name) ? "property" : "name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeMeta(name: string) {
  document
    .querySelectorAll(`meta[property="${name}"], meta[name="${name}"]`)
    .forEach((el) => el.remove());
}

function setLink(rel: string, href: string) {
  let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

/** 상대 경로를 사이트 절대 URL 로 승격한다. 스크래퍼는 상대 경로를 읽지 못한다. */
function absolutize(url: string | undefined, siteUrl: string | undefined): string | undefined {
  if (!url) return undefined;
  if (!siteUrl || !url.startsWith("/")) return url;
  return `${siteUrl.replace(/\/$/, "")}${url}`;
}

function buildTitle(title: string | undefined, raw: boolean, d: SeoDefaults): string {
  if (!title) return d.title;
  if (raw || !d.titleTemplate) return title;
  return d.titleTemplate.includes("%s")
    ? d.titleTemplate.replace("%s", title)
    : `${title} ${d.titleTemplate}`;
}

/**
 * 페이지 단위 SEO 메타태그를 `<head>` 에 반영하는 훅.
 *
 * SPA 라우팅에서는 서버가 페이지마다 다른 `<head>` 를 내려 주지 않으므로, 라우트가
 * 바뀔 때마다 클라이언트가 직접 갱신해야 한다. 이 훅은 그 갱신을 담당하며,
 * 언마운트 시 `SeoProvider` 의 기본값으로 되돌려 이전 페이지의 메타가 다음
 * 페이지에 남지 않게 한다.
 *
 * 채우는 항목:
 * `document.title`, `description`, `keywords`, `robots`, canonical,
 * Open Graph(`og:title`/`description`/`image`/`image:secure_url`/`image:alt`/
 * `type`/`site_name`/`url`/`locale`), Twitter 카드, 파비콘, apple-touch-icon.
 *
 * `og:image:secure_url` 까지 같이 갱신하는 게 중요하다 — 이 값을 우선하는
 * 스크래퍼(Mattermost 등)가 있어서, 빼먹으면 정적 HTML 에 박힌 홈 이미지가 모든
 * 페이지의 미리보기로 나간다.
 *
 * SSR/프리렌더 환경에서 첫 렌더에 메타가 필요하다면 프레임워크의 메타데이터 API
 * (Next.js `generateMetadata` 등)를 쓰는 편이 낫다. 이 훅은 클라이언트 라우팅용이다.
 *
 * @example
 * ```tsx
 * useSeo({
 *   title: post.title,
 *   description: post.summary,
 *   ogImage: post.cover,
 *   ogType: "article",
 *   canonical: `/blog/${post.slug}`,
 * });
 * ```
 */
export function useSeo(props: SeoProps): void {
  const ctxDefaults = useSeoDefaults();

  const {
    title,
    rawTitle = false,
    description,
    ogImage,
    ogImageAlt,
    ogType,
    favicon,
    appleTouchIcon,
    canonical,
    keywords,
    noIndex = false,
    defaults: overrides,
  } = props;

  // 객체/배열 prop 은 매 렌더 새 참조라 그대로 의존성에 넣으면 무한 루프가 된다.
  // 직렬화해서 값 기준으로 비교한다.
  const keywordsKey = keywords?.join(",") ?? "";
  const overridesKey = overrides ? JSON.stringify(overrides) : "";

  useEffect(() => {
    if (typeof document === "undefined") return;

    const d: SeoDefaults = { ...ctxDefaults, ...(overrides ?? {}) };
    const siteUrl = d.siteUrl;

    const displayTitle = buildTitle(title, rawTitle, d);
    const displayDesc = description ?? d.description;
    const displayImage = absolutize(ogImage, siteUrl) ?? d.ogImage;
    const displayType = ogType ?? d.ogType ?? "website";
    const displayFavicon = favicon ?? d.favicon;
    const displayCanonical = absolutize(canonical, siteUrl);

    if (displayTitle) document.title = displayTitle;
    if (displayDesc) setMeta("description", displayDesc);
    if (keywords?.length) setMeta("keywords", keywords.join(", "));
    if (noIndex) setMeta("robots", "noindex, nofollow");

    if (displayTitle) setMeta("og:title", displayTitle);
    if (displayDesc) setMeta("og:description", displayDesc);
    if (displayImage) {
      setMeta("og:image", displayImage);
      // 이 값을 우선하는 스크래퍼가 있어 반드시 같이 갱신해야 한다
      setMeta("og:image:secure_url", displayImage);
      setMeta("og:image:alt", ogImageAlt ?? displayTitle);
    }
    setMeta("og:type", displayType);
    if (d.siteName) setMeta("og:site_name", d.siteName);
    if (d.locale) setMeta("og:locale", d.locale);
    if (displayCanonical) {
      setMeta("og:url", displayCanonical);
      setLink("canonical", displayCanonical);
    }

    // 전용 커버가 있으면 큰 카드, 사이트 기본 이미지면 작은 카드로 낸다
    setMeta(
      "twitter:card",
      displayImage && displayImage !== d.ogImage ? "summary_large_image" : "summary",
    );
    if (d.twitterSite) setMeta("twitter:site", d.twitterSite);
    if (displayTitle) setMeta("twitter:title", displayTitle);
    if (displayDesc) setMeta("twitter:description", displayDesc);
    if (displayImage) setMeta("twitter:image", displayImage);

    if (displayFavicon) setLink("icon", displayFavicon);
    const touch = appleTouchIcon ?? displayFavicon;
    if (touch) setLink("apple-touch-icon", touch);

    return () => {
      // 다음 페이지가 지정하지 않은 항목이 이전 페이지 값으로 남지 않도록 되돌린다
      if (d.title) document.title = d.title;
      if (d.description) {
        setMeta("description", d.description);
        setMeta("og:description", d.description);
        setMeta("twitter:description", d.description);
      }
      if (d.title) {
        setMeta("og:title", d.title);
        setMeta("twitter:title", d.title);
      }
      if (d.ogImage) {
        setMeta("og:image", d.ogImage);
        setMeta("og:image:secure_url", d.ogImage);
        setMeta("og:image:alt", d.title);
        setMeta("twitter:image", d.ogImage);
      }
      setMeta("og:type", d.ogType ?? "website");
      setMeta("twitter:card", "summary");
      if (siteUrl) {
        setMeta("og:url", siteUrl);
        setLink("canonical", siteUrl);
      }
      if (d.favicon) {
        setLink("icon", d.favicon);
        setLink("apple-touch-icon", d.favicon);
      }
      // 기본값이 없는 항목은 지우는 게 맞다 — 잘못된 값이 남는 것보다 없는 게 낫다
      if (keywords?.length) removeMeta("keywords");
      if (noIndex) removeMeta("robots");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    title,
    rawTitle,
    description,
    ogImage,
    ogImageAlt,
    ogType,
    favicon,
    appleTouchIcon,
    canonical,
    keywordsKey,
    noIndex,
    overridesKey,
    ctxDefaults,
  ]);
}
