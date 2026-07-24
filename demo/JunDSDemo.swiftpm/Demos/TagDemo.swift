import SwiftUI
import UIKit
import JunDS

// Tag 데모 — 실컴포넌트 JdTag(SwiftUI)/JdTagView(UIKit). 웹 <jd-tag> 동형.
// 컨트롤 키·값은 웹 attribute 리터럴(color/closable) — 3플랫폼 동일 (04 §3).
//
// 웹은 closable + jd-remove 사후 통지, iOS는 콜백 유무가 곧 닫기 버튼 유무다.
// **제거는 소비자 몫** — 태그는 사라지지 않고 통지만 온다(목록 상태는 앱이 소유).
// 그래서 스테이지는 태그를 지우는 대신 제거 통지 횟수를 센다.

enum TagDemo {
    static let demo = ComponentDemo(
        id: "Tag",
        controls: [
            .options("color", "color", JdTagColor.allCases.map(\.rawValue), initial: "primary"),
            .toggle("closable", "closable", initial: true),
        ],
        swiftUI: { state in AnyView(TagStageSwiftUI(state: state)) },
        uikit: { state in AnyView(TagStageUIKit(state: state)) }
    )
}

private let tagText = "디자인 시스템"
private let tagNote = "제거는 소비자 몫 — 통지만 오고 태그는 남는다(웹 jd-remove 동형)."

@MainActor
private func tagColor(_ state: DemoState) -> JdTagColor {
    JdTagColor(rawValue: state.string("color")) ?? .gray
}

private struct TagStageSwiftUI: View {
    @ObservedObject var state: DemoState
    @State private var removeCount = 0

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdTag(tagText, color: tagColor(state), onRemove: removeHandler(state.bool("closable")))

            Text("제거 통지: \(removeCount)회")
            Text(tagNote)
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
    }

    private func removeHandler(_ closable: Bool) -> (() -> Void)? {
        closable ? { removeCount += 1 } : nil
    }
}

private struct TagStageUIKit: View {
    @ObservedObject var state: DemoState
    @State private var removeCount = 0

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            TagViewRep(
                text: tagText,
                color: tagColor(state),
                closable: state.bool("closable"),
                onRemove: { removeCount += 1 }
            )
            .fixedSize()

            Text("제거 통지: \(removeCount)회")
            Text(tagNote)
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct TagViewRep: UIViewRepresentable {
    var text: String
    var color: JdTagColor
    var closable: Bool
    var onRemove: () -> Void

    func makeUIView(context: Context) -> JdTagView {
        JdTagView(text, color: color, onRemove: closable ? onRemove : nil)
    }

    func updateUIView(_ view: JdTagView, context: Context) {
        if view.text != text { view.text = text }
        if view.color != color { view.color = color }
        // 콜백 유무 = 닫기 버튼 유무. 클로저는 매 갱신마다 새로 만들어지므로 값 비교가 불가능하고,
        // @State 쓰기는 외부 저장소로 가므로 처음 심은 클로저를 계속 써도 최신 상태에 반영된다.
        let hasClose = view.onRemove != nil
        if closable != hasClose {
            view.onRemove = closable ? onRemove : nil
        }
    }
}
