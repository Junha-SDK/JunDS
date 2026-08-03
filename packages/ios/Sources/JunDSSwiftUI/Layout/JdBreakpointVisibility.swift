import JunDSCore
import SwiftUI

// 웹 jd-show / jd-hide 동형 — 브레이크포인트 조건 표시 (DESIGN-2 §A).
// 웹은 뷰포트 폭 미디어 쿼리지만 iOS는 **컨테이너(배치 맥락) 폭** 기준이다 (04 §10).
// 판정 로직은 전부 Core의 JdBreakpoint.isVisible이고, 이 파일은 폭을 재서 넘기고
// 뷰를 계층에 넣거나 빼는 일만 한다 (04 §4.2 규칙 2 — 계층은 수집·호출·그리기).

// MARK: - 배치 맥락: 컨테이너가 자손에게 폭을 알려준다 (DEC-048)
//
// 왜 필요한가 — 자기 폭을 자기가 재면 숨은 뒤에 못 돌아온다.
// 이전 구현은 각 jdShow가 GeometryReader로 **자기** 폭을 쟀다. 그런데 숨김 상태의
// 자리 표시자는 0×0이라 폭 0을 보고한다. 0을 그대로 믿으면 보임↔숨김이 진동하므로
// 0은 무시하고 마지막 유효 폭을 유지했는데 — 그러면 **숨은 동안에는 폭이 자란 것을
// 영영 관측하지 못한다.** 탈출구가 크기 클래스 변화뿐이라, iPad 분할 화면을 1/3 →
// 1/2로 끄는 것처럼 **크기 클래스가 그대로인 폭 변화**에서는 숨은 채로 굳었다.
//
// 폭을 재는 주체를 "숨을 수 있는 뷰"에서 "숨지 않는 컨테이너"로 옮기면 그 자기참조가
// 사라진다. 컨테이너는 항상 배치되므로 폭이 늘 살아 있다.

private struct JdContainerWidthKey: EnvironmentKey {
    static let defaultValue: CGFloat? = nil
}

public extension EnvironmentValues {
    /// 자손 jdShow/jdHide가 기준으로 삼는 배치 맥락의 폭. nil이면 선언된 맥락이 없다.
    var jdContainerWidth: CGFloat? {
        get { self[JdContainerWidthKey.self] }
        set { self[JdContainerWidthKey.self] = newValue }
    }
}

public extension View {
    /// 이 뷰의 폭을 자손 `jdShow`/`jdHide`의 판단 기준으로 선언한다.
    ///
    /// 화면 루트에 한 번 붙이면 그 아래 전부가 같은 기준을 쓴다 — 웹에서 미디어 쿼리가
    /// 뷰포트 하나를 보는 것과 같은 그림이다.
    ///
    /// ```swift
    /// var body: some View {
    ///     VStack {
    ///         sidebar.jdShow(above: .md)   // 컨테이너가 md 이상일 때만
    ///         content
    ///     }
    ///     .jdLayoutContext()               // ← 기준을 여기서 선언
    /// }
    /// ```
    ///
    /// 붙이지 않아도 동작한다(각 뷰가 자기 폭을 재는 폴백). 다만 그 경우 **숨겨진 동안의
    /// 폭 증가**를 크기 클래스가 함께 바뀌지 않는 한 관측하지 못한다 — 분할 화면을 쓰는
    /// 화면이라면 붙이는 편이 맞다.
    func jdLayoutContext() -> some View {
        modifier(JdLayoutContextModifier())
    }

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

struct JdLayoutContextModifier: ViewModifier {
    @State private var width: CGFloat?

    func body(content: Content) -> some View {
        content
            .background(
                GeometryReader { proxy in
                    Color.clear.preference(
                        key: JdContainerWidthPreference.self, value: proxy.size.width)
                }
            )
            // 컨테이너는 숨지 않으므로 0 보고를 특별히 다룰 이유가 없다 — 0은 아직
            // 배치 전이라는 뜻이고, 배치되면 진짜 폭이 곧바로 뒤따른다.
            .onPreferenceChange(JdContainerWidthPreference.self) { measured in
                if measured > 0 { width = measured }
            }
            .environment(\.jdContainerWidth, width)
    }
}

// MARK: - 가시성 판정

struct JdBreakpointVisibilityModifier: ViewModifier {
    let above: JdBreakpoint?
    let below: JdBreakpoint?
    let hides: Bool

