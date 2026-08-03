import { css } from "../../core/styles.js";

/**
 * jd-annotation-note CSS — v2 composites/AnnotationNote(`border-l-4 rounded-r-md p-3
 * text-sm` + 색 5종의 `border-l-<c>-400 bg-<c>-50 dark:bg-<c>-950/30`, 메모 `text-xs
 * muted`, footer 11px muted, 삭제 opacity 50→100 + hover danger, 클릭 시 hover shadow-sm).
 *
 * 메모지 5색은 의미축이 아니라 **계열색**이라 `--jd-color-hue-*`에서 고른다(§8).
 * 기본 노랑은 hue-amber — warning과 같은 색상축이라 "메모/주의" 계열로 읽힌다.
 * v2 리터럴 승계본은 색당 라이트 2 + 다크 1 = 15개 Tailwind 리터럴이었고, 그 값들은
 * 팔레트 밖이라 브랜드 전환·다크 보정이 이 컴포넌트만 비껴갔다.
 *
 * 색당 앵커 하나(--_jd-an-hue)만 호스트에 싣고 면·선은 톤 레시피(DEC-044)가 파생한다 —
 * 모드가 갖는 것은 색이 아니라 혼합비라 다크 셀렉터 한 벌이 통째로 사라진다.
 */
export default css`
  @layer junds.components {
    jd-annotation-note {
      display: block;
      --_jd-an-hue: var(--jd-color-hue-amber); /* yellow 기본 */
    }
    jd-annotation-note[color="green"] {
      --_jd-an-hue: var(--jd-color-hue-green);
    }
    jd-annotation-note[color="blue"] {
      --_jd-an-hue: var(--jd-color-hue-blue);
    }
    jd-annotation-note[color="pink"] {
      --_jd-an-hue: var(--jd-color-hue-pink);
    }
    jd-annotation-note[color="orange"] {
      --_jd-an-hue: var(--jd-color-hue-orange);
    }

    .jd-annotation-note {
      box-sizing: border-box; /* DEC-014-9 — padding + border를 자기 폭 안에 */
      --_jd-an-face: color-mix(in srgb, var(--_jd-an-hue) var(--jd-tone-lift), #ffffff);
      padding: var(--jd-space-3);
      border-inline-start: var(--jd-border-heavy) solid var(--_jd-an-face);
      /* 나머지 세 변은 실선 없이 끝나 틴트 슬래브로 읽혔다 — 같은 색에서 뽑은 실낱
       테두리가 면의 경계를 만든다(§2 채움만 있는 면은 색종이로 읽힌다). */
      border-block: var(--jd-border-thin) solid
        color-mix(in srgb, var(--_jd-an-face) var(--jd-tone-border-mix), transparent);
      border-inline-end: var(--jd-border-thin) solid
        color-mix(in srgb, var(--_jd-an-face) var(--jd-tone-border-mix), transparent);
      border-start-end-radius: var(--jd-radius-md);
      border-end-end-radius: var(--jd-radius-md);
      background: color-mix(in srgb, var(--_jd-an-face) var(--jd-tone-bg-mix), transparent);
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-sm);
      color: var(--jd-color-foreground);
    }

    /* 따옴표는 본문 텍스트가 아니라 표기다 — 글리프는 v2와 같은 " */
    .jd-annotation-note__quote {
      margin: 0;
      quotes: '"' '"';
      line-height: var(--jd-leading-relaxed);
    }
    .jd-annotation-note__quote::before {
      content: open-quote;
    }
    .jd-annotation-note__quote::after {
      content: close-quote;
    }

    .jd-annotation-note__note {
      margin: var(--jd-space-2) 0 0;
      font-size: var(--jd-text-xs);
      line-height: var(--jd-leading-relaxed);
      color: var(--jd-color-muted);
    }

    .jd-annotation-note__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-block-start: var(--jd-space-2);
      font-size: var(--jd-text-2xs); /* v2 text-[11px] = 2xs 하한 */
      color: var(--jd-color-muted);
    }
    .jd-annotation-note__meta {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
    }

    .jd-annotation-note__note[hidden],
    .jd-annotation-note__footer[hidden],
    .jd-annotation-note__page[hidden],
    .jd-annotation-note__date[hidden] {
      display: none;
    }

    .jd-annotation-note__delete {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      cursor: pointer;
      opacity: var(--jd-opacity-50);
      border-radius: var(--jd-radius-sm);
      transition: opacity var(--jd-duration-snap) var(--jd-easing-ease-out),
        background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        color var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-annotation-note__delete:hover {
      opacity: var(--jd-opacity-100);
      color: var(--jd-color-danger);
      background: color-mix(in srgb, var(--jd-color-danger) 10%, transparent);
    }
    .jd-annotation-note__delete:active {
      scale: 0.97;
      background: color-mix(in srgb, var(--jd-color-danger) 16%, transparent);
    }
    .jd-annotation-note__delete:focus-visible {
      opacity: var(--jd-opacity-100);
      outline: var(--jd-focus-ring-danger);
      outline-offset: var(--jd-focus-ring-offset);
    }

    jd-annotation-note[clickable] > .jd-annotation-note {
      cursor: pointer;
      transition: box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    jd-annotation-note[clickable] > .jd-annotation-note:hover {
      box-shadow: var(--jd-shadow-sm);
      border-color: color-mix(in srgb, var(--_jd-an-face) 52%, transparent);
      border-inline-start-color: var(--_jd-an-face);
    }
    /* 눌린 카드는 떠 있지 않다 — 그림자를 거두고 안으로 눌린다 */
    jd-annotation-note[clickable] > .jd-annotation-note:active {
      scale: 0.99;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    jd-annotation-note[clickable] > .jd-annotation-note:focus-visible {
      /* 카드가 overflow 안에 들어가도 링이 잘리지 않게 outline 대신 box-shadow */
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring); /* StatCard와 같은 카드 포커스 링 */
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-annotation-note__delete,
      jd-annotation-note[clickable] > .jd-annotation-note {
        transition: none;
      }
    }
  }
`;
