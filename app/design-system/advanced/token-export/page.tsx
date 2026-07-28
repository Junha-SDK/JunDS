"use client";
import { useState } from "react";
import { cn } from "@/ds/utils/cn";
import { Button } from "@/ds/primitives/Button";
import { Tabs } from "@/ds/composites/Tabs";
import { CopyButton } from "@/ds/primitives/CopyButton";

const cssVars = `/* junDS Design Tokens — CSS Variables */
:root {
  --primary: #5b4cc7;
  --primary-hover: #4a3db0;
  --primary-light: #eceafc;
  --primary-glow: rgba(91, 76, 199, 0.18);
  --accent: #7c5ce7;
  --accent-light: #efebff;
  --success: #2f8f57;
  --success-light: #eaf6ee;
  --warning: #b7791f;
  --warning-light: #fff7e6;
  --danger: #dc3f3f;
  --danger-hover: #b92f2f;
  --danger-light: #fff1f1;
  --foreground: #1a1726;
  --background: #f5f4f8;
  --card: #ffffff;
  --border: #e2dfe8;
  --muted: #6b6880;
}`;

const scssVars = `// junDS Design Tokens — SCSS Variables
$primary: #5b4cc7;
$primary-hover: #4a3db0;
$primary-light: #eceafc;
$accent: #7c5ce7;
$success: #2f8f57;
$warning: #b7791f;
$danger: #dc3f3f;
$foreground: #1a1726;
$background: #f5f4f8;
$card: #ffffff;
$border: #e2dfe8;
$muted: #6b6880;

$font-sans: 'Geist Sans', sans-serif;
$font-mono: 'Geist Mono', monospace;

$spacing-unit: 4px;
$radius-sm: 4px;
$radius-md: 6px;
$radius-lg: 8px;
$radius-xl: 12px;`;

const jsonTokens = JSON.stringify(
  {
    color: {
      primary: { value: "#5b4cc7" },
      "primary-hover": { value: "#4a3db0" },
      "primary-light": { value: "#eceafc" },
      accent: { value: "#7c5ce7" },
      success: { value: "#2f8f57" },
      warning: { value: "#b7791f" },
      danger: { value: "#dc3f3f" },
      foreground: { value: "#1a1726" },
      background: { value: "#f5f4f8" },
      card: { value: "#ffffff" },
      border: { value: "#e2dfe8" },
      muted: { value: "#6b6880" },
    },
    font: {
      sans: { value: "Geist Sans, sans-serif" },
      mono: { value: "Geist Mono, monospace" },
    },
    spacing: { unit: { value: "4px" } },
  },
  null,
  2,
);

const tailwindConfig = `// junDS Tailwind Theme Extension
// tailwind.config.ts 또는 globals.css @theme inline에 추가

const junDSColors = {
  primary: 'var(--primary)',
  'primary-hover': 'var(--primary-hover)',
  'primary-light': 'var(--primary-light)',
  accent: 'var(--accent)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  foreground: 'var(--foreground)',
  background: 'var(--background)',
  card: 'var(--card)',
  border: 'var(--border)',
  muted: 'var(--muted)',
};`;

type Format = "css" | "scss" | "json" | "tailwind";

const tabs = [
  { value: "css" as Format, label: "CSS" },
  { value: "scss" as Format, label: "SCSS" },
  { value: "json" as Format, label: "JSON" },
  { value: "tailwind" as Format, label: "Tailwind" },
];

const content: Record<Format, string> = {
  css: cssVars,
  scss: scssVars,
  json: jsonTokens,
  tailwind: tailwindConfig,
};

export default function TokenExportPage() {
  const [format, setFormat] = useState<Format>("css");

  const handleDownload = () => {
    const ext =
      format === "json"
        ? "json"
        : format === "scss"
        ? "scss"
        : format === "tailwind"
        ? "ts"
        : "css";
    const blob = new Blob([content[format]], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `junds-tokens.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Token Export</h1>
      <p className="text-sm text-muted mb-6">디자인 토큰을 다양한 포맷으로 내보내기</p>

      <div className="flex items-center justify-between mb-4">
        <Tabs tabs={tabs} value={format} onChange={setFormat} variant="segment" size="sm" />
        <div className="flex items-center gap-2">
          <CopyButton text={content[format]} variant="button" label="복사" size="sm" />
          <Button size="sm" variant="secondary" onClick={handleDownload}>
            다운로드
          </Button>
        </div>
      </div>

      <div className="relative">
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-5 text-xs font-mono overflow-x-auto leading-relaxed max-h-[500px] overflow-y-auto">
          <code>{content[format]}</code>
        </pre>
      </div>
    </div>
  );
}
