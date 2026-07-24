/**
 * jd-announcement-bar CSS — v2 composites/AnnouncementBar
 * (flex 중앙 정렬 · gap-3 · px-4 py-2 · text-sm font-medium · 꽉 찬 색 배경).
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
    display: flex; align-items: center; justify-content: center;
    gap: var(--jd-space-3); box-sizing: border-box;
    padding: var(--jd-space-2) var(--jd-space-4);
    font-family: var(--jd-font-sans); font-size: var(--jd-text-sm);
    font-weight: var(--jd-weight-medium);
    color: #ffffff;
    background: color-mix(in srgb, var(--_jd-ann-color) 80%, var(--jd-color-foreground));
    --_jd-ann-color: var(--jd-color-primary); /* variant 기본 primary */
  }
  jd-announcement-bar[hidden] { display: none; }

  /* 반전 톤 — 배경/전경을 통째로 맞바꾼다(색 혼합 대상이 없다) */
  jd-announcement-bar[variant="neutral"] {
    color: var(--jd-color-background);
    background: var(--jd-color-foreground);
  }
  jd-announcement-bar[variant="success"] { --_jd-ann-color: var(--jd-color-success); }
  jd-announcement-bar[variant="warning"] { --_jd-ann-color: var(--jd-color-warning); }
  jd-announcement-bar[variant="danger"] { --_jd-ann-color: var(--jd-color-danger); }

  /* v2 JSDoc이 약속했던 sticky를 opt-in으로 실제 제공 */
  jd-announcement-bar[sticky] {
    position: sticky; top: 0; z-index: var(--jd-z-sticky);
  }

  /* 본문이 길어도 아이콘·CTA·닫기를 밀어내지 않게 — flex item 기본 min-width:auto 해제 */
  jd-announcement-bar > .jd-banner__content { min-width: 0; }

  .jd-announcement-bar__icon { display: flex; flex-shrink: 0; }
  .jd-announcement-bar__icon[hidden] { display: none; }

  .jd-announcement-bar__cta {
    flex-shrink: 0; padding: 0; border: 0; background: none;
    font: inherit; color: inherit; cursor: pointer;
    text-decoration: underline; text-underline-offset: 2px;
    transition: opacity var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-announcement-bar__cta:hover { opacity: 0.8; }
  .jd-announcement-bar__cta[hidden] { display: none; }
  .jd-announcement-bar__cta:focus-visible {
    outline: var(--jd-border-medium) solid currentColor; outline-offset: 2px;
    border-radius: var(--jd-radius-sm);
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
    .jd-announcement-bar__cta { transition: none; }
  }
}`;
