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

// Additional primitive imports
import { IconButton } from "@/ds/primitives/IconButton";
import { NumberInput } from "@/ds/primitives/NumberInput";
import { RadioGroup } from "@/ds/primitives/Radio";
import { FileUpload } from "@/ds/primitives/FileUpload";
import { CopyButton } from "@/ds/primitives/CopyButton";
import { AspectRatio } from "@/ds/primitives/AspectRatio";
import { ScrollArea } from "@/ds/primitives/ScrollArea";
import { BatteryIndicator } from "@/ds/primitives/BatteryIndicator";
import { SeverityBadge } from "@/ds/primitives/SeverityBadge";
import { PasswordInput } from "@/ds/primitives/PasswordInput";
import { PinInput } from "@/ds/primitives/PinInput";

// Additional composite imports
import { Select } from "@/ds/composites/Select";
import { MultiSelect } from "@/ds/composites/MultiSelect";
import { ButtonGroup } from "@/ds/composites/ButtonGroup";
import { AvatarStack } from "@/ds/composites/AvatarStack";
import { Collapsible } from "@/ds/composites/Collapsible";
import { SegmentedControl } from "@/ds/composites/SegmentedControl";
import { Resizable } from "@/ds/composites/Resizable";
import { TreeView } from "@/ds/composites/TreeView";
import { Transfer } from "@/ds/composites/Transfer";
import { Descriptions } from "@/ds/composites/Descriptions";
import { ColorPicker } from "@/ds/composites/ColorPicker";
import { TimePicker } from "@/ds/composites/TimePicker";
import { DateInput } from "@/ds/composites/DateInput";
import { Result } from "@/ds/composites/Result";
import { Watermark } from "@/ds/composites/Watermark";
import { ComparisonGrid } from "@/ds/composites/ComparisonGrid";
import { FilterButtonGroup } from "@/ds/composites/FilterButtonGroup";
import { KeyValueGrid } from "@/ds/composites/KeyValueGrid";
import { CollectionView } from "@/ds/composites/CollectionView";
import { SecurityBadge } from "@/ds/composites/SecurityBadge";
import { TrustIndicator } from "@/ds/composites/TrustIndicator";

// Additional pattern imports
import { FilterBar } from "@/ds/patterns/FilterBar";
import { Kanban } from "@/ds/patterns/Kanban";
import { StatsGrid } from "@/ds/patterns/StatsGrid";
import { FormBuilder } from "@/ds/patterns/FormBuilder";
import { InfiniteList } from "@/ds/patterns/InfiniteList";
import { VirtualList } from "@/ds/patterns/VirtualList";
import { ChartCard } from "@/ds/patterns/ChartCard";
import { NotificationCenter } from "@/ds/patterns/NotificationCenter";
import { SortableList } from "@/ds/patterns/SortableList";
import { RichTextEditor } from "@/ds/patterns/RichTextEditor";
import { SecurityChecklist } from "@/ds/patterns/SecurityChecklist";
import { LoginForm } from "@/ds/patterns/LoginForm";

/* ------------------------------------------------------------------ */
/*  Live demo components (auto-playing interactive demos)              */
/* ------------------------------------------------------------------ */
import { AutoPlayDemo } from "@/ds/composites/AutoPlayDemo";

