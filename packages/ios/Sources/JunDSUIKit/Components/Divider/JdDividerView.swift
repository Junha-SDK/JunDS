import JunDSCore
import UIKit

// 웹 jd-divider 동형 — 1px 구분선 (DESIGN §2.3).
// 웹의 수평 margin-block 16px은 이식하지 않는다 — 간격은 소비자 스택 spacing 몫.
// role=separator의 iOS 번역: 장식(라벨 없으면 접근성 트리 제외, 라벨 있으면 그 텍스트만 노출).
public final class JdDividerView: UIView {

    // 라벨 모드: line—label—line (웹 jd-divider[label] 동형). nil/빈 문자열이면 순수 선.
    public var label: String? {
        didSet {
            guard label != oldValue else { return }
            rebuild()
        }
    }

    private let orientation: JdOrientation
    private var contentStack: JdStackView?

    public init(orientation: JdOrientation = .horizontal, label: String? = nil) {
        self.orientation = orientation
        self.label = label
        super.init(frame: .zero)
        rebuild()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    // 축 두께를 intrinsic으로 고정 — 길이는 소비자 제약(스택 stretch 등) 몫.
    // 1/scale 픽셀 정렬은 과설계로 판단해 1pt 유지 — 시각 두께는 웹 1px과 동일한 JdToken.Border.thin.
    public override var intrinsicContentSize: CGSize {
        if let contentStack {
            // 라벨 모드: 두께 축은 내용(라벨 폰트) 크기를 따른다
            let fit = contentStack.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize)
            switch orientation {
            case .horizontal:
                return CGSize(width: UIView.noIntrinsicMetric, height: fit.height)
            case .vertical:
                return CGSize(width: fit.width, height: UIView.noIntrinsicMetric)
            }
        }
        switch orientation {
        case .horizontal:
            return CGSize(width: UIView.noIntrinsicMetric, height: JdToken.Border.thin)
        case .vertical:
            return CGSize(width: JdToken.Border.thin, height: UIView.noIntrinsicMetric)
        }
    }

    // MARK: 내부

    // 색은 다이나믹(JdDynamicColor.uiColor)이라 traitCollectionDidChange 재적용이 불필요하고,
    // 라벨 폰트는 adjustsFontForContentSizeCategory가 Dynamic Type을 자동 반영한다.
    private func rebuild() {
        contentStack?.removeFromSuperview()
        contentStack = nil

        if let label, !label.isEmpty {
            buildLabeled(label)
            backgroundColor = .clear
            // 라벨 텍스트만 VoiceOver에 노출 — separator는 장식이라 traits 없음
            isAccessibilityElement = true
            accessibilityLabel = label
        } else {
            // 순수 선: 뷰 자체가 선 — 접근성 트리에서 제외
            backgroundColor = JdToken.Color.border.uiColor
            isAccessibilityElement = false
            accessibilityLabel = nil
        }
        invalidateIntrinsicContentSize()
    }

    private func buildLabeled(_ text: String) {
        let leadingLine = makeLine()
        let trailingLine = makeLine()

        let textLabel = UILabel()
        textLabel.text = text
        // 웹 라벨 = footnote·muted — sm(13pt)이 JdFontBridge의 footnote 텍스트 스타일에 대응
        textLabel.font = JdFontBridge.scaledFont(
            size: JdToken.FontSize.sm,
            weight: JdToken.FontWeight.normal,
            compatibleWith: traitCollection)
        textLabel.adjustsFontForContentSizeCategory = true
        textLabel.textColor = JdToken.Color.muted.uiColor

        // 웹 gap 12(--jd-space-3) 동형 — named JdGap에 없는 값이라 custom + 토큰 참조
        let stack = JdStackView(
            axis: orientation == .horizontal ? .horizontal : .vertical,
            gap: .custom(JdToken.Space.s3),
            alignment: .center,
            arranged: [leadingLine, textLabel, trailingLine])
        addSubview(stack)
        stack.jd.layout {
            $0.edges.equalToSuperview()
        }

        // 선 두께 고정 + 두 선 등분 — 라벨이 축 중앙에 온다 (웹 line—label—line 동형)
        switch orientation {
        case .horizontal:
            leadingLine.jd.layout {
                $0.height.equal(JdToken.Border.thin)
            }
            trailingLine.jd.layout {
                $0.height.equal(JdToken.Border.thin)
                $0.width.equal(to: leadingLine.jd.width)
            }
        case .vertical:
            leadingLine.jd.layout {
                $0.width.equal(JdToken.Border.thin)
            }
            trailingLine.jd.layout {
                $0.width.equal(JdToken.Border.thin)
                $0.height.equal(to: leadingLine.jd.height)
            }
        }
        contentStack = stack
    }

    private func makeLine() -> UIView {
        let line = UIView()
        line.backgroundColor = JdToken.Color.border.uiColor
        return line
    }
}
