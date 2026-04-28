<div align="center">
  <h1>junDS</h1>
  <p><strong>레고처럼 조합하는 프로덕션 레디 디자인 프레임워크</strong></p>
  <p>
    <img src="https://img.shields.io/badge/components-219+-blue" alt="Components" />
    <img src="https://img.shields.io/badge/hooks-29-green" alt="Hooks" />
    <img src="https://img.shields.io/badge/tests-230%20passed-brightgreen" alt="Tests" />
    <img src="https://img.shields.io/badge/TypeScript-100%25-blue" alt="TypeScript" />
    <img src="https://img.shields.io/badge/license-commercial-orange" alt="License" />
  </p>
</div>

---

## Features

- **219+ 컴포넌트** — 38 Primitives, 117 Composites, 24 Patterns, 11 Layout
- **프레임워크 코어** — Box, Flex, Page, Heading, Text로 토큰 기반 레이아웃
- **반응형 Props** — `p={{ base: 2, md: 4 }}` 브레이크포인트별 제어
- **29개 커스텀 훅** — useForm, useBreakpoint, useIdle, useCountUp 등
- **18개 테마 프리셋** — 커스텀 색상 + 다크 모드 + 밀도/반경/간격 전역 제어
- **25기능 DataTable** — 검색, 필터, 정렬, 가상스크롤, CSV 내보내기, 인라인 편집
- **접근성 내장** — ARIA, 키보드 네비게이션, Focus Trap, Reduced Motion
- **Tree-shaking** — ESM/CJS 듀얼 빌드, sideEffects: false
- **230개 테스트** — Vitest + Testing Library

## Quick Start

### Installation

```bash
npm install @junds/ui
```

### Usage

```tsx
import { Button } from "@junds/ui";
import { Page, Heading } from "@junds/ui/core";

export default function App() {
  return (
    <Page maxWidth="lg">
      <Heading level={1}>Hello JunDS</Heading>
      <Button variant="primary">시작하기</Button>
    </Page>
  );
}
```

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

```bash
npm run dev          # Development server (port 6100)
npm run build        # Build Next.js app
npm run build:lib    # Build library (ESM + CJS + Types)
npm run test         # Run tests
npm run lint         # Lint code
npm run analyze      # Bundle size analysis
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
