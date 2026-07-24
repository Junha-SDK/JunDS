import SwiftUI
import JunDSCore

// 웹 jd-drawer의 SwiftUI 번역 (04 §10.1):
//  • bottom → 시스템 시트 + detent(sheetHeight 기반) — BottomSheet과 동일 기제.
//  • left/right → iOS 관용이 약해 커스텀 오버레이 전환(딤 + 가장자리 슬라이드, JdMotion.duration).
// persistent → interactiveDismissDisabled / 커스텀은 백드롭 탭 무시.
// title 있으면 헤더 행(제목 + 닫기 버튼). cancelable veto는 onDismissAttempt로 게이트.

// MARK: - onDismissAttempt 게이트 (Drawer/BottomSheet 공용)

/// SwiftUI엔 per-dismiss veto가 없다 — 시스템/제스처가 바인딩을 닫으려 할 때 이 함수로
/// onDismissAttempt를 태워 false면 닫힘을 취소한다(웹 jd-request-close(cancelable) 등가, DEC-012).
/// 순수 함수라 단위 테스트로 게이트 의미론을 고정한다(프레젠테이션은 쇼룸 실기동).
public enum JdOverlayDismissGate {
    @MainActor
    public static func apply(_ isPresented: Binding<Bool>,
                             reason: JdDismissReason,
                             onDismissAttempt: ((JdDismissReason) -> Bool)?) {
        if let onDismissAttempt, onDismissAttempt(reason) == false { return }
        isPresented.wrappedValue = false
    }
}

// MARK: - JdDrawer

public struct JdDrawer<Content: View>: View {

    @Binding private var isPresented: Bool
    private let side: JdDrawerSide
    private let size: JdOverlaySize
    private let drawerTitle: String?
    private let persistent: Bool
    private let onDismissAttempt: ((JdDismissReason) -> Bool)?
    private let content: () -> Content

    public init(isPresented: Binding<Bool>,
                side: JdDrawerSide = .right,
                size: JdOverlaySize = .md,
                title: String? = nil,
                persistent: Bool = false,
                onDismissAttempt: ((JdDismissReason) -> Bool)? = nil,
                @ViewBuilder content: @escaping () -> Content) {
        self._isPresented = isPresented
        self.side = side
        self.size = size
        self.drawerTitle = title
        self.persistent = persistent
        self.onDismissAttempt = onDismissAttempt
        self.content = content
    }

    private var gatedBinding: Binding<Bool> {
        Binding(
            get: { isPresented },
            set: { newValue in
                if newValue {
                    isPresented = true
                } else {
                    JdOverlayDismissGate.apply($isPresented, reason: .backdrop,
                                               onDismissAttempt: onDismissAttempt)
                }
            }
        )
    }

    public var body: some View {
        switch side {
        case .bottom:
            Color.clear
                .sheet(isPresented: gatedBinding) {
                    JdDrawerSheetChrome(size: size, title: drawerTitle, persistent: persistent,
                                        onClose: closeFromHeader, content: content)
                }
        case .left, .right:
            JdDrawerSideOverlay(isPresented: $isPresented, side: side, size: size,
                                title: drawerTitle, persistent: persistent,
                                onDismissAttempt: onDismissAttempt, content: content)
        }
    }

    // 헤더 닫기 버튼(명시적 close) — 시트 경로. 게이트는 통과하되 persistent와 무관하게 동작.
    private func closeFromHeader() {
        JdOverlayDismissGate.apply($isPresented, reason: .close, onDismissAttempt: onDismissAttempt)
    }
}

// MARK: - bottom(시트) 크롬

struct JdDrawerSheetChrome<Content: View>: View {
    let size: JdOverlaySize
    let title: String?
    let persistent: Bool
    let onClose: () -> Void
    @ViewBuilder let content: () -> Content

    private var detents: Set<PresentationDetent> {
        if size == .full { return [.large] }
        return [.height(size.sheetHeight)]
    }

    var body: some View {
        VStack(spacing: JdToken.Space.s4) {
            if let title {
                JdDrawerHeader(title: title, onClose: onClose)
            }
            content()
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
        .padding(JdToken.Space.s5)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(JdToken.Color.card.color.ignoresSafeArea())
        .presentationDetents(detents)
        .presentationDragIndicator(persistent ? .hidden : .visible)
        .interactiveDismissDisabled(persistent)
    }
}

// MARK: - left/right(커스텀 슬라이드 + 딤)

struct JdDrawerSideOverlay<Content: View>: View {
    @Binding var isPresented: Bool
    let side: JdDrawerSide
    let size: JdOverlaySize
    let title: String?
    let persistent: Bool
    let onDismissAttempt: ((JdDismissReason) -> Bool)?
    @ViewBuilder let content: () -> Content

    private var edge: Edge { side == .left ? .leading : .trailing }
    private var alignment: Alignment { side == .left ? .leading : .trailing }

    // 애니메이션은 JdMotion.duration 경유 — Reduce Motion 시 0(즉시) (04 §7.3)
    private var transitionAnimation: Animation {
        .easeOut(duration: JdMotion.duration(JdToken.Duration.normal))
    }

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: alignment) {
                if isPresented {
                    // 딤 스크림: 웹 rgba(0,0,0,.3) 승계. 전용 색 토큰이 없어 black + Opacity.o30.
                    Color.black.opacity(JdToken.Opacity.o30)
                        .ignoresSafeArea()
                        .contentShape(Rectangle())
                        .onTapGesture { requestBackdropDismiss() }
                        .accessibilityHidden(true)
                        .transition(.opacity)

                    panel(containerWidth: geo.size.width)
                        .transition(.move(edge: edge))
                }
            }
            .frame(width: geo.size.width, height: geo.size.height, alignment: alignment)
            .animation(transitionAnimation, value: isPresented)
        }
        .ignoresSafeArea()
    }

    private func panel(containerWidth: CGFloat) -> some View {
        let width: CGFloat? = size == .full ? nil : min(size.drawerWidth, containerWidth)
        return VStack(spacing: JdToken.Space.s4) {
            if let title {
                JdDrawerHeader(title: title, onClose: requestClose)
            }
            content()
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
        .padding(JdToken.Space.s5)
        .frame(width: width, alignment: .topLeading)
        .frame(maxWidth: size == .full ? .infinity : nil, maxHeight: .infinity, alignment: .topLeading)
        .background(JdToken.Color.card.color)
        .ignoresSafeArea(edges: .vertical)
    }

    private func requestBackdropDismiss() {
        if persistent { return }
        JdOverlayDismissGate.apply($isPresented, reason: .backdrop, onDismissAttempt: onDismissAttempt)
    }

    private func requestClose() {
        JdOverlayDismissGate.apply($isPresented, reason: .close, onDismissAttempt: onDismissAttempt)
    }
}

// MARK: - 공용 헤더 행

struct JdDrawerHeader: View {
    let title: String
    let onClose: () -> Void

    var body: some View {
        HStack(spacing: JdToken.Space.s3) {
            Text(title)
                .jdFont(size: JdToken.FontSize.lg, weight: JdToken.FontWeight.semibold)
                .foregroundColor(JdToken.Color.foreground.color)
                .frame(maxWidth: .infinity, alignment: .leading)
            Button(action: onClose) {
                Image(systemName: "xmark")
                    .foregroundColor(JdToken.Color.muted.color)
            }
            .accessibilityLabel(Text("닫기"))
        }
    }
}
