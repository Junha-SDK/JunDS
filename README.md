<div align="center">
  <h1>junDS</h1>
  <p><strong>레고처럼 조합하는 프로덕션 레디 디자인 프레임워크</strong></p>
  <p>
    <img src="https://img.shields.io/badge/components-190-blue" alt="Components" />
    <img src="https://img.shields.io/badge/hooks-30-green" alt="Hooks" />
    <img src="https://img.shields.io/badge/tests-589%20passed-brightgreen" alt="Tests" />
    <img src="https://img.shields.io/badge/a11y-audited-yellow" alt="A11y" />
    <img src="https://img.shields.io/badge/TypeScript-100%25-blue" alt="TypeScript" />
    <img src="https://img.shields.io/badge/MCP-14%20tools-purple" alt="MCP" />
    <img src="https://img.shields.io/badge/license-commercial-orange" alt="License" />
  </p>
  <p><sub>두 가지 사용 트랙 — <a href="#quick-start">React 라이브러리</a> · <a href="#use-with-ai-mcp">AI 에디터(MCP)</a></sub></p>
</div>

---

## Use with AI (MCP)

JunDS는 **MCP 서버를 내장**합니다. 이 리포지토리를 Cursor / Claude Code / Windsurf 같은 AI 에디터로 열면 219개 컴포넌트의 prop 시그니처·접근성 보고서·레시피·요구사항을 AI가 직접 조회해 코드를 만듭니다 — hallucination 없이.

**1) 자동 연결.** 이 저장소 루트의 [`.mcp.json`](./.mcp.json)이 에디터에 의해 자동 픽업됩니다. 별도 설정이 필요 없습니다.

```json
{
  "mcpServers": {
    "junds": { "command": "node", "args": ["mcp/server.mjs"] }
  }
}
```

**2) 자연어로 묻기.**

> "결제 카드 + 주요 액션 버튼 + 상태 뱃지로 화면 만들어줘"

AI가 아래 14개 도구로 정확한 import 경로와 prop을 찾아 코드를 만듭니다.

| 도구 | 용도 |
| --- | --- |
| `locate` | 자연어 쿼리로 컴포넌트 / 요구사항 / 페이지 랭킹 |
| `get_component_props` | 한국어 JSDoc 포함 prop 시그니처 |
| `list_recipes` · `read_recipe` | Modal+Form, DataTable 페이지 등 앱 레벨 조합 템플릿 |
| `list_requirements` · `read_requirement` | 기능 스펙 (단일 진실의 소스) |
| `list_hooks` | 훅 인벤토리 |
| `scaffold` | primitive · composite · pattern · hook · requirement · recipe 자동 생성 |
| `get_a11y` · `get_bundle_info` · `get_deps_for` · `get_screenshot_info` | 접근성 / 번들 사이즈 / 의존성 / 스크린샷 메타 |
| `extract_props` · `map_refresh` | 정적 인덱스 재생성 (husky 훅이 자동 실행) |

도구 입출력 스키마는 [`mcp/README.md`](./mcp/README.md), 에이전트 온보딩은 [`AGENTS.md`](./AGENTS.md) 참조.

> 💡 AI 도구 없이 React 라이브러리로만 쓰고 싶다면 아래 [Quick Start](#quick-start)부터 보세요.

---

## Features

- **190 컴포넌트** — 38 Primitives, 117 Composites, 24 Patterns, 11 Layout
- **프레임워크 코어** — Box, Flex, Page, Heading, Text로 토큰 기반 레이아웃
- **반응형 Props** — `p={{ base: 2, md: 4 }}` 브레이크포인트별 제어
- **30개 커스텀 훅** — useForm, useBreakpoint, useIdle, useCountUp 등
- **18개 테마 프리셋** — 커스텀 색상 + 다크 모드 + 밀도/반경/간격 전역 제어
- **25기능 DataTable** — 검색, 필터, 정렬, 가상스크롤, CSV 내보내기, 인라인 편집
- **접근성 내장** — ARIA, 키보드 네비게이션, Focus Trap, Reduced Motion (a11y 위반 0건)
- **Tree-shaking** — ESM/CJS 듀얼 빌드, sideEffects: false
- **476개 테스트** — Vitest + Testing Library (415 unit + 61 a11y audit)
- **AI-friendly** — `.ai/{MAP,props,recipes,bundle,deps,a11y,screenshots,coverage,css-vars}.json`, MCP 서버, scaffold CLI, husky 자동 동기화

## Quick Start

### Installation

```bash
# JunDS는 Tailwind CSS v4를 peer로 사용합니다.
npm install @junds/ui tailwindcss @tailwindcss/postcss
npm install --save-dev react react-dom   # 18+ (없는 경우)
```

`postcss.config.mjs` (Tailwind 4):

```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```

### 5분 시작

**1) 글로벌 스타일을 import 합니다.** Tailwind와 JunDS 빌드된 스타일을 한 곳에서:

