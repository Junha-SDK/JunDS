"use client";
import { useState, useMemo } from "react";
import { cn } from "@/ds/utils/cn";
import { CopyButton } from "@/ds/primitives/CopyButton";
import { Checkbox } from "@/ds/primitives/Checkbox";

const componentGroups = [
  {
    group: "Primitives",
    items: [
      { id: "Button", snippet: '<Button variant="primary" size="md">텍스트</Button>' },
      { id: "Input", snippet: '<Input placeholder="입력" />' },
      { id: "Badge", snippet: '<Badge variant="success">라벨</Badge>' },
      { id: "Avatar", snippet: '<Avatar name="이름" size="md" />' },
      { id: "Tag", snippet: '<Tag color="blue" closable>태그</Tag>' },
      { id: "Toggle", snippet: '<Toggle checked={on} onChange={setOn} label="설정" />' },
      { id: "Spinner", snippet: '<Spinner size="md" />' },
      { id: "Slider", snippet: "<Slider value={50} onChange={setValue} showValue />" },
    ],
  },
  {
    group: "Composites",
    items: [
      { id: "Select", snippet: "<Select options={options} value={v} onChange={setV} />" },
      {
        id: "Modal",
        snippet: "<Modal open={isOpen} onClose={close}><Modal.Header>제목</Modal.Header></Modal>",
      },
      { id: "Toast", snippet: 'const { success } = useDsToast(); success("완료!");' },
      { id: "Tabs", snippet: "<Tabs tabs={tabs} value={tab} onChange={setTab} />" },
      {
        id: "Card",
        snippet: "<Card><Card.Header>제목</Card.Header><Card.Body>내용</Card.Body></Card>",
      },
      { id: "Drawer", snippet: '<Drawer open={isOpen} onClose={close} title="제목">내용</Drawer>' },
      { id: "Timeline", snippet: '<Timeline items={[{key:"1",title:"이벤트",time:"10:00"}]} />' },
      {
        id: "StatCard",
        snippet: '<StatCard label="총 수" value={142} change="+12%" trend="up" />',
      },
    ],
  },
  {
    group: "Patterns",
    items: [
      {
        id: "DataTable",
        snippet: "<DataTable columns={cols} data={data} rowKey={r=>r.id} selectable />",
      },
      {
        id: "FormBuilder",
        snippet:
          '<FormBuilder fields={[{name:"title",label:"제목",type:"text",required:true}]} onSubmit={handleSubmit} />',
      },
      { id: "ChartCard", snippet: '<ChartCard title="차트" type="bar" data={chartData} />' },
      {
        id: "Kanban",
        snippet: "<Kanban columns={columns} renderCard={renderCard} onMove={handleMove} />",
      },
      { id: "CommandPalette", snippet: "<CommandPalette items={commands} />" },
    ],
  },
];

export default function AiPromptPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [projectDesc, setProjectDesc] = useState("프로젝트 관리 대시보드");

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const prompt = useMemo(() => {
    const imports = Array.from(selected).map((id) => {
      const group = componentGroups.find((g) => g.items.some((i) => i.id === id));
      const item = group?.items.find((i) => i.id === id);
      return { id, snippet: item?.snippet || "", group: group?.group || "" };
    });

    if (imports.length === 0) return "위에서 사용할 컴포넌트를 선택하세요.";

    const importLines = imports.map((i) => `import { ${i.id} } from "@/ds";`).join("\n");
    const snippetLines = imports.map((i) => `// ${i.id}\n${i.snippet}`).join("\n\n");

    return `다음 junDS 디자인 시스템 컴포넌트를 사용하여 "${projectDesc}" UI를 구현해주세요.

## 사용할 컴포넌트

${importLines}

## 각 컴포넌트 사용법

${snippetLines}

## 주의사항
- 모든 컴포넌트는 "@/ds"에서 import합니다
- Tailwind CSS 유틸리티 클래스로 레이아웃을 구성합니다
- CSS 변수 기반 테마를 사용합니다 (--primary, --success 등)
- cn() 유틸로 조건부 클래스를 병합합니다
- 상세 문서는 COMPONENTS.md를 참조하세요`;
  }, [selected, projectDesc]);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">AI Prompt Generator</h1>
      <p className="text-sm text-muted mb-6">
        사용할 컴포넌트를 선택하면 AI에게 보낼 프롬프트를 자동 생성합니다
      </p>

      {/* Project description */}
      <div className="mb-4">
        <label className="text-sm font-medium text-foreground block mb-1.5">
          프로젝트 설명
          <input
            value={projectDesc}
            onChange={(e) => setProjectDesc(e.target.value)}
            className="mt-1.5 w-full max-w-md h-9 px-3 text-sm border border-border rounded-lg bg-white focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow)]"
          />
        </label>
      </div>

      {/* Component selector */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {componentGroups.map((group) => (
          <div key={group.group} className="border border-border rounded-xl p-3 bg-white">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              {group.group}
            </h3>
            <div className="flex flex-col gap-1">
              {group.items.map((item) => (
                <Checkbox
                  key={item.id}
                  label={item.id}
                  size="sm"
                  checked={selected.has(item.id)}
                  onChange={() => toggle(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Generated prompt */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold">생성된 프롬프트</h2>
          <CopyButton text={prompt} variant="button" label="프롬프트 복사" />
        </div>
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-5 text-xs font-mono overflow-x-auto leading-relaxed max-h-[400px] overflow-y-auto whitespace-pre-wrap">
          {prompt}
        </pre>
      </div>
    </div>
  );
}
