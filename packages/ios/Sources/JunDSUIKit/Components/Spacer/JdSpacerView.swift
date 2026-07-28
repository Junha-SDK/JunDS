import JunDSCore
import UIKit

// 웹 jd-spacer 동형 — 토큰 간격 스페이서 (DESIGN-2 §A). A8 명명 규칙 Jd<이름>View.
// 웹은 양쪽 패딩(padding-block/inline)이라 실제 차지 공간이 size의 2배다 — 그 값을 승계한다.
// 축 방향 치수만 intrinsic으로 고정하고 교차축은 소비자 제약 몫(JdDividerView 선례 동형).
public final class JdSpacerView: UIView {

    // 웹 size 속성 동형. 제약 상수는 intrinsicContentSize에서 파생되므로
    // didSet은 무효화만 하면 오토레이아웃이 새 2×size로 다시 푼다.
    public var size: JdGap {
        didSet {
            guard size != oldValue else { return }
            invalidateIntrinsicContentSize()
        }
    }

    private let axis: JdSpacerAxis

    public init(_ size: JdGap = .md, axis: JdSpacerAxis = .vertical) {
        self.size = size
        self.axis = axis
        super.init(frame: .zero)

        backgroundColor = .clear
        isUserInteractionEnabled = false
        // 웹 aria-hidden 고정 동형 — 순수 장식 (04 §7.1)
        isAccessibilityElement = false

        // 간격은 늘어나지도 줄어들지도 않아야 한다 — 축 방향 hugging/압축저항을 올린다.
        // hugging은 required 대신 999: UIStackView(.fill)와의 우선순위 충돌을 피하면서
        // 다른 배치 후보보다 먼저 자기 크기를 지킨다.
        let fixedAxis: NSLayoutConstraint.Axis = axis == .vertical ? .vertical : .horizontal
        setContentHuggingPriority(UILayoutPriority(999), for: fixedAxis)
        setContentCompressionResistancePriority(.required, for: fixedAxis)
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    // 축 방향 = 2×size(웹 양측 패딩 합), 교차축 = 미지정(소비자 제약/스택 stretch 몫)
    public override var intrinsicContentSize: CGSize {
        let length = size.value * 2
        switch axis {
        case .vertical:
            return CGSize(width: UIView.noIntrinsicMetric, height: length)
        case .horizontal:
            return CGSize(width: length, height: UIView.noIntrinsicMetric)
        }
    }
}
