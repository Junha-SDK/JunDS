"use client";
import { useState, useMemo, type ReactNode } from "react";
import { cn } from "@/ds/utils/cn";

export interface PlaygroundControl {
  name: string;
  type: "select" | "boolean" | "text" | "number";
  options?: string[];
  defaultValue: string | boolean | number;
}

interface PlaygroundProps {
  controls: PlaygroundControl[];
  render: (values: Record<string, string | boolean | number>) => ReactNode;
  /** 코드 템플릿 — {prop} 치환 */
  codeTemplate: string;
}

/**
 * 인터랙티브 Playground — Props를 실시간 조작하며 코드 자동 생성
 */
export function Playground({ controls, render, codeTemplate }: PlaygroundProps) {
  const [values, setValues] = useState<Record<string, string | boolean | number>>(() => {
    const init: Record<string, string | boolean | number> = {};
    controls.forEach((c) => { init[c.name] = c.defaultValue; });
    return init;
  });
  const [copied, setCopied] = useState(false);

  const update = (name: string, value: string | boolean | number) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const code = useMemo(() => {
    let result = codeTemplate;
    controls.forEach((c) => {
      const val = values[c.name];
      if (c.type === "boolean") {
        result = result.replace(`{${c.name}}`, val ? c.name : "");
      } else if (c.type === "number") {
        result = result.replace(`{${c.name}}`, `${c.name}={${val}}`);
      } else {
        result = result.replace(`{${c.name}}`, `${c.name}="${val}"`);
      }
    });
    // 빈 prop 정리
    result = result.replace(/\s+(?=\s)/g, " ").replace(/ +>/g, ">").replace(/ +\/>/g, " />");
    return result.trim();
  }, [values, codeTemplate, controls]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white">
      {/* Preview */}
      <div className="p-6 min-h-[120px] flex items-center justify-center bg-[linear-gradient(45deg,#f8f8f8_25%,transparent_25%,transparent_75%,#f8f8f8_75%),linear-gradient(45deg,#f8f8f8_25%,transparent_25%,transparent_75%,#f8f8f8_75%)] bg-[length:16px_16px] bg-[position:0_0,8px_8px]">
        <div className="bg-white p-4 rounded-lg">{render(values)}</div>
      </div>

      {/* Controls */}
      <div className="border-t border-border bg-gray-50/80 px-4 py-3">
        <div className="flex items-center flex-wrap gap-3">
          {controls.map((c) => (
            <div key={c.name} className="flex items-center gap-1.5">
              <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">{c.name}</label>
              {c.type === "select" && (
                <select
                  value={values[c.name] as string}
                  onChange={(e) => update(c.name, e.target.value)}
                  className="h-7 px-2 text-xs border border-border rounded-md bg-white cursor-pointer focus:border-primary focus:outline-none"
                >
                  {c.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
              {c.type === "boolean" && (
                <button
                  type="button"
                  onClick={() => update(c.name, !values[c.name])}
                  className={cn(
                    "w-8 h-5 rounded-full transition-colors relative cursor-pointer",
                    values[c.name] ? "bg-primary" : "bg-gray-300",
                  )}
                >
                  <span className={cn(
                    "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
                    values[c.name] && "translate-x-3",
                  )} />
                </button>
              )}
              {c.type === "text" && (
                <input
                  value={values[c.name] as string}
                  onChange={(e) => update(c.name, e.target.value)}
                  className="h-7 px-2 text-xs border border-border rounded-md w-24 bg-white focus:border-primary focus:outline-none"
                />
              )}
              {c.type === "number" && (
                <input
                  type="number"
                  value={values[c.name] as number}
                  onChange={(e) => update(c.name, Number(e.target.value))}
                  className="h-7 px-2 text-xs border border-border rounded-md w-16 bg-white focus:border-primary focus:outline-none"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Code output */}
      <div className="border-t border-border relative group">
        <pre className="bg-gray-900 text-gray-100 px-4 py-3 text-xs font-mono overflow-x-auto leading-relaxed">
          <code>{code}</code>
        </pre>
        <button
          onClick={handleCopy}
          className={cn(
            "absolute top-2 right-2 px-2 py-1 text-[10px] rounded-md transition-all cursor-pointer",
            "opacity-0 group-hover:opacity-100",
            copied ? "bg-success text-white" : "bg-white/10 text-white/70 hover:bg-white/20",
          )}
        >
          {copied ? "복사됨!" : "복사"}
        </button>
      </div>
    </div>
  );
}