```css
/* app/globals.css */
@import "tailwindcss";
@import "@junds/ui/styles.css";
```

**2) Provider로 앱을 감쌉니다.** `JunDSProvider`는 라이선스 키를 받아 테마/밀도/반경 등 디자인 토큰을 트리에 주입합니다.

```tsx
// app/providers.tsx
"use client";
import { JunDSProvider } from "@junds/ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JunDSProvider licenseKey={process.env.NEXT_PUBLIC_JUNDS_LICENSE_KEY ?? ""}>
      {children}
    </JunDSProvider>
  );
}
```

**3) 첫 컴포넌트를 사용합니다.**

```tsx
// app/page.tsx
import { Button, Card } from "@junds/ui";

export default function Home() {
  return (
    <Card hoverable>
      <Card.Header>환영합니다</Card.Header>
      <Card.Body>
        <Button variant="primary">시작하기</Button>
      </Card.Body>
    </Card>
  );
}
```

또는 `npx create-junds my-app` 한 줄로 위 단계가 모두 적용된 starter를 즉시 생성할 수 있습니다.

### Compose with `asChild` (Slot 패턴)

Radix-style `asChild` prop으로 root 엘리먼트를 사용자가 원하는 element(`<Link>`, `<button>` 등)로 위임할 수 있습니다. 디자인 시스템 스타일은 그대로 적용됩니다. `Card`, `Button` 등 주요 컴포넌트에서 지원합니다.

```tsx
import Link from "next/link";
import { Button, Card } from "@junds/ui";

// Card 전체를 Next Link로 위임 — 카드 영역 전체가 클릭 가능한 링크
<Card asChild hoverable>
  <Link href="/profile">
    <Card.Body>프로필로 이동</Card.Body>
  </Link>
</Card>

// Button을 a 태그로 위임 — leftIcon/loading은 자동 합쳐집니다
<Button asChild variant="primary" leftIcon={<PlusIcon />}>
  <a href="/new">새로 만들기</a>
</Button>
```

자세한 규약은 [`requirements/compound-api.md`](./requirements/compound-api.md)를 참고하세요.

### Framework Mode

```tsx
import { JunDSProvider } from "@junds/ui/core";

function App() {
  return (
    <JunDSProvider theme="purple" density="normal" radius="md">
      <YourApp />
    </JunDSProvider>
  );
}
```

## Architecture

```
┌─────────────────────────────────────┐
│           Patterns (24)             │  DataTable, FormWizard, Calendar...
├─────────────────────────────────────┤
│          Composites (117)           │  Modal, Tabs, Select, Toast...
├─────────────────────────────────────┤
│          Primitives (38)            │  Button, Input, Badge, Avatar...
├─────────────────────────────────────┤
│        Framework Core (15)          │  Box, Flex, Page, Heading, Text...
├─────────────────────────────────────┤
│      Tokens & Theme System          │  Colors, Spacing, Typography...
└─────────────────────────────────────┘
```

## Component Categories

### Primitives (38)
Button, Input, Textarea, Badge, Avatar, Spinner, Toggle, Checkbox, Radio, Switch, Slider, Tag, IconButton, Kbd, Label, NumberInput, FileUpload, CopyButton, PasswordInput, PinInput, OTPInput, CurrencyInput, PhoneInput, NumberFormatter, RangeSlider, StarRating, StatusDot, BackTop, Divider, Portal, ScrollArea, AspectRatio, ErrorBoundary, BatteryIndicator, SeverityBadge, VisuallyHidden, Announcer, FocusGuard

