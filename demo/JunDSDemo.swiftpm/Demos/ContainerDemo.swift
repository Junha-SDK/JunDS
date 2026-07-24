import SwiftUI
import JunDS

// Container 데모 — 레시피형 (04 §10.1). 웹 <jd-container>는 max-width 프리셋 + margin-inline auto.
// 값의 정본은 Core의 JdContainerSize.maxWidth(full == nil = 상한 없음)이고,
// 렌더는 그 숫자를 frame에 옮기기만 한다(04 §4.2 규칙 2).
// 컨트롤 키·값 리터럴은 웹 attribute와 일치(size=xs…2xl/full, no-center).

enum ContainerDemo {
    static let demo = ComponentDemo(
        id: "Container",
        controls: [
            .options("size", "size", JdContainerSize.allCases.map(\.rawValue), initial: "lg"),
            .toggle("no-center", "no-center"),
        ],
        swiftUI: { state in AnyView(ContainerStage(state: state)) },
        recipe: """
        // Container = 상한 frame + 중앙 정렬 (04 §10.1 — 신규 컴포넌트 없음)
        // size 프리셋 값의 정본은 Core: JdContainerSize.lg.maxWidth == 1024 (full == nil)
        content
            .frame(maxWidth: JdContainerSize.lg.maxWidth)                        // 상한
            .frame(maxWidth: .infinity, alignment: noCenter ? .leading : .center) // margin-inline auto
            .padding(.horizontal, JdToken.Space.s4)                              // 웹 16pt(≥640에서 24pt)

        // iPhone 세로는 화면 폭이 프리셋보다 좁아 사실상 패딩만 관측된다 —
        // 상한은 iPad·분할 화면에서 의미가 산다.
        """
    )
}

// 상한 표기 — full은 상한 없음(nil)
private func containerCapText(_ size: JdContainerSize) -> String {
    guard let maxWidth = size.maxWidth else { return "상한 없음" }
    return "\(Int(maxWidth))pt"
}

// 실제로 그려지는 폭 = min(무대 폭 − 좌우 패딩, 상한)
private func containerAppliedWidth(stageWidth: CGFloat, size: JdContainerSize) -> CGFloat {
    let inner = max(stageWidth - JdToken.Space.s4 * 2, 0)
    guard let maxWidth = size.maxWidth else { return inner }
    return min(inner, maxWidth)
}

private struct ContainerStage: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let size = JdContainerSize(rawValue: state.string("size")) ?? .lg
        let noCenter = state.bool("no-center")
        let alignment: Alignment = noCenter ? .leading : .center

        GeometryReader { proxy in
            VStack(alignment: .leading, spacing: JdToken.Space.s3) {
                // 폭 상한이 걸렸는지 숫자로도 드러낸다 — iPhone 폭에서는 상한이 안 물린다
                Text("무대 폭 \(Int(proxy.size.width))pt · 상한 \(containerCapText(size)) → 실제 \(Int(containerAppliedWidth(stageWidth: proxy.size.width, size: size)))pt")
                    .font(.footnote)
                    .foregroundColor(.secondary)

                // 배경을 칠한 블록이 곧 컨테이너 — 상한과 정렬이 눈에 보인다
                JdText("jd-container size=\(size.rawValue)", size: .sm)
                    .padding(JdToken.Space.s4)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(JdToken.Color.primaryLight.color)
                    .cornerRadius(JdToken.Radius.lg)
                    .frame(maxWidth: size.maxWidth)
                    .frame(maxWidth: .infinity, alignment: alignment)
                    .padding(.horizontal, JdToken.Space.s4)

                Text(noCenter
                     ? "no-center — margin-inline auto 해제(왼쪽 정렬)"
                     : "기본 — margin-inline auto 동형(가운데 정렬)")
                    .font(.footnote)
                    .foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(JdToken.Space.s6)
    }
}
