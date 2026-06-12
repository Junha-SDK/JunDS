"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Box } from "@/ds/core";
import { Button } from "@/ds/primitives/Button";
import { Badge } from "@/ds/primitives/Badge";
import { Avatar } from "@/ds/primitives/Avatar";
import { Input } from "@/ds/primitives/Input";
import { Switch } from "@/ds/primitives/Switch";
import { StarRating } from "@/ds/primitives/StarRating";
import { Alert } from "@/ds/composites/Alert";
import { ProgressBar } from "@/ds/composites/Progress";
import { AnimatedCounter } from "@/ds/composites/AnimatedCounter";
import { MiniChart } from "@/ds/composites/MiniChart";
import { ProgressRing } from "@/ds/composites/ProgressRing";

const STATS = [
  { label: "Primitives", count: 44, href: "/design-system/primitives/button" },
  { label: "Composites", count: 159, href: "/design-system/composites/modal" },
  { label: "Patterns", count: 33, href: "/design-system/patterns/data-table" },
  { label: "Hooks", count: 46, href: "#" },
  { label: "Layout", count: 11, href: "/design-system/framework/box" },
];

const CATEGORIES = [
  {
    label: "Primitives",
    count: 44,
    href: "/design-system/primitives/button",
    desc: "토큰 기반 원자 컴포넌트.",
    items: ["Button", "Input", "Badge", "Avatar", "Switch", "Slider", "Spinner", "Toggle", "Tag", "Kbd"],
  },
  {
    label: "Composites",
    count: 159,
    href: "/design-system/composites/modal",
    desc: "조합된 분자 컴포넌트.",
    items: ["Modal", "Tabs", "Select", "DataGrid", "Card", "Drawer", "Toast", "LineChart", "BarChart", "Snackbar"],
  },
  {
    label: "Patterns",
    count: 33,
    href: "/design-system/patterns/data-table",
    desc: "비즈니스 로직 포함 패턴.",
    items: ["DataTable", "FormWizard", "Calendar", "Kanban", "CommandPalette", "HeroSection", "FAQ", "BlogPost"],
  },
];

const FEATURES = [
  { kw: "01", t: "토큰 기반 시스템", d: "색·간격·타이포·그림자·반경·z-index까지 모든 값이 토큰. 한 줄로 테마 교체." },
  { kw: "02", t: "반응형 Props", d: "p={{ base: 2, md: 4 }} 단일 prop으로 브레이크포인트 제어. 미디어쿼리 직접 작성 X." },
  { kw: "03", t: "접근성 내장", d: "ARIA, 포커스 트랩, 키보드 내비, Reduced Motion. axe-core 자동 감사." },
  { kw: "04", t: "트리쉐이킹", d: "ESM/CJS 듀얼 빌드, sideEffects: false. 쓰는 만큼만 번들에 포함." },
  { kw: "05", t: "MCP 통합", d: "AI 에디터에서 prop 시그니처를 직접 조회. Cursor·Claude Code 즉시 연결." },
  { kw: "06", t: "다크모드 + 18 테마", d: "프리셋 18개 + 커스텀 컬러 + 밀도/반경 토글까지 전역 토큰으로 제어." },
];

const TOOLS = [
  "locate", "get_component_props", "list_recipes", "read_recipe",
  "list_requirements", "read_requirement", "list_hooks", "scaffold",
  "get_a11y", "get_bundle_info", "get_deps_for", "get_screenshot_info",
  "extract_props", "map_refresh",
];

