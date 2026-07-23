import SwiftUI
import JunDS

// Center 데모 — 레시피형 (04 §10.1). 웹 <jd-center>는 Box 파생(양축 중앙)이지만
// SwiftUI는 ZStack 기본 정렬이 이미 양축 중앙이라 신규 타입이 필요 없다.
// 스테이지는 관용구를 실물로, recipe가 SwiftUI/UIKit 정본 스니펫.

enum CenterDemo {
    static let demo = ComponentDemo(
        id: "Center",
        controls: [],
        swiftUI: { state in AnyView(CenterStage(state: state)) },
        recipe: """
        // Center = ZStack 관용구 (04 §10.1 — 신규 컴포넌트 없음)
        ZStack {
            content // ZStack 기본 정렬 = 양축 중앙 — 웹 jd-center 동형
        }
        .frame(maxWidth: .infinity, minHeight: JdToken.Space.s24)

        // UIKit: 중앙 제약이 관용구 — 레이아웃 DSL로 1문
        content.jd.layout { $0.center.equalToSuperview() }
        """
    )
}

private struct CenterStage: View {
    @ObservedObject var state: DemoState

    var body: some View {
        ZStack {
            // 중앙에 놓이는 내용물 — 컨테이너보다 작아야 정렬이 보인다
            JdText("양축 중앙", size: .sm)
                .padding(JdToken.Space.s3)
                .background(JdToken.Color.primaryLight.color)
                .cornerRadius(JdToken.Radius.md)
        }
        .frame(maxWidth: .infinity, minHeight: JdToken.Space.s24)
        .background(JdToken.Color.card.color)
        .cornerRadius(JdToken.Radius.lg)
        .padding(JdToken.Space.s6)
    }
}
