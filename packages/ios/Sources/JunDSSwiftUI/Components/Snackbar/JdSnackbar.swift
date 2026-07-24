import SwiftUI
import JunDSCore

// 웹 jd-snackbar의 SwiftUI 번역 (DESIGN-4 §C) — 스택이 아닌 단일 바. 위치 4종.
// 배경: 웹은 기본(default)이 surface-overlay이고 시맨틱 variant에만 색을 입힌다. Core
// JdFeedbackVariant엔 웹의 중립 'default' 케이스가 없어, 시그니처 기본값 .info를 그 중립
// 자리로 접는다 → .info는 surfaceOverlay, success/warning/danger는 variant.color(notes 보고분).
// 흰 글자(웹 color:#fff — 전용 토큰 없음). 자동 닫힘 + hover/focus/드래그 정지(WCAG 2.2.1).
public struct JdSnackbar: View {

    @Binding private var isPresented: Bool
    private let message: String
    private let variant: JdFeedbackVariant
    private let position: JdToastPosition
    private let duration: TimeInterval
    private let actionLabel: String?
    private let onAction: (() -> Void)?

    // hover/focus/드래그 정지 — 정지 중엔 자동 닫힘 타이머가 진행하지 않는다
    @State private var isPaused = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(isPresented: Binding<Bool>,
                message: String,
                variant: JdFeedbackVariant = .info,
                position: JdToastPosition = .bottom,
                duration: TimeInterval = 4,
                actionLabel: String? = nil,
                onAction: (() -> Void)? = nil) {
        self._isPresented = isPresented
        self.message = message
        self.variant = variant
        self.position = position
        self.duration = duration
        self.actionLabel = actionLabel
        self.onAction = onAction
    }

    public var body: some View {
        // 빈 공간은 터치를 통과시키고 바만 상호작용한다
        Color.clear
            .allowsHitTesting(false)
            .overlay(alignment: alignment) {
                if isPresented {
                    bar.transition(barTransition)
                }
            }
            .animation(reduceMotion ? nil : enterAnimation, value: isPresented)
            .task(id: AutoDismissKey(presented: isPresented, paused: isPaused)) {
                await runAutoDismiss()
            }
            .onChange(of: isPresented) { presented in
                if presented {
                    JdAnnouncer.announce(message, priority: variant.announcePriority)
                }
            }
    }

    // MARK: - 바

    private var bar: some View {
        HStack(alignment: .center, spacing: JdGap.md.value) {
            Text(message)
                .font(JdSwiftUIFont.scaled(size: JdToken.FontSize.md,
                                           weight: JdToken.FontWeight.medium,
                                           category: sizeCategory))
                .foregroundColor(.white) // 웹 color:#fff — 전용 토큰 없음(notes 보고분)
                .fixedSize(horizontal: false, vertical: true)
                .frame(maxWidth: .infinity, alignment: .leading)

            if let actionLabel, let onAction {
                Button {
                    onAction()
                    isPresented = false
                } label: {
                    Text(actionLabel)
                        .font(JdSwiftUIFont.scaled(size: JdToken.FontSize.md,
                                                   weight: JdToken.FontWeight.semibold,
                                                   category: sizeCategory))
                        .foregroundColor(.white)
                }
            }
        }
        .padding(.horizontal, JdGap.md.value)
        .padding(.vertical, JdGap.sm.value)
        // 스낵바 폭 상한 — 전용 토큰이 없어 오버레이 lg 폭(560)을 상한으로 재사용(notes 보고분)
        .frame(maxWidth: JdOverlaySize.lg.drawerWidth)
        .background(backgroundColor.color)
        .clipShape(RoundedRectangle(cornerRadius: JdToken.Radius.lg, style: .continuous))
        .shadow(color: JdSnackbar.shadowInk.color,
                radius: JdSnackbar.shadowGeometry.blur / 2, // CSS blur = 2 × 렌더 반경
                x: JdSnackbar.shadowGeometry.x,
                y: JdSnackbar.shadowGeometry.y)
        .padding(JdGap.md.value)
        // hover/focus/드래그 중 자동 닫힘 정지(WCAG 2.2.1)
        .onHover { isPaused = $0 }
        .gesture(
            DragGesture(minimumDistance: JdToken.Space.s2)
                .onChanged { _ in isPaused = true }
                .onEnded { _ in isPaused = false }
        )
        // 바 1개 = 상태 요소 하나(라이브 리전은 announce가 담당)
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(.isStaticText)
    }

    // MARK: - 자동 닫힘

    private struct AutoDismissKey: Equatable {
        let presented: Bool
        let paused: Bool
    }

    private func runAutoDismiss() async {
        // 정지 상태가 바뀌면 task(id:)가 재시작하며 남은 시간 대신 처음부터 잰다(정지 중 진행 금지)
        guard isPresented, !isPaused, duration > 0 else { return }
        let nanoseconds = UInt64((duration * 1_000_000_000).rounded())
        try? await Task.sleep(nanoseconds: nanoseconds)
        guard !Task.isCancelled else { return }
        isPresented = false
    }

    // MARK: - 배경·정렬

    private var backgroundColor: JdDynamicColor {
        switch variant {
        case .info: return JdToken.Color.surfaceOverlay // 웹 default 중립 바
        case .success, .warning, .danger: return variant.color
        }
    }

    private var alignment: Alignment {
        if position.isCentered {
            return position.isTop ? .top : .bottom
        }
        switch (position.isTop, position.isLeading) {
        case (true, true): return .topLeading
        case (true, false): return .topTrailing
        case (false, true): return .bottomLeading
        case (false, false): return .bottomTrailing
        }
    }

    private var barTransition: AnyTransition {
        .move(edge: position.isTop ? .top : .bottom).combined(with: .opacity)
    }

    private var enterAnimation: Animation? {
        let duration = JdMotion.duration(JdToken.Duration.normal)
        guard duration > 0 else { return nil }
        let curve = JdToken.Easing.default
        return .timingCurve(curve.0, curve.1, curve.2, curve.3, duration: duration)
    }

    // 알파는 토큰 색이 이미 들고 있다 — 레이어 첫 장만 쓴다(JdBackTopButton과 같은 승계 규칙)
    private static let shadowInk = JdDynamicColor(
        light: JdToken.Shadow.lg.light.first?.color ?? 0,
        dark: JdToken.Shadow.lg.dark.first?.color ?? 0
    )
    private static let shadowGeometry: JdToken.Shadow.Layer =
        JdToken.Shadow.lg.light.first ?? .init(color: 0, x: 0, y: 0, blur: 0, spread: 0)
}
