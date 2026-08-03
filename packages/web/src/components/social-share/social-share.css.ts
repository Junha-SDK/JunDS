/**
 * jd-social-share CSS — v2 composites/SocialShare의 토큰 번역.
 * 원본: inline-flex gap-2 flex-wrap · 버튼 sm28/md36/lg44 · circle=rounded-full
 * square=rounded-md · text-white(kakao만 #3C1E1E) · hover:scale-110 · text-xs 글리프.
 *
 * 플랫폼 브랜드 색은 **정체성이라 리터럴로 남긴다**(DEC-025-1) — X의 파랑을 primary로
 * 바꾸면 그건 더 이상 X 버튼이 아니다. 팔레트 규약(§8)이 적용되는 것은 브랜드가 없는
 * 나머지다: email·copy는 v2에서 neutral-400/500이었는데 이 둘은 모드에 따라 뒤집히는
 * 계단이라 흰 글리프가 라이트에서 2.2:1까지 떨어졌다. hue-gray는 모드 불변이라 양쪽에서
 * 5.4:1을 지키고, copy는 브랜드가 아니라 **이 앱 자신의 동작**이므로 primary가 맞다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-social-share {
      display: inline-flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--jd-space-2);
    }

    .jd-social-share__btn {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px; /* md 기본 */
      padding: 0;
      border: 0;
      cursor: pointer;
      color: #fff;
      text-decoration: none;
      font-family: var(--jd-font-sans);
      font-weight: var(--jd-weight-semibold);
      border-radius: var(--jd-radius-full); /* circle 기본 */
      /* 채운 원판은 위에서 빛을 받는다 — 인셋 하이라이트가 없으면 색종이로 읽힌다 */
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
      /* all 금지 — 대상 속성을 지목한다(DEC-039). 확대는 transform이 아니라 scale로
       써야 :active의 축소가 같은 속성을 이어받아 매끄럽게 되돌아간다. */
      transition: box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-social-share__btn:hover {
      scale: 1.1;
      box-shadow: var(--jd-shadow-md), inset 0 1px 0 var(--jd-color-highlight);
    }
    /* 눌린 면은 빛을 잃는다 */
    .jd-social-share__btn:active {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-social-share__btn:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    jd-social-share[size="sm"] .jd-social-share__btn {
      width: 28px;
      height: 28px;
    }
    jd-social-share[size="lg"] .jd-social-share__btn {
      width: 44px;
      height: 44px;
    }
    jd-social-share[shape="square"] .jd-social-share__btn {
      border-radius: var(--jd-radius-md);
    }

    .jd-social-share__glyph {
      font-size: var(--jd-text-xs);
      line-height: 1;
    }

    /* 플랫폼 브랜드 색 (v2 COLORS 승계) */
    .jd-social-share__btn[data-platform="twitter"] {
      background: #1da1f2;
    }
    .jd-social-share__btn[data-platform="facebook"] {
      background: #1877f2;
    }
    .jd-social-share__btn[data-platform="linkedin"] {
      background: #0a66c2;
    }
    .jd-social-share__btn[data-platform="kakao"] {
      background: #fee500;
      color: #3c1e1e;
    }
    .jd-social-share__btn[data-platform="telegram"] {
      background: #26a5e4;
    }
    .jd-social-share__btn[data-platform="whatsapp"] {
      background: #25d366;
    }
    /* 브랜드 없는 둘 — neutral 계단은 모드에 따라 뒤집혀 흰 글리프 대비가 무너진다.
     hue-gray는 모드 불변이라 라이트·다크 양쪽에서 같은 대비를 준다. */
    .jd-social-share__btn[data-platform="email"] {
      background: var(--jd-color-hue-gray);
    }
    .jd-social-share__btn[data-platform="copy"] {
      background: var(--jd-color-primary);
    }
    /* 복사 완료는 결과 보고다 — 1.5초 동안만 success로 바뀐다(element.ts가 data-copied) */
    .jd-social-share__btn[data-platform="copy"][data-copied] {
      background: var(--jd-color-success);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-social-share__btn {
        transition: none;
      }
      .jd-social-share__btn:hover {
        scale: none;
      }
    }
  }
`;
