import { css } from "../../core/styles.js";

/**
 * jd-search-bar CSS — 파생 델타만. 골격(.jd-search-input__*)의 표면·상호작용 규칙은
 * jd-search-input 시트를 그대로 쓰고, **호스트 셀렉터로 갈리는 것만** 여기서 덮는다
 * (jd-drawer가 jd-modal 골격 위에 기하만 얹는 것과 같은 구조).
 *
 * v2 composites/SearchBar 고유값: 높이 sm h-8 / md h-10 / lg h-12(SearchInput은 8/9/11),
 * 아이콘 16px(SearchInput은 14px). bg-surface는 대응 토큰 부재로 --jd-color-card 근사
 * 번역(DEC-025-4 선례).
 */
export default css`
  @layer junds.components {
    jd-search-bar {
      display: block;
      width: 100%;
    }

    jd-search-bar .jd-search-input__box {
      height: 2.5rem;
    } /* v2 md h-10 */
    jd-search-bar .jd-search-input__icon > svg {
      width: 16px;
      height: 16px;
    }
    jd-search-bar[disabled] .jd-search-input__box {
      opacity: var(--jd-opacity-50);
      cursor: not-allowed;
    }

    jd-search-bar[size="sm"] .jd-search-input__box {
      height: 2rem;
      padding-inline: var(--jd-space-2-5);
    }
    jd-search-bar[size="sm"] .jd-search-input__input {
      font-size: var(--jd-text-xs);
    }
    jd-search-bar[size="lg"] .jd-search-input__box {
      height: 3rem;
      padding-inline: var(--jd-space-4);
    }
    jd-search-bar[size="lg"] .jd-search-input__input {
      font-size: var(--jd-text-lg);
    }
  }
`;
