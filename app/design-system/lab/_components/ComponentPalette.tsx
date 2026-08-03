"use client";

import { useState, useMemo } from "react";
import { cn } from "@/ds/utils/cn";
import { useLab } from "../_lib/store";
import { componentDefs, componentDefMap } from "../_lib/registry";

const catColors: Record<string, string> = {
  레이아웃: "bg-violet-500",
  기본: "bg-blue-500",
  입력: "bg-emerald-500",
  데이터: "bg-amber-500",
  피드백: "bg-rose-500",
  네비게이션: "bg-cyan-500",
  오버레이: "bg-pink-500",
};

const categoryOrder = [
  "레이아웃",
  "기본",
  "입력",
  "데이터",
  "피드백",
  "네비게이션",
  "오버레이",
] as const;

export function ComponentPalette() {
  const { state, dispatch } = useLab();
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? componentDefs.filter(
          (d) => d.label.toLowerCase().includes(q) || d.category.toLowerCase().includes(q),
        )
      : componentDefs;

    const map = new Map<string, typeof componentDefs>();
    for (const def of filtered) {
      const list = map.get(def.category) ?? [];
      list.push(def);
      map.set(def.category, list);
    }
    return map;
  }, [search]);

  function handleAdd(componentId: string) {
    const def = componentDefMap.get(componentId);
    if (!def) return;

    // If a container node is selected, add inside it; otherwise add to root
    let parentId: string | null = null;
    if (state.selectedId) {
      const selectedNode = state.nodes[state.selectedId];
      if (selectedNode) {
        const selectedDef = componentDefMap.get(selectedNode.componentId);
        if (selectedDef?.isContainer) {
          parentId = state.selectedId;
        }
      }
    }

    // Build default props from the def
    dispatch({
      type: "ADD_NODE",
      componentId,
      parentId,
    });
  }

  function toggleCategory(cat: string) {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }

  return (
    <aside className="w-60 shrink-0 bg-card border-r border-border flex flex-col h-full overflow-hidden">
      {/* Search */}
      <div className="p-3 border-b border-border">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="컴포넌트 검색..."
          className={cn(
            "w-full rounded-md border border-border bg-background px-3 py-1.5",
            "text-sm text-foreground placeholder:text-muted",
            "outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
            "transition-colors",
          )}
        />
      </div>

      {/* Component list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {categoryOrder.map((cat) => {
          const defs = grouped.get(cat);
          if (!defs || defs.length === 0) return null;
          const isCollapsed = collapsed[cat] ?? false;
          const dotColor = catColors[cat] ?? "bg-gray-500";

          return (
            <div key={cat}>
              {/* Category header */}
              <button
                type="button"
                onClick={() => toggleCategory(cat)}
                className={cn(
                  "flex items-center gap-1.5 w-full px-2 py-1.5",
                  "text-[10px] font-semibold uppercase tracking-wider text-muted",
                  "hover:text-foreground transition-colors select-none",
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor)} />
                <span className="flex-1 text-left">{cat}</span>
                <svg
                  className={cn(
                    "w-3 h-3 text-muted transition-transform",
                    isCollapsed && "-rotate-90",
                  )}
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M3 4.5L6 7.5L9 4.5" />
                </svg>
              </button>

              {/* Component grid */}
              {!isCollapsed && (
                <div className="grid grid-cols-2 gap-1 px-1 pb-1">
                  {defs.map((def) => (
                    <button
                      key={def.id}
                      type="button"
                      onClick={() => handleAdd(def.id)}
                      title={def.label}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1.5 rounded-md",
                        "text-xs text-foreground/80",
                        "hover:bg-accent hover:text-foreground",
                        "active:bg-accent/80",
                        "transition-colors cursor-pointer select-none",
                        "border border-transparent hover:border-border",
                      )}
                    >
                      <span className="text-sm shrink-0 leading-none">{def.icon ?? "?"}</span>
                      <span className="truncate text-[11px] font-medium">{def.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* No results */}
        {grouped.size === 0 && (
          <p className="text-xs text-muted text-center py-8">검색 결과가 없습니다</p>
        )}
      </div>
    </aside>
  );
}
