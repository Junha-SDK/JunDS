"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { MarkdownViewer } from "@/ds/composites/MarkdownViewer";

const sample = `# JunDS Markdown
## 소개
**JunDS**는 *Next.js* 기반의 디자인 시스템입니다.

### 특징
- 토큰 기반 스타일링
- \`a11y\`를 고려한 컴포넌트
- [공식 문서](https://example.com)

> 빠르고 일관된 UI를 만들 수 있습니다.

---
1. 설치
2. 임포트
3. 사용`;

export default function MarkdownViewerPage() {
  return (
    <ComponentPage
      name="MarkdownViewer"
      description="간단한 마크다운 문법(헤더, 강조, 코드, 리스트, 링크, 인용)을 HTML로 렌더링합니다."
      importPath='import { MarkdownViewer } from "@/ds/composites/MarkdownViewer"'
      props={[
        { name: "content", type: "string", description: "마크다운 원본 문자열" },
        { name: "className", type: "string", description: "추가 클래스" },
      ]}
    >
      <Section title="Default">
        <Preview>
          <div className="w-full max-w-2xl">
            <MarkdownViewer content={sample} />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
