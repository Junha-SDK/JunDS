"use client";
import { useMemo } from "react";
import { cn } from "../../utils/cn";
import { applyKinsokuToHtml } from "../../utils/kinsoku";

export interface MarkdownViewerProps {
  /** 마크다운 원문 텍스트 */
  content: string;
  /**
   * 원문의 raw HTML 을 그대로 통과시킬지 (기본 false).
   *
   * 기본값에서는 `<` 와 `&` 를 이스케이프해 원문에 섞인 태그가 실행되지 않는다.
   * 사용자가 쓴 글이나 외부에서 받아 온 마크다운에는 절대 `true` 를 주면 안 된다 —
   * 이 컴포넌트는 HTML 을 삭제(sanitize)하지 않으므로 그대로 스크립트가 실행된다.
   */
  allowHtml?: boolean;
  /**
   * 줄바꿈 하나를 `<br>` 로 취급할지 (기본 false).
   *
   * 시·가사처럼 행이 곧 의미인 글에 쓴다. 표준 마크다운은 빈 줄이 있어야
   * 문단이 나뉘므로, 이 옵션 없이는 행갈이가 전부 뭉개진다.
   */
  breaks?: boolean;
  /**
   * 금칙처리 적용 여부 (기본 false).
   *
   * 마침표·닫는 괄호 같은 문장부호가 줄 첫머리로 떨어지지 않게 묶는다.
   * 한국어 장문(책 본문, 에세이)에서 눈에 띄게 다듬어진다.
   */
  kinsoku?: boolean;
  /** 추가 클래스 */
  className?: string;
}

/** 태그로 해석될 수 있는 문자를 무해하게 만든다 */
function escapeHtml(raw: string): string {
  return raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function parseMarkdown(md: string, breaks: boolean): string {
  const html = md
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono text-primary">$1</code>')
    .replace(/^\- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary underline" target="_blank" rel="noopener">$1</a>')
    .replace(/^> (.+)$/gm, '<blockquote class="pl-4 border-l-4 border-primary/30 text-muted italic my-2">$1</blockquote>')
    .replace(/^---$/gm, '<hr class="border-border my-4" />')
    .replace(/\n\n/g, '<br/><br/>');

  // 문단 분리를 먼저 처리한 뒤라, 남은 개행이 곧 "행갈이"다
  return breaks ? html.replace(/\n/g, "<br/>") : html;
}

/**
 * 마크다운 텍스트를 HTML 로 렌더링합니다.
 *
 * 의존성 없이 동작하도록 자주 쓰는 문법만 지원하는 가벼운 렌더러다. 표·각주·
 * 중첩 목록까지 필요하면 `react-markdown` 같은 본격적인 파서를 쓰고, 한국어
 * 조판만 빌리고 싶다면 `remarkKinsoku` 플러그인을 그쪽에 꽂으면 된다.
 *
 * @example
 * <MarkdownViewer content="# 제목\n\n본문 내용" />
 * @example
 * // 한국어 장문 — 금칙처리를 켠다
 * <MarkdownViewer content={chapter.body} kinsoku />
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export function MarkdownViewer({
  content,
  allowHtml = false,
  breaks = false,
  kinsoku = false,
  className,
}: MarkdownViewerProps) {
  const html = useMemo(() => {
    // 이스케이프 → 파싱 → 금칙처리 순서다. 금칙처리를 원문에 먼저 걸면 삽입한
    // word joiner 가 `](` 사이에 끼어 링크 문법 매칭을 깨뜨린다. 그래서 HTML 이
    // 된 뒤에, 태그와 코드 바깥의 텍스트에만 적용한다.
    const source = allowHtml ? content : escapeHtml(content);
    const parsed = parseMarkdown(source, breaks);
    return kinsoku ? applyKinsokuToHtml(parsed) : parsed;
  }, [content, allowHtml, breaks, kinsoku]);

  return (
    <div
      className={cn("prose-custom text-sm leading-relaxed text-foreground", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
