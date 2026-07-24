import Foundation
import CoreGraphics
// UIKit은 파일 맨 아래 JdAnnouncer(UIAccessibility 래퍼) 하나 때문에 필요하다.
// Core의 UIKit 의존은 이미 생성물 JdToken.swift가 만든 기존 현실이다(DEC-013-2) — 04 A2와의
// 정합 재심의는 토큰 생성기 개정 시점으로 이월돼 있고, 여기서 제약 집합이 새로 늘지는 않는다.
import UIKit

// primitives 잔여 27종의 옵션 축 + 순수 로직.
// 이 배치는 "새 컴포넌트가 답이 아닌" 것이 다수다(시스템 API·레시피·텍스트 런) — 그래서
// Core가 담는 것은 **렌더 계층이 재구현하면 안 되는 계산**이다: 포맷·마스킹·강도 판정·
// 하이라이트 매칭·클램프 규칙. 렌더는 결과만 그린다 (04 §4.2 규칙 1·3).

// MARK: - 숫자 포맷 (웹 jd-number-formatter · jd-currency-input 공용)

/// 웹 format 어휘. rawValue는 웹 attribute와 일치.
public enum JdNumberFormatStyle: String, CaseIterable, Sendable {
    case decimal, currency, percent, compact
}

public enum JdNumberFormat {
    /// 웹 Intl.NumberFormat 규칙의 Swift 대응.
    /// - decimals는 웹의 NaN 센티널 대신 **Optional**이다(JS 잔재를 타입으로 승격).
    /// - percent는 100을 곱한다(웹 style:"percent" 동형 — 0.15 → "15%").
    /// - currency의 소수 자릿수는 지정이 없으면 통화별 기본값에 위임한다(KRW 0 / USD 2).
    ///   v2가 `KRW ? 0 : 2`로 하드코딩해 JPY·VND를 틀리게 그리던 것을 웹 v3가 고쳤고, iOS도 따른다.
    /// - locale 기본값은 상수 "ko-KR"다(환경 의존 금지 — 웹의 프리렌더 결정성 규칙과 같은 이유로
    ///   iOS에서도 테스트 결정성을 위해 상수를 유지한다).
    public static func string(value: Double,
                              style: JdNumberFormatStyle = .decimal,
                              currency: String = "KRW",
                              locale: String = "ko-KR",
                              decimals: Int? = nil,
                              prefix: String = "",
                              suffix: String = "") -> String {
        let loc = Locale(identifier: locale)
        let formatter = NumberFormatter()
        formatter.locale = loc
        // Foundation 기본은 .halfEven인데 웹 Intl.NumberFormat·toFixed는 halfExpand다 —
        // 지정하지 않으면 2.5가 "2"로, 12.5가 "12"로 나가 웹과 어긋난다(실측).
        formatter.roundingMode = .halfUp

        switch style {
        case .decimal:
            formatter.numberStyle = .decimal
            if let decimals {
                formatter.minimumFractionDigits = decimals
                formatter.maximumFractionDigits = decimals
            }
        case .currency:
            formatter.numberStyle = .currency
            formatter.currencyCode = currency
            if let decimals {
                formatter.minimumFractionDigits = decimals
                formatter.maximumFractionDigits = decimals
            }
        case .percent:
            formatter.numberStyle = .percent
            formatter.minimumFractionDigits = decimals ?? 0
            formatter.maximumFractionDigits = decimals ?? 1
        case .compact:
            // NumberFormatter엔 compact 스타일이 없다 — 자체 축약(아래 compactCount와 같은 규칙)
            let text = compactNumber(value, maxFractionDigits: decimals ?? 1, locale: loc)
            return prefix + text + suffix
        }

        let body = formatter.string(from: NSNumber(value: value)) ?? "\(value)"
        return prefix + body + suffix
    }

