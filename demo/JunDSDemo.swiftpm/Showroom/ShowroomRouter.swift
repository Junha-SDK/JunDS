import Foundation
import SwiftUI

// 카탈로그 NavigationStack의 경로 소유자 — 딥링크가 상세 화면을 밀어넣는 유일한 통로.

struct DeepLinkNotice: Identifiable, Equatable {
    let id = UUID()
    let url: String
    let message: String
}

@MainActor
final class ShowroomRouter: ObservableObject {
    /// CatalogHome의 navigationDestination(for: CatalogEntry.self)와 같은 타입이어야 한다.
    @Published var path: [CatalogEntry] = []
    /// 마지막 딥링크 실패 — 카탈로그 상단 배너로 노출된다(사용자가 닫으면 nil).
    @Published var lastFailure: DeepLinkNotice?

    func open(_ url: URL) {
        switch DeepLink.resolve(url) {
        case .success(let entry):
            let live = DemoRegistry.byId[entry.id] != nil
            DeepLink.logger.notice(
                "딥링크 진입 \(url.absoluteString, privacy: .public) → \(entry.uid, privacy: .public) (\(live ? "라이브 데모" : "예정 화면", privacy: .public))"
            )
            print(
                "[deeplink] \(url.absoluteString) → \(entry.uid) \(live ? "(라이브 데모)" : "(예정 화면)")")
            lastFailure = nil
            // 누적이 아니라 교체 — 딥링크를 연달아 쏴도 스택이 쌓이지 않는다.
            path = [entry]

        case .failure(let failure):
            DeepLink.logger.error(
                "딥링크 실패 \(url.absoluteString, privacy: .public) — \(failure.message, privacy: .public)"
            )
            print("[deeplink] 실패 \(url.absoluteString) — \(failure.message)")
            lastFailure = DeepLinkNotice(url: url.absoluteString, message: failure.message)
            // 실패했으면 현재 화면을 건드리지 않는다. 대신 배너를 보여주려 루트로 되돌린다.
            path = []
        }
    }
}
