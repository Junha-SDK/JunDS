"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { AutoHideHeader } from "@/ds/composites/AutoHideHeader";

export default function AutoHideHeaderPage() {
  return (
    <ComponentPage
      name="AutoHideHeader"
      description="스크롤 방향을 감지하여 자동으로 숨겨지고 다시 나타나는 헤더. 아래로 스크롤하면 헤더가 숨겨지고, 위로 스크롤하면 다시 나타납니다."
      importPath='import { AutoHideHeader } from "@/ds/composites/AutoHideHeader"'
      props={[
        { name: "children", type: "ReactNode", description: "헤더 내부 콘텐츠" },
        { name: "threshold", type: "number", default: "8", description: "스크롤 감지 임계값 (px)" },
        { name: "height", type: "number", default: "64", description: "헤더 높이 (px)" },
        { name: "className", type: "string", description: "추가 CSS 클래스" },
      ]}
    >
      <Section title="데모">
        <Preview padding={false}>
          <div className="relative h-[400px] overflow-y-auto rounded-xl">
            <AutoHideHeader
              height={56}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border"
            >
              <div className="flex items-center justify-between px-4 h-full">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500" />
                  <span className="text-sm font-bold">JunDS</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted">
                  <span>Docs</span>
                  <span>Components</span>
                  <span>Blog</span>
                </div>
              </div>
            </AutoHideHeader>

            <div className="px-6 pt-16 pb-6 space-y-6">
              <p className="text-xs text-muted italic">
                아래로 스크롤하면 헤더가 숨겨지고, 위로 스크롤하면 다시 나타납니다.
              </p>
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, hsl(${i * 30}, 70%, 60%), hsl(${i * 30 + 40}, 70%, 50%))`,
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium">섹션 {i + 1}</p>
                      <p className="text-xs text-muted">스크롤하여 헤더 동작을 확인하세요</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    이 영역은 스크롤 테스트를 위한 더미 콘텐츠입니다.
                    충분한 높이를 확보하여 스크롤 동작을 확인할 수 있습니다.
                    AutoHideHeader는 sticky 포지셔닝과 transform을 활용하여
                    부드러운 숨김/표시 애니메이션을 구현합니다.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
