# 05. 데일리

[← 목차](../USAGE-MYSELF.md) · [← 04 독스](04-docs.md)

MySelf 대응: `features/daily/{DailyArchive,DailyStats,DetailOverlay,CoverImage,ArtGlobe,GlobeWireframe,Starfield,SpoilerBlock}` · `hooks/useDailyFilters`

## 1. 카테고리 색 — `categoryColors`

MySelf 의 `--cat-*` 변수가 JunDS 토큰으로 들어왔다. 값은 그대로다.

```tsx
import { getCategoryColor, categoryColorVars } from "@junds/ui/tokens";

// ① 값으로 쓰기
const c = getCategoryColor(post.category);   // movie/daily/comic/retrospect/book/musical/anime
<span style={{ background: c.soft, borderColor: c.border, color: c.text }}>
  {label}
</span>

// ② CSS 변수로 펼치기 — 자식들이 var(--cat-accent) 로 참조
<article style={categoryColorVars(post.category)}>
  <span className="dot" />       {/* background: var(--cat-accent) */}
  <span className="chip" />      {/* background: var(--cat-soft); color: var(--cat-text) */}
</article>
```

세트는 4슬롯이다.

| 슬롯 | 쓰임 |
|---|---|
| `accent` | 점·아이콘 등 채도 높은 단색 |
| `soft` | 뱃지/칩 배경 (저채도 반투명) |
| `border` | `soft` 배경 위 테두리 |
| `text` | `soft` 배경 위에서 대비를 확보하는 밝은 글자색 |

모르는 이름은 `neutral` 로 떨어진다 — 새 카테고리가 생겨도 색이 없어 깨지지 않는다.

```css
/* CSS 로만 쓸 수도 있다 — styles.css 가 이미 :root 에 넣었다 */
.badge--movie { background: var(--cat-movie-soft); border-color: var(--cat-movie-border); color: var(--cat-movie-text); }
```

> 어두운 배경 기준으로 튜닝된 값이다. MySelf 는 다크 고정이라 그대로 맞는다. 밝은 테마를
> 쓸 일이 생기면 `accent` 만 살리고 `soft`/`text` 는 앱에서 덮어쓴다.

## 2. 필터 — `useUrlFilters`

`useDailyFilters`(254줄) 중 **필터 상태 ↔ URL 동기화**가 JunDS 로 왔다. 정렬·집계 로직은
MySelf 에 남는다.

```tsx
import { useUrlFilters } from "@junds/ui/hooks";

const { filters, set, patch, reset, activeCount } = useUrlFilters(
  {
    category: "all",
    sort: "desc",
    q: "",
    mood: "",
    provider: "",
    tag: "",
    score: "all",
    status: "all",     // 집필 상태 — 로컬 전용
  },
  {
    // 집필 상태는 배포 주소에 새면 안 된다
    transient: ["status"],
    // URL 은 손으로 고칠 수 있다 — 모르는 값은 기본값으로
    parse: {
      category: (raw) => (VALID_CATEGORIES.has(raw) ? raw : undefined),
      sort: (raw) => (["desc", "asc", "score"].includes(raw) ? raw : undefined),
      score: (raw) => (VALID_SCORES.has(raw) ? raw : undefined),
    },
  },
);

const posts = useMemo(() => applyFilters(DAILY_POSTS, filters), [filters]);
```

`patch` 로 여러 키를 한 번에 바꾼다(예: 카테고리를 고르면 태그를 지운다).

```tsx
const pickCategory = (c: string) => patch({ category: c, tag: "" });
```

뒤로/앞으로 가기(`popstate`)도 따라가므로, 필터를 바꾸다 뒤로 가면 이전 조건이 복원된다.

## 3. 커버 이미지 — `ImageWithFallback`

MySelf 의 `CoverImage`(171줄)가 하던 재시도·소생을 `ImageWithFallback` 이 흡수했다.
**두 기능 모두 기본이 꺼져 있으니 켠다.**

```tsx
import { ImageWithFallback } from "@junds/ui/composites";

<ImageWithFallback
  src={post.cover}
  alt=""
  aspectRatio="3/4"
  retry={3}      // ← 0.5s → 1s → 2s 지수 백오프. 이 구간엔 스켈레톤 유지
  revive         // ← 폴백 후에도 백그라운드로 계속 되살린다
  fallback={<CategoryLabel category={post.category} />}
/>
```

| prop | 없으면 |
|---|---|
| `retry={3}` | 네트워크가 한 번 흔들리면 바로 폴백 — 모바일 동시 로드 제한에서 자주 걸린다 |
| `revive` | 이미지 호스트가 잠깐 죽으면 **새로고침 전까지 영영 폴백으로 굳는다** |

