"use client";
import { useRef, useState, useCallback } from "react";
import { cn } from "../../utils/cn";
import { useT } from "../../providers/I18nProvider";
import type { ReactNode } from "react";

export interface FileUploadProps {
  /** 선택된 파일 콜백 */
  onFiles: (files: File[]) => void;
  /** 허용할 파일 MIME 패턴 */
  accept?: string;
  /** 다중 선택 허용 */
  multiple?: boolean;
  /** 파일당 최대 크기(바이트) */
  maxSize?: number; // bytes
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 커스텀 트리거 (없으면 드롭존) */
  trigger?: ReactNode;
  /** 드롭존 설명 */
  description?: string;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 파일 업로드 (드래그 앤 드롭 + 클릭)
 * @example
 * <FileUpload onFiles={handleFiles} accept="image/*" multiple maxSize={5*1024*1024} />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export function FileUpload({
  onFiles,
  accept,
  multiple,
  maxSize,
  disabled,
  trigger,
  description = "파일을 드래그하거나 클릭하여 업로드",
  className,
}: FileUploadProps) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList);
    if (maxSize) {
      const oversized = files.filter((f) => f.size > maxSize);
      if (oversized.length > 0) {
        setError(`파일 크기가 ${(maxSize / 1024 / 1024).toFixed(0)}MB를 초과합니다`);
        return;
      }
    }
    setError(null);
    onFiles(files);
  }, [maxSize, onFiles]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  if (trigger) {
    return (
      <>
        <div onClick={() => inputRef.current?.click()} className={cn("cursor-pointer", className)}>
          {trigger}
        </div>
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} aria-label={t("ariaFilePicker")} tabIndex={-1} className="hidden" onChange={(e) => processFiles(e.target.files)} />
      </>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={description}
        onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !disabled) { e.preventDefault(); inputRef.current?.click(); } }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "group flex flex-col items-center justify-center gap-2.5 border-2 border-dashed rounded-2xl p-8 bg-gray-50/50 transition-all duration-200 ease-out cursor-pointer",
          "hover:border-primary/40 hover:bg-primary-light/30",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
          dragOver && "border-primary bg-primary-light/40 scale-[1.01] shadow-[0_0_0_4px_var(--primary-glow)]",
          disabled && "opacity-50 cursor-not-allowed",
          error ? "border-danger/40" : "border-border",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full bg-white text-muted-light shadow-[0_1px_3px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] ring-1 ring-black/[0.04] transition-all duration-200",
            "group-hover:text-primary group-hover:scale-105",
            dragOver && "text-primary scale-110 shadow-[0_4px_12px_var(--primary-glow)]",
          )}
        >
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <path d="M16 20V8m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 22v2a4 4 0 004 4h16a4 4 0 004-4v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sm text-muted text-center">{description}</p>
        {accept && <p className="text-[10px] text-muted-light">{accept.replace(/,/g, ", ")}</p>}
        {maxSize && <p className="text-[10px] text-muted-light">최대 {(maxSize / 1024 / 1024).toFixed(0)}MB</p>}
      </div>
      {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} aria-label={t("ariaFilePicker")} tabIndex={-1} className="hidden" onChange={(e) => processFiles(e.target.files)} />
    </div>
  );
}
