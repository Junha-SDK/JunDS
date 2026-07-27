"use client";

import { useSeo, type SeoProps } from "../../hooks/useSeo";

export type SeoHeadProps = SeoProps;

/**
 * 페이지 SEO 메타태그를 선언적으로 지정하는 컴포넌트. 아무것도 렌더하지 않는다.
 *
 * `useSeo` 를 감싼 얇은 래퍼로, 훅 호출 대신 JSX 로 쓰고 싶을 때 사용한다.
 * 사이트 전역 기본값은 `SeoProvider` 로 한 번만 지정한다.
 *
 * @example
 * <SeoHead title={post.title} description={post.summary} ogType="article" />
 * @status stable
 * @since 2.3.0
 * @tags seo, meta
 */
export function SeoHead(props: SeoHeadProps) {
  useSeo(props);
  return null;
}
