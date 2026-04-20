"use client";

import { useState, useMemo } from "react";
import { cn } from "@/ds/utils/cn";
import { labComponents } from "../_lib/component-registry";

export function ComponentPalette() {
  const [search, setSearch] = useState("");

  const grouped = useMemo(() => {
    const q = search.toLowerCase().trim();
    const filtered = q
      ? labComponents.filter(
          (c) =>
            c.id.toLowerCase().includes(q) ||
            c.label.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q),
        )
      : labComponents;

    const groups: Record<string, typeof filtered> = {};
    for (const comp of filtered) {
      (groups[comp.category] ??= []).push(comp);
    }
    return groups;
  }, [search]);

  const handleDragStart = (
    e: React.DragEvent<HTMLButtonElement>,
    componentId: string,
  ) => {
    e.dataTransfer.setData("text/plain", componentId);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="컴포넌트 검색..."
            className="w-full h-8 pl-8 pr-3 text-xs border border-gray-200 rounded-md bg-white focus:border-blue-500 focus:outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Component list */}
      <div className="flex-1 overflow-y-auto p-2">
        {Object.keys(grouped).length === 0 && (
          <p className="text-xs text-gray-400 text-center py-6">
            결과 없음
          </p>
        )}
        {Object.entries(grouped).map(([category, comps]) => (
          <div key={category} className="mb-3">
            <p className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              {category}
            </p>
            <div className="flex flex-col gap-0.5">
              {comps.map((comp) => (
                <button
                  key={comp.id}
                  type="button"
                  draggable
                  onDragStart={(e) => handleDragStart(e, comp.id)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md text-left cursor-grab",
                    "text-xs text-gray-700 hover:bg-gray-100 active:cursor-grabbing",
                    "transition-colors",
                  )}
                >
                  <span
                    className={cn(
                      "w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold shrink-0",
                      comp.category === "Primitives"
                        ? "bg-blue-50 text-blue-500"
                        : "bg-purple-50 text-purple-500",
                    )}
                  >
                    {comp.id.charAt(0)}
                  </span>
                  <span className="truncate">{comp.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
