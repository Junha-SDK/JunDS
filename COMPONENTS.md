# junDS — 디자인 시스템 컴포넌트 레퍼런스

> AI가 이 파일을 참조하여 일관된 컴포넌트를 사용할 수 있도록 작성됨.
> 모든 컴포넌트는 `src/ds/` 아래에 위치하며, `@/ds`로 import 가능.

## 사용법

```tsx
// 개별 import (권장 — 트리쉐이킹)
import { Button } from "@/ds/primitives/Button";
import { Modal } from "@/ds/composites/Modal";
import { DataTable } from "@/ds/patterns/DataTable";

// barrel import
import { Button, Modal, DataTable } from "@/ds";
```

## 유틸리티

| 이름 | 경로 | 설명 |
|------|------|------|
| `cn()` | `@/ds/utils/cn` | clsx + twMerge. 조건부 클래스 병합 |

## 공용 Hooks

| Hook | 경로 | 설명 |
|------|------|------|
| `useClickOutside` | `@/ds/hooks` | ref 외부 클릭 감지 |
| `useKeyboard` | `@/ds/hooks` | 키보드 단축키 바인딩 |
| `useMediaQuery` | `@/ds/hooks` | 미디어 쿼리 매칭 |
| `useLocalStorage` | `@/ds/hooks` | localStorage 동기화 상태 |
| `useDebounce` | `@/ds/hooks` | 값 디바운스 |

## Layout

| 컴포넌트 | Props | 예시 |
|---------|-------|------|
| `Stack` | `direction`, `gap`, `align`, `justify` | `<Stack gap={4}>...</Stack>` |
| `HStack` | `gap`, `align` | `<HStack gap={2}>...</HStack>` |
| `VStack` | `gap`, `align` | `<VStack gap={3}>...</VStack>` |
| `Grid` | `cols`, `gap` | `<Grid cols={3} gap={4}>...</Grid>` |
| `Container` | `size: sm\|md\|lg\|xl\|full` | `<Container size="lg">...</Container>` |
| `Spacer` | `size: 1-16` | `<Spacer size={4} />` |

---

## Primitives (Atoms)

### Button
```tsx
<Button variant="primary|secondary|danger|ghost|outline|link" size="xs|sm|md|lg" loading leftIcon={<Icon/>} fullWidth>
  텍스트
</Button>
```

### Input
```tsx
<Input inputSize="sm|md|lg" error leftSlot={<SearchIcon/>} rightSlot={<ClearIcon/>} placeholder="검색..." />
```

### Textarea
```tsx
<Textarea autoResize showCount maxLength={500} error placeholder="설명" />
```

### Badge
```tsx
<Badge variant="default|primary|success|warning|danger|info|outline" size="sm|md|lg" dot>라벨</Badge>
<Badge count={42} maxCount={99} />
```

### Avatar
```tsx
<Avatar name="김준하" size="xs|sm|md|lg|xl" status="online|offline|away|busy" />
<Avatar src="/photo.jpg" size="lg" />
```

### Spinner
```tsx
<Spinner size="xs|sm|md|lg" color="primary|white|muted" />
```

### Divider
```tsx
<Divider />
<Divider label="또는" />
<Divider orientation="vertical" />
```

### Toggle
```tsx
<Toggle checked={on} onChange={setOn} label="알림" size="sm|md" disabled />
```

### Checkbox
```tsx
<Checkbox label="동의" checked={ok} onChange={handler} indeterminate size="sm|md" />
```

### RadioGroup
```tsx
<RadioGroup name="priority" options={[{value:"0",label:"긴급"}]} value={v} onChange={setV} direction="horizontal|vertical" />
```

### Label
```tsx
<Label htmlFor="name" required>이름</Label>
```

### Tag
```tsx
<Tag color="gray|primary|blue|green|red|orange|purple|teal" closable onClose={handler}>태그</Tag>
```

### IconButton
```tsx
<IconButton icon={<CloseIcon/>} label="닫기" variant="ghost|outline|filled" size="xs|sm|md|lg" />
```

### Kbd
```tsx
<Kbd keys={["⌘","K"]} />
```

### Portal
```tsx
<Portal>모달 내용</Portal>
```

### VisuallyHidden
```tsx
<VisuallyHidden>스크린리더용 텍스트</VisuallyHidden>
```

