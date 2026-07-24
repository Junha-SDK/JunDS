/**
 * <jd-key-value-grid> — 필드명·값 그리드 (v2 composites/KeyValueGrid)
 *   = **jd-descriptions 파생**(§6 R12).
 *
 * v2에서 KeyValueGrid와 Descriptions는 같은 데이터 모델({key,label,value,span})을
 * 각자 그리던 컴포넌트였다. 실질 차이는 셋뿐이다:
 *  (a) 기본 3열이고 반응형이다 (모바일 1 → sm 2 → md columns)
 *  (b) 라벨이 항상 값 위에 온다 (layout=vertical 고정 기본값)
 *  (c) 라벨 타이포가 다르다 (10px 대문자 자간 넓힘) + 값에 호버 하이라이트
 * 데이터 → dl/dt/dd 골격, span 배치, JSON 슬롯, 제목 결선은 전부 원형에서 온다.
 *
 * v2 대비 개선: v2는 `bordered`를 `gap-px` + 컨테이너 배경색으로 그려서 **마지막 행이
 * 덜 찼을 때 빈 칸이 테두리색 덩어리로 남았다**. 원형의 격자(모든 셀에 선 + 음수 마진
 * 클리핑)는 같은 1px 외관을 내면서 그 결함이 없다.
 *
 * v2 `columns` 타입은 2|3|4였다. 여기서는 Number 프롭이라 다른 값도 들어오지만
 * 반응형 열 규칙은 2·3·4만 정의한다(그 밖의 값은 md 이상에서 3열로 떨어진다) —
 * v2가 표현하던 범위를 넘지 않기 위한 의도적 제한이다.
 */
import { JdDescriptions } from "../descriptions/element.js";
import { adoptStyles } from "../../core/styles.js";
import keyValueGridStyles from "./key-value-grid.css.js";

export class JdKeyValueGrid extends JdDescriptions {
  static override tag = "jd-key-value-grid";
  static override props = {
    ...JdDescriptions.props,
    columns: { type: Number, default: 3, reflect: true },
    layout: { type: String, default: "vertical", reflect: true },
  };

  protected override render(): void {
    super.render();
    adoptStyles(keyValueGridStyles);
  }
}
