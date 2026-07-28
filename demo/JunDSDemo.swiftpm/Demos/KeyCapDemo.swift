import JunDS
import SwiftUI
import UIKit

// KeyCap 데모 — 실컴포넌트 JdKeyCap(SwiftUI)/JdKeyCapView(UIKit). 웹 <jd-key-cap> 동형.
// 컨트롤 키·값은 웹 attribute 리터럴(variant/size/pressed) — 3플랫폼 동일 (04 §3).
//
// 눌림은 **소비자가 소유한다** — 컴포넌트는 자체 터치 처리를 하지 않고 상태만 그린다
// (웹 pressed attribute 동형). 눌림 = 아래로 1pt + 그림자 제거이고 전환은 JdMotion 경유라
// 환경 섹션의 Reduce Motion을 켜면 즉시 반영된다.

enum KeyCapDemo {
    static let demo = ComponentDemo(
        id: "KeyCap",
        controls: [
            .text("key", "key", placeholder: "키 한 글자", initial: "K"),
            .options(
                "variant", "variant", JdKeyCapVariant.allCases.map(\.rawValue), initial: "default"),
            .options("size", "size", JdDisplaySize.allCases.map(\.rawValue), initial: "md"),
            .toggle("pressed", "pressed (isPressed)"),
        ],
        swiftUI: { state in AnyView(KeyCapStageSwiftUI(state: state)) },
        uikit: { state in AnyView(KeyCapStageUIKit(state: state)) }
    )
}

private let keyCapNote = "눌림 상태는 소비자 몫 — 컴포넌트는 자체 터치 처리 없이 pressed만 그린다."

@MainActor
private func keyCapKey(_ state: DemoState) -> String {
    state.string("key", fallback: "K")
}

@MainActor
private func keyCapVariant(_ state: DemoState) -> JdKeyCapVariant {
    JdKeyCapVariant(rawValue: state.string("variant")) ?? .default
}

@MainActor
private func keyCapSize(_ state: DemoState) -> JdDisplaySize {
    JdDisplaySize(rawValue: state.string("size")) ?? .md
}

private struct KeyCapStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdKeyCap(
                keyCapKey(state),
                variant: keyCapVariant(state),
                size: keyCapSize(state),
                isPressed: state.bool("pressed")
            )

            Text(keyCapNote)
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
    }
}

private struct KeyCapStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let key = keyCapKey(state)
        let variant = keyCapVariant(state)
        let size = keyCapSize(state)
        VStack(spacing: JdToken.Space.s4) {
            KeyCapViewRep(key: key, variant: variant, size: size, isPressed: state.bool("pressed"))
                .fixedSize()

            Text(keyCapNote)
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
        // key/variant/size는 init 전용 표면 — 값이 바뀌면 뷰를 재생성한다(pressed만 가변)
        .id("\(key)-\(variant.rawValue)-\(size.rawValue)")
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct KeyCapViewRep: UIViewRepresentable {
    var key: String
    var variant: JdKeyCapVariant
    var size: JdDisplaySize
    var isPressed: Bool

    func makeUIView(context: Context) -> JdKeyCapView {
        JdKeyCapView(key, variant: variant, size: size, isPressed: isPressed)
    }

    func updateUIView(_ view: JdKeyCapView, context: Context) {
        if view.isPressed != isPressed { view.isPressed = isPressed }
    }
}