---

## Composites (Molecules)

### Select
```tsx
<Select
  options={[{value:"a",label:"옵션A"}]}
  value={v} onChange={setV}
  searchable size="sm|md|lg" fullWidth
  placeholder="선택하세요"
/>
```

### MultiSelect
```tsx
<MultiSelect
  options={[{value:"fe",label:"프론트엔드"}]}
  value={selected} onChange={setSelected}
  searchable maxDisplay={3}
/>
```

### FormField
```tsx
<FormField label="이름" required error="필수 입력" hint="2자 이상">
  <Input id="name" error={!!errors.name} />
</FormField>
```

### Modal
```tsx
<Modal open={isOpen} onClose={close} size="sm|md|lg|xl|full" dismissible>
  <Modal.Header onClose={close}>제목</Modal.Header>
  <div className="p-5">내용</div>
  <Modal.Footer>
    <Button variant="secondary" onClick={close}>취소</Button>
    <Button onClick={submit}>확인</Button>
  </Modal.Footer>
</Modal>
```

### Toast (DsToastProvider + useDsToast)
```tsx
// layout에 Provider 감싸기
<DsToastProvider position="bottom-right" maxToasts={5}>
  <App />
</DsToastProvider>

// 컴포넌트 내에서
const { success, error, warning, info, toast } = useDsToast();
success("저장되었습니다");
toast("커스텀 메시지", "info", 5000);
```

### Dropdown
```tsx
<Dropdown
  trigger={<IconButton icon={<MoreIcon/>} label="메뉴" />}
  items={[
    { key:"edit", label:"수정" },
    { key:"div", label:"", divider:true },
    { key:"delete", label:"삭제", danger:true },
  ]}
  onSelect={handleAction}
  align="left|right"
/>
```

### Tabs
```tsx
<Tabs
  tabs={[{value:"all",label:"전체",badge:42}]}
  value={tab} onChange={setTab}
  variant="underline|pills|segment"
  size="sm|md"
/>
```

### Accordion
```tsx
<Accordion
  items={[{key:"1",title:"FAQ",content:<p>답변</p>,defaultOpen:true}]}
  single
/>
```

### Breadcrumb
```tsx
<Breadcrumb items={[{label:"홈",href:"/"},{label:"설정"}]} />
```

### ProgressBar
```tsx
<ProgressBar value={75} max={100} variant="default|success|warning|danger" size="sm|md|lg" showLabel label="진행률" />
```

### ProgressSteps
```tsx
<ProgressSteps current={3} total={5} labels={["접수","진행","검토","테스트","완료"]} />
```

### Tooltip
```tsx
<Tooltip content="저장합니다" position="top|bottom|left|right" delay={200}>
  <Button>저장</Button>
</Tooltip>
```

### Popover
```tsx
<Popover trigger={<Button>열기</Button>} content={<div>내용</div>} align="left|right|center" side="top|bottom" />
```

### Card
```tsx
<Card hoverable>
  <Card.Header>제목</Card.Header>
  <Card.Body>내용</Card.Body>
  <Card.Footer><Button>확인</Button></Card.Footer>
</Card>
```

### Alert
```tsx
<Alert variant="info|success|warning|danger" title="주의" onClose={dismiss}>
  메시지 내용
</Alert>
```

### EmptyState
```tsx
<EmptyState title="데이터 없음" description="새 항목을 추가하세요" action={<Button>추가</Button>} />
```

### Skeleton
```tsx
<Skeleton variant="text" lines={3} />
<Skeleton variant="circle" width={40} height={40} />
<Skeleton variant="rect" width="100%" height={200} />
```

### Pagination
```tsx
<Pagination page={page} totalPages={20} onChange={setPage} siblings={1} />
```

### DateInput
```tsx
<DateInput value={date} onChange={e=>setDate(e.target.value)} onClear={()=>setDate("")} error />
```

---

## Patterns (Organisms)

### DataTable
```tsx
<DataTable<User>
  columns={[
    { key:"name", header:"이름", render:r=><span>{r.name}</span>, sortable:true, sortFn:(a,b)=>a.name.localeCompare(b.name) },
  ]}
  data={users}
  rowKey={r=>r.id}
  selectable selectedKeys={selected} onSelectionChange={setSelected}
  pageSize={20} striped
  onRowClick={handleClick}
/>
```

