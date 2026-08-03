"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/ds/utils/cn";
import {
  sections,
  categoryColors,
  buildSearchIndex,
  searchComponents,
} from "../_data/search-dictionary";

interface DsNavProps {
  filter?: string;
}

export function DsNav({ filter }: DsNavProps) {
  const pathname = usePathname();

  const searchIndex = useMemo(() => buildSearchIndex(), []);

  const matchedHrefs = useMemo(() => {
    if (!filter?.trim()) return null;
    const results = searchComponents(searchIndex, filter);
    return new Set(results.map((r) => r.href));
  }, [searchIndex, filter]);

  return (
    <nav className="py-3 px-2">
      {sections.map((section) => {
        const filteredItems = matchedHrefs
          ? section.items.filter((item) => matchedHrefs.has(item.href))
          : section.items;

        if (filteredItems.length === 0) return null;

        return (
          <div key={section.title} className="mb-3">
            <div className="flex items-center gap-1.5 px-2 mb-1">
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  categoryColors[section.title] || "bg-sidebar-text",
                )}
              />
              <h4 className="text-[10px] font-semibold text-white/55 uppercase tracking-wider">
                {section.title}
              </h4>
              {/* white/20 은 어두운 레일 위에서 1.6:1 이라 개수를 읽을 수 없었다 */}
              <span className="text-[10px] text-white/40 ml-auto tabular-nums">
                {filteredItems.length}
              </span>
            </div>

            <div className="flex flex-col gap-px">
              {filteredItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      // transition-all 은 padding·radius 까지 대상으로 삼아 매 프레임
                      // 리플로우를 만든다 — 색만 바뀌므로 색만 지목한다
                      "relative px-2.5 py-[5px] text-[13px] rounded-lg",
                      "transition-colors duration-150",
                      // 키보드만 쓰는 사람에게 현재 위치를 알려 줄 유일한 신호
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-active/70",
                      "focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-bg",
                      isActive
                        ? // 활성은 배경만으로는 훑을 때 눈에 걸리지 않는다 — 왼쪽 강조
                          // 막대를 세워 목록을 세로로 훑는 동선에 신호를 놓는다
                          "bg-white/10 text-white font-medium shadow-sm shadow-black/10 " +
                          "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 " +
                          "before:h-[14px] before:w-[2px] before:rounded-full before:bg-sidebar-active"
                        : "text-white/55 hover:text-white hover:bg-white/5",
                    )}
                  >
                    {filter?.trim() ? (
                      <HighlightMatch text={item.label} query={filter} />
                    ) : (
                      item.label
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}

      {matchedHrefs && matchedHrefs.size === 0 && (
        <div className="px-3 py-6 text-center text-[12px] text-white/25">검색 결과가 없습니다</div>
      )}
    </nav>
  );
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  const q = query.toLowerCase().trim();
  if (!q) return <>{text}</>;

  const lower = text.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, idx)}
      <span className="text-white font-semibold underline underline-offset-2 decoration-white/40">
        {text.slice(idx, idx + q.length)}
      </span>
      {text.slice(idx + q.length)}
    </>
  );
}
