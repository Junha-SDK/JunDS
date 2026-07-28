/**
 * jd-announcement-bar CSS — v2 composites/AnnouncementBar
 * (flex 중앙 정렬 · gap-3 · 꽉 찬 색 배경). 여백·자간은 v2 값(px-4 py-2 · text-sm)에서
 * 올렸다: 좁은 폭에서 본문이 두 줄로 접히면 v2 치수는 글자를 띠에 끼워 넣었다(§9).
 *
 * 본문 span과 닫기 버튼은 jd-banner 시트(.jd-banner__content / .jd-banner__close)를
 * 그대로 쓴다 — 파생 관계의 명시적 귀결이고, v2에서도 두 컴포넌트의 닫기 버튼은
 * 문자 단위로 같은 Tailwind였다. 여기서는 **톤과 공지 전용 부품**만 정의한다.
 *
 * 색: v2는 semantic 원색 위에 흰 글자였는데 success 4.0:1 · warning 3.6:1로 AA 미달이다
 * (jd-banner에서 axe로 실측한 v2 승계 결함). 같은 처방 — foreground를 20% 섞어
 * 색상은 남기고 명도만 내린다. neutral(bg-foreground/text-background)은 원래 최대
 * 대비라 손대지 않는다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-announcement-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      /* 아이콘은 본문에 속하므로 12px로 붙여 두고, 본문과 CTA 사이만 벌린다
       (아래 __cta margin) — 균일 gap을 키우면 아이콘까지 문장에서 떨어져 나간다. */
      gap: var(--jd-space-3);
      box-sizing: border-box;
      /* 세로 여백은 **한 줄 기준이 아니라 접힌 두 줄 기준**이다. 좁은 폭에서
       본문이 접히면 위아래가 압착돼 띠가 글자에 끼인 것처럼 보였다(§9 —
       폭이 좁다고 글자를 줄이지 말고 줄 수를 늘린다). */
      padding: var(--jd-space-3) var(--jd-space-5);
      min-height: 2.75rem;
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-medium);
      line-height: var(--jd-leading-snug);
      color: #ffffff;
      background: color-mix(in srgb, var(--_jd-ann-color) 80%, var(--jd-color-foreground));
      --_jd-ann-color: var(--jd-color-primary); /* variant 기본 primary */
    }
    jd-announcement-bar[hidden] {
      display: none;
    }

    /* 반전 톤 — 배경/전경을 통째로 맞바꾼다(색 혼합 대상이 없다) */
    jd-announcement-bar[variant="neutral"] {
      color: var(--jd-color-background);
      background: var(--jd-color-foreground);
    }
    jd-announcement-bar[variant="success"] {
      --_jd-ann-color: var(--jd-color-success);
    }
    jd-announcement-bar[variant="warning"] {
      --_jd-ann-color: var(--jd-color-warning);
    }
    jd-announcement-bar[variant="danger"] {
      --_jd-ann-color: var(--jd-color-danger);
    }

    /* v2 JSDoc이 약속했던 sticky를 opt-in으로 실제 제공 */
    jd-announcement-bar[sticky] {
      position: sticky;
      top: 0;
      z-index: var(--jd-z-sticky);
    }

    /* 본문이 길어도 아이콘·CTA·닫기를 밀어내지 않게 — flex item 기본 min-width:auto 해제.
     두 줄로 접힐 때는 한 줄에 한 단어만 남는 사다리꼴이 되지 않게 폭을 고르게 나눈다. */
    jd-announcement-bar > .jd-banner__content {
      min-width: 0;
      text-wrap: balance;
    }

    .jd-announcement-bar__icon {
      display: flex;
      flex-shrink: 0;
    }
    .jd-announcement-bar__icon[hidden] {
      display: none;
    }

    /* 밑줄 친 맨 텍스트는 본문과 같은 줄에 붙으면 문장의 일부로 읽힌다(§7). 눌리는
     면(알약)을 줘서 본문에서 떼어 내고, 라벨은 절대 접히지 않는다(§5). */
    .jd-announcement-bar__cta {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      margin-inline-start: var(--jd-space-2);
      padding: var(--jd-space-1) var(--jd-space-3);
      border: 0;
      border-radius: var(--jd-radius-full);
      background: color-mix(in srgb, currentColor 16%, transparent);
      font: inherit;
      font-weight: var(--jd-weight-semibold);
      line-height: var(--jd-leading-none);
      white-space: nowrap;
      color: inherit;
      cursor: pointer;
      text-decoration: none;
      /* opacity가 아니라 실색 전환 — 투명도는 글자까지 함께 흐려 배경에 녹는다(§1) */
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-announcement-bar__cta:hover {
      background: color-mix(in srgb, currentColor 28%, transparent);
    }
    .jd-announcement-bar__cta:active {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-announcement-bar__cta[hidden] {
      display: none;
    }
    .jd-announcement-bar__cta:focus-visible {
      outline: var(--jd-border-medium) solid currentColor;
      outline-offset: 2px;
    }

    /* 상속받은 닫기 버튼은 흰 글자 전제(hover rgb(255 255 255/.2), outline #fff)라
     neutral 톤·다크 테마에서 보이지 않는다 — currentColor 기준으로 되돌린다.
     특이도 (0,2,1) > jd-banner의 (0,2,0)이므로 같은 레이어에서 이긴다. */
    jd-announcement-bar .jd-banner__close:hover {
      background: color-mix(in srgb, currentColor 20%, transparent);
    }
    jd-announcement-bar .jd-banner__close:focus-visible {
      outline-color: currentColor;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-announcement-bar__cta {
        transition: none;
      }
    }
  }
`;
