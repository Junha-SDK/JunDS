import { css } from "../../core/styles.js";

/**
 * v2 값: size xs 24 / sm 32 / md 36 / lg 44 / xl 56, 이니셜 팔레트 8종
 * (violet·blue·emerald·amber·rose·cyan·purple·teal 100/700 — Tailwind 리터럴 승계),
 * status 점 우하단(green/gray/yellow/red 500) + 화이트 링.
 */
export default css`
  @layer junds.components {
    jd-avatar {
      position: relative;
      display: inline-flex;
      flex-shrink: 0;
      font-family: var(--jd-font-sans);
      /* size 기본 md — 36px */
      --_jd-avatar-size: 2.25rem;
      --_jd-avatar-font: var(--jd-text-md);
      --_jd-avatar-dot: 10px;
      --_jd-avatar-ring: 1.5px;
    }
    jd-avatar[size="xs"] {
      --_jd-avatar-size: 1.5rem;
      /* 2xs(11px)가 하한이다 — 이니셜을 10px로 줄이면 24px 원 안에서 읽히지 않는다 */
      --_jd-avatar-font: var(--jd-text-2xs);
      --_jd-avatar-dot: 6px;
      --_jd-avatar-ring: 1px;
    }
    jd-avatar[size="sm"] {
      --_jd-avatar-size: 2rem;
      --_jd-avatar-font: var(--jd-text-xs);
      --_jd-avatar-dot: 8px;
      --_jd-avatar-ring: 1.5px;
    }
    jd-avatar[size="lg"] {
      --_jd-avatar-size: 2.75rem;
      --_jd-avatar-font: var(--jd-text-lg);
      --_jd-avatar-dot: 12px;
      --_jd-avatar-ring: 2px;
    }
    jd-avatar[size="xl"] {
      --_jd-avatar-size: 3.5rem;
      --_jd-avatar-font: var(--jd-text-xl);
      --_jd-avatar-dot: 14px;
      --_jd-avatar-ring: 2px;
    }

    .jd-avatar__img {
      width: var(--_jd-avatar-size);
      height: var(--_jd-avatar-size);
      border-radius: var(--jd-radius-full);
      object-fit: cover;
      display: block;
      /* 밝은 사진이 흰 카드에 녹지 않게 잉크에서 뽑은 한 겹 — 링이 아니라 경계다 */
      box-shadow: 0 0 0 var(--jd-border-thin)
        color-mix(in srgb, var(--jd-color-foreground) 10%, transparent);
    }
    .jd-avatar__fallback {
      position: relative; /* 실루엣 조각의 기준면 */
      width: var(--_jd-avatar-size);
      height: var(--_jd-avatar-size);
      border-radius: var(--jd-radius-full);
      overflow: hidden; /* 어깨가 원 밖으로 나가지 않는다 */
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--_jd-avatar-font);
      font-weight: var(--jd-weight-semibold);
      line-height: var(--jd-leading-none);
      user-select: none;
      /* DEC-044 톤 레시피 — 팔레트 8종은 앵커만 바꾼다(base.css --jd-tone-*).
       채워진 원이라 배경은 한 단 진한 혼합비를 쓴다. */
      --jd-tone: var(--jd-color-hue-gray); /* 무이름 기본 */
      --jd-tone-ink-mix: 68%; /* xs 크기 이니셜까지 AA 대비를 유지 */
      --jd-tone-face: color-mix(in srgb, var(--jd-tone) var(--jd-tone-lift), #ffffff);
      background-color: color-mix(
        in srgb,
        var(--jd-tone-face) var(--jd-tone-bg-strong-mix),
        transparent
      );
      /* 채움만 있는 원은 색종이로 읽힌다(§2) — 위에서 받는 빛 한 겹과 앵커에서 뽑은
       테두리로 면을 세운다. 링은 흰색이 아니라 모드를 따라가는 --jd-color-highlight다. */
      background-image: linear-gradient(180deg, var(--jd-color-highlight), transparent 60%);
      box-shadow: inset 0 0 0 var(--jd-border-thin)
        color-mix(in srgb, var(--jd-tone) 18%, transparent);
      color: color-mix(in srgb, var(--jd-tone) var(--jd-tone-ink-mix), var(--jd-tone-ink-toward));
    }

    /* 이름이 없으면 element.ts가 "?"를 넣는다. 물음표는 "아직 모르는 사람"이 아니라
     "무언가 잘못됐다"로 읽힌다 — 글자를 지우고 은은한 그라데이션 위 사람 실루엣으로
     바꾼다. 실루엣은 DOM이 아니라 두 조각(머리·어깨)이라 접근성 트리에 남지 않는다.
     팔레트 속성이 없다 = 이름이 없다 (element.ts가 이름이 있을 때만 붙인다). */
    .jd-avatar__fallback:not([data-palette]) {
      font-size: 0;
      background-image: linear-gradient(180deg, var(--jd-color-highlight), transparent 60%),
        linear-gradient(
          150deg,
          color-mix(in srgb, var(--jd-color-neutral-400) 34%, transparent),
          color-mix(in srgb, var(--jd-color-neutral-500) 18%, transparent)
        );
    }
    .jd-avatar__fallback:not([data-palette])::before,
    .jd-avatar__fallback:not([data-palette])::after {
      content: "";
      position: absolute;
      background: currentColor;
      opacity: var(--jd-opacity-50);
    }
    .jd-avatar__fallback:not([data-palette])::before {
      /* 머리 */
      inset-block-start: 21%;
      inset-inline-start: 34%;
      width: 32%;
      aspect-ratio: 1;
      border-radius: var(--jd-radius-full);
    }
    .jd-avatar__fallback:not([data-palette])::after {
      /* 어깨 — 아래는 원이 잘라낸다 */
      inset-block-start: 61%;
      inset-inline-start: 21%;
      width: 58%;
      height: 34%;
      border-radius: var(--jd-radius-full) var(--jd-radius-full) 0 0;
    }
    .jd-avatar__fallback[data-palette="0"] {
      --jd-tone: var(--jd-color-hue-violet);
    }
    .jd-avatar__fallback[data-palette="1"] {
      --jd-tone: var(--jd-color-hue-blue);
    }
    .jd-avatar__fallback[data-palette="2"] {
      --jd-tone: var(--jd-color-hue-green);
    }
    .jd-avatar__fallback[data-palette="3"] {
      --jd-tone: var(--jd-color-hue-amber);
    }
    .jd-avatar__fallback[data-palette="4"] {
      --jd-tone: var(--jd-color-hue-rose);
    }
    .jd-avatar__fallback[data-palette="5"] {
      --jd-tone: var(--jd-color-hue-cyan);
    }
    .jd-avatar__fallback[data-palette="6"] {
      --jd-tone: var(--jd-color-hue-purple);
    }
    .jd-avatar__fallback[data-palette="7"] {
      --jd-tone: var(--jd-color-hue-teal);
    }

    .jd-avatar__status {
      position: absolute;
      bottom: 0;
      right: 0;
      width: var(--_jd-avatar-dot);
      height: var(--_jd-avatar-dot);
      border-radius: var(--jd-radius-full);
      /* 링은 아바타에서 점을 떼어 내는 장치라 '흰색'이 아니라 '그 자리의 면'이다 */
      border: var(--_jd-avatar-ring) solid var(--jd-color-card);
      background: var(--jd-color-neutral-400);
    }
    jd-avatar[status="online"] .jd-avatar__status {
      background: var(--jd-color-success);
    }
    jd-avatar[status="away"] .jd-avatar__status {
      background: var(--jd-color-warning);
    }
    jd-avatar[status="busy"] .jd-avatar__status {
      background: var(--jd-color-danger);
    }
  }
`;
