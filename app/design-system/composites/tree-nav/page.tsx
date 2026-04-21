"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { TreeNav } from "@/ds/composites/TreeNav";
import type { TreeNavItem } from "@/ds/composites/TreeNav";

const basicItems: TreeNavItem[] = [
  {
    key: "project",
    label: "my-project",
    icon: <span className="text-sm">📁</span>,
    children: [
      {
        key: "src",
        label: "src",
        icon: <span className="text-sm">📂</span>,
        children: [
          { key: "app", label: "App.tsx", icon: <span className="text-sm">⚛️</span> },
          { key: "index", label: "index.tsx", icon: <span className="text-sm">📄</span> },
          {
            key: "components",
            label: "components",
            icon: <span className="text-sm">📂</span>,
            children: [
              { key: "button", label: "Button.tsx", icon: <span className="text-sm">⚛️</span> },
              { key: "input", label: "Input.tsx", icon: <span className="text-sm">⚛️</span> },
              { key: "modal", label: "Modal.tsx", icon: <span className="text-sm">⚛️</span> },
            ],
          },
        ],
      },
      {
        key: "public",
        label: "public",
        icon: <span className="text-sm">📂</span>,
        children: [
          { key: "favicon", label: "favicon.ico", icon: <span className="text-sm">🌐</span> },
          { key: "robots", label: "robots.txt", icon: <span className="text-sm">📄</span> },
        ],
      },
      { key: "package", label: "package.json", icon: <span className="text-sm">📦</span> },
      { key: "tsconfig", label: "tsconfig.json", icon: <span className="text-sm">⚙️</span> },
    ],
  },
];

const badgeItems: TreeNavItem[] = [
  {
    key: "inbox",
    label: "받은 편지함",
    icon: <span className="text-sm">📥</span>,
    badge: 24,
    children: [
      { key: "unread", label: "읽지 않음", badge: 12 },
      { key: "starred", label: "별표", badge: 5 },
      { key: "important", label: "중요", badge: 7 },
    ],
  },
  {
    key: "sent",
    label: "보낸 편지함",
    icon: <span className="text-sm">📤</span>,
    badge: 156,
  },
  {
    key: "drafts",
    label: "임시 보관함",
    icon: <span className="text-sm">📝</span>,
    badge: 3,
  },
  {
    key: "trash",
    label: "휴지통",
    icon: <span className="text-sm">🗑️</span>,
  },
];

const activeItems: TreeNavItem[] = [
  {
    key: "docs",
    label: "문서",
    icon: <span className="text-sm">📚</span>,
    children: [
      { key: "getting-started", label: "시작하기" },
      { key: "installation", label: "설치 가이드" },
      { key: "configuration", label: "설정" },
    ],
  },
  {
    key: "components",
    label: "컴포넌트",
    icon: <span className="text-sm">🧩</span>,
    children: [
      { key: "primitives", label: "Primitives" },
      { key: "composites", label: "Composites" },
      { key: "patterns", label: "Patterns" },
    ],
  },
  {
    key: "resources",
    label: "리소스",
    icon: <span className="text-sm">🔗</span>,
    children: [
      { key: "figma", label: "Figma 키트" },
      { key: "changelog", label: "변경 로그" },
    ],
  },
];

export default function TreeNavPage() {
  const [activeKey, setActiveKey] = useState("composites");

  return (
    <ComponentPage
      name="TreeNav"
      description="재귀적 트리 구조 네비게이션. 확장/접기, 활성 항목 표시, 배지 카운트를 지원합니다."
      importPath='import { TreeNav } from "@/ds/composites/TreeNav"'
      props={[
        { name: "items", type: "TreeNavItem[]", description: "트리 항목 목록" },
        { name: "activeKey", type: "string", description: "현재 활성 항목 키" },
        { name: "onItemClick", type: "(key: string, href?: string) => void", description: "항목 클릭 핸들러" },
        { name: "defaultExpanded", type: "string[]", description: "기본 확장 키 목록" },
        { name: "className", type: "string", description: "추가 CSS 클래스" },
      ]}
    >
      <Section title="기본">
        <Preview>
          <div className="max-w-xs">
            <TreeNav
              items={basicItems}
              defaultExpanded={["project", "src"]}
            />
          </div>
        </Preview>
      </Section>

      <Section title="배지">
        <Preview>
          <div className="max-w-xs">
            <TreeNav
              items={badgeItems}
              defaultExpanded={["inbox"]}
              activeKey="unread"
            />
          </div>
        </Preview>
      </Section>

      <Section title="활성 아이템">
        <Preview>
          <div className="max-w-xs">
            <p className="text-xs text-muted mb-3">
              현재 선택: <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">{activeKey}</code>
            </p>
            <TreeNav
              items={activeItems}
              activeKey={activeKey}
              defaultExpanded={["docs", "components", "resources"]}
              onItemClick={(key) => setActiveKey(key)}
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
