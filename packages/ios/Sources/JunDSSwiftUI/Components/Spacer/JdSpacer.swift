import JunDSCore
import SwiftUI

// 웹 jd-spacer 동형 — 토큰 간격 스페이서 (DESIGN-2 §A).
// 웹은 vertical = padding-block, horizontal = padding-inline로 **양쪽**에 패딩을 주므로
// 실제 차지 공간이 size의 2배다. iOS도 그 값을 그대로 승계한다 (웹 패리티).
// ⚠️ SwiftUI의 탐욕적 Spacer()가 아니다 — 고정 크기 뷰다.
public struct JdSpacer: View {
    private let size: JdGap
    private let axis: JdSpacerAxis

    public init(_ size: JdGap = .md, axis: JdSpacerAxis = .vertical) {
        self.size = size
        self.axis = axis
    }

    // 웹 양측 패딩의 합 — 총 2×size
    private var length: CGFloat { size.value * 2 }

    public var body: some View {
        Color.clear
            // 교차축은 0 — 웹의 빈 블록이 max-content 폭에 0을 기여하는 것과 동형이며,
            // Color.clear의 탐욕적 확장이 부모 스택 폭을 부풀리는 것을 막는다.
            .frame(
                width: axis == .horizontal ? length : 0,
                height: axis == .vertical ? length : 0
            )
            // 웹 aria-hidden 고정 동형 — 순수 장식 (04 §7.1)
            .accessibilityHidden(true)
    }
}
