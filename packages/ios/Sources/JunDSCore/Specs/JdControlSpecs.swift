import Foundation
import CoreGraphics

// 폼 컨트롤 계열 스펙 — 토큰·v2 리터럴만 읽는 순수 함수 (04 §9).
// 값 출처는 웹 구현 실측(packages/web/src/components/*)이며, 하드코딩 리터럴은
// v2 패리티 승계분이다(DEC-014-1 계보) — 주석에 웹 원본 값을 병기한다.

// MARK: - Toggle / Switch (웹 jd-toggle · jd-switch)

public struct JdToggleSpec: Sendable {
    public var trackWidth: CGFloat
    public var trackHeight: CGFloat
    public var thumbSize: CGFloat
    public var labelFontSize: CGFloat

    /// 웹 jd-switch 기하: sm 36×20(thumb 14) · md 44×24(18) · lg 56×28(22).
    /// ⚠️ iOS 렌더는 시스템 UISwitch/Toggle을 쓰므로 이 값은 **레이아웃 참고치**다
    /// (04 §10.1 "시스템 컨트롤 스킨 우선" — 픽셀 동형은 목표가 아니다).
    public static func resolve(size: JdToggleSize) -> JdToggleSpec {
        switch size {
        case .sm: return JdToggleSpec(trackWidth: 36, trackHeight: 20, thumbSize: 14,
                                      labelFontSize: JdTextSpec.resolve(size: .sm).fontSize)
        case .md: return JdToggleSpec(trackWidth: 44, trackHeight: 24, thumbSize: 18,
                                      labelFontSize: JdTextSpec.resolve(size: .sm).fontSize)
        case .lg: return JdToggleSpec(trackWidth: 56, trackHeight: 28, thumbSize: 22,
                                      labelFontSize: JdTextSpec.resolve(size: .sm).fontSize)
        }
    }
}

// MARK: - Checkbox / RadioGroup (웹 jd-checkbox · jd-radio-group)

public struct JdChoiceSpec: Sendable {
    public var boxSize: CGFloat
    public var gap: CGFloat
    public var labelFontSize: CGFloat

    /// 웹: box md 16 / sm 14, gap 8(--jd-space-2), label md 14 / sm 12.
    /// iOS 관용구가 없어 자체 드로잉(SF Symbols) — 04 §10.1 primitives 항목.
    public static func resolve(size: JdToggleSize) -> JdChoiceSpec {
        switch size {
        case .sm:
            return JdChoiceSpec(boxSize: 14, gap: JdToken.Space.s2,
                                labelFontSize: JdTextSpec.resolve(size: .xs).fontSize)
        case .md, .lg:
            return JdChoiceSpec(boxSize: 16, gap: JdToken.Space.s2,
                                labelFontSize: JdTextSpec.resolve(size: .sm).fontSize)
        }
    }
}

// MARK: - Slider (웹 jd-slider)

public struct JdSliderSpec: Sendable {
    public var trackHeight: CGFloat
    public var thumbSize: CGFloat
    public var valueFontSize: CGFloat

    /// 웹: md 트랙 6·thumb 18 / sm 트랙 4·thumb 14. 미충전 레일 #e5e7eb(리터럴).
    public static func resolve(size: JdToggleSize) -> JdSliderSpec {
        switch size {
        case .sm:
            return JdSliderSpec(trackHeight: 4, thumbSize: 14,
                                valueFontSize: JdTextSpec.resolve(size: .xs).fontSize)
        case .md, .lg:
            return JdSliderSpec(trackHeight: 6, thumbSize: 18,
                                valueFontSize: JdTextSpec.resolve(size: .xs).fontSize)
        }
    }

    /// 웹 color → 액센트 토큰 (primary만 브랜드, 나머지는 시맨틱 토큰)
    public static func accent(_ color: JdSliderColor) -> JdDynamicColor {
        switch color {
        case .primary: return JdToken.Color.primary
        case .success: return JdToken.Color.success
        case .warning: return JdToken.Color.warning
        case .danger: return JdToken.Color.danger
        }
    }

    /// 웹 미충전 레일 #e5e7eb — 토큰 부재분(라이트/다크 동일, v2 승계)
    public static let railColor = JdDynamicColor(light: 0xE5E7_EBFF, dark: 0x3A38_50FF)
}

// MARK: - RangeSlider 상태 (웹 jd-range-slider)

/// 두 손잡이의 클램프 규칙을 Core에 1회만 구현한다 — 렌더 계층은 숫자만 받는다
/// (04 §4.2 규칙 3: 측정·판정은 Core의 순수 함수).
public struct JdRangeState: Equatable, Sendable {
    public let bounds: ClosedRange<Double>
    public let step: Double
    public private(set) var lower: Double
    public private(set) var upper: Double

    public init(bounds: ClosedRange<Double> = 0...100, step: Double = 1,
                lower: Double = 0, upper: Double = 100) {
        self.bounds = bounds
        self.step = step > 0 ? step : 1
        self.lower = lower
        self.upper = upper
        normalize()
    }

