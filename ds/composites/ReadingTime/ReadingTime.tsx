"use client";

import React from "react";
import { cn } from "../../utils/cn";

/** 난이도 레벨 (한글) */
type DifficultyKo = "초급" | "중급" | "고급";

export interface ReadingTimeProps {
  /** 텍스트 내용 (HTML 또는 plain text) */
  content: string;
  /** 표시 형식 */
  format?: "short" | "long";
  /** 난이도 표시 */
  showDifficulty?: boolean;
  /**
   * 라틴 문자 읽기 속도 (분당 단어 수, 기본 230).
   *
   * 기본값은 일반적인 묵독 속도다. 기술 문서처럼 곱씹어 읽는 글이라면
   * 170 정도로 낮춰 체감에 맞춘다.
   */
  wpm?: number;
  /**
   * CJK 문자 읽기 속도 (분당 글자 수, 기본 170).
   *
   * 한국어 본문은 이 값이 결과를 지배하므로, 표시 시간이 체감과 어긋나면
   * 여기부터 조정한다.
   */
  cpm?: number;
  /** 최소 표시 시간 (분, 기본 1). "1분 미만"이 무의미한 화면에서는 2를 준다 */
  minMinutes?: number;
  /**
   * 난이도 계산에 쓸 헤딩 수를 직접 지정.
   *
   * 기본은 `content` 의 HTML 에서 `<h2>`/`<h3>` 를 센다. 본문이 이미 DOM 에만
   * 있거나 마크다운 원문일 때 실제 개수를 넘긴다.
   */
  headingCount?: number;
  /** 추가 클래스 */
  className?: string;
}

/**
 * HTML 태그를 제거하고 순수 텍스트만 반환
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * CJK(한/중/일) 문자와 라틴 단어를 분리하여 읽기 시간 추정
 * - CJK: 분당 170자(CPM)
 * - 라틴: 분당 230단어(WPM)
 */
function estimateReadingTime(
  text: string,
  wpmLatin: number,
  cpmCjk: number,
  minMinutes: number,
): {
  minutes: number;
  words: number;
  cjkChars: number;
} {
  const cleaned = (text ?? "").replace(/\s+/g, " ").trim();

  // CJK(한/중/일) 문자 수
  const cjkChars = (
    cleaned.match(
      /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/g,
    ) ?? []
  ).length;

  // CJK 문자를 제거한 후 공백 기반 단어 수 (영문/숫자/혼합)
  const words = cleaned
    .replace(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/g, " ")
    .split(" ")
    .filter(Boolean).length;

  const base = words / wpmLatin + cjkChars / cpmCjk;

  // 올림 + 최소 시간 보장
  const minutes = Math.max(minMinutes, Math.ceil(base));

  return { minutes, words, cjkChars };
}

/**
 * 콘텐츠 난이도를 추정
 * - 헤딩 수 + 콘텐츠 길이(분) 기반 점수 산출
 */
function estimateDifficulty(
  minutes: number,
  headingCount: number,
): DifficultyKo {
  const score = minutes * 1.0 + headingCount * 0.25;
  if (score < 5) return "초급";
  if (score < 10) return "중급";
  return "고급";
}

/**
 * HTML 문자열에서 h2, h3 헤딩 태그 수를 추출
 */
function countHeadings(content: string): number {
  const matches = content.match(/<h[23][^>]*>/gi);
  return matches?.length ?? 0;
}

/**
 * 읽기 시간 추정 컴포넌트
 *
 * CJK(한글/中文/日本語) 문자와 라틴 문자를 구분하여
 * 각각 다른 읽기 속도로 소요 시간을 계산합니다.
 *
 * @example
 * ```tsx
 * <ReadingTime content={htmlContent} format="long" showDifficulty />
 * // 출력: "약 3분 소요 · 중급"
 *
 * <ReadingTime content={plainText} format="short" />
 * // 출력: "3분 읽기"
 *
 * // 체감에 맞춰 속도를 조정 (더 느긋하게 읽는 글)
 * <ReadingTime content={html} wpm={170} cpm={280} minMinutes={2} />
 * ```
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export function ReadingTime({
  content,
  format = "short",
  showDifficulty = false,
  wpm = 230,
  cpm = 170,
  minMinutes = 1,
  headingCount: headingCountProp,
  className,
}: ReadingTimeProps) {
  const plainText = stripHtml(content);
  const { minutes } = estimateReadingTime(plainText, wpm, cpm, minMinutes);
  const headingCount = headingCountProp ?? countHeadings(content);
  const difficulty = estimateDifficulty(minutes, headingCount);

  const timeText =
    format === "short" ? `${minutes}분 읽기` : `약 ${minutes}분 소요`;

  const showDifficultyText = format === "long" || showDifficulty;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-neutral-500",
        className,
      )}
    >
      <span>{timeText}</span>
      {showDifficultyText && (
        <>
          <span aria-hidden="true" className="text-neutral-300">
            ·
          </span>
          <span
            className={cn(
              "font-medium",
              difficulty === "초급" && "text-green-600",
              difficulty === "중급" && "text-yellow-600",
              difficulty === "고급" && "text-red-600",
            )}
          >
            {difficulty}
          </span>
        </>
      )}
    </span>
  );
}
