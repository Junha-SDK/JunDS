/**
 * <jd-sticky> — 스크롤 컨테이너 안에서 달라붙는 래퍼 (v2 composites/Sticky) = Affix 파생.
 *
 * v2 Sticky와 Affix는 "오프셋 + z-index를 인라인 스타일로 쓰는 div"라는 **같은 몸통**에
 * position 키워드(sticky/fixed)와 기본값만 다른 형제였다. v3는 오프셋 기록기를
 * jd-affix 하나가 갖고 여기서는 시트·기본값만 재정의한다(중복 컴포넌트 = 단일 구현 +
 * 파생 · Drawer=Modal 선례).
 *
 * 파생의 실리: v2 Sticky는 `top`만 받아 **하단 고정 sticky 푸터를 만들 수 없었다**.
 * 상속으로 bottom/left/right가 그냥 생긴다(상위집합 — v2 사용처는 무영향).
 *
 * 새 필드가 없으므로 super.render() → update() 순서 함정(파생 필드 null)은 해당 없음.
 */
import { JdAffix } from "../affix/element.js";
import stickyStyles from "./sticky.css.js";

export class JdSticky extends JdAffix {
  static override tag = "jd-sticky";
  static override styles = stickyStyles;
  /** v2 Sticky 기본값: top 0 (Affix의 우하단 20과 다른 유일한 데이터) */
  static override defaultInset = { top: 0, bottom: null, left: null, right: null };
  static override props = {
    ...JdAffix.props,
    /** attr: z-index. v2 Sticky 기본 10 (Affix는 40) */
    zIndex: { type: Number, default: 10 },
  };
}
