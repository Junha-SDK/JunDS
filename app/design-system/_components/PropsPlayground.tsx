"use client";
import { useState, useCallback, useMemo } from "react";
import { cn } from "@/ds/utils/cn";

export type PlaygroundControl =
  | { type: "select"; name: string; label: string; options: string[]; defaultValue: string }
  | { type: "boolean"; name: string; label: string; defaultValue: boolean }
  | { type: "text"; name: string; label: string; defaultValue: string }
  | {
      type: "number";
      name: string;
      label: string;
      defaultValue: number;
      min?: number;
      max?: number;
    };

export interface PropsPlaygroundProps {
  componentName: string;
  controls: PlaygroundControl[];
  renderPreview: (props: Record<string, unknown>) => React.ReactNode;
  importPath?: string;
}

export function PropsPlayground({
  componentName,
  controls,
  renderPreview,
  importPath,
}: PropsPlaygroundProps) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    controls.forEach((c) => {
      initial[c.name] = c.defaultValue;
    });
    return initial;
  });

  const [copied, setCopied] = useState(false);

  const updateValue = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const codeString = useMemo(() => {
    const propStrings = Object.entries(values)
      .filter(([, v]) => {
        const ctrl = controls.find(
          (c) => c.name === Object.keys(values).find((k) => values[k] === v),
        );
        return true; // include all for now
      })
      .map(([key, value]) => {
        const ctrl = controls.find((c) => c.name === key);
        if (!ctrl) return null;
        if (ctrl.type === "boolean" && value === ctrl.defaultValue) return null;
        if (ctrl.type === "select" && value === ctrl.defaultValue) return null;
        if (ctrl.type === "text" && value === ctrl.defaultValue) return null;
        if (ctrl.type === "number" && value === ctrl.defaultValue) return null;
        if (ctrl.type === "boolean") return value ? key : null;
        if (ctrl.type === "number") return `${key}={${value}}`;
        return `${key}="${value}"`;
      })
      .filter(Boolean);

    const childCtrl = controls.find((c) => c.name === "children");
    const childText = childCtrl ? String(values.children || "Button") : componentName;
    const propsStr = propStrings.length > 0 ? " " + propStrings.join(" ") : "";

    return `<${componentName}${propsStr}>${childText}</${componentName}>`;
  }, [values, controls, componentName]);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-border overflow-hidden bg-card">
      {/* Preview Area — 체커보드 색을 #f3f4f6 리터럴로 박으면 다크에서 밝은 격자가
          그대로 남는다. 토큰 변수를 그라디언트 안에서 참조해 모드를 따라가게 한다 */}
      <div className="flex items-center justify-center min-h-[160px] p-8 bg-card bg-[repeating-conic-gradient(var(--border-light)_0%_25%,transparent_0%_50%)] bg-[length:20px_20px]">
        {renderPreview(values)}
      </div>

      {/* Controls */}
      <div className="border-t border-border bg-surface-soft p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {controls
            .filter((c) => c.name !== "children")
            .map((ctrl) => (
              <div key={ctrl.name}>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">
                  {ctrl.label}
                </label>
                {ctrl.type === "select" && (
                  <div className="flex flex-wrap gap-1">
                    {ctrl.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateValue(ctrl.name, opt)}
                        aria-pressed={values[ctrl.name] === opt}
                        className={cn(
                          "px-2 py-1 text-[11px] rounded-lg font-medium transition-colors cursor-pointer",
                          // offset 은 컨트롤 띠(surface-soft)에 맞춘다 — background 로
                          // 맞추면 링과 버튼 사이에 다른 색 띠가 낀다
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
                          "focus-visible:ring-offset-2 focus-visible:ring-offset-surface-soft",
                          values[ctrl.name] === opt
                            ? "bg-primary text-white"
                            : "bg-card border border-border text-muted hover:border-primary/30 hover:text-foreground",
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                {ctrl.type === "boolean" && (
                  <button
                    type="button"
                    onClick={() => updateValue(ctrl.name, !values[ctrl.name])}
                    aria-pressed={Boolean(values[ctrl.name])}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
                      "focus-visible:ring-offset-2 focus-visible:ring-offset-surface-soft",
                      values[ctrl.name]
                        ? "bg-primary text-white"
                        : "bg-card border border-border text-muted hover:border-primary/30",
                    )}
                  >
                    <span
                      className={cn(
                        "w-3 h-3 rounded-sm border shrink-0",
                        // border-gray-300 은 다크에서 밝은 테두리로 튄다
                        values[ctrl.name] ? "bg-white/30 border-white/50" : "border-border",
                      )}
                    >
                      {Boolean(values[ctrl.name]) && (
                        <svg viewBox="0 0 12 12" className="w-3 h-3 text-white">
                          <path
                            d="M2.5 6l2.5 2.5 4.5-5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </span>
                    {ctrl.label}
                  </button>
                )}
                {ctrl.type === "text" && (
                  <input
                    value={String(values[ctrl.name] ?? "")}
                    onChange={(e) => updateValue(ctrl.name, e.target.value)}
                    aria-label={ctrl.label}
                    className={cn(
                      "w-full min-w-0 h-7 px-2 text-xs border border-border rounded-lg bg-card",
                      "transition-[border-color] duration-150 focus:border-primary",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
                      "focus-visible:ring-offset-2 focus-visible:ring-offset-surface-soft",
                    )}
                  />
                )}
                {ctrl.type === "number" && (
                  <input
                    type="number"
                    value={Number(values[ctrl.name] ?? 0)}
                    onChange={(e) => updateValue(ctrl.name, Number(e.target.value))}
                    min={ctrl.min}
                    max={ctrl.max}
                    aria-label={ctrl.label}
                    className={cn(
                      "w-full min-w-0 h-7 px-2 text-xs border border-border rounded-lg bg-card tabular-nums",
                      "transition-[border-color] duration-150 focus:border-primary",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
                      "focus-visible:ring-offset-2 focus-visible:ring-offset-surface-soft",
                    )}
                  />
                )}
              </div>
            ))}
        </div>

        {/* Children text input */}
        {controls.find((c) => c.name === "children") && (
          <div className="mt-3">
            <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">
              Children (텍스트)
              <input
                value={String(values.children ?? "")}
                onChange={(e) => updateValue("children", e.target.value)}
                className={cn(
                  "mt-1.5 w-full min-w-0 h-7 px-2 text-xs border border-border rounded-lg bg-card",
                  "transition-[border-color] duration-150 focus:border-primary",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
                  "focus-visible:ring-offset-2 focus-visible:ring-offset-surface-soft",
                )}
              />
            </label>
          </div>
        )}
      </div>

      {/* Generated Code */}
      {/* bg-gray-950 은 의도적인 어두운 코드 크롬 — 토큰으로 옮기지 않는다 */}
      <div className="border-t border-border">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-950">
          {/* gray-500 은 이 배경에서 3.8:1 로 AA 미달이라 라벨이 뭉갰다 */}
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
            Generated Code
          </span>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "코드가 복사되었습니다" : "코드 복사"}
            className={cn(
              "text-[10px] font-medium px-2 py-1 rounded-lg cursor-pointer transition-colors",
              // 어두운 크롬 위라 primary 링은 묻힌다 — 흰 링 + 크롬과 같은 offset
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
              "focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950",
              copied
                ? "text-emerald-400 bg-emerald-400/10"
                : "text-gray-400 hover:text-white hover:bg-white/10",
            )}
          >
            {copied ? "✓ 복사됨" : "복사"}
          </button>
        </div>
        <pre className="px-4 py-3 text-sm font-mono text-gray-300 bg-gray-950 overflow-x-auto overscroll-x-contain">
          <code>{codeString}</code>
        </pre>
      </div>
    </div>
  );
}
