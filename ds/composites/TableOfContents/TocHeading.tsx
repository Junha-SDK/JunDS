"use client";

import { forwardRef, useId, type HTMLAttributes, type ReactNode } from "react";
import { useRegisterHeading } from "../../providers/TocProvider";

export interface TocHeadingProps extends Omit<HTMLAttributes<HTMLHeadingElement>, "children"> {
  /** 헤딩 레벨 (기본 2) */
  level?: 2 | 3 | 4 | 5 | 6;
  /** 앵커 id. 없으면 텍스트에서 슬러그를 만들고, 그것도 안 되면 자동 생성한다 */
  id?: string;
  /**
   * 목차에 표시할 텍스트.
   * children 이 문자열이 아닐 때(아이콘·뱃지가 섞인 경우) 반드시 지정한다.
   */
  label?: string;
  /** 이 헤딩을 목차에서 뺄지 (본문에는 그대로 보인다) */
  hidden?: boolean;
  children?: ReactNode;
}

/** children 이 문자열/숫자로만 이뤄져 있으면 그 텍스트를 뽑는다 */
function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  return "";
}

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w가-힣-]/g, "");
}

/**
 * 렌더되는 순간 스스로 목차에 등록되는 헤딩.
 *
 * `TocProvider` 안에서 쓰면 `useToc()` 로 목차를 읽을 수 있고, 밖에서 쓰면 그냥
 * 평범한 `<h2>` 로 동작한다. id 를 주지 않으면 텍스트에서 슬러그를 만들고,
 * 텍스트를 뽑을 수 없으면 `useId()` 기반의 안정적인 id 를 붙인다 — 어느 쪽이든
 * 서버와 클라이언트가 같은 id 를 내므로 하이드레이션이 어긋나지 않는다.
 *
 * @example
 * <TocHeading level={2}>들어가며</TocHeading>
 * @status stable
 * @since 2.3.0
 * @tags navigation, content
 */
export const TocHeading = forwardRef<HTMLHeadingElement, TocHeadingProps>(function TocHeading(
  { level = 2, id, label, hidden = false, children, ...props },
  ref,
) {
  const autoId = useId().replace(/:/g, "");
  const text = label ?? textOf(children);
  const finalId = id || (text ? slugify(text) : "") || `h${level}-${autoId}`;

  useRegisterHeading(hidden ? null : { id: finalId, label: text || finalId, level });

  const Tag = `h${level}` as const;
  return (
    <Tag ref={ref} id={finalId} {...props}>
      {children}
    </Tag>
  );
});
