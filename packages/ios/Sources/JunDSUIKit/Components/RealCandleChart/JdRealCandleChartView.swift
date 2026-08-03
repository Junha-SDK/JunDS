import JunDSCore
import UIKit

// 웹 RealCandleChart 동형 — 출처 배지 + 신선도 + 캔들 차트. (DEC-049)
//
// 웹은 fetch·폴링·포커스 재조회까지 안은 라이브 래퍼다. iOS는 네트워크 없이 **데이터를
// 인자로 받는 뷰**다(라이브 배선은 후속 — DEC-019와 같은 주입 계약). "Yahoo에서 보기"
// 외부 링크도 앱 내비게이션의 몫이라 옮기지 않았다.
public final class JdRealCandleChartView: UIView {

    /// 비수치 봉은 대입 시점에 걸러진다(JdCandleChartView가 거른다)
    public var candles: [JdCandle] {
        didSet {
            chartView.candles = candles
            applyHeader()
        }
    }

    public var source: JdRealCandleSource {
        didSet { applyHeader() }
    }

    /// 라이브 배지 문구 — 앱이 데이터 출처를 넣는다(웹 "Yahoo Finance · 실시간" 대응)
    public var liveLabel: String {
        didSet { applyHeader() }
    }

    /// 봉 수 캡션의 기간·간격 문구("3mo" · "1d"). 라이브 소스일 때만 보인다(웹 동형)
    public var rangeLabel: String? {
        didSet { applyHeader() }
    }

    public var intervalLabel: String? {
        didSet { applyHeader() }
    }

    /// 마지막 갱신 후 경과 초. nil이면 신선도 배지가 숨는다.
    /// 주기 재계산(웹 5초 타이머)은 라이브 배선의 몫이라 값 주입이다.
    public var secondsSinceUpdate: Int? {
        didSet { applyHeader() }
    }

    public var markers: [JdCandleMarkerLine] {
        didSet { chartView.markers = markers }
    }

    // 테스트 표면 (@testable) — 공개 API는 아니다 (04 §8.2)
    let chartView: JdCandleChartView
    let badgeLabel = UILabel()
    let captionLabel = UILabel()
    let freshnessLabel = UILabel()

    private let badgeDot = UIView()
    private let freshnessDot = UIView()
    private let badgeContainer = UIView()
    private let rootStack: JdStackView

