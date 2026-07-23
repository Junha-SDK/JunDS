import SwiftUI
import UIKit
import JunDSCore

// 시스템 UIKit 직접 사용은 허용 — 금지는 자체 타겟 간 의존뿐 (DEC-010, 04 §4.2).
// Font.system(size:)는 Dynamic Type에 스케일되지 않으므로 UIFontMetrics 경유가 정본 (04 §6).
enum JdSwiftUIFont {
    static func scaled(size: CGFloat, weight: CGFloat) -> Font {
        let uiWeight: UIFont.Weight
        if weight >= 700 {
            uiWeight = .bold
        } else if weight >= 600 {
            uiWeight = .semibold
        } else if weight >= 500 {
            uiWeight = .medium
        } else {
            uiWeight = .regular
        }
        let style: UIFont.TextStyle
        if size <= 12 {
            style = .caption1
        } else if size <= 13 {
            style = .footnote
        } else if size <= 15 {
            style = .subheadline
        } else if size <= 17 {
            style = .body
        } else {
            style = .headline
        }
        let base = UIFont.systemFont(ofSize: size, weight: uiWeight)
        return Font(UIFontMetrics(forTextStyle: style).scaledFont(for: base))
    }
}

public extension View {
    func jdFont(size: CGFloat, weight: CGFloat) -> some View {
        return modifier(JdFontModifier(size: size, weight: weight))
    }
}

struct JdFontModifier: ViewModifier {
    let size: CGFloat
    let weight: CGFloat
    // 변경 시 재평가 트리거 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    func body(content: Content) -> some View {
        content.font(JdSwiftUIFont.scaled(size: size, weight: weight))
    }
}

// JdMotion(Core) 부트스트랩 — SwiftUI 계층용 (04 §7.3)
public enum JdSwiftUIMotionBridge {
    public static func bootstrap() {
        JdMotion.isReduced = { UIAccessibility.isReduceMotionEnabled }
    }
}
