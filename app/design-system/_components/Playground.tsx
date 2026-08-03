"use client";
import { useId, useState, useMemo, type ReactNode } from "react";
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
    controls.forEach((c) => {
      init[c.name] = c.defaultValue;
    });
    return init;
  });
  const [copied, setCopied] = useState(false);
  // 한 페이지에 Playground 가 여러 개 놓이면 고정 id 는 중복된다 —
  // label↔컨트롤 연결을 깨뜨리지 않으려면 인스턴스별 접두사가 필요하다
  const uid = useId();

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
    result = result
      .replace(/\s+(?=\s)/g, " ")
      .replace(/ +>/g, ">")
      .replace(/ +\/>/g, " />");
    return result.trim();
  }, [values, codeTemplate, controls]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Preview — 체커보드 색을 #f8f8f8 리터럴로 박아 두면 다크에서 흰 격자가
          그대로 남는다. 토큰 변수를 그라디언트 안에서 직접 참조해 모드를 따라가게 한다 */}
      <div className="p-6 min-h-[120px] flex items-center justify-center bg-card bg-[linear-gradient(45deg,var(--border-light)_25%,transparent_25%,transparent_75%,var(--border-light)_75%),linear-gradient(45deg,var(--border-light)_25%,transparent_25%,transparent_75%,var(--border-light)_75%)] bg-[length:16px_16px] bg-[position:0_0,8px_8px]">
        <div className="bg-card p-4 rounded-xl">{render(values)}</div>
      </div>

      {/* Controls */}
      <div className="border-t border-border bg-surface-soft px-4 py-3">
        <div className="flex items-center flex-wrap gap-3">
          {controls.map((c) => (
            <div key={c.name} className="flex items-center gap-1.5 min-w-0">
              <label
                htmlFor={`${uid}-${c.name}`}
                className="text-[11px] font-semibold text-muted uppercase tracking-wider whitespace-nowrap"
              >
                {c.name}
              </label>
              {c.type === "select" && (
                <select
                  id={`${uid}-${c.name}`}
                  value={values[c.name] as string}
                  onChange={(e) => update(c.name, e.target.value)}
                  className={cn(
                    "h-7 px-2 text-xs border border-border rounded-lg bg-card cursor-pointer",
                    "transition-[border-color] duration-150 focus:border-primary",
                    // offset 은 컨트롤 띠와 같은 면(surface-soft)에 맞춘다 —
                    // background 로 맞추면 링 사이에 다른 색 띠가 낀다
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-surface-soft",
                  )}
                >
                  {c.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              )}
              {c.type === "boolean" && (
                <button
                  id={`${uid}-${c.name}`}
                  type="button"
                  role="switch"
                  aria-checked={Boolean(values[c.name])}
                  onClick={() => update(c.name, !values[c.name])}
                  className={cn(
                    "w-8 h-5 rounded-full transition-colors relative cursor-pointer shrink-0",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-surface-soft",
                    // bg-gray-300 은 다크에서 회색 알약으로 남는다 — 꺼짐은 border 토큰
                    values[c.name] ? "bg-primary" : "bg-border",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-card shadow-sm transition-transform",
                      values[c.name] && "translate-x-3",
                    )}
                  />
                </button>
              )}
              {c.type === "text" && (
                <input
                  id={`${uid}-${c.name}`}
                  value={values[c.name] as string}
                  onChange={(e) => update(c.name, e.target.value)}
                  className={cn(
                    "h-7 px-2 text-xs border border-border rounded-lg w-24 bg-card min-w-0",
                    "transition-[border-color] duration-150 focus:border-primary",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-surface-soft",
                  )}
                />
              )}
              {c.type === "number" && (
                <input
                  id={`${uid}-${c.name}`}
                  type="number"
                  value={values[c.name] as number}
                  onChange={(e) => update(c.name, Number(e.target.value))}
                  className={cn(
                    "h-7 px-2 text-xs border border-border rounded-lg w-16 bg-card min-w-0 tabular-nums",
                    "transition-[border-color] duration-150 focus:border-primary",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-surface-soft",
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Code output */}
      {/* bg-gray-900 은 의도적인 어두운 코드 크롬 — 모드와 무관하게 유지한다 */}
      <div className="border-t border-border relative group">
        <pre className="bg-gray-900 text-gray-100 px-4 py-3 text-xs font-mono overflow-x-auto overscroll-x-contain leading-relaxed">
          <code>{code}</code>
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "코드가 복사되었습니다" : "코드 복사"}
          className={cn(
            "absolute top-2 right-2 px-2 py-1 text-[10px] rounded-lg cursor-pointer",
            "transition-[opacity,background-color,color] duration-200",
            // hover 로만 나타나면 키보드 사용자는 이 버튼의 존재를 모른다
            "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
            copied ? "bg-success text-white" : "bg-white/10 text-white/70 hover:bg-white/20",
          )}
        >
          {copied ? "복사됨!" : "복사"}
        </button>
      </div>
    </div>
  );
}
