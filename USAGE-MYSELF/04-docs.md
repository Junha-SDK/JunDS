# 04. 독스

[← 목차](../USAGE-MYSELF.md) · [← 03 블로그](03-blog.md)

MySelf 대응: `features/docs/components/{LeftNav,DocHeader,DocLinks,DocsMeta,DocsPager,ScreenshotGrid,Toc,Callout,DocsLayout,DocsIndex}`

## 1. 좌측 문서 트리 — `TreeNav`

MySelf 의 `LeftNav`(367줄) 중 **재사용 가능한 부분**을 대체한다. 문서 그룹 정렬·
서브그룹 라벨 같은 규칙은 MySelf 에 남고, 트리 렌더와 상호작용을 JunDS 가 맡는다.

```tsx
import { TreeNav } from "@junds/ui/composites";
import { preloadDoc } from "@docs/registry/docLoader";

<TreeNav
  items={treeItems}              // MySelf 의 레지스트리에서 만든다
  activeKey={currentDocId}
  autoExpandActive               // 기본 true — 딥링크로 와도 현재 문서가 보인다
  showCount                      // 부모에 하위 문서 수 뱃지
  expandAllControl               // "전체 펼치기/접기" 버튼
  onItemClick={(key, href) => href && navigate(href)}
  onItemPrefetch={(_key, href) => href && preloadDoc(href)}
  ariaLabel="문서 목록"
/>
```

`TreeNavItem` 은 `{ key, label, href?, icon?, badge?, children? }`.

| prop | 무엇을 해결하나 |
|---|---|
| `autoExpandActive` | 딥링크로 들어왔을 때 현재 문서가 접힌 가지 안에 숨어 자기 위치를 못 찾는 문제 |
| `onItemPrefetch` | 호버·포커스·터치 시작에 호출 — `preloadDoc` 을 걸면 클릭 후 대기가 사라진다 |
| `showCount` | `badge` 를 직접 안 줘도 하위 잎 개수를 센다 |
| `expandedKeys` + `onExpandedChange` | 확장 상태를 바깥에서 제어(예: localStorage 에 저장) |

확장 상태를 저장하려면:

```tsx
const [expanded, setExpanded] = useLocalStorage<string[]>("docs-nav-expanded", []);

<TreeNav items={items} expandedKeys={expanded} onExpandedChange={setExpanded} … />
```

## 2. 문서 상단 — `DocHero`

MySelf 의 `DocHeader` 를 대체한다.

```tsx
import { DocHero } from "@junds/ui/composites";

<DocHero
  banner={doc.banner}
  icon={doc.icon}
  eyebrow={doc.role}                 // "프로젝트" · "라이브러리" 등
  title={doc.title}
  subtitle={doc.subtitle}
  date={doc.date}
  dateTime={doc.isoDate}
  tags={doc.techs}                   // ["Swift", "SwiftUI", "CoreData"]
  stats={[
    { label: "기간", value: "2024.03 — 2024.08" },
    { label: "역할", value: "iOS 개발" },
    { label: "다운로드", value: "12k" },
    { label: "버전", value: "2.1.0" },
  ]}
/>
```

- **배너가 있으면 어두운 그라디언트를 덧씌운다** — 밝은 스크린샷이 배너로 와도 제목 대비가
  무너지지 않는다. 배너 유무에 따라 안쪽 색이 통째로 바뀐다.
- `stats` 는 `<dl>/<dt>/<dd>` 로 렌더돼 라벨-값 관계가 구조로 드러난다.
- `title` 은 `<h1>` 이다 — 문서 상단의 유일한 최상위 제목이라는 전제. 페이지에 다른 h1 을
  두지 않는다.
- 이미지 대신 커스텀 노드를 넣으려면 `iconNode`.

## 3. 브레드크럼

MySelf 의 `DocsMeta` 는 브레드크럼만 그린다 — JunDS `Breadcrumb` 을 그대로 쓴다.

```tsx
import { Breadcrumb } from "@junds/ui/composites";

<Breadcrumb
  items={[
    { label: "독스", href: "/docs" },
    ...lineage.map((n) => ({ label: n.title, href: n.id })),
  ]}
/>
```

`getDocLineage()` 는 MySelf 에 남는다.

## 4. 외부 링크 — `DocLinks`

```tsx
import { DocLinks } from "@junds/ui/composites";

<DocLinks
  links={[
    { href: "https://github.com/jjunhaa0211/Aune", label: "Repository", badge: "GitHub" },
    { href: "https://apps.apple.com/app/id0000", label: "App Store" },
    { href: "https://www.npmjs.com/package/@junds/ui", label: "@junds/ui" },
    { href: "https://www.figma.com/file/xxx", label: "디자인 파일" },
  ]}
/>
```

