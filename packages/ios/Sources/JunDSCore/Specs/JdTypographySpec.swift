import CoreGraphics
import Foundation

// 웹 jd-text fontSize 어휘 — rawValue는 웹 attribute 문자열과 일치 (04 §3 규칙 1).
// 값 사다리는 v2 리터럴 패리티(DEC-014-1) — JdToken.FontSize(--jd-text-*)와 **별개**의
// 스펙 상수다. pt 환산은 1rem=16pt 고정 (02-tokens §4.2).
// 5xl/6xl은 텍스트 컴포넌트 표면 밖 — 필요 시 G2 (DESIGN §2.1).
public enum JdTextSize: String, CaseIterable, Sendable {
    case xs2 = "2xs"
    case xs
    case sm
    case md
    case lg
    case xl
    case xl2 = "2xl"
    case xl3 = "3xl"
    case xl4 = "4xl"
}

public struct JdTextSpec: Sendable {
    public var fontSize: CGFloat
    /// 웹 기본 line-height relaxed(1.625). SwiftUI는 lineSpacing으로 근사하고,
    /// UIKit 1차 구현은 UILabel 기본 행간을 쓴다 — 값은 스펙에 보존 (DESIGN §2.3).
    public var lineHeightMultiple: CGFloat

    // 토큰·스펙 상수만 읽는 순수 함수 — 사다리 전수를 단위 테스트로 검증 (04 §9)
    public static func resolve(size: JdTextSize) -> JdTextSpec {
        // v2 리터럴(pt): 2xs=10 xs=12 sm=14 md=16 lg=18 xl=20 2xl=24 3xl=30 4xl=36
        let fontSize: CGFloat
        switch size {
        case .xs2: fontSize = 10
        case .xs: fontSize = 12
        case .sm: fontSize = 14
        case .md: fontSize = 16
        case .lg: fontSize = 18
        case .xl: fontSize = 20
        case .xl2: fontSize = 24
        case .xl3: fontSize = 30
        case .xl4: fontSize = 36
        }
        return JdTextSpec(
            fontSize: fontSize,
            lineHeightMultiple: JdToken.LineHeight.relaxed)
    }
}

// 웹 jd-heading level(1~6)과 rawValue 일치
public enum JdHeadingLevel: Int, CaseIterable, Sendable {
    case h1 = 1, h2, h3, h4, h5, h6
}

public struct JdHeadingSpec: Sendable {
    public var fontSize: CGFloat
    /// JdToken.FontWeight 값 (400/500/600/700 축)
    public var fontWeight: CGFloat
    public var uppercase: Bool

    // 웹 jd-heading 레벨 램프 — 모바일 브레이크포인트 값 채택(iPhone=모바일, DESIGN §2.1):
    // L1 24pt bold tight / L2 20 bold tight / L3 20 semibold snug / L4 18 semibold snug
    // L5 16 semibold / L6 14 semibold + uppercase
    // 크기는 텍스트 사다리와 정확히 겹치므로 JdTextSpec을 경유해 리터럴 중복을 없앤다.
    // line-height(tight/snug)는 G1 표면 밖 — 구조체에 싣지 않는다 (계약 고정).
    public static func resolve(level: JdHeadingLevel) -> JdHeadingSpec {
        let fontSize: CGFloat
        let fontWeight: CGFloat
        var uppercase = false
        switch level {
        case .h1:
            fontSize = JdTextSpec.resolve(size: .xl2).fontSize  // 24
            fontWeight = JdToken.FontWeight.bold
        case .h2:
            fontSize = JdTextSpec.resolve(size: .xl).fontSize  // 20
            fontWeight = JdToken.FontWeight.bold
        case .h3:
            fontSize = JdTextSpec.resolve(size: .xl).fontSize  // 20
            fontWeight = JdToken.FontWeight.semibold
        case .h4:
            fontSize = JdTextSpec.resolve(size: .lg).fontSize  // 18
            fontWeight = JdToken.FontWeight.semibold
        case .h5:
            fontSize = JdTextSpec.resolve(size: .md).fontSize  // 16
            fontWeight = JdToken.FontWeight.semibold
        case .h6:
            fontSize = JdTextSpec.resolve(size: .sm).fontSize  // 14
            fontWeight = JdToken.FontWeight.semibold
            uppercase = true
        }
        return JdHeadingSpec(fontSize: fontSize, fontWeight: fontWeight, uppercase: uppercase)
    }
}
