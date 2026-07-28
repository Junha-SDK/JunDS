"use client";
import { useEffect, useState, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface TypewriterProps {
  /** 순환 표시할 문장 배열 */
  texts: string[];
  /** 타이핑 속도(ms/char) */
  speed?: number;
  /** 삭제 속도(ms/char) */
  deleteSpeed?: number;
  /** 다음 문장 시작 전 지연(ms) */
  delay?: number;
  /** 무한 반복 */
  loop?: boolean;
  /** 커서 표시 */
  cursor?: boolean;
  /** 커서 문자 */
  cursorChar?: string;
  /** 추가 클래스 */
  className?: string;
  /** 완료 콜백 */
  onComplete?: () => void;
}

/**
 * 글자를 한 글자씩 쳐 나가는 타이핑 효과.
 * @example
 * <Typewriter texts={["안녕하세요", "Hello"]} speed={80} loop />
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export function Typewriter({
  texts,
  speed = 80,
  deleteSpeed = 40,
  delay = 2000,
  loop = true,
  cursor = true,
  cursorChar = "|",
  className,
  onComplete,
}: TypewriterProps) {
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentText = texts[textIdx] ?? "";

  const tick = useCallback(() => {
    if (isDeleting) {
      setCharIdx((prev) => prev - 1);
      if (charIdx <= 1) {
        setIsDeleting(false);
        const next = textIdx + 1;
        if (next >= texts.length) {
          if (!loop) {
            onComplete?.();
            return;
          }
          setTextIdx(0);
        } else {
          setTextIdx(next);
        }
      }
    } else {
      setCharIdx((prev) => prev + 1);
    }
  }, [isDeleting, charIdx, textIdx, texts.length, loop, onComplete]);

  useEffect(() => {
    if (!isDeleting && charIdx === currentText.length) {
      const timer = setTimeout(() => setIsDeleting(true), delay);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(tick, isDeleting ? deleteSpeed : speed);
    return () => clearTimeout(timer);
  }, [charIdx, isDeleting, currentText.length, delay, speed, deleteSpeed, tick]);

  return (
    <span className={cn("inline", className)} aria-label={currentText}>
      <span>{currentText.slice(0, charIdx)}</span>
      {cursor && (
        // 깜빡이는 커서는 감속 요청을 켠 사용자에게 그대로 두면 안 된다 — 켜진 채로 멈춘다
        <span
          className="animate-pulse motion-reduce:animate-none ml-0.5 text-primary-ink"
          aria-hidden="true"
        >
          {cursorChar}
        </span>
      )}
    </span>
  );
}
