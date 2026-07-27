"use client";

import { useEffect } from "react";

/**
 * schema.org JSON-LD 를 `<head>` 에 주입하고 언마운트 시 제거하는 훅.
 *
 * payload 는 렌더마다 문자열로 직렬화해 비교하므로, 호출부가 인라인 객체
 * 리터럴을 그대로 넘겨도 매 렌더 재주입되지 않는다. (`useMemo` 불필요)
 *
 * 같은 `key` 로 다시 호출하면 기존 스크립트를 교체하므로, 라우트가 바뀔 때
 * 이전 페이지의 구조화 데이터가 남지 않는다.
 *
 * @param key - 이 스크립트를 식별하는 이름 (`data-jsonld` 속성으로 붙는다)
 * @param data - schema.org 객체 (`@context` / `@type` 포함)
 *
 * @example
 * ```tsx
 * useJsonLd("article", {
 *   "@context": "https://schema.org",
 *   "@type": "BlogPosting",
 *   headline: post.title,
 *   datePublished: post.date,
 * });
 * ```
 */
export function useJsonLd(key: string, data: object | null | undefined): void {
  const json = data ? JSON.stringify(data) : "";

  useEffect(() => {
    if (typeof document === "undefined" || !json) return;

    // 같은 key 로 이미 붙어 있던 스크립트가 있으면 먼저 걷어낸다 (라우트 전환 시
    // StrictMode 이중 실행이나 프리렌더 산출물과의 중복을 막는다).
    document
      .querySelectorAll(`script[data-jsonld="${CSS.escape(key)}"]`)
      .forEach((el) => el.remove());

    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.setAttribute("data-jsonld", key);
    el.textContent = json;
    document.head.appendChild(el);

    return () => {
      el.remove();
    };
  }, [key, json]);
}
