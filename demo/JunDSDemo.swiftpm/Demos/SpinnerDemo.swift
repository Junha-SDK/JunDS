import SwiftUI
import UIKit
import JunDS

// Spinner 데모 — 실컴포넌트 JdSpinner(SwiftUI)/JdSpinnerView(UIKit). 웹 <jd-spinner> 동형.
// 컨트롤 키·값은 웹 attribute 리터럴(size) — 3플랫폼 동일 (04 §3).
//
// 각주가 가리키는 건 상세 화면 **환경 섹션의 Reduce Motion 토글**이다: 웹은 주기만 늦추지만
// iOS는 04 §7.3에 따라 회전을 **정지**시키고 마지막 프레임을 남긴다(로딩 중이라는 사실은
// 사라지면 안 된다). 토글을 켜서 두 계층 모두 멈추는 걸 그 자리에서 확인할 수 있다.

enum SpinnerDemo {
    static let demo = ComponentDemo(
        id: "Spinner",
        controls: [
            .options("size", "size", JdDisplaySize.allCases.map(\.rawValue), initial: "md"),
        ],
        swiftUI: { state in AnyView(SpinnerStageSwiftUI(state: state)) },
        uikit: { state in AnyView(SpinnerStageUIKit(state: state)) }
    )
}

private let spinnerNote = "환경 섹션의 Reduce Motion을 켜면 회전이 멈춘다 — 웹은 감속, iOS는 정지(마지막 프레임 유지)."

@MainActor
private func spinnerSize(_ state: DemoState) -> JdDisplaySize {
    JdDisplaySize(rawValue: state.string("size")) ?? .md
}

private struct SpinnerStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            JdSpinner(size: spinnerSize(state))

            Text(spinnerNote)
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
    }
}

private struct SpinnerStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let size = spinnerSize(state)
        VStack(spacing: JdToken.Space.s4) {
            SpinnerViewRep(size: size)
                .fixedSize()

            Text(spinnerNote)
        }
        .font(.footnote)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(JdToken.Space.s6)
        // size는 init 전용 표면(인디케이터 스케일 고정) — 값이 바뀌면 뷰를 재생성한다
        .id(size.rawValue)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct SpinnerViewRep: UIViewRepresentable {
    var size: JdDisplaySize

    func makeUIView(context: Context) -> JdSpinnerView {
        JdSpinnerView(size: size)
    }

    func updateUIView(_ view: JdSpinnerView, context: Context) {
        // 노출 표면이 label뿐이고 데모는 기본 라벨을 쓴다 — 갱신할 값이 없다
    }
}
