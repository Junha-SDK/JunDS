"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Badge } from "@/ds/primitives/Badge";
import { Button } from "@/ds/primitives/Button";
import { ChartCard } from "@/ds/patterns/ChartCard";

const revenueData = [
  { label: "1월", value: 120 },
  { label: "2월", value: 180 },
  { label: "3월", value: 95 },
  { label: "4월", value: 210 },
  { label: "5월", value: 165 },
  { label: "6월", value: 240 },
];

const activationData = [
  { label: "가입", value: 820, color: "#2563eb" },
  { label: "인증", value: 640, color: "#0891b2" },
  { label: "초대", value: 420, color: "#059669" },
  { label: "결제", value: 180, color: "#d97706" },
];

const trafficData = [12, 18, 14, 22, 19, 28, 25, 32, 30, 35, 33, 40].map((value, index) => ({
  label: `W${index + 1}`,
  value,
}));

const areaData = [
  { label: "월", value: 32 },
  { label: "화", value: 44 },
  { label: "수", value: 41 },
  { label: "목", value: 58 },
  { label: "금", value: 63 },
  { label: "토", value: 52 },
  { label: "일", value: 68 },
];

const channelData = [
  { label: "검색", value: 42, color: "#2563eb" },
  { label: "추천", value: 26, color: "#059669" },
  { label: "광고", value: 18, color: "#d97706" },
  { label: "직접", value: 14, color: "#dc2626" },
];

const progressData = [
  { label: "온보딩", value: 78, color: "#2563eb" },
  { label: "권한 점검", value: 64, color: "#059669" },
  { label: "보안 리뷰", value: 46, color: "#d97706" },
  { label: "배포 준비", value: 88, color: "#8b5cf6" },
];

const stackedData = [
  {
    label: "Core",
    value: 0,
    segments: [
      { label: "완료", value: 34, color: "#059669" },
      { label: "진행", value: 18, color: "#2563eb" },
      { label: "대기", value: 8, color: "#d97706" },
    ],
  },
  {
    label: "Console",
    value: 0,
    segments: [
      { label: "완료", value: 22, color: "#059669" },
      { label: "진행", value: 26, color: "#2563eb" },
      { label: "대기", value: 14, color: "#d97706" },
    ],
  },
  {
    label: "Mobile",
    value: 0,
    segments: [
      { label: "완료", value: 18, color: "#059669" },
      { label: "진행", value: 12, color: "#2563eb" },
      { label: "대기", value: 20, color: "#d97706" },
    ],
  },
];

const healthData = [
  { label: "정상", value: 93, color: "#059669" },
  { label: "주의", value: 7, color: "#d97706" },
];

const formatCurrency = (value: number) => `${value.toLocaleString("ko-KR")}만`;
const formatPercent = (value: number) => `${value}%`;

