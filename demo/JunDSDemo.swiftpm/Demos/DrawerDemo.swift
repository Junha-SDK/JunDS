import SwiftUI
import JunDS

// Drawer 데모 — 시스템 프레젠테이션 위임(04 §10.1). bottom은 시트, left/right는 커스텀 오버레이 전환.
// "열기" 버튼 + JdDrawer 프레젠테이션. onDismissAttempt는 웹 jd-request-close의 iOS 번역(닫기 시도 게이트) —
// 여기선 시도를 카운트하고 통과시켜 훅이 도는 것을 보인다. 컨트롤 키·값 리터럴은 웹 attribute와 일치(04 §3).

enum DrawerDemo {
    static let demo = ComponentDemo(
        id: "Drawer",
        controls: [
            .options("side", "side", JdDrawerSide.allCases.map(\.rawValue), initial: "right"),
            .options("size", "size", JdOverlaySize.allCases.map(\.rawValue), initial: "md"),
            .toggle("persistent", "persistent"),
        ],
        swiftUI: { state in AnyView(DrawerStage(state: state)) }
    )
}

@MainActor
private func drawerSide(_ state: DemoState) -> JdDrawerSide {
    JdDrawerSide(rawValue: state.string("side")) ?? .right
}

@MainActor
private func drawerSize(_ state: DemoState) -> JdOverlaySize {
    JdOverlaySize(rawValue: state.string("size")) ?? .md
}

private struct DrawerStage: View {
    @ObservedObject var state: DemoState
    @State private var isPresented = false
    @State private var attemptCount = 0

    private var persistent: Bool { state.bool("persistent") }

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdButton("드로어 열기", variant: .secondary) { isPresented = true }

            Text("닫기 시도: \(attemptCount)")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
        .background(
            // 자체 프레젠테이션 뷰 — 하이어라키에 얹으면 시트/오버레이 전환을 스스로 부착한다
            JdDrawer(isPresented: $isPresented,
                     side: drawerSide(state),
                     size: drawerSize(state),
                     title: "드로어",
                     persistent: persistent,
                     onDismissAttempt: { _ in attemptCount += 1; return true }) {
                VStack(alignment: .leading, spacing: JdToken.Space.s4) {
                    Text(persistent
                         ? "persistent — 바깥 탭/스와이프로 닫히지 않는다(웹 백드롭 무시의 iOS 번역). 닫기 버튼만 동작한다."
                         : "side=\(drawerSide(state).rawValue) · 스와이프/바깥 탭으로 닫힌다.")
                        .font(.body)
                    JdButton("닫기", variant: .primary) { isPresented = false }
                }
                .padding(JdToken.Space.s4)
            }
        )
    }
}
