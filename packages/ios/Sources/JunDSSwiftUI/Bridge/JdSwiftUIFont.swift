import SwiftUI
import UIKit
import JunDSCore

// 시스템 UIKit 직접 사용은 허용 — 금지는 자체 타겟 간 의존뿐 (DEC-010, 04 §4.2).
// Font.system(size:)는 Dynamic Type에 스케일되지 않으므로 UIFontMetrics 경유가 정본 (04 §6).
// category 인자: 환경의 sizeCategory를 명시 전달해야 트레이트 오버라이드(컨테이너 단위
// Dynamic Type 시뮬레이션 포함)가 반영된다 — 미전달 시 프로세스 전역 설정만 따르는 버그.
enum JdSwiftUIFont {
    static func scaled(size: CGFloat, weight: CGFloat, category: ContentSizeCategory? = nil) -> Font {
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
        let metrics = UIFontMetrics(forTextStyle: style)
        if let category {
            let traits = UITraitCollection(preferredContentSizeCategory: UIContentSizeCategory(category))
            return Font(metrics.scaledFont(for: base, compatibleWith: traits))
        }
        return Font(metrics.scaledFont(for: base))
    }

    // 모노스페이스 변형 — 베이스만 monospacedSystemFont로 바꾸고 스케일·category 규칙은
    // scaled와 동일 (DESIGN §2.3). 매핑 헬퍼는 추가 전용 — 기존 scaled 본문은 불변.
    static func scaledMono(size: CGFloat, weight: CGFloat, category: ContentSizeCategory? = nil) -> Font {
        let base = UIFont.monospacedSystemFont(ofSize: size, weight: monoUIWeight(weight))
        let metrics = UIFontMetrics(forTextStyle: monoTextStyle(size))
        if let category {
            let traits = UITraitCollection(preferredContentSizeCategory: UIContentSizeCategory(category))
            return Font(metrics.scaledFont(for: base, compatibleWith: traits))
        }
        return Font(metrics.scaledFont(for: base))
    }

    // scaled 내부 매핑과 같은 규칙 (JdFontBridge.uiWeight/textStyle 동형 — DEC-010으로 공유 불가)
    private static func monoUIWeight(_ weight: CGFloat) -> UIFont.Weight {
        if weight >= 700 { return .bold }
        if weight >= 600 { return .semibold }
        if weight >= 500 { return .medium }
        return .regular
    }

    private static func monoTextStyle(_ size: CGFloat) -> UIFont.TextStyle {
        if size <= 12 { return .caption1 }
        if size <= 13 { return .footnote }
        if size <= 15 { return .subheadline }
        if size <= 17 { return .body }
        return .headline
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
    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    func body(content: Content) -> some View {
        content.font(JdSwiftUIFont.scaled(size: size, weight: weight, category: sizeCategory))
    }
}

// JdMotion(Core) 부트스트랩 — SwiftUI 계층용 (04 §7.3)
public enum JdSwiftUIMotionBridge {
    public static func bootstrap() {
        JdMotion.isReduced = { UIAccessibility.isReduceMotionEnabled }
    }
}
