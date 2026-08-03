/**
 * jd-copy-block CSS — v2 composites/CopyBlock(rounded-xl 테두리 · gray-50 머리글 ·
 * gray-950/gray-100 코드면 · 우상단 고스트 복사 버튼, 완료 시 success)의 토큰 번역.
 *
 * 코드면은 라이트/다크 양쪽에서 어두운 면을 유지한다(v2 동형 — 코드 블록의 관례).
 * **머리글도 같은 계열이다.** v2의 gray-50 머리글은 라이트에서 흰 띠라, 어두운 코드
 * 상자 위에 다른 상자가 얹힌 것으로 읽혔다(실측: 라벨 상자와 코드 상자의 이음매가
 * 벌어짐). v3는 머리글=surface-raised · 코드면=surface · 구분선과 바깥 테두리는
 * on-surface에서 뽑아(§4) 전체가 한 덩어리로 선다.
 * 줄 번호는 DOM이 아니라 CSS 카운터다 — 접근성 트리에도 클립보드에도 실리지 않는다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-copy-block {
      display: block;
      position: relative;
      box-sizing: border-box;
      /* 어두운 코드 면을 라이트 테두리로 두르면 머리글과 코드가 서로 다른 상자로
       읽힌다(실측: 모서리·이음매가 벌어져 보임). 테두리는 --jd-color-border가 아니라
       그 면의 잉크에서 뽑는다(§4) — 덩어리 하나의 윤곽이 된다. */
      border: var(--jd-border-thin) solid
        color-mix(in srgb, var(--jd-color-on-surface) 14%, transparent);
      border-radius: var(--jd-radius-xl);
      overflow: hidden;
      background: var(--jd-color-surface);
      box-shadow: var(--jd-shadow-sm);
    }

    /* 머리글도 코드와 같은 어두운 계열이다 — 한 단만 들어 올려 '같은 덩어리의 윗면'이
     되게 한다. card-hover(라이트에서 흰색)를 쓰면 어두운 코드 위에 흰 띠가 얹힌다. */
    .jd-copy-block__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      /* 우상단 복사 버튼(32px)이 앉을 자리를 머리글이 직접 확보한다 — 겹치면
       라벨과 버튼이 한 칸을 다툰다 */
      min-height: 2.5rem;
      padding: var(--jd-space-2) var(--jd-space-12) var(--jd-space-2) var(--jd-space-4);
      background: var(--jd-color-surface-raised);
      border-block-end: var(--jd-border-thin) solid
        color-mix(in srgb, var(--jd-color-on-surface) 12%, transparent);
    }
    .jd-copy-block__head[hidden] {
      display: none;
    }
    .jd-copy-block__lang {
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-semibold);
      color: var(--jd-color-on-surface-muted);
      text-transform: uppercase;
      letter-spacing: var(--jd-tracking-wider);
    }

    .jd-copy-block__pre {
      margin: 0;
      padding: var(--jd-space-4);
      overflow-x: auto;
      /* 잘린 채 끝나는 것과 굴릴 수 있는 것은 다르다(§6) */
      overscroll-behavior-x: contain;
      scrollbar-width: thin;
      scrollbar-color: color-mix(in srgb, var(--jd-color-on-surface) 28%, transparent) transparent;
      background: var(--jd-color-surface);
      color: var(--jd-color-on-surface); /* 항상 어두운 코드 면 (DEC-044) */
      font-family: var(--jd-font-mono);
      font-size: var(--jd-text-md);
      line-height: var(--jd-leading-relaxed);
      tab-size: 2;
    }
    .jd-copy-block__pre:focus-visible {
      outline: none;
      box-shadow: inset var(--jd-shadow-focus-ring);
    }
    .jd-copy-block__code {
      font: inherit;
    }
    /* 빈 줄도 한 행을 차지해야 한다 (v2는 높이 0으로 접혀 줄 수가 어긋났다) */
    .jd-copy-block__line {
      display: block;
      min-block-size: calc(1em * var(--jd-leading-relaxed));
    }
    jd-copy-block[show-line-numbers] .jd-copy-block__line::before {
      counter-increment: jd-copy-block-line;
      content: counter(jd-copy-block-line);
      display: inline-block;
      inline-size: 2rem;
      margin-inline-end: var(--jd-space-4);
      text-align: end;
      color: var(--jd-color-on-surface-muted);
      user-select: none;
    }
    jd-copy-block[show-line-numbers] .jd-copy-block__code {
      counter-reset: jd-copy-block-line;
    }

    /* 복사 버튼 — v2는 hover에서만 나타나 키보드·터치에서 사라졌다 */
    .jd-copy-block__copy {
      position: absolute;
      inset-block-start: var(--jd-space-2);
      inset-inline-end: var(--jd-space-2);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--jd-space-2);
      border: 0;
      cursor: pointer;
      border-radius: var(--jd-radius-lg);
      background: var(--jd-color-surface-overlay);
      color: var(--jd-color-on-surface-muted);
      box-shadow: inset 0 0 0 var(--jd-border-thin)
        color-mix(in srgb, var(--jd-color-on-surface) 14%, transparent);
      /* 안 보이는 버튼은 트리거가 아니다(§7). 쉬는 상태에서도 존재는 보이고,
       마우스가 오면 완전히 드러난다 — 0에서 시작하면 "여기 복사가 있다"를
       마우스 사용자에게만 알려 준 셈이 된다. */
      opacity: var(--jd-opacity-60);
      transition: opacity var(--jd-duration-normal) var(--jd-easing-ease-out),
        background-color var(--jd-duration-fast) var(--jd-easing-ease-out),
        color var(--jd-duration-fast) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    jd-copy-block:hover .jd-copy-block__copy,
    jd-copy-block:focus-within .jd-copy-block__copy {
      opacity: 1;
    }
    @media (hover: none) {
      .jd-copy-block__copy {
        opacity: 1;
      }
    }
    .jd-copy-block__copy:hover {
      background: color-mix(
        in srgb,
        var(--jd-color-on-surface) 16%,
        var(--jd-color-surface-overlay)
      );
      color: var(--jd-color-on-surface);
    }
    .jd-copy-block__copy:active {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-copy-block__copy:focus-visible {
      opacity: 1;
      /* 어두운 면 위에서는 outline이 잘리지 않아도 되지만, 링 색이 배경과 붙지
       않도록 글로우 그림자를 쓴다(§1의 대체 표시) */
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }
    jd-copy-block[copied] .jd-copy-block__copy {
      opacity: 1;
      background: var(--jd-color-success);
      color: #fff;
      box-shadow: inset 0 1px 0 var(--jd-color-highlight);
    }
    .jd-copy-block__icon {
      display: flex;
    }

    /* 라이브 리전 — 화면에서만 숨긴다 */
    .jd-copy-block__status {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-copy-block__copy {
        transition: none;
      }
    }
  }
`;