    /// 선언된 배치 맥락. 있으면 이쪽이 정본 — 숨어 있어도 계속 갱신된다.
    @Environment(\.jdContainerWidth) private var contextWidth

    // 맥락이 선언되지 않았을 때의 폴백: 마지막으로 관측한 자기 폭.
    // nil = 미측정 → **보임**이 기본값이다 (웹의 "일단 렌더하고 CSS가 숨김"과 동형 —
    // 초기 폭 0에서의 깜빡임 방지). 숨김 중에는 자리 표시자가 0×0이라 폭 0이 보고되는데,
    // 이를 미측정으로 되돌리면 보임↔숨김이 진동하므로 0 이하 보고는 무시한다.
    @State private var selfMeasuredWidth: CGFloat?

    // 폴백 경로의 재측정 신호. 숨겨진 동안에는 폭 변화를 관측할 수 없어 크기 클래스가
    // 바뀌면 측정을 초기화해 다음 배치에서 다시 재본다. (맥락이 선언돼 있으면 불필요)
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    @Environment(\.verticalSizeClass) private var verticalSizeClass

    private var effectiveWidth: CGFloat? { contextWidth ?? selfMeasuredWidth }

    func body(content: Content) -> some View {
        Group {
            if isVisible {
                content
            } else {
                // 숨김 = 계층에서 제거(웹 display:none 등가). 자리 표시자는 0×0이라 레이아웃 기여 없음.
                Color.clear.frame(width: 0, height: 0)
            }
        }
        .modifier(JdSelfWidthProbe(enabled: contextWidth == nil, width: $selfMeasuredWidth))
        .onChange(of: sizeClassSignature) { _ in
            if contextWidth == nil { selfMeasuredWidth = nil }
        }
    }

    // MARK: 판정 — Core 위임 (자체 폭 비교 금지)

    private var isVisible: Bool {
        guard let effectiveWidth else { return true }  // 미측정 = 보임
        if hides {
            // 웹 jd-hide[above=X] → w>=X 숨김, jd-hide[below=Y] → w<Y 숨김. 각 규칙을
            // isVisible의 단일 축 호출로 얻어 OR 합성한다(둘 다 없으면 숨김 규칙 없음 = 표시).
            let hiddenByAbove =
                above.map {
                    JdBreakpoint.isVisible(width: effectiveWidth, above: $0, below: nil)
                } ?? false
            let hiddenByBelow =
                below.map {
                    JdBreakpoint.isVisible(width: effectiveWidth, above: nil, below: $0)
                } ?? false
            return !(hiddenByAbove || hiddenByBelow)
        }
        return JdBreakpoint.isVisible(width: effectiveWidth, above: above, below: below)
    }

    // 두 크기 클래스를 하나의 Equatable 신호로 — onChange 비교용
    private var sizeClassSignature: Int {
        let horizontal = horizontalSizeClass == .regular ? 1 : 0
        let vertical = verticalSizeClass == .regular ? 2 : 0
        return horizontal | vertical
    }
}

/// 폴백 측정 — 배치 맥락이 선언되지 않았을 때만 GeometryReader를 단다.
/// 맥락이 있으면 관측 자체를 걸지 않아 불필요한 preference 전파가 없다.
private struct JdSelfWidthProbe: ViewModifier {
    let enabled: Bool
    @Binding var width: CGFloat?

    func body(content: Content) -> some View {
        if enabled {
            content
                .background(
                    GeometryReader { proxy in
                        Color.clear.preference(
                            key: JdContainerWidthPreference.self, value: proxy.size.width)
                    }
                )
                .onPreferenceChange(JdContainerWidthPreference.self) { measured in
                    guard measured > 0 else { return }
                    width = measured
                }
        } else {
            content
        }
    }
}

// 폭 관측 통로 — 뷰 자신의 배치 폭을 상위로 올린다.
// (배치 폭 = 스택에서 늘어난 컨테이너 폭. 내재 폭 콘텐츠에 직접 붙이면 콘텐츠 폭이
//  측정되므로, 폭 조건은 늘어나는 컨테이너 쪽에 붙이는 것이 저작 규약이다.)
struct JdContainerWidthPreference: PreferenceKey {
    static var defaultValue: CGFloat { 0 }

    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = max(value, nextValue())
    }
}
