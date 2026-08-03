import JunDSCore
import UIKit

// 웹 jd-position-bar 동형 — 구간 대비 현재 위치 막대. (DEC-041)
//
// 좌표는 Core(JdPositionBarGeometry)가 클램프까지 마쳐서 주고, 여기서는 놓기만 한다
// (04 §4.2 규칙 1 — 두 렌더 계층이 같은 산수를 각자 구현하면 어긋난다).
//
// 마커(12pt)가 트랙(8pt)보다 크므로 **트랙만 클립**한다. 트랙을 이 뷰 자신으로 두고
// masksToBounds를 켜면 마커가 잘린다 — 그래서 트랙이 별도 서브뷰다.
public final class JdPositionBarView: UIView {

    /// 구간 하단 (0~1)
    public var low: Double { didSet { setNeedsLayout(); applyContent() } }
    /// 구간 상단 (0~1)
    public var high: Double { didSet { setNeedsLayout(); applyContent() } }
    /// 현재 위치 (0~1)
    public var cur: Double { didSet { setNeedsLayout(); applyContent() } }

    public var tone: JdPositionBarTone {
        didSet { resolveAndApply() }
    }

    // 테스트 표면 (@testable) — 공개 API는 아니다 (04 §8.2)
    let track = UIView()
    let band = UIView()
    let fill = UIView()
    let marker = UIView()

    private var spec: JdPositionBarSpec

    public init(low: Double, high: Double, cur: Double, tone: JdPositionBarTone = .up) {
        self.low = low
        self.high = high
        self.cur = cur
        self.tone = tone
        self.spec = JdPositionBarSpec.resolve(tone: tone)
        super.init(frame: .zero)

        for view in [track, band, fill, marker] {
            view.isUserInteractionEnabled = false
        }
        // 트랙만 클립 — 밴드·채움의 둥근 끝이 트랙 안에 갇히고, 마커는 밖에 남는다
        track.layer.masksToBounds = true
        track.addSubview(band)
        track.addSubview(fill)
        addSubview(track)
        addSubview(marker)

        resolveAndApply()
    }

    required public init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    /// 마커가 트랙보다 크므로 전체 높이는 마커 기준이다
    public override var intrinsicContentSize: CGSize {
        CGSize(width: UIView.noIntrinsicMetric, height: spec.markerHeight)
    }

    /// 웹 v2는 순수 장식 div였다(대체 텍스트 0) — v3가 얹은 낭독을 iOS도 따른다
    public override var isAccessibilityElement: Bool {
        get { true }
        set { super.isAccessibilityElement = newValue }
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        let w = bounds.width
        let geo = JdPositionBarGeometry.layout(low: low, high: high, cur: cur)

        // 트랙은 세로 중앙 — 마커가 더 커서 위아래로 튀어나온다
        let trackY = (bounds.height - spec.trackHeight) / 2
        track.frame = CGRect(x: 0, y: trackY, width: w, height: spec.trackHeight)
        track.layer.cornerRadius = spec.trackHeight / 2

        band.frame = CGRect(
            x: w * CGFloat(geo.bandStart / 100), y: 0,
            width: w * CGFloat(geo.bandWidth / 100), height: spec.trackHeight)
        fill.frame = CGRect(
            x: w * CGFloat(geo.fillStart / 100), y: 0,
            width: w * CGFloat(geo.fillWidth / 100), height: spec.trackHeight)
        band.layer.cornerRadius = spec.trackHeight / 2
        fill.layer.cornerRadius = spec.trackHeight / 2

        // 웹과 같이 정중앙(50%) 고정 — cur이 아니라 기준선이다
        marker.frame = CGRect(
            x: w / 2 - spec.markerWidth / 2,
            y: (bounds.height - spec.markerHeight) / 2,
            width: spec.markerWidth,
            height: spec.markerHeight)
        marker.layer.cornerRadius = spec.markerWidth / 2
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        applyStyle()
    }

    // MARK: 내부

    private func resolveAndApply() {
        spec = JdPositionBarSpec.resolve(tone: tone)
        applyStyle()
        applyContent()
        invalidateIntrinsicContentSize()
        setNeedsLayout()
    }

    private func applyStyle() {
        track.backgroundColor = spec.trackColor.uiColor
        band.backgroundColor = spec.bandColor.uiColor
        fill.backgroundColor = spec.fillColor.uiColor
        marker.backgroundColor = spec.markerColor.uiColor
    }

    private func applyContent() {
        accessibilityTraits.insert(.image)
        accessibilityLabel = JdPositionBarGeometry.accessibilityText(low: low, high: high, cur: cur)
    }
}
