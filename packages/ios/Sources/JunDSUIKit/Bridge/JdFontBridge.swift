import UIKit
import JunDSCore

// 토큰 CGFloat(size/weight) → Dynamic Type 스케일 UIFont (04 §6 — 고정 pt 금지)
public enum JdFontBridge {
    public static func uiWeight(_ weight: CGFloat) -> UIFont.Weight {
        if weight >= 700 { return .bold }
        if weight >= 600 { return .semibold }
        if weight >= 500 { return .medium }
        return .regular
    }

    public static func textStyle(forSize size: CGFloat) -> UIFont.TextStyle {
        if size <= 12 { return .caption1 }
        if size <= 13 { return .footnote }
        if size <= 15 { return .subheadline }
        if size <= 17 { return .body }
        return .headline
    }

    // 사용처는 반드시 adjustsFontForContentSizeCategory = true 를 함께 켠다
    public static func scaledFont(size: CGFloat, weight: CGFloat) -> UIFont {
        let base = UIFont.systemFont(ofSize: size, weight: uiWeight(weight))
        return UIFontMetrics(forTextStyle: textStyle(forSize: size)).scaledFont(for: base)
    }
}

// JdMotion(Core) 부트스트랩 — 앱 시작 시 1회 호출 (04 §7.3)
public enum JdUIKitMotionBridge {
    public static func bootstrap() {
        JdMotion.isReduced = { UIAccessibility.isReduceMotionEnabled }
    }
}
