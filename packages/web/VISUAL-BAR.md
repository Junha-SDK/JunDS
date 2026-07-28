# 시각 품질 기준선 — `jd-button` 급

이 문서는 "이 컴포넌트는 다 됐다"를 판정하는 기준이다. 기준선의 정본은
`src/components/button/button.css.ts` 다 — 새 규칙을 만들기 전에 그 파일을 먼저 읽는다.

정제 작업은 **토큰 의미 번역**이지 값 베끼기가 아니다. 색·간격·그림자는 전부
`--jd-*` 로 말한다. 리터럴을 박아 넣으면 브랜드 전환·다크 모드·밀도 전환이
그 자리에서 끊긴다.

---

## 1. 상태 3종은 협상 대상이 아니다

누를 수 있는 것(`cursor: pointer` 가 붙는 모든 것)은 세 상태를 **전부** 가진다.

| 상태 | 규약 |
| --- | --- |
| `:hover` | 실색 전환. `filter: brightness()` 금지 — 글자·스피너까지 밝혀 흰 글자가 배경에 녹고 GPU 레이어를 새로 만든다. |
| `:active` | `scale: .97` + `box-shadow: inset 0 1px 2px var(--jd-color-shade)`. 눌린 면은 빛을 잃는다. |
| `:focus-visible` | `outline: var(--jd-focus-ring)` + `outline-offset: var(--jd-focus-ring-offset)`. 오버레이 안이라 아웃라인이 잘리면 `box-shadow: var(--jd-shadow-focus-ring)`. |

`outline: none` 을 쓸 거면 **같은 규칙 안에서** 대체 표시를 함께 준다. 대체 없이
지우는 것은 키보드 사용자에게서 커서를 빼앗는 것이다.

## 2. 채움만 있는 면은 색종이로 읽힌다

실체가 있는 표면(버튼·카드·칩·패널)은 **면 + 위에서 받는 빛**을 함께 준다.

```css
box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
```

떠 있는 것(모달·팝오버·토스트·드롭다운)은 `--jd-shadow-lg` 이상 + 테두리를
`color-mix(in srgb, var(--jd-color-border) 76%, transparent)` 로 눅인다.

## 3. 전이는 속성을 지목한다

`transition: all` 금지. `height`·`padding`·`font-size` 까지 대상이 되어 size 전환이
흐르고, 레이아웃 속성 전이는 매 프레임 리플로우를 만든다 (DEC-039).

```css
transition:
  background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
  border-color     var(--jd-duration-snap) var(--jd-easing-ease-out),
  color            var(--jd-duration-snap) var(--jd-easing-ease-out),
  box-shadow       var(--jd-duration-snap) var(--jd-easing-ease-out),
  scale            var(--jd-duration-press) var(--jd-easing-ease-out);
```

전이나 애니메이션을 넣었으면 같은 시트 끝에 감속 요청을 받는다.

```css
@media (prefers-reduced-motion: reduce) {
  .jd-x { transition: none; animation: none; }
}
```

## 4. `surface` 3단은 **라이트에서도 어두운** 크롬이다

`--jd-color-surface` / `-raised` / `-overlay` 는 코드 블록·다이어그램 캔버스·
히어로 오버레이·책등처럼 **모드와 무관하게 어두운 면**이다(02-tokens §2).

그 위의 글자는 모드를 따라가면 안 된다:

```css
/* ✗ 라이트 모드에서 검은 글자가 검은 면에 얹힌다 */
background: var(--jd-color-surface);
color: var(--jd-color-foreground);

/* ✓ surface 의 짝은 on-surface 다 (DEC-044) */
background: var(--jd-color-surface);
color: var(--jd-color-on-surface);
/* 보조 글자 */
color: var(--jd-color-on-surface-muted);
```

어두운 면 위의 테두리·구분선도 `--jd-color-border` 가 아니라
`color-mix(in srgb, var(--jd-color-on-surface) 14%, transparent)` 처럼 잉크에서 뽑는다.

**면을 라이트에서도 어둡게 둘 이유가 없다면 `surface` 가 아니라 `--jd-color-card` 를 쓴다.**
채팅 스레드·칸반 보드·메일함처럼 "앱의 본문"인 면은 card 가 맞다.

## 5. 좁은 칸에서 글자가 세로로 서지 않게

플렉스/그리드 자식은 기본 `min-width: auto` 라서 내용이 칸을 밀어낸다. 밀린 칸은
줄바꿈으로 버티다 결국 **한 글자씩 세로로** 선다.

