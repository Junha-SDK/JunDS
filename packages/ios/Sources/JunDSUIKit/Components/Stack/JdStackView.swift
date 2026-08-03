import JunDSCore
import UIKit

// 웹 HStack/VStack/Group/Flex 흡수 — UIStackView 박판 래퍼 (04 §10.1, DESIGN §2.3).
// spacing 표면이 JdGap만 받아 원시 CGFloat 하드코딩을 차단한다.
// Group의 wrap은 UIStackView 한계로 미지원(no-wrap 폴백) — SwiftUI는 JdFlowLayout이 담당.
public final class JdStackView: UIStackView {

    // named gap 토큰 — didSet에서 spacing으로 환산
    public var gap: JdGap {
        didSet { spacing = gap.value }
    }

    // 기본값 = 웹 jd-vstack 동형: column·gap md(16)·align stretch(→UIKit .fill)
    public init(
        axis: NSLayoutConstraint.Axis = .vertical,
        gap: JdGap = .md,
        alignment: UIStackView.Alignment = .fill,
        distribution: UIStackView.Distribution = .fill,
        arranged: [UIView] = []
    ) {
        self.gap = gap
        super.init(frame: .zero)
        self.axis = axis
        self.spacing = gap.value
        self.alignment = alignment
        self.distribution = distribution
        for view in arranged {
            addArrangedSubview(view)
        }
    }

    required init(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    // 웹 jd-hstack 기본 동형: row·gap sm(8)·align center
    public static func horizontal(
        gap: JdGap = .sm,
        alignment: UIStackView.Alignment = .center,
        _ views: [UIView] = []
    ) -> JdStackView {
        return JdStackView(axis: .horizontal, gap: gap, alignment: alignment, arranged: views)
    }

    // 웹 jd-vstack 기본 동형: column·gap md(16)·align stretch(→.fill)
    public static func vertical(gap: JdGap = .md, _ views: [UIView] = []) -> JdStackView {
        return JdStackView(axis: .vertical, gap: gap, alignment: .fill, arranged: views)
    }
}
