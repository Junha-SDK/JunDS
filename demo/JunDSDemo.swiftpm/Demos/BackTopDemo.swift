import JunDS
import SwiftUI
import UIKit

// BackTop 데모 — 실컴포넌트 JdBackTopButton(SwiftUI)/JdBackTopButtonView(UIKit).
//
// 웹 <jd-back-top>과 달리 iOS는 **버튼만 컴포넌트**다: 스크롤도, 가시성 판정도 소비자 몫이다
// (04 §10 번역 원칙). 그래서 이 데모는 버튼 외형이 아니라 **스크롤 판정의 조립법**을 보여준다 —
//   · 스크롤: SwiftUI ScrollView + ScrollViewReader / UIKit UIScrollView.setContentOffset
//   · 판정:   JdBackTop.shouldShow(scrollY:threshold:) — Core 단일 소스(엄격 초과 >)
// threshold를 내리면 버튼이 더 일찍 나타난다. 임계 계산을 스테이지에서 다시 쓰지 않는다.

enum BackTopDemo {
    static let demo = ComponentDemo(
        id: "BackTop",
        controls: [
            .slider(
                "threshold", "threshold", 100...600, step: 20,
                initial: Double(JdBackTop.defaultThreshold))
        ],
        swiftUI: { state in AnyView(BackTopStageSwiftUI(state: state)) },
        uikit: { state in AnyView(BackTopStageUIKit(state: state)) }
    )

    /// 임계 600까지 도달하려면 콘텐츠가 충분히 길어야 한다
    static let rows = Array(1...40)
    static let topAnchor = "back-top-anchor"
    static let space = "back-top-space"
    /// 스테이지(minHeight 240) 안에서 스크롤이 실제로 일어나도록 창을 고정한다
    static let windowHeight = JdToken.Space.s20 * 2

    static func rowText(_ index: Int) -> String {
        "행 \(index) — 스크롤을 내리면 오프셋이 임계를 넘는 순간 버튼이 나타난다"
    }
}

// DemoState를 읽는 free function은 @MainActor 필수 (DemoState가 @MainActor 격리)

@MainActor
private func backTopThreshold(_ state: DemoState) -> CGFloat {
    CGFloat(state.number("threshold", fallback: Double(JdBackTop.defaultThreshold)))
}

// MARK: - SwiftUI 스테이지 (ScrollView + ScrollViewReader)

/// 스크롤 오프셋 관측 — 콘텐츠 최상단의 minY를 명명 좌표계에서 읽어 부호를 뒤집는다
private struct BackTopOffsetKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}

private struct BackTopStageSwiftUI: View {
    @ObservedObject var state: DemoState
    @State private var scrollY: CGFloat = 0

