"use client";
import { cn } from "../../utils/cn";

export interface SkeletonPresetProps {
  /** 프리셋 종류 */
  variant: "card" | "table" | "profile" | "article" | "list";
  /** 행 수 (table/list 변형) */
  rows?: number;
  /** 추가 클래스 */
  className?: string;
}

const shimmer = "animate-pulse bg-gray-200 rounded";

function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border p-5 space-y-4", className)}>
      <div className={cn(shimmer, "h-40 rounded-xl")} />
      <div className={cn(shimmer, "h-5 w-3/4")} />
      <div className={cn(shimmer, "h-4 w-1/2")} />
      <div className="flex gap-2">
        <div className={cn(shimmer, "h-8 w-20 rounded-lg")} />
        <div className={cn(shimmer, "h-8 w-20 rounded-lg")} />
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border overflow-hidden", className)}>
      <div className="flex gap-4 p-3 bg-gray-50 border-b border-border">
        {[...Array(4)].map((_, i) => <div key={i} className={cn(shimmer, "h-4 flex-1")} />)}
      </div>
      {[...Array(rows)].map((_, r) => (
        <div key={r} className="flex gap-4 p-3 border-b border-border last:border-0">
          {[...Array(4)].map((_, i) => <div key={i} className={cn(shimmer, "h-4 flex-1")} />)}
        </div>
      ))}
    </div>
  );
}

function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className={cn(shimmer, "w-14 h-14 rounded-full shrink-0")} />
      <div className="flex-1 space-y-2">
        <div className={cn(shimmer, "h-5 w-32")} />
        <div className={cn(shimmer, "h-4 w-48")} />
      </div>
    </div>
  );
}

function ArticleSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className={cn(shimmer, "h-8 w-3/4")} />
      <div className="flex items-center gap-3">
        <div className={cn(shimmer, "w-8 h-8 rounded-full")} />
        <div className={cn(shimmer, "h-4 w-24")} />
        <div className={cn(shimmer, "h-4 w-20")} />
      </div>
      <div className={cn(shimmer, "h-48 rounded-xl")} />
      <div className="space-y-2">
        <div className={cn(shimmer, "h-4 w-full")} />
        <div className={cn(shimmer, "h-4 w-full")} />
        <div className={cn(shimmer, "h-4 w-5/6")} />
      </div>
    </div>
  );
}

function ListSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className={cn(shimmer, "w-10 h-10 rounded-lg shrink-0")} />
          <div className="flex-1 space-y-1.5">
            <div className={cn(shimmer, "h-4 w-2/3")} />
            <div className={cn(shimmer, "h-3 w-1/3")} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 카드/리스트/프로필 등 자주 쓰는 스켈레톤 프리셋.
 * @example
 * <SkeletonPreset variant="card" rows={3} />
 * @status stable
 * @since 2.2.0
 * @tags feedback
 */
export function SkeletonPreset({ variant, rows, className }: SkeletonPresetProps) {
  switch (variant) {
    case "card": return <CardSkeleton className={className} />;
    case "table": return <TableSkeleton rows={rows} className={className} />;
    case "profile": return <ProfileSkeleton className={className} />;
    case "article": return <ArticleSkeleton className={className} />;
    case "list": return <ListSkeleton rows={rows} className={className} />;
  }
}
