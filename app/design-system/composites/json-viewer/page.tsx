"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { JSONViewer } from "@/ds/composites/JSONViewer";

const sample = {
  name: "JunDS",
  version: "1.0.0",
  active: true,
  tags: ["design-system", "react", "next"],
  config: {
    theme: "light",
    primaryColor: "#3b82f6",
    features: { darkMode: true, animations: false },
  },
  authors: [
    { id: 1, name: "준하" },
    { id: 2, name: "Claude" },
  ],
  metadata: null,
};

export default function JSONViewerPage() {
  return (
    <ComponentPage
      name="JSONViewer"
      description="중첩된 JSON 데이터를 트리 형태로 보여주고 펼침/접힘이 가능한 뷰어입니다."
      importPath='import { JSONViewer } from "@/ds/composites/JSONViewer"'
      props={[
        { name: "data", type: "unknown", description: "표시할 JSON 데이터" },
        {
          name: "initialExpanded",
          type: "boolean",
          default: "true",
          description: "초기 펼침 여부 (depth < 2)",
        },
      ]}
    >
      <Section title="Default">
        <Preview>
          <div className="w-full max-w-xl">
            <JSONViewer data={sample} />
          </div>
        </Preview>
      </Section>

      <Section title="초기 접힘">
        <Preview>
          <div className="w-full max-w-xl">
            <JSONViewer data={sample} initialExpanded={false} />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
