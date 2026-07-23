import Foundation

// Reduce Motion 유일 진입점 (04 §7.3). 각 계층 브리지가 시스템 설정을 주입한다.
public enum JdMotion {
    public static var isReduced: () -> Bool = { false }

    public static func duration(_ base: TimeInterval) -> TimeInterval {
        if isReduced() { return 0 }
        return base
    }
}
