import SwiftUI
import UIKit
import JunDSCore

// 웹 jd-copy-button 동형 — 복사는 시스템 API(UIPasteboard)가 하고 컴포넌트는 버튼만 얇게
// 얹는다 (DESIGN-3 §B, 04 §10 번역 원칙: 시스템이 이미 하는 일을 새 타입으로 감싸지 않는다).
// 시스템 UIKit import는 허용된다 — 금지는 자체 타겟 간 의존뿐(DEC-010).
//
// a11y: 웹은 라벨 교체만으로 성공을 알렸지만 iOS는 포커스가 버튼에 있어도 라벨 변경이
//       자동 낭독되지 않는다 → JdAnnouncer로 보정한다(04 §7.1).
public struct JdCopyButton: View {
    private let text: String
    private let label: String
    private let copiedLabel: String
    private let spec: JdButtonSpec

    @State private var isCopied = false
    @State private var resetTask: Task<Void, Never>?

    /// 웹 동형의 복귀 지연. 토큰 사다리(Duration.slower = 0.5s)의 바깥 값이라
    /// DESIGN-3 §B에 명시된 2초를 그대로 상수로 둔다 — 토큰 신설은 하지 않는다.
    private static let copiedDuration: TimeInterval = 2

    public init(_ text: String,
                label: String = "복사",
                copiedLabel: String = "복사됨",
                variant: JdButtonVariant = .secondary,
                size: JdControlSize = .md) {
        self.text = text
        self.label = label
        self.copiedLabel = copiedLabel
        self.spec = JdButtonSpec.resolve(variant: variant, size: size)
    }

    public var body: some View {
        Button {
            copy()
        } label: {
            HStack(spacing: JdToken.Space.s2) {
                Image(systemName: isCopied ? "checkmark" : "doc.on.doc")
                Text(isCopied ? copiedLabel : label)
            }
        }
        .buttonStyle(JdButtonPressStyle(spec: spec))
        .accessibilityLabel(Text(isCopied ? copiedLabel : label))
    }

    private func copy() {
        UIPasteboard.general.string = text
        isCopied = true
        // 복사 성공은 시각 신호(체크)만으로는 AT에 닿지 않는다
        JdAnnouncer.announce(copiedLabel)

        // 연타 시 이전 복귀 예약을 취소한다 — 타이머는 항상 취소 가능해야 한다
        resetTask?.cancel()
        resetTask = Task { @MainActor in
            let nanoseconds = UInt64(Self.copiedDuration * 1_000_000_000)
            try? await Task.sleep(nanoseconds: nanoseconds)
            guard !Task.isCancelled else { return }
            isCopied = false
        }
    }
}
