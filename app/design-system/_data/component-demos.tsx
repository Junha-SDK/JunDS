"use client";
import type { ShowcaseItem } from "@/ds/composites/ComponentShowcase";

// Import actual DS components
import { Button } from "@/ds/primitives/Button";
import { Input } from "@/ds/primitives/Input";
import { Textarea } from "@/ds/primitives/Textarea";
import { Badge } from "@/ds/primitives/Badge";
import { Avatar } from "@/ds/primitives/Avatar";
import { Spinner } from "@/ds/primitives/Spinner";
import { Divider } from "@/ds/primitives/Divider";
import { Toggle } from "@/ds/primitives/Toggle";
import { Checkbox } from "@/ds/primitives/Checkbox";
import { Tag } from "@/ds/primitives/Tag";
import { Switch } from "@/ds/primitives/Switch";
import { StarRating } from "@/ds/primitives/StarRating";
import { Kbd } from "@/ds/primitives/Kbd";
import { StatusDot } from "@/ds/primitives/StatusDot";
import { Slider } from "@/ds/primitives/Slider";
import { Label } from "@/ds/primitives/Label";
import { Card } from "@/ds/composites/Card";
import { Alert } from "@/ds/composites/Alert";
import { Skeleton } from "@/ds/composites/Skeleton";
import { ProgressBar } from "@/ds/composites/Progress";
import { Tabs } from "@/ds/composites/Tabs";
import { Accordion } from "@/ds/composites/Accordion";
import { Breadcrumb } from "@/ds/composites/Breadcrumb";
import { Pagination } from "@/ds/composites/Pagination";
import { Timeline } from "@/ds/composites/Timeline";
import { Stepper } from "@/ds/composites/Stepper";
import { EmptyState } from "@/ds/composites/EmptyState";
import { StatCard } from "@/ds/composites/StatCard";
import { Tooltip } from "@/ds/composites/Tooltip";
import { Table } from "@/ds/composites/Table";
import { DataTable } from "@/ds/patterns/DataTable";
import { DsCalendar } from "@/ds/patterns/Calendar";
import { CommandPalette } from "@/ds/patterns/CommandPalette";
import { FlowDiagram } from "@/ds/patterns/FlowDiagram";

/* ------------------------------------------------------------------ */
/*  Helper: noop for interactive components in preview mode            */
/* ------------------------------------------------------------------ */
const noop = () => {};

