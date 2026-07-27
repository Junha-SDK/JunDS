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

    // 사용처는 반드시 adjustsFontForContentSizeCategory = true 를 함께 켠다.
    // compatibleWith: 뷰의 traitCollection을 넘겨야 setOverrideTraitCollection 기반
    // 컨테이너 단위 Dynamic Type(쇼룸 시뮬레이션 등)이 반영된다.
    public static func scaledFont(size: CGFloat, weight: CGFloat,
                                  compatibleWith traits: UITraitCollection? = nil) -> UIFont {
        let base = UIFont.systemFont(ofSize: size, weight: uiWeight(weight))
        return UIFontMetrics(forTextStyle: textStyle(forSize: size))
            .scaledFont(for: base, compatibleWith: traits)
    }

    // 모노스페이스 변형 — 베이스만 monospacedSystemFont로 바꾸고 스케일 규칙은 동일 (DESIGN §2.3)
    public static func scaledMonoFont(size: CGFloat, weight: CGFloat,
                                      compatibleWith traits: UITraitCollection? = nil) -> UIFont {
        let base = UIFont.monospacedSystemFont(ofSize: size, weight: uiWeight(weight))
        return UIFontMetrics(forTextStyle: textStyle(forSize: size))
            .scaledFont(for: base, compatibleWith: traits)
    }

    /// **숫자만** 등폭인 변형 — 웹 `font-variant-numeric: tabular-nums`의 정확한 대응 (DEC-040).
    ///
    /// scaledMonoFont와 다르다: mono는 글자까지 전부 등폭이라 한글·라벨이 타자기처럼 보인다.
    /// 시세·등락률은 값이 갱신될 때 자리수가 바뀌어도 **폭이 흔들리지 않는 것**만 필요하므로
    /// 숫자 폭만 고정한다(SwiftUI 쪽 대응은 `.monospacedDigit()`).
    /// finance 86종이 전부 숫자를 그리므로 브리지에 둔다.
    public static func scaledDigitFont(size: CGFloat, weight: CGFloat,
                                       compatibleWith traits: UITraitCollection? = nil) -> UIFont {
        let base = UIFont.monospacedDigitSystemFont(ofSize: size, weight: uiWeight(weight))
        return UIFontMetrics(forTextStyle: textStyle(forSize: size))
            .scaledFont(for: base, compatibleWith: traits)
    }
}

// JdMotion(Core) 부트스트랩 — 앱 시작 시 1회 호출 (04 §7.3)
public enum JdUIKitMotionBridge {
    public static func bootstrap() {
        JdMotion.isReduced = { UIAccessibility.isReduceMotionEnabled }
    }
}
