import JunDSCore
import SwiftUI

// 웹 jd-theme-tag-list 동형 — 해시태그 칩 줄. (DEC-047)
//
// 배치를 스스로 소유한다: 칩 개수가 런타임에 정해지므로 폭에 맞춰 흘리고 넘치면 다음 줄로
// 간다. SwiftUI는 JdFlowLayout(실컴포넌트), UIKit은 JdWrapView가 같은 일을 한다.
//
// 색은 회전 팔레트다 — 인덱스가 색을 정하므로 같은 목록이 두 플랫폼에서 같은 색을 낸다.
public struct JdThemeTagList: View {
    private let themes: [String]
    private let spacing: CGFloat
    private let onSelect: ((String) -> Void)?

    public init(
        themes: [String],
        spacing: CGFloat = JdToken.Space.s1_5,
        onSelect: ((String) -> Void)? = nil
    ) {
        self.themes = themes
        self.spacing = spacing
        self.onSelect = onSelect
    }

    public var body: some View {
        JdFlowLayout(spacing: spacing) {
            ForEach(Array(themes.enumerated()), id: \.offset) { index, theme in
                chip(theme, index: index)
            }
        }
    }

    @ViewBuilder
    private func chip(_ theme: String, index: Int) -> some View {
        let view = JdThemeChip(theme: theme, index: index)
        if let onSelect {
            Button {
                onSelect(theme)
            } label: {
                view
            }
            .buttonStyle(.plain)
            // 칩은 링크처럼 동작한다 — 웹은 실제 <a href>다
            .accessibilityAddTraits(.isLink)
        } else {
            view
        }
    }
}

/// 칩 하나. 목록 밖에서 단독으로도 쓸 수 있게 public이다.
public struct JdThemeChip: View {
    private let theme: String
    private let spec: JdThemeChipSpec

    @Environment(\.sizeCategory) private var sizeCategory

    public init(theme: String, index: Int = 0) {
        self.theme = theme
        self.spec = JdThemeChipSpec.resolve(index: index)
    }

    public var body: some View {
        HStack(spacing: spec.gap) {
            // "#"는 장식이라 한 단 옅다 — 낭독에서는 빼서 "샵"이 읽히지 않게 한다
            Text("#").opacity(spec.prefixOpacity)
            Text(theme)
        }
        .font(
            JdSwiftUIFont.scaled(
                size: spec.fontSize,
                weight: spec.fontWeight,
                category: sizeCategory)
        )
        .foregroundColor(spec.foreground.color)
        .padding(.horizontal, spec.hPadding)
        .padding(.vertical, spec.vPadding)
        .background(spec.background.color)
        .clipShape(Capsule())
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(theme))
    }
}
