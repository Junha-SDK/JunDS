import SwiftUI
import JunDS

@main
struct ShowroomApp: App {
    init() {
        JdUIKitMotionBridge.bootstrap()
    }

    var body: some Scene {
        WindowGroup {
            CatalogHome()
        }
    }
}