`revive` 의 동작: 오프스크린 `new Image()` 프로브로 5s → 15s → 45s → 2m → 5m(이후 반복)
주기로 확인하고, 네트워크 복구(`online`)나 탭 복귀(`visibilitychange`)에는 **즉시** 다시
시도한다. 프로브가 성공하면 브라우저 캐시가 데워진 뒤 같은 URL 로 교체되므로 깜빡임 없이
이미지가 나타난다. DOM 의 `<img>` 를 건드리지 않아 폴백 ↔ 스켈레톤이 깜빡이지 않는다.

폴백은 두 가지다.

```tsx
<ImageWithFallback src={x} fallbackSrc="/placeholder.png" />   {/* 대체 이미지 */}
<ImageWithFallback src={x} fallback={<CategoryLabel />} />     {/* 임의 노드 */}
```

> 근본 대책은 커버를 셀프호스팅으로 미러링하는 것이다(`scripts/sync-daily-covers.ts`).
> 이 컴포넌트는 그 위의 최종 안전망이다.

## 4. 통계 — `StatsGrid` + `BarList`

`DailyStats`(212줄)는 **집계 로직 + 카드 + 막대 목록**이었다. 집계는 MySelf 에 남고,
표시는 둘로 나뉜다.

```tsx
import { StatsGrid } from "@junds/ui/patterns";
import { BarList } from "@junds/ui/composites";

// 상단 요약 카드
<StatsGrid
  columns={4}
  stats={[
    { label: "총 기록", value: stats.total },
    { label: "평균 별점", value: stats.avg.toFixed(1) },
    { label: "최다 카테고리", value: stats.topCategory?.label ?? "—" },
    { label: "이번 달", value: stats.thisMonth, change: `+${stats.delta}`, trend: "up" },
  ]}
/>

// 분포 막대
<div className="grid gap-6 sm:grid-cols-2">
  <section>
    <h3>카테고리</h3>
    <BarList items={categoryRows} sorted formatValue={(v) => `${v}편`} />
  </section>
  <section>
    <h3>별점 분포</h3>
    {/* 별점은 5→0 순서가 의미이므로 sorted 를 쓰지 않는다 */}
    <BarList items={scoreRows} max={stats.total} formatValue={(v) => `${v}편`} />
  </section>
  <section>
    <h3>플랫폼</h3>
    <BarList items={providerRows} sorted limit={5} />
  </section>
  <section>
    <h3>월별</h3>
    <BarList items={monthlyRows} color="var(--cat-daily)" />
  </section>
</div>
```

`BarListItem` 은 `{ key?, label, value, color?, href? }`.

- **`max` 를 고정하면 여러 목록의 눈금이 맞는다.** 안 주면 각 목록의 최댓값이 100% 가 되어
  서로 비교가 안 된다.
- `sorted` 는 값 내림차순. **순서 자체가 의미인 목록(별점 5→0, 월별)에는 쓰지 않는다.**
- 막대는 `aria-hidden` 이고 스크린리더에는 "이름 값"만 읽힌다 — 막대를 못 봐도 같은 정보를
  얻는다.
- `href` 를 주면 행 전체가 링크가 된다(카테고리별 필터 링크 등).

## 5. 상세 오버레이

`DetailOverlay`(369줄)는 데일리 데이터에 묶인 화면이라 그대로 옮기지 않았다. 껍데기는
`Modal` 또는 `Drawer` 로 짓는다.

```tsx
import { Modal } from "@junds/ui/composites";

<Modal open={!!selected} onClose={() => setSelected(null)} size="lg">
  <Modal.Header onClose={() => setSelected(null)}>{selected?.title}</Modal.Header>
  <div className="px-6 py-4">
    <MarkdownViewer content={selected.body} kinsoku breaks />
  </div>
</Modal>
```

`Modal` 이 포커스 트랩·Escape·백드롭·스크롤 잠금·포털을 전부 갖고 있으니, MySelf 의
`DetailSheet` 처럼 직접 구현할 필요가 없다.

커버색으로 물든 몰입형 오버레이가 필요하면 [07 §4](07-portfolio-music.md) 의
`NowPlayingFull` 이 같은 기법(`useDominantColor` + `Modal` className 덮어쓰기)을 쓴다.

## 6. 아트 모드 — `Starfield` · `GlobeWireframe`

### 별 배경

```tsx
import { Starfield } from "@junds/ui/patterns";

<Starfield
  starCount={220}
  shootingStarInterval={4000}
  backgroundColor="#0c0c10"
  className="fixed inset-0 -z-10"
/>
```

### 와이어프레임 지구본

`ArtGlobe`(294줄)에서 **지구본 자체**만 뽑았다. 포스트를 구면에 배치하고 히트테스트하는
로직은 데일리 데이터에 묶여 있어 MySelf 에 남는다.

