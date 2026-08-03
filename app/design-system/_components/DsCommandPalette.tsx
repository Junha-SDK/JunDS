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

  const results = useMemo(() => searchComponents(searchIndex, query), [searchIndex, query]);

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div
        className={cn(
          // 패널·모달은 radius 계단의 2xl 자리다
          "relative w-full max-w-lg rounded-2xl overflow-hidden",
          "bg-[#1e1b2e] border border-white/10",
          // shadow-2xl 한 겹은 배경에서 떠오르지 않는다 — 넓게 퍼지는 그림자 +
          // 가까이 붙는 그림자 + 얇은 링을 겹쳐 면의 높이를 세운다
          "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.65),0_8px_20px_-8px_rgba(0,0,0,0.45)]",
          "ring-1 ring-white/10",
          // animate-in / zoom-in-95 는 이 저장소에 없는 플러그인 클래스였다 —
          // globals.css 가 실제로 정의한 이름으로 바꾼다
          "animate-fade-in-scale",
        )}
        onKeyDown={handleKeyDown}
      >
        {/* Search input — 입력에 테두리가 없어 링을 걸 면이 없다. 대신 실제로
            동작하는 focus-within 으로 줄 전체를 안쪽 링으로 강조한다. 줄이 다이얼로그
            폭에 꽉 차므로 offset 링은 잘려 나가고 ring-inset 만 온전히 보인다 */}
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-3 border-b border-white/10",
            "focus-within:ring-2 focus-within:ring-inset focus-within:ring-sidebar-active/45",
            "transition-shadow duration-150",
          )}
        >
          <svg
            className="w-4 h-4 text-white/55 shrink-0"
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
              "flex-1 min-w-0 bg-transparent text-sm text-white/90",
              // placeholder /30 은 2.2:1 이라 힌트가 보이지 않았다
              "placeholder:text-white/45 outline-none",
            )}
          />
          {/* white/20 은 1.6:1 — 키캡을 읽을 수 없어 안내 역할을 못 했다 */}
          <kbd className="text-[10px] text-white/60 bg-white/10 rounded px-1.5 py-0.5 font-medium">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2 px-2">
          {flatResults.length === 0 ? (
            <div className="py-8 text-center text-sm text-white/55">검색 결과가 없습니다</div>
          ) : (
            Array.from(grouped.entries()).map(([category, items]) => (
              <div key={category} className="mb-1">
                <div className="flex items-center gap-1.5 px-2 py-1.5">
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      categoryColors[category] || "bg-white/40",
                    )}
                  />
                  <span className="text-[10px] font-semibold text-white/55 uppercase tracking-wider">
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
                        // 마우스로는 hover 가 위치를 알려 주지만 키보드에는 아무것도
                        // 없었다 — 팔레트 면과 같은 offset 으로 링을 세운다
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-active/70",
                        "focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e1b2e]",
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-white/70 hover:bg-white/5 hover:text-white",
                      )}
                      onClick={() => selectItem(entry)}
                      onMouseEnter={() => setActiveIndex(currentIndex)}
                    >
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          categoryColors[entry.category] || "bg-white/40",
                        )}
                      />
                      <span className="text-[13px] font-medium min-w-0 truncate">
                        {entry.label}
                      </span>
                      {entry.keywords.length > 0 && (
                        // white/20 은 1.6:1 — 키워드가 있으나 마나였다
                        <span className="text-[11px] text-white/50 ml-auto truncate max-w-[140px]">
                          {entry.keywords.slice(0, 2).join(", ")}
                        </span>
                      )}
                      {isActive && (
                        <svg
                          className="w-3 h-3 text-white/70 shrink-0 ml-auto"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
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
        {/* 단축키 안내가 white/20 이라 아무도 못 읽는 줄이었다 — 보조 텍스트 하한인
            /55 로 올리고 키캡 배경도 한 단계 세운다 */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-white/10 text-[11px] text-white/55">
          <span className="flex items-center gap-1">
            <kbd className="bg-white/10 rounded px-1 py-0.5 font-medium">&#8593;&#8595;</kbd>
            이동
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-white/10 rounded px-1 py-0.5 font-medium">&#8629;</kbd>
            선택
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-white/10 rounded px-1 py-0.5 font-medium">esc</kbd>
            닫기
          </span>
          <span className="ml-auto tabular-nums whitespace-nowrap">
            {flatResults.length}개 컴포넌트
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
