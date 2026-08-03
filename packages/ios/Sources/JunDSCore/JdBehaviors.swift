import CoreGraphics
import Foundation

// 웹 hooks(→Behavior) 46종의 iOS 대응.
// ⚠️ iOS에서 hooks는 "라이브러리 컴포넌트"가 아니다 — 대부분은 SwiftUI 환경값·시스템 API·
// 제스처가 이미 하는 일이라 RECIPES.md의 조립법으로 제공하고(00-inventory §4 iOS 매핑),
// N/a도 여럿이다(useClickOutside·useFocusTrap·useFocusVisible·useFavicon 등).
// Core가 담는 것은 **렌더/시스템이 대신할 수 없는 순수 계산·판정**뿐이다(04 §4.2 규칙 3):
// 디바운스/스로틀 타이밍, 카운트업 이징, 폼 검증, 단축키 정규화, 진행률·활성 섹션 판정,
// 프리로드 동시성, 코드 자체가 알고리즘인 것들. 전수 테스트로 고정한다.

// MARK: - 타이밍 (useDebounce · useThrottle)

/// 디바운스: 마지막 호출 뒤 delay가 지나야 실행. @MainActor 고정(UI 갱신 용도).
/// SwiftUI에선 Combine .debounce가 관용이지만, 명령형 호출부(스크롤·검색어)에는 이 타입이 맞다.
@MainActor
public final class JdDebouncer {
    private let delay: TimeInterval
    private var task: Task<Void, Never>?

    public init(delay: TimeInterval) { self.delay = delay }

    public func call(_ action: @escaping @MainActor () -> Void) {
        task?.cancel()
        task = Task { [delay] in
            try? await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
            if Task.isCancelled { return }
            action()
        }
    }

    public func cancel() { task?.cancel(); task = nil }
    deinit { task?.cancel() }
}

/// 스로틀: 선행 즉시 실행 + interval 동안 최신 1회를 예약(웹 알고리즘 이식).
@MainActor
public final class JdThrottler {
    private let interval: TimeInterval
    private var lastFire: Date?
    private var pending: Task<Void, Never>?
    /// 시간 주입점 — 테스트가 가상 시계를 넣는다
    private let now: () -> Date

    public init(interval: TimeInterval, now: @escaping () -> Date = Date.init) {
        self.interval = interval
        self.now = now
    }

    public func call(_ action: @escaping @MainActor () -> Void) {
        let current = now()
        if let last = lastFire, current.timeIntervalSince(last) < interval {
            // 아직 간격 안 — 남은 시간 뒤 후행 1회 예약(최신 호출로 덮어씀)
            let remaining = interval - current.timeIntervalSince(last)
            pending?.cancel()
            pending = Task { [remaining] in
                try? await Task.sleep(nanoseconds: UInt64(remaining * 1_000_000_000))
                if Task.isCancelled { return }
                self.lastFire = self.now()
                action()
            }
        } else {
            lastFire = current
            action()
        }
    }

    public func cancel() { pending?.cancel(); pending = nil }
    deinit { pending?.cancel() }
}

// MARK: - 카운트업 이징 (useCountUp)

public enum JdCountUp {
    /// 웹이 이식한 easeOutExpo — 순수 함수라 진행률 t(0…1)에서 값 위치를 계산한다.
    public static func easeOutExpo(_ t: Double) -> Double {
        let clamped = min(max(t, 0), 1)
        return clamped >= 1 ? 1 : 1 - pow(2, -10 * clamped)
    }

    /// from→to 사이의 t 지점 값
    public static func value(from: Double, to: Double, progress t: Double) -> Double {
        from + (to - from) * easeOutExpo(t)
    }
}

// MARK: - 단축키 정규화 (useHotkeys · useKeyboardShortcut)

public enum JdHotkey {
    /// 웹 normalizeChord 승계 — 별칭 정규화(cmd/mod/esc/space) + 수식키 정렬로
    /// "Cmd+Shift+K"와 "shift+meta+k"가 같은 정규 문자열이 되게 한다.
    /// iOS는 UIKeyCommand가 실제 처리하지만, 정규화 자체는 순수 계산이라 Core에 둔다.
    public static func normalize(_ chord: String) -> String {
        let parts = chord.lowercased().split(whereSeparator: { $0 == "+" || $0 == "-" })
            .map { $0.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty }

        var modifiers: Set<String> = []
        var key = ""
        for part in parts {
            switch part {
            case "cmd", "command", "meta", "mod", "super", "win": modifiers.insert("meta")
            case "ctrl", "control": modifiers.insert("ctrl")
            case "alt", "option", "opt": modifiers.insert("alt")
            case "shift": modifiers.insert("shift")
            case "esc", "escape": key = "escape"
            case "space", "spacebar": key = "space"
            case "return", "enter": key = "enter"
            case "del", "delete": key = "delete"
            default: key = part
            }
        }
        // 수식키는 고정 순서로 정렬해 결정적으로 만든다
        let order = ["ctrl", "alt", "shift", "meta"]
        let sortedMods = order.filter { modifiers.contains($0) }
        return (sortedMods + [key]).joined(separator: "+")
    }
}

// MARK: - 폼 검증 (useForm)

public enum JdFieldRule: Equatable, Sendable {
    case required
    case minLength(Int)
    case maxLength(Int)
    case pattern(String)  // 정규식
    case email
    case custom(id: String)  // 소비자 판정 위임 — Core는 통과로 본다

