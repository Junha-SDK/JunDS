import { css } from "../../core/styles.js";

/**
 * v2 값: 칩 = rounded-full 테두리 pill, px-2/py-0.5, text-xs, 이모지 text-sm,
 * 카운트 tabular-nums. 반응됨 = primary 테두리 + primary-light 배경 + primary 글자,
 * 기본 = border/surface + hover surface-soft. + 버튼 = 28×24 원형 테두리, muted→foreground.
 */
export default css`
  @layer junds.components {
    jd-emoji-reaction {
      display: inline-flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--jd-space-1);
      font-family: var(--jd-font-sans);
    }

    .jd-emoji-reaction__item {
      appearance: none;
      -webkit-appearance: none;
      margin: 0;
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1);
      padding: var(--jd-space-0-5) var(--jd-space-2);
      border-radius: var(--jd-radius-full);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      background: var(--jd-color-card);
      color: var(--jd-color-foreground);
      font-size: var(--jd-text-xs);
      line-height: var(--jd-leading-none);
      cursor: pointer;
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out),
        border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
        color var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-emoji-reaction__item:hover {
      background: var(--jd-color-card-hover);
    }
    .jd-emoji-reaction__item:focus-visible {
      outline: 2px solid var(--jd-color-primary);
      outline-offset: 2px;
    }
    .jd-emoji-reaction__item[data-reacted] {
      border-color: var(--jd-color-primary);
      background: var(--jd-color-primary-light);
      /* v2는 text-primary 원색이었다 — 다크 틴트 배경에서 대비가 4.5:1 아래로 무너진다
       (emoji-picker 선례). foreground를 섞어 양쪽 테마에서 대비 확보(§4 색 대비). */
      color: color-mix(in srgb, var(--jd-color-primary) 65%, var(--jd-color-foreground));
    }

    .jd-emoji-reaction__emoji {
      font-size: var(--jd-text-sm);
      line-height: var(--jd-leading-none);
    }
    .jd-emoji-reaction__count {
      font-weight: var(--jd-weight-medium);
      font-variant-numeric: tabular-nums;
    }

    .jd-emoji-reaction__add {
      appearance: none;
      -webkit-appearance: none;
      margin: 0;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 24px;
      box-sizing: border-box; /* 테두리 포함 28×24 유지(§6) */
      border-radius: var(--jd-radius-full);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      background: var(--jd-color-card);
      color: var(--jd-color-muted);
      font-size: var(--jd-text-sm);
      cursor: pointer;
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out),
        color var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-emoji-reaction__add:hover {
      background: var(--jd-color-card-hover);
      color: var(--jd-color-foreground);
    }
    .jd-emoji-reaction__add:focus-visible {
      outline: 2px solid var(--jd-color-primary);
      outline-offset: 2px;
    }
    .jd-emoji-reaction__add[hidden] {
      display: none;
    }
  }
`;
