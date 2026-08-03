# JunDS Icons — 자체 SVG 아이콘 셋 + 빌드타임 파이프라인

lucide-react 의존 절단(03-web-arch §7.2)을 위한 v3 자체 아이콘 시스템.
**소스 오브 트루스는 `icons/svg/*.svg`** — 전부 직접 드로잉했다(lucide 경로 복사·트레이싱 없음).
`icons/dist/`는 커밋되는 생성물이며, 웹 패키지 배선(§7.2의 `@junds/web/icons/*` 매핑)은 웹 트랙이 수행한다.

## 문법 (전 아이콘 공통 — check.mjs가 강제)

| 항목            | 값                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------ |
| 캔버스          | `viewBox="0 0 24 24"`                                                                            |
| 라이브 에어리어 | 3~21 (18×18) · 원형은 광학 보정 ±0.75 허용                                                       |
| 스트로크        | `1.5` · `currentColor` · round cap/join                                                          |
| 채움            | 전면 금지(`fill="none"` 루트 고정, 자식 fill 속성 불허) — 점(dot)도 소형 stroke 원               |
| 자식 요소       | path/circle/ellipse/rect/line/polyline/polygon만, 기하 속성만(색·굵기·transform 오버라이드 금지) |
| 이름            | kebab-case, 의미 우선(`X→close`, `AlertTriangle→warning`, `MousePointer→cursor`)                 |
| 반복 기하       | 셰브런 반폭·높이 4.25 / 화살촉 45° / 풀블리드 원 r9 / 대형 라운드 렉트 rx 2±0.5, 타일 rx 1.5     |

## 파이프라인 (의존성 0)

```bash
node icons/check.mjs   # 검증만: XML 정형성·문법·좌표 대역·별칭 무결성·lucide 커버리지
node icons/build.mjs   # 검증 후 dist/ + preview.html 재생성 (실패 시 미생성 exit 1)
```

산출물:

- `dist/icons/<name>.js` — `export const <camel>Icon = { name, svg }` (아이콘별 ESM, 트리셰이킹) + `.d.ts`
- `dist/index.js` — 전량 re-export + `iconNames` (+ `.d.ts`의 `JdIconDef`)
- `dist/sprite.svg` — `<symbol id="jd-<name>">` 심볼 스프라이트 (`<use href="sprite.svg#jd-check">`)
- `dist/aliases.json` — lucide 이름 → jd 이름 별칭표 (React 어댑터 AppIcon 무수정 마이그레이션용)
- `dist/meta.json` — 이름 목록·문법 요약 / `dist/package.json` — ESM 마커
- `preview.html` — 전 아이콘 카탈로그(검색·크기·그리드 오버레이·테마, 눈검수용)

## 범위 (77종)

- **lucide 사용분 73종** — v2 `ds/finance/AppIcon.tsx`가 import하던 전수. 별칭 커버리지 73/73,
  `check.mjs`의 `REQUIRED_LUCIDE`가 게이트로 강제한다.
- **패턴 보강 4종** — `copy` · `filter` · `pin` · `minimize`:
  `ds/patterns/DataTable/DataTableIcons.tsx` 인라인 SVG 중 본 셋에 없던 것(웹 트랙 DataTable 이식 대비).

### 사용 실태 전수표

사용처¹ = ds/·app/ 27개 소비 파일 내 리터럴 참조 수(2026-07-24 grep 기준, 동적 조립 제외라 하한값).
0인 33종은 v2 앱 잔재·미래 사용분이지만 `IconName` 공개 표면이므로 전수 제작했다.

