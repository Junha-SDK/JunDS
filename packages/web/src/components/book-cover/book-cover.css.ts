import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 토큰 의미 번역):
 * - 루트: relative rounded-md overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.18)]
 * - size: sm w-20 h-28(5/7rem) · md w-32 h-44(8/11rem) · lg w-44 h-60(11/15rem)
 *   · xl w-56 h-80(14/20rem)  ("fill"은 v3 신설 — jd-book-card 합성용)
 * - 폴백: w-full h-full flex flex-col justify-end p-3 text-white
 *   bg-gradient-to-br from-slate-700(#334155) to-slate-900(#0f172a)
 *   제목 text-xs font-bold leading-tight line-clamp-3 · 저자 text-[10px] opacity-80 mt-1
 * - 광택: absolute inset-0 bg-gradient-to-t from-black/10 to-transparent
 * - spine: left-0 top-0 bottom-0 w-1.5(0.375rem) bg-black/15 rounded-l-md
 * - tilt: transition-transform 300ms · hover -rotate-2 -translate-y-1(0.25rem)
 *
 * slate 리터럴은 v2 승계다(jd-badge의 gray·blue 선례) — 표지의 기본 그라디언트는
 * 브랜드 색이 아니라 "종이 없는 책등" 표현이라 테마 토큰으로 옮기지 않는다.
 * 소비자 재색칠 통로는 `hue`(= --jd-book-cover-hue) 하나다.
 */
export default css`
@layer junds.base {
  jd-book-cover:not(:defined) { display: block; }
}
@layer junds.components {
  jd-book-cover {
    position: relative;
    display: block;
    box-sizing: border-box;
    width: 8rem; height: 11rem; /* md 기본 — size는 attribute가 고른다 */
    overflow: hidden;
    border-radius: var(--jd-radius-md);
    box-shadow: 0 4px 14px rgba(0,0,0,.18);
    font-family: var(--jd-font-sans);
    isolation: isolate;
  }
  jd-book-cover[size="sm"] { width: 5rem;  height: 7rem;  }
  jd-book-cover[size="lg"] { width: 11rem; height: 15rem; }
  jd-book-cover[size="xl"] { width: 14rem; height: 20rem; }
  /* 부모 상자를 채운다 — 라운딩·그림자는 부모(jd-book-card)가 정한다 */
  jd-book-cover[size="fill"] {
    width: 100%; height: 100%;
    border-radius: inherit;
    box-shadow: none;
  }

  .jd-book-cover__img {
    position: absolute; inset: 0;
    display: block; width: 100%; height: 100%;
    object-fit: cover;
  }
  /* 이미지가 없거나 실패했으면 폴백만, 있으면 이미지만 그린다 */
  jd-book-cover:not([data-image]) .jd-book-cover__img { display: none; }
  jd-book-cover[data-image] .jd-book-cover__fallback { display: none; }

  .jd-book-cover__fallback {
    position: absolute; inset: 0;
    display: flex; flex-direction: column; justify-content: flex-end;
    box-sizing: border-box;
    padding: var(--jd-space-3);
    color: #fff;
    background: var(--jd-book-cover-hue, linear-gradient(135deg, #334155 0%, #0f172a 100%));
  }
  .jd-book-cover__title {
    font-size: var(--jd-text-xs);
    font-weight: var(--jd-weight-bold);
    line-height: var(--jd-leading-tight);
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .jd-book-cover__title[hidden] { display: none; }
  .jd-book-cover__author {
    margin-block-start: var(--jd-space-1);
    font-size: 10px;
    opacity: var(--jd-opacity-80);
  }
  .jd-book-cover__author[hidden] { display: none; }

  /* 하단 광택 — DOM 0 */
  jd-book-cover::after {
    content: ""; position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(to top, rgba(0,0,0,.1) 0%, transparent 100%);
  }

  .jd-book-cover__spine { display: none; }
  jd-book-cover[effect="spine"] .jd-book-cover__spine {
    display: block;
    position: absolute; inset-block: 0; inset-inline-start: 0;
    width: 0.375rem;
    background: rgba(0,0,0,.15);
    border-start-start-radius: var(--jd-radius-md);
    border-end-start-radius: var(--jd-radius-md);
  }

  jd-book-cover[effect="tilt"] {
    transition: transform var(--jd-duration-slow) var(--jd-easing-ease-out);
  }
  @media (prefers-reduced-motion: no-preference) {
    jd-book-cover[effect="tilt"]:hover { transform: translateY(-0.25rem) rotate(-2deg); }
  }
}`;
