import SwiftUI
import UIKit
import JunDSCore

// 웹 jd-textarea 동형 — 다행 입력 (DESIGN-2 §B1). TextEditor 기반.
// 웹 error는 메시지 없는 boolean이다(jd-text-field의 메시지 문자열과 표면이 다름 — v2 실태).
// 웹은 aria-invalid를 달지 않아 AT가 오류를 알 수 없다 — iOS는 accessibilityValue("오류")로
// 보정한다(계약 명시). 카운터는 웹과 같이 시각 배지이므로 접근성에서 제외한다.
public struct JdTextarea: View {
    @Binding private var text: String
    private let placeholder: String
    private let rows: Int
    private let maxLength: Int
    private let isError: Bool
    private let showsCount: Bool
    private let spec: JdTextareaSpec

    @FocusState private var isFocused: Bool
    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.sizeCategory) private var sizeCategory

    /// TextEditor 내부 UITextView의 기본 여백 — 플레이스홀더를 본문과 같은 자리에 두려면
    /// 이 값만큼 더 밀어야 한다. 리터럴 대신 시스템 기본값을 실측해 쓴다.
    private static let editorInset: (horizontal: CGFloat, vertical: CGFloat) = {
        let probe = UITextView()
        return (probe.textContainer.lineFragmentPadding, probe.textContainerInset.top)
    }()

    public init(text: Binding<String>,
                placeholder: String = "",
                rows: Int = 4,
                maxLength: Int = 0,
                isError: Bool = false,
                showsCount: Bool = false) {
        self._text = text
        self.placeholder = placeholder
        self.rows = rows
        self.maxLength = maxLength
        self.isError = isError
        self.showsCount = showsCount
        self.spec = JdTextareaSpec.resolve()
    }

    public var body: some View {
        let shape = RoundedRectangle(cornerRadius: spec.radius, style: .continuous)
        ZStack(alignment: .topLeading) {
            if text.isEmpty, !placeholder.isEmpty {
                Text(placeholder)
                    .font(font)
                    .foregroundColor(JdToken.Color.mutedLight.color)
                    .padding(.horizontal, spec.hPadding + Self.editorInset.horizontal)
                    .padding(.vertical, spec.vPadding + Self.editorInset.vertical)
                    .allowsHitTesting(false)
                    .accessibilityHidden(true)
            }
            TextEditor(text: boundedText)
                .focused($isFocused)
                .font(font)
                .foregroundColor(JdToken.Color.foreground.color)
                .scrollContentBackground(.hidden)
                .padding(.horizontal, spec.hPadding)
                .padding(.vertical, spec.vPadding)
                .accessibilityValue(Text(isError ? "오류" : ""))
        }
        .frame(minHeight: minHeight, alignment: .topLeading)
        .background(JdToken.Color.card.color)
        .clipShape(shape)
        .overlay(shape.strokeBorder(borderColor, lineWidth: JdToken.Border.thin))
        .overlay(alignment: .bottomTrailing) {
            if showsCount, maxLength > 0 {
                Text("\(text.count)/\(maxLength)")
                    .font(JdSwiftUIFont.scaled(size: spec.countFontSize,
                                               weight: JdToken.FontWeight.normal,
                                               category: sizeCategory))
                    // muted-light는 AA 미달 → muted (웹 DEC-027 동형)
                    .foregroundColor(JdToken.Color.muted.color)
                    .padding(.trailing, JdToken.Space.s3)
                    .padding(.bottom, JdToken.Space.s2)
                    .allowsHitTesting(false)
                    .accessibilityHidden(true)
            }
        }
        .opacity(isEnabled ? 1 : JdToken.Opacity.o40) // 웹 :disabled opacity-40
    }

    // MARK: - 파생 값

    private var font: Font {
        JdSwiftUIFont.scaled(size: spec.fontSize,
                             weight: JdToken.FontWeight.normal,
                             category: sizeCategory)
    }

    private var borderColor: Color {
        if isError { return JdToken.Color.danger.color }
        if isFocused { return JdToken.Color.primary.color }
        return JdToken.Color.border.color
    }

    /// 웹 rows 동형 — 행 수 × 기본 행간이 스펙 최소 높이보다 크면 그쪽을 쓴다
    private var minHeight: CGFloat {
        let lineHeight = spec.fontSize * JdToken.LineHeight.normal
        return max(spec.minHeight, CGFloat(max(rows, 0)) * lineHeight + spec.vPadding * 2)
    }

    /// 웹 maxlength 동형 — 초과 입력을 잘라낸다(프로그램 대입은 네이티브처럼 제한하지 않는다)
    private var boundedText: Binding<String> {
        let limit = maxLength
        return Binding(get: { self.text },
                       set: { newValue in
                           self.text = limit > 0 ? String(newValue.prefix(limit)) : newValue
                       })
    }
}