| jd 이름          | lucide            | AppIcon 키      | 사용처¹ |
| ---------------- | ----------------- | --------------- | ------- |
| close            | X                 | close           | 8       |
| search           | Search            | search          | 7       |
| sparkles         | Sparkles          | sparkles        | 7       |
| trending-up      | TrendingUp        | trendingUp      | 7       |
| wallet           | Wallet            | wallet          | 7       |
| activity         | Activity          | activity        | 6       |
| info             | Info              | info            | 6       |
| trending-down    | TrendingDown      | trendingDown    | 6       |
| calendar         | Calendar          | calendar        | 5       |
| newspaper        | Newspaper         | newspaper       | 5       |
| banknote         | Banknote          | banknote        | 4       |
| chart-line       | LineChart         | lineChart       | 4       |
| crown            | Crown             | crown           | 4       |
| target           | Target            | target          | 4       |
| bell             | Bell              | bell            | 3       |
| calendar-check   | CalendarCheck     | calendarCheck   | 2       |
| chart-bar        | BarChart3         | barChart        | 2       |
| chevron-right    | ChevronRight      | chevronRight    | 2       |
| command          | Command           | command         | 2       |
| dashboard        | LayoutDashboard   | layoutDashboard | 2       |
| flame            | Flame             | flame           | 2       |
| grid             | Grid2x2           | grid2x2         | 2       |
| layout-grid      | LayoutGrid        | layoutGrid      | 2       |
| list-ordered     | ListOrdered       | listOrdered     | 2       |
| pencil           | Pencil            | pencil          | 2       |
| plus             | Plus              | plus            | 2       |
| settings         | Settings          | settings        | 2       |
| sliders          | SlidersHorizontal | sliders         | 2       |
| swap             | ArrowLeftRight    | swap            | 2       |
| warning          | AlertTriangle     | alert           | 2       |
| arrow-down       | ArrowDown         | arrowDown       | 1       |
| arrow-up         | ArrowUp           | arrowUp         | 1       |
| chevron-left     | ChevronLeft       | chevronLeft     | 1       |
| clock            | Clock             | clock           | 1       |
| external-link    | ExternalLink      | external        | 1       |
| lock             | Lock              | lock            | 1       |
| menu             | Menu              | menu            | 1       |
| moon             | Moon              | moon            | 1       |
| star             | Star              | star            | 1       |
| sun              | Sun               | sun             | 1       |
| arrow-left       | ArrowLeft         | arrowLeft       | 0       |
| arrow-right      | ArrowRight        | arrowRight      | 0       |
| building         | Building2         | building        | 0       |
| chart-pie        | PieChart          | pieChart        | 0       |
| check            | Check             | check           | 0       |
| chevron-down     | ChevronDown       | chevronDown     | 0       |
| chevron-up       | ChevronUp         | chevronUp       | 0       |
| chevrons-up-down | ChevronsUpDown    | chevronsUpDown  | 0       |
| columns          | Columns2          | columns2        | 0       |
| cursor           | MousePointer      | mousePointer    | 0       |
| download         | Download          | download        | 0       |
| equal            | Equal             | equal           | 0       |
| eraser           | Eraser            | eraser          | 0       |
| eye              | Eye               | eye             | 0       |
| eye-off          | EyeOff            | eyeOff          | 0       |
| globe            | Globe2            | globe           | 0       |
| hammer           | Hammer            | hammer          | 0       |
| magnet           | Magnet            | magnet          | 0       |
| maximize         | Maximize          | maximize        | 0       |
| minus            | Minus             | minus           | 0       |
| move             | Move              | move            | 0       |
| percent          | Percent           | percent         | 0       |
| plane            | Plane             | plane           | 0       |
| redo             | Redo              | redo            | 0       |
| refresh          | RefreshCw         | refresh         | 0       |
| rows             | Rows2             | rows2           | 0       |
| ruler            | Ruler             | ruler           | 0       |
| slash            | Slash             | slash           | 0       |
| square           | Square            | square          | 0       |
| trash            | Trash             | trash           | 0       |
| type             | Type              | type            | 0       |
| undo             | Undo              | undo            | 0       |
| wind             | Wind              | wind            | 0       |

패턴 보강분(lucide 별칭 동시 제공): copy(Copy) · filter(Filter) · pin(Pin) · minimize(Minimize).

## 아이콘 추가 절차

1. `icons/svg/<kebab-name>.svg`를 위 문법으로 직접 드로잉(복사·트레이싱 금지).
2. lucide 대응 이름이 있으면 `icons/aliases.json`에 별칭 추가.
3. `node icons/build.mjs` → `preview.html` 눈검수(16·24·48px, 라이트/다크) → dist까지 커밋.