    /// 웹 notation:"compact" 대응. Foundation의 .compactName은 "1K"/"1M"이라 웹 문자열과
    /// 어긋나므로 자체 규칙으로 만든다(천/백만 단위, 로케일 무관 접미사는 한국어 기준).
    static func compactNumber(_ value: Double, maxFractionDigits: Int, locale: Locale) -> String {
        // 단위 사다리 — 큰 것부터 본다
        let ladder: [(threshold: Double, divisor: Double, unit: String)] = [
            (100_000_000, 100_000_000, "억"),
            (10_000, 10_000, "만"),
            (1_000, 1_000, "천"),
            (0, 1, ""),
        ]

        var index = ladder.firstIndex { Swift.abs(value) >= $0.threshold } ?? ladder.count - 1
        var scaled = value / ladder[index].divisor

        // ⚠️ 반올림 후 단위를 **재평가**한다(Intl notation:"compact" 동형).
        // 없으면 9999 → "10천", 99999999 → "10,000만" 처럼 사다리를 넘고도 아래 단위에 머문다(실측).
        if index > 0 {
            let digits = ladder[index].unit.isEmpty ? 0 : maxFractionDigits
            let factor = pow(10.0, Double(digits))
            let rounded = (scaled * factor).rounded() / factor
            if Swift.abs(rounded) >= ladder[index - 1].threshold / ladder[index].divisor {
                index -= 1
                scaled = value / ladder[index].divisor
            }
        }

        let formatter = NumberFormatter()
        formatter.locale = locale
        formatter.numberStyle = .decimal
        formatter.roundingMode = .halfUp // 웹 Intl과 동일(Foundation 기본 halfEven이 아님)
        formatter.minimumFractionDigits = 0
        formatter.maximumFractionDigits = ladder[index].unit.isEmpty ? 0 : maxFractionDigits
        let text = formatter.string(from: NSNumber(value: scaled)) ?? "\(scaled)"
        return text + ladder[index].unit
    }

    /// 웹 hashtag/like-button의 카운트 축약 — 1000 미만은 그대로, 이상은 천/만 단위 1자리.
    /// 순수 함수라 경계값(999/1000/1050/9999/10000)을 전수 테스트로 고정한다.
    public static func compactCount(_ count: Int) -> String {
        compactNumber(Double(count), maxFractionDigits: 1, locale: Locale(identifier: "ko-KR"))
    }
}

// MARK: - NumberInput (웹 jd-number-input)

/// ⚠️ 웹 jd-number-input은 컨트롤 램프(32/40/48)가 아니라 **v2 NumberInput 램프(32/36/44)**를 쓴다.
public enum JdNumberInputSize: String, CaseIterable, Sendable {
    case sm, md, lg

    public var height: CGFloat {
        switch self {
        case .sm: return 32
        case .md: return 36
        case .lg: return 44
        }
    }

    public var fontSize: CGFloat {
        switch self {
        case .sm: return 12
        case .md: return 13
        case .lg: return 14
        }
    }
}

public enum JdNumberInputRules {
    /// nil 경계 = 그 축 무제한 (웹 NaN 경계 동형)
    public static func clamp(_ value: Double, min lower: Double?, max upper: Double?) -> Double {
        var v = value
        if let lower { v = Swift.max(lower, v) }
        if let upper { v = Swift.min(upper, v) }
        return v
    }

    /// 스텝 버튼: 값이 비어 있으면 0에서 출발한다(웹 동형)
    public static func stepped(_ value: Double?, direction: Int, step: Double,
                               min lower: Double?, max upper: Double?) -> Double {
        let base = value ?? 0
        return clamp(base + Double(direction) * step, min: lower, max: upper)
    }

    /// **클램프 타이밍이 이 컴포넌트의 핵심 계약이다**(웹 §1.5): 타이핑 중에는 클램프하지 않고
    /// 커밋(포커스 종료)·스텝 버튼에서만 클램프한다. v2는 매 키 입력마다 클램프해서
    /// min=10인 필드에 "50"을 칠 수 없었다("5"가 즉시 "10"으로 덮임) — 재도입 금지.
    public static func canDecrement(_ value: Double?, min lower: Double?) -> Bool {
        guard let lower else { return true }
        return (value ?? 0) > lower
    }

