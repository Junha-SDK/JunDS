import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 토큰 의미 번역):
 * - section: px-4/6 py-10
 * - title: 가운데 정렬 text-xs semibold uppercase tracking-wider muted mb-6
 * - grid: max-w-5xl mx-auto gap-6 items-center. columns 3/4/5/6 반응형(v2 colMap):
 *     3 → 3열 / 4 → 2→sm4 / 5 → 2→sm3→lg5 / 6 → 3→sm6.
 *     v3는 이 계단을 뷰포트도 고정 트랙도 아닌 **흐름**으로 다시 세웠다(아래 주석) —
 *     columns는 칸 폭의 상한이 되어 넓은 곳에서 v2와 같은 열 수를 만들고, 좁아지면
 *     세로로 쌓이지 않고 wrap으로 가로 흐름을 유지한다.
 * - marquee: overflow-hidden max-w-7xl mx-auto, track flex gap-10 whitespace-nowrap,
 *     30s linear infinite, translateX 0→-50%(복제 2벌)
 * - item: h-12 px-4 flex center. grayscale = grayscale opacity-60 → hover 원복
 * - img: h-8 w-auto object-contain / 텍스트: text-sm semibold muted
 */
export default css`
  @layer junds.base {
    jd-logo-cloud:not(:defined) {
      display: block;
    }
  }
  @layer junds.components {
    jd-logo-cloud {
      display: block;
      box-sizing: border-box;
      font-family: var(--jd-font-sans);
      padding: var(--jd-space-10) var(--jd-space-4);
    }
    @media (min-width: 640px) {
      jd-logo-cloud {
        padding-inline: var(--jd-space-6);
      }
    }

    .jd-logo-cloud__title {
      text-align: center;
      margin-bottom: var(--jd-space-6);
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-semibold);
      text-transform: uppercase;
      letter-spacing: var(--jd-tracking-wide);
      color: var(--jd-color-muted);
    }

    /* ── grid (기본 배치) ──
     기본값 layout="grid"는 attribute로 반영되지 않는다(§1.3 reflect는 set 시점) —
     [layout="grid"] 셀렉터에 배치를 걸어 두면 **아무것도 지정하지 않은 기본 사용에서
     규칙이 통째로 빠져** 로고가 한 열로 세로로 쌓인다(실측). 기본은 base가 담당하고
     호스트 속성 셀렉터는 비기본값(marquee·columns)만 덮는다 — jd-button과 같은 규약.

     격자에서 흐름으로 바꾼 이유: auto-fit 격자는 "요청 열 수로 나눈 폭"을 트랙 하한으로
     삼는데, 로고 한 칸은 그 하한보다 훨씬 좁다(이름 몇 글자 + 여백). 그래서 좁은
     칼럼에서 트랙이 두 개밖에 안 서고 나머지가 세로로 쌓였다(실측 — 로고 구름의 형태가
     아니다). wrap + 가운데 정렬이면 칸은 제 내용 폭만 쓰고 줄이 찰 때만 다음 줄로
     넘어간다 — 좁아져도 가로로 흐른다. columns는 한 칸이 가질 수 있는 **폭 상한**으로
     남아 넓은 곳에서 v2와 같은 열 수를 만든다. */
    .jd-logo-cloud__viewport {
      --jd-lc-gap: var(--jd-space-6);
      --jd-lc-cols: 5;
      max-width: 64rem; /* max-w-5xl */
      margin-inline: auto;
      display: flex;
      flex-wrap: wrap;
      gap: var(--jd-lc-gap);
      align-items: center;
      justify-content: center;
    }
    jd-logo-cloud[columns="3"] .jd-logo-cloud__viewport {
      --jd-lc-cols: 3;
    }
    jd-logo-cloud[columns="4"] .jd-logo-cloud__viewport {
      --jd-lc-cols: 4;
    }
    jd-logo-cloud[columns="6"] .jd-logo-cloud__viewport {
      --jd-lc-cols: 6;
    }

    /* ── marquee ── */
    jd-logo-cloud[layout="marquee"] .jd-logo-cloud__viewport {
      display: block; /* 격자를 되돌린다 — 흐르는 것은 트랙 하나뿐이다 */
      position: relative;
      overflow: hidden;
      max-width: 80rem; /* max-w-7xl */
      margin-inline: auto;
      /* 가장자리에서 흐려져야 "더 있다"가 읽힌다(§6) */
      mask-image: linear-gradient(
        90deg,
        transparent 0,
        #000 var(--jd-space-10),
        #000 calc(100% - var(--jd-space-10)),
        transparent 100%
      );
    }
    .jd-logo-cloud__track {
      display: flex;
      gap: var(--jd-space-10);
      white-space: nowrap;
      width: max-content;
      animation: jd-logo-cloud-marquee 30s linear infinite;
    }
    @keyframes jd-logo-cloud-marquee {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(-50%);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .jd-logo-cloud__track {
        animation: none;
      }
    }

    /* 흐름 배치에서 칸은 제 내용 폭을 쓴다(basis auto). 상한만 columns에서 뽑아
     한 칸이 요청 열 수의 몫보다 넓어지지 않게 한다 — 로고 하나가 줄을 독식하지 않는다.
     href가 없는 항목은 링크 껍질 없이 item이 바로 칸이라 둘 다 건다. marquee의
     칸은 트랙 안(자손)이라 이 규칙에 걸리지 않는다 — 트랙은 흐르지 접히지 않는다. */
    .jd-logo-cloud__viewport > .jd-logo-cloud__link,
    .jd-logo-cloud__viewport > .jd-logo-cloud__item {
      flex: 0 1 auto;
      max-width: min(100%, (100% - (var(--jd-lc-cols) - 1) * var(--jd-lc-gap)) / var(--jd-lc-cols));
    }

    /* ── 셀 ── */
    .jd-logo-cloud__link {
      display: block;
      max-width: 100%;
      min-width: 0;
      text-decoration: none;
      border-radius: var(--jd-radius-md);
    }
    /* 링은 단일 레시피로 — 두께·색·간격이 컴포넌트마다 갈라지지 않게(DEC-039) */
    .jd-logo-cloud__link:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }
    .jd-logo-cloud__item {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 0;
      max-width: 100%;
      height: 3rem; /* h-12 */
      padding-inline: var(--jd-space-4);
    }
    .jd-logo-cloud__img {
      height: 2rem; /* h-8 */
      width: auto;
      max-width: 100%; /* 가로로 긴 로고가 칸을 밀고 나가지 않게(§6) */
      object-fit: contain;
    }
    /* 회사 이름은 접히지 않는다 — 두 줄이 되면 로고 줄의 기준선이 어긋난다 */
    .jd-logo-cloud__label {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-semibold);
      color: var(--jd-color-muted);
    }

    /* 회색조 — 기본 ON, 호버 시 원색 복원 */
    jd-logo-cloud[data-grayscale] .jd-logo-cloud__item {
      filter: grayscale(1);
      opacity: var(--jd-opacity-60);
      transition: filter var(--jd-duration-normal) var(--jd-easing-ease-out),
        opacity var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
    jd-logo-cloud[data-grayscale] .jd-logo-cloud__item:hover {
      filter: grayscale(0);
      opacity: 1;
    }
    @media (prefers-reduced-motion: reduce) {
      jd-logo-cloud[data-grayscale] .jd-logo-cloud__item {
        transition: none;
      }
    }
  }
`;
