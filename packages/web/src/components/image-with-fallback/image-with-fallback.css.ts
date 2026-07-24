/**
 * jd-image-with-fallback CSS — v2 ImageWithFallback의 토큰 번역.
 *
 * v2 값: 래퍼 `relative overflow-hidden bg-gray-100 dark:bg-gray-800` + aspectRatio,
 * 스켈레톤 `absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100
 * animate-pulse`, 자리표시자 `absolute inset-0 flex items-center justify-center
 * text-muted text-xs`, img `w-full h-full object-cover transition-opacity duration-300`.
 *
 * 판단 3건:
 * 1. **img 규칙은 다시 쓰지 않는다.** 치수·object-fit·opacity 전이는 image.css의
 *    `.jd-image__img`(클래스 셀렉터라 태그 무관)가 이미 준다. 여기서는 **호스트 태그에
 *    묶인 규칙**(상태 훅·fit·radius)만 이 태그 이름으로 다시 건다 — 값의 단일 출처는
 *    계속 image.css다.
 * 2. **스켈레톤 오버라이드는 두 클래스로 건다.** `.jd-skeleton-block`과 특이도가
 *    같으면 시트 채택 순서가 승부를 가른다 — `.…__skeleton.jd-skeleton-block`(0,2,0)로
 *    올려 순서 의존을 없앤다.
 * 3. **자리표시자는 흐름 배치다.** absolute로 두면 ratio·height를 주지 않은 사용처에서
 *    높이가 0이 되어 아무것도 안 보인다(jd-image fallback 슬롯이 e2e로 겪은 함정).
 *    스켈레톤은 로딩 중 img 위에 겹쳐야 하므로 v2대로 absolute를 유지한다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-image-with-fallback {
    position: relative; display: block; overflow: hidden;
    box-sizing: border-box; /* ratio·width에 padding/border 병용 시 총치수 유지(DEC-014-9) */
    background: var(--jd-color-card-hover); /* v2 bg-gray-100 dark:bg-gray-800 */
  }

  /* 상태 훅 — image.css의 같은 규칙은 jd-image 태그에 묶여 있다 */
  jd-image-with-fallback[status="loaded"] .jd-image__img { opacity: var(--jd-opacity-100); }
  jd-image-with-fallback[status="error"] .jd-image__img { display: none; }

  jd-image-with-fallback[fit="contain"] .jd-image__img { object-fit: contain; }
  jd-image-with-fallback[fit="fill"] .jd-image__img { object-fit: fill; }
  jd-image-with-fallback[fit="none"] .jd-image__img { object-fit: none; }
  jd-image-with-fallback[fit="scale-down"] .jd-image__img { object-fit: scale-down; }

  jd-image-with-fallback[radius="sm"] { border-radius: var(--jd-radius-sm); }
  jd-image-with-fallback[radius="md"] { border-radius: var(--jd-radius-md); }
  jd-image-with-fallback[radius="lg"] { border-radius: var(--jd-radius-lg); }
  jd-image-with-fallback[radius="full"] { border-radius: var(--jd-radius-full); }

  /* 로딩 스켈레톤 — 반짝임(색·박자·다크·감속 선호)은 .jd-skeleton-block에서 온다 */
  .jd-image-with-fallback__skeleton.jd-skeleton-block {
    display: none; position: absolute; inset: 0;
    border-radius: 0; /* 모서리는 호스트가 자른다 */
    background: linear-gradient(
      90deg,
      var(--jd-color-card-hover) 0%,
      var(--jd-skeleton-color, #e5e7eb) 50%,
      var(--jd-color-card-hover) 100%
    );
  }
  jd-image-with-fallback[status="loading"]:not([no-skeleton])
    > .jd-image-with-fallback__skeleton.jd-skeleton-block:not([hidden]) { display: block; }

  /* 주소를 다 소진했을 때의 자리표시자 */
  .jd-image-with-fallback__empty {
    display: none;
    box-sizing: border-box;
    flex-direction: column; align-items: center; justify-content: center;
    gap: var(--jd-space-2);
    font-family: var(--jd-font-sans); font-size: var(--jd-text-xs);
    line-height: 1.4; text-align: center;
    color: var(--jd-color-muted); background: var(--jd-color-card-hover);
  }
  jd-image-with-fallback[status="error"]
    > .jd-image-with-fallback__empty:not([hidden]) {
    display: flex; width: 100%; height: 100%;
  }
  .jd-image-with-fallback__empty-icon {
    display: inline-flex; color: var(--jd-color-muted-light);
  }

  /* 슬롯 규약(DEC-014-4) 계승 — 소비자 노드가 내장 자리표시자를 대신한다 */
  jd-image-with-fallback > [slot="placeholder"],
  jd-image-with-fallback > [slot="fallback"] {
    display: none; align-items: center; justify-content: center;
    font-family: var(--jd-font-sans); font-size: var(--jd-text-xs);
    color: var(--jd-color-muted); background: var(--jd-color-card-hover);
  }
  jd-image-with-fallback > [slot="placeholder"] { position: absolute; inset: 0; }
  jd-image-with-fallback[status="loading"] > [slot="placeholder"] { display: flex; }
  jd-image-with-fallback[status="error"] > [slot="fallback"] {
    display: flex; width: 100%; height: 100%;
  }
}`;
