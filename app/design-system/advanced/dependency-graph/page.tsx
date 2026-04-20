"use client";
import { cn } from "@/ds/utils/cn";

const layers = [
  {
    name: "Tokens",
    color: "#6b7280",
    items: ["colors", "typography", "spacing", "shadows", "radius", "animation", "zindex", "themes"],
  },
  {
    name: "Hooks",
    color: "#8b5cf6",
    items: ["useClickOutside", "useKeyboard", "useMediaQuery", "useLocalStorage", "useDebounce", "useCopyToClipboard", "useToggle", "useDisclosure"],
  },
  {
    name: "Primitives",
    color: "#2563eb",
    items: ["Button", "Input", "Textarea", "Badge", "Avatar", "Spinner", "Divider", "Toggle", "Checkbox", "Radio", "Label", "Tag", "IconButton", "Kbd", "Portal", "Slider", "NumberInput", "CopyButton", "StatusDot", "FileUpload"],
  },
  {
    name: "Composites",
    color: "#059669",
    items: ["Select", "MultiSelect", "FormField", "Modal", "Toast", "Dropdown", "Tabs", "Accordion", "Breadcrumb", "Progress", "Tooltip", "Popover", "Card", "Alert", "EmptyState", "Skeleton", "Pagination", "DateInput", "Drawer", "ConfirmDialog", "Combobox", "StatCard", "Timeline", "ButtonGroup", "AvatarStack"],
  },
  {
    name: "Patterns",
    color: "#d97706",
    items: ["DataTable", "FilterBar", "CommandPalette", "Sidebar", "Calendar", "Kanban", "StatsGrid", "ActionBar", "FormBuilder", "InfiniteList", "VirtualList", "ChartCard", "NotificationCenter", "SortableList", "RichTextEditor"],
  },
];

export default function DependencyGraphPage() {
  const totalComponents = layers.reduce((sum, l) => sum + l.items.length, 0);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Component Dependency Graph</h1>
      <p className="text-sm text-muted mb-2">junDS 아키텍처 — 하위 계층에서 상위 계층으로 의존</p>
      <p className="text-xs text-muted-light mb-6">총 {totalComponents}개 모듈</p>

      {/* Visual graph */}
      <div className="flex flex-col gap-3 mb-8">
        {[...layers].reverse().map((layer, i) => (
          <div key={layer.name}>
            {/* Arrow */}
            {i > 0 && (
              <div className="flex justify-center py-1">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-muted-light">
                  <path d="M8 2v10M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
            <div className="border rounded-xl overflow-hidden" style={{ borderColor: `${layer.color}30` }}>
              <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: `${layer.color}10` }}>
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: layer.color }} />
                <span className="text-sm font-semibold" style={{ color: layer.color }}>{layer.name}</span>
                <span className="text-[10px] text-muted ml-auto">{layer.items.length}</span>
              </div>
              <div className="px-4 py-3 flex flex-wrap gap-1.5">
                {layer.items.map((item) => (
                  <span
                    key={item}
                    className="px-2 py-0.5 text-[11px] font-medium rounded-md"
                    style={{
                      backgroundColor: `${layer.color}10`,
                      color: layer.color,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dependency rules */}
      <div className="bg-white border border-border rounded-xl p-5">
        <h2 className="text-base font-semibold mb-3">의존성 규칙</h2>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <span><strong>Primitives</strong> — 다른 컴포넌트에 의존하지 않음. Tokens, Hooks, cn()만 사용</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />
            <span><strong>Composites</strong> — Primitives를 조합. 다른 Composites에 의존하지 않음</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 shrink-0" />
            <span><strong>Patterns</strong> — Primitives + Composites를 자유롭게 조합</span>
          </div>
        </div>
      </div>
    </div>
  );
}