import {
  ButtonLiveDemo,
  ToggleLiveDemo,
  SwitchLiveDemo,
  CheckboxLiveDemo,
  ProgressBarLiveDemo,
  StarRatingLiveDemo,
  SpinnerLiveDemo,
  AlertLiveDemo,
  BadgeLiveDemo,
  TabsLiveDemo,
  AccordionLiveDemo,
  StepperLiveDemo,
  PaginationLiveDemo,
  SkeletonLiveDemo,
  TooltipLiveDemo,
  TimelineLiveDemo,
  SliderLiveDemo,
  InputLiveDemo,
  CardLiveDemo,
  StatusDotLiveDemo,
  EmptyStateLiveDemo,
  StatCardLiveDemo,
  FlowDiagramLiveDemo,
  SelectLiveDemo,
  ModalLiveDemo,
  ToastLiveDemo,
  DropdownLiveDemo,
  DrawerLiveDemo,
  ConfirmDialogLiveDemo,
  CarouselLiveDemo,
  TreeViewLiveDemo,
  NavigationMenuLiveDemo,
  SegmentedControlLiveDemo,
  CalendarLiveDemo,
} from "./live-demos";

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
    hoverDemo: <ButtonLiveDemo />,
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
    hoverDemo: <InputLiveDemo />,
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
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="w-full max-w-[200px]"><Textarea placeholder="설명을 입력하세요..." rows={2} /></div>,
        <div key="2" className="w-full max-w-[200px]"><Textarea placeholder="피드백을 남겨주세요..." rows={3} /></div>,
        <div key="3" className="w-full max-w-[200px]"><Textarea placeholder="비활성 상태" rows={2} disabled /></div>,
      ]} />
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
    hoverDemo: <BadgeLiveDemo />,
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
      <AutoPlayDemo interval={1000} transition="scale" frames={[
        <Avatar key="xs" size="xs" />,
        <Avatar key="sm" size="sm" />,
        <Avatar key="md" size="md" />,
        <Avatar key="lg" size="lg" />,
        <Avatar key="xl" size="xl" />,
      ]} />
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
    hoverDemo: <SpinnerLiveDemo />,
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
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="w-full max-w-[200px] space-y-2"><div className="text-xs">위 콘텐츠</div><Divider /><div className="text-xs">아래 콘텐츠</div></div>,
        <div key="2" className="w-full max-w-[200px] space-y-2"><div className="text-xs">섹션 A</div><Divider label="구분" /><div className="text-xs">섹션 B</div></div>,
        <div key="3" className="w-full max-w-[200px] space-y-2"><div className="text-xs">항목 1</div><Divider label="OR" /><div className="text-xs">항목 2</div></div>,
      ]} />
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
    hoverDemo: <ToggleLiveDemo />,
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
    hoverDemo: <CheckboxLiveDemo />,
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
      <AutoPlayDemo interval={1000} transition="slide-up" frames={[
        <Tag key="1" color="primary">React</Tag>,
        <Tag key="2" color="green">완료</Tag>,
        <Tag key="3" color="red">긴급</Tag>,
        <Tag key="4" color="orange">대기</Tag>,
        <Tag key="5" color="purple">TypeScript</Tag>,
      ]} />
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
    hoverDemo: <SwitchLiveDemo />,
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
    hoverDemo: <StarRatingLiveDemo />,
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
      <AutoPlayDemo interval={1200} transition="fade" frames={[
        <div key="1" className="flex items-center gap-2"><Kbd keys={["⌘", "K"]} /><span className="text-xs text-muted">검색</span></div>,
        <div key="2" className="flex items-center gap-2"><Kbd keys={["⌘", "S"]} /><span className="text-xs text-muted">저장</span></div>,
        <div key="3" className="flex items-center gap-2"><Kbd keys={["⌘", "⇧", "P"]} /><span className="text-xs text-muted">명령 팔레트</span></div>,
        <div key="4" className="flex items-center gap-2"><Kbd keys={["Ctrl", "Z"]} /><span className="text-xs text-muted">실행 취소</span></div>,
      ]} />
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
    hoverDemo: <StatusDotLiveDemo />,
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
    hoverDemo: <SliderLiveDemo />,
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
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="flex flex-col gap-1 w-full max-w-[200px]"><Label required>이메일 주소</Label><Input placeholder="email@example.com" /></div>,
        <div key="2" className="flex flex-col gap-1 w-full max-w-[200px]"><Label>닉네임 (선택)</Label><Input placeholder="선택 사항" /></div>,
        <div key="3" className="flex flex-col gap-1 w-full max-w-[200px]"><Label required>비밀번호</Label><Input placeholder="••••••••" type="password" /></div>,
      ]} />
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
    hoverDemo: <CardLiveDemo />,
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
    hoverDemo: <AlertLiveDemo />,
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
    hoverDemo: <SkeletonLiveDemo />,
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
    hoverDemo: <ProgressBarLiveDemo />,
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
    hoverDemo: <TabsLiveDemo />,
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
    hoverDemo: <AccordionLiveDemo />,
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
          { label: "홈", href: undefined },
          { label: "프로젝트", href: undefined },
          { label: "설정" },
        ]}
      />
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <Breadcrumb key="1" items={[{ label: "홈", href: undefined }, { label: "프로젝트" }]} />,
        <Breadcrumb key="2" items={[{ label: "홈", href: undefined }, { label: "프로젝트", href: undefined }, { label: "설정" }]} />,
        <Breadcrumb key="3" items={[{ label: "홈", href: undefined }, { label: "프로젝트", href: undefined }, { label: "디자인 시스템", href: undefined }, { label: "컴포넌트" }]} />,
      ]} />
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
    hoverDemo: <PaginationLiveDemo />,
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
    hoverDemo: <TimelineLiveDemo />,
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
    hoverDemo: <StepperLiveDemo />,
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
    hoverDemo: <TooltipLiveDemo />,
  },

  // 28. EmptyState
  {
    key: "empty-state",
    label: "EmptyState",
    description: "데이터가 없을 때 빈 상태를 표시하는 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/empty-state",
    preview: (
      <div className="flex flex-col items-center gap-1 text-center">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-muted text-sm">∅</div>
        <span className="text-xs font-medium text-foreground">업무가 없습니다</span>
        <span className="text-[10px] text-muted">새로운 업무를 추가하세요</span>
      </div>
    ),
    hoverDemo: <EmptyStateLiveDemo />,
  },

  // 29. StatCard
  {
    key: "stat-card",
    label: "StatCard",
    description: "핵심 수치를 한눈에 보여주는 통계 카드",
    category: "Composites",
    href: "/design-system/composites/stat-card",
    preview: (
      <div className="bg-card border border-border rounded-xl p-3 w-full max-w-[160px]">
        <div className="text-[10px] text-muted mb-1">총 사용자</div>
        <div className="text-xl font-bold text-foreground">1,234</div>
        <div className="text-[10px] text-success mt-0.5">↑ +12%</div>
      </div>
    ),
    hoverDemo: <StatCardLiveDemo />,
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
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="w-full max-w-[280px]"><Table columns={[{ key: "name", header: "이름" }, { key: "role", header: "역할" }]} data={[{ name: "김준하", role: "프론트엔드" }, { name: "이서연", role: "디자이너" }]} size="sm" /></div>,
        <div key="2" className="w-full max-w-[280px]"><Table columns={[{ key: "name", header: "이름" }, { key: "role", header: "역할" }]} data={[{ name: "김준하", role: "프론트엔드" }, { name: "이서연", role: "디자이너" }, { name: "박지민", role: "PM" }]} striped size="sm" /></div>,
      ]} />
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
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="w-full max-w-[300px]"><DataTable columns={[{ key: "id", header: "ID", render: (row) => <span className="text-muted">#{row.id}</span>, width: "50px" }, { key: "name", header: "이름", render: (row) => <span className="font-medium">{row.name}</span> }]} data={[{ id: 1, name: "프로젝트 A" }, { id: 2, name: "프로젝트 B" }, { id: 3, name: "프로젝트 C" }]} rowKey={(row) => String(row.id)} pageSize={3} /></div>,
        <div key="2" className="w-full max-w-[300px]"><DataTable columns={[{ key: "id", header: "ID", render: (row) => <span className="text-muted">#{row.id}</span>, width: "50px" }, { key: "name", header: "이름", render: (row) => <span className="font-medium">{row.name}</span> }]} data={[{ id: 4, name: "프로젝트 D" }, { id: 5, name: "프로젝트 E" }, { id: 6, name: "프로젝트 F" }]} rowKey={(row) => String(row.id)} pageSize={3} striped /></div>,
      ]} />
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
    hoverDemo: <CalendarLiveDemo />,
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
      <AutoPlayDemo interval={1500} transition="slide-up" frames={[
        <div key="1" className="w-full max-w-[260px] border border-border rounded-xl bg-white shadow-lg overflow-hidden"><div className="flex items-center gap-2 px-3 py-2 border-b border-border"><span className="text-xs text-foreground">설정</span></div><div className="py-1"><div className="px-3 py-1.5 text-xs bg-primary-light text-primary font-medium">일반 설정</div><div className="px-3 py-1.5 text-xs text-foreground">알림 설정</div></div></div>,
        <div key="2" className="w-full max-w-[260px] border border-border rounded-xl bg-white shadow-lg overflow-hidden"><div className="flex items-center gap-2 px-3 py-2 border-b border-border"><span className="text-xs text-foreground">파일</span></div><div className="py-1"><div className="px-3 py-1.5 text-xs bg-primary-light text-primary font-medium">새 파일</div><div className="px-3 py-1.5 text-xs text-foreground">열기</div></div></div>,
        <div key="3" className="w-full max-w-[260px] border border-border rounded-xl bg-white shadow-lg overflow-hidden"><div className="flex items-center gap-2 px-3 py-2 border-b border-border"><span className="text-xs text-foreground">검색...</span></div><div className="py-1"><div className="px-3 py-1.5 text-xs bg-primary-light text-primary font-medium">컴포넌트 검색</div><div className="px-3 py-1.5 text-xs text-foreground">페이지 이동</div></div></div>,
      ]} />
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
      <div className="flex items-center gap-3">
        <div className="w-14 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-[9px] font-bold text-blue-600">시작</div>
        <svg width="20" height="10" viewBox="0 0 20 10"><path d="M0 5h14M14 5l-4-4M14 5l-4 4" stroke="#6b7280" strokeWidth="1.5" fill="none" /></svg>
        <div className="w-14 h-8 rounded-lg bg-green-500/20 border border-green-500/40 flex items-center justify-center text-[9px] font-bold text-green-600">처리</div>
        <svg width="20" height="10" viewBox="0 0 20 10"><path d="M0 5h14M14 5l-4-4M14 5l-4 4" stroke="#6b7280" strokeWidth="1.5" fill="none" /></svg>
        <div className="w-14 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[9px] font-bold text-amber-600">완료</div>
      </div>
    ),
    hoverDemo: <FlowDiagramLiveDemo />,
  },

  /* ================================================================ */
  /*  MISSING PRIMITIVES                                               */
  /* ================================================================ */

  // 35. IconButton
  {
    key: "icon-button",
    label: "IconButton",
    description: "아이콘만 표시하는 컴팩트한 버튼 컴포넌트",
    category: "Primitives",
    href: "/design-system/primitives/icon-button",
    preview: (
      <div className="flex items-center gap-2">
        <IconButton icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>} label="추가" variant="filled" />
        <IconButton icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6.5 7v4M9.5 7v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>} label="삭제" variant="outline" />
        <IconButton icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11.5 2.5l2 2M7 7l5-5M3 13h2l8-8-2-2-8 8v2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>} label="편집" variant="ghost" />
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1000} transition="scale" frames={[
        <IconButton key="ghost" icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>} label="Ghost" variant="ghost" />,
        <IconButton key="outline" icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>} label="Outline" variant="outline" />,
        <IconButton key="filled" icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>} label="Filled" variant="filled" />,
      ]} />
    ),
  },

  // 36. NumberInput
  {
    key: "number-input",
    label: "NumberInput",
    description: "증감 버튼이 포함된 숫자 입력 필드",
    category: "Primitives",
    href: "/design-system/primitives/number-input",
    preview: (
      <NumberInput value={42} onChange={noop} />
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="w-full max-w-[200px]"><Label>수량</Label><NumberInput value={5} onChange={noop} min={0} max={100} step={1} /></div>,
        <div key="2" className="w-full max-w-[200px]"><Label>가격 (원)</Label><NumberInput value={10000} onChange={noop} min={0} max={1000000} step={1000} /></div>,
        <div key="3" className="w-full max-w-[200px]"><Label>온도 (°C)</Label><NumberInput value={22} onChange={noop} min={-10} max={50} step={1} /></div>,
      ]} />
    ),
  },

  // 37. Radio
  {
    key: "radio",
    label: "Radio",
    description: "단일 선택을 위한 라디오 버튼 그룹",
    category: "Primitives",
    href: "/design-system/primitives/radio",
    preview: (
      <RadioGroup
        name="preview-radio"
        options={[
          { value: "a", label: "옵션 A" },
          { value: "b", label: "옵션 B" },
        ]}
        value="a"
        onChange={noop}
        direction="horizontal"
      />
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1"><Label>우선순위</Label><RadioGroup name="demo-radio-1" options={[{ value: "high", label: "높음" }, { value: "medium", label: "중간" }, { value: "low", label: "낮음" }]} value="high" onChange={noop} /></div>,
        <div key="2"><Label>우선순위</Label><RadioGroup name="demo-radio-2" options={[{ value: "high", label: "높음" }, { value: "medium", label: "중간" }, { value: "low", label: "낮음" }]} value="medium" onChange={noop} /></div>,
        <div key="3"><Label>우선순위</Label><RadioGroup name="demo-radio-3" options={[{ value: "high", label: "높음" }, { value: "medium", label: "중간" }, { value: "low", label: "낮음" }]} value="low" onChange={noop} /></div>,
      ]} />
    ),
  },

  // 38. FileUpload
  {
    key: "file-upload",
    label: "FileUpload",
    description: "드래그 앤 드롭 파일 업로드 컴포넌트",
    category: "Primitives",
    href: "/design-system/primitives/file-upload",
    preview: (
      <div className="w-full max-w-[220px]">
        <FileUpload onFiles={noop} description="파일을 드래그하세요" className="[&>div]:p-4" />
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="w-full max-w-[240px]"><FileUpload onFiles={noop} description="파일을 드래그하세요" className="[&>div]:p-4" /></div>,
        <div key="2" className="w-full max-w-[240px]"><FileUpload onFiles={noop} accept="image/*" description="이미지를 업로드하세요" className="[&>div]:p-4" /></div>,
        <div key="3" className="w-full max-w-[240px]"><FileUpload onFiles={noop} accept=".pdf" description="PDF만 업로드 가능" className="[&>div]:p-4" /></div>,
      ]} />
    ),
  },

  // 39. CopyButton
  {
    key: "copy-button",
    label: "CopyButton",
    description: "클립보드에 텍스트를 복사하는 버튼",
    category: "Primitives",
    href: "/design-system/primitives/copy-button",
    preview: (
      <div className="flex items-center gap-2">
        <CopyButton text="복사할 텍스트" variant="button" label="복사" />
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-border max-w-[220px]"><code className="text-xs flex-1 text-foreground">npm install junds</code><CopyButton text="npm install junds" size="sm" /></div>,
        <CopyButton key="2" text="API_KEY_12345" variant="button" label="API 키 복사" />,
        <div key="3" className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-border max-w-[220px]"><code className="text-xs flex-1 text-foreground">yarn add junds</code><CopyButton text="yarn add junds" size="sm" /></div>,
      ]} />
    ),
  },

  // 40. AspectRatio
  {
    key: "aspect-ratio",
    label: "AspectRatio",
    description: "자식 요소의 종횡비를 유지하는 컨테이너",
    category: "Primitives",
    href: "/design-system/primitives/aspect-ratio",
    preview: (
      <div className="w-full max-w-[160px]">
        <AspectRatio ratio={16 / 9}>
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
            <span className="text-[10px] font-medium text-blue-600">16:9</span>
          </div>
        </AspectRatio>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="scale" frames={[
        <div key="1" className="w-full max-w-[160px]"><AspectRatio ratio={1}><div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center"><span className="text-[10px] font-medium text-purple-600">1:1</span></div></AspectRatio></div>,
        <div key="2" className="w-full max-w-[160px]"><AspectRatio ratio={4 / 3}><div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center"><span className="text-[10px] font-medium text-green-600">4:3</span></div></AspectRatio></div>,
        <div key="3" className="w-full max-w-[160px]"><AspectRatio ratio={16 / 9}><div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center"><span className="text-[10px] font-medium text-blue-600">16:9</span></div></AspectRatio></div>,
      ]} />
    ),
  },

  // 41. ScrollArea
  {
    key: "scroll-area",
    label: "ScrollArea",
    description: "커스텀 스크롤바가 적용된 스크롤 영역",
    category: "Primitives",
    href: "/design-system/primitives/scroll-area",
    preview: (
      <div className="w-full max-w-[180px]">
        <ScrollArea maxHeight={80}>
          <div className="flex flex-col gap-1 p-1">
            {["항목 1", "항목 2", "항목 3", "항목 4", "항목 5", "항목 6"].map((item) => (
              <div key={item} className="text-xs text-foreground px-2 py-1 bg-gray-50 rounded">{item}</div>
            ))}
          </div>
        </ScrollArea>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="w-full max-w-[220px]"><ScrollArea maxHeight={80}><div className="flex flex-col gap-1 p-1">{["항목 1", "항목 2", "항목 3", "항목 4", "항목 5"].map((item) => <div key={item} className="text-xs text-foreground px-2 py-1 bg-gray-50 rounded">{item}</div>)}</div></ScrollArea></div>,
        <div key="2" className="w-full max-w-[220px]"><ScrollArea maxHeight={80}><div className="flex flex-col gap-1 p-1">{["React", "Vue", "Angular", "Svelte", "Solid"].map((item) => <div key={item} className="text-xs text-foreground px-2 py-1 bg-gray-50 rounded">{item}</div>)}</div></ScrollArea></div>,
      ]} />
    ),
  },

  // 42. BackTop
  {
    key: "back-top",
    label: "BackTop",
    description: "페이지 상단으로 스크롤하는 플로팅 버튼",
    category: "Primitives",
    href: "/design-system/primitives/back-top",
    preview: (
      <div className="flex items-center justify-center">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 text-gray-600">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 16V4M10 4l-5 5M10 4l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="scale" frames={[
        <div key="1" className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 text-gray-600"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 16V4M10 4l-5 5M10 4l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div>,
        <div key="2" className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-xl"><svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M10 16V4M10 4l-5 5M10 4l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div>,
      ]} />
    ),
  },

  // 43. BatteryIndicator
  {
    key: "battery-indicator",
    label: "BatteryIndicator",
    description: "배터리 형태로 레벨을 시각화하는 인디케이터",
    category: "Primitives",
    href: "/design-system/primitives/battery-indicator",
    preview: (
      <BatteryIndicator value={75} autoColor size="md" />
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1200} transition="fade" frames={[
        <BatteryIndicator key="100" value={100} autoColor label="충전 완료" />,
        <BatteryIndicator key="60" value={60} autoColor label="보통" />,
        <BatteryIndicator key="20" value={20} autoColor label="부족" />,
        <BatteryIndicator key="5" value={5} autoColor label="위험" />,
      ]} />
    ),
  },

  // 44. SeverityBadge
  {
    key: "severity-badge",
    label: "SeverityBadge",
    description: "심각도 수준을 시각적으로 표현하는 뱃지",
    category: "Primitives",
    href: "/design-system/primitives/severity-badge",
    preview: (
      <div className="flex items-center gap-1.5">
        <SeverityBadge severity="ok" dot>정상</SeverityBadge>
        <SeverityBadge severity="warn" dot>경고</SeverityBadge>
        <SeverityBadge severity="danger" dot>위험</SeverityBadge>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1000} transition="slide-up" frames={[
        <SeverityBadge key="ok" severity="ok" dot>OK</SeverityBadge>,
        <SeverityBadge key="warn" severity="warn" dot>WARN</SeverityBadge>,
        <SeverityBadge key="danger" severity="danger" dot>DANGER</SeverityBadge>,
        <SeverityBadge key="info" severity="info" dot>INFO</SeverityBadge>,
        <SeverityBadge key="neutral" severity="neutral" dot>NEUTRAL</SeverityBadge>,
      ]} />
    ),
  },

  /* ================================================================ */
  /*  MISSING COMPOSITES                                               */
  /* ================================================================ */

  // 45. Select
  {
    key: "select",
    label: "Select",
    description: "드롭다운 방식의 단일 선택 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/select",
    preview: (
      <div className="w-full max-w-[180px]">
        <Select
          options={[
            { value: "react", label: "React" },
            { value: "vue", label: "Vue" },
            { value: "svelte", label: "Svelte" },
          ]}
          value="react"
          onChange={noop}
          size="sm"
        />
      </div>
    ),
    hoverDemo: <SelectLiveDemo />,
  },

  // 46. MultiSelect
  {
    key: "multi-select",
    label: "MultiSelect",
    description: "여러 항목을 선택할 수 있는 다중 선택 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/multi-select",
    preview: (
      <div className="w-full max-w-[200px]">
        <div className="flex items-center gap-1 flex-wrap min-h-[36px] w-full border border-border bg-white rounded-lg px-2 py-1.5">
          <Tag color="primary">React</Tag>
          <Tag color="primary">TypeScript</Tag>
        </div>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="flex items-center gap-1 flex-wrap min-h-[36px] w-full max-w-[220px] border border-border bg-white rounded-lg px-2 py-1.5"><Tag color="primary">React</Tag></div>,
        <div key="2" className="flex items-center gap-1 flex-wrap min-h-[36px] w-full max-w-[220px] border border-border bg-white rounded-lg px-2 py-1.5"><Tag color="primary">React</Tag><Tag color="primary">TypeScript</Tag></div>,
        <div key="3" className="flex items-center gap-1 flex-wrap min-h-[36px] w-full max-w-[220px] border border-border bg-white rounded-lg px-2 py-1.5"><Tag color="primary">React</Tag><Tag color="primary">TypeScript</Tag><Tag color="primary">Next.js</Tag></div>,
      ]} />
    ),
  },

  // 47. Modal (static representation)
  {
    key: "modal",
    label: "Modal",
    description: "콘텐츠를 오버레이로 표시하는 모달 다이얼로그",
    category: "Composites",
    href: "/design-system/composites/modal",
    preview: (
      <div className="w-full max-w-[200px] border border-border rounded-xl bg-white shadow-lg p-3">
        <div className="text-xs font-semibold text-foreground mb-1">알림</div>
        <p className="text-[10px] text-muted">변경사항을 저장하시겠습니까?</p>
        <div className="flex justify-end gap-1.5 mt-3">
          <Button size="sm" variant="secondary">취소</Button>
          <Button size="sm">확인</Button>
        </div>
      </div>
    ),
    hoverDemo: <ModalLiveDemo />,
  },

  // 48. Toast (static representation)
  {
    key: "toast",
    label: "Toast",
    description: "일시적인 알림 메시지를 표시하는 토스트",
    category: "Composites",
    href: "/design-system/composites/toast",
    preview: (
      <div className="w-full max-w-[220px] border border-success/20 bg-success-light rounded-lg px-3 py-2 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#2f8f57" strokeWidth="1.5" /><path d="M5.5 9.5l2 2 5-5" stroke="#2f8f57" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span className="text-xs font-medium text-foreground">저장되었습니다</span>
      </div>
    ),
    hoverDemo: <ToastLiveDemo />,
  },

  // 49. Dropdown
  {
    key: "dropdown",
    label: "Dropdown",
    description: "클릭 시 메뉴 항목을 표시하는 드롭다운",
    category: "Composites",
    href: "/design-system/composites/dropdown",
    preview: (
      <div className="flex flex-col items-start">
        <Button size="sm" variant="secondary">메뉴 열기</Button>
      </div>
    ),
    hoverDemo: <DropdownLiveDemo />,
  },

  // 50. ConfirmDialog (static representation)
  {
    key: "confirm-dialog",
    label: "ConfirmDialog",
    description: "확인/취소를 요청하는 확인 다이얼로그",
    category: "Composites",
    href: "/design-system/composites/confirm-dialog",
    preview: (
      <div className="w-full max-w-[200px] border border-border rounded-xl bg-white shadow-lg p-3">
        <div className="text-xs font-semibold text-foreground mb-1">삭제 확인</div>
        <p className="text-[10px] text-muted">이 작업은 되돌릴 수 없습니다.</p>
        <div className="flex justify-end gap-1.5 mt-3">
          <Button size="sm" variant="secondary">취소</Button>
          <Button size="sm" variant="danger">삭제</Button>
        </div>
      </div>
    ),
    hoverDemo: <ConfirmDialogLiveDemo />,
  },

  // 51. Drawer (static representation)
  {
    key: "drawer",
    label: "Drawer",
    description: "화면 측면에서 슬라이드하는 패널 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/drawer",
    preview: (
      <div className="w-full max-w-[200px] h-[80px] border border-border rounded-lg bg-gray-50 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-[60%] bg-white border-l border-border shadow-lg p-2">
          <div className="text-[10px] font-semibold text-foreground">상세 정보</div>
          <div className="text-[9px] text-muted mt-1">패널 내용</div>
        </div>
      </div>
    ),
    hoverDemo: <DrawerLiveDemo />,
  },

  // 52. Combobox
  {
    key: "combobox",
    label: "Combobox",
    description: "검색과 선택이 결합된 콤보박스 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/combobox",
    preview: (
      <div className="w-full max-w-[180px]">
        <Input placeholder="검색..." />
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="slide-up" frames={[
        <div key="1" className="w-full max-w-[200px]"><Input placeholder="도시 검색..." /><div className="border border-border rounded-lg bg-white shadow-lg py-1 mt-1"><div className="px-3 py-1.5 text-xs bg-primary-light text-primary font-medium">서울</div><div className="px-3 py-1.5 text-xs text-foreground">부산</div></div></div>,
        <div key="2" className="w-full max-w-[200px]"><Input placeholder="과일 검색..." /><div className="border border-border rounded-lg bg-white shadow-lg py-1 mt-1"><div className="px-3 py-1.5 text-xs bg-primary-light text-primary font-medium">사과</div><div className="px-3 py-1.5 text-xs text-foreground">바나나</div></div></div>,
        <div key="3" className="w-full max-w-[200px]"><Input placeholder="색상 검색..." /><div className="border border-border rounded-lg bg-white shadow-lg py-1 mt-1"><div className="px-3 py-1.5 text-xs bg-primary-light text-primary font-medium">파랑</div><div className="px-3 py-1.5 text-xs text-foreground">빨강</div></div></div>,
      ]} />
    ),
  },

  // 53. ButtonGroup
  {
    key: "button-group",
    label: "ButtonGroup",
    description: "여러 버튼을 하나로 연결하는 버튼 그룹",
    category: "Composites",
    href: "/design-system/composites/button-group",
    preview: (
      <ButtonGroup>
        <Button size="sm" variant="secondary">왼쪽</Button>
        <Button size="sm" variant="secondary">중앙</Button>
        <Button size="sm" variant="secondary">오른쪽</Button>
      </ButtonGroup>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <ButtonGroup key="1"><Button size="sm">활성</Button><Button size="sm" variant="secondary">비활성</Button><Button size="sm" variant="secondary">비활성</Button></ButtonGroup>,
        <ButtonGroup key="2"><Button size="sm" variant="secondary">비활성</Button><Button size="sm">활성</Button><Button size="sm" variant="secondary">비활성</Button></ButtonGroup>,
        <ButtonGroup key="3" separated><Button size="sm" variant="secondary">복사</Button><Button size="sm" variant="secondary">붙여넣기</Button><Button size="sm" variant="danger">삭제</Button></ButtonGroup>,
      ]} />
    ),
  },

  // 54. AvatarStack
  {
    key: "avatar-stack",
    label: "AvatarStack",
    description: "여러 아바타를 겹쳐서 표시하는 스택 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/avatar-stack",
    preview: (
      <AvatarStack names={["김준하", "이서연", "박지민", "최유진"]} max={3} />
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1200} transition="scale" frames={[
        <AvatarStack key="2" names={["김준하", "이서연"]} max={3} size="md" />,
        <AvatarStack key="4" names={["김준하", "이서연", "박지민", "최유진"]} max={4} size="md" />,
        <AvatarStack key="6" names={["김준하", "이서연", "박지민", "최유진", "정다은", "홍길동"]} max={4} size="md" />,
      ]} />
    ),
  },

  // 55. Collapsible
  {
    key: "collapsible",
    label: "Collapsible",
    description: "접었다 펼 수 있는 단일 접기/펼치기 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/collapsible",
    preview: (
      <div className="w-full max-w-[200px]">
        <Collapsible
          trigger={<div className="flex items-center gap-1 text-xs font-medium text-foreground cursor-pointer">더보기 <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg></div>}
          defaultOpen
        >
          <p className="text-[10px] text-muted mt-1">숨겨진 내용이 여기에 표시됩니다.</p>
        </Collapsible>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="slide-up" frames={[
        <div key="1" className="w-full max-w-[220px]"><Collapsible trigger={<div className="flex items-center gap-1 text-xs font-medium text-foreground cursor-pointer px-2 py-1 border border-border rounded-lg">펼쳐진 섹션</div>} defaultOpen><div className="text-xs text-muted mt-1 px-2">이 섹션은 펼쳐져 있습니다.</div></Collapsible></div>,
        <div key="2" className="w-full max-w-[220px]"><Collapsible trigger={<div className="flex items-center gap-1 text-xs font-medium text-foreground cursor-pointer px-2 py-1 border border-border rounded-lg">접힌 섹션</div>}><div className="text-xs text-muted mt-1 px-2">숨겨진 내용</div></Collapsible></div>,
      ]} />
    ),
  },

  // 56. HoverCard (static representation)
  {
    key: "hover-card",
    label: "HoverCard",
    description: "호버 시 카드 형태의 팝업을 표시하는 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/hover-card",
    preview: (
      <div className="flex flex-col items-center gap-1">
        <div className="px-2 py-1 border border-border rounded-lg bg-white shadow-md text-[10px] text-muted max-w-[160px]">
          <div className="font-medium text-foreground">@jjunhaa</div>
          <div>디자인 시스템 개발자</div>
        </div>
        <span className="text-xs text-primary underline cursor-pointer">@jjunhaa</span>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="px-3 py-2 border border-border rounded-xl bg-white shadow-lg max-w-[200px]"><div className="flex items-center gap-2 mb-1"><Avatar name="김준하" size="sm" /><div><div className="text-xs font-semibold text-foreground">김준하</div><div className="text-[10px] text-muted">@jjunhaa</div></div></div><p className="text-[10px] text-muted">프론트엔드 개발자</p></div>,
        <div key="2" className="px-3 py-2 border border-border rounded-xl bg-white shadow-lg max-w-[200px]"><div className="flex items-center gap-2 mb-1"><Avatar name="이서연" size="sm" /><div><div className="text-xs font-semibold text-foreground">이서연</div><div className="text-[10px] text-muted">@seoyeon</div></div></div><p className="text-[10px] text-muted">UI 디자이너</p></div>,
      ]} />
    ),
  },

  // 57. ContextMenu (static representation)
  {
    key: "context-menu",
    label: "ContextMenu",
    description: "우클릭 시 나타나는 컨텍스트 메뉴",
    category: "Composites",
    href: "/design-system/composites/context-menu",
    preview: (
      <div className="w-full max-w-[160px] border border-dashed border-border rounded-lg p-3 text-center text-[10px] text-muted">
        우클릭 영역
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="slide-up" frames={[
        <div key="1" className="flex flex-col gap-1 w-full max-w-[140px] border border-border rounded-lg bg-white shadow-lg py-1"><div className="px-3 py-1.5 text-xs bg-gray-50 text-foreground">뒤로 가기</div><div className="px-3 py-1.5 text-xs text-foreground">새로고침</div><div className="px-3 py-1.5 text-xs text-foreground">소스 보기</div></div>,
        <div key="2" className="flex flex-col gap-1 w-full max-w-[140px] border border-border rounded-lg bg-white shadow-lg py-1"><div className="px-3 py-1.5 text-xs bg-gray-50 text-foreground">복사</div><div className="px-3 py-1.5 text-xs text-foreground">붙여넣기</div><div className="px-3 py-1.5 text-xs text-foreground">삭제</div></div>,
      ]} />
    ),
  },

  // 58. AlertDialog (static representation)
  {
    key: "alert-dialog",
    label: "AlertDialog",
    description: "긴급한 확인이 필요한 알림 다이얼로그",
    category: "Composites",
    href: "/design-system/composites/alert-dialog",
    preview: (
      <div className="w-full max-w-[200px] border border-red-200 rounded-xl bg-white shadow-lg p-3">
        <div className="text-xs font-semibold text-red-600 mb-1">경고</div>
        <p className="text-[10px] text-muted">데이터가 삭제됩니다.</p>
        <div className="flex justify-end mt-3">
          <Button size="sm" variant="danger">확인</Button>
        </div>
      </div>
    ),
    hoverDemo: <ConfirmDialogLiveDemo />,
  },

  // 59. Sheet (static representation)
  {
    key: "sheet",
    label: "Sheet",
    description: "화면 하단에서 올라오는 바텀 시트",
    category: "Composites",
    href: "/design-system/composites/sheet",
    preview: (
      <div className="w-full max-w-[200px] h-[80px] border border-border rounded-lg bg-gray-50 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-[55%] bg-white border-t border-border rounded-t-xl shadow-lg p-2">
          <div className="w-8 h-1 bg-gray-300 rounded-full mx-auto mb-1" />
          <div className="text-[10px] font-semibold text-foreground">시트 제목</div>
        </div>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="slide-up" frames={[
        <div key="1" className="w-full max-w-[220px] h-[120px] border border-border rounded-lg bg-gray-50 relative overflow-hidden"><div className="p-2 text-[10px] text-muted">메인 콘텐츠</div><div className="absolute bottom-0 left-0 right-0 h-[55%] bg-white border-t border-border rounded-t-xl shadow-lg"><div className="w-8 h-1 bg-gray-300 rounded-full mx-auto mt-2 mb-1" /><div className="px-3 text-xs font-semibold text-foreground">옵션 선택</div></div></div>,
        <div key="2" className="w-full max-w-[220px] h-[120px] border border-border rounded-lg bg-gray-50 relative overflow-hidden"><div className="p-2 text-[10px] text-muted">메인 콘텐츠</div><div className="absolute bottom-0 left-0 right-0 h-[70%] bg-white border-t border-border rounded-t-xl shadow-lg"><div className="w-8 h-1 bg-gray-300 rounded-full mx-auto mt-2 mb-1" /><div className="px-3 text-xs font-semibold text-foreground">상세 정보</div></div></div>,
      ]} />
    ),
  },

  // 60. NavigationMenu (static representation)
  {
    key: "navigation-menu",
    label: "NavigationMenu",
    description: "드롭다운을 지원하는 네비게이션 메뉴",
    category: "Composites",
    href: "/design-system/composites/navigation-menu",
    preview: (
      <div className="flex items-center gap-3">
        {["홈", "제품", "문서"].map((label, i) => (
          <span key={label} className={`text-xs font-medium cursor-pointer ${i === 0 ? "text-primary" : "text-muted hover:text-foreground"}`}>{label}</span>
        ))}
      </div>
    ),
    hoverDemo: <NavigationMenuLiveDemo />,
  },

  // 61. Menubar (static representation)
  {
    key: "menubar",
    label: "Menubar",
    description: "데스크톱 스타일의 메뉴바 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/menubar",
    preview: (
      <div className="flex items-center gap-0 border border-border rounded-lg bg-white overflow-hidden">
        {["파일", "편집", "보기"].map((label, i) => (
          <span key={label} className={`px-3 py-1.5 text-xs font-medium cursor-pointer ${i === 0 ? "bg-gray-100 text-foreground" : "text-muted hover:bg-gray-50"}`}>{label}</span>
        ))}
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="flex items-center gap-0 border border-border rounded-lg bg-white overflow-hidden"><span className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-foreground">파일</span><span className="px-3 py-1.5 text-xs font-medium text-muted">편집</span><span className="px-3 py-1.5 text-xs font-medium text-muted">보기</span></div>,
        <div key="2" className="flex items-center gap-0 border border-border rounded-lg bg-white overflow-hidden"><span className="px-3 py-1.5 text-xs font-medium text-muted">파일</span><span className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-foreground">편집</span><span className="px-3 py-1.5 text-xs font-medium text-muted">보기</span></div>,
        <div key="3" className="flex items-center gap-0 border border-border rounded-lg bg-white overflow-hidden"><span className="px-3 py-1.5 text-xs font-medium text-muted">파일</span><span className="px-3 py-1.5 text-xs font-medium text-muted">편집</span><span className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-foreground">보기</span></div>,
      ]} />
    ),
  },

  // 62. Carousel
  {
    key: "carousel",
    label: "Carousel",
    description: "슬라이드 형태로 콘텐츠를 전환하는 캐러셀",
    category: "Composites",
    href: "/design-system/composites/carousel",
    preview: (
      <div className="flex flex-col items-center gap-1 w-full max-w-[180px]">
        <div className="w-full h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
          <span className="text-[10px] font-medium text-blue-600">슬라이드 1</span>
        </div>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-primary" : "bg-gray-300"}`} />
          ))}
        </div>
      </div>
    ),
    hoverDemo: <CarouselLiveDemo />,
  },

  // 63. Resizable
  {
    key: "resizable",
    label: "Resizable",
    description: "드래그로 크기를 조절하는 분할 패널",
    category: "Composites",
    href: "/design-system/composites/resizable",
    preview: (
      <div className="w-full max-w-[200px] h-[60px] flex border border-border rounded-lg overflow-hidden">
        <div className="flex-[3] bg-blue-50 flex items-center justify-center text-[10px] text-blue-600">패널 A</div>
        <div className="w-[3px] bg-gray-200 cursor-col-resize hover:bg-primary flex items-center justify-center">
          <div className="w-0.5 h-4 bg-gray-400 rounded-full" />
        </div>
        <div className="flex-[2] bg-green-50 flex items-center justify-center text-[10px] text-green-600">패널 B</div>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="w-full max-w-[240px] h-[80px]"><Resizable direction="horizontal" defaultSize={40}><div className="h-full bg-blue-50 p-2 text-xs text-blue-700">왼쪽</div><div className="h-full bg-green-50 p-2 text-xs text-green-700">오른쪽</div></Resizable></div>,
        <div key="2" className="w-full max-w-[240px] h-[80px]"><Resizable direction="horizontal" defaultSize={60}><div className="h-full bg-purple-50 p-2 text-xs text-purple-700">넓은 패널</div><div className="h-full bg-amber-50 p-2 text-xs text-amber-700">좁은</div></Resizable></div>,
      ]} />
    ),
  },

  // 64. TreeView
  {
    key: "tree-view",
    label: "TreeView",
    description: "파일 탐색기 스타일의 트리 구조 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/tree-view",
    preview: (
      <div className="w-full max-w-[160px]">
        <TreeView
          nodes={[
            { key: "src", label: "src", children: [
              { key: "app", label: "app.tsx" },
              { key: "index", label: "index.ts" },
            ]},
            { key: "pkg", label: "package.json" },
          ]}
          defaultExpanded={["src"]}
          selected="app"
          onSelect={noop}
        />
      </div>
    ),
    hoverDemo: <TreeViewLiveDemo />,
  },

  // 65. Transfer
  {
    key: "transfer",
    label: "Transfer",
    description: "두 목록 간 항목을 이동하는 트랜스퍼 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/transfer",
    preview: (
      <div className="flex items-center gap-1 w-full max-w-[200px]">
        <div className="flex-1 border border-border rounded-lg p-1.5">
          {["React", "Vue"].map((s) => <div key={s} className="text-[10px] text-foreground py-0.5 px-1">{s}</div>)}
        </div>
        <div className="flex flex-col gap-0.5">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted"><path d="M5 7h4M9 7l-2-2M9 7l-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted"><path d="M9 7H5M5 7l2-2M5 7l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
        </div>
        <div className="flex-1 border border-border rounded-lg p-1.5">
          {["Next.js"].map((s) => <div key={s} className="text-[10px] text-foreground py-0.5 px-1">{s}</div>)}
        </div>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="w-full max-w-[280px]"><Transfer source={[{ key: "1", label: "React" }, { key: "2", label: "Vue" }]} target={[{ key: "3", label: "Next.js" }]} onChange={noop} sourceTitle="선택 가능" targetTitle="선택됨" /></div>,
        <div key="2" className="w-full max-w-[280px]"><Transfer source={[{ key: "1", label: "React" }]} target={[{ key: "2", label: "Vue" }, { key: "3", label: "Next.js" }]} onChange={noop} sourceTitle="선택 가능" targetTitle="선택됨" /></div>,
      ]} />
    ),
  },

  // 66. Descriptions
  {
    key: "descriptions",
    label: "Descriptions",
    description: "키-값 쌍을 깔끔하게 표시하는 디스크립션 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/descriptions",
    preview: (
      <div className="w-full max-w-[200px]">
        <Descriptions
          items={[
            { key: "name", label: "이름", value: "홍길동" },
            { key: "role", label: "역할", value: "개발자" },
          ]}
          columns={1}
        />
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="w-full max-w-[260px]"><Descriptions items={[{ key: "name", label: "이름", value: "홍길동" }, { key: "role", label: "역할", value: "프론트엔드" }]} columns={1} /></div>,
        <div key="2" className="w-full max-w-[260px]"><Descriptions title="사용자 정보" items={[{ key: "name", label: "이름", value: "홍길동" }, { key: "email", label: "이메일", value: "hong@example.com" }, { key: "role", label: "역할", value: "프론트엔드" }, { key: "team", label: "팀", value: "디자인 시스템" }]} columns={2} bordered /></div>,
      ]} />
    ),
  },

  // 67. SegmentedControl
  {
    key: "segmented-control",
    label: "SegmentedControl",
    description: "iOS 스타일의 세그먼트 선택 컨트롤",
    category: "Composites",
    href: "/design-system/composites/segmented-control",
    preview: (
      <SegmentedControl
        options={[
          { key: "list", label: "목록" },
          { key: "grid", label: "그리드" },
          { key: "board", label: "보드" },
        ]}
        value="list"
        onChange={noop}
        size="sm"
      />
    ),
    hoverDemo: <SegmentedControlLiveDemo />,
  },

  // 68. ColorPicker
  {
    key: "color-picker",
    label: "ColorPicker",
    description: "색상을 선택하는 컬러 피커 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/color-picker",
    preview: (
      <div className="flex items-center gap-2">
        {["#3B82F6", "#22C55E", "#EF4444", "#8B5CF6"].map((c) => (
          <div key={c} className="w-6 h-6 rounded-md border border-gray-200 cursor-pointer" style={{ backgroundColor: c }} />
        ))}
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1000} transition="fade" frames={[
        <div key="1" className="flex items-center gap-2"><div className="w-8 h-8 rounded-md border border-gray-200 ring-2 ring-primary ring-offset-1" style={{ backgroundColor: "#3B82F6" }} /><span className="text-xs font-mono text-foreground">#3B82F6</span></div>,
        <div key="2" className="flex items-center gap-2"><div className="w-8 h-8 rounded-md border border-gray-200 ring-2 ring-primary ring-offset-1" style={{ backgroundColor: "#22C55E" }} /><span className="text-xs font-mono text-foreground">#22C55E</span></div>,
        <div key="3" className="flex items-center gap-2"><div className="w-8 h-8 rounded-md border border-gray-200 ring-2 ring-primary ring-offset-1" style={{ backgroundColor: "#EF4444" }} /><span className="text-xs font-mono text-foreground">#EF4444</span></div>,
        <div key="4" className="flex items-center gap-2"><div className="w-8 h-8 rounded-md border border-gray-200 ring-2 ring-primary ring-offset-1" style={{ backgroundColor: "#8B5CF6" }} /><span className="text-xs font-mono text-foreground">#8B5CF6</span></div>,
      ]} />
    ),
  },

  // 69. TimePicker
  {
    key: "time-picker",
    label: "TimePicker",
    description: "시간을 선택하는 타임 피커 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/time-picker",
    preview: (
      <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-white max-w-[140px]">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" /><path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
        <span className="text-sm text-foreground">14:30</span>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1200} transition="fade" frames={[
        <div key="1" className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-white max-w-[160px]"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" /><path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg><span className="text-sm text-foreground">09:00</span></div>,
        <div key="2" className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-white max-w-[160px]"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" /><path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg><span className="text-sm text-foreground">14:30</span></div>,
        <div key="3" className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-white max-w-[160px]"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" /><path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg><span className="text-sm text-foreground">22:15</span></div>,
      ]} />
    ),
  },

  // 70. DateRangePicker
  {
    key: "date-range-picker",
    label: "DateRangePicker",
    description: "날짜 범위를 선택하는 피커 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/date-range-picker",
    preview: (
      <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-white max-w-[200px]">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted"><rect x="1.5" y="2.5" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M1.5 5.5h11M4.5 1v2M9.5 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
        <span className="text-xs text-foreground">2026.04.01 ~ 2026.04.20</span>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-white max-w-[220px]"><span className="text-xs text-foreground">2026.04.01 ~ 2026.04.20</span></div>,
        <div key="2" className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-white max-w-[220px]"><span className="text-xs text-foreground">2026.03.15 ~ 2026.04.15</span></div>,
        <div key="3" className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-white max-w-[220px]"><span className="text-xs text-foreground">2026.01.01 ~ 2026.12.31</span></div>,
      ]} />
    ),
  },

  // 71. DateInput
  {
    key: "date-input",
    label: "DateInput",
    description: "날짜를 직접 입력하는 날짜 입력 필드",
    category: "Composites",
    href: "/design-system/composites/date-input",
    preview: (
      <div className="w-full max-w-[180px]">
        <DateInput placeholder="날짜 선택" />
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="w-full max-w-[180px]"><Label>시작일</Label><DateInput value="2026-04-20" onChange={noop} /></div>,
        <div key="2" className="w-full max-w-[180px]"><Label>종료일</Label><DateInput placeholder="종료일 선택" /></div>,
        <div key="3" className="w-full max-w-[180px]"><Label>생년월일</Label><DateInput placeholder="YYYY-MM-DD" /></div>,
      ]} />
    ),
  },

  // 72. Mention
  {
    key: "mention",
    label: "Mention",
    description: "@멘션 기능이 포함된 텍스트 입력 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/mention",
    preview: (
      <div className="w-full max-w-[200px]">
        <div className="px-3 py-2 border border-border rounded-lg bg-white text-xs text-foreground">
          <span className="text-primary font-medium">@김준하</span> 님에게 업무를 할당
        </div>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="px-3 py-2 border border-border rounded-lg bg-white text-xs text-foreground max-w-[200px]"><span className="text-primary font-medium">@김준하</span> 확인 부탁드립니다</div>,
        <div key="2" className="px-3 py-2 border border-border rounded-lg bg-white text-xs text-foreground max-w-[200px]"><span className="text-primary font-medium">@이서연</span> 리뷰 요청드립니다</div>,
        <div key="3" className="px-3 py-2 border border-border rounded-lg bg-white text-xs text-foreground max-w-[200px]"><span className="text-primary font-medium">@박지민</span> 회의 참석해주세요</div>,
      ]} />
    ),
  },

  // 73. AutoComplete
  {
    key: "auto-complete",
    label: "AutoComplete",
    description: "입력 시 자동 완성 제안을 표시하는 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/auto-complete",
    preview: (
      <div className="w-full max-w-[180px]">
        <Input placeholder="검색..." />
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="slide-up" frames={[
        <div key="1" className="w-full max-w-[200px]"><Input placeholder="프로그래밍 언어..." /><div className="border border-border rounded-lg bg-white shadow-lg py-1 mt-1"><div className="px-3 py-1.5 text-xs bg-primary-light text-primary font-medium">Java</div><div className="px-3 py-1.5 text-xs text-foreground">JavaScript</div></div></div>,
        <div key="2" className="w-full max-w-[200px]"><Input placeholder="프레임워크..." /><div className="border border-border rounded-lg bg-white shadow-lg py-1 mt-1"><div className="px-3 py-1.5 text-xs bg-primary-light text-primary font-medium">React</div><div className="px-3 py-1.5 text-xs text-foreground">React Native</div></div></div>,
      ]} />
    ),
  },

  // 74. Result
  {
    key: "result",
    label: "Result",
    description: "작업 결과를 아이콘과 함께 표시하는 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/result",
    preview: (
      <Result status="success" title="완료!" className="py-3 [&_svg]:w-10 [&_svg]:h-10" />
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="scale" frames={[
        <Result key="success" status="success" title="성공" className="py-2 [&_svg]:w-8 [&_svg]:h-8 [&_h2]:text-xs" />,
        <Result key="error" status="error" title="오류" className="py-2 [&_svg]:w-8 [&_svg]:h-8 [&_h2]:text-xs" />,
        <Result key="info" status="info" title="안내" className="py-2 [&_svg]:w-8 [&_svg]:h-8 [&_h2]:text-xs" />,
      ]} />
    ),
  },

  // 75. Watermark
  {
    key: "watermark",
    label: "Watermark",
    description: "콘텐츠 위에 반복 텍스트 워터마크를 표시",
    category: "Composites",
    href: "/design-system/composites/watermark",
    preview: (
      <div className="relative w-full max-w-[180px] h-[60px] bg-white rounded-lg border border-border p-2 overflow-hidden">
        <div className="text-xs text-foreground">보호된 콘텐츠</div>
        <div className="absolute inset-0 flex items-center justify-center opacity-10 rotate-[-20deg] text-foreground text-lg font-bold select-none pointer-events-none">기밀</div>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="relative w-full max-w-[220px] h-[80px] bg-white rounded-lg border border-border p-3 overflow-hidden"><div className="text-xs font-medium text-foreground">기밀 문서</div><div className="absolute inset-0 flex items-center justify-center opacity-10 rotate-[-20deg] text-foreground text-lg font-bold select-none pointer-events-none">기밀</div></div>,
        <div key="2" className="relative w-full max-w-[220px] h-[80px] bg-white rounded-lg border border-border p-3 overflow-hidden"><div className="text-xs font-medium text-foreground">미리보기</div><div className="absolute inset-0 flex items-center justify-center opacity-10 rotate-[-20deg] text-foreground text-lg font-bold select-none pointer-events-none">PREVIEW</div></div>,
      ]} />
    ),
  },

  // 76. ScrollSpy
  {
    key: "scroll-spy",
    label: "ScrollSpy",
    description: "스크롤 위치에 따라 네비게이션을 하이라이트",
    category: "Composites",
    href: "/design-system/composites/scroll-spy",
    preview: (
      <div className="flex items-center gap-2">
        {["개요", "API", "예시"].map((label, i) => (
          <span key={label} className={`text-xs font-medium ${i === 0 ? "text-primary border-b-2 border-primary pb-0.5" : "text-muted"}`}>{label}</span>
        ))}
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1200} transition="fade" frames={[
        <div key="1" className="flex items-center gap-2">{["소개", "설치", "사용법"].map((s, i) => <span key={s} className={`text-xs ${i === 0 ? "text-primary font-medium border-b-2 border-primary pb-0.5" : "text-muted"}`}>{s}</span>)}</div>,
        <div key="2" className="flex items-center gap-2">{["소개", "설치", "사용법"].map((s, i) => <span key={s} className={`text-xs ${i === 1 ? "text-primary font-medium border-b-2 border-primary pb-0.5" : "text-muted"}`}>{s}</span>)}</div>,
        <div key="3" className="flex items-center gap-2">{["소개", "설치", "사용법"].map((s, i) => <span key={s} className={`text-xs ${i === 2 ? "text-primary font-medium border-b-2 border-primary pb-0.5" : "text-muted"}`}>{s}</span>)}</div>,
      ]} />
    ),
  },

  // 77. Spotlight
  {
    key: "spotlight",
    label: "Spotlight",
    description: "콘텐츠를 스포트라이트 효과로 강조",
    category: "Composites",
    href: "/design-system/composites/spotlight",
    preview: (
      <div className="w-full max-w-[180px] relative overflow-hidden rounded-lg bg-gray-900 p-3">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-primary/20 rounded-full blur-xl" />
        <div className="relative text-center text-xs font-medium text-white">Spotlight</div>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="relative overflow-hidden rounded-xl bg-gray-900 p-4 max-w-[200px]"><div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-20 h-20 bg-primary/20 rounded-full blur-xl" /><div className="relative text-xs font-semibold text-white text-center">Spotlight</div></div>,
        <div key="2" className="relative overflow-hidden rounded-xl bg-gray-900 p-4 max-w-[200px]"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-purple-500/20 rounded-full blur-xl" /><div className="relative text-xs font-semibold text-white text-center">Spotlight</div></div>,
        <div key="3" className="relative overflow-hidden rounded-xl bg-gray-900 p-4 max-w-[200px]"><div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-20 h-20 bg-green-500/20 rounded-full blur-xl" /><div className="relative text-xs font-semibold text-white text-center">Spotlight</div></div>,
      ]} />
    ),
  },

  // 78. DateRangeFilter
  {
    key: "date-range-filter",
    label: "DateRangeFilter",
    description: "프리셋이 포함된 날짜 범위 필터 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/date-range-filter",
    preview: (
      <div className="flex items-center gap-1">
        <div className="px-2 py-1 border border-border rounded-md bg-white text-[10px] text-foreground">2026.04.01</div>
        <span className="text-[10px] text-muted">~</span>
        <div className="px-2 py-1 border border-border rounded-md bg-white text-[10px] text-foreground">2026.04.20</div>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1200} transition="fade" frames={[
        <div key="1" className="flex flex-wrap gap-1">{["오늘", "이번 주", "이번 달", "최근 30일"].map((preset, i) => <span key={preset} className={`px-2 py-0.5 rounded-full text-[10px] cursor-pointer ${i === 0 ? "bg-primary text-white" : "bg-gray-100 text-muted"}`}>{preset}</span>)}</div>,
        <div key="2" className="flex flex-wrap gap-1">{["오늘", "이번 주", "이번 달", "최근 30일"].map((preset, i) => <span key={preset} className={`px-2 py-0.5 rounded-full text-[10px] cursor-pointer ${i === 1 ? "bg-primary text-white" : "bg-gray-100 text-muted"}`}>{preset}</span>)}</div>,
        <div key="3" className="flex flex-wrap gap-1">{["오늘", "이번 주", "이번 달", "최근 30일"].map((preset, i) => <span key={preset} className={`px-2 py-0.5 rounded-full text-[10px] cursor-pointer ${i === 2 ? "bg-primary text-white" : "bg-gray-100 text-muted"}`}>{preset}</span>)}</div>,
        <div key="4" className="flex flex-wrap gap-1">{["오늘", "이번 주", "이번 달", "최근 30일"].map((preset, i) => <span key={preset} className={`px-2 py-0.5 rounded-full text-[10px] cursor-pointer ${i === 3 ? "bg-primary text-white" : "bg-gray-100 text-muted"}`}>{preset}</span>)}</div>,
      ]} />
    ),
  },

  // 79. ComparisonGrid
  {
    key: "comparison-grid",
    label: "ComparisonGrid",
    description: "통계 지표를 비교하는 그리드 카드 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/comparison-grid",
    preview: (
      <ComparisonGrid
        cards={[
          { key: "a", label: "매출", value: "₩1.2M" },
          { key: "b", label: "비용", value: "₩800K" },
        ]}
        columns={2}
      />
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <ComparisonGrid key="1" cards={[{ key: "a", label: "매출", value: "₩1.2M", change: { value: "+12%", direction: "up" as const } }, { key: "b", label: "비용", value: "₩800K", change: { value: "+3%", direction: "up" as const } }]} columns={2} />,
        <ComparisonGrid key="2" cards={[{ key: "c", label: "이익", value: "₩400K", change: { value: "+18%", direction: "up" as const } }, { key: "d", label: "이탈률", value: "2.1%", change: { value: "-0.5%", direction: "down" as const } }]} columns={2} />,
      ]} />
    ),
  },

  // 80. FilterButtonGroup
  {
    key: "filter-button-group",
    label: "FilterButtonGroup",
    description: "선택 가능한 필터 옵션 버튼 그룹",
    category: "Composites",
    href: "/design-system/composites/filter-button-group",
    preview: (
      <FilterButtonGroup
        options={[
          { key: "all", label: "전체", count: 120 },
          { key: "active", label: "활성", count: 85 },
          { key: "inactive", label: "비활성", count: 35 },
        ]}
        value="all"
        onChange={noop}
      />
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1200} transition="fade" frames={[
        <FilterButtonGroup key="1" options={[{ key: "all", label: "전체", count: 120 }, { key: "active", label: "활성", count: 85 }, { key: "inactive", label: "비활성", count: 35 }]} value="all" onChange={noop} />,
        <FilterButtonGroup key="2" options={[{ key: "all", label: "전체", count: 120 }, { key: "active", label: "활성", count: 85 }, { key: "inactive", label: "비활성", count: 35 }]} value="active" onChange={noop} />,
        <FilterButtonGroup key="3" options={[{ key: "all", label: "전체", count: 120 }, { key: "active", label: "활성", count: 85 }, { key: "inactive", label: "비활성", count: 35 }]} value="inactive" onChange={noop} />,
      ]} />
    ),
  },

  // 81. KeyValueGrid
  {
    key: "key-value-grid",
    label: "KeyValueGrid",
    description: "키-값 쌍을 그리드로 배치하는 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/key-value-grid",
    preview: (
      <div className="w-full max-w-[200px]">
        <KeyValueGrid
          items={[
            { key: "name", label: "이름", value: "홍길동" },
            { key: "team", label: "팀", value: "프론트엔드" },
            { key: "status", label: "상태", value: "활성" },
            { key: "role", label: "직급", value: "시니어" },
          ]}
          columns={2}
        />
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="w-full max-w-[260px]"><KeyValueGrid items={[{ key: "name", label: "이름", value: "홍길동" }, { key: "team", label: "팀", value: "프론트엔드" }]} columns={2} /></div>,
        <div key="2" className="w-full max-w-[260px]"><KeyValueGrid items={[{ key: "name", label: "이름", value: "홍길동" }, { key: "email", label: "이메일", value: "hong@example.com" }, { key: "team", label: "팀", value: "프론트엔드" }, { key: "status", label: "상태", value: "활성" }]} columns={2} bordered /></div>,
      ]} />
    ),
  },

  // 82. DetailPanel
  {
    key: "detail-panel",
    label: "DetailPanel",
    description: "상세 정보를 표시하는 패널 컴포넌트",
    category: "Composites",
    href: "/design-system/composites/detail-panel",
    preview: (
      <div className="w-full max-w-[200px] border border-border rounded-xl bg-white overflow-hidden">
        <div className="px-3 py-2 border-b border-border">
          <div className="text-xs font-semibold text-foreground">상세 정보</div>
        </div>
        <div className="p-3 text-[10px] text-muted">패널 콘텐츠</div>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="w-full max-w-[240px] border border-border rounded-xl bg-white overflow-hidden shadow-lg"><div className="px-3 py-2 border-b border-border"><div className="text-xs font-semibold text-foreground">프로젝트 상세</div></div><div className="flex border-b border-border"><span className="flex-1 text-center py-1.5 text-xs text-primary border-b-2 border-primary font-medium">정보</span><span className="flex-1 text-center py-1.5 text-xs text-muted">활동</span></div><div className="p-2 text-[10px] text-muted">정보 탭 콘텐츠</div></div>,
        <div key="2" className="w-full max-w-[240px] border border-border rounded-xl bg-white overflow-hidden shadow-lg"><div className="px-3 py-2 border-b border-border"><div className="text-xs font-semibold text-foreground">프로젝트 상세</div></div><div className="flex border-b border-border"><span className="flex-1 text-center py-1.5 text-xs text-muted">정보</span><span className="flex-1 text-center py-1.5 text-xs text-primary border-b-2 border-primary font-medium">활동</span></div><div className="p-2 text-[10px] text-muted">활동 탭 콘텐츠</div></div>,
      ]} />
    ),
  },

  // 83. FloatingActionButton
  {
    key: "floating-action-button",
    label: "FloatingActionButton",
    description: "고정 위치의 빠른 액션 플로팅 버튼",
    category: "Composites",
    href: "/design-system/composites/floating-action-button",
    preview: (
      <div className="flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg cursor-pointer">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </div>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1200} transition="scale" frames={[
        <div key="1" className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></div>,
        <div key="2" className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></div>,
        <div key="3" className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></div>,
      ]} />
    ),
  },

  // 84. CollectionView
  {
    key: "collection-view",
    label: "CollectionView",
    description: "검색과 필터가 가능한 카드 그리드 뷰",
    category: "Composites",
    href: "/design-system/composites/collection-view",
    preview: (
      <div className="grid grid-cols-2 gap-1.5 w-full max-w-[200px]">
        {["컴포넌트 A", "컴포넌트 B", "컴포넌트 C", "컴포넌트 D"].map((name) => (
          <div key={name} className="border border-border rounded-lg p-1.5 bg-white">
            <div className="text-[10px] font-medium text-foreground">{name}</div>
          </div>
        ))}
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="grid grid-cols-2 gap-1.5 w-full max-w-[200px]">{["Button", "Input", "Card", "Alert"].map((name) => <div key={name} className="border border-border rounded-lg p-1.5 bg-white"><div className="text-[10px] font-medium text-foreground">{name}</div></div>)}</div>,
        <div key="2" className="grid grid-cols-2 gap-1.5 w-full max-w-[200px]">{["Badge", "Avatar", "Tag", "Toggle"].map((name) => <div key={name} className="border border-border rounded-lg p-1.5 bg-white"><div className="text-[10px] font-medium text-foreground">{name}</div></div>)}</div>,
      ]} />
    ),
  },

  /* ================================================================ */
  /*  MISSING PATTERNS                                                 */
  /* ================================================================ */

  // 85. FilterBar
  {
    key: "filter-bar",
    label: "FilterBar",
    description: "검색과 필터를 결합한 필터 바 패턴",
    category: "Patterns",
    href: "/design-system/patterns/filter-bar",
    preview: (
      <div className="w-full max-w-[220px] flex items-center gap-2">
        <Input placeholder="검색..." className="flex-1 h-7 text-xs" />
        <Button size="sm" variant="secondary">필터</Button>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="w-full max-w-[300px]"><FilterBar searchValue="" onSearchChange={noop} searchPlaceholder="업무 검색..." onReset={noop} activeCount={0} /></div>,
        <div key="2" className="w-full max-w-[300px]"><FilterBar searchValue="" onSearchChange={noop} searchPlaceholder="업무 검색..." actions={<Button size="sm">내보내기</Button>} onReset={noop} activeCount={2} /></div>,
      ]} />
    ),
  },

  // 86. Sidebar
  {
    key: "sidebar",
    label: "Sidebar",
    description: "접을 수 있는 사이드바 네비게이션 패턴",
    category: "Patterns",
    href: "/design-system/patterns/sidebar",
    preview: (
      <div className="w-full max-w-[140px] border border-border rounded-lg bg-white p-2">
        {["대시보드", "프로젝트", "설정"].map((label, i) => (
          <div key={label} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer ${i === 0 ? "bg-primary-light text-primary font-medium" : "text-muted hover:bg-gray-50"}`}>
            <div className="w-3 h-3 rounded bg-current opacity-30" />
            {label}
          </div>
        ))}
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="w-full max-w-[140px] border border-border rounded-lg bg-white p-2">{["대시보드", "프로젝트", "설정"].map((label, i) => <div key={label} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer ${i === 0 ? "bg-primary-light text-primary font-medium" : "text-muted"}`}><div className="w-3 h-3 rounded bg-current opacity-20" />{label}</div>)}</div>,
        <div key="2" className="w-full max-w-[140px] border border-border rounded-lg bg-white p-2">{["대시보드", "프로젝트", "설정"].map((label, i) => <div key={label} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer ${i === 1 ? "bg-primary-light text-primary font-medium" : "text-muted"}`}><div className="w-3 h-3 rounded bg-current opacity-20" />{label}</div>)}</div>,
        <div key="3" className="w-full max-w-[140px] border border-border rounded-lg bg-white p-2">{["대시보드", "프로젝트", "설정"].map((label, i) => <div key={label} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer ${i === 2 ? "bg-primary-light text-primary font-medium" : "text-muted"}`}><div className="w-3 h-3 rounded bg-current opacity-20" />{label}</div>)}</div>,
      ]} />
    ),
  },

  // 87. Kanban
  {
    key: "kanban",
    label: "Kanban",
    description: "드래그 앤 드롭을 지원하는 칸반 보드",
    category: "Patterns",
    href: "/design-system/patterns/kanban",
    preview: (
      <div className="flex gap-1.5 w-full max-w-[220px]">
        {[
          { title: "할 일", items: ["업무 A", "업무 B"] },
          { title: "진행 중", items: ["업무 C"] },
          { title: "완료", items: ["업무 D"] },
        ].map((col) => (
          <div key={col.title} className="flex-1 bg-gray-50 rounded-lg p-1">
            <div className="text-[9px] font-semibold text-muted mb-1 px-1">{col.title}</div>
            {col.items.map((item) => (
              <div key={item} className="bg-white rounded px-1.5 py-1 text-[9px] text-foreground border border-border mb-0.5">{item}</div>
            ))}
          </div>
        ))}
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="flex gap-1.5 w-full max-w-[260px]">{[{ title: "할 일", items: ["UI 디자인", "API 연동"] }, { title: "진행 중", items: ["DB 설계"] }, { title: "완료", items: [] }].map((col) => <div key={col.title} className="flex-1 bg-gray-50 rounded-lg p-1.5"><div className="text-[9px] font-semibold text-muted mb-1 px-1">{col.title}</div>{col.items.map((item) => <div key={item} className="bg-white rounded px-1.5 py-1 text-[9px] text-foreground border border-border mb-0.5">{item}</div>)}</div>)}</div>,
        <div key="2" className="flex gap-1.5 w-full max-w-[260px]">{[{ title: "할 일", items: ["API 연동"] }, { title: "진행 중", items: ["DB 설계", "UI 디자인"] }, { title: "완료", items: [] }].map((col) => <div key={col.title} className="flex-1 bg-gray-50 rounded-lg p-1.5"><div className="text-[9px] font-semibold text-muted mb-1 px-1">{col.title}</div>{col.items.map((item) => <div key={item} className="bg-white rounded px-1.5 py-1 text-[9px] text-foreground border border-border mb-0.5">{item}</div>)}</div>)}</div>,
        <div key="3" className="flex gap-1.5 w-full max-w-[260px]">{[{ title: "할 일", items: [] }, { title: "진행 중", items: ["API 연동"] }, { title: "완료", items: ["DB 설계", "UI 디자인"] }].map((col) => <div key={col.title} className="flex-1 bg-gray-50 rounded-lg p-1.5"><div className="text-[9px] font-semibold text-muted mb-1 px-1">{col.title}</div>{col.items.map((item) => <div key={item} className="bg-white rounded px-1.5 py-1 text-[9px] text-foreground border border-border mb-0.5">{item}</div>)}</div>)}</div>,
      ]} />
    ),
  },

  // 88. StatsGrid
  {
    key: "stats-grid",
    label: "StatsGrid",
    description: "통계 카드를 그리드로 배치하는 패턴",
    category: "Patterns",
    href: "/design-system/patterns/stats-grid",
    preview: (
      <div className="grid grid-cols-2 gap-1.5 w-full max-w-[200px]">
        <StatCard label="사용자" value="1.2K" className="text-xs" />
        <StatCard label="매출" value="₩3.2M" className="text-xs" />
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <StatsGrid key="1" stats={[{ label: "총 업무", value: "142", change: "+12%", trend: "up" as const }, { label: "완료", value: "98", change: "+5", trend: "up" as const }]} columns={2} />,
        <StatsGrid key="2" stats={[{ label: "진행 중", value: "32" }, { label: "지연", value: "12", change: "+3", trend: "down" as const }]} columns={2} />,
      ]} />
    ),
  },

  // 89. ActionBar
  {
    key: "action-bar",
    label: "ActionBar",
    description: "벌크 액션을 위한 플로팅 액션 바",
    category: "Patterns",
    href: "/design-system/patterns/action-bar",
    preview: (
      <div className="w-full max-w-[220px] flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800 text-white">
        <span className="text-xs">3개 선택</span>
        <div className="flex-1" />
        <Button size="sm" variant="secondary" className="text-white border-white/20 bg-white/10 hover:bg-white/20">이동</Button>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="slide-up" frames={[
        <div key="1" className="w-full max-w-[260px] flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800 text-white"><span className="text-xs">3개 선택</span><div className="flex-1" /><Button size="sm" variant="secondary" className="text-white border-white/20 bg-white/10">이동</Button></div>,
        <div key="2" className="w-full max-w-[260px] flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800 text-white"><span className="text-xs">5개 선택</span><div className="flex-1" /><Button size="sm" variant="secondary" className="text-white border-white/20 bg-white/10">이동</Button><Button size="sm" variant="danger">삭제</Button></div>,
      ]} />
    ),
  },

  // 90. FormBuilder
  {
    key: "form-builder",
    label: "FormBuilder",
    description: "필드 배열로 폼을 자동 생성하는 빌더",
    category: "Patterns",
    href: "/design-system/patterns/form-builder",
    preview: (
      <div className="w-full max-w-[200px] flex flex-col gap-1.5">
        <div className="flex flex-col gap-0.5">
          <Label required>제목</Label>
          <Input placeholder="제목 입력" />
        </div>
        <Button size="sm" className="self-end mt-1">저장</Button>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="w-full max-w-[240px]"><FormBuilder fields={[{ name: "title", label: "제목", type: "text", required: true, placeholder: "프로젝트명" }]} onSubmit={noop} submitLabel="생성" columns={1} /></div>,
        <div key="2" className="w-full max-w-[240px]"><FormBuilder fields={[{ name: "title", label: "제목", type: "text", required: true, placeholder: "프로젝트명" }, { name: "desc", label: "설명", type: "textarea", placeholder: "프로젝트 설명" }]} onSubmit={noop} submitLabel="생성" columns={1} /></div>,
      ]} />
    ),
  },

  // 91. InfiniteList
  {
    key: "infinite-list",
    label: "InfiniteList",
    description: "무한 스크롤을 지원하는 리스트 패턴",
    category: "Patterns",
    href: "/design-system/patterns/infinite-list",
    preview: (
      <div className="w-full max-w-[180px] flex flex-col gap-1">
        {["항목 1", "항목 2", "항목 3"].map((item) => (
          <div key={item} className="text-xs text-foreground px-2 py-1.5 bg-gray-50 rounded-lg">{item}</div>
        ))}
        <div className="flex justify-center py-1">
          <Spinner size="sm" />
        </div>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="slide-up" frames={[
        <div key="1" className="w-full max-w-[200px] flex flex-col gap-1">{["항목 1", "항목 2", "항목 3"].map((item) => <div key={item} className="text-xs text-foreground px-2 py-1.5 bg-gray-50 rounded-lg">{item}</div>)}<div className="flex justify-center py-1"><Spinner size="sm" /></div></div>,
        <div key="2" className="w-full max-w-[200px] flex flex-col gap-1">{["항목 1", "항목 2", "항목 3", "항목 4", "항목 5"].map((item) => <div key={item} className="text-xs text-foreground px-2 py-1.5 bg-gray-50 rounded-lg">{item}</div>)}<div className="flex justify-center py-1"><Spinner size="sm" /></div></div>,
      ]} />
    ),
  },

  // 92. VirtualList
  {
    key: "virtual-list",
    label: "VirtualList",
    description: "대량 데이터를 위한 가상화 리스트",
    category: "Patterns",
    href: "/design-system/patterns/virtual-list",
    preview: (
      <div className="w-full max-w-[180px] flex flex-col gap-1">
        {["행 1", "행 2", "행 3", "행 4"].map((item) => (
          <div key={item} className="text-xs text-foreground px-2 py-1 bg-gray-50 rounded">{item}</div>
        ))}
        <div className="text-[10px] text-muted text-center">... 10,000+ 행</div>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="slide-up" frames={[
        <div key="1" className="w-full max-w-[200px] flex flex-col gap-1">{Array.from({ length: 4 }, (_, i) => <div key={i} className="text-xs text-foreground px-2 py-1 bg-gray-50 rounded flex items-center justify-between"><span>행 {i + 1}</span><span className="text-[10px] text-muted font-mono">ID-{String(i + 1).padStart(4, "0")}</span></div>)}<div className="text-[10px] text-center text-muted">... 10,000+ 행</div></div>,
        <div key="2" className="w-full max-w-[200px] flex flex-col gap-1">{Array.from({ length: 4 }, (_, i) => <div key={i} className="text-xs text-foreground px-2 py-1 bg-gray-50 rounded flex items-center justify-between"><span>행 {i + 5001}</span><span className="text-[10px] text-muted font-mono">ID-{String(i + 5001).padStart(4, "0")}</span></div>)}<div className="text-[10px] text-center text-muted">60fps 렌더링</div></div>,
      ]} />
    ),
  },

  // 93. ChartCard
  {
    key: "chart-card",
    label: "ChartCard",
    description: "데이터를 시각화하는 차트 카드 패턴",
    category: "Patterns",
    href: "/design-system/patterns/chart-card",
    preview: (
      <div className="w-full max-w-[200px]">
        <ChartCard
          title="매출 추이"
          type="sparkline"
          data={[
            { label: "1", value: 30 },
            { label: "2", value: 50 },
            { label: "3", value: 45 },
            { label: "4", value: 70 },
            { label: "5", value: 60 },
            { label: "6", value: 85 },
          ]}
        />
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="w-full max-w-[240px]"><ChartCard title="주간 매출" type="bar" data={[{ label: "월", value: 40 }, { label: "화", value: 55 }, { label: "수", value: 35 }, { label: "목", value: 70 }, { label: "금", value: 65 }]} trend={{ value: "+12%", direction: "up" }} /></div>,
        <div key="2" className="w-full max-w-[240px]"><ChartCard title="매출 추이" type="sparkline" data={[{ label: "1", value: 30 }, { label: "2", value: 50 }, { label: "3", value: 45 }, { label: "4", value: 70 }, { label: "5", value: 60 }, { label: "6", value: 85 }]} /></div>,
      ]} />
    ),
  },

  // 94. NotificationCenter
  {
    key: "notification-center",
    label: "NotificationCenter",
    description: "알림 목록을 관리하는 알림 센터",
    category: "Patterns",
    href: "/design-system/patterns/notification-center",
    preview: (
      <div className="flex items-center justify-center">
        <div className="relative">
          <div className="w-9 h-9 rounded-full border border-border bg-white flex items-center justify-center text-muted">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M13.5 6.75a4.5 4.5 0 10-9 0c0 5.25-2.25 6.75-2.25 6.75h13.5s-2.25-1.5-2.25-6.75zM10.3 15a1.5 1.5 0 01-2.6 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">3</div>
        </div>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="slide-up" frames={[
        <div key="1" className="w-full max-w-[220px] border border-border rounded-xl bg-white shadow-lg overflow-hidden"><div className="px-3 py-2 border-b border-border"><span className="text-xs font-semibold text-foreground">알림</span></div><div className="px-3 py-2 bg-blue-50/50"><div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /><span className="text-xs font-medium text-foreground">새 업무 할당</span></div><span className="text-[10px] text-muted">방금</span></div></div>,
        <div key="2" className="w-full max-w-[220px] border border-border rounded-xl bg-white shadow-lg overflow-hidden"><div className="px-3 py-2 border-b border-border"><span className="text-xs font-semibold text-foreground">알림</span></div><div className="px-3 py-2 bg-blue-50/50"><div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /><span className="text-xs font-medium text-foreground">코드 리뷰 요청</span></div><span className="text-[10px] text-muted">5분 전</span></div></div>,
        <div key="3" className="w-full max-w-[220px] border border-border rounded-xl bg-white shadow-lg overflow-hidden"><div className="px-3 py-2 border-b border-border"><span className="text-xs font-semibold text-foreground">알림</span></div><div className="px-3 py-2"><span className="text-xs font-medium text-foreground">배포 완료</span><br /><span className="text-[10px] text-muted">1시간 전</span></div></div>,
      ]} />
    ),
  },

  // 95. SortableList
  {
    key: "sortable-list",
    label: "SortableList",
    description: "드래그로 순서를 변경하는 정렬 가능 리스트",
    category: "Patterns",
    href: "/design-system/patterns/sortable-list",
    preview: (
      <div className="w-full max-w-[180px] flex flex-col gap-1">
        {["항목 1", "항목 2", "항목 3"].map((item) => (
          <div key={item} className="flex items-center gap-2 text-xs text-foreground px-2 py-1.5 bg-white border border-border rounded-lg">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-muted"><path d="M4 3h.01M4 6h.01M4 9h.01M8 3h.01M8 6h.01M8 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            {item}
          </div>
        ))}
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="slide-up" frames={[
        <div key="1" className="w-full max-w-[200px] flex flex-col gap-1">{["디자인 리뷰", "API 개발", "테스트 작성"].map((item, i) => <div key={item} className={`flex items-center gap-2 text-xs text-foreground px-2 py-1.5 bg-white border rounded-lg ${i === 0 ? "border-primary shadow-md" : "border-border"}`}>{item}</div>)}</div>,
        <div key="2" className="w-full max-w-[200px] flex flex-col gap-1">{["API 개발", "디자인 리뷰", "테스트 작성"].map((item, i) => <div key={item} className={`flex items-center gap-2 text-xs text-foreground px-2 py-1.5 bg-white border rounded-lg ${i === 1 ? "border-primary shadow-md" : "border-border"}`}>{item}</div>)}</div>,
        <div key="3" className="w-full max-w-[200px] flex flex-col gap-1">{["API 개발", "테스트 작성", "디자인 리뷰"].map((item, i) => <div key={item} className={`flex items-center gap-2 text-xs text-foreground px-2 py-1.5 bg-white border rounded-lg ${i === 2 ? "border-primary shadow-md" : "border-border"}`}>{item}</div>)}</div>,
      ]} />
    ),
  },

  // 96. RichTextEditor
  {
    key: "rich-text-editor",
    label: "RichTextEditor",
    description: "서식 지원 리치 텍스트 에디터",
    category: "Patterns",
    href: "/design-system/patterns/rich-text-editor",
    preview: (
      <div className="w-full max-w-[200px] border border-border rounded-lg bg-white overflow-hidden">
        <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-gray-50">
          {["B", "I", "U"].map((tool) => (
            <span key={tool} className="w-6 h-6 flex items-center justify-center text-[10px] font-bold text-muted rounded hover:bg-gray-200 cursor-pointer">{tool}</span>
          ))}
        </div>
        <div className="p-2 text-xs text-muted min-h-[30px]">내용을 입력하세요...</div>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="w-full max-w-[240px] border border-border rounded-lg bg-white overflow-hidden"><div className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-gray-50"><span className="w-6 h-6 flex items-center justify-center text-[10px] font-bold bg-gray-200 text-foreground rounded">B</span><span className="w-6 h-6 flex items-center justify-center text-[10px] font-bold text-muted rounded">I</span><span className="w-6 h-6 flex items-center justify-center text-[10px] font-bold text-muted rounded">U</span></div><div className="p-2 text-xs text-foreground"><p><strong>굵은 텍스트</strong> 예시</p></div></div>,
        <div key="2" className="w-full max-w-[240px] border border-border rounded-lg bg-white overflow-hidden"><div className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-gray-50"><span className="w-6 h-6 flex items-center justify-center text-[10px] font-bold text-muted rounded">B</span><span className="w-6 h-6 flex items-center justify-center text-[10px] font-bold bg-gray-200 text-foreground rounded">I</span><span className="w-6 h-6 flex items-center justify-center text-[10px] font-bold text-muted rounded">U</span></div><div className="p-2 text-xs text-foreground"><p><em>기울임 텍스트</em> 예시</p></div></div>,
      ]} />
    ),
  },

  // 97. Tour
  {
    key: "tour",
    label: "Tour",
    description: "UI 요소를 단계별로 안내하는 가이드 투어",
    category: "Patterns",
    href: "/design-system/patterns/tour",
    preview: (
      <div className="flex items-center gap-1">
        {[1, 2, 3].map((step, i) => (
          <div key={step} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-primary text-white" : "bg-gray-200 text-muted"}`}>{step}</div>
        ))}
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="border border-primary rounded-xl bg-white shadow-xl p-3 max-w-[200px]"><div className="text-xs font-semibold text-foreground mb-1">1/3 검색 기능</div><p className="text-[10px] text-muted mb-2">여기서 검색할 수 있습니다.</p><Button size="sm">다음</Button></div>,
        <div key="2" className="border border-primary rounded-xl bg-white shadow-xl p-3 max-w-[200px]"><div className="text-xs font-semibold text-foreground mb-1">2/3 필터 설정</div><p className="text-[10px] text-muted mb-2">필터를 적용할 수 있습니다.</p><Button size="sm">다음</Button></div>,
        <div key="3" className="border border-primary rounded-xl bg-white shadow-xl p-3 max-w-[200px]"><div className="text-xs font-semibold text-foreground mb-1">3/3 완료</div><p className="text-[10px] text-muted mb-2">가이드가 완료되었습니다.</p><Button size="sm">완료</Button></div>,
      ]} />
    ),
  },

  /* ================================================================ */
  /*  MISSING SECURITY                                                 */
  /* ================================================================ */

  // 98. PasswordInput
  {
    key: "password-input",
    label: "PasswordInput",
    description: "비밀번호 표시/숨김 토글이 있는 입력 필드",
    category: "Security",
    href: "/design-system/primitives/password-input",
    preview: (
      <div className="w-full max-w-[180px]">
        <PasswordInput placeholder="비밀번호" />
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="w-full max-w-[200px]"><Label required>비밀번호</Label><PasswordInput placeholder="비밀번호 입력" /></div>,
        <div key="2" className="w-full max-w-[200px]"><Label required>비밀번호</Label><PasswordInput placeholder="비밀번호 입력" showStrength /></div>,
        <div key="3" className="w-full max-w-[200px]"><Label>비밀번호 확인</Label><PasswordInput placeholder="다시 입력" /></div>,
      ]} />
    ),
  },

  // 99. PinInput
  {
    key: "pin-input",
    label: "PinInput",
    description: "PIN/OTP 코드를 입력하는 컴포넌트",
    category: "Security",
    href: "/design-system/primitives/pin-input",
    preview: (
      <PinInput length={4} numeric onChange={noop} />
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="flex flex-col items-center gap-2"><p className="text-xs text-muted">4자리 PIN</p><PinInput length={4} numeric onChange={noop} /></div>,
        <div key="2" className="flex flex-col items-center gap-2"><p className="text-xs text-muted">6자리 OTP</p><PinInput length={6} numeric onChange={noop} /></div>,
      ]} />
    ),
  },

  // 100. SecurityBadge
  {
    key: "security-badge",
    label: "SecurityBadge",
    description: "보안 수준을 표시하는 뱃지 컴포넌트",
    category: "Security",
    href: "/design-system/composites/security-badge",
    preview: (
      <div className="flex items-center gap-1.5">
        <SecurityBadge level="safe" showIcon />
        <SecurityBadge level="warning" showIcon />
        <SecurityBadge level="critical" showIcon />
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1000} transition="slide-up" frames={[
        <SecurityBadge key="verified" level="verified" showIcon />,
        <SecurityBadge key="safe" level="safe" showIcon />,
        <SecurityBadge key="warning" level="warning" showIcon />,
        <SecurityBadge key="critical" level="critical" showIcon />,
        <SecurityBadge key="unverified" level="unverified" showIcon />,
      ]} />
    ),
  },

  // 101. SecurityChecklist
  {
    key: "security-checklist",
    label: "SecurityChecklist",
    description: "보안 항목을 체크리스트로 표시하는 컴포넌트",
    category: "Security",
    href: "/design-system/patterns/security-checklist",
    preview: (
      <div className="w-full max-w-[200px] flex flex-col gap-1">
        {[
          { label: "2FA 활성화", ok: true },
          { label: "비밀번호 변경", ok: false },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${item.ok ? "bg-green-100" : "bg-red-100"}`}>
              {item.ok ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 5.5l2 2 3.5-3.5" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" /></svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 3l4 4M7 3l-4 4" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" /></svg>
              )}
            </div>
            <span className="text-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="w-full max-w-[240px]"><SecurityChecklist items={[{ key: "2fa", title: "2FA 인증", description: "활성화됨", status: "secure" }, { key: "pwd", title: "비밀번호", description: "최근 변경", status: "secure" }]} title="보안 점검" /></div>,
        <div key="2" className="w-full max-w-[240px]"><SecurityChecklist items={[{ key: "2fa", title: "2FA 인증", description: "활성화됨", status: "secure" }, { key: "ssl", title: "SSL 인증서", description: "만료됨", status: "insecure" }]} title="보안 점검" /></div>,
      ]} />
    ),
  },

  // 102. TrustIndicator
  {
    key: "trust-indicator",
    label: "TrustIndicator",
    description: "신뢰도를 항목별로 표시하는 인디케이터",
    category: "Security",
    href: "/design-system/composites/trust-indicator",
    preview: (
      <div className="w-full max-w-[180px]">
        <TrustIndicator
          items={[
            { key: "ssl", label: "SSL", status: "pass" },
            { key: "2fa", label: "2FA", status: "pass" },
            { key: "audit", label: "감사", status: "warning" },
          ]}
        />
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="w-full max-w-[220px]"><TrustIndicator title="보안 신뢰도" items={[{ key: "ssl", label: "SSL", status: "pass" }, { key: "2fa", label: "2FA", status: "pass" }]} /></div>,
        <div key="2" className="w-full max-w-[220px]"><TrustIndicator title="보안 신뢰도" items={[{ key: "ssl", label: "SSL", status: "pass" }, { key: "2fa", label: "2FA", status: "pass" }, { key: "audit", label: "감사", status: "warning" }, { key: "backup", label: "백업", status: "fail" }]} /></div>,
      ]} />
    ),
  },

  // 103. LoginForm
  {
    key: "login-form",
    label: "LoginForm",
    description: "이메일/비밀번호 로그인 폼 패턴",
    category: "Security",
    href: "/design-system/patterns/login-form",
    preview: (
      <div className="w-full max-w-[180px] flex flex-col gap-1.5">
        <Input placeholder="이메일" className="h-7 text-xs" />
        <Input placeholder="비밀번호" type="password" className="h-7 text-xs" />
        <Button size="sm" className="w-full">로그인</Button>
      </div>
    ),
    hoverDemo: (
      <AutoPlayDemo interval={1500} transition="fade" frames={[
        <div key="1" className="w-full max-w-[220px] p-3 border border-border rounded-xl bg-white shadow-lg"><h3 className="text-xs font-bold text-foreground text-center mb-2">로그인</h3><div className="flex flex-col gap-1.5"><Label>이메일</Label><Input placeholder="email@example.com" /><Button className="w-full" size="sm">로그인</Button></div></div>,
        <div key="2" className="w-full max-w-[220px] p-3 border border-border rounded-xl bg-white shadow-lg"><h3 className="text-xs font-bold text-foreground text-center mb-2">로그인</h3><div className="flex flex-col gap-1.5"><Label>이메일</Label><Input placeholder="email@example.com" /><Label>비밀번호</Label><PasswordInput placeholder="비밀번호" /><Button className="w-full" size="sm">로그인</Button></div></div>,
      ]} />
    ),
  },
];
