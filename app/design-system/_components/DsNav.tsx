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
                  categoryColors[section.title] || "bg-gray-500",
                )}
              />
              <h4 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                {section.title}
              </h4>
              <span className="text-[10px] text-white/20 ml-auto">
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
                    className={cn(
                      "px-2.5 py-[5px] text-[13px] rounded-lg transition-all duration-150",
                      isActive
                        ? "bg-white/10 text-white font-medium shadow-sm shadow-black/10"
                        : "text-white/50 hover:text-white/80 hover:bg-white/5",
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
        <div className="px-3 py-6 text-center text-[12px] text-white/25">
          검색 결과가 없습니다
        </div>
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
