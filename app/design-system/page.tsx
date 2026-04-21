"use client";

import Link from "next/link";
import { Button } from "@/ds/primitives/Button";
import { Badge } from "@/ds/primitives/Badge";
import { Avatar } from "@/ds/primitives/Avatar";
import { Toggle } from "@/ds/primitives/Toggle";
import { StarRating } from "@/ds/primitives/StarRating";
import { Spinner } from "@/ds/primitives/Spinner";
import { Card } from "@/ds/composites/Card";
import { Alert } from "@/ds/composites/Alert";
import { ProgressBar } from "@/ds/composites/Progress";

const stats = [
  { label: "Primitives", count: 31, color: "primary" as const },
  { label: "Composites", count: 60, color: "success" as const },
  { label: "Patterns", count: 19, color: "warning" as const },
  { label: "Hooks", count: 12, color: "info" as const },
  { label: "Tokens", count: 8, color: "default" as const },
];

const features = [
  {
    icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
    title: "130+ 컴포넌트",
    desc: "레고처럼 조합 가능한 완전한 UI 라이브러리",
  },
  {
    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    title: "TypeScript First",
    desc: "모든 Props에 완벽한 타입 지원",
  },
  {
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
    title: "접근성 (A11y)",
    desc: "ARIA, 키보드 네비게이션, Focus Trap",
  },
  {
    icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
    title: "테마 시스템",
    desc: "18개 프리셋 + 커스텀 테마 + 다크 모드",
  },
  {
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    title: "반응형",
    desc: "브레이크포인트 토큰, useBreakpoint 훅",
  },
  {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    title: "트리쉐이킹",
    desc: "ESM/CJS 듀얼 빌드, sideEffects: false",
  },
];

const newFeatures = [
  { name: "FlowDiagram", desc: "인터랙티브 노드 그래프" },
  { name: "ComponentShowcase", desc: "컴포넌트 갤러리" },
  { name: "ThemeProvider / I18nProvider / ErrorBoundary", desc: "프로바이더 패턴" },
  { name: "useForm / useBreakpoint / useReducedMotion", desc: "커스텀 훅" },
  { name: "접근성 강화", desc: "focus trap, ARIA, reduced-motion" },
];