### FilterBar
```tsx
<FilterBar
  searchValue={q} onSearchChange={setQ}
  filters={<Select ... />}
  actions={<Button>내보내기</Button>}
  onReset={clear} activeCount={2}
/>
```

### CommandPalette
```tsx
<CommandPalette
  items={[{id:"1",label:"설정",group:"Navigation",action:()=>router.push("/settings"),keywords:["config"]}]}
  open={open} onOpenChange={setOpen}
/>
// ⌘K로 자동 토글
```

### Sidebar (DsSidebarProvider + DsSidebar + SidebarLink + SidebarSection)
```tsx
<DsSidebarProvider defaultCollapsed={false}>
  <DsSidebar header={<Logo/>} footer={<Version/>} width={264} collapsedWidth={68}>
    <SidebarSection title="메뉴">
      <SidebarLink href="/" label="홈" icon={<HomeIcon/>} active badge={3} />
    </SidebarSection>
  </DsSidebar>
</DsSidebarProvider>
```

### Calendar (DsCalendar)
```tsx
<DsCalendar
  events={[{id:"1",date:"2026-04-19",label:"미팅",color:"#5b4cc7"}]}
  onDateClick={handleDateClick}
  renderDay={(date,events)=> <CustomCell/>}  // optional
/>
```

### Kanban
```tsx
<Kanban<Task>
  columns={[{id:"todo",title:"할 일",color:"#6b7280",items:[...]},{id:"doing",title:"진행 중",items:[...]}]}
  renderCard={(item) => <TaskCard task={item} />}
  onMove={(itemId, from, to) => handleMove(itemId, from, to)}
/>
```

### StatsGrid
```tsx
<StatsGrid stats={[
  { label:"총 업무", value:142, change:"+12%", trend:"up" },
  { label:"완료", value:98, change:"+5", trend:"up" },
  { label:"진행 중", value:32 },
  { label:"지연", value:12, change:"+3", trend:"down" },
]} columns={4} />
```

### ActionBar (플로팅 벌크 액션)
```tsx
<ActionBar
  open={selected.size > 0}
  count={selected.size}
  onClear={() => setSelected(new Set())}
  actions={<>
    <Button size="sm" variant="secondary">이동</Button>
    <Button size="sm" variant="danger">삭제</Button>
  </>}
/>
```

---

## 추가 Primitives (고도화)

### Slider
```tsx
<Slider value={50} onChange={setValue} min={0} max={100} step={5} showValue color="primary|success|warning|danger" />
<Slider marks={[{value:0,label:"0%"},{value:100,label:"100%"}]} />
```

### NumberInput
```tsx
<NumberInput value={count} onChange={setCount} min={0} max={100} step={5} size="sm|md|lg" hideControls />
```

### FileUpload
```tsx
<FileUpload onFiles={handleFiles} accept="image/*,.pdf" multiple maxSize={5*1024*1024} description="파일을 드래그하세요" />
```

### CopyButton
```tsx
<CopyButton text="복사할 텍스트" variant="icon|button" size="sm|md" label="코드 복사" />
```

### StatusDot
```tsx
<StatusDot status="success|warning|danger|info|neutral|pulse" label="온라인" size="sm|md|lg" />
```

---

## 추가 Composites (고도화)

### Drawer (슬라이드 인 패널)
```tsx
<Drawer open={isOpen} onClose={close} side="right|left|bottom" size="sm|md|lg|xl" title="필터">
  <FilterContent />
</Drawer>
```

### ConfirmDialog
```tsx
<ConfirmDialog open={show} onClose={close} onConfirm={handleDelete} title="삭제하시겠습니까?" description="되돌릴 수 없습니다." danger confirmLabel="삭제" loading={isPending} />
```

### Combobox (자동완성 + 생성)
```tsx
<Combobox options={[{value:"1",label:"김준하",description:"프론트엔드"}]} value={v} onChange={setV} creatable searchable loading={isLoading} />
```

### StatCard
```tsx
<StatCard label="총 업무" value={142} change="+12%" trend="up|down|neutral" description="지난 주 대비" />
```

