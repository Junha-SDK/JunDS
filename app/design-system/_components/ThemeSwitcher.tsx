"use client";
import { useState, useEffect } from "react";
import { themePresets, applyTheme, getCurrentThemeName } from "@/ds/tokens/themes";
import { cn } from "@/ds/utils/cn";

export function ThemeSwitcher() {
  const [current, setCurrent] = useState("purple");
  const [showCustom, setShowCustom] = useState(false);
  const [customColor, setCustomColor] = useState("#5b4cc7");

  useEffect(() => {
    setCurrent(getCurrentThemeName());
  }, []);

  const handleSelect = (name: string) => {
    applyTheme(name);
    setCurrent(name);
  };

  const handleCustom = (hex: string) => {
    setCustomColor(hex);
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      applyTheme({ name: "custom", primary: hex });
      setCurrent("custom");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* 프리셋 그리드 — 6열 3행 */}
      <div className="flex flex-wrap gap-1.5 justify-start">
        {themePresets.map((t) => (
          <button
            key={t.name}
            type="button"
            title={t.label}
            // 색만 있는 버튼은 접근 가능한 이름이 없다 — title 로는 AT 가 못 읽는다
            aria-label={`${t.label} 테마`}
            aria-pressed={current === t.name}
            onClick={() => handleSelect(t.name)}
            className={cn(
              "w-6 h-6 min-w-[24px] min-h-[24px] shrink-0 rounded-full cursor-pointer",
              // 스와치가 바꾸는 것은 변형·밝기·링뿐이다 — all 은 width 까지 잡는다
              "transition-[transform,filter,box-shadow] duration-150",
              "hover:scale-110 hover:brightness-110",
              // 선택 링과 포커스 링이 겹치지 않게 포커스는 sidebar-active 색을 쓴다
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-active",
              "focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-bg",
              current === t.name
                ? // 리터럴 #1a1726 은 sidebar-bg 토큰과 같은 값이다 — 토큰으로 옮긴다
                  "ring-[2.5px] ring-white/70 ring-offset-1 ring-offset-sidebar-bg scale-110"
                : "ring-1 ring-white/20",
            )}
            style={{ backgroundColor: t.primary }}
          />
        ))}
      </div>

      {/* 커스텀 컬러 토글 */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          aria-expanded={showCustom}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 h-7 rounded-lg text-[11px] font-medium transition-colors cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-active/70",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-bg",
            showCustom
              ? "bg-white/15 text-white/90"
              : // white/40 은 어두운 레일 위에서 AA 미달이라 라벨이 잿빛이었다
                "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/90",
          )}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="4" cy="4" r="2.5" fill="#ef4444" opacity="0.8" />
            <circle cx="8" cy="4" r="2.5" fill="#22c55e" opacity="0.8" />
            <circle cx="6" cy="7.5" r="2.5" fill="#3b82f6" opacity="0.8" />
          </svg>
          커스텀 색상
        </button>
      </div>

      {/* 커스텀 컬러 피커 */}
      {showCustom && (
        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1.5">
          <input
            type="color"
            value={customColor}
            onChange={(e) => handleCustom(e.target.value)}
            aria-label="커스텀 테마 색상 선택"
            className={cn(
              "w-7 h-7 rounded-md cursor-pointer border-0 p-0 bg-transparent",
              "[&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md",
              "[&::-webkit-color-swatch]:border-white/20 [&::-webkit-color-swatch]:border",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-active/70",
              "focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-bg",
            )}
          />
          <input
            type="text"
            value={customColor}
            onChange={(e) => handleCustom(e.target.value)}
            placeholder="#000000"
            aria-label="커스텀 테마 색상 HEX"
            className={cn(
              "flex-1 min-w-0 h-7 px-2 text-[11px] font-mono bg-white/10 text-white/90 rounded-md border-0",
              "placeholder:text-white/45 uppercase",
              "transition-colors duration-150 focus:bg-white/15",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-active/70",
              "focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-bg",
            )}
          />
          {/* white/40 은 레일 위 AA 미달 — 상태 표시가 보이지 않았다 */}
          {current === "custom" && (
            <span className="text-[10px] text-white/60 whitespace-nowrap">적용됨</span>
          )}
        </div>
      )}
    </div>
  );
}
