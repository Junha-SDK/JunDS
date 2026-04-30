"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { VisuallyHidden } from "@/ds/primitives/VisuallyHidden";
import { Button } from "@/ds/primitives/Button";

export default function VisuallyHiddenPage() {
  return (
    <ComponentPage
      name="VisuallyHidden"
      description="시각적으로는 보이지 않지만 스크린리더에는 읽히는 콘텐츠를 렌더링합니다. 아이콘 전용 버튼의 라벨, 보조 설명 등에 사용합니다."
      importPath='import { VisuallyHidden } from "@/ds/primitives/VisuallyHidden"'
      props={[
        { name: "children", type: "ReactNode", description: "스크린리더에만 노출될 콘텐츠." },
        { name: "className", type: "string", description: "추가 CSS 클래스 (span 요소에 적용)." },
      ]}
    >
      <Section title="Basic" description="아이콘 전용 버튼에 라벨을 제공하는 예시. 두 번째 버튼은 스크린리더가 '닫기'로 읽습니다.">
        <Preview>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="ghost" aria-label="검색">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </Button>
            <Button size="sm" variant="ghost">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <VisuallyHidden>닫기</VisuallyHidden>
            </Button>
            <p className="text-xs text-muted">두 버튼 모두 스크린리더가 라벨을 읽습니다.</p>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
