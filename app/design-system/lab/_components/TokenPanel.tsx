"use client";

import { useState, useCallback } from "react";
import { cn } from "@/ds/utils/cn";
import { useLab } from "../_lib/lab-store";
import type { TokenOverrides } from "../_lib/types";

/* ─── Collapsible Section ─────────────────────────────────────────── */

function Section({
  title,
  icon,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <span className="text-muted/60">{icon}</span>
        <span className="flex-1 text-left">{title}</span>
        <svg
          className={cn("w-3 h-3 text-muted/40 transition-transform duration-200", open && "rotate-180")}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={cn(
        "grid transition-all duration-200",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1 space-y-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Color Row ───────────────────────────────────────────────────── */

function ColorRow({
  label,
  tokenKey,
  value,
  onChange,
}: {
  label: string;
  tokenKey: string;
  value: string;
  onChange: (key: keyof TokenOverrides, value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs text-muted w-[52px] shrink-0">{label}</span>
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(tokenKey as keyof TokenOverrides, e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <div
          className="w-8 h-8 rounded-lg border border-border shadow-xs cursor-pointer transition-transform hover:scale-105"
          style={{ backgroundColor: value }}
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(tokenKey as keyof TokenOverrides, e.target.value)}
        className="h-8 flex-1 rounded-lg border border-border bg-card px-2.5 text-xs font-mono text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        maxLength={7}
      />
    </div>
  );
}

/* ─── Segmented Selector ──────────────────────────────────────────── */

function SegmentedSelector<T extends string | number>({
  options,
  value,
  onChange,
  display,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  display?: (v: T) => string;
}) {
  return (
    <div className="flex rounded-xl bg-gray-100 p-1 gap-0.5">
      {options.map((opt) => (
        <button
          key={String(opt)}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "flex-1 px-2 py-1.5 text-[11px] font-medium rounded-lg transition-all duration-150 cursor-pointer",
            value === opt
              ? "bg-white text-foreground shadow-sm"
              : "text-muted hover:text-foreground",
          )}
        >
          {display ? display(opt) : String(opt)}
        </button>
      ))}
    </div>
  );
}

/* ─── SVG Icons ───────────────────────────────────────────────────── */

const icons = {
  palette: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="8" r="1.5" fill="currentColor" />
      <circle cx="8" cy="12" r="1.5" fill="currentColor" />
      <circle cx="16" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </svg>
  ),
  spacing: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 6H3M21 12H3M21 18H3" strokeLinecap="round" />
    </svg>
  ),
  radius: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12V5a2 2 0 012-2h7M3 12v7a2 2 0 002 2h7m9-9V5a2 2 0 00-2-2h-7m9 9v7a2 2 0 01-2 2h-7" strokeLinecap="round" />
    </svg>
  ),
  shadow: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <path d="M7 21h14a2 2 0 002-2V7" opacity="0.4" />
    </svg>
  ),
  font: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7V4h16v3M9 20h6M12 4v16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

/* ─── Main TokenPanel ─────────────────────────────────────────────── */

export function TokenPanel() {
  const { state, dispatch } = useLab();
  const { tokens } = state;

  const handleColorChange = useCallback(
    (key: keyof TokenOverrides, value: string) => {
      dispatch({ type: "UPDATE_TOKEN", key, value });
      document.documentElement.style.setProperty(`--${key}`, value);
    },
    [dispatch],
  );

  const handleTokenChange = useCallback(
    (key: keyof TokenOverrides, value: string | number) => {
      dispatch({ type: "UPDATE_TOKEN", key, value });
    },
    [dispatch],
  );

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col overflow-y-auto border-r border-border bg-card">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary">
            <path d="M12 3v1m0 16v1m-8-9H3m18 0h-1M5.6 5.6l.7.7m12.1-.7l-.7.7M5.6 18.4l.7-.7m12.1.7l-.7-.7" strokeLinecap="round" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        </div>
        <h2 className="text-sm font-semibold text-foreground">디자인 토큰</h2>
      </div>

      {/* ── 색상 ── */}
      <Section title="색상" icon={icons.palette}>
        <ColorRow label="primary" tokenKey="primary" value={tokens.primary} onChange={handleColorChange} />
        <ColorRow label="accent" tokenKey="accent" value={tokens.accent} onChange={handleColorChange} />
        <ColorRow label="danger" tokenKey="danger" value={tokens.danger} onChange={handleColorChange} />
        <ColorRow label="success" tokenKey="success" value={tokens.success} onChange={handleColorChange} />
        <ColorRow label="warning" tokenKey="warning" value={tokens.warning} onChange={handleColorChange} />
      </Section>

      {/* ── 간격 ── */}
      <Section title="간격" icon={icons.spacing}>
        <div className="space-y-1.5">
          <span className="text-[10px] font-medium text-muted uppercase tracking-wider">Base Unit</span>
          <SegmentedSelector
            options={[4, 6, 8]}
            value={tokens.spacingBase}
            onChange={(v) => handleTokenChange("spacingBase", v)}
            display={(v) => `${v}px`}
          />
        </div>
      </Section>

      {/* ── 모서리 ── */}
      <Section title="모서리" icon={icons.radius}>
        <SegmentedSelector
          options={["none", "sm", "md", "lg", "xl"] as const}
          value={tokens.radius as "none" | "sm" | "md" | "lg" | "xl"}
          onChange={(v) => handleTokenChange("radius", v)}
        />
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[10px] text-muted">미리보기:</span>
          <div className={cn(
            "w-10 h-10 bg-primary/15 border border-primary/30",
            tokens.radius === "none" && "rounded-none",
            tokens.radius === "sm" && "rounded-sm",
            tokens.radius === "md" && "rounded-md",
            tokens.radius === "lg" && "rounded-lg",
            tokens.radius === "xl" && "rounded-xl",
          )} />
        </div>
      </Section>

      {/* ── 그림자 ── */}
      <Section title="그림자" icon={icons.shadow}>
        <SegmentedSelector
          options={["none", "xs", "sm", "md", "lg"] as const}
          value={tokens.shadow as "none" | "xs" | "sm" | "md" | "lg"}
          onChange={(v) => handleTokenChange("shadow", v)}
        />
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[10px] text-muted">미리보기:</span>
          <div className={cn(
            "w-10 h-10 bg-white rounded-lg border border-border",
            tokens.shadow === "xs" && "shadow-xs",
            tokens.shadow === "sm" && "shadow-sm",
            tokens.shadow === "md" && "shadow-md",
            tokens.shadow === "lg" && "shadow-lg",
          )} />
        </div>
      </Section>

      {/* ── 폰트 ── */}
      <Section title="폰트" icon={icons.font}>
        <div className="space-y-1.5">
          <span className="text-[10px] font-medium text-muted uppercase tracking-wider">Font Family</span>
          <select
            value={tokens.fontFamily}
            onChange={(e) => handleTokenChange("fontFamily", e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6880' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
          >
            <option value="system-ui">System UI</option>
            <option value="Pretendard">Pretendard</option>
            <option value="Inter">Inter</option>
            <option value="Noto Sans KR">Noto Sans KR</option>
          </select>
          <div className="pt-1 text-xs text-muted" style={{ fontFamily: tokens.fontFamily }}>
            가나다라 ABCD 1234
          </div>
        </div>
      </Section>
    </aside>
  );
}
