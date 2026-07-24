import Foundation
import CoreGraphics

// composites 오버레이·피드백 14종의 Core 옵션·상태·색 매핑.
// 04 §10.1: 오버레이는 전부 시스템 프레젠테이션 위임(sheet/alert/confirmationDialog),
// 피드백(Toast/Snackbar/Notification/Alert/Banner/Callout)은 iOS 시스템 대응이 없어 자체 구현.
// Core가 담는 것은 옵션 축·닫기 사유·색 매핑·타이머 상태머신이다(렌더는 그리기만).

// MARK: - 오버레이 공용 (Modal/Drawer/BottomSheet/ActionSheet/AlertDialog)

/// 웹 jd-request-close의 reason. rawValue는 웹 detail 문자열과 일치(DEC-012 — 플랫폼 의미론 일치).
/// escape/backdrop/close는 기존 JdModalCloseReason과 겹치나, action은 액션 시트/얼럿 전용이라 확장.
public enum JdDismissReason: String, CaseIterable, Sendable {
    case escape       // iOS: 시스템 스와이프/취소 제스처
    case backdrop     // iOS: 시트 바깥 탭
    case close        // 명시적 닫기 버튼/메서드
    case action       // 액션 시트/얼럿의 선택지 탭
}

/// 웹 jd-drawer의 side
public enum JdDrawerSide: String, CaseIterable, Sendable {
    case left, right, bottom
}

/// 웹 jd-modal/jd-drawer의 size — 오버레이 폭/높이 프리셋.
/// iOS는 시트 detent로 번역되므로 이 px 값은 iPad·레이아웃 참고치다(04 §10.1).
public enum JdOverlaySize: String, CaseIterable, Sendable {
    case sm, md, lg, xl, full

    /// 웹 사이드 드로어 폭(px)
    public var drawerWidth: CGFloat {
        switch self {
        case .sm: return 320
        case .md: return 420
        case .lg: return 560
        case .xl: return 720
        case .full: return .infinity
        }
    }

    /// 웹 바텀 드로어/시트 높이(px)
    public var sheetHeight: CGFloat {
        switch self {
        case .sm: return 192   // 12rem
        case .md: return 288   // 18rem
        case .lg: return 384   // 24rem
        case .xl: return 480   // 30rem
        case .full: return .infinity
        }
    }

    /// 웹 모달 패널 최대폭(px)
    public var modalMaxWidth: CGFloat {
        switch self {
        case .sm: return 448   // 28rem
        case .md: return 512   // 32rem
        case .lg: return 672   // 42rem
        case .xl: return 896   // 56rem
        case .full: return .infinity
        }
    }
}

/// 웹 jd-action-sheet의 액션 항목
public struct JdActionItem: Identifiable, Hashable, Sendable {
    public let id: String
    public let label: String
    public let isDestructive: Bool

    public init(id: String, label: String, isDestructive: Bool = false) {
        self.id = id
        self.label = label
        self.isDestructive = isDestructive
    }
}

// MARK: - 피드백 공용 톤 (Toast/Snackbar/Notification/Alert/Banner)

/// 웹 피드백 variant — info/success/warning/danger.
/// ⚠️ Snackbar만 'danger' 대신 'error'를 쓴다(웹 실측) — rawValue를 맞추되 색은 동일 시맨틱.
public enum JdFeedbackVariant: String, CaseIterable, Sendable {
    case info, success, warning, danger

    /// 색의 단일 소스 — 렌더는 이 토큰만 쓴다
    public var color: JdDynamicColor {
        switch self {
        case .info: return JdToken.Color.info
        case .success: return JdToken.Color.success
        case .warning: return JdToken.Color.warning
        case .danger: return JdToken.Color.danger
        }
    }

    /// 라이브 리전 우선순위 — 웹은 전부 polite지만 danger는 assertive로 올린다(접근성 보정)
    public var announcePriority: JdAnnouncePriority {
        self == .danger ? .assertive : .polite
    }
}

