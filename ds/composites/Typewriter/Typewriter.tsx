"use client";
import { useEffect, useState, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface TypewriterProps {
  texts: string[];
  speed?: number;
  deleteSpeed?: number;
  delay?: number;
  loop?: boolean;
  cursor?: boolean;
  cursorChar?: string;
  className?: string;
  onComplete?: () => void;
}

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
          if (!loop) { onComplete?.(); return; }
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
        <span className="animate-pulse ml-0.5 text-primary" aria-hidden="true">
          {cursorChar}
        </span>
      )}
    </span>
  );
}
