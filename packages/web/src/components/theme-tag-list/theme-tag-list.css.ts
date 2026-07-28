import { css } from "../../core/styles.js";

/**
 * v2 값: flex-wrap gap-1.5, 칩 = bm-chip(rounded-full·xs·bold) + 회전 accent
 * (cat-3·2·4·8·5)의 12% 배경 + cat 글자, 앞에 옅은 # 프리픽스(opacity .7).
 * finance cat 8색 --bm-cat-* → jd 폴백 체인(daily-themes-calendar 동형).
 *
 * 폴백은 v2 Tailwind 리터럴(#ec4899/#14b8a6/#f59e0b/#8b5cf6/#10b981)이었는데, 그 다섯은
 * 팔레트 밖 형광색이라 --bm-cat-*를 안 주는 앱에서 화면에 그대로 남았다. 태그 색은
 * 의미가 아니라 **구분용 계열색**이므로 `--jd-color-hue-*`에서 고른다(§8). 이웃한 두 칩이
 * 섞이지 않도록 회전 순서(teal→pink→amber→green→violet)의 색상 간격을 유지했다.
 */
export default css`
  @layer junds.components {
    jd-theme-tag-list {
      --jd-fin-cat-2: var(--bm-cat-2, var(--jd-color-hue-pink));
      --jd-fin-cat-3: var(--bm-cat-3, var(--jd-color-hue-teal));
      --jd-fin-cat-4: var(--bm-cat-4, var(--jd-color-hue-amber));
      --jd-fin-cat-5: var(--bm-cat-5, var(--jd-color-hue-violet));
      --jd-fin-cat-8: var(--bm-cat-8, var(--jd-color-hue-green));

      display: block;
      box-sizing: border-box;
      font-family: var(--jd-font-sans);
    }
    jd-theme-tag-list * {
      box-sizing: border-box;
    }

    .jd-theme-tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--jd-space-1-5);
    }
    /* 회전 색은 칩마다 앵커 한 줄(--_jd-tt-hue)로만 갈리고, 면·글자·호버·눌림은
     전부 그 앵커에서 파생한다 — 상태를 새로 넣을 때 다섯 벌을 고칠 일이 없다. */
    .jd-theme-tag-list__chip {
      --_jd-tt-hue: var(--jd-fin-cat-3); /* data-accent="0" 기본 */
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-0-5);
      padding: var(--jd-space-0-5) var(--jd-space-2);
      border-radius: var(--jd-radius-full);
      border: var(--jd-border-thin) solid transparent;
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-bold);
      text-decoration: none;
      white-space: nowrap;
      /* 12% 틴트 위 원색 cat 글자는 대비 미달(cat-4 amber ~1.9:1) — 글자를 foreground 쪽으로
       섞어 대비를 올리되 색상(hue)은 유지한다(03-web-arch §4.3, 라이트/다크 양쪽 대응). */
      background: color-mix(in srgb, var(--_jd-tt-hue) 12%, transparent);
      color: color-mix(in srgb, var(--_jd-tt-hue) 65%, var(--jd-color-foreground));
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-theme-tag-list__chip[data-accent="1"] {
      --_jd-tt-hue: var(--jd-fin-cat-2);
    }
    .jd-theme-tag-list__chip[data-accent="2"] {
      --_jd-tt-hue: var(--jd-fin-cat-4);
    }
    .jd-theme-tag-list__chip[data-accent="3"] {
      --_jd-tt-hue: var(--jd-fin-cat-8);
    }
    .jd-theme-tag-list__chip[data-accent="4"] {
      --_jd-tt-hue: var(--jd-fin-cat-5);
    }
    /* 호버는 실색 전환 — filter: brightness는 글자까지 함께 밝혀 틴트 위 글자가 녹고,
     칩마다 GPU 레이어를 새로 만든다. 틴트를 한 단 올리고 테두리를 드러낸다. */
    .jd-theme-tag-list__chip:hover {
      background: color-mix(in srgb, var(--_jd-tt-hue) 20%, transparent);
      border-color: color-mix(in srgb, var(--_jd-tt-hue) 34%, transparent);
    }
    .jd-theme-tag-list__chip:active {
      scale: 0.97;
      background: color-mix(in srgb, var(--_jd-tt-hue) 28%, transparent);
    }
    .jd-theme-tag-list__chip:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }
    .jd-theme-tag-list__hash {
      opacity: var(--jd-opacity-70);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-theme-tag-list__chip {
        transition: none;
      }
    }
  }
`;