### Composites (117)
Modal, Tabs, Select, Toast, Drawer, Card, Alert, Accordion, Breadcrumb, Pagination, Tooltip, Popover, Dropdown, Combobox, MultiSelect, Timeline, Stepper, Table, Carousel, TreeView, DataGrid, MetricCard, Heatmap, DiffViewer, JSONViewer, CodeEditor, Rating, TagInput, SearchInput, SignaturePad, AddressInput, Marquee, AnimatedCounter, Typewriter, GradientBorder, SpotlightCard, BentoGrid, Dock, CopyBlock, CompareSlider, Confetti, InlineEdit, SkeletonPreset, Globe, MiniChart, ProgressRing, GaugeChart, FunnelChart, TreemapChart, MarkdownViewer, EmojiPicker, CronExpression, SwipeAction, PullToRefresh, BottomSheet, ActionSheet, QRCode, ColorSwatch, ImageCropper, VideoPlayer, AudioPlayer, Notification, Banner, ChatBubble, LoadingOverlay, Onboarding, and more...

### Patterns (24)
DataTable (25 features), FormWizard, FormArray, Form, FilterBar, CommandPalette, Sidebar, Calendar, Kanban, StatsGrid, ActionBar, FormBuilder, InfiniteList, VirtualList, ChartCard, NotificationCenter, SortableList, RichTextEditor, Tour, FlowDiagram, Starfield, MasonryGrid, LoginForm, SecurityChecklist

### Layout (11)
Stack, HStack, VStack, Grid, Container, Spacer, AppShell, Wrap, SimpleGrid, Show/Hide, AspectRatioBox, Overlay, LayoutDivider

### Hooks (29)
useForm, useClickOutside, useKeyboard, useMediaQuery, useLocalStorage, useDebounce, useCopyToClipboard, useToggle, useDisclosure, useBreakpoint, useReducedMotion, usePanelResize, useScrollSpy, useFocusMode, useIntersectionObserver, useCountUp, usePrefersColorScheme, useIdle, useNetworkStatus, useThrottle, usePrevious, useLongPress, useElementSize, useSteps, useClipboard, useInterval, useWindowScroll, useEventListener, useMounted

## Responsive Props

```tsx
<Box
  p={{ base: 2, md: 4, lg: 6 }}
  display={{ base: "block", md: "flex" }}
  fontSize={{ base: "sm", md: "md" }}
>
  Responsive content
</Box>

<SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} gap="lg">
  <Card>...</Card>
</SimpleGrid>
```

## Theme System

```tsx
// 18 built-in presets
<JunDSProvider theme="purple" />
<JunDSProvider theme="blue" />
<JunDSProvider theme="emerald" />

// Custom color
<JunDSProvider theme="#e11d48" />

// Global controls
<JunDSProvider
  theme="purple"
  colorMode="system"    // light | dark | system
  density="normal"      // compact | normal | comfortable
  radius="md"           // none | sm | md | lg | full
  spacing="default"     // tight | default | relaxed
/>
```

## Scripts

### 개발 / 빌드 / 테스트
```bash
npm run dev                # Development server (port 6100)
npm run build              # Build Next.js app
npm run build:lib          # Build library (ESM + CJS + Types)
npm test                   # Run tests
npm run test:types         # Prop signature contract tests (expect-type)
npm run coverage:report    # Coverage → .ai/coverage.json
npm run lint               # Lint code (ESLint + jsx-a11y)
npm run typecheck          # tsc --noEmit
npm run analyze            # Bundle size analysis
npm run audit:a11y         # axe-core a11y audit → .ai/a11y.json
npm run validate:requirements  # Requirements/* integrity check
```

### AI / 에이전트 인프라
```bash
npm run scaffold <kind> <Name>  # primitive | composite | pattern | hook | requirement | recipe
npm run map                # .ai/MAP.md
npm run extract-props      # .ai/props.json
npm run extract-css-vars   # .ai/css-vars.json
npm run build:report       # .ai/bundle.json + .ai/deps.json
npm run docs:components    # COMPONENTS.md from props.json
npm run capture-screenshots  # .ai/screenshots.json
npm run mcp                # MCP server (stdio)
npm run storybook          # Storybook with addon-a11y
```

## Tech Stack

- **React 18+** — Concurrent features, Suspense
- **TypeScript** — 100% type coverage
- **Tailwind CSS 4** — Utility-first styling
- **Next.js 16** — App Router, Turbopack
- **Vitest** — Fast unit testing
- **Rollup** — Library bundling (ESM/CJS/DTS)

## Browser Support

| Chrome | Firefox | Safari | Edge |
|--------|---------|--------|------|
| 90+    | 90+     | 15+    | 90+  |

## License

Commercial License. See [LICENSE](./LICENSE) for details.

---

<div align="center">
  <p>Built with ❤️ by <strong>Junha</strong></p>
</div>
