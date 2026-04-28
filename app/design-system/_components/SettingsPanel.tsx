"use client";
import { useState } from "react";
import { cn } from "@/ds/utils/cn";

export type DensityMode = "compact" | "normal" | "comfortable";
export type RadiusPreset = "none" | "sm" | "md" | "lg" | "full";
export type SpacingPreset = "tight" | "default" | "relaxed";
export type FontScalePreset = "xs" | "sm" | "default" | "lg" | "xl";

const THEMES = [
  { name: "purple", color: "#5b4cc7" },
  { name: "indigo", color: "#4f46e5" },
  { name: "blue", color: "#2563eb" },
  { name: "sky", color: "#0284c7" },
  { name: "teal", color: "#0d9488" },
  { name: "emerald", color: "#059669" },
  { name: "green", color: "#16a34a" },
  { name: "amber", color: "#d97706" },
  { name: "orange", color: "#ea580c" },
  { name: "red", color: "#dc2626" },
  { name: "rose", color: "#e11d48" },
  { name: "pink", color: "#db2777" },
];

interface SettingsPanelProps {
  theme: string;
  density: DensityMode;
  radius: RadiusPreset;
  spacing: SpacingPreset;
  fontSize: FontScalePreset;
  colorMode: "light" | "dark" | "system";
  onThemeChange: (theme: string) => void;
  onDensityChange: (density: DensityMode) => void;
  onRadiusChange: (radius: RadiusPreset) => void;
  onSpacingChange: (spacing: SpacingPreset) => void;
  onFontSizeChange: (fontSize: FontScalePreset) => void;
  onColorModeChange: (mode: "light" | "dark" | "system") => void;
}

export function SettingsPanel({
  theme, density, radius, spacing, fontSize, colorMode,
  onThemeChange, onDensityChange, onRadiusChange, onSpacingChange, onFontSizeChange, onColorModeChange,
}: SettingsPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all cursor-pointer",
          "hover:scale-110 active:scale-95",
          open ? "bg-foreground text-white rotate-45" : "bg-primary text-white",
        )}
        aria-label="프레임워크 설정"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 13a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 1v2M10 17v2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M1 10h2M17 10h2M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 bg-white border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in-scale">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border bg-gray-50/80">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">프레임워크 설정</h3>
                <p className="text-[10px] text-muted">모든 컴포넌트에 실시간 적용됩니다</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 text-muted hover:text-foreground cursor-pointer" aria-label="닫기">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
            </div>
          </div>

          <div className="p-4 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* Theme */}
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-2">테마 색상</label>
              <div className="flex flex-wrap gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => onThemeChange(t.name)}
                    className={cn(
                      "w-7 h-7 rounded-full cursor-pointer transition-all border-2",
                      theme === t.name ? "border-foreground scale-110 shadow-md" : "border-transparent hover:scale-105",
                    )}
                    style={{ backgroundColor: t.color }}
                    title={t.name}
                  />
                ))}
              </div>
            </div>

            {/* Color Mode */}
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-2">색상 모드</label>
              <div className="flex gap-1">
                {(["light", "dark", "system"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => onColorModeChange(mode)}
                    className={cn(
                      "flex-1 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors",
                      colorMode === mode ? "bg-primary text-white" : "bg-gray-100 text-muted hover:bg-gray-200",
                    )}
                  >
                    {{ light: "라이트", dark: "다크", system: "시스템" }[mode]}
                  </button>
                ))}
              </div>
            </div>

            {/* Density */}
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-2">밀도</label>
              <div className="flex gap-1">
                {(["compact", "normal", "comfortable"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onDensityChange(d)}
                    className={cn(
                      "flex-1 px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors",
                      density === d ? "bg-primary text-white" : "bg-gray-100 text-muted hover:bg-gray-200",
                    )}
                  >
                    {{ compact: "좁게", normal: "보통", comfortable: "넓게" }[d]}
                  </button>
                ))}
              </div>
            </div>

            {/* Radius */}
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-2">모서리 반경</label>
              <div className="flex gap-1">
                {(["none", "sm", "md", "lg", "full"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => onRadiusChange(r)}
                    className={cn(
                      "flex-1 px-2 py-1.5 text-xs font-medium cursor-pointer transition-colors",
                      radius === r ? "bg-primary text-white" : "bg-gray-100 text-muted hover:bg-gray-200",
                    )}
                    style={{ borderRadius: { none: 0, sm: 4, md: 6, lg: 8, full: 12 }[r] }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Spacing */}
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-2">간격</label>
              <div className="flex gap-1">
                {(["tight", "default", "relaxed"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onSpacingChange(s)}
                    className={cn(
                      "flex-1 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors",
                      spacing === s ? "bg-primary text-white" : "bg-gray-100 text-muted hover:bg-gray-200",
                    )}
                  >
                    {{ tight: "좁게", default: "기본", relaxed: "넓게" }[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-2">글자 크기</label>
              <div className="flex gap-1">
                {(["xs", "sm", "default", "lg", "xl"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => onFontSizeChange(f)}
                    className={cn(
                      "flex-1 px-2 py-1.5 rounded-lg font-medium cursor-pointer transition-colors",
                      fontSize === f ? "bg-primary text-white" : "bg-gray-100 text-muted hover:bg-gray-200",
                    )}
                    style={{ fontSize: { xs: 10, sm: 11, default: 12, lg: 13, xl: 14 }[f] }}
                  >
                    {f === "default" ? "기본" : f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Current config display */}
            <div className="pt-2 border-t border-border">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">현재 설정</p>
              <pre className="text-[10px] font-mono text-muted bg-gray-50 rounded-lg p-2.5 leading-relaxed">
{`<JunDSProvider
  theme="${theme}"
  colorMode="${colorMode}"
  density="${density}"
  radius="${radius}"
  spacing="${spacing}"
  fontSize="${fontSize}"
/>`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
