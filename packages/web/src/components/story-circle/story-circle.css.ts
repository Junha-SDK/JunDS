import { css } from "../../core/styles.js";

/**
 * v2 값: 링 패딩 2.5px(unread/live)·2px(read/muted), 내부 프레임 카드-bg 2px,
 * unread 그라디언트(rose→fuchsia→amber), live 그라디언트(rose 500→700),
 * read/muted 회색(다크 대응). 이름 라벨 11px·최대폭 72px 말줄임.
 *
 * 링 색은 v2 Tailwind 리터럴(#f43f5e/#d946ef/#f59e0b …)을 승계했었다. 이 링은 특정
 * 브랜드의 자산이 아니라 "안 읽음"을 말하는 **장식 계열색**이므로 hue 토큰에서 뽑는다(§8)
 * — 리터럴로 두면 소비자가 브랜드를 바꿔도 이 링만 옛 형광 그라디언트로 남는다.
 * 색상 회전(따뜻한 rose → pink → amber)은 v2 의도 그대로 유지한다.
 */
export default css`
  @layer junds.components {
    jd-story-circle {
      display: inline-flex;
      --_jd-story-size: 64px;
      --_jd-story-pad: 2.5px;
      --_jd-story-ring: linear-gradient(
        to top right,
        var(--jd-color-hue-rose),
        var(--jd-color-hue-pink),
        var(--jd-color-hue-amber)
      );
    }
    jd-story-circle[state="read"] {
      --_jd-story-pad: 2px;
      --_jd-story-ring: var(--jd-color-neutral-300);
    }
    /* live는 한 색의 명도 계단 — 회전 없이 "지금 켜져 있다"만 말한다 */
    jd-story-circle[state="live"] {
      --_jd-story-ring: linear-gradient(
        to top right,
        var(--jd-color-hue-rose),
        color-mix(in srgb, var(--jd-color-hue-rose) 72%, #000)
      );
    }
    jd-story-circle[state="muted"] {
      --_jd-story-pad: 2px;
      --_jd-story-ring: var(--jd-color-neutral-200);
    }
    [data-jd-theme="dark"] jd-story-circle[state="read"],
    [data-theme="dark"] jd-story-circle[state="read"] {
      --_jd-story-ring: var(--jd-color-neutral-800);
    }
    [data-jd-theme="dark"] jd-story-circle[state="muted"],
    [data-theme="dark"] jd-story-circle[state="muted"] {
      --_jd-story-ring: var(--jd-color-neutral-800);
    }

    .jd-story-circle {
      appearance: none;
      -webkit-appearance: none;
      border: 0;
      background: transparent;
      margin: 0;
      padding: var(--jd-space-1);
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: var(--jd-space-1);
      cursor: pointer;
      border-radius: var(--jd-radius-md);
      font-family: var(--jd-font-sans);
      /* 누를 수 있는 것은 상태 3종을 전부 갖는다 — v2에는 focus만 있었다 */
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-story-circle:hover {
      background: color-mix(in srgb, var(--jd-color-muted) 10%, transparent);
    }
    .jd-story-circle:active {
      scale: 0.97;
      background: color-mix(in srgb, var(--jd-color-muted) 16%, transparent);
    }
    .jd-story-circle:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    .jd-story-circle__ring {
      position: relative;
      width: var(--_jd-story-size);
      height: var(--_jd-story-size);
      border-radius: var(--jd-radius-full);
      padding: var(--_jd-story-pad);
      background: var(--_jd-story-ring);
      display: inline-flex;
      box-sizing: border-box;
    }
    .jd-story-circle__frame {
      width: 100%;
      height: 100%;
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-card);
      padding: var(--jd-space-0-5);
      box-sizing: border-box;
      display: flex;
    }
    .jd-story-circle__img,
    .jd-story-circle__fallback {
      width: 100%;
      height: 100%;
      border-radius: var(--jd-radius-full);
      object-fit: cover;
      display: block;
    }
    .jd-story-circle__fallback {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-bold);
      background: color-mix(in srgb, var(--jd-color-primary) 15%, transparent);
      /* 틴트 위 이니셜: 원색 대신 foreground 혼합으로 대비 확보(emoji-picker 선례·§4). */
      color: color-mix(in srgb, var(--jd-color-primary) 65%, var(--jd-color-foreground));
      user-select: none;
    }
    .jd-story-circle__img[hidden],
    .jd-story-circle__fallback[hidden] {
      display: none;
    }

    .jd-story-circle__live {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translate(-50%, 50%);
      padding: var(--jd-space-px) var(--jd-space-1-5);
      border-radius: var(--jd-radius-md);
      background: var(--jd-color-hue-rose);
      color: #fff;
      /* 9px는 읽을 수 있는 크기가 아니다 — 2xs(11px)가 하한이다(§9) */
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      letter-spacing: var(--jd-tracking-wide);
      line-height: var(--jd-leading-tight);
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
    }
    .jd-story-circle__live[hidden] {
      display: none;
    }

    .jd-story-circle__name {
      max-width: 72px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--jd-text-2xs);
      color: var(--jd-color-foreground);
    }
    .jd-story-circle__name[hidden] {
      display: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-story-circle {
        transition: none;
      }
    }
  }
`;