```tsx
import { GlobeWireframe, type GlobeRotation } from "@junds/ui/composites";

// 같은 각도로 마커를 겹쳐 그리려면 회전 상태를 공유한다
const rot = useRef<GlobeRotation>({ rotY: 0, rotX: 0.3 });

<div className="relative">
  <GlobeWireframe
    size={520}
    rotationRef={rot}
    latitudes={8}
    longitudes={14}
    autoRotate={0.002}
    draggable
    strokeColor="rgba(130, 160, 220, 1)"
    maxOpacity={0.13}
  />
  {/* rot.current 를 읽어 같은 투영으로 포스트 마커를 그린다 */}
  <PostMarkers rotationRef={rot} />
</div>
```

- **뒤로 넘어간 선은 깊이에 따라 흐려진다** — 별도의 은면 제거 없이 구의 앞뒤가 읽힌다.
- 드래그는 포인터 캡처를 쓰므로 캔버스 밖으로 끌어도 회전이 끊기지 않는다.
- 위아래 회전은 극을 넘기지 않게 죈다 — 넘어가면 구가 뒤집혀 방향 감각을 잃는다.
- `prefers-reduced-motion` 이면 자동 회전이 멈춘다(드래그는 그대로).
- `ariaLabel` 을 주지 않으면 `aria-hidden` 이다 — 의미 없는 캔버스가 낭독되지 않는다.

> MySelf 의 원본은 전체 창(`window.innerWidth/Height`) 캔버스였다. JunDS 판은 `size` 로
> 한 변을 받는다 — 배경 전체를 덮으려면 컨테이너에 `absolute inset-0` 을 주고
> `size` 를 뷰포트 기준으로 계산해 넘긴다.

```tsx
const { width, height } = useWindowSize();
<GlobeWireframe size={Math.min(width, height)} className="absolute inset-0 m-auto" />
```

## 7. 등장 모션 — `useRevealOnScroll`

```tsx
import { useRevealOnScroll } from "@junds/ui/hooks";

const ref = useRevealOnScroll();   // 기본 셀렉터 ".jds-reveal"

<section ref={ref}>
  {posts.map((p) => (
    <article key={p.id} className="jds-reveal">…</article>
  ))}
</section>
```

MySelf 의 `.pf-reveal` 클래스를 그대로 쓰고 싶으면:

```tsx
const ref = useRevealOnScroll({ selector: ".pf-reveal" });
```

- 기본 모션 CSS(`.jds-reveal` → 12px 상승 + 페이드)는 `styles.css` 에 있다. 직접 정의한
  모션을 쓰려면 그 규칙을 덮어쓴다.
- **`prefers-reduced-motion` 이면 관찰 없이 전부 즉시 보이게 한다** — 모션을 끈 사용자에게
  콘텐츠가 영영 숨는 일이 없다. IntersectionObserver 가 없는 환경도 같은 경로다.
- `once: false` 를 주면 화면 밖으로 나갈 때 클래스가 다시 빠진다(기본은 한 번 보이면 유지).

## 8. 스포일러 · 청소년 주의

```tsx
import { SpoilerBlock } from "@junds/ui/composites";

<SpoilerBlock
  type="spoiler"
  notice="스포일러가 포함된 내용입니다"
  onReveal={() => markRevealed(post.slug)}
>
  <MarkdownViewer content={segment.text} breaks kinsoku />
</SpoilerBlock>

<SpoilerBlock
  type="youth"                                    // caution 의 별칭
  notice="청소년에게 부적절한 내용이 포함되어 있습니다"
  label="내용 보기"
  onReveal={() => markRevealed(post.slug)}
>
  …
</SpoilerBlock>
```

`notice={null}` 이면 문구 없이 버튼만 나온다.

## 9. 캘린더

데일리를 날짜별로 보는 화면.

```tsx
// 배럴 export 명은 DsCalendar 다 — 브라우저 전역 Calendar 와 겹치지 않게
import { DsCalendar } from "@junds/ui/patterns";

<DsCalendar
  events={posts.map((p) => ({ id: p.slug, date: new Date(p.date), title: p.title }))}
  onDateClick={(d) => setSelectedDate(d)}
  renderDay={(date, events) => (
    <div className="flex flex-col gap-0.5">
      <span>{date.getDate()}</span>
      {events.slice(0, 3).map((e) => (
        <span
          key={e.id}
          className="h-1 w-1 rounded-full"
          style={{ background: getCategoryColor(categoryOf(e.id)).accent }}
        />
      ))}
    </div>
  )}
/>
```

---

[← 04 독스](04-docs.md) · [다음: 06 서재 →](06-book.md)
