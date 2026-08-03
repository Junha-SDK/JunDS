import JunDSCore
import SwiftUI

// 웹 jd-tag 동형 — 태그/칩 (DESIGN-2 §B2).
// 웹은 closable 어트리뷰트 + jd-remove 사후 통지지만, iOS는 콜백 유무가 곧 닫기 버튼 유무다
// (removal 자체는 소비자 몫 — 목록 상태는 앱이 소유한다는 웹 계약 그대로).
public struct JdTag: View {

    /// 웹 닫기 버튼 aria-label 리터럴 — 3플랫폼 동일 문자열 (04 §3 규칙 1)
    static let removeLabel = "삭제"

    private let text: String
    private let spec: JdTagSpec
    private let onRemove: (() -> Void)?

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(
        _ text: String,
        color: JdTagColor = .gray,
        onRemove: (() -> Void)? = nil
    ) {
        self.text = text
        self.spec = JdTagSpec.resolve(color: color)
        self.onRemove = onRemove
    }

    public var body: some View {
        HStack(spacing: spec.gap) {
            Text(text)
                .font(
                    JdSwiftUIFont.scaled(
                        size: spec.fontSize,
                        weight: spec.fontWeight,
                        category: sizeCategory)
                )
                .lineLimit(1)  // 웹 white-space: nowrap
            if let onRemove {
                removeButton(onRemove)
            }
        }
        .foregroundColor(spec.foreground.color)
        .padding(.horizontal, spec.hPadding)
        .padding(.vertical, spec.vPadding)
        .background(spec.background.color)
        .clipShape(RoundedRectangle(cornerRadius: spec.radius, style: .continuous))
    }

    // MARK: 내부

    // ⚠️ 접근성 각주: 웹 승계 아이콘 12pt라 히트 타깃이 HIG 44pt에 크게 못 미친다.
    //    표면(크기)은 패리티 때문에 유지 — 삭제가 잦은 화면이면 소비자가 별도 액션을 제공한다.
    private func removeButton(_ action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: "xmark")
                .font(
                    JdSwiftUIFont.scaled(
                        size: spec.closeIconSize,
                        weight: JdToken.FontWeight.semibold,
                        category: sizeCategory))
        }
        .buttonStyle(.plain)  // 웹 background: transparent; color: inherit
        .accessibilityLabel(Text(Self.removeLabel))
    }
}
