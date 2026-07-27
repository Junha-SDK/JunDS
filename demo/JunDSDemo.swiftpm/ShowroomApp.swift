import SwiftUI
import JunDS

@main
struct ShowroomApp: App {
    @StateObject private var router = ShowroomRouter()

    init() {
        JdUIKitMotionBridge.bootstrap()
    }

    var body: some Scene {
        WindowGroup {
            CatalogHome()
                .environmentObject(router)
                // junds://component/<id> — 445행을 스크롤하지 않고 상세로 바로 진입한다.
                // 실패도 router가 배너 + 콘솔로 보고한다(조용한 무반응 금지).
                .onOpenURL { router.open($0) }
        }
    }
}
