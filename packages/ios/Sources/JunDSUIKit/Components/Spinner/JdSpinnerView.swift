import JunDSCore
import UIKit

// 웹 jd-spinner의 SVG 주기 — `animation: jd-spin 1s linear infinite`.
// JdToken.Duration 사다리(최대 0.5)에 없는 값이라 파일 상수로 1회만 기입한다(스펙 결손 보고 대상).
private let jdSpinnerPeriod: TimeInterval = 1

// 웹 jd-spinner 동형 — 시스템 UIActivityIndicatorView 스킨 우선(04 §10.1 "시스템 컨트롤 우선",
// 픽셀 동형은 목표가 아니다). 지름은 JdSpinnerSpec.side에 맞춰 스케일한다.
// ⚠️ JdSpinnerSpec.lineWidth는 자체 드로잉(SwiftUI JdSpinner) 전용이다 — 시스템 인디케이터는
//    선 두께를 노출하지 않아 UIKit 쪽에서 소비처가 없다.
//
// Reduce Motion: 웹은 주기만 늦추지만(1.6s) iOS는 04 §7.3에 따라 **정지**시키고 마지막
// 정지 프레임을 남긴다(hidesWhenStopped = false — 로딩 중이라는 사실은 사라지면 안 된다).
public final class JdSpinnerView: UIView {

    // 웹 aria-label 동형 — 기본값은 Core 스펙(JdSpinnerSpec.defaultLabel)
    public var label: String {
        didSet { accessibilityLabel = label }
    }

    // 회전 여부 — Reduce Motion 정지를 테스트/데모가 관측하는 표면
    public var isAnimating: Bool { indicator.isAnimating }

    private let indicator = UIActivityIndicatorView(style: .medium)
    private let spec: JdSpinnerSpec

    public init(
        size: JdDisplaySize = .md,
        label: String = JdSpinnerSpec.defaultLabel,
        color: JdDynamicColor = JdToken.Color.primary
    ) {
        self.label = label
        self.spec = JdSpinnerSpec.resolve(size: size)
        super.init(frame: .zero)

        indicator.hidesWhenStopped = false
        indicator.color = color.uiColor
        // 시스템 medium(20pt)을 스펙 지름으로 스케일 — 기준 지름은 상수가 아니라 실측값
        let base = indicator.intrinsicContentSize.width
        if base > 0 {
            let scale = spec.side / base
            indicator.transform = CGAffineTransform(scaleX: scale, y: scale)
        }

        addSubview(indicator)
        // 자체 레이아웃 DSL 사용 (04 §5 — 내부 표준)
        indicator.jd.layout {
            $0.center.equalToSuperview()
        }

        isAccessibilityElement = true
        // 웹 role=status의 iOS 번역 — 갱신되는 상태 표시기
        accessibilityTraits = .updatesFrequently
        accessibilityLabel = label

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(applyMotion),
            name: UIAccessibility.reduceMotionStatusDidChangeNotification,
            object: nil
        )
        applyMotion()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    // 웹 크기 축 동형 — 지름 정사각
    public override var intrinsicContentSize: CGSize {
        CGSize(width: spec.side, height: spec.side)
    }

    // MARK: 내부

    // JdMotion(Core)이 Reduce Motion의 단일 진입점이다 (04 §7.3) — 0을 돌려주면 정지.
    @objc private func applyMotion() {
        if JdMotion.duration(jdSpinnerPeriod) > 0 {
            indicator.startAnimating()
        } else {
            indicator.stopAnimating()
        }
    }
}
