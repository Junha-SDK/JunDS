import Foundation
import OSLog

// 딥링크 — 445행 카탈로그를 스크롤하지 않고 상세로 바로 진입하는 검증 경로.
// finance는 원장 맨 아래 카테고리라 시뮬레이터에서 60회 넘게 스와이프해야 닿는다(DEC-040 시각 확인 생략의 원인).
//
//   junds://component/PriceBadge            id는 원장(ledger.json) row id와 동일 문자열
//   junds://component/finance/PriceBadge    중복 id 구분용 (원장에 AreaChart가 composites·finance 양쪽)
//
// 실패는 절대 조용히 무시하지 않는다 — 배선 오류가 "아무 일도 안 일어남"으로 보이면 잡을 수 없다.
// 콘솔(os_log + stdout) + 카탈로그 상단 배너 양쪽으로 알린다.

enum DeepLink {
    static let scheme = "junds"
    static let host = "component"

    static let logger = Logger(subsystem: "kr.junha.junds.demo", category: "deeplink")

    enum Failure: Error, Equatable {
        case badScheme(String)
        case badHost(String)
        case emptyPath
        case tooManyComponents([String])
        case unknownId(String)
        case unknownCategory(category: String, id: String)

        /// 사용자(=개발자)에게 보이는 한 줄. 무엇이 틀렸는지 + 무엇을 쓰면 되는지.
        var message: String {
            switch self {
            case .badScheme(let scheme):
                return "스킴 \"\(scheme)\"은 처리하지 않는다 — junds:// 만 받는다"
            case .badHost(let host):
                return "호스트 \"\(host)\"은 처리하지 않는다 — junds://component/<id> 형태여야 한다"
            case .emptyPath:
                return "컴포넌트 id가 없다 — junds://component/<id> (예: junds://component/PriceBadge)"
            case .tooManyComponents(let parts):
                return "경로 조각이 \(parts.count)개다 — junds://component/<id> 또는 junds://component/<category>/<id> 만 받는다"
            case .unknownId(let id):
                return "원장에 없는 id \"\(id)\" — ledger.json의 row id와 같은 문자열이어야 한다(대소문자는 무시)"
            case .unknownCategory(let category, let id):
                return "\"\(id)\"는 원장에 있지만 카테고리 \"\(category)\"에는 없다"
            }
        }
    }

    /// URL → 카탈로그 항목. 실패는 이유를 담아 돌려준다(호출측이 반드시 보고한다).
    static func resolve(_ url: URL) -> Result<CatalogEntry, Failure> {
        guard url.scheme?.lowercased() == scheme else {
            return .failure(.badScheme(url.scheme ?? ""))
        }
        // junds://component/X 에서 host는 "component", path는 "/X".
        guard url.host?.lowercased() == host else {
            return .failure(.badHost(url.host ?? ""))
        }

        let parts = url.path.split(separator: "/").map(String.init)
        switch parts.count {
        case 0:
            return .failure(.emptyPath)
        case 1:
            return resolve(id: parts[0])
        case 2:
            return resolve(category: parts[0], id: parts[1])
        default:
            return .failure(.tooManyComponents(parts))
        }
    }

    private static func resolve(id: String) -> Result<CatalogEntry, Failure> {
        let matches = entries(matching: id)
        guard let entry = preferred(from: matches) else { return .failure(.unknownId(id)) }
        return .success(entry)
    }

    private static func resolve(category: String, id: String) -> Result<CatalogEntry, Failure> {
        let matches = entries(matching: id)
        guard !matches.isEmpty else { return .failure(.unknownId(id)) }
        let scoped = matches.filter { $0.category.caseInsensitiveCompare(category) == .orderedSame }
        guard let entry = preferred(from: scoped) else {
            return .failure(.unknownCategory(category: category, id: id))
        }
        return .success(entry)
    }

    /// 정확 일치 우선, 없으면 대소문자 무시로 한 번 더 — 손으로 치는 URL이라 대소문자 오타는 통과시킨다.
    private static func entries(matching id: String) -> [CatalogEntry] {
        let exact = ShowroomCatalog.all.filter { $0.id == id }
        if !exact.isEmpty { return exact }
        return ShowroomCatalog.all.filter { $0.id.caseInsensitiveCompare(id) == .orderedSame }
    }

    /// 같은 id가 여러 카테고리에 있으면 iOS 구현된 쪽을 먼저 연다(볼 게 있는 화면이 목적이므로).
    private static func preferred(from matches: [CatalogEntry]) -> CatalogEntry? {
        matches.first { $0.ios == "done" } ?? matches.first
    }
}