export default function DesignSystemPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* ═══ Hero Section ═══ */}
      <section className="relative overflow-hidden rounded-3xl mb-12 px-8 py-20 md:py-28">
        {/* Animated gradient blobs */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-30 animate-float-slow"
            style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }}
          />
          <div
            className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-20 animate-float-slow"
            style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)", animationDelay: "-4s" }}
          />
          <div
            className="absolute top-[40%] left-[50%] w-[40%] h-[40%] rounded-full opacity-15 animate-float-slow"
            style={{ background: "radial-gradient(circle, var(--info) 0%, transparent 70%)", animationDelay: "-8s" }}
          />
        </div>

        <div className="relative text-center stagger-children">
          {/* Version badge */}
          <div className="inline-flex items-center gap-2 mb-6">
            <Badge variant="primary" size="lg" className="badge-shine">
              v2.1.0
            </Badge>
            <span className="text-sm text-muted">Production Ready</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
            <span className="gradient-text">junDS</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted font-medium mb-6 max-w-2xl mx-auto">
            프로덕션 레디 디자인 시스템
          </p>

          {/* Stats line */}
          <p className="text-sm md:text-base text-muted-light mb-10 tracking-wide">
            130+ 컴포넌트 &middot; 12 커스텀 훅 &middot; 8 디자인 토큰 &middot; 다크 모드
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Link href="/design-system/showcase">
              <Button variant="primary" size="lg" className="btn-primary px-8 py-3 text-base">
                컬렉션 보기
              </Button>
            </Link>
            <a href="#quick-start">
              <Button variant="outline" size="lg" className="px-8 py-3 text-base">
                시작하기
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ═══ Live Component Strip ═══ */}
      <section className="mb-16 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />

        <div className="flex gap-6 items-center animate-marquee">
          {/* First set */}
          <div className="flex gap-6 items-center shrink-0">
            <div className="animate-float" style={{ animationDelay: "0s" }}>
              <Button variant="primary" size="md">Button</Button>
            </div>
            <div className="animate-float" style={{ animationDelay: "0.5s" }}>
              <Badge variant="success" size="lg">Active</Badge>
            </div>
            <div className="animate-float" style={{ animationDelay: "1s" }}>
              <Avatar name="JunDS" size="lg" />
            </div>
            <div className="animate-float" style={{ animationDelay: "1.5s" }}>
              <Toggle checked label="" />
            </div>
            <div className="animate-float" style={{ animationDelay: "2s" }}>
              <StarRating value={4} readonly />
            </div>
            <div className="animate-float" style={{ animationDelay: "2.5s" }}>
              <Spinner size="md" />
            </div>
            <div className="animate-float" style={{ animationDelay: "3s" }}>
              <Card className="p-3 text-xs font-medium">Card</Card>
            </div>
            <div className="animate-float" style={{ animationDelay: "3.5s" }}>
              <Alert variant="info" title="Info" className="py-2 px-3 text-xs">Alert</Alert>
            </div>
            <div className="animate-float w-32" style={{ animationDelay: "4s" }}>
              <ProgressBar value={72} />
            </div>
          </div>
          {/* Duplicate for seamless loop */}
          <div className="flex gap-6 items-center shrink-0">
            <div className="animate-float" style={{ animationDelay: "0s" }}>
              <Button variant="primary" size="md">Button</Button>
            </div>
            <div className="animate-float" style={{ animationDelay: "0.5s" }}>
              <Badge variant="success" size="lg">Active</Badge>
            </div>
            <div className="animate-float" style={{ animationDelay: "1s" }}>
              <Avatar name="JunDS" size="lg" />
            </div>
            <div className="animate-float" style={{ animationDelay: "1.5s" }}>
              <Toggle checked label="" />
            </div>
            <div className="animate-float" style={{ animationDelay: "2s" }}>
              <StarRating value={4} readonly />
            </div>
            <div className="animate-float" style={{ animationDelay: "2.5s" }}>
              <Spinner size="md" />
            </div>
            <div className="animate-float" style={{ animationDelay: "3s" }}>
              <Card className="p-3 text-xs font-medium">Card</Card>
            </div>
            <div className="animate-float" style={{ animationDelay: "3.5s" }}>
              <Alert variant="info" title="Info" className="py-2 px-3 text-xs">Alert</Alert>
            </div>
            <div className="animate-float w-32" style={{ animationDelay: "4s" }}>
              <ProgressBar value={72} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Stats Grid ═══ */}
      <section className="mb-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 stagger-children">
          {stats.map((s) => (
            <div
              key={s.label}
              className="glass border border-border rounded-2xl p-6 text-center card-hover"
            >
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2 animate-count-up">
                {s.count}
              </div>
              <Badge variant={s.color} size="sm">{s.label}</Badge>
            </div>
          ))}
        </div>
        <p className="text-center text-muted text-sm mt-4">
          총 <span className="font-semibold text-foreground">110+</span> 컴포넌트로 구성된 완전한 디자인 시스템
        </p>
      </section>

      {/* ═══ Feature Cards ═══ */}
      <section className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
          <span className="gradient-text">왜 junDS인가?</span>
        </h2>
        <p className="text-center text-muted mb-8">엔터프라이즈급 디자인 시스템의 모든 것</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass border border-border rounded-2xl p-6 card-hover group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <svg className="w-5 h-5 text-primary group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Quick Start ═══ */}
      <section id="quick-start" className="mb-16 scroll-mt-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
          <span className="gradient-text">시작하기</span>
        </h2>
        <p className="text-center text-muted mb-8">간단한 import로 바로 사용 가능</p>

        <div className="glass border border-border rounded-2xl p-6 md:p-8">
          <pre className="bg-gray-900 text-gray-100 rounded-xl p-5 text-sm font-mono overflow-x-auto leading-relaxed">
            <code>{`// 개별 import (트리쉐이킹 최적)
import { Button } from "@/ds/primitives/Button";
import { Modal } from "@/ds/composites/Modal";
import { DataTable } from "@/ds/patterns/DataTable";
import { useForm } from "@/ds/hooks/useForm";

// 또는 barrel import
import { Button, Modal, DataTable, useForm } from "@/ds";

// 테마 프로바이더
import { ThemeProvider } from "@/ds/providers/ThemeProvider";`}</code>
          </pre>
        </div>
      </section>

      {/* ═══ Architecture ═══ */}
      <section className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
          <span className="gradient-text">아키텍처</span>
        </h2>
        <p className="text-center text-muted mb-8">계층화된 컴포넌트 설계</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
          {/* Primitives */}
          <div className="glass border border-border rounded-2xl p-6 card-hover relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
            <div className="text-sm font-bold text-primary mb-1">Primitives</div>
            <div className="text-3xl font-bold text-foreground mb-2">31개</div>
            <p className="text-xs text-muted mb-3">의존성 0인 원자 컴포넌트</p>
            <div className="flex flex-wrap gap-1">
              {["Button", "Input", "Badge", "Avatar", "Toggle", "Slider", "Checkbox", "Radio"].map((c) => (
                <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-primary-light text-primary font-medium">{c}</span>
              ))}
            </div>
          </div>

          {/* Composites */}
          <div className="glass border border-border rounded-2xl p-6 card-hover relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-success" />
            <div className="text-sm font-bold text-success mb-1">Composites</div>
            <div className="text-3xl font-bold text-foreground mb-2">60개</div>
            <p className="text-xs text-muted mb-3">Primitives를 조합한 분자 컴포넌트</p>
            <div className="flex flex-wrap gap-1">
              {["Modal", "Tabs", "Select", "Toast", "Card", "Drawer", "Dropdown", "Alert"].map((c) => (
                <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-success-light text-success font-medium">{c}</span>
              ))}
            </div>
          </div>

          {/* Patterns */}
          <div className="glass border border-border rounded-2xl p-6 card-hover relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-warning" />
            <div className="text-sm font-bold text-warning mb-1">Patterns</div>
            <div className="text-3xl font-bold text-foreground mb-2">19개</div>
            <p className="text-xs text-muted mb-3">비즈니스 로직을 포함한 복합 패턴</p>
            <div className="flex flex-wrap gap-1">
              {["DataTable", "Calendar", "CommandPalette", "FlowDiagram", "FormWizard"].map((c) => (
                <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-warning-light text-warning font-medium">{c}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="hidden md:flex items-center justify-center mt-4 text-muted">
          <span className="text-xs">Primitives</span>
          <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-xs">Composites</span>
          <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-xs">Patterns</span>
        </div>
      </section>

      {/* ═══ New in v2.1 ═══ */}
      <section className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
          <span className="gradient-text">v2.1의 새로운 기능</span>
        </h2>
        <p className="text-center text-muted mb-8">최근 추가된 기능들</p>

        <div className="glass border border-border rounded-2xl p-6 md:p-8">
          <div className="space-y-4 stagger-children">
            {newFeatures.map((f) => (
              <div key={f.name} className="flex items-center gap-4 p-3 rounded-xl hover:bg-primary-light/30 transition-colors">
                <div className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse-soft" />
                <div>
                  <span className="text-sm font-semibold text-foreground">{f.name}</span>
                  <span className="text-sm text-muted ml-2">- {f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Bottom CTA ═══ */}
      <section className="mb-8">
        <div className="relative overflow-hidden rounded-3xl border border-border p-10 md:p-14 text-center glass">
          {/* Background decoration */}
          <div
            className="absolute inset-0 -z-10 opacity-10 animate-aurora"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--accent), var(--info), var(--success))" }}
          />

          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
            컬렉션 갤러리에서 모든 컴포넌트를 시각적으로 탐색하세요
          </h2>
          <p className="text-muted mb-6 max-w-lg mx-auto text-sm">
            130개 이상의 컴포넌트를 인터랙티브하게 체험하고, 코드 스니펫을 바로 복사하세요.
          </p>
          <Link href="/design-system/showcase">
            <Button variant="primary" size="lg" className="btn-primary px-10 py-3 text-base">
              갤러리 탐색하기
            </Button>
          </Link>
        </div>
      </section>

      {/* Marquee CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      ` }} />
    </div>
  );
}
