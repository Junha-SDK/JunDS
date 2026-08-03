import { css } from "../../core/styles.js";

/**
 * 레벨별 기본값 = v2 levelDefaults 그대로. 크기는 픽셀이 아니라 --jd-text-* 이름으로
 * 적는다 — v2 리터럴과 값이 전부 일치해 외관 변화 없이 이름만 정본 척도로 옮겼다
 * (DEC-045). 기본 level 2는 미반영(DEC-012-2)이라
 * 호스트 기본 규칙이 담당하고, 명시 레벨은 attr 셀렉터(특이도 우위)가 덮는다.
 * v2의 반응형 기본(level 1·2 md↑ 확대)은 정적 @media — v2 실측은 인라인 base에
 * 눌려 무효였으나 의도 스펙대로 정상화(DECISIONS B1).
 */
export default css`
  @layer junds.components {
    jd-heading {
      display: block;
      color: var(--jd-color-foreground);
      /* 기본 = level 2: xl→md:2xl, bold, tight, tracking tight, mb 16px */
      font-size: var(--jd-text-2xl);
      font-weight: var(--jd-weight-bold);
      line-height: var(--jd-leading-tight);
      letter-spacing: var(--jd-tracking-tight);
      margin-bottom: var(--jd-space-4);
    }
    .jd-heading {
      margin: 0;
      font-size: inherit;
      font-weight: inherit;
      line-height: inherit;
    }

    jd-heading[level="1"] {
      font-size: var(--jd-text-3xl);
      margin-bottom: var(--jd-space-6);
    }
    jd-heading[level="3"] {
      font-size: var(--jd-text-2xl);
      font-weight: var(--jd-weight-semibold);
      line-height: var(--jd-leading-snug);
      letter-spacing: var(--jd-tracking-normal);
      margin-bottom: var(--jd-space-3);
    }
    jd-heading[level="4"],
    jd-heading[level="5"],
    jd-heading[level="6"] {
      font-weight: var(--jd-weight-semibold);
      line-height: var(--jd-leading-normal);
      letter-spacing: var(--jd-tracking-normal);
      margin-bottom: var(--jd-space-2);
    }
    jd-heading[level="4"] {
      font-size: var(--jd-text-xl);
    }
    jd-heading[level="5"] {
      font-size: var(--jd-text-lg);
    }
    jd-heading[level="6"] {
      font-size: var(--jd-text-md);
      text-transform: uppercase;
      margin-bottom: var(--jd-space-1-5);
    }

    /* level 1·2만 반응형 기본 — 3~6은 attr 셀렉터(특이도 우위)가 그대로 유지된다 */
    @media (min-width: 768px) {
      jd-heading {
        font-size: var(--jd-text-3xl);
      } /* level 2 기본 */
      jd-heading[level="1"] {
        font-size: var(--jd-text-4xl);
      }
    }

    jd-heading[truncate] {
      overflow: hidden;
    }
    jd-heading[truncate] > .jd-heading {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
`;