/// 웹 jd-callout의 variant — 이모지 + 강조선 5종
public enum JdCalloutVariant: String, CaseIterable, Sendable {
    case note, tip, info, warning, danger

    public var emoji: String {
        switch self {
        case .note: return "📝"
        case .tip: return "💡"
        case .info: return "ℹ️"
        case .warning: return "⚠️"
        case .danger: return "🚨"
        }
    }

    public var color: JdDynamicColor {
        switch self {
        case .note: return JdToken.Color.muted
        case .tip: return JdToken.Color.success
        case .info: return JdToken.Color.info
        case .warning: return JdToken.Color.warning
        case .danger: return JdToken.Color.danger
        }
    }
}

// MARK: - Toast/Snackbar 위치

public enum JdToastPosition: String, CaseIterable, Sendable {
    case topRight = "top-right"
    case topLeft = "top-left"
    case bottomRight = "bottom-right"
    case bottomLeft = "bottom-left"
    case top
    case bottom

    public var isTop: Bool {
        self == .top || self == .topRight || self == .topLeft
    }
    public var isLeading: Bool {
        self == .topLeft || self == .bottomLeft
    }
    public var isCentered: Bool {
        self == .top || self == .bottom
    }
}

// MARK: - Toast 큐 상태머신 (웹 jd-toast + toast() 싱글턴)

public struct JdToast: Identifiable, Equatable, Sendable {
    public let id: UUID
    public var title: String?
    public var message: String?
    public var variant: JdFeedbackVariant
    /// 0 = 수동 닫기 전용(웹 duration 0 동형)
    public var duration: TimeInterval

    public init(id: UUID = UUID(), title: String? = nil, message: String? = nil,
                variant: JdFeedbackVariant = .info, duration: TimeInterval = 4) {
        self.id = id
        self.title = title
        self.message = message
        self.variant = variant
        self.duration = duration
    }
}

/// 토스트 큐 — 최대 개수 초과 시 가장 오래된 것 축출(웹 max 동형). 타이머 주입은 렌더 계층 몫.
/// 순수 상태 전이만 담아 단위 테스트로 고정한다(04 §4.1 정본 패턴의 값 타입 버전).
public struct JdToastQueue: Equatable, Sendable {
    public private(set) var visible: [JdToast]
    public let maxVisible: Int

    public init(maxVisible: Int = 4) {
        self.visible = []
        self.maxVisible = max(1, maxVisible)
    }

    /// 추가 후 초과분(가장 오래된 것)을 축출한 결과를 돌려준다
    public mutating func add(_ toast: JdToast) {
        visible.append(toast)
        while visible.count > maxVisible {
            visible.removeFirst()
        }
    }

    public mutating func dismiss(_ id: JdToast.ID) {
        visible.removeAll { $0.id == id }
    }

    public mutating func clear() {
        visible.removeAll()
    }
}

// MARK: - Result 상태 (웹 jd-result)

public enum JdResultStatus: String, CaseIterable, Sendable {
    case success, error, warning, info
    case notFound = "404"
    case forbidden = "403"

    /// SF Symbol 매핑 — 404/403은 정보 없는 일러스트 대신 시맨틱 심볼로(웹 장식 제거 판단 승계)
    public var systemImage: String {
        switch self {
        case .success: return "checkmark.circle.fill"
        case .error: return "xmark.circle.fill"
        case .warning: return "exclamationmark.triangle.fill"
        case .info: return "info.circle.fill"
        case .notFound: return "questionmark.circle"
        case .forbidden: return "lock.circle"
        }
    }

    public var color: JdDynamicColor {
        switch self {
        case .success: return JdToken.Color.success
        case .error: return JdToken.Color.danger
        case .warning: return JdToken.Color.warning
        case .info: return JdToken.Color.info
        case .notFound, .forbidden: return JdToken.Color.muted
        }
    }
}