export default function ChartCardPage() {
  return (
    <ComponentPage
      name="ChartCard"
      description="대시보드 차트 카드. KPI, 추세, 분포, 진행률, 누적 데이터까지 한 컴포넌트로 구성합니다."
      importPath='import { ChartCard } from "@/ds/patterns/ChartCard"'
      props={[
        { name: "title", type: "string", description: "카드 제목" },
        {
          name: "type",
          type: "'bar' | 'horizontal-bar' | 'stacked-bar' | 'line' | 'area' | 'donut' | 'sparkline' | 'progress' | 'radial'",
          description: "차트 유형",
        },
        { name: "data", type: "ChartDataPoint[]", description: "차트 데이터" },
        { name: "value", type: "ReactNode", description: "헤더에 표시할 KPI 값" },
        { name: "trend", type: "ChartTrend", description: "상승/하락/유지 추세 뱃지" },
        { name: "description", type: "string", description: "보조 설명" },
        { name: "height", type: "number", description: "차트 영역 높이" },
        { name: "max", type: "number", description: "진행률/방사형/가로 막대 기준값" },
        { name: "formatValue", type: "(value: number) => string", description: "값 표시 포맷터" },
        { name: "showLegend", type: "boolean", description: "범례 표시" },
        { name: "showGrid", type: "boolean", description: "그리드 라인 표시" },
        { name: "showAxis", type: "boolean", description: "축/라벨 표시" },
        { name: "loading", type: "boolean", description: "스켈레톤 로딩 상태" },
        { name: "emptyMessage", type: "string", description: "빈 데이터 메시지" },
        {
          name: "tone",
          type: "'default' | 'success' | 'warning' | 'danger' | 'info'",
          description: "차트 기본 색상 톤",
        },
        { name: "variant", type: "'card' | 'plain'", description: "카드 또는 무배경 렌더링" },
      ]}
    >
      <Section title="KPI + 추세">
        <Preview>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ChartCard
              title="월간 매출"
              description="최근 6개월"
              type="bar"
              data={revenueData}
              value="1,010만"
              trend={{ value: "+18.4%", direction: "up", label: "전월 대비" }}
              badge={
                <Badge variant="success" size="sm">
                  Live
                </Badge>
              }
              formatValue={formatCurrency}
            />
            <ChartCard
              title="활성 사용자"
              description="주간 활성"
              type="sparkline"
              data={trafficData}
              value="40K"
              trend={{ value: "+7.2%", direction: "up" }}
              tone="info"
            />
            <ChartCard
              title="서비스 헬스"
              description="SLO 기준"
              type="radial"
              data={[{ label: "정상 응답", value: 93, color: "#059669" }]}
              value="93%"
              trend={{ value: "-1.1%", direction: "down" }}
              max={100}
              formatValue={formatPercent}
              tone="success"
            />
          </div>
        </Preview>
      </Section>

      <Section title="라인 / 영역 / 막대">
        <Preview>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ChartCard
              title="주간 전환 추이"
              description="방문자에서 가입까지"
              type="area"
              data={areaData}
              value="68%"
              trend={{ value: "+12%", direction: "up" }}
              formatValue={formatPercent}
              tone="success"
            />
            <ChartCard
              title="퍼널 단계"
              description="최근 24시간"
              type="horizontal-bar"
              data={activationData}
              max={900}
              actions={
                <Button variant="ghost" size="xs">
                  보기
                </Button>
              }
            />
            <ChartCard
              title="응답 시간"
              description="p95 latency"
              type="line"
              data={[
                { label: "00:00", value: 180 },
                { label: "04:00", value: 152 },
                { label: "08:00", value: 220 },
                { label: "12:00", value: 190 },
                { label: "16:00", value: 248 },
                { label: "20:00", value: 205 },
              ]}
              value="205ms"
              trend={{ value: "안정", direction: "neutral" }}
              tone="warning"
            />
            <ChartCard
              title="월별 매출"
              description="카드 기본형"
              type="bar"
              data={revenueData}
              formatValue={formatCurrency}
              showGrid={false}
            />
          </div>
        </Preview>
      </Section>

      <Section title="분포 / 누적 / 진행률">
        <Preview>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ChartCard
              title="채널별 유입"
              description="이번 달"
              type="donut"
              data={channelData}
              value="24.8K"
              trend={{ value: "+5.9%", direction: "up" }}
            />
            <ChartCard
              title="릴리즈 현황"
              description="스쿼드별 누적 상태"
              type="stacked-bar"
              data={stackedData}
              max={70}
            />
            <ChartCard
              title="체크리스트"
              description="운영 준비 상태"
              type="progress"
              data={progressData}
              max={100}
              formatValue={formatPercent}
              footer={
                <span className="text-xs text-muted">
                  배포 전 4개 항목 중 2개 항목이 추가 확인이 필요합니다.
                </span>
              }
            />
            <ChartCard
              title="장애 비율"
              description="최근 7일"
              type="donut"
              data={healthData}
              showLegend
              tone="success"
            />
          </div>
        </Preview>
      </Section>

      <Section title="상태 UI">
        <Preview>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ChartCard title="로딩 중" description="데이터 요청 중" type="bar" data={[]} loading />
            <ChartCard
              title="빈 그래프"
              description="필터 조건에 맞는 데이터 없음"
              type="area"
              data={[]}
              emptyMessage="선택한 기간에는 데이터가 없습니다"
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
