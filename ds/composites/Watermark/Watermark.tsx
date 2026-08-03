"use client";
import { cn } from "../../utils/cn";
import { Slot, Slottable } from "../../utils/Slot";
import { useMemo } from "react";
import type { ReactNode } from "react";

export interface WatermarkProps {
  /** 워터마크 텍스트 */
  text: string;
  /** 감쌀 콘텐츠 */
  children: ReactNode;
  /** 글자 크기(px) */
  fontSize?: number;
  /** 텍스트 색상 */
  color?: string;
  /** 회전 각도(deg) */
  rotate?: number;
  /** 패턴 간격(px) */
  gap?: number;
  /** 추가 클래스 */
  className?: string;
  /** root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) */
  asChild?: boolean;
}

/**
 * 워터마크 오버레이 컴포넌트
 * @description 콘텐츠 위에 반복되는 워터마크 텍스트를 표시합니다.
 * @example
 * <Watermark text="기밀 문서">
 *   <div>보호할 콘텐츠</div>
 * </Watermark>
 * @status stable
 * @since 2.2.0
 * @tags layout
 */
export function Watermark({
  text,
  children,
  fontSize = 16,
  color = "rgba(0, 0, 0, 0.08)",
  rotate = -22,
  gap = 100,
  className,
  asChild,
}: WatermarkProps) {
  const backgroundStyle = useMemo(() => {
    const canvas = typeof document !== "undefined" ? document.createElement("canvas") : null;
    if (!canvas) return {};

    const ctx = canvas.getContext("2d");
    if (!ctx) return {};

    const font = `${fontSize}px sans-serif`;
    ctx.font = font;
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize * 1.2;

    const cellWidth = textWidth + gap;
    const cellHeight = textHeight + gap;

    canvas.width = cellWidth * 2;
    canvas.height = cellHeight * 2;

    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const centerX1 = cellWidth / 2;
    const centerY1 = cellHeight / 2;
    const centerX2 = cellWidth + cellWidth / 2;
    const centerY2 = cellHeight + cellHeight / 2;

    const rad = (rotate * Math.PI) / 180;

    ctx.save();
    ctx.translate(centerX1, centerY1);
    ctx.rotate(rad);
    ctx.fillText(text, 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(centerX2, centerY1);
    ctx.rotate(rad);
    ctx.fillText(text, 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(centerX1, centerY2);
    ctx.rotate(rad);
    ctx.fillText(text, 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(centerX2, centerY2);
    ctx.rotate(rad);
    ctx.fillText(text, 0, 0);
    ctx.restore();

    return {
      backgroundImage: `url(${canvas.toDataURL()})`,
      backgroundRepeat: "repeat",
      backgroundSize: `${cellWidth}px ${cellHeight}px`,
    };
  }, [text, fontSize, color, rotate, gap]);

  const Comp = asChild ? Slot : "div";
  return (
    <Comp className={cn("relative", className)}>
      {asChild ? <Slottable>{children}</Slottable> : children}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={backgroundStyle}
        aria-hidden="true"
      />
    </Comp>
  );
}
