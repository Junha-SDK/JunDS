import JunDSCore
import UIKit

// 웹 jd-avatar 동형 — 이미지 또는 이니셜 폴백 + 우하단 상태 도트 (DESIGN-2 §B2).
// 치수·색은 전부 JdAvatarSpec/JdToken에서 온다 (04 §4.2 규칙 2).
//
// a11y: 자기 자신이 유일한 접근성 요소다(자식은 트리에서 가려진다) — 라벨 = name(비면 "아바타"),
// 상태는 문자열 조합 없이 accessibilityValue로 (04 §7.1). 웹은 상태를 색으로만 표현해
// AT에 아무것도 주지 않는다 — iOS가 보정하는 지점이다.
public final class JdAvatarView: UIView {

    // 웹 name attribute 동형 — 이니셜·폴백 색·접근성 라벨의 단일 입력
    public var name: String {
        didSet { applyContent() }
    }

    // 웹 src attribute 동형 — 있으면 이미지, 없으면 이니셜 폴백
    public var image: UIImage? {
        didSet { applyContent() }
    }

    // 웹 status attribute 동형 — nil이면 도트 자체가 없다(웹의 dot.remove() 등가)
    public var status: JdAvatarStatus? {
        didSet { applyStatus() }
    }

    public let avatarSize: JdAvatarSize

    // 테스트 어서션 지원 (04 §8.2)
    let imageView = UIImageView()
    let initialsLabel = UILabel()
    let statusDot = UIView()

    private let spec: JdAvatarSpec

    public init(
        name: String = "",
        image: UIImage? = nil,
        size: JdAvatarSize = .md,
        status: JdAvatarStatus? = nil
    ) {
        self.name = name
        self.image = image
        self.avatarSize = size
        self.status = status
        self.spec = JdAvatarSpec.resolve(size: size)
        super.init(frame: .zero)

        // 원형 배경은 뷰 자체가 그린다 — clipsToBounds를 켜면 모서리에 걸친 상태 도트가 잘린다
        layer.cornerRadius = spec.side / 2
        clipsToBounds = false

        imageView.contentMode = .scaleAspectFill
        imageView.clipsToBounds = true
        imageView.layer.cornerRadius = spec.side / 2

        initialsLabel.textAlignment = .center
        initialsLabel.adjustsFontForContentSizeCategory = true
        // 원 지름은 스펙 고정 치수(장식 도형)라 XXXL에서 글자만 줄여 넘침을 막는다
        initialsLabel.adjustsFontSizeToFitWidth = true
        initialsLabel.minimumScaleFactor = 0.5

        statusDot.layer.cornerRadius = spec.statusDotSize / 2
        statusDot.layer.borderWidth = spec.statusRingWidth

        addSubview(imageView)
        addSubview(initialsLabel)
        addSubview(statusDot)

        // 자체 레이아웃 DSL 사용 (04 §5 — 내부 표준)
        imageView.jd.layout {
            $0.edges.equalToSuperview()
        }
        initialsLabel.jd.layout {
            $0.center.equalToSuperview()
            $0.leading.greaterThanOrEqualToSuperview().inset(JdToken.Space.s1)
        }
        statusDot.jd.layout {
            $0.trailing.bottom.equalToSuperview()
            $0.size.equal(CGSize(width: spec.statusDotSize, height: spec.statusDotSize))
        }

        isAccessibilityElement = true

        applyContent()
        applyStatus()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    // 웹 --_jd-avatar-size 동형 — 정사각 고정
    public override var intrinsicContentSize: CGSize {
        CGSize(width: spec.side, height: spec.side)
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 CGColor(링)와 스케일 폰트는 수동 재적용
        applyContent()
        applyStatus()
    }

    // MARK: 내부

    private func applyContent() {
        let hasImage = image != nil
        imageView.image = image
        imageView.isHidden = !hasImage
        initialsLabel.isHidden = hasImage

        // 폴백은 배지 계열의 관용구(연한 표면 + 진한 동색 글자)를 따른다 —
        // 이름별 색 정체성은 JdAvatarSpec.fallbackColor가 결정한다(같은 이름 = 항상 같은 색).
        backgroundColor = hasImage ? nil : JdToken.Color.borderLight.uiColor
        initialsLabel.text = initials
        initialsLabel.textColor = JdAvatarSpec.fallbackColor(for: name).uiColor
        initialsLabel.font = JdFontBridge.scaledFont(
            size: spec.initialsFontSize,
            weight: JdToken.FontWeight.semibold,
            compatibleWith: traitCollection)

        accessibilityLabel = name.isEmpty ? "아바타" : name
    }

    // 웹은 이름이 없으면 "?"를 보여준다. Core의 initials는 순수 함수 계약 그대로
    // 공백만 있는 이름에 공백을 돌려주므로 렌더에서 다듬어 같은 폴백으로 보낸다.
    private var initials: String {
        let value = JdAvatarSpec.initials(from: name).trimmingCharacters(in: .whitespaces)
        return value.isEmpty ? "?" : value
    }

    private func applyStatus() {
        guard let status else {
            statusDot.isHidden = true
            accessibilityValue = nil
            return
        }
        statusDot.isHidden = false
        statusDot.backgroundColor = JdAvatarSpec.statusColor(status).uiColor
        // 웹의 화이트 링 동형 — iOS는 아바타가 놓이는 표면 토큰으로 대체해 다크에서도 성립
        statusDot.layer.borderColor =
            JdToken.Color.card.uiColor
            .resolvedColor(with: traitCollection).cgColor
        accessibilityValue = JdAvatarView.statusText(status)
    }

    // 상태명 표. DEC-010으로 SwiftUI 계층과 공유가 불가해 같은 표를 각각 둔다
    // (JdFontBridge ↔ JdSwiftUIFont 매핑 중복과 같은 선례).
    static func statusText(_ status: JdAvatarStatus) -> String {
        switch status {
        case .online: return "온라인"
        case .offline: return "오프라인"
        case .away: return "자리 비움"
        case .busy: return "다른 용무 중"
        }
    }
}
