import SwiftUI
import JunDSCore

// 웹 jd-show / jd-hide 동형 — 브레이크포인트 조건 표시 (DESIGN-2 §A).
// 웹은 뷰포트 폭 미디어 쿼리지만 iOS는 **컨테이너(배치 맥락) 폭** 기준이다 (04 §10).
// 판정 로직은 전부 Core의 JdBreakpoint.isVisible이고, 이 파일은 폭을 재서 넘기고
// 뷰를 계층에 넣거나 빼는 일만 한다 (04 §4.2 규칙 2 — 계층은 수집·호출·그리기).
public extension View {

    /// 웹 jd-show — `above` 이상 **AND** `below` 미만에서 표시(둘 다 nil이면 상시 표시).
    func jdShow(above: JdBreakpoint? = nil, below: JdBreakpoint? = nil) -> some View {
        return modifier(JdBreakpointVisibilityModifier(above: above, below: below, hides: false))
    }

    /// 웹 jd-hide — `above` 이상이거나 `below` 미만이면 숨김(두 숨김 규칙의 **OR**).
    /// 웹 CSS가 attribute별 독립 규칙을 합성하는 것과 동형이라 show의 단순 부정이 아니다.
    func jdHide(above: JdBreakpoint? = nil, below: JdBreakpoint? = nil) -> some View {
        return modifier(JdBreakpointVisibilityModifier(above: above, below: below, hides: true))
    }
}

struct JdBreakpointVisibilityModifier: ViewModifier {
    let above: JdBreakpoint?
    let below: JdBreakpoint?
    let hides: Bool

    // 마지막으로 관측한 유효 폭. nil = 미측정 → **보임**이 기본값이다
    // (웹의 "일단 렌더하고 CSS가 숨김"과 동형 — 초기 폭 0에서의 깜빡임 방지).
    // 숨김 중에는 자리 표시자가 0×0이라 폭 0이 보고되는데, 이를 미측정으로 되돌리면
    // 보임↔숨김이 진동하므로 0 이하 보고는 무시하고 마지막 유효 폭을 유지한다.
    @State private var measuredWidth: CGFloat?

    // 회전·분할 화면 전환의 재측정 신호. 숨겨진 동안에는 폭 변화를 관측할 수 없어
    // 크기 클래스가 바뀌면 측정을 초기화해 다음 배치에서 다시 재본다.
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    @Environment(\.verticalSizeClass) private var verticalSizeClass

    func body(content: Content) -> some View {
        Group {
            if isVisible {
                content
            } else {
                // 숨김 = 계층에서 제거(웹 display:none 등가). 자리 표시자는 0×0이라 레이아웃 기여 없음.
                Color.clear.frame(width: 0, height: 0)
            }
        }
        .background(
            GeometryReader { proxy in
                Color.clear.preference(key: JdContainerWidthKey.self, value: proxy.size.width)
            }
        )
        .onPreferenceChange(JdContainerWidthKey.self) { width in
            guard width > 0 else { return }
            measuredWidth = width
        }
        .onChange(of: sizeClassSignature) { _ in
            measuredWidth = nil
        }
    }

    // MARK: 판정 — Core 위임 (자체 폭 비교 금지)

    private var isVisible: Bool {
        guard let measuredWidth else { return true } // 미측정 = 보임
        if hides {
            // 웹 jd-hide[above=X] → w>=X 숨김, jd-hide[below=Y] → w<Y 숨김. 각 규칙을
            // isVisible의 단일 축 호출로 얻어 OR 합성한다(둘 다 없으면 숨김 규칙 없음 = 표시).
            let hiddenByAbove = above.map {
                JdBreakpoint.isVisible(width: measuredWidth, above: $0, below: nil)
            } ?? false
            let hiddenByBelow = below.map {
                JdBreakpoint.isVisible(width: measuredWidth, above: nil, below: $0)
            } ?? false
            return !(hiddenByAbove || hiddenByBelow)
        }
        return JdBreakpoint.isVisible(width: measuredWidth, above: above, below: below)
    }

    // 두 크기 클래스를 하나의 Equatable 신호로 — onChange 비교용
    private var sizeClassSignature: Int {
        let horizontal = horizontalSizeClass == .regular ? 1 : 0
        let vertical = verticalSizeClass == .regular ? 2 : 0
        return horizontal | vertical
    }
}

// 폭 관측 통로 — 뷰 자신의 배치 폭을 상위로 올린다.
// (배치 폭 = 스택에서 늘어난 컨테이너 폭. 내재 폭 콘텐츠에 직접 붙이면 콘텐츠 폭이
//  측정되므로, 폭 조건은 늘어나는 컨테이너 쪽에 붙이는 것이 저작 규약이다.)
struct JdContainerWidthKey: PreferenceKey {
    static var defaultValue: CGFloat { 0 }

    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = max(value, nextValue())
    }
}
