/**
 * jd-auto-hide-header CSS — v2 composites/AutoHideHeader(sticky top-0 z-50 w-full ·
 * transition-transform duration-300 ease-in-out · 숨김 시 -translate-y-full)의 토큰 번역.
 *
 * v2 z-50은 "페이지 상단 고정물" 서열이라는 뜻 → 의미 토큰 --jd-z-header(30).
 * (--jd-z-modal(50)로 직역하면 헤더가 모달 위로 올라온다.)
 * 높이는 인라인 style 대신 --jd-auto-hide-header-height 커스텀 프로퍼티로 받는다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-auto-hide-header {
      display: block;
      box-sizing: border-box;
      width: 100%;
      position: sticky;
      inset-block-start: 0;
      z-index: var(--jd-z-header);
      transition: transform var(--jd-duration-slow) var(--jd-easing-ease-in-out);
      /* will-change를 상시로 둔다. transform이 걸린 요소는 position:fixed 자손의
       컨테이닝 블록이 되는데(레포 선례: .container transform → 하단 고정물 밀림),
       [collapsed]일 때만 transform이 생기면 헤더 안의 fixed 드롭다운이 **접힘 여부에
       따라 다른 기준으로 배치된다**. 상시 승격으로 그 분기를 없앤다. */
      will-change: transform;
    }
    jd-auto-hide-header[collapsed] {
      transform: translateY(-100%);
    }

    .jd-auto-hide-header__bar {
      display: block;
      box-sizing: border-box;
      width: 100%;
      height: var(--jd-auto-hide-header-height, 64px);
    }

    @media (prefers-reduced-motion: reduce) {
      jd-auto-hide-header {
        transition: none;
      }
    }
  }
`;
