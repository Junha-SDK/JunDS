import JunDSCore
import SwiftUI

// 웹 jd-toast 스택의 SwiftUI 호스트 (DESIGN-4 §C). 앱 루트에 1회 부착하면
// 센터의 큐를 position별 정렬로 오버레이한다. 빈 공간은 히트테스트를 통과하고
// 카드만 상호작용한다(.overlay(alignment:)는 콘텐츠 크기만 차지).
public extension View {
    /// 큐를 position별 정렬로 오버레이한다. 앱 루트에 1회.
    func jdToastHost(
        _ center: JdToastCenter = .shared,
        position: JdToastPosition = .topRight
    ) -> some View {
        overlay(JdToastHostLayer(center: center, position: position))
    }
}

struct JdToastHostLayer: View {
    @ObservedObject var center: JdToastCenter
    let position: JdToastPosition
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        // 콘텐츠 크기만 차지하도록 오버레이 정렬을 쓴다 — 나머지 화면은 터치가 통과한다
        Color.clear
            .overlay(alignment: alignment) {
                VStack(spacing: JdGap.sm.value) {
                    ForEach(orderedToasts) { toast in
                        JdToastCard(toast: toast, center: center)
                            .transition(cardTransition)
                    }
                }
                // 토스트 폭 상한 — 전용 토큰이 없어 오버레이 sm 폭(320)을 상한으로 재사용(notes 보고분)
                .frame(maxWidth: JdOverlaySize.sm.drawerWidth, alignment: .leading)
                .padding(JdGap.md.value)
                .animation(reduceMotion ? nil : stackAnimation, value: center.queue)
            }
            .allowsHitTesting(true)
    }

    // MARK: - 내부

    // 하단 정렬이면 최신 토스트가 가장자리(아래)에 오도록 뒤집는다
    private var orderedToasts: [JdToast] {
        position.isTop ? center.queue.visible : center.queue.visible.reversed()
    }

    private var alignment: Alignment {
        if position.isCentered {
            return position.isTop ? .top : .bottom
        }
        // 웹 right→trailing, left→leading (RTL 인식)
        switch (position.isTop, position.isLeading) {
        case (true, true): return .topLeading
        case (true, false): return .topTrailing
        case (false, true): return .bottomLeading
        case (false, false): return .bottomTrailing
        }
    }

    private var cardTransition: AnyTransition {
        let edge: Edge = position.isTop ? .top : .bottom
        return .move(edge: edge).combined(with: .opacity)
    }

    private var stackAnimation: Animation? {
        let duration = JdMotion.duration(JdToken.Duration.normal)
        guard duration > 0 else { return nil }
        let curve = JdToken.Easing.default
        return .timingCurve(curve.0, curve.1, curve.2, curve.3, duration: duration)
    }
}

// 개별 토스트 카드 — card 배경 + 좌측 variant 강조선 + shadow. hover/드래그로 자동닫힘 정지.
struct JdToastCard: View {
    let toast: JdToast
    @ObservedObject var center: JdToastCenter
    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    var body: some View {
        HStack(alignment: .top, spacing: JdGap.sm.value) {
            // 좌측 강조선 — variant 색(장식이라 AT 숨김)
            RoundedRectangle(cornerRadius: JdToken.Radius.full, style: .continuous)
                .fill(toast.variant.color.color)
                .frame(width: JdToken.Border.thick)
                .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: JdToken.Space.s1) {
                if let title = toast.title, !title.isEmpty {
                    Text(title)
                        .font(
                            JdSwiftUIFont.scaled(
                                size: JdToken.FontSize.md,
                                weight: JdToken.FontWeight.semibold,
                                category: sizeCategory)
                        )
                        .foregroundColor(JdToken.Color.foreground.color)
                }
                if let message = toast.message, !message.isEmpty {
                    Text(message)
                        .font(
                            JdSwiftUIFont.scaled(
                                size: JdToken.FontSize.sm,
                                weight: JdToken.FontWeight.normal,
                                category: sizeCategory)
                        )
                        .foregroundColor(JdToken.Color.muted.color)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            Button {
                center.dismiss(toast.id)
            } label: {
                Image(systemName: "xmark")
                    .font(
                        JdSwiftUIFont.scaled(
                            size: JdToken.FontSize.xs,
                            weight: JdToken.FontWeight.semibold,
                            category: sizeCategory)
                    )
                    .foregroundColor(JdToken.Color.muted.color)
            }
            .accessibilityLabel(Text("닫기"))
        }
        .padding(JdGap.md.value)
        .background(JdToken.Color.card.color)
        .clipShape(RoundedRectangle(cornerRadius: JdToken.Radius.xl, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: JdToken.Radius.xl, style: .continuous)
                .strokeBorder(JdToken.Color.border.color, lineWidth: JdToken.Border.thin)
        )
        // 겹 단위 엘리베이션 (DEC-039)
        .jdElevation(JdToken.Shadow.lg, cornerRadius: JdToken.Radius.xl)
        // hover(포인터)·드래그 중 자동닫힘 정지(WCAG 2.2.1)
        .onHover { center.setPaused($0) }
        .gesture(
            DragGesture(minimumDistance: JdToken.Space.s2)
                .onChanged { _ in center.setPaused(true) }
                .onEnded { _ in center.setPaused(false) }
        )
        // 카드 1장 = 요소 묶음(제목·본문 합성). 닫기 버튼은 별도 요소로 남긴다.
        .accessibilityElement(children: .contain)
    }

}
