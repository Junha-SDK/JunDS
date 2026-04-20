"use client";

import { useCallback } from "react";
import { cn } from "@/ds/utils/cn";
import { useLab } from "../_lib/store";
import { componentDefMap } from "../_lib/registry";
import type { PropDef, PropValue } from "../_lib/types";

/* ── Category badge colors ─────────────────────────────────────────── */

const catBadge: Record<string, string> = {
  "레이아웃": "bg-violet-100 text-violet-700",
  "기본": "bg-blue-100 text-blue-700",
  "입력": "bg-emerald-100 text-emerald-700",
  "데이터": "bg-amber-100 text-amber-700",
  "피드백": "bg-rose-100 text-rose-700",
  "네비게이션": "bg-cyan-100 text-cyan-700",
  "오버레이": "bg-pink-100 text-pink-700",
};

/* ── Toggle switch ─────────────────────────────────────────────────── */

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors",
        checked ? "bg-[var(--primary)]" : "bg-[var(--border)]",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-[3px]",
        )}
      />
    </button>
  );
}

/* ── Color picker ──────────────────────────────────────────────────── */

function ColorInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="relative w-7 h-7 rounded-lg border border-border overflow-hidden cursor-pointer shrink-0">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
        />
        <span
          className="block w-full h-full rounded-lg"
          style={{ backgroundColor: value || "#000000" }}
        />
      </label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className={cn(
          "flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5",
          "text-xs font-mono text-foreground placeholder:text-muted",
          "outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
          "transition-colors",
        )}
      />
    </div>
  );
}

/* ── Section label ─────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
      {children}
    </h4>
  );
}

/* ── Prop field renderer ───────────────────────────────────────────── */

function PropField({
  def,
  value,
  onChange,
}: {
  def: PropDef;
  value: PropValue;
  onChange: (v: PropValue) => void;
}) {
  const label = def.label ?? def.name;

  switch (def.type) {
    case "select":
      return (
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            {label}
          </label>
          <select
            value={String(value ?? def.defaultValue ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "w-full rounded-lg border border-border bg-background px-2.5 py-1.5",
              "text-xs text-foreground",
              "outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
              "transition-colors cursor-pointer appearance-none",
            )}
          >
            {def.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );

    case "boolean":
      return (
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            {label}
          </label>
          <ToggleSwitch
            checked={Boolean(value ?? def.defaultValue)}
            onChange={(v) => onChange(v)}
          />
        </div>
      );

    case "text":
      return (
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            {label}
          </label>
          <input
            type="text"
            value={String(value ?? def.defaultValue ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "w-full rounded-lg border border-border bg-background px-2.5 py-1.5",
              "text-xs text-foreground placeholder:text-muted",
              "outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
              "transition-colors",
            )}
          />
        </div>
      );

    case "number":
      return (
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            {label}
          </label>
          <input
            type="number"
            value={value !== undefined ? Number(value) : Number(def.defaultValue ?? 0)}
            onChange={(e) => onChange(Number(e.target.value))}
            className={cn(
              "w-full rounded-lg border border-border bg-background px-2.5 py-1.5",
              "text-xs text-foreground placeholder:text-muted",
              "outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
              "transition-colors",
            )}
          />
        </div>
      );

    case "color":
      return (
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            {label}
          </label>
          <ColorInput
            value={String(value ?? def.defaultValue ?? "#000000")}
            onChange={(v) => onChange(v)}
          />
        </div>
      );

    default:
      return null;
  }
}

/* ── Main component ────────────────────────────────────────────────── */

export function PropsPanel() {
  const { state, dispatch } = useLab();
  const { selectedId, nodes } = state;

  const selectedNode = selectedId ? nodes[selectedId] : null;
  const def = selectedNode ? componentDefMap.get(selectedNode.componentId) : null;

  const handlePropChange = useCallback(
    (key: string, value: PropValue) => {
      if (!selectedId) return;
      dispatch({ type: "UPDATE_PROP", nodeId: selectedId, key, value });
    },
    [selectedId, dispatch],
  );

  const handleChildrenChange = useCallback(
    (children: string) => {
      if (!selectedId) return;
      dispatch({ type: "UPDATE_CHILDREN", nodeId: selectedId, children });
    },
    [selectedId, dispatch],
  );

  const handleDelete = useCallback(() => {
    if (!selectedId) return;
    dispatch({ type: "DELETE_NODE", nodeId: selectedId });
  }, [selectedId, dispatch]);

  /* ── Empty state ───────────────────────────── */

  if (!selectedNode || !def) {
    return (
      <aside className="w-72 shrink-0 bg-card border-l border-border flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-[var(--primary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59"
              />
            </svg>
          </div>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            컴포넌트를 선택하면
            <br />
            속성을 편집할 수 있습니다
          </p>
        </div>
      </aside>
    );
  }

  /* ── Panel content ─────────────────────────── */

  const hasTextChildren =
    def.defaultChildren !== undefined || selectedNode.children !== undefined;

  return (
    <aside className="w-72 shrink-0 bg-card border-l border-border flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base leading-none shrink-0">
              {def.icon ?? "?"}
            </span>
            <span className="text-sm font-semibold text-foreground truncate">
              {def.label}
            </span>
            <span
              className={cn(
                "text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0",
                catBadge[def.category] ?? "bg-gray-100 text-gray-700",
              )}
            >
              {def.category}
            </span>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            title="삭제"
            className={cn(
              "p-1 rounded-md text-[var(--danger)] hover:bg-[var(--danger-light)]",
              "transition-colors shrink-0",
            )}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Props section */}
        {def.props.length > 0 && (
          <div className="px-4 py-3 space-y-3 border-b border-border">
            <SectionLabel>속성</SectionLabel>
            {def.props.map((propDef) => (
              <PropField
                key={propDef.name}
                def={propDef}
                value={selectedNode.props[propDef.name]}
                onChange={(v) => handlePropChange(propDef.name, v)}
              />
            ))}
          </div>
        )}

        {/* Children section */}
        {hasTextChildren && (
          <div className="px-4 py-3 space-y-2">
            <SectionLabel>텍스트 콘텐츠</SectionLabel>
            <textarea
              value={selectedNode.children ?? ""}
              onChange={(e) => handleChildrenChange(e.target.value)}
              rows={3}
              className={cn(
                "w-full rounded-lg border border-border bg-background px-2.5 py-2",
                "text-xs text-foreground placeholder:text-muted resize-none",
                "outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
                "transition-colors leading-relaxed",
              )}
              placeholder="텍스트를 입력하세요..."
            />
          </div>
        )}

        {/* No props */}
        {def.props.length === 0 && !hasTextChildren && (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-[var(--muted)]">
              편집 가능한 속성이 없습니다
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