    /// 웹 규칙: lower ≤ upper - step, upper ≥ lower + step, 둘 다 bounds 안, step 양자화.
    /// ⚠️ 양자화를 먼저, 클램프를 나중에 한다 — 순서를 뒤집으면 upperBound가 step 배수가
    /// 아닐 때(예: 0...95, step 10) 반올림 결과가 범위를 넘는다(실측 결함). 경계값은
    /// step 배수가 아니어도 도달 가능해야 한다(네이티브 input[type=range]와 동일 계약).
    private mutating func normalize() {
        lower = clampToBounds(quantize(lower))
        upper = clampToBounds(quantize(upper))
        if upper - lower < step {
            upper = clampToBounds(lower + step)
            if upper - lower < step {
                lower = clampToBounds(upper - step)
            }
        }
    }

    private func quantize(_ value: Double) -> Double {
        (value / step).rounded() * step
    }

    private func clampToBounds(_ value: Double) -> Double {
        min(max(value, bounds.lowerBound), bounds.upperBound)
    }

    public mutating func setLower(_ value: Double) {
        lower = min(value, upper - step)
        normalize()
    }

    public mutating func setUpper(_ value: Double) {
        upper = max(value, lower + step)
        normalize()
    }

    /// 트랙 위 정규화 위치(0…1) — 렌더 계층의 유일한 기하 입력
    public var lowerFraction: Double { fraction(of: lower) }
    public var upperFraction: Double { fraction(of: upper) }

    public func fraction(of value: Double) -> Double {
        let span = bounds.upperBound - bounds.lowerBound
        guard span > 0 else { return 0 }
        return min(max((value - bounds.lowerBound) / span, 0), 1)
    }

    /// 화면 비율(0…1) → 값 (드래그 입력의 역변환)
    public func value(atFraction f: Double) -> Double {
        let span = bounds.upperBound - bounds.lowerBound
        // normalize()와 같은 순서: 양자화 후 클램프 (경계 초과 방지)
        return clampToBounds(quantize(bounds.lowerBound + min(max(f, 0), 1) * span))
    }
}

// MARK: - Textarea (웹 jd-textarea)

public struct JdTextareaSpec: Sendable {
    public var minHeight: CGFloat
    public var fontSize: CGFloat
    public var radius: CGFloat
    public var hPadding: CGFloat
    public var vPadding: CGFloat
    public var countFontSize: CGFloat

    /// 웹: min-height 80, font 14, radius 12(xl), padding 10/14, 카운터 12
    public static func resolve() -> JdTextareaSpec {
        JdTextareaSpec(minHeight: 80,
                       fontSize: JdTextSpec.resolve(size: .sm).fontSize,     // 14
                       radius: JdToken.Radius.xl,                            // 12
                       hPadding: JdToken.Space.s3_5,                         // 14
                       vPadding: JdToken.Space.s2_5,                         // 10
                       countFontSize: JdTextSpec.resolve(size: .xs).fontSize) // 12
    }
}

// MARK: - Label (웹 jd-label)

public struct JdLabelSpec: Sendable {
    public var fontSize: CGFloat
    public var fontWeight: CGFloat
    /// required 표식 "*" 앞 여백 — 웹 margin-inline-start 2px
    public var markerSpacing: CGFloat

    public static func resolve() -> JdLabelSpec {
        JdLabelSpec(fontSize: JdTextSpec.resolve(size: .sm).fontSize,  // 14
                    fontWeight: JdToken.FontWeight.medium,             // 500
                    markerSpacing: JdToken.Space.s0_5)                 // 2
    }
}

// MARK: - IconButton (웹 jd-icon-button)

public struct JdIconButtonSpec: Sendable {
    public var side: CGFloat
    public var radius: CGFloat
    public var iconSize: CGFloat
    public var background: JdDynamicColor
    public var foreground: JdDynamicColor
    public var pressedBackground: JdDynamicColor
    public var border: JdDynamicColor?

    /// 웹 크기: xs 24/r6 · sm 28/r8 · md 32/r8 · lg 40/r12
    public static func resolve(variant: JdIconButtonVariant, size: JdIconButtonSize) -> JdIconButtonSpec {
        let side: CGFloat
        let radius: CGFloat
        switch size {
        case .xs: side = 24; radius = JdToken.Radius.md   // 6
        case .sm: side = 28; radius = JdToken.Radius.lg   // 8
        case .md: side = 32; radius = JdToken.Radius.lg   // 8
        case .lg: side = 40; radius = JdToken.Radius.xl   // 12
        }

        let clear = JdDynamicColor(light: 0x0000_0000, dark: 0x0000_0000)
        // ghost hover/active = muted 10%/16% 오버레이 (웹 color-mix 등가)
        let mutedWash = JdDynamicColor(light: 0x6B68_8029, dark: 0xA09C_B529)

        switch variant {
        case .ghost:
            return JdIconButtonSpec(side: side, radius: radius, iconSize: side * 0.5,
                                    background: clear,
                                    foreground: JdToken.Color.muted,
                                    pressedBackground: mutedWash,
                                    border: nil)
        case .outline:
            return JdIconButtonSpec(side: side, radius: radius, iconSize: side * 0.5,
                                    background: clear,
                                    foreground: JdToken.Color.muted,
                                    pressedBackground: JdToken.Color.cardHover,
                                    border: JdToken.Color.border)
        case .filled:
            return JdIconButtonSpec(side: side, radius: radius, iconSize: side * 0.5,
                                    background: JdToken.Color.primary,
                                    foreground: JdDynamicColor(light: 0xFFFF_FFFF, dark: 0xFFFF_FFFF),
                                    pressedBackground: JdToken.Color.primaryHover,
                                    border: nil)
        }
    }
}
