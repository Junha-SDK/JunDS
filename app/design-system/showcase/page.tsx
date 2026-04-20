"use client";
import { useRouter } from "next/navigation";
import { ComponentShowcase } from "@/ds/composites/ComponentShowcase";
import { showcaseItems } from "../_data/component-demos";

export default function ShowcasePage() {
  const router = useRouter();

  return (
    <div className="h-full overflow-y-auto">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden border-b border-border">
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-accent/8 blur-3xl" />

        <div className="relative px-8 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                <rect x="3" y="3" width="7" height="7" rx="2" />
                <rect x="14" y="3" width="7" height="7" rx="2" />
                <rect x="3" y="14" width="7" height="7" rx="2" />
                <rect x="14" y="14" width="7" height="7" rx="2" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">컴포넌트 갤러리</h1>
              <p className="text-sm text-muted">
                {showcaseItems.length}개의 컴포넌트를 시각적으로 탐색하세요
              </p>
            </div>
          </div>
          <p className="text-xs text-muted/70 max-w-lg">
            카드 위에 마우스를 올리면 컴포넌트의 실제 동작을 미리볼 수 있습니다. 클릭하면 상세 문서 페이지로 이동합니다.
          </p>
        </div>
      </div>

      {/* ── Gallery ── */}
      <div className="px-8 py-8">
        <ComponentShowcase
          items={showcaseItems}
          searchable
          filterable
          columns={4}
          onItemClick={(item) => {
            if (item.href) router.push(item.href);
          }}
        />
      </div>
    </div>
  );
}
