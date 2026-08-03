import JunDSCore
import SwiftUI

// 웹 jd-modal의 SwiftUI 번역: 시스템 시트 위임 (04 §10).
// persistent = interactiveDismissDisabled (웹: 백드롭 클릭 무시, DEC-012-4)
public extension View {
    func jdModal<Content: View>(
        isPresented: Binding<Bool>,
        size: JdModalSize = .md,
        persistent: Bool = false,
        onClose: (() -> Void)? = nil,
        @ViewBuilder content: @escaping () -> Content
    ) -> some View {
        return sheet(isPresented: isPresented, onDismiss: onClose) {
            JdModalChrome(size: size, persistent: persistent, content: content)
        }
    }
}

struct JdModalChrome<Content: View>: View {
    let size: JdModalSize
    let persistent: Bool
    @ViewBuilder let content: () -> Content

    private var detents: Set<PresentationDetent> {
        if size == .lg { return [.large] }
        return [.medium, .large]
    }

    var body: some View {
        content()
            .padding(JdToken.Space.s5)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .background(JdToken.Color.card.color.ignoresSafeArea())
            .presentationDetents(detents)
            .presentationDragIndicator(persistent ? .hidden : .visible)
            .interactiveDismissDisabled(persistent)
    }
}
