# 시각 품질 기준선 — `ds/` React 라이브러리

`packages/web/VISUAL-BAR.md` 와 **같은 기준**을 Tailwind 어법으로 옮긴 것이다.
두 표면이 어긋나면 같은 컴포넌트가 웹 CE 와 React 에서 다르게 생긴다.

정제 본보기는 커밋 `c96f73c` 가 손본 10종이다 — `ds/composites/Snackbar/Snackbar.tsx`,
`ds/composites/Combobox/Combobox.tsx` 를 먼저 읽는다.

## 0. 색 어휘 (`app/globals.css`)

이 라이브러리는 `--jd-*` 가 아니라 `--primary` / `--card` / `--border` … 를 쓴다.
Tailwind 설정이 이 변수들을 유틸리티로 노출한다(`bg-primary`, `text-muted`,
`border-border`, `bg-card` …). **새 리터럴 색을 넣지 않는다.**

의미색: `primary(-hover/-light/-glow)` · `accent(-light)` · `success(-light)` ·
`warning(-light)` · `danger(-hover/-light)` · `info(-light)` · `muted(-light)` ·
`card(-hover)` · `border(-light)` · `background` · `foreground` ·
`sidebar-{bg,hover,text,active}` · `surface`/`surface-soft`.

## 1. 상태 3종

누를 수 있는 것에는 `hover:` · `active:` · `focus-visible:` 이 **전부** 있다.
지금 442개 중 122개가 상호작용 요소를 가지고도 `focus-visible` 이 없다.

```tsx
"transition-colors duration-150",
"hover:bg-primary-hover",
"active:scale-[0.97]",
"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
```

`outline-none` 은 **같은 className 안에서** ring 을 함께 줄 때만 쓴다.

## 2. 깊이 — `shadow-lg` 한 겹은 유령이다

떠 있는 것(모달·팝오버·토스트·드롭다운·시트)은 다층 그림자 + 얇은 링으로 세운다.
`c96f73c` 가 Snackbar 에 적용한 형태가 정본이다:

```tsx
"shadow-[0_10px_30px_-8px_rgba(0,0,0,0.35),0_4px_10px_-4px_rgba(0,0,0,0.2)] ring-1 ring-white/10"
```

면이 있는 것(카드·버튼·칩)은 `shadow-xs`/`shadow-sm` + 상단 인셋 하이라이트:
`shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]`.

## 3. `transition-all` 금지 (77개 파일이 쓰고 있다)

`all` 은 `height`·`padding`·`font-size` 까지 대상으로 삼아 크기 전환이 흐르고,
레이아웃 속성 전이는 매 프레임 리플로우를 만든다. 바꿀 속성을 지목해라 —
`transition-colors` · `transition-transform` · `transition-opacity` ·
`transition-[opacity,transform]` · `transition-shadow`.

애니메이션·전이를 넣었으면 감속 요청을 받는다: `motion-reduce:transition-none`
\+ `motion-reduce:animate-none`.

## 4. radius 계단 (83개 파일이 `rounded-lg` 에 머물러 있다)

- 칩·배지·작은 입력: `rounded-lg`
- 버튼·입력·카드: `rounded-xl`
- 패널·모달·시트: `rounded-2xl`
- 원형: `rounded-full`

`c96f73c` 의 방향(`rounded-lg → rounded-xl`, `shadow-lg → 다층 shadow + ring`)을 잇는다.

## 5. 다크 모드

`dark:` 변형이 하나도 없는 파일이 416개다. 대부분은 CSS 변수가 모드를 따라가므로
**옳다** — `bg-card` 는 다크에서 알아서 어두워진다. 문제는 변수를 우회한 곳이다:
`bg-white` · `bg-gray-50` · `text-gray-500` · `border-gray-200` 같은 Tailwind
팔레트 직접 사용은 다크에서 무너진다. 이런 것만 의미 토큰으로 옮겨라.

## 6. 좁은 칸 / 넘침

`packages/web/VISUAL-BAR.md` §5·§6 과 같다.
- 플렉스/그리드 자식에 `min-w-0`
- 숫자+단위는 `whitespace-nowrap`, 수치 열은 `tabular-nums`
- 넓은 표·칩 행은 `overflow-x-auto overscroll-x-contain`
- 차트 SVG 는 `w-full h-auto block` + `viewBox`

## 7. SSR / 프리렌더 결정성

렌더 단계에서 `Math.random()` · `Date.now()` 를 부르지 않는다. id 가 필요하면
`useId()` 다 — 렌더마다 바뀌는 id 는 하이드레이션을 어긋나게 하고, MySelf 의 SSG
결정성 가드레일이 잡아내는 부류의 결함이다(`c96f73c` 의 AutoComplete 사례).

---

## 작업 규약

- 고치는 파일은 `ds/<kind>/<Name>/<Name>.tsx` 다.
- 공개 props 를 바꾸지 않는다. 바꿔야만 풀리면 고치지 말고 보고한다.
- 주석은 이 저장소 방식대로 **왜** 를 한국어로 적는다.
- 테스트는 `ds/__tests__/<kind>/<Name>.test.tsx` 에 있다. className 문자열을
  단언하는 테스트가 있으면 **테스트도 함께** 갱신한다.
- 검증: `npx vitest run` (호출자가 한 번에 한다 — 에이전트는 돌리지 않는다).
