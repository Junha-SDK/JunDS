import JunDS
import SwiftUI
import UIKit

// LayoutDivider 데모 — **별칭**이다. 웹의 layout <jd-layout-divider>는 core <jd-divider>와
// 표면이 완전히 같아 단일 구현 + 별칭으로 처리된다: **B1 jd-divider가 표면 전량 커버(R12)**.
// 따라서 iOS도 신규 타입 없이 기구현 JdDivider(SwiftUI) / JdDividerView(UIKit)를 그대로 쓴다.
// (CoreDivider 데모와 같은 컴포넌트를 가리키는 두 번째 얼굴 — 원장 id만 다르다.)
// 컨트롤 키·값 리터럴은 웹 attribute와 일치(orientation = horizontal/vertical).

enum LayoutDividerDemo {
    static let demo = ComponentDemo(
        id: "LayoutDivider",
        controls: [
            .options(
                "orientation", "orientation", JdOrientation.allCases.map(\.rawValue),
                initial: "horizontal")
        ],
        swiftUI: { state in AnyView(LayoutDividerStageSwiftUI(state: state)) },
        uikit: { state in AnyView(LayoutDividerStageUIKit(state: state)) }
    )

    static let aliasNote =
        "layout 표면은 별칭이다 — B1의 jd-divider가 표면 전량을 커버한다(R12). "
        + "iOS 산출물도 JdDivider / JdDividerView 하나뿐이고 신규 타입은 없다."
}

private struct LayoutDividerStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let orientation = JdOrientation(rawValue: state.string("orientation")) ?? .horizontal

        VStack(alignment: .leading, spacing: JdToken.Space.s4) {
            if orientation == .horizontal {
                JdText("섹션 A", size: .sm, dimmed: true)
                JdDivider(orientation: .horizontal)
                JdText("섹션 B", size: .sm, dimmed: true)
            } else {
                HStack(spacing: JdToken.Space.s4) {
                    JdText("열 A", size: .sm, dimmed: true)
                    JdDivider(orientation: .vertical)
                    JdText("열 B", size: .sm, dimmed: true)
                }
                .frame(height: JdToken.Space.s16)
            }

            Text(LayoutDividerDemo.aliasNote)
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(JdToken.Space.s6)
    }
}

private struct LayoutDividerStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let orientation = JdOrientation(rawValue: state.string("orientation")) ?? .horizontal

        VStack(alignment: .leading, spacing: JdToken.Space.s4) {
            if orientation == .horizontal {
                JdText("섹션 A", size: .sm, dimmed: true)
                LayoutDividerViewRep(orientation: .horizontal)
                    .frame(maxWidth: .infinity)
                JdText("섹션 B", size: .sm, dimmed: true)
            } else {
                HStack(spacing: JdToken.Space.s4) {
                    JdText("열 A", size: .sm, dimmed: true)
                    LayoutDividerViewRep(orientation: .vertical)
                        .frame(height: JdToken.Space.s16)
                    JdText("열 B", size: .sm, dimmed: true)
                }
            }

            Text(LayoutDividerDemo.aliasNote)
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(JdToken.Space.s6)
        // orientation은 init 전용 표면 — 값이 바뀌면 뷰를 재생성한다
        .id(orientation.rawValue)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct LayoutDividerViewRep: UIViewRepresentable {
    var orientation: JdOrientation

    func makeUIView(context: Context) -> JdDividerView {
        JdDividerView(orientation: orientation)
    }

    func updateUIView(_ view: JdDividerView, context: Context) {}
}
