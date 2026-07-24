import SwiftUI
import UIKit
import JunDS

// IconButton 데모 — 실컴포넌트 JdIconButton(SwiftUI)/JdIconButtonView(UIKit).
// 아이콘 children은 iOS에서 SF Symbols 이름(systemImage)으로 번역한다(서드파티 0 규칙).
// **accessibilityLabel은 필수 인자**다 — 라벨 없는 init을 제공하지 않아 컴파일 타임에 강제된다
// (04 §7.1). 데모도 심볼마다 뜻을 붙여 그 계약을 지킨다.
// 컨트롤 키·값 리터럴은 웹 attribute 문자열과 일치(3플랫폼 동일 리터럴, 04 §3).

enum IconButtonDemo {
    static let demo = ComponentDemo(
        id: "IconButton",
        controls: [
            .options("variant", "variant", JdIconButtonVariant.allCases.map(\.rawValue), initial: "ghost"),
            .options("size", "size", JdIconButtonSize.allCases.map(\.rawValue), initial: "md"),
            .options("systemImage", "systemImage", symbols.map(\.name), initial: "heart"),
        ],
        swiftUI: { state in AnyView(IconButtonStageSwiftUI(state: state)) },
        uikit: { state in AnyView(IconButtonStageUIKit(state: state)) }
    )

    // 심볼 ↔ 뜻 — 아이콘 전용 컨트롤에서 라벨은 VoiceOver의 유일한 표면이다
    struct Symbol {
        let name: String
        let label: String
    }

    static let symbols: [Symbol] = [
        Symbol(name: "heart", label: "좋아요"),
        Symbol(name: "star", label: "즐겨찾기"),
        Symbol(name: "trash", label: "삭제"),
        Symbol(name: "square.and.arrow.up", label: "공유"),
    ]

    static func label(for name: String) -> String {
        symbols.first { $0.name == name }?.label ?? name
    }
}

// DemoState를 읽는 free function은 @MainActor 필수 (DemoState가 @MainActor 격리)

@MainActor
private func iconVariant(_ state: DemoState) -> JdIconButtonVariant {
    JdIconButtonVariant(rawValue: state.string("variant")) ?? .ghost
}

@MainActor
private func iconSize(_ state: DemoState) -> JdIconButtonSize {
    JdIconButtonSize(rawValue: state.string("size")) ?? .md
}

@MainActor
private func iconSymbol(_ state: DemoState) -> String {
    state.string("systemImage", fallback: "heart")
}

private struct IconButtonStageSwiftUI: View {
    @ObservedObject var state: DemoState
    @State private var tapCount = 0

    var body: some View {
        let symbol = iconSymbol(state)
        VStack(spacing: JdToken.Space.s4) {
            JdIconButton(
                systemImage: symbol,
                accessibilityLabel: IconButtonDemo.label(for: symbol),
                variant: iconVariant(state),
                size: iconSize(state)
            ) {
                tapCount += 1
            }

            Text("탭 횟수: \(tapCount) · label: \(IconButtonDemo.label(for: symbol))")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

private struct IconButtonStageUIKit: View {
    @ObservedObject var state: DemoState
    @State private var tapCount = 0

    var body: some View {
        let symbol = iconSymbol(state)
        let variant = iconVariant(state)
        let size = iconSize(state)
        VStack(spacing: JdToken.Space.s4) {
            IconButtonViewRep(
                systemImage: symbol,
                accessibilityLabel: IconButtonDemo.label(for: symbol),
                variant: variant,
                size: size
            ) {
                tapCount += 1
            }
            .fixedSize()
            // systemImage·variant·size 전부 init 전용 표면 — 바뀌면 뷰를 재생성한다
            .id("\(symbol)|\(variant.rawValue)|\(size.rawValue)")

            Text("탭 횟수: \(tapCount) · label: \(IconButtonDemo.label(for: symbol))")
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주).
// JdIconButtonView는 systemImage/variant/size가 전부 init 전용이라 갱신 표면은 onTap뿐이다.
private struct IconButtonViewRep: UIViewRepresentable {
    var systemImage: String
    var accessibilityLabel: String
    var variant: JdIconButtonVariant
    var size: JdIconButtonSize
    var onTap: () -> Void

    func makeUIView(context: Context) -> JdIconButtonView {
        let view = JdIconButtonView(
            systemImage: systemImage,
            accessibilityLabel: accessibilityLabel,
            variant: variant,
            size: size
        )
        view.setContentHuggingPriority(.required, for: .horizontal)
        view.setContentHuggingPriority(.required, for: .vertical)
        return view
    }

    func updateUIView(_ view: JdIconButtonView, context: Context) {
        view.onTap = onTap
    }
}
