"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface ExifData {
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutter?: string;
  iso?: number;
  takenAt?: string | Date;
  location?: string;
  /** 임의 추가 키 */
  extra?: Record<string, string | number>;
}

export interface ExifPanelProps {
  /** EXIF 메타데이터 */
  data: ExifData;
  /** 컴팩트 표시 (단일 라인) */
  compact?: boolean;
  /** 추가 클래스 */
  className?: string;
}

function formatDate(d?: string | Date) {
  if (!d) return null;
  const dt = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("ko", { dateStyle: "medium", timeStyle: "short" }).format(dt);
}

/**
 * EXIF 패널 — 카메라/렌즈/노출 정보 표시.
 * @example
 * <ExifPanel data={{ camera:"Sony α7 IV", lens:"24-70 GM", focalLength:"50mm", aperture:"f/2.8", shutter:"1/250", iso:200 }} />
 * @status stable
 * @since 2.4.0
 * @tags photo, data-display
 */
export const ExifPanel = forwardRef<HTMLDListElement, ExifPanelProps>(
  ({ data, compact, className }, ref) => {
    const dateStr = formatDate(data.takenAt);
    const rows: { label: string; value?: string | number }[] = [
      { label: "카메라", value: data.camera },
      { label: "렌즈", value: data.lens },
      { label: "초점거리", value: data.focalLength },
      { label: "조리개", value: data.aperture },
      { label: "셔터", value: data.shutter },
      { label: "ISO", value: data.iso },
      { label: "촬영시각", value: dateStr ?? undefined },
      { label: "위치", value: data.location },
      ...Object.entries(data.extra ?? {}).map(([k, v]) => ({ label: k, value: v })),
    ].filter((r) => r.value !== undefined && r.value !== "");

    if (compact) {
      return (
        <div
          ref={ref as never}
          className={cn(
            "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted",
            className,
          )}
        >
          {rows.map((r) => (
            <span key={r.label}>
              <span className="text-muted-light">{r.label}</span> {r.value}
            </span>
          ))}
        </div>
      );
    }

    return (
      <dl ref={ref} className={cn("grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs", className)}>
        {rows.map((r) => (
          <div key={r.label} className="contents">
            <dt className="text-muted">{r.label}</dt>
            <dd className="font-medium text-foreground tabular-nums">{r.value}</dd>
          </div>
        ))}
      </dl>
    );
  },
);
ExifPanel.displayName = "ExifPanel";
