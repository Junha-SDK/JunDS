import JunDSCore
import SwiftUI

// 웹 jd-mark 동형 — 형광펜 강조 (DESIGN-3 §C).
// 배경형(기본)과 밑줄형 두 표면이고, 밑줄형은 배경 없이 밑줄 색만 팔레트를 따른다(웹 동형).
public struct JdMark: View {
    private let text: String
    private let color: JdMarkColor
    private let underline: Bool

    public init(_ text: String, color: JdMarkColor = .yellow, underline: Bool = false) {
        self.text = text
        self.color = color
        self.underline = underline
    }

    // 폰트를 고정하지 않는다 — 텍스트 런은 둘러싼 문단의 서체를 상속한다(웹 inline 동형).
    public var body: some View {
        if underline {
            // 웹: padding 0 · background transparent · color inherit · 밑줄만 팔레트 색
            // (SwiftUI Text는 밑줄 두께를 노출하지 않는다 — 웹 2px는 근사, notes 보고분)
            Text(text)
                .underline(true, color: JdMarkPalette.foreground(color).color)
        } else {
            Text(text)
                .foregroundColor(JdMarkPalette.foreground(color).color)
                .padding(.horizontal, JdToken.Space.s0_5)  // 웹 padding-inline: var(--jd-space-0-5)
                .background(JdMarkPalette.background(color).color)
                .clipShape(RoundedRectangle(cornerRadius: JdToken.Radius.sm, style: .continuous))
        }
    }
}

// 형광펜 팔레트 — UIKit 계층(JdMarkView)에 동형 사본이 있다(DEC-010으로 공유 불가).
//
// ⚠️ Core에 JdMarkSpec이 없다. 웹은 Tailwind 200/70·900 리터럴을 쓰지만 "스펙에 없는 색은
//    만들지 않는다"는 규칙에 따라 **리터럴을 신설하지 않고** Core JdTagSpec 팔레트를 재사용한다.
//    green/blue/purple은 동명 색이고 yellow→orange · pink→red는 인접 색상 근사다.
//    정확한 형광펜 값이 필요하면 Core에 JdMarkSpec을 추가해야 한다(notes 보고분).
enum JdMarkPalette {
    static func tagColor(_ color: JdMarkColor) -> JdTagColor {
        switch color {
        case .yellow: return .orange
        case .green: return .green
        case .blue: return .blue
        case .pink: return .red
        case .purple: return .purple
        }
    }

    static func background(_ color: JdMarkColor) -> JdDynamicColor {
        JdTagSpec.resolve(color: tagColor(color)).background
    }

    static func foreground(_ color: JdMarkColor) -> JdDynamicColor {
        JdTagSpec.resolve(color: tagColor(color)).foreground
    }
}