    var body: some View {
        let threshold = backTopThreshold(state)
        let visible = JdBackTop.shouldShow(scrollY: scrollY, threshold: threshold)

        VStack(spacing: JdToken.Space.s3) {
            ScrollViewReader { proxy in
                ScrollView(.vertical) {
                    VStack(alignment: .leading, spacing: JdGap.sm.value) {
                        // 되돌아갈 지점 — 높이 0의 앵커
                        Color.clear
                            .frame(height: 0)
                            .id(BackTopDemo.topAnchor)
                        ForEach(BackTopDemo.rows, id: \.self) { index in
                            JdText(BackTopDemo.rowText(index), size: .sm)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(JdGap.md.value)
                    .background(
                        GeometryReader { geo in
                            Color.clear.preference(
                                key: BackTopOffsetKey.self,
                                value: -geo.frame(in: .named(BackTopDemo.space)).minY
                            )
                        }
                    )
                }
                .coordinateSpace(name: BackTopDemo.space)
                .onPreferenceChange(BackTopOffsetKey.self) { scrollY = $0 }
                .frame(height: BackTopDemo.windowHeight)
                .overlay(alignment: .bottomTrailing) {
                    if visible {
                        JdBackTopButton {
                            withAnimation {
                                proxy.scrollTo(BackTopDemo.topAnchor, anchor: .top)
                            }
                        }
                        .padding(JdToken.Space.s4)
                    }
                }
            }
            .background(JdToken.Color.card.color)
            .clipShape(RoundedRectangle(cornerRadius: JdToken.Radius.lg, style: .continuous))

            backTopFootnote(scrollY: scrollY, threshold: threshold, visible: visible)
        }
        .padding(JdToken.Space.s4)
    }
}

// MARK: - UIKit 스테이지 (UIScrollView + setContentOffset)

private struct BackTopStageUIKit: View {
    @ObservedObject var state: DemoState
    @State private var scrollY: CGFloat = 0

    var body: some View {
        let threshold = backTopThreshold(state)
        let visible = JdBackTop.shouldShow(scrollY: scrollY, threshold: threshold)

        VStack(spacing: JdToken.Space.s3) {
            BackTopScrollViewRep(threshold: threshold) { offset in
                // 스크롤 콜백은 초당 수십 번이다 — 값이 실제로 바뀔 때만 상태를 건드린다
                if scrollY != offset { scrollY = offset }
            }
            .frame(height: BackTopDemo.windowHeight)
            .clipShape(RoundedRectangle(cornerRadius: JdToken.Radius.lg, style: .continuous))

            backTopFootnote(scrollY: scrollY, threshold: threshold, visible: visible)
        }
        .padding(JdToken.Space.s4)
    }
}

// 각주 — 판정의 실황. shouldShow는 엄격 초과(>)라 경계값에서는 아직 감춰져 있다.
private func backTopFootnote(scrollY: CGFloat, threshold: CGFloat, visible: Bool) -> some View {
    Text(
        "JdBackTop.shouldShow(scrollY: \(Int(scrollY)), threshold: \(Int(threshold))) = "
            + "\(visible ? "true" : "false") — 판정은 Core가 단일 소스이고 엄격 초과(>)라 "
            + "경계값에서는 아직 감춰져 있다. 버튼은 스크롤을 되돌리는 트리거일 뿐이다."
    )
    .font(.footnote)
    .foregroundColor(.secondary)
    .multilineTextAlignment(.center)
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주).
// 스크롤(UIScrollView)·복귀(setContentOffset)는 시스템이 하고 컴포넌트는 버튼 하나뿐이다.
private struct BackTopScrollViewRep: UIViewRepresentable {
    var threshold: CGFloat
    var onScroll: (CGFloat) -> Void

    final class Coordinator: NSObject, UIScrollViewDelegate {
        var threshold: CGFloat = JdBackTop.defaultThreshold
        var onScroll: (CGFloat) -> Void = { _ in }
        weak var button: JdBackTopButtonView?

        func scrollViewDidScroll(_ scrollView: UIScrollView) {
            let offset = scrollView.contentOffset.y
            onScroll(offset)
            apply(offset: offset)
        }

        func apply(offset: CGFloat) {
            // 가시성 판정은 Core — 임계 비교를 여기서 다시 쓰지 않는다
            button?.isHidden = !JdBackTop.shouldShow(scrollY: offset, threshold: threshold)
        }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeUIView(context: Context) -> BackTopStageUIView {
        let view = BackTopStageUIView()
        let coordinator = context.coordinator
        view.scrollView.delegate = coordinator
        coordinator.button = view.button
        view.button.onTap = { [weak view] in
            view?.scrollView.setContentOffset(.zero, animated: true)
        }
        return view
    }

    func updateUIView(_ view: BackTopStageUIView, context: Context) {
        let coordinator = context.coordinator
        coordinator.threshold = threshold
        coordinator.onScroll = onScroll
        coordinator.apply(offset: view.scrollView.contentOffset.y)
    }
}

/// 스크롤 창 + 우하단에 고정된 BackTop 버튼 — 웹의 position: fixed 배치를 오토레이아웃으로 옮긴 것.
private final class BackTopStageUIView: UIView {
    let scrollView = UIScrollView()
    let button = JdBackTopButtonView()
    private let contentStack = UIStackView()

    override init(frame: CGRect) {
        super.init(frame: frame)

        backgroundColor = JdToken.Color.card.uiColor

        contentStack.axis = .vertical
        contentStack.alignment = .fill
        contentStack.spacing = JdGap.sm.value
        for index in BackTopDemo.rows {
            contentStack.addArrangedSubview(makeRow(index))
        }

        scrollView.addSubview(contentStack)
        addSubview(scrollView)
        addSubview(button)

        // 자체 레이아웃 DSL 사용 (04 §5 — 내부 표준)
        scrollView.jd.layout {
            $0.edges.equalToSuperview()
        }
        contentStack.jd.layout {
            $0.top.equalToSuperview().inset(JdGap.md.value)
            $0.bottom.equalToSuperview().inset(JdGap.md.value)
            $0.leading.equalToSuperview().inset(JdGap.md.value)
            $0.trailing.equalToSuperview().inset(JdGap.md.value)
            // 세로 스크롤 — 가로는 스크롤 창에 묶는다
            $0.width.equal(to: scrollView.jd.width, offset: -JdGap.md.value * 2)
        }
        button.jd.layout {
            $0.trailing.equalToSuperview().inset(JdToken.Space.s4)
            $0.bottom.equalToSuperview().inset(JdToken.Space.s4)
        }

        // 초기 오프셋 0 — 임계 하한(100)보다 작으므로 감춰진 상태로 시작한다
        button.isHidden = true
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    private func makeRow(_ index: Int) -> UILabel {
        let label = UILabel()
        label.text = BackTopDemo.rowText(index)
        label.numberOfLines = 0
        label.adjustsFontForContentSizeCategory = true
        label.font = JdFontBridge.scaledFont(
            size: JdTextSpec.resolve(size: .sm).fontSize,
            weight: JdToken.FontWeight.normal,
            compatibleWith: traitCollection)
        label.textColor = JdToken.Color.foreground.uiColor
        return label
    }
}
