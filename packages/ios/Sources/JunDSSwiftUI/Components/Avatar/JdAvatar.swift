import JunDSCore
import SwiftUI

// 웹 jd-avatar 동형 — 이미지 또는 이니셜 폴백 + 우하단 상태 도트 (DESIGN-2 §B2).
// 치수·색은 전부 JdAvatarSpec/JdToken에서 온다 — 렌더는 스펙이 준 숫자·색만 그린다 (04 §4.2 규칙 2).
//
// a11y: 이미지·이니셜·도트를 **하나의 요소로 합치고** 라벨 = name(비면 "아바타"),
// 상태는 문자열 조합이 아니라 accessibilityValue로 노출한다 (04 §7.1).
// 웹은 상태를 색으로만 표현해 AT에 아무것도 주지 않는다 — iOS가 보정하는 지점이다.
public struct JdAvatar: View {
    private let name: String
    private let image: Image?
    private let spec: JdAvatarSpec
    private let status: JdAvatarStatus?

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(
        name: String = "",
        image: Image? = nil,
        size: JdAvatarSize = .md,
        status: JdAvatarStatus? = nil
    ) {
        self.name = name
        self.image = image
        self.spec = JdAvatarSpec.resolve(size: size)
        self.status = status
    }

    public var body: some View {
        ZStack(alignment: .bottomTrailing) {
            content
            if let status {
                dot(status)
            }
        }
        .frame(width: spec.side, height: spec.side)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(name.isEmpty ? "아바타" : name))
        .accessibilityValue(Text(status.map(JdAvatar.statusText) ?? ""))
    }

    // MARK: 내용 — 이미지 우선, 없으면 이니셜 폴백

    @ViewBuilder
    private var content: some View {
        if let image {
            image
                .resizable()
                .scaledToFill()
                .frame(width: spec.side, height: spec.side)
                .clipShape(Circle())
        } else {
            Circle()
                .fill(JdToken.Color.borderLight.color)
                .overlay(initialsText)
                .frame(width: spec.side, height: spec.side)
        }
    }

    // 폴백은 배지 계열의 관용구(연한 표면 + 진한 동색 글자)를 따른다 —
    // 이름별 색 정체성은 JdAvatarSpec.fallbackColor가 결정한다(같은 이름 = 항상 같은 색).
    private var initialsText: some View {
        Text(initials)
            .font(
                JdSwiftUIFont.scaled(
                    size: spec.initialsFontSize,
                    weight: JdToken.FontWeight.semibold,
                    category: sizeCategory)
            )
            .foregroundColor(JdAvatarSpec.fallbackColor(for: name).color)
            .lineLimit(1)
            // Dynamic Type 확대 시 원 밖으로 넘치지 않게 — 원 지름은 스펙 고정 치수(장식 도형)
            .minimumScaleFactor(0.5)
    }

    // 웹은 이름이 없으면 "?"를 보여준다. Core의 initials는 순수 함수 계약 그대로
    // 공백만 있는 이름에 공백을 돌려주므로 렌더에서 다듬어 같은 폴백으로 보낸다.
    private var initials: String {
        let value = JdAvatarSpec.initials(from: name).trimmingCharacters(in: .whitespaces)
        return value.isEmpty ? "?" : value
    }

    // MARK: 상태 도트 — 웹의 화이트 링 동형(iOS는 아바타가 놓이는 표면 토큰으로 대체해 다크에서도 성립)

    private func dot(_ status: JdAvatarStatus) -> some View {
        Circle()
            .fill(JdAvatarSpec.statusColor(status).color)
            .frame(width: spec.statusDotSize, height: spec.statusDotSize)
            .overlay(
                Circle().strokeBorder(
                    JdToken.Color.card.color,
                    lineWidth: spec.statusRingWidth)
            )
    }

    // 상태명 표. DEC-010으로 UIKit 계층과 공유가 불가해 같은 표를 각각 둔다
    // (JdSwiftUIFont ↔ JdFontBridge 매핑 중복과 같은 선례).
    static func statusText(_ status: JdAvatarStatus) -> String {
        switch status {
        case .online: return "온라인"
        case .offline: return "오프라인"
        case .away: return "자리 비움"
        case .busy: return "다른 용무 중"
        }
    }
}
