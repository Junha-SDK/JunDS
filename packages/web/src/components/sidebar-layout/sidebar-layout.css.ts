import { css } from "../../core/styles.js";

/**
 * 사이드바 + 본문. 본문이 최소 폭을 못 지키는 순간 **스스로** 위아래로 쌓인다.
 *
 * ## 원리
 * 사이드바는 고유 폭(`flex-basis`)을 갖고 늘어나지 않는 쪽, 본문은 `flex-grow: 999`로
 * 남는 공간을 전부 먹는 쪽이다. 본문에 `min-inline-size`를 주면 그보다 좁아질 수 없고,
 * flex는 한 줄에 못 넣는 아이템을 다음 줄로 내리므로 **자동으로 세로 배치가 된다.**
 * 임계 폭을 어디에도 적지 않는다 — "본문이 이만큼은 되어야 한다"만 적으면 꺾이는
 * 지점은 사이드바 폭에서 따라 나온다.
 *
 * ## 왜 뷰포트가 아니라 여기서 결정되나
 * 미디어 쿼리로 짜면 사이드바 폭을 바꿀 때마다 브레이크포인트도 같이 고쳐야 하고,
 * 둘이 어긋나면 본문이 찌그러진 채로 남는다. 여기서는 고칠 곳이 하나다.
 */
export default css`
  @layer junds.components {
    jd-sidebar-layout {
      display: flex;
      flex-wrap: wrap;
      gap: var(--jd-space-6);
      align-items: flex-start;

      /* 사이드바가 한 줄에 있을 때의 폭 */
      --jd-sidebar-width: 16rem;
      /* 본문이 이보다 좁아지면 한 줄을 포기하고 쌓인다 */
      --jd-sidebar-content-min: 60%;
    }

    /* 사이드바 — 자기 폭을 유지하되, 쌓였을 때는 한 줄을 다 쓴다 */
    jd-sidebar-layout > :first-child {
      flex-grow: 1;
      flex-basis: var(--jd-sidebar-width);
    }

    /* 본문 — 남는 공간을 전부 먹고, 최소 폭이 안 되면 다음 줄로 내려간다 */
    jd-sidebar-layout > :last-child {
      flex-grow: 999;
      flex-basis: 0;
      min-inline-size: var(--jd-sidebar-content-min);
    }

    /* 사이드바를 오른쪽으로 — DOM 순서는 그대로 두고 시각 순서만 뒤집는다.
     본문을 먼저 읽는 것이 스크린 리더·탭 순서에 맞는 경우가 많아 마크업을
     바꾸게 하지 않는다. */
    jd-sidebar-layout[side="end"] > :first-child {
      order: 1;
    }
  }
`;