    public init(
        candles: [JdCandle],
        source: JdRealCandleSource,
        liveLabel: String = "실시간",
        rangeLabel: String? = nil,
        intervalLabel: String? = nil,
        secondsSinceUpdate: Int? = nil,
        markers: [JdCandleMarkerLine] = [],
        width: CGFloat = 1280,
        height: CGFloat = 540,
        label: String? = nil
    ) {
        self.candles = JdCandleChartLayout.sanitize(candles)
        self.source = source
        self.liveLabel = liveLabel
        self.rangeLabel = rangeLabel
        self.intervalLabel = intervalLabel
        self.secondsSinceUpdate = secondsSinceUpdate
        self.markers = markers
        self.chartView = JdCandleChartView(
            candles: candles,
            width: width,
            height: height,
            markers: markers,
            showsVolume: true,
            label: label)
        self.rootStack = JdStackView(axis: .vertical, gap: .sm, alignment: .leading)
        super.init(frame: .zero)

        // 배지 — 점 + 문구를 알약 컨테이너에 담는다
        badgeDot.translatesAutoresizingMaskIntoConstraints = false
        badgeDot.layer.cornerRadius = 3
        badgeLabel.adjustsFontForContentSizeCategory = true
        badgeLabel.translatesAutoresizingMaskIntoConstraints = false
        badgeContainer.addSubview(badgeDot)
        badgeContainer.addSubview(badgeLabel)
        NSLayoutConstraint.activate([
            badgeDot.widthAnchor.constraint(equalToConstant: 6),
            badgeDot.heightAnchor.constraint(equalToConstant: 6),
            badgeDot.leadingAnchor.constraint(
                equalTo: badgeContainer.leadingAnchor, constant: JdToken.Space.s2),
            badgeDot.centerYAnchor.constraint(equalTo: badgeContainer.centerYAnchor),
            badgeLabel.leadingAnchor.constraint(equalTo: badgeDot.trailingAnchor, constant: 6),
            badgeLabel.trailingAnchor.constraint(
                equalTo: badgeContainer.trailingAnchor, constant: -JdToken.Space.s2),
            badgeLabel.topAnchor.constraint(
                equalTo: badgeContainer.topAnchor, constant: JdToken.Space.s1),
            badgeLabel.bottomAnchor.constraint(
                equalTo: badgeContainer.bottomAnchor, constant: -JdToken.Space.s1),
        ])

        captionLabel.adjustsFontForContentSizeCategory = true
        freshnessLabel.adjustsFontForContentSizeCategory = true
        freshnessDot.translatesAutoresizingMaskIntoConstraints = false
        freshnessDot.layer.cornerRadius = 3
        NSLayoutConstraint.activate([
            freshnessDot.widthAnchor.constraint(equalToConstant: 6),
            freshnessDot.heightAnchor.constraint(equalToConstant: 6),
        ])

        let freshnessStack = JdStackView.horizontal(
            gap: .xs, [freshnessDot, freshnessLabel])
        let headerStack = JdStackView.horizontal(
            gap: .sm, [badgeContainer, captionLabel, freshnessStack])
        rootStack.addArrangedSubview(headerStack)
        rootStack.addArrangedSubview(chartView)
        rootStack.translatesAutoresizingMaskIntoConstraints = false
        addSubview(rootStack)
        NSLayoutConstraint.activate([
            rootStack.topAnchor.constraint(equalTo: topAnchor),
            rootStack.leadingAnchor.constraint(equalTo: leadingAnchor),
            rootStack.trailingAnchor.constraint(lessThanOrEqualTo: trailingAnchor),
            rootStack.bottomAnchor.constraint(equalTo: bottomAnchor),
        ])

        applyHeader()
    }

    required public init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        // 알약 반경은 높이의 절반 — Dynamic Type에서 모양이 유지된다
        badgeContainer.layer.cornerRadius = badgeContainer.bounds.height / 2
    }

    // MARK: 내부

    private func applyHeader() {
        let spec = JdRealCandleHeaderSpec.resolve(source: source, liveLabel: liveLabel)
        badgeContainer.backgroundColor = spec.background.uiColor
        badgeDot.backgroundColor = spec.dotColor.uiColor
        badgeLabel.text = spec.text
        badgeLabel.font = JdFontBridge.scaledFont(
            size: 11.5, weight: JdToken.FontWeight.bold)
        badgeLabel.textColor = spec.foreground.uiColor

        // 봉 수 캡션 — 웹은 라이브 소스일 때만 보여준다
        if source == .live, let rangeLabel, let intervalLabel {
            captionLabel.isHidden = false
            captionLabel.text = JdRealCandleHeaderSpec.caption(
                count: candles.count, range: rangeLabel, interval: intervalLabel)
            captionLabel.font = JdFontBridge.scaledDigitFont(
                size: JdToken.FontSize.xs2, weight: JdToken.FontWeight.medium)
            captionLabel.textColor = JdToken.Color.muted.uiColor
        } else {
            captionLabel.isHidden = true
        }

        if let secondsSinceUpdate {
            freshnessDot.isHidden = false
            freshnessLabel.isHidden = false
            freshnessDot.backgroundColor =
                (source == .live ? JdFinanceTheme.live : JdToken.Color.muted).uiColor
            freshnessLabel.text =
                JdRealCandleHeaderSpec.freshnessText(secondsAgo: secondsSinceUpdate) + " 갱신"
            freshnessLabel.font = JdFontBridge.scaledDigitFont(
                size: JdToken.FontSize.xs2, weight: JdToken.FontWeight.bold)
            freshnessLabel.textColor = JdToken.Color.muted.uiColor
        } else {
            freshnessDot.isHidden = true
            freshnessLabel.isHidden = true
        }
    }
}
