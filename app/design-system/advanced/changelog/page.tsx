"use client";
import { Badge } from "@/ds/primitives/Badge";
import { Timeline } from "@/ds/composites/Timeline";

const releases = [
  {
    key: "1.0.0",
    title: "v1.0.0 — 초기 릴리즈",
    time: "2026-04-19",
    color: "primary" as const,
    description: (
      <div className="flex flex-col gap-1.5 mt-1">
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">
            신규
          </Badge>
          <span>20개 Primitives, 24개 Composites, 8개 Patterns</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" size="sm">
            기능
          </Badge>
          <span>테마 선택기 (10 프리셋 + 커스텀), 다크모드</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info" size="sm">
            인프라
          </Badge>
          <span>Vitest 175+ 테스트, Showcase 60+ 페이지</span>
        </div>
      </div>
    ),
  },
  {
    key: "1.1.0",
    title: "v1.1.0 — 고도화",
    time: "2026-04-20",
    color: "success" as const,
    description: (
      <div className="flex flex-col gap-1.5 mt-1">
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">
            신규
          </Badge>
          <span>Slider, NumberInput, FileUpload, CopyButton, StatusDot</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">
            신규
          </Badge>
          <span>Drawer, ConfirmDialog, Combobox, StatCard, Timeline, ButtonGroup, AvatarStack</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">
            신규
          </Badge>
          <span>
            FormBuilder, InfiniteList, VirtualList, ChartCard, NotificationCenter, SortableList,
            RichTextEditor
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" size="sm">
            기능
          </Badge>
          <span>Playground (인터랙티브 Props 조작 + 코드 생성)</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" size="sm">
            기능
          </Badge>
          <span>컴포넌트 의존성 그래프, 토큰 내보내기, AI 프롬프트 생성기</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info" size="sm">
            개선
          </Badge>
          <span>디자인 시스템 독립 라우트 (프로젝트 사이드바 분리)</span>
        </div>
      </div>
    ),
  },
];

export default function ChangelogPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Changelog</h1>
      <p className="text-sm text-muted mb-6">junDS 버전별 변경 이력</p>
      <Timeline items={releases} />
    </div>
  );
}