- 잘려도 되는 텍스트를 가진 플렉스/그리드 자식: `min-width: 0`
- 숫자 + 단위(`71,200` + `원`, `1,840` + `억`)는 한 덩어리: `white-space: nowrap`
- 표의 수치 열: `font-variant-numeric: tabular-nums` — 자릿수가 흔들리지 않는다
- 라벨이 두 줄로 접히면 안 되는 곳(내비 항목·칩·헤더 셀): `white-space: nowrap`
- 이름처럼 길이를 모르는 것: `overflow: hidden; text-overflow: ellipsis` — 단
  **2~3자만 남기고 자르는 말줄임은 정보가 아니다**. 최소 폭을 주거나 폭을 넓힌다.

## 6. 컨테이너를 넘지 않는다

차트·표·칩 행은 부모 폭 안에서 끝나거나, **스스로 굴러야** 한다.

- SVG 차트: `width: 100%; height: auto; display: block` + `viewBox` 로 비율 유지
- 넓은 표·칩 행: 감싸는 요소에 `overflow-x: auto; overscroll-behavior-x: contain`
  \+ `scrollbar-width: thin`. 잘린 채 끝나는 것과 굴릴 수 있는 것은 다르다.
- 가로 스크롤이 생기는 곳은 가장자리에 마스크를 줘서 "더 있다"를 알린다:
  `mask-image: linear-gradient(90deg, #000 0 calc(100% - 24px), transparent)`

## 7. 어포던스가 없으면 컴포넌트가 아니다

- 접히는 것에는 셰브런이 있고, 열림에 따라 `rotate(180deg)` 한다
- 라벨 달린 구분선은 **선이 보여야** 한다(라벨 양옆으로 각각)
- 트리거는 트리거처럼 생긴다 — 맨 텍스트는 트리거가 아니다
- 편집 가능한 인라인 텍스트는 hover 에서 편집 가능함을 드러낸다

## 8. 팔레트를 벗어나지 않는다

- 강조는 `--jd-color-primary` 계열이다. 민트·형광 초록·시안을 임의로 쓰지 않는다.
- 의미색은 `success` / `warning` / `danger` / `info` 와 그 `-light` 짝만 쓴다.
- 차트 계열색은 `--jd-color-hue-*` 에서 고른다.
- 등락색은 **직접 칠하지 않는다**. DECISIONS.md §"색 기본값은 웹을 따르고, 관례
  전환은 앱에 남겼다" 가 정본이다 — 기본은 상승=success·하락=danger 이고, 한국
  관례(적상승·청하락)는 앱이 `--jd-finance-up` / `--jd-finance-down` 을 시작 시
  1회 덮어써서 얻는다. 그래서 컴포넌트는 반드시 이 훅을 경유한다:

  ```css
  color: var(--jd-finance-up,   var(--jd-color-success));
  color: var(--jd-finance-down, var(--jd-color-danger));
  color: var(--jd-finance-flat, var(--jd-color-muted));
  ```

  `--jd-color-danger` 를 상승에 **직접** 박으면 앱의 override 가 그 컴포넌트만
  비껴간다 — 한 화면 안에서 등락색이 갈라진다(실측: 8종만 훅을 경유하고 12종이
  직접 칠한다).

## 9. 글자는 읽을 수 있어야 한다

`--jd-text-2xs`(11px) 아래로 내려가지 않는다. 배너·스낵바처럼 폭이 좁다고
글자를 줄이지 말고 줄 수를 늘린다. 보조 글자는 `--jd-color-muted` 까지 —
`--jd-color-muted-light` 는 라이트 모드에서 2.7:1 이라 본문에 쓰면 AA 미달이다.

## 10. 컴포넌트는 전역을 건드리지 않는다

마운트만으로 `document.documentElement` 를 칠하거나 `body` 를 잠그는 컴포넌트는
문서·갤러리·미리보기 안에서 **호스트 페이지를 인질로 잡는다**. 전역 변경은
사용자 조작이나 명시적 옵트인 뒤에만 일어난다.

---

## 작업 규약

- 고치는 파일은 `src/components/<name>/<name>.css.ts` 다. `element.ts` 는 CSS 로
  풀리지 않을 때만 손대고, 손댔으면 이유를 커밋 메시지에 남긴다.
- 주석은 이 저장소의 방식대로 **왜** 를 적는다. "무엇" 은 코드가 이미 말한다.
- `@layer junds.components` 밖으로 규칙을 내보내지 않는다.
- 공개 API(속성·이벤트)를 바꿨으면 `custom-elements.json` 과 MySelf 의
  `junds-web-api.data.ts` 가 함께 갱신돼야 한다 — 바꿨다면 반드시 보고한다.
- 검증: `node build.mjs && npx vitest run`
