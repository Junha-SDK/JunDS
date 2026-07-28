/**
 * jd-qr-code CSS — v2 QRCode에는 스타일이 없었다(width/height 속성 + fill 뿐).
 * v3가 더하는 것은 셋뿐이다:
 *  1. 호스트 display — 업그레이드 전후 자리 이동을 없앤다.
 *  2. `shape-rendering: crispEdges` — 정수 모듈 좌표를 흐리지 않고 찍는다.
 *  3. CSS로 크기를 덮어쓸 때의 종횡비 보존(`height: auto`가 아니라 aspect-ratio).
 * 색은 프로퍼티(color/bg-color)가 fill로 직접 나가므로 CSS 규칙을 두지 않는다 —
 * 대비가 스캔 가능성의 전부인 표현이라 테마 색으로 흐리는 훅을 만들지 않는다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-qr-code {
      display: inline-block;
      line-height: 0;
    }

    .jd-qr-code__canvas {
      display: block;
      max-width: 100%;
      aspect-ratio: 1 / 1;
      shape-rendering: crispEdges;
    }
  }
`;
