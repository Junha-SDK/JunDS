"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { cn } from "@/ds/utils/cn";
import { useKeyboard } from "@/ds/hooks/useKeyboard";
import {
  buildSearchIndex,
  searchComponents,
  categoryColors,
  type SearchEntry,
} from "../_data/search-dictionary";

interface DsCommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function DsCommandPalette({ open, onClose }: DsCommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const searchIndex = useMemo(() => buildSearchIndex(), []);

  const results = useMemo(
    () => searchComponents(searchIndex, query),
    [searchIndex, query],
  );

  // Group results by category
  const grouped = useMemo(() => {
    const map = new Map<string, SearchEntry[]>();
    for (const entry of results) {
      const group = map.get(entry.category) || [];
      group.push(entry);
      map.set(entry.category, group);
    }
    return map;
  }, [results]);

  // Flat list for keyboard navigation
  const flatResults = useMemo(() => results, [results]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector("[data-active='true']");
    if (active) {
      active.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const selectItem = useCallback(
    (entry: SearchEntry) => {
      router.push(entry.href);
      onClose();
    },
    [router, onClose],
  );

  // Close on escape
  useKeyboard({ key: "Escape" }, onClose, open);

  if (!mounted || !open) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % flatResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatResults[activeIndex]) {
        selectItem(flatResults[activeIndex]);
      }
    }
  };

  let itemIndex = -1;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={cn(
          "relative w-full max-w-lg rounded-xl overflow-hidden",
          "bg-[#1e1b2e] border border-white/10 shadow-2xl shadow-black/40",
          "animate-in fade-in zoom-in-95 duration-150",
        )}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <svg
            className="w-4 h-4 text-white/30 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="컴포넌트 검색... (한글/영어)"
            className={cn(
              "flex-1 bg-transparent text-sm text-white/90",
              "placeholder:text-white/30 outline-none",
            )}
          />
          <kbd className="text-[10px] text-white/20 bg-white/5 rounded px-1.5 py-0.5 font-medium">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className="max-h-[50vh] overflow-y-auto py-2 px-2"
        >
          {flatResults.length === 0 ? (
            <div className="py-8 text-center text-sm text-white/30">
              검색 결과가 없습니다
            </div>
          ) : (
            Array.from(grouped.entries()).map(([category, items]) => (
              <div key={category} className="mb-1">
                <div className="flex items-center gap-1.5 px-2 py-1.5">
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      categoryColors[category] || "bg-gray-500",
                    )}
                  />
                  <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                    {category}
                  </span>
                </div>
                {items.map((entry) => {
                  itemIndex++;
                  const isActive = itemIndex === activeIndex;
                  const currentIndex = itemIndex;
                  return (
                    <button
                      key={entry.href}
                      type="button"
                      data-active={isActive}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left",
                        "transition-colors duration-75",
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-white/60 hover:bg-white/5 hover:text-white/80",
                      )}
                      onClick={() => selectItem(entry)}
                      onMouseEnter={() => setActiveIndex(currentIndex)}
                    >
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          categoryColors[entry.category] || "bg-gray-500",
                        )}
                      />
                      <span className="text-[13px] font-medium">
                        {entry.label}
                      </span>
                      {entry.keywords.length > 0 && (
                        <span className="text-[11px] text-white/20 ml-auto truncate max-w-[140px]">
                          {entry.keywords.slice(0, 2).join(", ")}
                        </span>
                      )}
                      {isActive && (
                        <svg
                          className="w-3 h-3 text-white/30 shrink-0 ml-auto"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-white/10 text-[11px] text-white/20">
          <span className="flex items-center gap-1">
            <kbd className="bg-white/5 rounded px-1 py-0.5 font-medium">
              &#8593;&#8595;
            </kbd>
            이동
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-white/5 rounded px-1 py-0.5 font-medium">
              &#8629;
            </kbd>
            선택
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-white/5 rounded px-1 py-0.5 font-medium">
              esc
            </kbd>
            닫기
          </span>
          <span className="ml-auto">{flatResults.length}개 컴포넌트</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
