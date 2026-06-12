"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "../../utils/cn";

export interface PhotoPreview {
  id: string;
  file: File;
  url: string;
}

export interface PhotoUploaderProps {
  /** 새 파일들이 추가될 때 호출 */
  onAdd: (photos: PhotoPreview[]) => void;
  /** 한 항목 제거 */
  onRemove?: (id: string) => void;
  /** 현재 선택된 항목들 (controlled 미리보기) */
  photos?: PhotoPreview[];
  /** 최대 개수 */
  maxCount?: number;
  /** 파일당 최대 크기(바이트) */
  maxSize?: number;
  /** accept (기본 image/*) */
  accept?: string;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 사진 업로더 — 드래그/클릭 + 미리보기 그리드 + 개수 제한.
 * @example
 * <PhotoUploader photos={photos} onAdd={(p) => setPhotos([...photos, ...p])} onRemove={(id) => …} maxCount={9} />
 * @status stable
 * @since 2.4.0
 * @tags photo, form, input
 */
export function PhotoUploader({ onAdd, onRemove, photos = [], maxCount = 9, maxSize, accept = "image/*", className }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Revoke object URLs on unmount to avoid leaks.
  useEffect(() => () => { photos.forEach((p) => URL.revokeObjectURL(p.url)); }, [photos]);

  const ingest = useCallback((files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (arr.length === 0) { setError("이미지 파일만 업로드 가능합니다"); return; }
    if (maxSize) {
      const oversize = arr.filter((f) => f.size > maxSize);
      if (oversize.length > 0) { setError(`${(maxSize / 1024 / 1024).toFixed(0)}MB를 초과한 파일이 있습니다`); return; }
    }
    const remaining = maxCount - photos.length;
    const accepted = arr.slice(0, Math.max(0, remaining));
    if (accepted.length === 0) { setError(`최대 ${maxCount}장까지 업로드할 수 있습니다`); return; }
    setError(null);
    onAdd(accepted.map((file, i) => ({ id: `${Date.now()}-${i}`, file, url: URL.createObjectURL(file) })));
  }, [maxCount, maxSize, onAdd, photos.length]);

  return (
    <div className={cn("space-y-2", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); ingest(e.dataTransfer.files); }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={cn(
          "block w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          dragOver ? "border-primary bg-primary-light/30" : "border-border hover:border-primary/40 hover:bg-primary-light/10",
        )}
      >
        <p className="text-sm text-foreground">사진을 드래그하거나 클릭해서 추가</p>
        <p className="text-[11px] text-muted mt-1">최대 {maxCount}장 · {photos.length}/{maxCount}</p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        aria-label="사진 파일 선택"
        tabIndex={-1}
        className="hidden"
        onChange={(e) => ingest(e.target.files)}
      />

      {error && <p className="text-xs text-danger">{error}</p>}

      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {photos.map((p) => (
            <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img src={p.url} alt={p.file.name} className="w-full h-full object-cover" />
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(p.id)}
                  aria-label={`${p.file.name} 제거`}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs hover:bg-black/80 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
