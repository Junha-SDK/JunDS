"use client";
import { useRef, useState, useCallback } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface FileUploadProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // bytes
  disabled?: boolean;
  /** 커스텀 트리거 (없으면 드롭존) */
  trigger?: ReactNode;
  /** 드롭존 설명 */
  description?: string;
  className?: string;
}

/**
 * 파일 업로드 (드래그 앤 드롭 + 클릭)
 * @example
 * <FileUpload onFiles={handleFiles} accept="image/*" multiple maxSize={5*1024*1024} />
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
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={(e) => processFiles(e.target.files)} />
      </>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer",
          "hover:border-primary/40 hover:bg-primary-light/30",
          dragOver && "border-primary bg-primary-light/40 scale-[1.01]",
          disabled && "opacity-50 cursor-not-allowed",
          error ? "border-danger/40" : "border-border",
        )}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-muted-light">
          <path d="M16 20V8m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 22v2a4 4 0 004 4h16a4 4 0 004-4v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <p className="text-sm text-muted text-center">{description}</p>
        {accept && <p className="text-[10px] text-muted-light">{accept.replace(/,/g, ", ")}</p>}
        {maxSize && <p className="text-[10px] text-muted-light">최대 {(maxSize / 1024 / 1024).toFixed(0)}MB</p>}
      </div>
      {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={(e) => processFiles(e.target.files)} />
    </div>
  );
}