export default function DesignSystemPage() {
  const [mounted, setMounted] = useState(false);
  const [demoRating, setDemoRating] = useState(4);
  const [demoSwitch, setDemoSwitch] = useState(true);
  const [copied, setCopied] = useState(false);
  useEffect(() => setMounted(true), []);

  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText("npm install @junds/ui");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <Box maxW="1040px" mx="auto" px={{ base: 5, md: 8 }}>

      {/* ─────────────── Hero ─────────────── */}
      <section className="pt-16 md:pt-24 pb-20 md:pb-28">
        <div className="inline-flex items-center gap-2 mb-8 px-2.5 py-1 rounded-full border border-border bg-surface text-[11px] font-medium text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-success" aria-hidden />
          v2.3.0 · 293 components
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.04em] leading-[1.02] mb-6 max-w-3xl">
          Production-ready<br />
          <span className="text-muted">design system, </span>
          <span className="gradient-text">batteries included.</span>
        </h1>

        <p className="text-lg text-muted leading-relaxed max-w-2xl mb-10">
          Primitives부터 Patterns까지 293개 컴포넌트 · 46개 훅 · 18개 테마.
          토큰·접근성·다크모드·MCP를 처음부터 갖춘 프로덕션 디자인 시스템.
        </p>

        <div className="flex flex-wrap items-center gap-3 mb-12">
          <Link href="/design-system/showcase">
            <Button variant="primary" size="lg" className="px-6 py-3 text-sm">
              컴포넌트 둘러보기
            </Button>
          </Link>
          <Link href="#install">
            <Button variant="ghost" size="lg" className="px-5 py-3 text-sm">
              설치 가이드 →
            </Button>
          </Link>
        </div>

        {/* Inline install */}
        <button
          type="button"
          onClick={copyInstall}
          className="group inline-flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-surface hover:border-foreground/25 transition-colors cursor-pointer"
        >
          <span className="text-muted text-sm select-none">$</span>
          <span className="font-mono text-sm">npm install @junds/ui</span>
          <span className="text-muted text-xs ml-2 min-w-[40px] text-right">
            {copied ? "복사됨" : "복사"}
          </span>
        </button>
      </section>

      {/* ─────────────── At a glance ─────────────── */}
      <section className="border-y border-border py-8 mb-24">
        <div className="grid grid-cols-3 md:grid-cols-5 gap-x-6 gap-y-6">
          {STATS.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="group flex flex-col gap-1"
            >
              <div className="text-3xl md:text-4xl font-semibold tabular-nums tracking-tight">
                {mounted ? <AnimatedCounter value={s.count} duration={1200} /> : s.count}
              </div>
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted group-hover:text-foreground transition-colors">
                {s.label}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─────────────── Code preview ─────────────── */}
      <section className="mb-32">
        <SectionHeader eyebrow="Example" title="컴포넌트는 이렇게 생겼습니다" />

        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-4 mt-8">
          <CodeWindow title="App.tsx">
            <pre className="text-[13px] font-mono leading-7 text-zinc-300 p-6">
