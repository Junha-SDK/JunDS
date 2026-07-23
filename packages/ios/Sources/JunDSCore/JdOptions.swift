import Foundation

// 공용 축 — rawValue는 웹 attribute 문자열과 일치 (04 §3 규칙 1)
public enum JdControlSize: String, CaseIterable, Sendable {
    case sm
    case md
    case lg
}

public enum JdModalSize: String, CaseIterable, Sendable {
    case sm
    case md
    case lg
}

// 웹 jd-request-close의 detail.reason과 동일 리터럴 (DEC-012 — 플랫폼 간 의미론 일치)
public enum JdModalCloseReason: String, CaseIterable, Sendable {
    case escape
    case backdrop
    case close
}
