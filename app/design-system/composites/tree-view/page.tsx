"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { TreeView } from "@/ds/composites/TreeView";

export default function TreeViewPage() {
  const [selected, setSelected] = useState<string>("app-page");

  return (
    <ComponentPage
      name="TreeView"
      description="트리뷰. 파일 탐색기 스타일의 계층 구조를 표시합니다. 노드 선택과 펼침/접힘을 지원합니다."
      importPath='import { TreeView } from "@/ds/composites/TreeView"'
      props={[
        { name: "nodes", type: "TreeNode[]", required: true, description: "트리 노드 목록" },
        { name: "selected", type: "string", description: "선택된 노드 key" },
        { name: "onSelect", type: "(key: string) => void", description: "노드 선택 핸들러" },
        { name: "defaultExpanded", type: "string[]", description: "기본 펼쳐진 노드 key 목록" },
      ]}
    >
      <Section title="파일 트리">
        <Preview>
          <div className="max-w-sm border border-border rounded-lg p-2 bg-white">
            <TreeView
              selected={selected}
              onSelect={setSelected}
              defaultExpanded={["src", "app", "components"]}
              nodes={[
                {
                  key: "src",
                  label: "src",
                  icon: <span className="text-yellow-500">📁</span>,
                  children: [
                    {
                      key: "app",
                      label: "app",
                      icon: <span className="text-yellow-500">📁</span>,
                      children: [
                        { key: "app-layout", label: "layout.tsx", icon: <span className="text-blue-500">📄</span> },
                        { key: "app-page", label: "page.tsx", icon: <span className="text-blue-500">📄</span> },
                        { key: "app-globals", label: "globals.css", icon: <span className="text-pink-500">📄</span> },
                      ],
                    },
                    {
                      key: "components",
                      label: "components",
                      icon: <span className="text-yellow-500">📁</span>,
                      children: [
                        { key: "button", label: "Button.tsx", icon: <span className="text-blue-500">📄</span> },
                        { key: "card", label: "Card.tsx", icon: <span className="text-blue-500">📄</span> },
                        { key: "modal", label: "Modal.tsx", icon: <span className="text-blue-500">📄</span> },
                      ],
                    },
                    {
                      key: "utils",
                      label: "utils",
                      icon: <span className="text-yellow-500">📁</span>,
                      children: [
                        { key: "cn", label: "cn.ts", icon: <span className="text-green-500">📄</span> },
                        { key: "hooks", label: "hooks.ts", icon: <span className="text-green-500">📄</span> },
                      ],
                    },
                  ],
                },
                { key: "package", label: "package.json", icon: <span className="text-red-500">📄</span> },
                { key: "tsconfig", label: "tsconfig.json", icon: <span className="text-gray-500">📄</span> },
                { key: "readme", label: "README.md", icon: <span className="text-gray-400">📄</span> },
              ]}
            />
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted">선택됨: <strong className="text-foreground">{selected}</strong></p>
            </div>
          </div>
        </Preview>
      </Section>

      <Section title="비활성화 노드">
        <Preview>
          <div className="max-w-sm border border-border rounded-lg p-2 bg-white">
            <TreeView
              nodes={[
                {
                  key: "public",
                  label: "public",
                  children: [
                    { key: "favicon", label: "favicon.ico" },
                    { key: "robots", label: "robots.txt" },
                  ],
                },
                {
                  key: "private",
                  label: "private (접근 불가)",
                  disabled: true,
                  children: [
                    { key: "secrets", label: "secrets.json", disabled: true },
                    { key: "env", label: ".env.local", disabled: true },
                  ],
                },
              ]}
              defaultExpanded={["public", "private"]}
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
