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
          "border-2 border-dashed border-border rounded-xl cursor-crosshair touch-none bg-white",
          disabled && "opacity-50 cursor-not-allowed",
        )}
        aria-label="서명 패드"
      />
      <div className="flex gap-2 mt-2">
        <button type="button" onClick={clear} disabled={disabled || !hasSignature}
          className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-gray-50 disabled:opacity-50 cursor-pointer transition-colors">
          지우기
        </button>
        <button type="button" onClick={save} disabled={disabled || !hasSignature}
          className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 cursor-pointer transition-colors">
          저장
        </button>
      </div>
    </div>
  );
}
