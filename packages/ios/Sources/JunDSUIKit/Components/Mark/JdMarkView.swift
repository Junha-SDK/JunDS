import UIKit
import JunDSCore

// 웹 jd-mark 동형 — 형광펜 강조. A8 명명 규칙 Jd<이름>View(UILabel 서브클래스).
// 배경형(기본)과 밑줄형 두 표면이고, 밑줄형은 배경 없이 밑줄 색만 팔레트를 따른다(웹 동형).
public final class JdMarkView: UILabel {

    // 원문 — attributedText를 매번 재구성하므로 소스를 따로 들고 있는다
    public var content: String {
        didSet { applyContent() }
    }

    // 웹 color attribute 동형
    public var color: JdMarkColor {
        didSet { applyContent() }
    }

    // 웹 underline attribute 동형 — 배경형 ↔ 밑줄형 전환
    public var underline: Bool {
        didSet { applyContent() }
    }

    public init(_ text: String, color: JdMarkColor = .yellow, underline: Bool = false) {
        self.content = text
        self.color = color
        self.underline = underline
        super.init(frame: .zero)

        numberOfLines = 0
        adjustsFontForContentSizeCategory = true
        layer.cornerRadius = JdToken.Radius.sm
        layer.cornerCurve = .continuous
        applyContent()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    // 웹 padding-inline: var(--jd-space-0-5) — 배경형에서만 좌우로 벌어진다
    public override var intrinsicContentSize: CGSize {
        let base = super.intrinsicContentSize
        guard !underline else { return base }
        return CGSize(width: base.width + JdToken.Space.s0_5 * 2, height: base.height)
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 스케일 폰트와 속성 문자열은 수동 재구성
        applyContent()
        invalidateIntrinsicContentSize()
    }

    private func applyContent() {
        // UILabel은 상속 서체가 없어 본문 기본(JdTextView 기본과 같은 md)을 쓴다
        let font = JdFontBridge.scaledFont(size: JdTextSpec.resolve(size: .md).fontSize,
                                           weight: JdToken.FontWeight.normal,
                                           compatibleWith: traitCollection)
        var attributes: [NSAttributedString.Key: Any] = [.font: font]

        if underline {
            // 웹: padding 0 · background transparent · color inherit · 밑줄만 팔레트 색.
            // 웹 두께 2px ≈ NSUnderlineStyle.thick (UIKit이 노출하는 두께 축)
            attributes[.foregroundColor] = JdToken.Color.foreground.uiColor
            attributes[.underlineStyle] = NSUnderlineStyle.thick.rawValue
            attributes[.underlineColor] = JdMarkPalette.foreground(color).uiColor
            backgroundColor = .clear
        } else {
            attributes[.foregroundColor] = JdMarkPalette.foreground(color).uiColor
            backgroundColor = JdMarkPalette.background(color).uiColor
        }

        attributedText = NSAttributedString(string: content, attributes: attributes)
        invalidateIntrinsicContentSize()
    }
}

// 형광펜 팔레트 — SwiftUI 계층(JdMark)에 동형 사본이 있다(DEC-010으로 공유 불가).
//
// ⚠️ Core에 JdMarkSpec이 없다. 웹은 Tailwind 200/70·900 리터럴을 쓰지만 "스펙에 없는 색은
//    만들지 않는다"는 규칙에 따라 **리터럴을 신설하지 않고** Core JdTagSpec 팔레트를 재사용한다.
//    green/blue/purple은 동명 색이고 yellow→orange · pink→red는 인접 색상 근사다.
//    정확한 형광펜 값이 필요하면 Core에 JdMarkSpec을 추가해야 한다(notes 보고분).
enum JdMarkPalette {
    static func tagColor(_ color: JdMarkColor) -> JdTagColor {
        switch color {
        case .yellow: return .orange
        case .green: return .green
        case .blue: return .blue
        case .pink: return .red
        case .purple: return .purple
        }
    }

    static func background(_ color: JdMarkColor) -> JdDynamicColor {
        JdTagSpec.resolve(color: tagColor(color)).background
    }

    static func foreground(_ color: JdMarkColor) -> JdDynamicColor {
        JdTagSpec.resolve(color: tagColor(color)).foreground
    }
}
