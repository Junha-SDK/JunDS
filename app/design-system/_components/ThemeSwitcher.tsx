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
            onClick={() => handleSelect(t.name)}
            className={cn(
              "w-6 h-6 min-w-[24px] min-h-[24px] shrink-0 rounded-full transition-all duration-150 cursor-pointer",
              "hover:scale-110 hover:brightness-110",
              current === t.name
                ? "ring-[2.5px] ring-white/70 ring-offset-1 ring-offset-[#1a1726] scale-110"
                : "ring-1 ring-white/10",
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
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 h-7 rounded-lg text-[11px] font-medium transition-colors cursor-pointer",
            showCustom
              ? "bg-white/15 text-white/80"
              : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60",
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
            className="w-7 h-7 rounded-md cursor-pointer border-0 p-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-white/20 [&::-webkit-color-swatch]:border"
          />
          <input
            type="text"
            value={customColor}
            onChange={(e) => handleCustom(e.target.value)}
            placeholder="#000000"
            className="flex-1 h-7 px-2 text-[11px] font-mono bg-white/10 text-white/80 rounded-md border-0 outline-none focus:bg-white/15 uppercase"
          />
          {current === "custom" && (
            <span className="text-[10px] text-white/40">적용됨</span>
          )}
        </div>
      )}
    </div>
  );
}
