"use client";
import { Badge } from "@/ds/primitives/Badge";

const stats = [
  { label: "Primitives", count: 15, color: "primary" as const },
  { label: "Composites", count: 17, color: "success" as const },
  { label: "Patterns", count: 5, color: "warning" as const },
  { label: "Hooks", count: 5, color: "info" as const },
  { label: "Tokens", count: 7, color: "default" as const },
];

export default function DesignSystemPage() {
  return (
    <div className="max-w-4xl">
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-foreground">junDS</h1>
          <Badge variant="primary" size="lg">v1.0</Badge>
        </div>
        <p className="text-base text-muted max-w-xl">
          준하의 디자인 시스템. 모든 프로젝트에서 일관된 UI를 만들기 위한 컴포넌트 라이브러리.
          레고 블록처럼 조합하여 어떤 인터페이스든 빠르게 구축할 수 있습니다.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-foreground mb-1">{s.count}</div>
            <Badge variant={s.color} size="sm">{s.label}</Badge>
          </div>
        ))}
      </div>

      {/* Quick Start */}
      <div className="bg-white border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Quick Start</h2>
        <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm font-mono overflow-x-auto">
          <code>{`// 개별 import (트리쉐이킹 최적)
import { Button } from "@/ds/primitives/Button";
import { Modal } from "@/ds/composites/Modal";
import { DataTable } from "@/ds/patterns/DataTable";

// 또는 barrel import
import { Button, Modal, DataTable } from "@/ds";`}</code>
        </pre>
      </div>

      {/* Architecture */}
      <div className="bg-white border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Architecture</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-border rounded-lg p-4">
            <div className="text-sm font-semibold text-primary mb-2">Primitives</div>
            <p className="text-xs text-muted">의존성 0인 원자 컴포넌트. Button, Input, Badge, Avatar 등 가장 작은 단위.</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <div className="text-sm font-semibold text-success mb-2">Composites</div>
            <p className="text-xs text-muted">Primitives를 조합한 분자 컴포넌트. Select, Modal, Toast, Tabs 등.</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <div className="text-sm font-semibold text-warning mb-2">Patterns</div>
            <p className="text-xs text-muted">비즈니스 로직을 포함한 복합 패턴. DataTable, Calendar, CommandPalette 등.</p>
          </div>
        </div>
      </div>

      {/* Design Principles */}
      <div className="bg-white border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-3">Design Principles</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { title: "Composable", desc: "레고처럼 조합 가능한 컴포넌트 설계" },
            { title: "Type-Safe", desc: "모든 Props에 TypeScript 타입 제공" },
            { title: "Accessible", desc: "ARIA 속성, 키보드 네비게이션 기본 지원" },
            { title: "Performant", desc: "트리쉐이킹, 최소 리렌더링, 경량 번들" },
            { title: "Consistent", desc: "CSS 변수 기반 디자인 토큰으로 일관성 보장" },
            { title: "AI-Friendly", desc: "명확한 Props, JSDoc, 사용 예시로 AI 활용 최적화" },
          ].map((p) => (
            <div key={p.title} className="flex items-start gap-2 p-3 rounded-lg bg-gray-50">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <div>
                <div className="text-sm font-medium text-foreground">{p.title}</div>
                <div className="text-xs text-muted">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