<span className="text-zinc-500">{"// 단일 import — 트리쉐이킹 안전"}</span>{"\n"}
<span className="text-pink-400">import</span> <span className="text-zinc-300">{"{ "}</span><span className="text-amber-300">Card</span><span className="text-zinc-300">{", "}</span><span className="text-amber-300">Button</span><span className="text-zinc-300">{", "}</span><span className="text-amber-300">Stat</span><span className="text-zinc-300">{" } "}</span><span className="text-pink-400">from</span> <span className="text-emerald-400">{'"@junds/ui"'}</span>{"\n\n"}
<span className="text-pink-400">export default function</span> <span className="text-amber-300">RevenueCard</span>() {"{"}{"\n"}
{"  "}<span className="text-pink-400">return</span> ({"\n"}
{"    "}<span className="text-zinc-500">{"<"}</span><span className="text-rose-400">Card</span> <span className="text-sky-300">hoverable</span><span className="text-zinc-500">{">"}</span>{"\n"}
{"      "}<span className="text-zinc-500">{"<"}</span><span className="text-rose-400">Stat</span>{"\n"}
{"        "}<span className="text-sky-300">label</span><span className="text-zinc-500">=</span><span className="text-emerald-400">{'"이번 달 매출"'}</span>{"\n"}
{"        "}<span className="text-sky-300">value</span><span className="text-zinc-500">=</span><span className="text-emerald-400">{'"₩12,400,000"'}</span>{"\n"}
{"        "}<span className="text-sky-300">change</span><span className="text-zinc-500">{"={"}</span><span className="text-orange-300">12.5</span><span className="text-zinc-500">{"} "}</span>{"\n"}
{"      "}<span className="text-zinc-500">{"/>"}</span>{"\n"}
{"      "}<span className="text-zinc-500">{"<"}</span><span className="text-rose-400">Button</span> <span className="text-sky-300">variant</span><span className="text-zinc-500">=</span><span className="text-emerald-400">{'"primary"'}</span><span className="text-zinc-500">{">"}</span>자세히<span className="text-zinc-500">{"</"}</span><span className="text-rose-400">Button</span><span className="text-zinc-500">{">"}</span>{"\n"}
{"    "}<span className="text-zinc-500">{"</"}</span><span className="text-rose-400">Card</span><span className="text-zinc-500">{">"}</span>{"\n"}
{"  "}){"\n"}
{"}"}
            </pre>
          </CodeWindow>

          <div className="rounded-xl border border-border bg-surface p-6 flex flex-col justify-center min-h-[280px]">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted mb-4">Result</div>
            <div className="rounded-lg border border-border-light bg-background p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted mb-1">이번 달 매출</div>
                  <div className="text-2xl font-semibold tabular-nums leading-none">₩12,400,000</div>
                  <div className="text-xs text-success mt-1.5 tabular-nums">↑ 12.5% 전월 대비</div>
                </div>
                <ProgressRing value={78} size={48} strokeWidth={3.5}>
                  <span className="text-[11px] font-semibold">78%</span>
                </ProgressRing>
              </div>
              <MiniChart data={[30,45,38,52,48,61,55,70,65,78]} type="area" width={300} height={36} />
              <Button variant="primary" size="sm" fullWidth className="mt-4">자세히 보기</Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── Categories ─────────────── */}
      <section className="mb-32">
        <SectionHeader eyebrow="Components" title="3계층으로 정리되어 있습니다" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden mt-8 border border-border">
          {CATEGORIES.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="group flex flex-col p-7 bg-surface hover:bg-background transition-colors"
            >
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="text-lg font-semibold tracking-tight">{c.label}</h3>
                <span className="text-xs text-muted tabular-nums">{c.count}</span>
              </div>
              <p className="text-xs text-muted leading-relaxed mb-5">{c.desc}</p>
              <div className="flex flex-wrap gap-1 mb-5">
                {c.items.map((item) => (
                  <span
                    key={item}
                    className="text-[10.5px] font-mono px-1.5 py-0.5 rounded bg-background border border-border-light text-muted"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <span className="mt-auto text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                탐색하기 →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─────────────── Live demo strip ─────────────── */}
      <section className="mb-32">
        <SectionHeader eyebrow="Live" title="컴포넌트는 살아있어요" sub="실제로 클릭·입력해보세요." />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8">
          <DemoCard label="Form">
            <div className="flex flex-col gap-2.5">
              <Input placeholder="사용자 이름" size="sm" />
              <Input placeholder="이메일" size="sm" />
              <div className="flex items-center justify-between text-xs py-1">
                <span>알림 받기</span>
                <Switch size="sm" checked={demoSwitch} onChange={() => setDemoSwitch(!demoSwitch)} />
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span>평점</span>
                <StarRating value={demoRating} onChange={setDemoRating} size="sm" />
              </div>
              <Button variant="primary" size="sm" fullWidth>저장</Button>
            </div>
          </DemoCard>

          <DemoCard label="Profile">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Avatar name="김준하" size="md" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">김준하</div>
                  <div className="text-xs text-muted truncate">Frontend Engineer</div>
                </div>
                <Badge variant="primary" size="sm">Pro</Badge>
              </div>
              <Alert variant="success" title="배포 완료" className="text-xs py-2">{""}</Alert>
              <ProgressBar value={85} className="h-1.5" />
              <div className="flex gap-2">
                <Button variant="secondary" size="xs">프로필</Button>
                <Button variant="ghost" size="xs">설정</Button>
              </div>
            </div>
          </DemoCard>

          <DemoCard label="Metric">
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-semibold tabular-nums leading-none">2,840</div>
                  <div className="text-[11px] text-muted mt-1">활성 사용자</div>
                </div>
                <Badge variant="success" size="sm" dot>+8.2%</Badge>
              </div>
              <MiniChart data={[12,18,15,22,20,28,25,32,30,38]} type="area" width={250} height={48} />
              <div className="flex items-center gap-2 text-[11px] text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                지난 10일 누적
              </div>
            </div>
          </DemoCard>
        </div>
      </section>

      {/* ─────────────── Why JunDS ─────────────── */}
      <section className="mb-32">
        <SectionHeader eyebrow="Why JunDS" title="실전을 위해 만들어진 디자인 시스템" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border rounded-xl overflow-hidden border border-border mt-8">
          {FEATURES.map((f) => (
            <div key={f.t} className="p-6 bg-surface">
              <div className="text-xs font-mono text-muted mb-2 tabular-nums">{f.kw}</div>
              <h3 className="text-base font-semibold mb-1.5 tracking-tight">{f.t}</h3>
              <p className="text-sm text-muted leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────── AI / MCP ─────────────── */}
      <section id="ai-mcp" className="scroll-mt-8 mb-32">
        <SectionHeader
          eyebrow="AI · MCP"
          title="AI 에디터에서 hallucination 없이"
          sub="저장소를 Cursor·Claude Code로 열면 14개 MCP 도구가 자동 연결됩니다."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 mb-3">
          <CodeWindow title=".mcp.json — 이미 포함됨">
            <pre className="text-[13px] font-mono leading-7 text-zinc-300 p-6">
{`{
  "mcpServers": {
    "junds": {
      "command": "node",
      "args": ["mcp/server.mjs"]
    }
  }
}`}
            </pre>
          </CodeWindow>

          <CodeWindow title="AI 에디터 대화" tone="primary">
            <div className="p-6 text-[13px] font-mono leading-7">
              <div className="text-emerald-300 mb-3">
                {'→ "결제 카드 + 액션 버튼으로 화면 만들어줘"'}
              </div>
              <div className="text-zinc-500 text-xs mb-1">{"// AI가 호출:"}</div>
              <div className="text-amber-300 text-xs mb-0.5">locate(&quot;결제 카드&quot;)</div>
              <div className="text-amber-300 text-xs mb-0.5">get_component_props(&quot;Card&quot;)</div>
              <div className="text-amber-300 text-xs mb-3">read_recipe(&quot;modal-form&quot;)</div>
              <div className="text-zinc-500 text-xs mb-1">{"// 결과:"}</div>
              <div className="text-sky-400 text-xs">{'import { Card, Button } from "@junds/ui"'}</div>
              <div className="text-zinc-400 text-xs mt-1">{"<Card hoverable> ..."}</div>
            </div>
          </CodeWindow>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">14 MCP Tools</div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TOOLS.map((name) => (
              <code
                key={name}
                className="text-[11px] font-mono px-2 py-1 rounded-md border border-border bg-background text-foreground hover:border-primary/40 transition-colors"
              >
                {name}
              </code>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── Install ─────────────── */}
      <section id="install" className="scroll-mt-8 mb-32">
        <SectionHeader eyebrow="Install" title="30초면 충분합니다" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
          <CodeWindow title="1. 설치">
            <pre className="text-[13px] font-mono leading-7 text-zinc-300 p-6">
<span className="text-zinc-500">$</span> <span className="text-emerald-400">npm install</span> @junds/ui{"\n"}
<span className="text-zinc-500">$</span> <span className="text-emerald-400">npm install</span> tailwindcss
            </pre>
          </CodeWindow>

          <CodeWindow title="2. 사용">
            <pre className="text-[13px] font-mono leading-7 text-zinc-300 p-6">
<span className="text-pink-400">import</span> <span className="text-zinc-300">{"{ "}</span><span className="text-amber-300">Button</span><span className="text-zinc-300">{" } "}</span><span className="text-pink-400">from</span> <span className="text-emerald-400">{'"@junds/ui"'}</span>{"\n"}
<span className="text-pink-400">import</span> <span className="text-emerald-400">{'"@junds/ui/styles.css"'}</span>{"\n\n"}
<span className="text-pink-400">export default function</span> <span className="text-amber-300">App</span>() {"{"}{"\n"}
{"  "}<span className="text-pink-400">return</span> <span className="text-zinc-500">{"<"}</span><span className="text-rose-400">Button</span><span className="text-zinc-500">{">"}</span>Hello<span className="text-zinc-500">{"</"}</span><span className="text-rose-400">Button</span><span className="text-zinc-500">{">"}</span>{"\n"}
{"}"}
            </pre>
          </CodeWindow>
        </div>
      </section>

      {/* ─────────────── Footer CTA ─────────────── */}
      <section className="mb-12 pb-12 border-t border-border pt-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-md">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
              지금 바로 시작하세요
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              293개 컴포넌트, 46개 훅, 11개 레이아웃을 갤러리에서 탐색해보세요.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/design-system/showcase">
              <Button variant="primary" size="lg" className="px-6 py-3 text-sm">
                갤러리 탐색
              </Button>
            </Link>
            <Link href="/design-system/framework/provider">
              <Button variant="outline" size="lg" className="px-6 py-3 text-sm">
                프레임워크 가이드
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Box>
  );
}

/* ─────────────── Helpers ─────────────── */

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="max-w-2xl">
      <div className="inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted mb-3">
        {eyebrow}
      </div>
      <h2 className="text-2xl md:text-[32px] font-semibold tracking-[-0.02em] leading-tight">
        {title}
      </h2>
      {sub && <p className="mt-2 text-sm text-muted leading-relaxed">{sub}</p>}
    </div>
  );
}

function DemoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-foreground/20">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted mb-4">{label}</div>
      {children}
    </div>
  );
}

function CodeWindow({ title, tone, children }: { title: string; tone?: "primary"; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-zinc-950 overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900">
        <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" aria-hidden />
        <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" aria-hidden />
        <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" aria-hidden />
        <span className="ml-2 text-[10px] font-mono text-zinc-500">{title}</span>
        {tone === "primary" && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" aria-hidden />
        )}
      </div>
      {children}
    </div>
  );
}
