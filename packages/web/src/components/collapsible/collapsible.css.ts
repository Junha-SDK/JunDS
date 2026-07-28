/**
 * jd-collapsible CSS — 원형(jd-disclosure) 시트 위에 v2 Collapsible의 스킨만 얹는다.
 * v2 값: 루트 `w-full`, 트리거 `w-full cursor-pointer`(별도 크롬 없음).
 * 호스트 셀렉터는 태그마다 따로 필요하다(파생 태그는 원형 태그 셀렉터에 걸리지 않는다).
 *
 * 트리거 크롬과 셰브런은 원형이 준다 — jd-collapsible은 골격을 미리 그려 넘기지
 * 않으므로(입양 없음) 원형의 "홀로 쓰이는 트리거" 분기에 그대로 걸린다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.base {
    jd-collapsible:not(:defined) {
      display: block;
    }
  }
  @layer junds.components {
    jd-collapsible {
      display: block;
      width: 100%;
      /* 트리거는 폰트를 스스로 정하지만 본문은 페이지에서 상속받는다 —
       한 컴포넌트 안에서 서체가 갈리지 않게 호스트에서 한 번 정한다. */
      font-family: var(--jd-font-sans);
    }
    /* 열린 본문이 트리거 라벨과 같은 세로선에 서게 한다(원형은 여백을 갖지 않는다 —
     입양 골격이 각자 정하기 때문). 값은 원형 트리거 크롬의 좌우 패딩과 같다.
     padding이 아니라 margin인 이유: inner는 0fr 트랙에 stretch되는 그리드 아이템이라
     padding은 높이 0으로 눌러도 남는다(닫힌 패널이 패딩만큼 자리를 차지한다).
     margin은 트랙 밖이라 접힘이 실제로 0이 된다. */
    jd-collapsible > .jd-disclosure__panel > .jd-disclosure__inner {
      margin: var(--jd-space-1) var(--jd-space-3) var(--jd-space-3);
      line-height: var(--jd-leading-relaxed);
    }
  }
`;