    /// 위반 시 메시지 — 렌더 계층이 그대로 노출한다
    public func message(label: String) -> String {
        switch self {
        case .required: return "\(label)은(는) 필수입니다"
        case .minLength(let n): return "\(label)은(는) \(n)자 이상이어야 합니다"
        case .maxLength(let n): return "\(label)은(는) \(n)자 이하여야 합니다"
        case .pattern: return "\(label) 형식이 올바르지 않습니다"
        case .email: return "올바른 이메일 주소가 아닙니다"
        case .custom: return "\(label)이(가) 올바르지 않습니다"
        }
    }
}

public enum JdForm {
    /// 규칙 순서대로 첫 위반을 돌려준다(웹 동형: 첫 실패에서 멈춤). nil이면 유효.
    public static func firstViolation(_ value: String, rules: [JdFieldRule]) -> JdFieldRule? {
        for rule in rules {
            switch rule {
            case .required where value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty:
                return rule
            case .minLength(let n) where value.count < n:
                return rule
            case .maxLength(let n) where value.count > n:
                return rule
            case .email where !isEmail(value):
                return rule
            case .pattern(let regex) where !matches(value, regex: regex):
                return rule
            default:
                continue
            }
        }
        return nil
    }

    public static func isValid(_ value: String, rules: [JdFieldRule]) -> Bool {
        firstViolation(value, rules: rules) == nil
    }

    static func isEmail(_ value: String) -> Bool {
        // 빈 값은 email 규칙만으로는 통과(required가 빈 값을 잡는다 — 웹 동형)
        guard !value.isEmpty else { return true }
        return matches(value, regex: "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")
    }

    static func matches(_ value: String, regex: String) -> Bool {
        guard let re = try? NSRegularExpression(pattern: regex) else { return true }
        let range = NSRange(value.startIndex..., in: value)
        return re.firstMatch(in: value, range: range) != nil
    }
}

// MARK: - 진행률·활성 섹션 (useReadingProgress · useScrollSpy)

public enum JdScrollProgress {
    /// 읽기 진행률 0…1 — 스크롤 오프셋과 스크롤 가능 높이로 계산.
    public static func reading(
        offset: CGFloat, contentHeight: CGFloat, viewportHeight: CGFloat
    ) -> Double {
        let scrollable = contentHeight - viewportHeight
        guard scrollable > 0 else { return contentHeight > 0 ? 1 : 0 }
        return Double(min(max(offset / scrollable, 0), 1))
    }

    /// 스크롤 스파이: 각 섹션의 y 시작점과 현재 오프셋(+상단 여백)으로 활성 인덱스를 판정.
    /// 현재 위치를 지난 마지막 섹션이 활성이다(웹 동형).
    public static func activeSection(
        offset: CGFloat, sectionOffsets: [CGFloat], topInset: CGFloat = 0
    ) -> Int? {
        guard !sectionOffsets.isEmpty else { return nil }
        let cursor = offset + topInset
        var active = 0
        for (index, start) in sectionOffsets.enumerated() where start <= cursor {
            active = index
        }
        // 아직 첫 섹션에도 못 미쳤으면 첫 섹션을 활성으로(웹 clamp 동형)
        return active
    }
}

// MARK: - 프리로드 동시성 (useImagePreload)

public enum JdPreload {
    /// urls를 concurrency개씩 배치로 나눈다 — 로딩 순서 계획의 순수 계산(실제 로딩은 URLSession).
    public static func batches(_ urls: [String], concurrency: Int) -> [[String]] {
        let size = max(1, concurrency)
        var result: [[String]] = []
        var index = 0
        while index < urls.count {
            result.append(Array(urls[index..<min(index + size, urls.count)]))
            index += size
        }
        return result
    }

    public static let defaultConcurrency = 3
}

// MARK: - 무한 피드 가드 (useInfiniteFeed)

/// 중복 로드 호출 가드 — 웹의 "관찰 + 진행 중이면 재호출 안 함"을 순수 상태로.
/// 목록 상태는 데이터 계층 몫이고(00-inventory 리스크), 이건 게이트만 담당한다.
public struct JdInfiniteFeedGate: Sendable {
    public private(set) var isLoading: Bool
    public private(set) var isExhausted: Bool

    public init() { isLoading = false; isExhausted = false }

    /// true를 돌려줄 때만 loadMore를 호출해야 한다
    public mutating func shouldLoad() -> Bool {
        guard !isLoading, !isExhausted else { return false }
        isLoading = true
        return true
    }

    public mutating func finish(reachedEnd: Bool) {
        isLoading = false
        if reachedEnd { isExhausted = true }
    }
}

// MARK: - 미디어 브레이크포인트 값 해석 (useBreakpointValue)

public enum JdBreakpointValue {
    /// 웹 resolveBreakpointValue — 폭에 맞는 값 중 가장 큰 브레이크포인트를 고른다.
    /// base + {sm,md,lg,xl,2xl} 맵에서 현재 폭 이하의 최대 키를 선택(모바일 우선).
    public static func resolve<T>(width: CGFloat, base: T, overrides: [(JdBreakpoint, T)]) -> T {
        var value = base
        // 브레이크포인트 오름차순으로 순회하며 폭이 도달한 것까지 덮어쓴다
        for (bp, override) in overrides.sorted(by: { $0.0.width < $1.0.width })
        where width >= bp.width {
            value = override
        }
        return value
    }
}
