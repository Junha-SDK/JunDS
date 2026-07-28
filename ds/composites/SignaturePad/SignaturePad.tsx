"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface SignaturePadProps {
  /** 저장 콜백 (data URL 전달) */
  onSave?: (dataUrl: string) => void;
  /** 패드 너비(px) */
  width?: number;
  /** 패드 높이(px) */
  height?: number;
  /** 선 색상 */
  strokeColor?: string;
  /** 선 두께(px) */
  strokeWidth?: number;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 마우스/터치로 서명을 그리는 패드.
 * @example
 * <SignaturePad onSave={(dataUrl) => upload(dataUrl)} width={400} height={200} />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export function SignaturePad({
  onSave,
  width = 400,
  height = 200,
  strokeColor = "var(--foreground)",
  strokeWidth = 2,
  disabled,
  className,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const getCtx = useCallback(() => canvasRef.current?.getContext("2d"), []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    const ctx = getCtx();
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing || disabled) return;
    const ctx = getCtx();
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stop = () => setDrawing(false);

  const clear = () => {
    const ctx = getCtx();
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasSignature(false);
  };

  const save = () => {
    if (!canvasRef.current) return;
    onSave?.(canvasRef.current.toDataURL("image/png"));
  };

  return (
    <div className={cn("inline-block", className)}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={start}
        onMouseMove={draw}
        onMouseUp={stop}
        onMouseLeave={stop}
        onTouchStart={start}
        onTouchMove={draw}
        onTouchEnd={stop}
        className={cn(
          // 선 색이 var(--foreground) 라 캔버스도 모드를 따라가야 한다 — bg-white 면 다크에서 서명이 사라진다.
          // 고정 width 라 좁은 칸에서 넘치므로 max-w-full 로 가둔다
          "border-2 border-dashed border-border rounded-xl cursor-crosshair touch-none bg-card max-w-full",
          disabled && "opacity-50 cursor-not-allowed",
        )}
        aria-label="서명 패드"
      />
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={clear}
          disabled={disabled || !hasSignature}
          className={cn(
            "px-3 py-1.5 text-xs border border-border bg-card rounded-xl cursor-pointer",
            "transition-colors active:scale-[0.97] motion-reduce:active:scale-100",
            "hover:bg-card-hover hover:border-muted-light",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-card",
          )}
        >
          지우기
        </button>
        <button
          type="button"
          onClick={save}
          disabled={disabled || !hasSignature}
          className={cn(
            "px-3 py-1.5 text-xs bg-primary text-white rounded-xl cursor-pointer",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]",
            "transition-colors active:scale-[0.97] motion-reduce:active:scale-100",
            "hover:bg-primary-hover",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary",
          )}
        >
          저장
        </button>
      </div>
    </div>
  );
}
