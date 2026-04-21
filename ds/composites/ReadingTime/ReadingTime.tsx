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
function estimateReadingTime(text: string): {
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

  const WPM_LATIN = 230;
  const CPM_CJK = 170;

  const base = words / WPM_LATIN + cjkChars / CPM_CJK;

  // 올림 + 최소 1분 보장
  const minutes = Math.max(1, Math.ceil(base));

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
 * ```
 */
export function ReadingTime({
  content,
  format = "short",
  showDifficulty = false,
  className,
}: ReadingTimeProps) {
  const plainText = stripHtml(content);
  const { minutes } = estimateReadingTime(plainText);
  const headingCount = countHeadings(content);
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