    public static func canIncrement(_ value: Double?, max upper: Double?) -> Bool {
        guard let upper else { return true }
        return (value ?? 0) < upper
    }
}

// MARK: - PinInput / OTPInput (웹 jd-pin-input · jd-otp-input)

public enum JdPinRules {
    /// 허용 문자만 남기고 length로 자른다. alphanumeric이면 영숫자, 아니면 숫자만(웹 동형).
    public static func sanitize(_ raw: String, length: Int, alphanumeric: Bool) -> String {
        let filtered = raw.filter { ch in
            alphanumeric ? ch.isLetter || ch.isNumber : ch.isNumber
        }
        return String(filtered.prefix(Swift.max(0, length)))
    }

    /// 셀 i에 표시할 문자 — 범위 밖이면 nil, masked면 가림 문자
    public static func cellText(_ value: String, index: Int, masked: Bool) -> String? {
        let chars = Array(value)
        guard index >= 0, index < chars.count else { return nil }
        return masked ? "●" : String(chars[index])
    }

    /// 다음 입력이 들어갈 셀 = 채워진 길이(가득 차면 마지막 셀 유지)
    public static func focusIndex(_ value: String, length: Int) -> Int {
        Swift.min(value.count, Swift.max(0, length - 1))
    }

    public static func isComplete(_ value: String, length: Int) -> Bool {
        value.count >= length && length > 0
    }
}

// MARK: - PhoneInput (웹 jd-phone-input)

/// 웹이 지원하는 국가 축. rawValue는 웹 country attribute와 일치.
public enum JdPhoneCountry: String, CaseIterable, Sendable {
    case kr = "KR"
    case us = "US"
    case jp = "JP"

    public var dialCode: String {
        switch self {
        case .kr: return "+82"
        case .us: return "+1"
        case .jp: return "+81"
        }
    }

    /// 자리수 구분 패턴(각 그룹 길이) — 마스킹의 단일 소스
    var groups: [Int] {
        switch self {
        case .kr: return [3, 4, 4]
        case .us: return [3, 3, 4]
        case .jp: return [3, 4, 4]
        }
    }
}

public enum JdPhoneMask {
    /// 숫자만 남긴 뒤 국가별 그룹으로 하이픈을 넣는다. 입력 중 부분 문자열도 자연스럽게 처리된다.
    public static func format(_ raw: String, country: JdPhoneCountry) -> String {
        let digits = raw.filter(\.isNumber)
        guard !digits.isEmpty else { return "" }
        var remaining = Array(digits)
        var parts: [String] = []
        for size in country.groups {
            if remaining.isEmpty { break }
            let take = Swift.min(size, remaining.count)
            parts.append(String(remaining.prefix(take)))
            remaining.removeFirst(take)
        }
        if !remaining.isEmpty { parts.append(String(remaining)) } // 초과분은 마지막 그룹에 붙인다
        return parts.joined(separator: "-")
    }

    /// 국제 표기 — 웹 fullNumber 게터 동형
    public static func fullNumber(_ raw: String, country: JdPhoneCountry) -> String {
        let digits = raw.filter(\.isNumber)
        guard !digits.isEmpty else { return "" }
        // 선행 0은 국가번호와 함께 쓰지 않는다(KR 010 → +82 10)
        let national = digits.hasPrefix("0") ? String(digits.dropFirst()) : digits
        return "\(country.dialCode) \(national)"
    }
}

// MARK: - PasswordInput (웹 jd-password-input)

/// 웹 jd-password-input의 규칙 **5종**(소문자 포함이 빠지면 패리티가 깨진다 — 실측 교정)
public enum JdPasswordRule: String, CaseIterable, Sendable {
    case length      // 8자 이상
    case uppercase   // 대문자 포함
    case lowercase   // 소문자 포함
    case number      // 숫자 포함
    case symbol      // 특수문자 포함

    public var label: String {
        switch self {
        case .length: return "8자 이상"
        case .uppercase: return "대문자 포함"
        case .lowercase: return "소문자 포함"
        case .number: return "숫자 포함"
        case .symbol: return "특수문자 포함"
        }
    }
}

