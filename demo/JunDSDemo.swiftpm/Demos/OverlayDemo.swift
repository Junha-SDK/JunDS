import JunDS
import SwiftUI

// Overlay 데모 — 레시피형 (04 §10.1). 웹 <jd-overlay>는 절대 위치 덮개 + backdrop-filter이고,
// iOS 관용구는 .overlay(alignment:) + 재질(.ultraThinMaterial)이다. 신규 타입 없음.
// blur를 끄면 재질 대신 딤(foreground 50%)으로 떨어진다 — 웹의 blur 미지원 폴백과 동형.
// 컨트롤 키·값 리터럴은 웹 attribute와 일치(no-center, blur).

enum OverlayDemo {
    static let demo = ComponentDemo(
        id: "Overlay",
        controls: [
            .toggle("no-center", "no-center"),
            .toggle("blur", "blur", initial: true),
        ],
        swiftUI: { state in AnyView(OverlayStage(state: state)) },
        recipe: """
            // Overlay = .overlay 관용구 (04 §10.1 — 신규 컴포넌트 없음)
            base.overlay(alignment: noCenter ? .topLeading : .center) {
                content
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(.ultraThinMaterial)      // 웹 backdrop-filter: blur(4px) 등가
            }

            // blur 없이 딤만 필요하면
            .background(JdToken.Color.foreground.color.opacity(JdToken.Opacity.o50))
            """
    )

    // 덮개가 실물로 보이는 최소 높이 — 토큰 파생(80×2)
    static let baseHeight = JdToken.Space.s20 * 2
}

// blur 토글 → 배경 스타일. 두 갈래의 타입이 달라 AnyShapeStyle로 지운다.
private func overlayBackdrop(blur: Bool) -> AnyShapeStyle {
    blur
        ? AnyShapeStyle(.ultraThinMaterial)
        : AnyShapeStyle(JdToken.Color.foreground.color.opacity(JdToken.Opacity.o50))
}

private struct OverlayStage: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let noCenter = state.bool("no-center")
        let blur = state.bool("blur")
        let alignment: Alignment = noCenter ? .topLeading : .center

        VStack(spacing: JdToken.Space.s3) {
            // 밑에 깔리는 내용 — 덮개가 무엇을 가리는지 보이게 무늬를 둔다
            OverlayBase()
                .frame(height: OverlayDemo.baseHeight)
                .overlay(alignment: alignment) {
                    JdText("덮개 내용", size: .sm)
                        .padding(JdToken.Space.s3)
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: alignment)
                        .background(overlayBackdrop(blur: blur))
                }
                .cornerRadius(JdToken.Radius.lg)

            Text(
                blur
                    ? "blur — .ultraThinMaterial이 밑 내용을 흐린다(웹 backdrop-filter 등가)."
                    : "blur 해제 — 재질 대신 foreground 50% 딤. 밑 내용이 흐려지지 않고 어두워진다."
            )
            .font(.footnote)
            .foregroundColor(.secondary)

            Text(
                noCenter
                    ? "no-center — 덮개 내용이 좌상단 정렬"
                    : "기본 — 덮개 내용이 양축 중앙"
            )
            .font(.footnote)
            .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

// 덮개 아래에 깔리는 색 블록 — 흐림/딤 차이가 보이도록 대비가 있는 줄무늬
private struct OverlayBase: View {
    var body: some View {
        HStack(spacing: JdGap.none.value) {
            JdToken.Color.primaryLight.color
            JdToken.Color.accentLight.color
            JdToken.Color.successLight.color
            JdToken.Color.warningLight.color
        }
    }
}
