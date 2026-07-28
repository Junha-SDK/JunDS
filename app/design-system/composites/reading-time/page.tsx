"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ReadingTime } from "@/ds/composites/ReadingTime";

const shortText = "간단한 소개 문장입니다. 디자인 시스템의 기본 개념을 다룹니다.";

const mediumText = `
디자인 시스템은 일관된 사용자 경험을 구축하기 위한 재사용 가능한 컴포넌트와 가이드라인의 모음입니다.
잘 구축된 디자인 시스템은 팀의 생산성을 높이고, 제품 전반에 걸쳐 통일된 브랜드 경험을 제공합니다.
컴포넌트 라이브러리, 디자인 토큰, 문서화, 그리고 거버넌스 프로세스가 핵심 구성 요소입니다.
각 컴포넌트는 접근성, 반응형 디자인, 테마 지원을 기본으로 갖추어야 하며,
개발자와 디자이너 모두가 쉽게 사용할 수 있는 API를 제공해야 합니다.
토큰 시스템은 색상, 타이포그래피, 간격, 그림자 등의 시각적 속성을 추상화하여 관리합니다.
`.trim();

const longText = `
<h2>1장: 디자인 시스템의 기초</h2>
디자인 시스템은 단순한 UI 키트를 넘어서는 포괄적인 프레임워크입니다.
여기에는 컴포넌트 라이브러리, 디자인 토큰, 패턴 라이브러리, 문서화 사이트,
그리고 이 모든 것을 유지보수하기 위한 거버넌스 프로세스가 포함됩니다.

<h2>2장: 컴포넌트 설계 원칙</h2>
좋은 컴포넌트는 단일 책임 원칙을 따릅니다. 각 컴포넌트는 하나의 역할만 수행하며,
합성을 통해 복잡한 UI를 구성할 수 있어야 합니다. 접근성은 선택이 아닌 필수입니다.
WCAG 2.1 AA 수준의 접근성을 기본으로 지원하며, 키보드 탐색, 스크린 리더 호환성,
고대비 모드 등을 고려해야 합니다.

<h3>2.1 컴포넌트 API 설계</h3>
Props는 직관적이고 일관된 네이밍 컨벤션을 따라야 합니다.
boolean props는 is/has 접두사를 사용하고, 이벤트 핸들러는 on 접두사를 사용합니다.
variant, size 같은 공통 props는 시스템 전체에서 동일한 값을 사용해야 합니다.

<h2>3장: 토큰 시스템</h2>
디자인 토큰은 시각적 디자인 결정을 플랫폼에 독립적인 형태로 저장하는 방법입니다.
색상, 타이포그래피, 간격, 그림자, 애니메이션 등의 값을 토큰으로 관리하면
일관성을 유지하면서도 테마 변경이 용이해집니다.

<h3>3.1 시맨틱 토큰</h3>
원시 토큰(blue-500)을 직접 사용하는 대신, 시맨틱 토큰(primary, danger)을 활용하면
의미를 기반으로 한 디자인이 가능해집니다. 이는 다크 모드 대응에도 핵심적인 역할을 합니다.

<h2>4장: 문서화와 스토리북</h2>
모든 컴포넌트는 사용 예제, Props 테이블, 접근성 가이드를 포함한 문서가 필요합니다.
Storybook이나 자체 문서 사이트를 통해 컴포넌트를 인터랙티브하게 탐색할 수 있어야 합니다.
`.trim();

export default function ReadingTimePage() {
  return (
    <ComponentPage
      name="ReadingTime"
      description="콘텐츠의 예상 읽기 시간을 CJK/라틴 문자를 구분하여 계산합니다. 난이도 표시도 지원합니다."
      importPath='import { ReadingTime } from "@/ds/composites/ReadingTime"'
      props={[
        { name: "content", type: "string", description: "텍스트 내용 (HTML 또는 plain text)" },
        { name: "format", type: '"short"|"long"', default: '"short"', description: "표시 형식" },
        {
          name: "showDifficulty",
          type: "boolean",
          default: "false",
          description: "난이도 표시 여부",
        },
        { name: "className", type: "string", description: "추가 CSS 클래스" },
      ]}
    >
      <Section title="짧은 형식">
        <Preview>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-sm">
                1
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">짧은 글</p>
                <ReadingTime content={shortText} format="short" />
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="w-8 h-8 rounded bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 text-sm">
                2
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">중간 길이 글</p>
                <ReadingTime content={mediumText} format="short" />
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="w-8 h-8 rounded bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 text-sm">
                3
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">긴 글</p>
                <ReadingTime content={longText} format="short" />
              </div>
            </div>
          </div>
        </Preview>
      </Section>

      <Section title="긴 형식 + 난이도">
        <Preview>
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-lg border border-border">
              <p className="text-sm font-semibold mb-1">디자인 시스템 입문</p>
              <ReadingTime content={shortText} format="long" showDifficulty />
            </div>
            <div className="p-4 rounded-lg border border-border">
              <p className="text-sm font-semibold mb-1">컴포넌트 설계 가이드</p>
              <ReadingTime content={mediumText} format="long" showDifficulty />
            </div>
            <div className="p-4 rounded-lg border border-border">
              <p className="text-sm font-semibold mb-1">디자인 시스템 완벽 가이드</p>
              <ReadingTime content={longText} format="long" showDifficulty />
            </div>
          </div>
        </Preview>
      </Section>

      <Section title="다양한 길이">
        <Preview>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800">
              <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-2">
                Short
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 line-clamp-2">
                {shortText}
              </p>
              <ReadingTime content={shortText} format="long" showDifficulty />
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200 dark:border-amber-800">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2">
                Medium
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 line-clamp-2">
                {mediumText}
              </p>
              <ReadingTime content={mediumText} format="long" showDifficulty />
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border border-red-200 dark:border-red-800">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide mb-2">
                Long
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 line-clamp-2">
                {longText.replace(/<[^>]*>/g, "")}
              </p>
              <ReadingTime content={longText} format="long" showDifficulty />
            </div>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
