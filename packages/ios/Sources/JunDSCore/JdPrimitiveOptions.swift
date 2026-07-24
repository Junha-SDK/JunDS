import Foundation

// primitives 19종 + layout의 공용 옵션 축.
// rawValue는 전부 웹 attribute 문자열과 일치한다 (04 §3 규칙 1 — 3플랫폼 동일 리터럴).
// 옵션 열거형은 Core에 1회만 정의되고 SwiftUI/UIKit이 같은 타입을 받는다.

// MARK: - 컨트롤 축

/// 웹 jd-switch의 sm/md/lg. jd-toggle(sm/md)은 이 축의 부분집합 — iOS는 단일 구현 + 별칭(R12).
public enum JdToggleSize: String, CaseIterable, Sendable {
    case sm, md, lg
}

/// 웹 jd-checkbox의 3상태. indeterminate는 네이티브 input.indeterminate 등가.
public enum JdCheckboxState: String, CaseIterable, Sendable {
    case off, on, indeterminate
}

/// 웹 jd-radio-group의 direction
public enum JdAxis: String, CaseIterable, Sendable {
    case vertical, horizontal
}

/// 웹 jd-slider의 color (fill·thumb 테두리)
public enum JdSliderColor: String, CaseIterable, Sendable {
    case primary, success, warning, danger
}

/// 웹 jd-icon-button의 variant
public enum JdIconButtonVariant: String, CaseIterable, Sendable {
    case ghost, outline, filled
}

/// 웹 jd-icon-button의 size (정사각 히트 타깃)
public enum JdIconButtonSize: String, CaseIterable, Sendable {
    case xs, sm, md, lg
}

// MARK: - 표시 축

/// 웹 jd-badge의 variant
public enum JdBadgeVariant: String, CaseIterable, Sendable {
    case `default`, primary, success, warning, danger, info, outline
}

/// 웹 jd-badge / jd-key-cap / jd-status-dot 등의 sm/md/lg 공용 축
public enum JdDisplaySize: String, CaseIterable, Sendable {
    case sm, md, lg
}

/// 웹 jd-tag의 color — primary만 토큰 기반이고 나머지 7종은 v2 리터럴 팔레트(패리티 승계)
public enum JdTagColor: String, CaseIterable, Sendable {
    case gray, primary, blue, green, red, orange, purple, teal
}

/// 웹 jd-avatar의 size
public enum JdAvatarSize: String, CaseIterable, Sendable {
    case xs, sm, md, lg, xl
}

/// 웹 jd-avatar의 status (offline 포함 — 미지정 값은 회색 기본)
public enum JdAvatarStatus: String, CaseIterable, Sendable {
    case online, offline, away, busy
}

/// 웹 jd-status-dot의 status. pulse는 success 색 + 맥동(Reduce Motion 시 정지)
public enum JdStatusKind: String, CaseIterable, Sendable {
    case neutral, success, warning, danger, info, pulse
}

/// 웹 jd-severity-badge의 severity — status-dot과 명칭이 다르다(ok/warn vs success/warning)
public enum JdSeverity: String, CaseIterable, Sendable {
    case ok, warn, danger, info, neutral
}

/// 웹 jd-battery-indicator의 수동 color
public enum JdBatteryColor: String, CaseIterable, Sendable {
    case primary, success, warning, danger
}

/// 웹 jd-key-cap의 variant
public enum JdKeyCapVariant: String, CaseIterable, Sendable {
    case `default`, primary, muted
}

// MARK: - 레이아웃 축

/// 웹 jd-spacer의 axis
public enum JdSpacerAxis: String, CaseIterable, Sendable {
    case vertical, horizontal
}

/// 웹 jd-container의 size 프리셋 (max-width)
public enum JdContainerSize: String, CaseIterable, Sendable {
    case xs, sm, md, lg, xl, xl2 = "2xl", full

    /// 웹 프리셋 px — full은 상한 없음(nil)
    public var maxWidth: CGFloat? {
        switch self {
        case .xs: return 512
        case .sm: return 640
        case .md: return 768
        case .lg: return 1024
        case .xl: return 1280
        case .xl2: return 1536
        case .full: return nil
        }
    }
}

/// 웹 미디어 쿼리 브레이크포인트 — JdToken.Breakpoint와 같은 값의 이름 층.
/// 웹은 뷰포트 폭 기준이지만 iOS는 **컨테이너 폭** 기준으로 해석한다(04 §10 번역 원칙:
/// 화면이 아니라 배치 맥락이 판단 근거 — 분할 화면·팝오버에서도 일관).
public enum JdBreakpoint: String, CaseIterable, Sendable {
    case sm, md, lg, xl, xl2 = "2xl"

    public var width: CGFloat {
        switch self {
        case .sm: return JdToken.Breakpoint.sm      // 640
        case .md: return JdToken.Breakpoint.md      // 768
        case .lg: return JdToken.Breakpoint.lg      // 1024
        case .xl: return JdToken.Breakpoint.xl      // 1280
        case .xl2: return JdToken.Breakpoint.xl2    // 1536
        }
    }

    /// 웹 jd-show의 가시성 판정 — above(>=), below(<)의 AND 결합 (v2 의미론 그대로).
    /// 순수 함수라 단위 테스트로 전수 검증한다 (04 §4.2 규칙 1·3).
    public static func isVisible(width: CGFloat, above: JdBreakpoint?, below: JdBreakpoint?) -> Bool {
        if let above, width < above.width { return false }
        if let below, width >= below.width { return false }
        return true
    }
}

// MARK: - 공유 데이터 타입 (양 계층이 같은 타입을 받는다 — 04 §4.2 규칙 4)

/// 웹 jd-radio-group의 options 항목
public struct JdRadioOption: Identifiable, Hashable, Sendable {
    public let value: String
    public let label: String
    public let isDisabled: Bool

    public var id: String { value }

    public init(value: String, label: String, isDisabled: Bool = false) {
        self.value = value
        self.label = label
        self.isDisabled = isDisabled
    }
}

/// 웹 jd-slider의 marks 항목
public struct JdSliderMark: Hashable, Sendable {
    public let value: Double
    public let label: String?

    public init(value: Double, label: String? = nil) {
        self.value = value
        self.label = label
    }
}
