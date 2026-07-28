import { css } from "../../core/styles.js";

/**
 * 양끝 배치. flex/justify-content를 몰라도 "제목 왼쪽, 버튼 오른쪽"이 되는 이름.
 *
 * 줄바꿈을 켜 두는 이유: 좁아지면 두 덩어리가 겹치거나 넘치는 대신 아래로 내려간다.
 * `space-between`은 한 줄에 다 들어갈 때만 의미가 있고, 안 들어가면 자연히 쌓인다 —
 * 미디어 쿼리 없이 좁은 폭에서 무너지지 않는다.
 */
export default css`
  @layer junds.components {
    jd-split {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-4);
    }
    /* 세로 정렬을 바꾸고 싶으면 다른 컨테이너와 똑같이 align 스타일 프롭을 쓴다
     (align="start" → 인라인 align-items). 여기에 따로 규칙을 두지 않는 이유는
     어휘를 하나로 유지하기 위해서다 — jd-hstack과 같은 방식으로 동작해야 한다. */

    /* 줄바꿈 금지 — 넘쳐도 한 줄을 유지해야 하는 툴바 등 */
    jd-split[no-wrap] {
      flex-wrap: nowrap;
    }
  }
`;
