# Recipe — Dashboard Overview

## Goal

KPI 요약 카드 + 차트 카드 2-3개 + 최근 활동 타임라인을 한 화면에 묶는 표준
대시보드 레이아웃을 만든다. 데이터가 없을 때는 `EmptyState` 로 폴백한다.
이 레시피는 데이터가 있는 경로와 없는 경로를 모두 보여 준다.

## Used components

- `StatsGrid` — `@/ds/patterns/StatsGrid`
- `ChartCard` — `@/ds/patterns/ChartCard`
- `Timeline` — `@/ds/composites/Timeline`
- `EmptyState` — `@/ds/composites/EmptyState`
- `Card`, `Card.Body` — `@/ds/composites/Card`
- `Button` — `@/ds/primitives/Button`
- `Heading`, `Text`, `VStack` — `@/ds/core`

Props 검증: `.ai/props.json` → patterns → StatsGrid / ChartCard, composites
→ Timeline / EmptyState / Card. `StatsGrid` 의 `stats` 항목은 `StatCardProps`
구조이며 `change`, `trend` 가 있다. `ChartCard` 는 `type`, `data` 가 필수.

## Recipe

```tsx
"use client";
import { Heading, Text, VStack } from "@/ds/core";
import { StatsGrid } from "@/ds/patterns/StatsGrid";
import { ChartCard } from "@/ds/patterns/ChartCard";
import { Timeline, type TimelineItem } from "@/ds/composites/Timeline";
import { EmptyState } from "@/ds/composites/EmptyState";
import { Card } from "@/ds/composites/Card";
import { Button } from "@/ds/primitives/Button";

interface DashboardData {
  stats: {
    label: string;
    value: string | number;
    change?: string;
    trend?: "up" | "down" | "neutral";
  }[];
  weeklySignups: { label: string; value: number }[];
  trafficSources: { label: string; value: number; color?: string }[];
  activity: TimelineItem[];
}

const sample: DashboardData = {
  stats: [
    { label: "총 사용자", value: "12,438", change: "+12%", trend: "up" },
    { label: "활성 세션", value: 1834, change: "+4%", trend: "up" },
    { label: "이탈률", value: "3.2%", change: "-0.4%", trend: "down" },
    { label: "MRR", value: "$24.1k", change: "+8.2%", trend: "up" },
  ],
  weeklySignups: [
    { label: "월", value: 32 },
    { label: "화", value: 41 },
    { label: "수", value: 38 },
    { label: "목", value: 52 },
    { label: "금", value: 47 },
    { label: "토", value: 19 },
    { label: "일", value: 12 },
  ],
  trafficSources: [
    { label: "Direct", value: 42 },
    { label: "Search", value: 31 },
    { label: "Referral", value: 18 },
    { label: "Social", value: 9 },
  ],
  activity: [
    {
      key: "1",
      title: "새 결제",
      description: "Pro 플랜 구독",
      time: "방금",
      color: "success",
    },
    {
      key: "2",
      title: "회원가입",
      description: "user@acme.com",
      time: "5분 전",
      color: "primary",
    },
    {
      key: "3",
      title: "결제 실패",
      description: "카드 한도 초과",
      time: "1시간 전",
      color: "danger",
    },
  ],
};

export default function DashboardOverview({ data = sample }: { data?: DashboardData }) {
  const hasData = data.stats.length > 0 || data.activity.length > 0;

  if (!hasData) {
    return (
      <EmptyState
        title="아직 데이터가 없어요"
        description="첫 사용자가 가입하면 여기에 통계가 표시됩니다."
        action={<Button variant="primary">초대 링크 만들기</Button>}
      />
    );
  }

  return (
    <VStack gap={6}>
      <Heading level={1}>대시보드</Heading>

      <StatsGrid stats={data.stats} columns={4} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="주간 가입자"
          type="bar"
          data={data.weeklySignups}
          value="241"
          trend={{ value: "+18%", direction: "up", label: "지난주 대비" }}
          height={180}
        />
        <ChartCard
          title="유입 채널"
          type="donut"
          data={data.trafficSources}
          showLegend
          height={180}
        />
      </div>

      <Card>
        <Card.Body>
          <VStack gap={3}>
            <Heading level={3}>최근 활동</Heading>
            {data.activity.length === 0 ? (
              <Text fontSize="sm" dimmed>
                표시할 활동이 없습니다.
              </Text>
            ) : (
              <Timeline items={data.activity} />
            )}
          </VStack>
        </Card.Body>
      </Card>
    </VStack>
  );
}
```

## Variations

- **로딩 스켈레톤** — `ChartCard` 는 `loading` prop 을 받는다. 데이터 fetch
  중에는 `loading` 을 켜 두고 나머지는 `Skeleton`(`@/ds/composites/Skeleton`)
  로 감싼다.
- **드릴다운** — `ChartCard.actions` 에 `Button variant="ghost"` 로
  "자세히 보기" 를 넣고 모달이나 새 페이지로 연결한다(`./modal-with-form.md`
  와 동일한 패턴).
- **사용자 정의 위젯** — 그리드를 `BentoGrid`(`@/ds/composites/BentoGrid`) 로
  교체하면 위젯 크기를 자유롭게 잡을 수 있다.
- **시간 필터** — 상단에 `SegmentedControl`(`@/ds/composites/SegmentedControl`)
  로 1D / 7D / 30D 토글을 두고 모든 차트의 데이터셋을 교체한다.

## See also

- 쇼케이스: `/design-system/patterns/stats-grid`,
  `/design-system/patterns/chart-card`, `/design-system/composites/timeline`,
  `/design-system/composites/empty-state`,
  `/design-system/showcase/templates/dashboard`
- 관련 레시피: `./data-table-page.md`, `./notification-stack.md`
- 요구사항: `requirements/design-system-library.md`
- 소스: `/Users/junha/develop/jjunhaa/JunDS/ds/patterns/ChartCard/ChartCard.tsx`,
  `/Users/junha/develop/jjunhaa/JunDS/ds/patterns/StatsGrid/StatsGrid.tsx`