종류(`github` · `appstore` · `npm` · `figma` · `external`)를 URL 에서 추론해 아이콘을 붙인다.
추론이 빗나가면 `kind` 로 덮어쓴다.

전부 새 탭 + `rel="noopener noreferrer"` 다 — 문서에서 나가는 링크는 외부 사이트이므로
원본 탭 접근 권한을 넘기지 않는다.

> MySelf 의 `DocLinks` 는 `"서비스 (Project)"` 같은 라벨을 파싱해 제목/뱃지로 쪼갰다.
> JunDS 는 그 규칙을 모르므로 `label` 과 `badge` 를 따로 준다 — 파싱은 데이터 쪽에서 한 번
> 하고 넘기는 게 낫다.

## 5. 스크린샷 — `ScreenshotGrid`

```tsx
import { ScreenshotGrid } from "@junds/ui/composites";

<ScreenshotGrid
  images={doc.screenshots}          // ["home.png", "detail.png", …]
  basePath="/portfolio/img/"
  columns={3}
  onSelect={(src) => openLightbox(src)}   // 없으면 그냥 이미지
/>
```

**로드에 실패한 이미지는 조용히 목록에서 빠진다.** 문서에 적어 둔 스크린샷 경로는 시간이
지나면 파일이 사라지기 마련인데, 깨진 이미지 아이콘이 격자에 남는 것보다 그 칸이 아예 없는
편이 낫다. 전부 실패하면 컴포넌트째 사라진다.

절대 URL(`http://`, `//`, `/` 시작)은 `basePath` 를 붙이지 않는다.

## 6. 이전/다음 문서 — `DocPager`

```tsx
const { prev, next } = getPrevNextDoc(currentDoc.id);  // MySelf 레지스트리

<DocPager
  prev={prev && { href: prev.id, title: prev.title, description: prev.section }}
  next={next && { href: next.id, title: next.title, description: next.section }}
  renderLink={routerLink}
/>
```

기본 라벨이 "이전 문서" / "다음 문서" 라 독스에서는 그대로 쓰면 된다.

## 7. 문서 목차 · 집중 모드

블로그와 같다 — [03 §3](03-blog.md) 의 `TableOfContents` 와
[02 §2](02-shell-seo.md) 의 `useFocusMode` 를 그대로 쓴다. 독스는 좌우 패널이 둘 다 있으니
`peek: true` 의 효과가 가장 크다.

```tsx
const { focusMode, peekLeft, peekRight, toggleFocusMode } = useFocusMode({
  peek: true,
  disableBelow: 900,
  leftZone: 280,   // TreeNav 폭
  rightZone: 240,  // TableOfContents 폭
});
```

## 8. 스크롤 스파이

목차 없이 활성 섹션만 알고 싶을 때.

```tsx
import { useScrollSpy } from "@junds/ui/hooks";

const activeId = useScrollSpy(["intro", "install", "usage"], { offset: 76 });
```

- 셀렉터 배열은 id 도 되고 `#id`/`.class` 도 된다.
- `TableOfContents` 클릭이 쏘는 `scrollspy:manual` 을 듣고 700ms 관찰을 멈춘다 — 두 개를
  같이 써도 활성 항목이 깜빡이지 않는다.
- 페이지 바닥에서는 마지막 섹션을 강제 활성화한다(짧은 마지막 섹션이 영영 활성화되지 않는
  문제를 막는다).

## 9. 문서 인덱스 카드

`DocsIndex`(311줄)의 카드 격자는 `ProjectCard` 로 조립한다.

```tsx
import { ProjectCard } from "@junds/ui/composites";
import { Badge } from "@junds/ui/primitives";

<div className="flex flex-col gap-2">
  {docs.map((d) => (
    <ProjectCard
      key={d.id}
      title={d.title}
      subtitle={d.subtitle}
      icon={d.icon}
      meta={d.year}
      href={d.id}
      badges={d.appStore && <Badge>App Store</Badge>}
      onPrefetch={() => preloadDoc(d.id)}
      renderLink={routerLink}
    />
  ))}
</div>
```

대표 문서는 `variant="feature"` 로 한 단 크게.

## 10. 콜아웃

```tsx
<Callout variant="tip" title="팁">…</Callout>
```

MySelf 의 `docs/Callout` 과 variant 이름이 다르다: `warn` 은 별칭으로 받으므로 그대로
써도 되고, `success`·`info`·`tip` 은 이름이 같다.

---

[← 03 블로그](03-blog.md) · [다음: 05 데일리 →](05-daily.md)
