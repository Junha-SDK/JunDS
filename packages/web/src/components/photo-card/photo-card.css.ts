/**
 * jd-photo-card CSS — v2 composites/PhotoCard 토큰 번역.
 *
 * v2 값: 루트 `rounded-xl overflow-hidden bg-surface border border-border`,
 * 프레임 `relative`(+ style aspectRatio), 이미지 `w-full h-full object-cover`,
 * 배지 `absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-white
 * text-[10px] font-semibold backdrop-blur`, 캡션 `p-3`,
 * 제목 `text-sm font-medium truncate`, 메타 `text-[11px] text-muted mt-0.5`,
 * 메타행 `flex gap-3 mt-2 text-[11px] text-muted`,
 * interactive `transition-all duration-200 hover:-translate-y-0.5
 * hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]`.
 * (Tailwind bg-surface == `--color-surface: var(--card)` → --jd-color-card ·
 *  text-sm 0.875rem == --jd-text-md · text-[10px]·[11px]는 대응 토큰 없어 리터럴)
 *
 * 상승 효과는 호버뿐 아니라 :focus-within에도 준다 — v2는 마우스 사용자만 피드백을
 * 받았다(jd-card와 같은 교정). 이동은 prefers-reduced-motion에서 뺀다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.base {
    jd-photo-card:not(:defined) {
      display: block;
    }
  }
  @layer junds.components {
    jd-photo-card {
      display: block;
    }

    .jd-photo-card__figure {
      margin: 0;
      overflow: hidden;
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
      font-family: var(--jd-font-sans);
    }

    jd-photo-card[interactive] > .jd-photo-card__figure {
      transition: transform var(--jd-duration-normal) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
    jd-photo-card[interactive]:hover > .jd-photo-card__figure,
    jd-photo-card[interactive]:focus-within > .jd-photo-card__figure {
      transform: translateY(-2px); /* v2 -translate-y-0.5 */
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .jd-photo-card__frame {
      position: relative;
      aspect-ratio: var(--jd-photo-card-ratio, 4 / 5);
      background: var(--jd-color-card-hover); /* 로드 전 빈 프레임이 흰 구멍이 되지 않게 */
    }

    .jd-photo-card__img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .jd-photo-card__badge {
      position: absolute;
      inset-block-start: var(--jd-space-2);
      inset-inline-end: var(--jd-space-2);
      display: inline-flex;
      align-items: center;
      padding: 0.125rem var(--jd-space-2); /* v2 px-2 py-0.5 */
      color: #fff;
      background: rgba(0, 0, 0, 0.6);
      border-radius: var(--jd-radius-full);
      font-size: 10px; /* v2 text-[10px] — 대응 토큰 없음(jd-badge 선례) */
      font-weight: var(--jd-weight-semibold);
      line-height: var(--jd-leading-normal);
      backdrop-filter: blur(4px);
    }
    .jd-photo-card__badge[hidden] {
      display: none;
    }

    .jd-photo-card__caption {
      padding: var(--jd-space-3);
    }
    .jd-photo-card__caption[hidden] {
      display: none;
    }

    .jd-photo-card__text {
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-medium);
      color: var(--jd-color-foreground);
    }
    .jd-photo-card__text[hidden] {
      display: none;
    }

    .jd-photo-card__meta {
      margin: var(--jd-space-0-5) 0 0;
      font-size: 11px; /* v2 text-[11px] */
      color: var(--jd-color-muted);
    }
    .jd-photo-card__meta[hidden] {
      display: none;
    }

    .jd-photo-card__stats {
      display: flex;
      align-items: center;
      gap: var(--jd-space-3);
      margin-block-start: var(--jd-space-2);
      font-size: 11px;
      color: var(--jd-color-muted);
    }
    .jd-photo-card__stats[hidden] {
      display: none;
    }

    .jd-photo-card__stat {
      display: inline-flex;
      align-items: center;
      gap: 0.25em;
      font-variant-numeric: tabular-nums;
    }
    .jd-photo-card__stat[hidden] {
      display: none;
    }

    /* 이름은 화면에서만 감춘다 — AT는 "좋아요 142"로 읽는다 */
    .jd-photo-card__sr {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      jd-photo-card[interactive] > .jd-photo-card__figure {
        transition: none;
      }
      jd-photo-card[interactive]:hover > .jd-photo-card__figure,
      jd-photo-card[interactive]:focus-within > .jd-photo-card__figure {
        transform: none;
      }
    }
  }
`;
