import JunDSCore
import UIKit

// 웹 jd-file-upload 동형 — **피커는 만들지 않는다** (DESIGN-3 §B).
// 실제 선택은 소비자가 시스템 UIDocumentPickerViewController를 onTap에 붙여서 한다.
// 이 컴포넌트가 책임지는 것은 드롭존 외형(점선 테두리 + 아이콘 + 설명)과 파일 목록 표시뿐이다.
//
// ⚠️ 설명 문자열 프로퍼티 이름은 zoneDescription이다 — NSObject가 description을 점유한다
//    (UIControl의 isSelected/isEnabled 회피와 같은 계보).
public final class JdFileUploadZoneView: UIControl {

    public var zoneDescription: String {
        didSet { applyContent() }
    }

    public var isError: Bool {
        didSet { applyStyle() }
    }

    public var fileNames: [String] {
        didSet { applyFiles() }
    }

    public var onTap: (() -> Void)?

    private let zoneView = JdDashedZoneView()
    private let iconView = UIImageView()
    private let descriptionLabel = UILabel()
    private let zoneStack = UIStackView()
    private let fileStack = UIStackView()
    private let rootStack = UIStackView()

    public init(
        description: String = "파일을 선택하세요",
        isError: Bool = false,
        fileNames: [String] = []
    ) {
        self.zoneDescription = description
        self.isError = isError
        self.fileNames = fileNames
        super.init(frame: .zero)

        iconView.contentMode = .center
        descriptionLabel.adjustsFontForContentSizeCategory = true
        descriptionLabel.numberOfLines = 0
        descriptionLabel.textAlignment = .center

        zoneStack.axis = .vertical
        zoneStack.alignment = .center
        zoneStack.spacing = JdToken.Space.s2
        zoneStack.isUserInteractionEnabled = false
        zoneStack.addArrangedSubview(iconView)
        zoneStack.addArrangedSubview(descriptionLabel)
        zoneView.addSubview(zoneStack)
        zoneView.isUserInteractionEnabled = false

        fileStack.axis = .vertical
        fileStack.alignment = .fill
        fileStack.spacing = JdToken.Space.s1
        fileStack.isUserInteractionEnabled = false

        rootStack.axis = .vertical
        rootStack.alignment = .fill
        rootStack.spacing = JdGap.sm.value
        rootStack.isUserInteractionEnabled = false
        rootStack.addArrangedSubview(zoneView)
        rootStack.addArrangedSubview(fileStack)
        addSubview(rootStack)

        // 자체 레이아웃 DSL 사용 (04 §5 — 내부 표준)
        zoneStack.jd.layout {
            $0.top.equalToSuperview().inset(JdToken.Space.s6)
            $0.bottom.equalToSuperview().inset(JdToken.Space.s6)
            $0.leading.equalToSuperview().inset(JdToken.Space.s4)
            $0.trailing.equalToSuperview().inset(JdToken.Space.s4)
        }
        rootStack.jd.layout {
            $0.edges.equalToSuperview()
        }

        // 드롭존 전체가 하나의 버튼 — 파일 행은 장식 (04 §7.1)
        isAccessibilityElement = true
        accessibilityTraits = .button

        addTarget(self, action: #selector(didTap), for: .touchUpInside)
        applyContent()
        applyFiles()
        applyStyle()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override var isHighlighted: Bool {
        didSet { applyStyle() }
    }

    public override var isEnabled: Bool {
        didSet { applyStyle() }
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 CGColor(점선)와 스케일 폰트는 수동 재적용
        applyStyle()
    }

    // MARK: - 내부

    private func applyContent() {
        descriptionLabel.text = zoneDescription
        accessibilityLabel = zoneDescription
    }

    private func applyFiles() {
        for row in fileStack.arrangedSubviews {
            row.removeFromSuperview()
        }
        for name in fileNames {
            fileStack.addArrangedSubview(makeFileRow(name))
        }
        fileStack.isHidden = fileNames.isEmpty
        // 파일 목록도 컨트롤 하나의 값으로 합류한다 — 요소를 쪼개지 않는다 (04 §7.1)
        accessibilityValue = fileNames.isEmpty ? nil : fileNames.joined(separator: ", ")
        applyStyle()
    }

    private func makeFileRow(_ name: String) -> UIView {
        let icon = UIImageView()
        icon.contentMode = .center
        icon.setContentHuggingPriority(.required, for: .horizontal)
        icon.image = UIImage(systemName: "doc")

        let label = UILabel()
        label.text = name
        label.adjustsFontForContentSizeCategory = true
        label.numberOfLines = 1

        let row = UIStackView(arrangedSubviews: [icon, label])
        row.axis = .horizontal
        row.alignment = .center
        row.spacing = JdToken.Space.s1_5
        row.isAccessibilityElement = false
        row.accessibilityElementsHidden = true
        return row
    }

    private func applyStyle() {
        let iconFont = JdFontBridge.scaledFont(
            size: JdIconSize.xl.side,
            weight: JdToken.FontWeight.normal,
            compatibleWith: traitCollection)
        iconView.preferredSymbolConfiguration = UIImage.SymbolConfiguration(font: iconFont)
        iconView.image = UIImage(systemName: "arrow.up.doc")
        iconView.tintColor = JdToken.Color.muted.uiColor

        descriptionLabel.font = JdFontBridge.scaledFont(
            size: JdTextSpec.resolve(size: .sm).fontSize,
            weight: JdToken.FontWeight.normal,
            compatibleWith: traitCollection)
        descriptionLabel.textColor = JdToken.Color.muted.uiColor

        let rowFont = JdFontBridge.scaledFont(
            size: JdTextSpec.resolve(size: .xs).fontSize,
            weight: JdToken.FontWeight.normal,
            compatibleWith: traitCollection)
        let rowSymbol = UIImage.SymbolConfiguration(font: rowFont)
        for row in fileStack.arrangedSubviews {
            guard let stack = row as? UIStackView else { continue }
            for item in stack.arrangedSubviews {
                if let label = item as? UILabel {
                    label.font = rowFont
                    label.textColor = JdToken.Color.muted.uiColor
                } else if let image = item as? UIImageView {
                    image.preferredSymbolConfiguration = rowSymbol
                    image.tintColor = JdToken.Color.muted.uiColor
                }
            }
        }

        zoneView.backgroundColor =
            (isHighlighted ? JdToken.Color.cardHover : JdToken.Color.card).uiColor
        zoneView.strokeColor =
            (isError ? JdToken.Color.danger : JdToken.Color.border)
            .uiColor.resolvedColor(with: traitCollection).cgColor
        alpha = isEnabled ? 1 : CGFloat(JdToken.Opacity.o50)
    }

    @objc private func didTap() {
        onTap?()
    }
}

// MARK: - 점선 드롭존 (웹 border: 1px dashed 동형)

/// 대시 길이는 토큰(Space.s1 = 4)에서 파생한다 — 전용 치수 신설 금지.
private final class JdDashedZoneView: UIView {

    var strokeColor: CGColor? {
        didSet { border.strokeColor = strokeColor }
    }

    private let border = CAShapeLayer()

    override init(frame: CGRect) {
        super.init(frame: frame)
        border.fillColor = UIColor.clear.cgColor
        border.lineWidth = JdToken.Border.thin
        border.lineDashPattern = [
            NSNumber(value: Double(JdToken.Space.s1)),
            NSNumber(value: Double(JdToken.Space.s1)),
        ]
        layer.addSublayer(border)
        layer.cornerCurve = .continuous
        layer.cornerRadius = JdToken.Radius.xl
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        // 선 굵기의 절반만큼 안쪽으로 — 테두리가 잘리지 않게
        let inset = JdToken.Border.thin / 2
        let rect = bounds.insetBy(dx: inset, dy: inset)
        border.frame = bounds
        border.path = UIBezierPath(roundedRect: rect, cornerRadius: JdToken.Radius.xl).cgPath
    }
}
