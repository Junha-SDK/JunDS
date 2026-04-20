"use client";
import { useRouter } from "next/navigation";
import { ComponentShowcase } from "@/ds/composites/ComponentShowcase";
import { showcaseItems } from "../_data/component-demos";

export default function ShowcasePage() {
  const router = useRouter();

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border px-8 py-5">
        <h1 className="text-xl font-bold text-foreground">컴포넌트 갤러리</h1>
        <p className="text-sm text-muted mt-0.5">컴포넌트를 시각적으로 탐색하고, 호버하여 동작을 미리보세요</p>
      </div>

      {/* Gallery */}
      <div className="px-8 py-6">
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