export const showcaseItems: ShowcaseItem[] = [
  /* ================================================================ */
  /*  PRIMITIVES                                                       */
  /* ================================================================ */

  // 1. Button
  {
    key: "button",
    label: "Button",
    description: "다양한 스타일과 크기를 지원하는 범용 버튼 컴포넌트",
    category: "Primitives",
    href: "/design-system/primitives/button",
    preview: (
      <div className="flex items-center gap-2">
        <Button size="sm">Primary</Button>
        <Button size="sm" variant="secondary">Secondary</Button>
        <Button size="sm" variant="danger">Danger</Button>
      </div>
    ),
    hoverDemo: (
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="primary">Primary</Button>
          <Button size="sm" variant="secondary">Secondary</Button>
          <Button size="sm" variant="danger">Danger</Button>
          <Button size="sm" variant="ghost">Ghost</Button>
          <Button size="sm" variant="outline">Outline</Button>
          <Button size="sm" variant="link">Link</Button>
        </div>
        <Divider label="크기 비교" />
        <div className="flex items-center gap-2">
          <Button size="xs">XS</Button>
          <Button size="sm">SM</Button>
          <Button size="md">MD</Button>
          <Button size="lg">LG</Button>
        </div>
      </div>
    ),
  },

  // 2. Input
  {
    key: "input",
    label: "Input",
    description: "텍스트 입력을 위한 기본 입력 필드 컴포넌트",
    category: "Primitives",
    href: "/design-system/primitives/input",
    preview: (
      <div className="w-full max-w-[200px]">
        <Input placeholder="텍스트를 입력하세요..." />
      </div>
    ),
    hoverDemo: (
      <div className="flex flex-col gap-3 w-full max-w-[260px]">
        <Input placeholder="기본 입력" />
        <Input placeholder="포커스 상태" className="border-primary shadow-[0_0_0_3px_var(--primary-glow)]" />
        <Input placeholder="비활성화" disabled />
        <Input placeholder="에러 상태" error />
        <Input
          placeholder="아이콘 포함"
          leftSlot={
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
        />
      </div>
    ),
  },

  // 3. Textarea
  {
    key: "textarea",
    label: "Textarea",
    description: "여러 줄의 텍스트를 입력할 수 있는 영역 컴포넌트",
    category: "Primitives",
    href: "/design-system/primitives/textarea",
    preview: (
      <div className="w-full max-w-[200px]">
        <Textarea placeholder="설명을 입력하세요..." className="min-h-[60px]" />
      </div>
    ),
    hoverDemo: (
      <div className="flex flex-col gap-3 w-full max-w-[260px]">
        <Textarea placeholder="기본 크기" className="min-h-[50px]" />
        <Textarea placeholder="큰 크기" className="min-h-[80px]" />
        <Textarea placeholder="에러 상태" error className="min-h-[50px]" />
      </div>
    ),
  },

  // 4. Badge
  {
    key: "badge",
    label: "Badge",
    description: "상태, 카운트, 라벨을 표시하는 뱃지 컴포넌트",
    category: "Primitives",
    href: "/design-system/primitives/badge",
    preview: (
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="primary">기본</Badge>
        <Badge variant="success">성공</Badge>
        <Badge variant="warning">경고</Badge>
        <Badge variant="danger">위험</Badge>
        <Badge variant="info">정보</Badge>
        <Badge variant="outline">외곽선</Badge>
      </div>
    ),
    hoverDemo: (
      <div className="flex flex-col gap-3 w-full">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="default">기본</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">성공</Badge>
          <Badge variant="warning">경고</Badge>
          <Badge variant="danger">위험</Badge>
          <Badge variant="info">정보</Badge>
          <Badge variant="outline">외곽선</Badge>
        </div>
        <Divider label="크기 비교" />
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">SM</Badge>
          <Badge variant="primary" size="md">MD</Badge>
          <Badge variant="primary" size="lg">LG</Badge>
        </div>
        <Divider label="점 & 카운트" />
        <div className="flex items-center gap-2">
          <Badge variant="success" dot>온라인</Badge>
          <Badge variant="danger" dot>긴급</Badge>
          <Badge count={5} />
          <Badge count={120} maxCount={99} />
        </div>
      </div>
    ),
  },

  // 5. Avatar
  {
    key: "avatar",
    label: "Avatar",
    description: "사용자 프로필 이미지 또는 이니셜을 표시하는 아바타",
    category: "Primitives",
    href: "/design-system/primitives/avatar",
    preview: (
      <div className="flex items-center gap-2">
        <Avatar name="김준하" size="sm" />
        <Avatar name="이서연" size="md" />
        <Avatar name="박지민" size="lg" />
      </div>
    ),
    hoverDemo: (
      <div className="flex flex-col gap-3 w-full">
        <div className="flex items-end gap-2">
          <Avatar name="A" size="xs" />
          <Avatar name="김준하" size="sm" />
          <Avatar name="이서연" size="md" />
          <Avatar name="박지민" size="lg" />
          <Avatar name="최유진" size="xl" />
        </div>
        <Divider label="상태 표시" />
        <div className="flex items-center gap-2">
          <Avatar name="온라인" size="md" status="online" />
          <Avatar name="자리비움" size="md" status="away" />
          <Avatar name="바쁨" size="md" status="busy" />
          <Avatar name="오프라인" size="md" status="offline" />
        </div>
      </div>
    ),
  },

  // 6. Spinner
  {
    key: "spinner",
    label: "Spinner",
    description: "로딩 상태를 표시하는 회전 스피너 컴포넌트",
    category: "Primitives",
    href: "/design-system/primitives/spinner",
    preview: (
      <div className="flex items-center justify-center">
        <Spinner size="md" />
      </div>
    ),
    hoverDemo: (
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-end gap-4">
          <div className="flex flex-col items-center gap-1">
            <Spinner size="sm" />
            <span className="text-[10px] text-muted">SM</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Spinner size="md" />
            <span className="text-[10px] text-muted">MD</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Spinner size="lg" />
            <span className="text-[10px] text-muted">LG</span>
          </div>
        </div>
        <Divider label="색상" />
        <div className="flex items-center gap-4">
          <Spinner size="md" color="primary" />
          <Spinner size="md" color="muted" />
          <span className="bg-gray-800 rounded-lg p-2">
            <Spinner size="md" color="white" />
          </span>
        </div>
      </div>
    ),
  },

  // 7. Divider
  {
    key: "divider",
    label: "Divider",
    description: "콘텐츠를 구분하는 수평/수직 구분선",
    category: "Primitives",
    href: "/design-system/primitives/divider",
    preview: (
      <div className="w-full max-w-[180px]">
        <div className="text-xs text-muted mb-2">위 콘텐츠</div>
        <Divider />
        <div className="text-xs text-muted mt-2">아래 콘텐츠</div>
      </div>
    ),
    hoverDemo: (
      <div className="flex flex-col gap-4 w-full">
        <Divider />
        <Divider label="또는" />
        <Divider label="OR" />
        <div className="flex items-center gap-3 h-8">
          <span className="text-xs text-muted">항목 A</span>
          <Divider orientation="vertical" />
          <span className="text-xs text-muted">항목 B</span>
          <Divider orientation="vertical" />
          <span className="text-xs text-muted">항목 C</span>
        </div>
      </div>
    ),
  },

  // 8. Toggle
  {
    key: "toggle",
    label: "Toggle",
    description: "켜기/끄기 상태를 전환하는 토글 스위치",
    category: "Primitives",
    href: "/design-system/primitives/toggle",
    preview: (
      <div className="flex items-center gap-3">
        <Toggle checked={true} onChange={noop} />
        <Toggle checked={false} onChange={noop} />
      </div>
    ),
    hoverDemo: (
      <div className="flex flex-col gap-3 w-full">
        <Toggle checked={true} onChange={noop} label="알림 활성화" />
        <Toggle checked={false} onChange={noop} label="다크 모드" />
        <Toggle checked={true} onChange={noop} size="sm" label="작은 토글" />
        <Toggle checked={false} onChange={noop} disabled label="비활성화" />
      </div>
    ),
  },

  // 9. Checkbox
  {
    key: "checkbox",
    label: "Checkbox",
    description: "선택/해제 상태를 표시하는 체크박스 컴포넌트",
    category: "Primitives",
    href: "/design-system/primitives/checkbox",
    preview: (
      <div className="flex items-center gap-4">
        <Checkbox checked={true} onChange={noop} />
        <Checkbox checked={false} onChange={noop} />
      </div>
    ),
    hoverDemo: (
      <div className="flex flex-col gap-2.5 w-full">
        <Checkbox checked={true} onChange={noop} label="선택됨" />
        <Checkbox checked={false} onChange={noop} label="미선택" />
        <Checkbox indeterminate onChange={noop} label="부분 선택" />
        <Checkbox checked={false} onChange={noop} label="비활성화" disabled />
      </div>
    ),
  },

  // 10. Tag
  {
    key: "tag",
    label: "Tag",
    description: "분류, 키워드를 표시하는 태그/칩 컴포넌트",
    category: "Primitives",
    href: "/design-system/primitives/tag",
    preview: (
      <div className="flex flex-wrap gap-1.5">
        <Tag color="blue">프론트엔드</Tag>
        <Tag color="green">완료</Tag>
        <Tag color="red">긴급</Tag>
      </div>
    ),
    hoverDemo: (
      <div className="flex flex-col gap-3 w-full">
        <div className="flex flex-wrap gap-1.5">
          <Tag color="gray">Gray</Tag>
          <Tag color="primary">Primary</Tag>
          <Tag color="blue">Blue</Tag>
          <Tag color="green">Green</Tag>
          <Tag color="red">Red</Tag>
          <Tag color="orange">Orange</Tag>
          <Tag color="purple">Purple</Tag>
          <Tag color="teal">Teal</Tag>
        </div>
        <Divider label="닫기 가능" />
        <div className="flex flex-wrap gap-1.5">
          <Tag color="blue" closable onClose={noop}>React</Tag>
          <Tag color="green" closable onClose={noop}>Next.js</Tag>
          <Tag color="purple" closable onClose={noop}>TypeScript</Tag>
        </div>
      </div>
    ),
  },

  // 11. Switch
  {
    key: "switch",
    label: "Switch",
    description: "iOS 스타일의 둥근 온/오프 스위치 컴포넌트",
    category: "Primitives",
    href: "/design-system/primitives/switch",
    preview: (
      <div className="flex items-center gap-3">
        <Switch checked={true} onChange={noop} />
      </div>
    ),
    hoverDemo: (
      <div className="flex flex-col gap-3 w-full">
        <Switch checked={true} onChange={noop} size="sm" label="Small" />
        <Switch checked={true} onChange={noop} size="md" label="Medium" />
        <Switch checked={false} onChange={noop} size="lg" label="Large" />
      </div>
    ),
  },

  // 12. StarRating
  {
    key: "star-rating",
    label: "StarRating",
    description: "별 아이콘을 사용한 평점 입력 및 표시 컴포넌트",
    category: "Primitives",
    href: "/design-system/primitives/star-rating",
    preview: (
      <div className="flex items-center">
        <StarRating value={4} readonly />
      </div>
    ),
    hoverDemo: (
      <div className="flex flex-col gap-3 w-full">
        <div className="flex items-center gap-2">
          <StarRating value={5} size="sm" readonly />
          <span className="text-xs text-muted">5/5</span>
        </div>
        <div className="flex items-center gap-2">
          <StarRating value={3} size="md" readonly />
          <span className="text-xs text-muted">3/5</span>
        </div>
        <div className="flex items-center gap-2">
          <StarRating value={2} size="lg" readonly />
          <span className="text-xs text-muted">2/5</span>
        </div>
      </div>
    ),
  },

  // 13. Kbd
  {
    key: "kbd",
    label: "Kbd",
    description: "키보드 단축키를 시각적으로 표시하는 컴포넌트",
    category: "Primitives",
    href: "/design-system/primitives/kbd",
    preview: (
      <div className="flex items-center gap-1">
        <Kbd keys={["⌘", "K"]} />
      </div>
    ),
    hoverDemo: (
      <div className="flex flex-col gap-2.5 w-full">
        <div className="flex items-center gap-2">
          <Kbd keys={["⌘", "K"]} />
          <span className="text-xs text-muted">검색</span>
        </div>
        <div className="flex items-center gap-2">
          <Kbd keys={["⌘", "S"]} />
          <span className="text-xs text-muted">저장</span>
        </div>
        <div className="flex items-center gap-2">
          <Kbd keys={["⌘", "⇧", "P"]} />
          <span className="text-xs text-muted">명령 팔레트</span>
        </div>
        <div className="flex items-center gap-2">
          <Kbd keys={["Ctrl", "Z"]} />
          <span className="text-xs text-muted">실행 취소</span>
        </div>
        <div className="flex items-center gap-2">
          <Kbd>Esc</Kbd>
          <span className="text-xs text-muted">닫기</span>
        </div>
      </div>
    ),
  },

  // 14. StatusDot
  {
    key: "status-dot",
    label: "StatusDot",
    description: "온라인, 오프라인, 에러 등 상태를 점으로 표시",
    category: "Primitives",
    href: "/design-system/primitives/status-dot",
    preview: (
      <div className="flex items-center gap-3">
        <StatusDot status="success" />
        <StatusDot status="warning" />
        <StatusDot status="danger" />
        <StatusDot status="info" />
      </div>
    ),
    hoverDemo: (
      <div className="flex flex-col gap-2 w-full">
        <StatusDot status="success" label="온라인" />
        <StatusDot status="warning" label="자리비움" />
        <StatusDot status="danger" label="오프라인" />
        <StatusDot status="info" label="접속 중" />
        <StatusDot status="neutral" label="알 수 없음" />
        <StatusDot status="pulse" label="실시간" />
      </div>
    ),
  },

  // 15. Slider
  {
    key: "slider",
    label: "Slider",
    description: "드래그로 값을 선택할 수 있는 슬라이더 컴포넌트",
    category: "Primitives",
    href: "/design-system/primitives/slider",
    preview: (
      <div className="w-full max-w-[180px]">
        <Slider value={60} />
      </div>
    ),
    hoverDemo: (
      <div className="flex flex-col gap-4 w-full max-w-[260px]">
        <Slider value={30} showValue />
        <Slider value={60} showValue color="success" />
        <Slider value={85} showValue color="warning" />
        <Slider value={95} showValue color="danger" />
      </div>
    ),
  },

  // 16. Label
  {
    key: "label",
    label: "Label",
    description: "폼 필드에 사용하는 라벨 컴포넌트",
    category: "Primitives",
    href: "/design-system/primitives/label",
    preview: (
      <div className="flex items-center gap-2">
        <Label required>이름</Label>
      </div>
    ),
    hoverDemo: (
      <div className="flex flex-col gap-3 w-full max-w-[240px]">
        <div className="flex flex-col gap-1">
          <Label required>이메일 주소</Label>
          <Input placeholder="email@example.com" />
        </div>
        <div className="flex flex-col gap-1">
          <Label>닉네임 (선택)</Label>
          <Input placeholder="선택 사항" />
        </div>
      </div>
    ),
  },

  /* ================================================================ */
  /*  COMPOSITES                                                       */
  /* ================================================================ */

  // 17. Card
  {
    key: "card",
    label: "Card",
    description: "콘텐츠를 감싸는 카드 컨테이너 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/card",
    preview: (
      <Card className="w-full max-w-[200px]">
        <Card.Header>프로젝트</Card.Header>
        <Card.Body>
          <p className="text-xs text-muted">디자인 시스템 구축 진행 중</p>
        </Card.Body>
      </Card>
    ),
    hoverDemo: (
      <Card hoverable className="w-full max-w-[280px]">
        <Card.Header>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">프로젝트 현황</h3>
            <Badge variant="success" size="sm">진행 중</Badge>
          </div>
        </Card.Header>
        <Card.Body>
          <p className="text-xs text-muted mb-3">디자인 시스템 v2.0 개발이 진행되고 있습니다.</p>
          <ProgressBar value={68} showLabel size="sm" />
        </Card.Body>
        <Card.Footer>
          <div className="flex items-center justify-between">
            <div className="flex -space-x-1.5">
              <Avatar name="김준하" size="xs" />
              <Avatar name="이서연" size="xs" />
              <Avatar name="박지민" size="xs" />
            </div>
            <span className="text-[10px] text-muted">3명 참여</span>
          </div>
        </Card.Footer>
      </Card>
    ),
  },

  // 18. Alert
  {
    key: "alert",
    label: "Alert",
    description: "정보, 경고, 성공, 에러 알림을 표시하는 배너",
    category: "Composites",
    href: "/design-system/composites/alert",
    preview: (
      <div className="w-full max-w-[220px]">
        <Alert variant="info">업데이트가 있습니다.</Alert>
      </div>
    ),
    hoverDemo: (
      <div className="flex flex-col gap-2 w-full max-w-[300px]">
        <Alert variant="info" title="안내">새로운 기능이 추가되었습니다.</Alert>
        <Alert variant="success" title="완료">저장이 완료되었습니다.</Alert>
        <Alert variant="warning" title="주의">배포 전 확인하세요.</Alert>
        <Alert variant="danger" title="오류">서버 연결이 끊어졌습니다.</Alert>
      </div>
    ),
  },

  // 19. Skeleton
  {
    key: "skeleton",
    label: "Skeleton",
    description: "콘텐츠 로딩 상태를 표시하는 스켈레톤 UI",
    category: "Composites",
    href: "/design-system/composites/skeleton",
    preview: (
      <div className="w-full max-w-[180px]">
        <Skeleton variant="text" lines={3} />
      </div>
    ),
    hoverDemo: (
      <div className="w-full max-w-[260px] space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton variant="circle" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
        <Skeleton variant="rect" width="100%" height={80} />
        <Skeleton variant="text" lines={2} />
      </div>
    ),
  },

  // 20. ProgressBar
  {
    key: "progress-bar",
    label: "ProgressBar",
    description: "작업 진행 상태를 시각적으로 보여주는 바",
    category: "Composites",
    href: "/design-system/composites/progress",
    preview: (
      <div className="w-full max-w-[180px]">
        <ProgressBar value={65} />
      </div>
    ),
    hoverDemo: (
      <div className="flex flex-col gap-3 w-full max-w-[280px]">
        <ProgressBar value={25} showLabel label="업로드" variant="default" />
        <ProgressBar value={50} showLabel label="빌드" variant="success" />
        <ProgressBar value={75} showLabel label="테스트" variant="warning" />
        <ProgressBar value={90} showLabel label="배포" variant="danger" size="lg" />
      </div>
    ),
  },

  // 21. Tabs
  {
    key: "tabs",
    label: "Tabs",
    description: "콘텐츠를 탭으로 전환하는 탭 네비게이션 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/tabs",
    preview: (
      <Tabs
        tabs={[
          { value: "all", label: "전체" },
          { value: "mine", label: "내 업무" },
          { value: "done", label: "완료" },
        ]}
        value="all"
        onChange={noop}
        size="sm"
      />
    ),
    hoverDemo: (
      <div className="flex flex-col gap-4 w-full">
        <Tabs
          tabs={[
            { value: "all", label: "전체", badge: 12 },
            { value: "mine", label: "내 업무", badge: 3 },
            { value: "done", label: "완료" },
          ]}
          value="all"
          onChange={noop}
          size="sm"
        />
        <Tabs
          variant="pills"
          tabs={[
            { value: "a", label: "개요" },
            { value: "b", label: "분석" },
            { value: "c", label: "설정" },
          ]}
          value="a"
          onChange={noop}
          size="sm"
        />
        <Tabs
          variant="segment"
          tabs={[
            { value: "d", label: "일간" },
            { value: "e", label: "주간" },
            { value: "f", label: "월간" },
          ]}
          value="d"
          onChange={noop}
          size="sm"
        />
      </div>
    ),
  },

  // 22. Accordion
  {
    key: "accordion",
    label: "Accordion",
    description: "접었다 펼 수 있는 아코디언 패널 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/accordion",
    preview: (
      <div className="w-full max-w-[220px]">
        <Accordion
          items={[
            { key: "1", title: "결제 방법은?", content: <p className="text-xs text-muted">카드, 계좌이체 가능</p> },
            { key: "2", title: "환불 정책", content: <p className="text-xs text-muted">7일 이내 전액 환불</p> },
          ]}
        />
      </div>
    ),
    hoverDemo: (
      <div className="w-full max-w-[300px]">
        <Accordion
          items={[
            { key: "1", title: "배송은 얼마나 걸리나요?", content: <p className="text-xs text-muted">보통 2~3일 소요됩니다.</p>, defaultOpen: true },
            { key: "2", title: "교환/반품은 어떻게 하나요?", content: <p className="text-xs text-muted">마이페이지에서 신청하세요.</p> },
            { key: "3", title: "해외 배송이 가능한가요?", content: <p className="text-xs text-muted">현재 국내만 가능합니다.</p> },
          ]}
          single
        />
      </div>
    ),
  },

  // 23. Breadcrumb
  {
    key: "breadcrumb",
    label: "Breadcrumb",
    description: "현재 위치를 계층적으로 표시하는 네비게이션",
    category: "Composites",
    href: "/design-system/composites/breadcrumb",
    preview: (
      <Breadcrumb
        items={[
          { label: "홈", href: "#" },
          { label: "프로젝트", href: "#" },
          { label: "설정" },
        ]}
      />
    ),
    hoverDemo: (
      <div className="flex flex-col gap-3 w-full">
        <Breadcrumb
          items={[
            { label: "홈", href: "#" },
            { label: "프로젝트", href: "#" },
            { label: "디자인 시스템", href: "#" },
            { label: "컴포넌트", href: "#" },
            { label: "Breadcrumb" },
          ]}
        />
      </div>
    ),
  },

  // 24. Pagination
  {
    key: "pagination",
    label: "Pagination",
    description: "페이지 간 이동을 위한 페이지네이션 컨트롤",
    category: "Composites",
    href: "/design-system/composites/pagination",
    preview: (
      <Pagination page={1} totalPages={10} onChange={noop} />
    ),
    hoverDemo: (
      <div className="flex flex-col gap-3 w-full items-center">
        <Pagination page={1} totalPages={10} onChange={noop} />
        <Pagination page={5} totalPages={10} onChange={noop} />
        <Pagination page={10} totalPages={10} onChange={noop} />
      </div>
    ),
  },

  // 25. Timeline
  {
    key: "timeline",
    label: "Timeline",
    description: "시간순으로 이벤트를 표시하는 타임라인 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/timeline",
    preview: (
      <Timeline
        items={[
          { key: "1", title: "생성됨", time: "09:00", color: "primary" },
          { key: "2", title: "진행 중", time: "10:30", color: "success" },
          { key: "3", title: "완료", time: "14:00", color: "neutral" },
        ]}
      />
    ),
    hoverDemo: (
      <Timeline
        items={[
          { key: "1", title: "업무 생성", description: "새 업무가 등록되었습니다", time: "09:00", color: "primary" },
          { key: "2", title: "담당자 배정", description: "김준하에게 배정", time: "09:30", color: "primary" },
          { key: "3", title: "진행 시작", description: "개발 착수", time: "10:00", color: "success" },
          { key: "4", title: "리뷰 요청", description: "코드 리뷰를 요청했습니다", time: "15:00", color: "warning" },
          { key: "5", title: "배포 완료", time: "17:00", color: "success" },
        ]}
      />
    ),
  },

  // 26. Stepper
  {
    key: "stepper",
    label: "Stepper",
    description: "단계별 진행 상태를 표시하는 스텝퍼 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/stepper",
    preview: (
      <div className="w-full max-w-[220px]">
        <Stepper
          steps={[
            { key: "1", title: "정보" },
            { key: "2", title: "확인" },
            { key: "3", title: "완료" },
          ]}
          current={1}
        />
      </div>
    ),
    hoverDemo: (
      <div className="w-full max-w-[320px]">
        <Stepper
          steps={[
            { key: "1", title: "기본 정보", description: "이름, 이메일" },
            { key: "2", title: "상세 설정", description: "알림, 권한" },
            { key: "3", title: "검토", description: "최종 확인" },
            { key: "4", title: "완료", description: "가입 완료" },
          ]}
          current={2}
        />
      </div>
    ),
  },

  // 27. Tooltip
  {
    key: "tooltip",
    label: "Tooltip",
    description: "호버 시 추가 정보를 표시하는 툴팁 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/tooltip",
    preview: (
      <div className="relative inline-flex flex-col items-center">
        <div className="px-2.5 py-1.5 text-xs text-white bg-gray-800 rounded-lg shadow-lg whitespace-nowrap mb-2">
          저장합니다
        </div>
        <Button size="sm" variant="secondary">Hover me</Button>
      </div>
    ),
    hoverDemo: (
      <div className="flex flex-col gap-4 items-center w-full">
        <Tooltip content="위쪽 툴팁" position="top">
          <Button size="sm" variant="outline">Top</Button>
        </Tooltip>
        <div className="flex items-center gap-6">
          <Tooltip content="왼쪽" position="left">
            <Button size="sm" variant="outline">Left</Button>
          </Tooltip>
          <Tooltip content="오른쪽" position="right">
            <Button size="sm" variant="outline">Right</Button>
          </Tooltip>
        </div>
        <Tooltip content="아래쪽 툴팁" position="bottom">
          <Button size="sm" variant="outline">Bottom</Button>
        </Tooltip>
      </div>
    ),
  },

  // 28. EmptyState
  {
    key: "empty-state",
    label: "EmptyState",
    description: "데이터가 없을 때 빈 상태를 표시하는 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/empty-state",
    preview: (
      <EmptyState title="데이터 없음" className="py-4" />
    ),
    hoverDemo: (
      <EmptyState
        title="업무가 없습니다"
        description="새로운 업무를 추가하여 프로젝트를 시작해보세요."
        action={<Button size="sm">업무 추가</Button>}
        className="py-6"
      />
    ),
  },

  // 29. StatCard
  {
    key: "stat-card",
    label: "StatCard",
    description: "핵심 수치를 한눈에 보여주는 통계 카드",
    category: "Composites",
    href: "/design-system/composites/stat-card",
    preview: (
      <StatCard label="총 사용자" value="1,234" className="max-w-[180px]" />
    ),
    hoverDemo: (
      <div className="grid grid-cols-2 gap-2 w-full max-w-[320px]">
        <StatCard label="총 사용자" value="1,234" change="+12%" trend="up" />
        <StatCard label="매출" value="₩3.2M" change="-5%" trend="down" />
        <StatCard label="전환율" value="3.8%" change="+0.2%" trend="up" />
        <StatCard label="이탈률" value="24%" trend="neutral" change="0%" />
      </div>
    ),
  },

  // 30. Table
  {
    key: "table",
    label: "Table",
    description: "데이터를 행과 열로 표시하는 기본 테이블",
    category: "Composites",
    href: "/design-system/composites/table",
    preview: (
      <div className="w-full max-w-[220px]">
        <Table
          columns={[
            { key: "name", header: "이름" },
            { key: "role", header: "역할" },
          ]}
          data={[
            { name: "김준하", role: "개발" },
            { name: "이서연", role: "디자인" },
            { name: "박지민", role: "기획" },
          ]}
          size="sm"
        />
      </div>
    ),
    hoverDemo: (
      <div className="w-full max-w-[340px]">
        <Table
          columns={[
            { key: "name", header: "이름" },
            { key: "role", header: "역할" },
            { key: "status", header: "상태", render: (v: string) => <Badge variant={v === "활성" ? "success" : "default"} size="sm">{v}</Badge> },
          ]}
          data={[
            { name: "김준하", role: "프론트엔드", status: "활성" },
            { name: "이서연", role: "디자이너", status: "활성" },
            { name: "박지민", role: "PM", status: "비활성" },
            { name: "최유진", role: "백엔드", status: "활성" },
          ]}
          striped
          hoverable
          size="sm"
        />
      </div>
    ),
  },

  /* ================================================================ */
  /*  PATTERNS                                                         */
  /* ================================================================ */

  // 31. DataTable
  {
    key: "data-table",
    label: "DataTable",
    description: "정렬, 페이지네이션을 지원하는 고급 데이터 테이블",
    category: "Patterns",
    href: "/design-system/patterns/data-table",
    preview: (
      <div className="w-full max-w-[220px]">
        <Table
          columns={[
            { key: "id", header: "#" },
            { key: "name", header: "항목" },
            { key: "value", header: "값" },
          ]}
          data={[
            { id: 1, name: "매출", value: "₩12M" },
            { id: 2, name: "비용", value: "₩8M" },
            { id: 3, name: "이익", value: "₩4M" },
          ]}
          size="sm"
        />
      </div>
    ),
    hoverDemo: (
      <div className="w-full max-w-[360px]">
        <DataTable
          columns={[
            { key: "id", header: "ID", render: (row) => <span className="text-muted">#{row.id}</span>, sortable: true, width: "50px" },
            { key: "name", header: "이름", render: (row) => <span className="font-medium">{row.name}</span>, sortable: true },
            { key: "status", header: "상태", render: (row) => <Badge variant={row.active ? "success" : "default"} size="sm">{row.active ? "활성" : "비활성"}</Badge> },
          ]}
          data={[
            { id: 1, name: "프로젝트 A", active: true },
            { id: 2, name: "프로젝트 B", active: false },
            { id: 3, name: "프로젝트 C", active: true },
            { id: 4, name: "프로젝트 D", active: true },
            { id: 5, name: "프로젝트 E", active: false },
            { id: 6, name: "프로젝트 F", active: true },
          ]}
          rowKey={(row) => String(row.id)}
          pageSize={4}
          striped
        />
      </div>
    ),
  },

  // 32. Calendar
  {
    key: "calendar",
    label: "Calendar",
    description: "월간 달력을 표시하고 날짜를 선택하는 캘린더",
    category: "Patterns",
    href: "/design-system/patterns/calendar",
    preview: (
      <div className="w-full max-w-[220px]">
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {["일","월","화","수","목","금","토"].map((d) => (
            <span key={d} className="text-[9px] font-medium text-muted py-0.5">{d}</span>
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <span
              key={i}
              className={`text-[10px] w-5 h-5 flex items-center justify-center rounded-full mx-auto ${i === 3 ? "bg-primary text-white" : "text-foreground"}`}
            >
              {i + 14}
            </span>
          ))}
        </div>
      </div>
    ),
    hoverDemo: (
      <div className="w-full max-w-[320px]">
        <DsCalendar
          events={[
            { id: "1", date: new Date().toISOString().slice(0, 10), label: "오늘 일정", color: "bg-primary" },
          ]}
        />
      </div>
    ),
  },

  // 33. CommandPalette
  {
    key: "command-palette",
    label: "CommandPalette",
    description: "검색 및 명령어를 실행하는 커맨드 팔레트",
    category: "Patterns",
    href: "/design-system/patterns/command-palette",
    preview: (
      <div className="w-full max-w-[200px]">
        <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-white">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-xs text-muted-light">검색...</span>
          <Kbd keys={["⌘", "K"]} />
        </div>
      </div>
    ),
    hoverDemo: (
      <div className="w-full max-w-[320px] border border-border rounded-xl bg-white shadow-lg overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none" className="text-muted shrink-0">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-sm text-foreground">설정</span>
        </div>
        <div className="py-1">
          {[
            { label: "일반 설정", desc: "언어, 테마 등" },
            { label: "알림 설정", desc: "이메일, 푸시 알림" },
            { label: "보안 설정", desc: "비밀번호, 2FA" },
          ].map((item, i) => (
            <div
              key={item.label}
              className={`px-4 py-2 flex items-center justify-between text-sm cursor-pointer ${i === 0 ? "bg-primary-light" : "hover:bg-gray-50"}`}
            >
              <div>
                <div className={`font-medium ${i === 0 ? "text-primary" : "text-foreground"}`}>{item.label}</div>
                <div className="text-[10px] text-muted">{item.desc}</div>
              </div>
              {i === 0 && <span className="text-[10px] text-primary">Enter</span>}
            </div>
          ))}
        </div>
      </div>
    ),
  },

  // 34. FlowDiagram
  {
    key: "flow-diagram",
    label: "FlowDiagram",
    description: "노드와 연결선으로 흐름을 시각화하는 다이어그램",
    category: "Patterns",
    href: "/design-system/patterns/flow-diagram",
    preview: (
      <div className="w-full max-w-[200px] flex items-center justify-center gap-1">
        {["시작", "처리", "완료"].map((label, i) => (
          <div key={label} className="flex items-center gap-1">
            <div className={`px-2 py-1 text-[10px] font-medium rounded border ${i === 0 ? "bg-blue-50 text-blue-700 border-blue-200" : i === 1 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
              {label}
            </div>
            {i < 2 && (
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="text-muted shrink-0">
                <path d="M0 4h8M8 4l-3-3M8 4l-3 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
            )}
          </div>
        ))}
      </div>
    ),
    hoverDemo: (
      <div className="w-full h-[200px]">
        <FlowDiagram
          nodes={[
            { id: "1", title: "데이터 수집", x: 20, y: 20, variant: "info", width: 120 },
            { id: "2", title: "데이터 처리", x: 200, y: 20, variant: "warning", width: 120 },
            { id: "3", title: "검증", x: 20, y: 110, variant: "danger", width: 120 },
            { id: "4", title: "저장 완료", x: 200, y: 110, variant: "success", width: 120 },
          ]}
          connections={[
            { id: "c1", from: "1", to: "2" },
            { id: "c2", from: "2", to: "4" },
            { id: "c3", from: "1", to: "3" },
            { id: "c4", from: "3", to: "4" },
          ]}
          readonly
          showGrid
        />
      </div>
    ),
  },
];
