"use client";
import { useEffect, useState } from "react";

const colorVars = [
  {
    group: "Primary (테마 연동)",
    vars: [
      { name: "--primary", label: "Primary" },
      { name: "--primary-hover", label: "Hover" },
      { name: "--primary-light", label: "Light" },
      { name: "--primary-glow", label: "Glow" },
    ],
  },
  {
    group: "Accent (테마 연동)",
    vars: [
      { name: "--accent", label: "Accent" },
      { name: "--accent-light", label: "Light" },
    ],
  },
  {
    group: "Semantic",
    vars: [
      { name: "--success", label: "Success" },
      { name: "--success-light", label: "Success Light" },
      { name: "--warning", label: "Warning" },
      { name: "--warning-light", label: "Warning Light" },
      { name: "--danger", label: "Danger" },
      { name: "--danger-hover", label: "Danger Hover" },
      { name: "--danger-light", label: "Danger Light" },
    ],
  },
  {
    group: "Neutral",
    vars: [
      { name: "--foreground", label: "Foreground" },
      { name: "--muted", label: "Muted" },
      { name: "--muted-light", label: "Muted Light" },
      { name: "--border", label: "Border" },
      { name: "--border-light", label: "Border Light" },
      { name: "--card", label: "Card" },
      { name: "--background", label: "Background" },
    ],
  },
  {
    group: "Sidebar",
    vars: [
      { name: "--sidebar-bg", label: "Background" },
      { name: "--sidebar-hover", label: "Hover" },
      { name: "--sidebar-text", label: "Text" },
      { name: "--sidebar-active", label: "Active" },
    ],
  },
];

function useComputedColors() {
  const [colors, setColors] = useState<Record<string, string>>({});

  useEffect(() => {
    const read = () => {
      const style = getComputedStyle(document.documentElement);
      const result: Record<string, string> = {};
      colorVars.forEach((g) =>
        g.vars.forEach((v) => {
          result[v.name] = style.getPropertyValue(v.name).trim();
        }),
      );
      setColors(result);
    };
    read();
    // MutationObserver로 테마 변경 감지
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });
    return () => observer.disconnect();
  }, []);

  return colors;
}

export default function ColorsPage() {
  const computed = useComputedColors();

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Colors</h1>
      <p className="text-sm text-muted mb-2">CSS 변수 기반 시맨틱 컬러 시스템</p>
      <p className="text-xs text-muted-light mb-6">
        왼쪽 사이드바의 <span className="font-semibold text-primary-ink">Theme</span> 선택기로 Primary
        색상을 변경하면 연동된 모든 색상이 자동으로 바뀝니다.
      </p>

      {colorVars.map((group) => (
        <div key={group.group} className="mb-8">
          <h2 className="text-base font-semibold mb-3">{group.group}</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {group.vars.map((v) => {
              const value = computed[v.name] || "";
              return (
                <div
                  key={v.name}
                  className="border border-border rounded-xl overflow-hidden bg-white"
                >
                  <div
                    className="h-16 transition-colors duration-300"
                    style={{ backgroundColor: value || "transparent" }}
                  />
                  <div className="p-2.5">
                    <div className="text-xs font-semibold text-foreground">{v.label}</div>
                    <div className="text-[10px] font-mono text-muted">{value}</div>
                    <div className="text-[10px] font-mono text-muted-light">{v.name}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
