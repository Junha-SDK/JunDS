import SwiftUI
import UIKit
import JunDS

// Link 데모 — 실컴포넌트 JdLink(SwiftUI)/JdLinkView(UIKit). 웹 <jd-link> 동형.
// 컨트롤 키·값은 웹 attribute 리터럴(variant/underline/external) — 3플랫폼 동일 (04 §3).
//
// 실제 열기는 시스템이 한다(SwiftUI Link → openURL / UIKit → UIApplication.open) —
// 탭하면 Safari가 열린다. destination이 nil이면 링크가 아니라 그냥 텍스트다(웹 href 없는 <a> 동형).

enum LinkDemo {
    static let demo = ComponentDemo(
        id: "Link",
        controls: [
            .options("variant", "variant", JdLinkVariant.allCases.map(\.rawValue), initial: "default"),
            .toggle("underline", "underline", initial: true),
            .toggle("external", "external (isExternal)"),
            .text("text", "text", placeholder: "링크 문구", initial: "문서 보기"),
        ],
        swiftUI: { state in AnyView(LinkStageSwiftUI(state: state)) },
        uikit: { state in AnyView(LinkStageUIKit(state: state)) }
    )

    // 데모용 목적지 — 실제 열기는 시스템 몫이라 값 자체는 표면 시연용이다
    static let destination = URL(string: "https://example.com/docs")
}

private let linkNote = "default와 primary는 같은 색으로 결의된다 — Core 어휘(default/primary/muted)와 "
    + "웹 어휘(default/subtle/muted/danger)가 어긋나 있고, 패리티 기준인 웹 .jd-link{color:primary}를 "
    + "지켰기 때문이다(어휘 재심의는 Core 몫). external은 ↗ 심볼을 붙이고 낭독 라벨에 "
    + "\"새 창에서 열림\"을 합류시킨다 — 웹이 아이콘으로만 알리던 것의 보정이다(04 §7.1)."

@MainActor
private func linkText(_ state: DemoState) -> String {
    state.string("text", fallback: "문서 보기")
}

@MainActor
private func linkVariant(_ state: DemoState) -> JdLinkVariant {
    JdLinkVariant(rawValue: state.string("variant")) ?? .default
}

private struct LinkStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdLink(linkText(state),
                   destination: LinkDemo.destination,
                   variant: linkVariant(state),
                   underline: state.bool("underline"),
                   isExternal: state.bool("external"))

            Text(linkNote)
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
    }
}

private struct LinkStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let variant = linkVariant(state)
        return VStack(spacing: JdToken.Space.s4) {
            LinkViewRep(text: linkText(state),
                        destination: LinkDemo.destination,
                        variant: variant,
                        underline: state.bool("underline"),
                        isExternal: state.bool("external"))
                .fixedSize()
                // variant는 init 전용 표면(private let) — 값이 바뀌면 뷰를 재생성한다
                .id(variant.rawValue)

            Text(linkNote)
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct LinkViewRep: UIViewRepresentable {
    var text: String
    var destination: URL?
    var variant: JdLinkVariant
    var underline: Bool
    var isExternal: Bool

    func makeUIView(context: Context) -> JdLinkView {
        JdLinkView(text,
                   destination: destination,
                   variant: variant,
                   underline: underline,
                   isExternal: isExternal)
    }

    func updateUIView(_ view: JdLinkView, context: Context) {
        if view.text != text { view.text = text }
        if view.destination != destination { view.destination = destination }
        if view.underline != underline { view.underline = underline }
        if view.isExternal != isExternal { view.isExternal = isExternal }
    }

    // 내부 스택 제약으로만 크기가 나오는 뷰라 압축 적합 크기를 직접 알려 준다
    func sizeThatFits(_ proposal: ProposedViewSize, uiView: JdLinkView, context: Context) -> CGSize? {
        uiView.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize)
    }
}
