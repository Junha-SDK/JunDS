import JunDSCore
import SwiftUI

// 웹 jd-bottom-sheet의 SwiftUI 번역: 시스템 시트 위임 + detent (04 §10.1).
// draggable=true가 웹 Sheet 별칭의 실체(끌어 닫기 허용) — 그래버 표시 + 인터랙티브 닫기 허용.
// persistent / !draggable → interactiveDismissDisabled로 인터랙티브 닫기 차단.
// onDismissAttempt(cancelable veto)는 JdOverlayDismissGate(JdDrawer.swift 정의)로 바인딩을 게이트.
public struct JdBottomSheet<Content: View>: View {

    @Binding private var isPresented: Bool
    private let size: JdOverlaySize
    private let draggable: Bool
    private let persistent: Bool
    private let onDismissAttempt: ((JdDismissReason) -> Bool)?
    private let content: () -> Content

    public init(
        isPresented: Binding<Bool>,
        size: JdOverlaySize = .md,
        draggable: Bool = true,
        persistent: Bool = false,
        onDismissAttempt: ((JdDismissReason) -> Bool)? = nil,
        @ViewBuilder content: @escaping () -> Content
    ) {
        self._isPresented = isPresented
        self.size = size
        self.draggable = draggable
        self.persistent = persistent
        self.onDismissAttempt = onDismissAttempt
        self.content = content
    }

    // 시스템이 닫으려 바인딩을 false로 쓸 때 게이트를 통과시킨다(웹 jd-request-close 등가).
    // interactiveDismissDisabled가 먼저 막는 경우 외의 경로에 대한 veto 보정.
    private var gatedBinding: Binding<Bool> {
        Binding(
            get: { isPresented },
            set: { newValue in
                if newValue {
                    isPresented = true
                } else {
                    JdOverlayDismissGate.apply(
                        $isPresented, reason: .backdrop,
                        onDismissAttempt: onDismissAttempt)
                }
            }
        )
    }

    public var body: some View {
        // 배치 슬롯을 차지하지 않는 앵커 — 시트는 시스템 레이어에 뜬다(웹 오버레이 동형).
        Color.clear
            .sheet(isPresented: gatedBinding) {
                JdBottomSheetChrome(
                    size: size, draggable: draggable,
                    persistent: persistent, content: content)
            }
    }
}

// 시트 콘텐츠 크롬 — Modal 정본(JdModalChrome)과 동형. detent만 sheetHeight 기반.
struct JdBottomSheetChrome<Content: View>: View {
    let size: JdOverlaySize
    let draggable: Bool
    let persistent: Bool
    @ViewBuilder let content: () -> Content

    private var detents: Set<PresentationDetent> {
        // full은 높이가 무한 프리셋이라 .large로 번역(04 §10.1 — px는 참고치)
        if size == .full { return [.large] }
        return [.height(size.sheetHeight)]
    }

    var body: some View {
        content()
            .padding(JdToken.Space.s5)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .background(JdToken.Color.card.color.ignoresSafeArea())
            .presentationDetents(detents)
            .presentationDragIndicator(draggable ? .visible : .hidden)
            .interactiveDismissDisabled(persistent || !draggable)
    }
}