/// 웹 강도 4단. rawValue는 웹 level 문자열과 일치.
public enum JdPasswordLevel: String, CaseIterable, Sendable {
    case weak, fair, good, strong

    /// 화면에 그대로 나가는 문구 — 웹 표기를 따른다
    public var label: String {
        switch self {
        case .weak: return "취약"
        case .fair: return "보통"
        case .good: return "양호"
        case .strong: return "강력"
        }
    }

    public var tone: JdSeverity {
        switch self {
        case .weak: return .danger
        case .fair: return .warn
        case .good, .strong: return .ok
        }
    }
}

public struct JdPasswordStrength: Equatable, Sendable {
    /// 충족한 규칙 집합
    public let satisfied: Set<JdPasswordRule>
    /// 웹 산식의 정규화 점수(0…1) — 규칙 비율 80% + 길이 보너스 20%
    public let normalized: Double

    /// 충족 규칙 수(0…5) — 강도 막대 개수 등 표시용
    public var score: Int { satisfied.count }

    public func isSatisfied(_ rule: JdPasswordRule) -> Bool { satisfied.contains(rule) }

    /// 웹 임계값 0.3 / 0.5 / 0.8
    public var level: JdPasswordLevel {
        if normalized < 0.3 { return .weak }
        if normalized < 0.5 { return .fair }
        if normalized < 0.8 { return .good }
        return .strong
    }

    public var label: String { level.label }
    public var tone: JdSeverity { level.tone }

    /// 순수 판정 — 규칙·임계값 전수를 단위 테스트로 고정한다.
    /// 웹 산식: (충족/전체)×0.8 + min(길이/16, 1)×0.2
    public static func evaluate(_ password: String) -> JdPasswordStrength {
        var satisfied: Set<JdPasswordRule> = []
        if password.count >= 8 { satisfied.insert(.length) }
        if password.contains(where: { $0.isUppercase }) { satisfied.insert(.uppercase) }
        if password.contains(where: { $0.isLowercase }) { satisfied.insert(.lowercase) }
        if password.contains(where: { $0.isNumber }) { satisfied.insert(.number) }
        let symbols = CharacterSet.alphanumerics.union(.whitespaces).inverted
        if password.unicodeScalars.contains(where: { symbols.contains($0) }) {
            satisfied.insert(.symbol)
        }

        let ruleRatio = Double(satisfied.count) / Double(JdPasswordRule.allCases.count)
        let lengthBonus = Swift.min(Double(password.count) / 16.0, 1.0)
        let normalized = password.isEmpty ? 0 : ruleRatio * 0.8 + lengthBonus * 0.2
        return JdPasswordStrength(satisfied: satisfied, normalized: normalized)
    }
}

// MARK: - Highlight (웹 jd-highlight)

/// 검색어 매칭 구간 — 렌더 계층은 이 구간대로 칠하기만 한다
public struct JdHighlightSegment: Equatable, Sendable {
    public let text: String
    public let isMatch: Bool
}

public enum JdHighlight {
    /// 대소문자 무시 부분 문자열 전수 매칭. query가 비면 전체가 non-match 1구간이다(웹 동형).
    public static func segments(text: String, query: String) -> [JdHighlightSegment] {
        guard !query.isEmpty, !text.isEmpty else {
            return text.isEmpty ? [] : [JdHighlightSegment(text: text, isMatch: false)]
        }
        var result: [JdHighlightSegment] = []
        var cursor = text.startIndex
        while cursor < text.endIndex,
              let found = text.range(of: query, options: .caseInsensitive, range: cursor..<text.endIndex) {
            if found.lowerBound > cursor {
                result.append(JdHighlightSegment(text: String(text[cursor..<found.lowerBound]), isMatch: false))
            }
            result.append(JdHighlightSegment(text: String(text[found]), isMatch: true))
            cursor = found.upperBound
        }
        if cursor < text.endIndex {
            result.append(JdHighlightSegment(text: String(text[cursor...]), isMatch: false))
        }
        return result
    }
}

// MARK: - StarRating (웹 jd-star-rating)

