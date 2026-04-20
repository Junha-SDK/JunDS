"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Skeleton } from "@/ds/composites/Skeleton";

export default function SkeletonPage() {
  return (
    <ComponentPage
      name="Skeleton"
      description="로딩 스켈레톤. text, circle, rect 변형."
      importPath='import { Skeleton } from "@/ds/composites/Skeleton"'
      props={[
        { name: "variant", type: '"text"|"circle"|"rect"', default: '"text"', description: "형태" },
        { name: "width", type: "string | number", description: "너비" },
        { name: "height", type: "string | number", description: "높이" },
        { name: "lines", type: "number", default: "1", description: "텍스트 줄 수" },
      ]}
    >
      <Section title="Variants">
        <Preview>
          <div className="flex flex-col gap-6 max-w-sm">
            <div>
              <p className="text-xs text-muted mb-2">Text (3 lines)</p>
              <Skeleton variant="text" lines={3} />
            </div>
            <div>
              <p className="text-xs text-muted mb-2">Circle</p>
              <div className="flex items-center gap-3">
                <Skeleton variant="circle" width={32} height={32} />
                <Skeleton variant="circle" width={48} height={48} />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted mb-2">Rect</p>
              <Skeleton variant="rect" height={120} />
            </div>
            <div>
              <p className="text-xs text-muted mb-2">Card Skeleton</p>
              <div className="border border-border rounded-xl p-4 flex items-center gap-3">
                <Skeleton variant="circle" width={40} height={40} />
                <div className="flex-1">
                  <Skeleton variant="text" lines={2} />
                </div>
              </div>
            </div>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
