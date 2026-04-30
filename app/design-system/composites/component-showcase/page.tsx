"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ComponentShowcase } from "@/ds/composites/ComponentShowcase";
import { Button } from "@/ds/primitives/Button";
import { Badge } from "@/ds/primitives/Badge";
import { Input } from "@/ds/primitives/Input";

export default function ComponentShowcasePage() {
  const items = [
    {
      key: "button",
      label: "Button",
      description: "기본 액션을 트리거하는 버튼.",
      category: "Primitives",
      preview: <Button>Click me</Button>,
      hoverDemo: (
        <div className="flex gap-2">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
        </div>
      ),
    },
    {
      key: "badge",
      label: "Badge",
      description: "상태나 카테고리를 표시하는 작은 라벨.",
      category: "Primitives",
      preview: <Badge variant="primary">New</Badge>,
    },
    {
      key: "input",
      label: "Input",
      description: "텍스트 입력 필드.",
      category: "Primitives",
      preview: <Input placeholder="Type here..." className="w-40" />,
    },
    {
      key: "alert",
      label: "Alert",
      description: "사용자에게 정보를 알리는 인라인 배너.",
      category: "Composites",
      preview: <Badge variant="success" dot>알림</Badge>,
    },
  ];

  return (
    <ComponentPage
      name="ComponentShowcase"
      description="여러 컴포넌트의 미리보기를 검색·필터·호버 데모와 함께 진열하는 카탈로그 그리드. 디자인 시스템 랜딩 페이지에서 사용합니다."
      importPath='import { ComponentShowcase } from "@/ds/composites/ComponentShowcase"'
      props={[
        { name: "items", type: "ShowcaseItem[]", required: true, description: "{ key, label, description, category, preview, hoverDemo? } 배열" },
        { name: "searchable", type: "boolean", default: "true", description: "검색 입력 표시" },
        { name: "filterable", type: "boolean", default: "true", description: "카테고리 필터 칩 표시" },
        { name: "columns", type: "2|3|4", default: "3", description: "그리드 컬럼 수" },
        { name: "onItemClick", type: "(item: ShowcaseItem) => void", description: "카드 클릭 콜백" },
      ]}
    >
      <Section title="Default">
        <Preview>
          <div className="w-full">
            <ComponentShowcase items={items} columns={3} />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