### Timeline
```tsx
<Timeline items={[
  { key:"1", title:"생성", time:"10:00", color:"primary" },
  { key:"2", title:"진행 시작", description:"담당자 배정", time:"11:30", color:"success" },
]} lineStyle="solid|dashed" />
```

### ButtonGroup
```tsx
<ButtonGroup separated fullWidth>
  <Button variant="secondary">왼쪽</Button>
  <Button variant="secondary">중앙</Button>
  <Button variant="secondary">오른쪽</Button>
</ButtonGroup>
```

### AvatarStack
```tsx
<AvatarStack names={["김준하","이서연","박민수","최유진","정다은"]} max={3} size="sm|md|lg" />
```

---

## 추가 Hooks

| Hook | 설명 | 예시 |
|------|------|------|
| `useCopyToClipboard` | 클립보드 복사 | `const { copied, copy } = useCopyToClipboard()` |
| `useToggle` | 불린 토글 | `const { value, toggle } = useToggle()` |
| `useDisclosure` | open/close 관리 | `const { isOpen, open, close } = useDisclosure()` |

---

## 디자인 토큰

CSS 변수 기반 — `globals.css`에 정의, TypeScript에서 `@/ds/tokens`로 참조.

| 카테고리 | 주요 값 |
|---------|---------|
| Primary | `#5b4cc7` (hover: `#4a3db0`, light: `#eceafc`) |
| Success | `#2f8f57` |
| Warning | `#b7791f` |
| Danger | `#dc3f3f` |
| Background | `#f5f4f8` |
| Foreground | `#1a1726` |
| Border | `#e2dfe8` |
| Font | Geist Sans / Geist Mono |

## 추가 Patterns (고도화 v1.1)

### FormBuilder (선언적 폼)
```tsx
<FormBuilder
  fields={[
    { name:"title", label:"제목", type:"text", required:true },
    { name:"desc", label:"설명", type:"textarea" },
    { name:"priority", label:"우선순위", type:"select", options:[{value:"0",label:"긴급"}] },
  ]}
  onSubmit={handleSubmit}
  columns={2}
/>
```

### InfiniteList (무한 스크롤)
```tsx
<InfiniteList items={data} renderItem={(item)=><Row>{item.name}</Row>} keyExtractor={i=>i.id} onLoadMore={fetchMore} hasMore={hasNext} loading={isFetching} />
```

### VirtualList (가상화 — 10,000+ 행)
```tsx
<VirtualList items={bigData} itemHeight={40} height={400} renderItem={(item)=><Row>{item.name}</Row>} keyExtractor={i=>i.id} />
```

### ChartCard (SVG 차트 — bar, donut, sparkline)
```tsx
<ChartCard title="주간 완료" type="bar|donut|sparkline" data={[{label:"월",value:12},{label:"화",value:8}]} />
```

### NotificationCenter (알림 센터)
```tsx
<NotificationCenter notifications={[{id:"1",title:"새 업무",time:"방금",read:false}]} onMarkAllRead={markAll} />
```

### SortableList (드래그 정렬)
```tsx
<SortableList items={tasks} renderItem={(t)=><div>{t.name}</div>} onReorder={setTasks} showHandle />
```

### RichTextEditor (위지윅 에디터)
```tsx
<RichTextEditor value={html} onChange={setHtml} placeholder="내용..." minHeight={200} />
```

---

## 테마 시스템

```tsx
import { applyTheme, themePresets, generateTheme } from "@/ds/tokens/themes";

// 프리셋 적용 (purple, blue, teal, green, orange, rose, indigo, slate, amber, cyan)
applyTheme("blue");

// 커스텀 색상
applyTheme({ name: "custom", primary: "#e11d48" });

// 다크 모드: document.documentElement.setAttribute("data-theme", "dark")
```

## Showcase

`/design-system` 경로에서 모든 컴포넌트를 라이브로 확인할 수 있습니다.

### 고급 페이지
- `/design-system/advanced/dependency-graph` — 컴포넌트 의존성 그래프
- `/design-system/advanced/token-export` — 토큰 내보내기 (CSS/SCSS/JSON/Tailwind)
- `/design-system/advanced/ai-prompt` — AI 프롬프트 자동 생성기
- `/design-system/advanced/changelog` — 버전별 변경 이력
