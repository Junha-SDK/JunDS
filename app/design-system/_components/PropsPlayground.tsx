"use client";
import { useState, useCallback, useMemo } from "react";
import { cn } from "@/ds/utils/cn";

export type PlaygroundControl =
  | { type: "select"; name: string; label: string; options: string[]; defaultValue: string }
  | { type: "boolean"; name: string; label: string; defaultValue: boolean }
  | { type: "text"; name: string; label: string; defaultValue: string }
  | { type: "number"; name: string; label: string; defaultValue: number; min?: number; max?: number };

export interface PropsPlaygroundProps {
  componentName: string;
  controls: PlaygroundControl[];
  renderPreview: (props: Record<string, unknown>) => React.ReactNode;
  importPath?: string;
}

export function PropsPlayground({ componentName, controls, renderPreview, importPath }: PropsPlaygroundProps) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    controls.forEach((c) => { initial[c.name] = c.defaultValue; });
    return initial;
  });

  const [copied, setCopied] = useState(false);

  const updateValue = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const codeString = useMemo(() => {
    const propStrings = Object.entries(values)
      .filter(([, v]) => {
        const ctrl = controls.find((c) => c.name === Object.keys(values).find((k) => values[k] === v));
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
    <div className="rounded-2xl border border-border overflow-hidden bg-white">
      {/* Preview Area */}
      <div className="flex items-center justify-center min-h-[160px] p-8 bg-[repeating-conic-gradient(#f3f4f6_0%_25%,transparent_0%_50%)] bg-[length:20px_20px]">
        {renderPreview(values)}
      </div>

      {/* Controls */}
      <div className="border-t border-border bg-gray-50/80 p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {controls.filter(c => c.name !== "children").map((ctrl) => (
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
                      className={cn(
                        "px-2 py-1 text-[11px] rounded-md font-medium transition-colors cursor-pointer",
                        values[ctrl.name] === opt
                          ? "bg-primary text-white"
                          : "bg-white border border-border text-muted hover:border-primary/30",
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
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer",
                    values[ctrl.name]
                      ? "bg-primary text-white"
                      : "bg-white border border-border text-muted",
                  )}
                >
                  <span className={cn("w-3 h-3 rounded-sm border", values[ctrl.name] ? "bg-white/30 border-white/50" : "border-gray-300")}>
                    {Boolean(values[ctrl.name]) && <svg viewBox="0 0 12 12" className="w-3 h-3 text-white"><path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>}
                  </span>
                  {ctrl.label}
                </button>
              )}
              {ctrl.type === "text" && (
                <input
                  value={String(values[ctrl.name] ?? "")}
                  onChange={(e) => updateValue(ctrl.name, e.target.value)}
                  className="w-full h-7 px-2 text-xs border border-border rounded-md outline-none focus:border-primary bg-white"
                />
              )}
              {ctrl.type === "number" && (
                <input
                  type="number"
                  value={Number(values[ctrl.name] ?? 0)}
                  onChange={(e) => updateValue(ctrl.name, Number(e.target.value))}
                  min={ctrl.min}
                  max={ctrl.max}
                  className="w-full h-7 px-2 text-xs border border-border rounded-md outline-none focus:border-primary bg-white tabular-nums"
                />
              )}
            </div>
          ))}
        </div>

        {/* Children text input */}
        {controls.find(c => c.name === "children") && (
          <div className="mt-3">
            <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">
              Children (텍스트)
              <input
                value={String(values.children ?? "")}
                onChange={(e) => updateValue("children", e.target.value)}
                className="mt-1.5 w-full h-7 px-2 text-xs border border-border rounded-md outline-none focus:border-primary bg-white"
              />
            </label>
          </div>
        )}
      </div>

      {/* Generated Code */}
      <div className="border-t border-border">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-950">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Generated Code</span>
          <button
            type="button"
            onClick={handleCopy}
            className={cn("text-[10px] font-medium px-2 py-1 rounded cursor-pointer transition-colors", copied ? "text-emerald-400 bg-emerald-400/10" : "text-gray-400 hover:text-white hover:bg-white/10")}
          >
            {copied ? "\u2713 \ubcf5\uc0ac\ub428" : "\ubcf5\uc0ac"}
          </button>
        </div>
        <pre className="px-4 py-3 text-sm font-mono text-gray-300 bg-gray-950 overflow-x-auto">
          <code>{codeString}</code>
        </pre>
      </div>
    </div>
  );
}