public enum JdStarFill: String, Sendable {
    case empty, half, full
}

public enum JdStarRating {
    /// index(0부터)의 별 상태 — 0.5 단위 반영(웹 동형)
    public static func fill(index: Int, value: Double) -> JdStarFill {
        let position = Double(index)
        if value >= position + 1 { return .full }
        if value >= position + 0.5 { return .half }
        return .empty
    }

    /// 탭 위치 → 값(1부터). 같은 별을 다시 누르면 반값(웹의 0.5 단위 토글 동형)
    public static func value(forTappedIndex index: Int, current: Double) -> Double {
        let full = Double(index + 1)
        return current == full ? full - 0.5 : full
    }
}

// MARK: - BackTop (웹 jd-back-top)

public enum JdBackTop {
    /// 웹 판정: scrollY > threshold (엄격 초과)
    public static func shouldShow(scrollY: CGFloat, threshold: CGFloat) -> Bool {
        scrollY > threshold
    }

    public static let defaultThreshold: CGFloat = 400
    public static let defaultLabel = "상단으로 이동"
}

// MARK: - 텍스트 런 축 (웹 jd-code · jd-mark · jd-link · jd-mention-chip · jd-hashtag)

public enum JdCodeVariant: String, CaseIterable, Sendable {
    case `default`, primary, success, warning, danger
}

public enum JdMarkColor: String, CaseIterable, Sendable {
    case yellow, green, blue, pink, purple
}

public enum JdLinkVariant: String, CaseIterable, Sendable {
    case `default`, primary, muted
}

public enum JdMentionChip {
    /// 웹 규칙: label이 비면 "@handle"로 폴백(빈 문자열도 폴백 대상)
    public static func displayText(handle: String, label: String) -> String {
        label.isEmpty ? "@\(handle)" : label
    }
}

public enum JdHashtag {
    public static func displayText(tag: String) -> String { "#\(tag)" }
    /// 카운트 표기는 JdNumberFormat.compactCount 재사용 — 규칙 중복 금지
    public static func countText(_ count: Int) -> String { JdNumberFormat.compactCount(count) }
}

// MARK: - Motion (웹 jd-motion)

/// 웹 preset 어휘. 실제 지속시간은 JdToken.Duration을 쓰고 Reduce Motion은 JdMotion이 판정한다.
public enum JdMotionPreset: String, CaseIterable, Sendable {
    case fadeIn = "fade-in"
    case slideUp = "slide-up"
    case slideDown = "slide-down"
    case scaleIn = "scale-in"
}

// MARK: - Image / Icon / ScrollArea 축

public enum JdImageFit: String, CaseIterable, Sendable {
    case cover, contain, fill
}

public enum JdIconSize: String, CaseIterable, Sendable {
    case xs, sm, md, lg, xl

    /// 웹 아이콘 변 길이(px)
    public var side: CGFloat {
        switch self {
        case .xs: return 12
        case .sm: return 16
        case .md: return 20
        case .lg: return 24
        case .xl: return 32
        }
    }
}

// MARK: - Announcer (웹 jd-announcer)

/// 웹은 polite/assertive 두 라이브 리전을 만들지만, iOS는 OS가 라이브 리전을 소유한다 —
/// 우선순위만 남기고 뷰는 만들지 않는다.
public enum JdAnnouncePriority: String, CaseIterable, Sendable {
    case polite, assertive
}

/// ⚠️ 웹의 "같은 문구 반복을 위해 비우고 다음 프레임에 채우는" 해킹은 **이식하지 않는다** —
/// iOS는 동일 문자열도 다시 읽어준다. Core가 UIKit을 이미 의존하는 현실(DEC-013-2)에 기대어
/// 여기에 얇은 래퍼만 둔다(뷰·레이아웃 없음).
public enum JdAnnouncer {
    public static func announce(_ message: String, priority: JdAnnouncePriority = .polite) {
        guard !message.isEmpty else { return }
        let notification: UIAccessibility.Notification = priority == .assertive ? .screenChanged : .announcement
        UIAccessibility.post(notification: notification, argument: message)
    }
}
