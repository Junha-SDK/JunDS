# Recipe — Charts-First Dashboard

## Goal

KPI 4종 + 시계열 + 분포 + 비교를 한 화면에 묶는다. `dashboard-overview`가
패턴 컴포넌트(StatsGrid, ChartCard) 기반이라면 이 레시피는 **새로 추가된
차트 composite (Area/Bar/Pie/Line)** 를 직접 조합한다.

## Used components

- `Stat` — `@/ds/composites/Stat`
- `AreaChart` — `@/ds/composites/AreaChart`
- `BarChart` — `@/ds/composites/BarChart`
- `LineChart` — `@/ds/composites/LineChart`
- `PieChart` — `@/ds/composites/PieChart`
- `Card` — `@/ds/composites/Card`

## Recipe

```tsx
"use client";
import { Stat } from "@/ds/composites/Stat";
import { AreaChart } from "@/ds/composites/AreaChart";
import { BarChart } from "@/ds/composites/BarChart";
import { LineChart } from "@/ds/composites/LineChart";
import { PieChart } from "@/ds/composites/PieChart";
import { Card } from "@/ds/composites/Card";

const labels = ["월", "화", "수", "목", "금", "토", "일"];

export default function ChartsDashboard() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="활성 사용자" value="12,438" change={12} trend="up" />
        <Stat label="신규 가입" value="312" change={-3} trend="down" />
        <Stat label="평균 세션" value="4.8" unit="분" change={0} trend="neutral" />
        <Stat label="MRR" value="$24.1k" change={8} trend="up" />
      </section>

      <section className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <h3 className="text-sm font-semibold mb-3">주간 활동</h3>
          <AreaChart
            labels={labels}
            mode="stacked"
            smooth
            showGrid
            height={240}
            series={[
              {
                name: "Web",
                color: "var(--primary)",
                values: [120, 132, 145, 168, 159, 102, 88],
              },
              {
                name: "Mobile",
                color: "var(--success)",
                values: [90, 102, 120, 135, 142, 95, 80],
              },
            ]}
          />
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-3">트래픽 출처</h3>
          <PieChart
            innerRatio={0.6}
            centerLabel="100%"
            data={[
              { name: "직접", value: 42, color: "var(--primary)" },
              { name: "검색", value: 31, color: "var(--success)" },
              { name: "소셜", value: 18, color: "var(--warning)" },
              { name: "기타", value: 9, color: "var(--muted)" },
            ]}
          />
        </Card>
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-3">팀별 처리량</h3>
          <BarChart
            labels={["Frontend", "Backend", "Data", "QA"]}
            orientation="horizontal"
            showValues
            height={220}
            series={[
              { name: "이번 주", color: "var(--primary)", values: [42, 38, 21, 18] },
              { name: "지난 주", color: "var(--muted)", values: [38, 36, 19, 16] },
            ]}
          />
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-3">전환율 추세</h3>
          <LineChart
            labels={labels}
            showDots
            showGrid
            height={220}
            series={[
              {
                name: "전환율(%)",
                color: "var(--primary)",
                values: [3.1, 3.4, 3.0, 3.6, 3.8, 3.5, 3.9],
              },
            ]}
          />
        </Card>
      </section>
    </div>
  );
}
```

## Variations

- **실시간**: 각 차트의 `series.values`를 `useEffect` + EventSource로 갱신
- **다크 모드 자동**: `var(--primary)`/`var(--success)` 토큰을 그대로 사용 —
  `[data-theme="dark"]`에서 자동 색조 전환
- **단일 대시보드 보드**: `Card`를 `ChartCard` (pattern)로 교체 — 헤더/액션
  슬롯이 통일됨

## See also

- `.ai/recipes/dashboard-overview.md` — pattern 기반 변형
- `app/design-system/composites/area-chart/page.tsx`
