"use client";

import { useState, useCallback } from "react";
import { cn } from "@/ds/utils/cn";
import { useLab } from "../_lib/lab-store";
import type { TokenOverrides } from "../_lib/types";

/* ------------------------------------------------------------------ */
/*  Collapsible section wrapper                                       */
/* ------------------------------------------------------------------ */

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-muted/40 transition-colors"
      >
        <span>{title}</span>
        <span
          className={cn(
            "text-[10px] transition-transform",
            open ? "rotate-0" : "-rotate-90",
          )}
        >
          ▼
        </span>
      </button>
      {open && <div className="px-4 pb-4 pt-1 space-y-3">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Color row                                                         */
/* ------------------------------------------------------------------ */

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
    <div className="flex items-center gap-2">
      <label className="text-xs text-muted-foreground w-16 shrink-0">
        {label}
      </label>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(tokenKey as keyof TokenOverrides, e.target.value)}
        className="h-7 w-7 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(tokenKey as keyof TokenOverrides, e.target.value)}
        className="h-7 flex-1 rounded border border-border bg-background px-2 text-xs font-mono"
        maxLength={7}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Segmented button group                                            */
/* ------------------------------------------------------------------ */

function SegmentedButtons<T extends string | number>({
  label,
  options,
  value,
  onChange,
  display,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
  display?: (v: T) => string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="flex rounded-md border border-border overflow-hidden">
        {options.map((opt) => (
          <button
            key={String(opt)}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "flex-1 px-2 py-1.5 text-xs font-medium transition-colors",
              "border-r border-border last:border-r-0",
              value === opt
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-muted/60",
            )}
          >
            {display ? display(opt) : String(opt)}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main TokenPanel                                                   */
/* ------------------------------------------------------------------ */

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
    <aside className="flex h-full w-[260px] shrink-0 flex-col overflow-y-auto border-r border-border bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">디자인 토큰</h2>
      </div>

      {/* ── 색상 ── */}
      <Section title="색상 (Colors)">
        <ColorRow
          label="primary"
          tokenKey="primary"
          value={tokens.primary}
          onChange={handleColorChange}
        />
        <ColorRow
          label="accent"
          tokenKey="accent"
          value={tokens.accent}
          onChange={handleColorChange}
        />
        <ColorRow
          label="danger"
          tokenKey="danger"
          value={tokens.danger}
          onChange={handleColorChange}
        />
        <ColorRow
          label="success"
          tokenKey="success"
          value={tokens.success}
          onChange={handleColorChange}
        />
        <ColorRow
          label="warning"
          tokenKey="warning"
          value={tokens.warning}
          onChange={handleColorChange}
        />
      </Section>

      {/* ── 간격 ── */}
      <Section title="간격 (Spacing)">
        <SegmentedButtons
          label="spacingBase"
          options={[4, 6, 8]}
          value={tokens.spacingBase}
          onChange={(v) => handleTokenChange("spacingBase", v)}
          display={(v) => `${v}px`}
        />
      </Section>

      {/* ── 모서리 ── */}
      <Section title="모서리 (Radius)">
        <SegmentedButtons
          label="radius"
          options={["none", "sm", "md", "lg", "xl"] as const}
          value={tokens.radius as "none" | "sm" | "md" | "lg" | "xl"}
          onChange={(v) => handleTokenChange("radius", v)}
        />
      </Section>

      {/* ── 그림자 ── */}
      <Section title="그림자 (Shadow)">
        <SegmentedButtons
          label="shadow"
          options={["none", "xs", "sm", "md", "lg"] as const}
          value={tokens.shadow as "none" | "xs" | "sm" | "md" | "lg"}
          onChange={(v) => handleTokenChange("shadow", v)}
        />
      </Section>

      {/* ── 폰트 ── */}
      <Section title="폰트 (Font)">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">fontFamily</label>
          <select
            value={tokens.fontFamily}
            onChange={(e) => handleTokenChange("fontFamily", e.target.value)}
            className="h-8 w-full rounded border border-border bg-background px-2 text-xs"
          >
            <option value="system-ui">system-ui</option>
            <option value="Pretendard">Pretendard</option>
            <option value="Inter">Inter</option>
            <option value="Noto Sans KR">Noto Sans KR</option>
          </select>
        </div>
      </Section>
    </aside>
  );
}
