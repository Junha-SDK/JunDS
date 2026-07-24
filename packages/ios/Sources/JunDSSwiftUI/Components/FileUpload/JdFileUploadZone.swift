import SwiftUI
import JunDSCore

// 웹 jd-file-upload 동형 — **피커는 만들지 않는다** (DESIGN-3 §B).
// 실제 선택은 소비자가 시스템 .fileImporter를 onTap에 붙여서 한다. 이 컴포넌트가 책임지는 것은
// 드롭존 외형(점선 테두리 + 아이콘 + 설명)과 선택된 파일 목록 표시뿐이다
// (04 §10 번역 원칙: 시스템 API가 이미 하는 일을 새 타입으로 감싸지 않는다).
public struct JdFileUploadZone: View {
    private let zoneDescription: String
    private let isError: Bool
    private let isControlEnabled: Bool
    private let fileNames: [String]
    private let onTap: () -> Void

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(description: String = "파일을 선택하세요",
                isError: Bool = false,
                isEnabled: Bool = true,
                fileNames: [String] = [],
                onTap: @escaping () -> Void) {
        self.zoneDescription = description
        self.isError = isError
        self.isControlEnabled = isEnabled
        self.fileNames = fileNames
        self.onTap = onTap
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: JdGap.sm.value) {
            Button(action: onTap) {
                VStack(spacing: JdToken.Space.s2) {
                    Image(systemName: "arrow.up.doc")
                        .font(JdSwiftUIFont.scaled(size: JdIconSize.xl.side,
                                                   weight: JdToken.FontWeight.normal,
                                                   category: sizeCategory))
                    Text(zoneDescription)
                        .font(JdSwiftUIFont.scaled(size: JdTextSpec.resolve(size: .sm).fontSize,
                                                   weight: JdToken.FontWeight.normal,
                                                   category: sizeCategory))
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, JdToken.Space.s6)
                .padding(.horizontal, JdToken.Space.s4)
            }
            .buttonStyle(JdFileUploadZoneStyle(isError: isError))
            .disabled(!isControlEnabled)
            .accessibilityLabel(Text(zoneDescription))

            if !fileNames.isEmpty {
                fileList
            }
        }
    }

    // MARK: - 선택된 파일 목록 (표시 전용 — 삭제 동작은 이 컴포넌트의 표면이 아니다)

    private var fileList: some View {
        VStack(alignment: .leading, spacing: JdToken.Space.s1) {
            ForEach(fileNames, id: \.self) { name in
                HStack(spacing: JdToken.Space.s1_5) {
                    Image(systemName: "doc")
                    Text(name)
                        .lineLimit(1)
                }
                .font(JdSwiftUIFont.scaled(size: JdTextSpec.resolve(size: .xs).fontSize,
                                           weight: JdToken.FontWeight.normal,
                                           category: sizeCategory))
                .foregroundColor(JdToken.Color.muted.color)
            }
        }
    }
}

/// 점선 테두리 드롭존 — 대시 길이는 토큰(Space.s1 = 4)에서 파생한다(전용 치수 신설 금지).
struct JdFileUploadZoneStyle: ButtonStyle {
    let isError: Bool

    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    func makeBody(configuration: Configuration) -> some View {
        let shape = RoundedRectangle(cornerRadius: JdToken.Radius.xl, style: .continuous)
        let background = configuration.isPressed ? JdToken.Color.cardHover : JdToken.Color.card
        return configuration.label
            .foregroundColor(JdToken.Color.muted.color)
            .background(background.color)
            .clipShape(shape)
            .overlay(
                shape.strokeBorder(
                    (isError ? JdToken.Color.danger : JdToken.Color.border).color,
                    style: StrokeStyle(lineWidth: JdToken.Border.thin,
                                       dash: [JdToken.Space.s1, JdToken.Space.s1])
                )
            )
            .contentShape(shape)
            .opacity(isEnabled ? 1 : JdToken.Opacity.o50)
            .animation(reduceMotion ? nil : .easeOut(duration: JdToken.Duration.fast),
                       value: configuration.isPressed)
    }
}
