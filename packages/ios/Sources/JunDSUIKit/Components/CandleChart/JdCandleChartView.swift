import JunDSCore
import UIKit

// 웹 CandleChart 동형(핵심 계약) — 캔들 + 거래량 + 이동평균 + 마커 라인. (DEC-049)
//
// 좌표는 전부 Core(JdCandleChartLayout)가 만들고 여기서는 draw(_:) 한 패스로 그린다.
// live 마커의 맥동 링만 CALayer다 — draw(_:) 안에서는 반복 애니메이션을 돌릴 수 없고,
// JdLiveStatusDotView의 링과 같은 성격이다(Reduce Motion이면 정지 점만 남는다).
//
// 웹 계약 중 옮기지 않은 것: hover 크로스헤어·툴팁(DOM 전용), 기술 지표 서브패널 15종(후속),
// 이벤트 마커, heikin/line/area 표현 변형(area는 JdAreaChartView), compareLine.
public final class JdCandleChartView: UIView {

    private static let pulseKey = "jd.candleChart.livePulse"

    /// 비수치 봉은 대입 시점에 거른다 — OHLC 하나가 NaN이면 심지·범위가 조용히 무너진다
    public var candles: [JdCandle] {
        didSet {
            candles = JdCandleChartLayout.sanitize(candles)
            setNeedsDisplay()
            setNeedsLayout()
        }
    }

    public var markers: [JdCandleMarkerLine] {
        didSet {
            setNeedsDisplay()
            setNeedsLayout()
        }
    }

    public var showsCurrent: Bool { didSet { setNeedsDisplay() } }
    public var separatorIndex: Int? { didSet { setNeedsDisplay() } }
    public var xLabels: [JdCandleXLabel] { didSet { setNeedsDisplay() } }
    public var showsVolume: Bool {
        didSet {
            setNeedsDisplay()
            setNeedsLayout()
        }
    }
    public var movingAverages: [Int] { didSet { setNeedsDisplay() } }
    public var logScale: Bool { didSet { setNeedsDisplay() } }

    /// 라벨이 있으면 정보(role=img), 없으면 장식
    public var label: String? {
        didSet { applyAccessibility() }
    }

    private let chartWidth: CGFloat
    private let chartHeight: CGFloat
    /// live 마커 맥동 링 — 마커 개수만큼만 유지한다
    private var pulseLayers: [CAShapeLayer] = []

    public init(
        candles: [JdCandle],
        width: CGFloat = 380,
        height: CGFloat = 380,
        markers: [JdCandleMarkerLine] = [],
        showsCurrent: Bool = true,
        separatorIndex: Int? = nil,
        xLabels: [JdCandleXLabel] = [],
        showsVolume: Bool = true,
        movingAverages: [Int] = [5, 10, 20, 60, 120],
        logScale: Bool = false,
        label: String? = nil
    ) {
        self.candles = JdCandleChartLayout.sanitize(candles)
        self.chartWidth = width
        self.chartHeight = height
        self.markers = markers
        self.showsCurrent = showsCurrent
        self.separatorIndex = separatorIndex
        self.xLabels = xLabels
        self.showsVolume = showsVolume
        self.movingAverages = movingAverages
        self.logScale = logScale
        self.label = label
        super.init(frame: .zero)
        backgroundColor = .clear
        isOpaque = false
        applyAccessibility()
    }

    required public init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override var intrinsicContentSize: CGSize {
        CGSize(width: chartWidth, height: chartHeight)
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        setNeedsDisplay()
        setNeedsLayout()
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        rebuildPulseLayers()
    }

    private var resolvedLayout: JdCandleChartLayout? {
        JdCandleChartLayout.resolve(
            candles: candles, width: bounds.width, height: bounds.height,
            markers: markers, showVolume: showsVolume, logScale: logScale)
    }

    // MARK: 그리기 (draw(_:) 한 패스)

    public override func draw(_ rect: CGRect) {
        guard let layout = resolvedLayout else { return }
        let frame = layout.frame
        let gridColor = JdChartTheme.grid.uiColor.resolvedColor(with: traitCollection)
        let axisColor = JdChartTheme.axis.uiColor.resolvedColor(with: traitCollection)
        let upColor = JdFinanceTheme.up.uiColor.resolvedColor(with: traitCollection)
        let downColor = JdFinanceTheme.down.uiColor.resolvedColor(with: traitCollection)

        // 격자(점선) + 우측 가격 눈금
        for tick in layout.ticks {
            let y = layout.yPrice(tick)
            let line = UIBezierPath()
            line.move(to: CGPoint(x: frame.padL, y: y))
            line.addLine(to: CGPoint(x: frame.plotRight, y: y))
            line.setLineDash([2, 4], count: 2, phase: 0)
            gridColor.setStroke()
            line.lineWidth = 1
            line.stroke()
            JdChartDraw.text(
                JdCandleChartLayout.tickText(tick),
                at: CGPoint(x: frame.plotRight + 6, y: y),
                size: 10, weight: JdToken.FontWeight.normal,
                color: axisColor, anchor: .leading)
        }

        // 구간 분리선
        if let separatorIndex {
            let x = frame.padL + CGFloat(separatorIndex) * layout.slot
            let line = UIBezierPath()
            line.move(to: CGPoint(x: x, y: frame.padT))
            line.addLine(to: CGPoint(x: x, y: frame.padT + layout.candleH + layout.volH + 6))
            axisColor.setStroke()
            line.lineWidth = 1
            line.stroke()
        }

        // 캔들 — 심지 + 몸통, 마지막 봉만 불투명 강조(웹 0.92/1)
        for (index, candle) in candles.enumerated() {
            let cx = layout.centerX(index)
            let base = candle.isUp ? upColor : downColor
            let isLast = index == candles.count - 1
            let color =
                isLast ? base : base.withAlphaComponent(CGFloat(JdCandleChartLayout.bodyAlpha))
            let wick = UIBezierPath()
            wick.move(to: CGPoint(x: cx, y: layout.yPrice(candle.h)))
            wick.addLine(to: CGPoint(x: cx, y: layout.yPrice(candle.l)))
            color.setStroke()
            wick.lineWidth = 1
            wick.stroke()

            let yOpen = layout.yPrice(candle.o)
            let yClose = layout.yPrice(candle.c)
            color.setFill()
            UIBezierPath(
                rect: CGRect(
                    x: cx - layout.bodyW / 2,
                    y: min(yOpen, yClose),
                    width: layout.bodyW,
                    height: max(1, abs(yClose - yOpen)))
            ).fill()
        }

        // 이동평균 — 기간 미달 구간(nil)은 건너뛴다
        for period in movingAverages where period > 1 && period < candles.count {
            let values = JdCandleChartLayout.movingAverage(candles, period: period)
            var points: [CGPoint] = []
            for (index, value) in values.enumerated() {
                guard let value else { continue }
                points.append(CGPoint(x: layout.centerX(index), y: layout.yPrice(value)))
            }
            guard points.count >= 2 else { continue }
            let line = UIBezierPath()
            line.move(to: points[0])
            for point in points.dropFirst() { line.addLine(to: point) }
            line.lineWidth = 1.4
            line.lineCapStyle = .round
            line.lineJoinStyle = .round
            JdCandleChartLayout.maColor(period: period).uiColor
                .resolvedColor(with: traitCollection)
                .withAlphaComponent(0.85)
                .setStroke()
            line.stroke()
        }

        // 마커 라인
        for marker in markers where marker.price.isFinite {
            drawMarker(marker, layout: layout)
        }

        // 현재가 라인 + 우측 칩
        if showsCurrent, let last = candles.last {
            let y = layout.yPrice(last.c)
            let color = last.isUp ? upColor : downColor
            let line = UIBezierPath()
            line.move(to: CGPoint(x: frame.padL, y: y))
            line.addLine(to: CGPoint(x: frame.plotRight, y: y))
            line.setLineDash([2, 3], count: 2, phase: 0)
            color.withAlphaComponent(0.6).setStroke()
            line.lineWidth = 1
            line.stroke()
            drawPriceChip(
                text: JdCandleChartLayout.priceChipText(last.c),
                y: y, color: color, layout: layout)
        }

        // 거래량 막대
        if showsVolume {
            for (index, candle) in candles.enumerated() where candle.v > 0 {
                let h = max(1, layout.volumeBarHeight(candle.v))
                JdCandleChartLayout.volumeColor(up: candle.isUp).uiColor
                    .resolvedColor(with: traitCollection).setFill()
                UIBezierPath(
                    rect: CGRect(
                        x: layout.centerX(index) - layout.bodyW / 2,
                        y: layout.volBottom - h,
                        width: layout.bodyW,
                        height: h)
                ).fill()
            }
        }

        // x축 라벨
        for xLabel in xLabels {
            JdChartDraw.text(
                xLabel.label,
                at: CGPoint(
                    x: frame.padL + CGFloat(xLabel.index) * layout.slot,
                    y: bounds.height - 6),
                size: 10,
                weight: xLabel.bold ? JdToken.FontWeight.bold : JdToken.FontWeight.medium,
                color: axisColor, anchor: .leading)
        }
    }

    private func drawMarker(_ marker: JdCandleMarkerLine, layout: JdCandleChartLayout) {
        let frame = layout.frame
        let rawY = layout.yPrice(marker.price)
        let y = marker.live ? layout.yPriceClamped(marker.price) : rawY
        let inset = JdCandleChartLayout.liveClampInset
        let offTop = marker.live && rawY < frame.padT + inset
        let offBottom = marker.live && rawY > frame.padT + layout.candleH - inset
        let offRange = offTop || offBottom
        let color = marker.color.uiColor.resolvedColor(with: traitCollection)

        if !offRange {
            let line = UIBezierPath()
            line.move(to: CGPoint(x: frame.padL, y: y))
            line.addLine(to: CGPoint(x: frame.plotRight, y: y))
            if marker.live { line.setLineDash([5, 4], count: 2, phase: 0) }
            color.withAlphaComponent(marker.live ? 0.85 : 1).setStroke()
            line.lineWidth = 1.5
            line.stroke()
        }
        if marker.live {
            // 정적 점 — 맥동 링은 CALayer가 얹는다(Reduce Motion이면 이 점만 남는다)
            color.withAlphaComponent(0.25).setFill()
            UIBezierPath(
                ovalIn: CGRect(x: frame.plotRight - 5, y: y - 5, width: 10, height: 10)
            ).fill()
            color.setFill()
            UIBezierPath(
                ovalIn: CGRect(x: frame.plotRight - 3.2, y: y - 3.2, width: 6.4, height: 6.4)
            ).fill()
            if offTop {
                JdChartDraw.text(
                    "▲", at: CGPoint(x: frame.plotRight, y: y - 8),
                    size: 9, weight: JdToken.FontWeight.bold, color: color, anchor: .center)
            }
            if offBottom {
                JdChartDraw.text(
                    "▼", at: CGPoint(x: frame.plotRight, y: y + 14),
                    size: 9, weight: JdToken.FontWeight.bold, color: color, anchor: .center)
            }
        }
        if !(marker.live && offRange) {
            let chip = CGRect(x: frame.plotRight - 36, y: y - 9, width: 32, height: 18)
            color.setFill()
            UIBezierPath(roundedRect: chip, cornerRadius: 4).fill()
            JdChartDraw.text(
                marker.label,
                at: CGPoint(x: chip.midX, y: chip.midY),
                size: 10.5, weight: JdToken.FontWeight.bold,
                color: .white, anchor: .center)
        }
        drawPriceChip(
            text: JdCandleChartLayout.priceChipText(marker.price),
            y: y, color: color, layout: layout)
    }

    /// 우측 가격 칩 — 마커·현재가가 공유(웹 rect+text 관용구)
    private func drawPriceChip(
        text: String, y: CGFloat, color: UIColor, layout: JdCandleChartLayout
    ) {
        let frame = layout.frame
        let chip = CGRect(x: frame.plotRight + 2, y: y - 9, width: frame.padR - 6, height: 18)
        color.setFill()
        UIBezierPath(roundedRect: chip, cornerRadius: 4).fill()
        JdChartDraw.text(
            text,
            at: CGPoint(x: frame.width - 6, y: chip.midY),
            size: 10.5, weight: JdToken.FontWeight.bold,
            color: .white, anchor: .trailing)
    }

    // MARK: live 마커 맥동 링 (웹 SMIL r 4→9 · opacity 0.35→0, 1.8s 반복)

    private func rebuildPulseLayers() {
        pulseLayers.forEach { $0.removeFromSuperlayer() }
        pulseLayers = []
        guard let layout = resolvedLayout else { return }
        let duration = JdMotion.duration(1.8)
        guard duration > 0 else { return }

        for marker in markers where marker.live && marker.price.isFinite {
            let y = layout.yPriceClamped(marker.price)
            let ring = CAShapeLayer()
            let radius: CGFloat = 4
            ring.path =
                UIBezierPath(
                    ovalIn: CGRect(x: -radius, y: -radius, width: radius * 2, height: radius * 2)
                ).cgPath
            ring.fillColor = marker.color.uiColor.resolvedColor(with: traitCollection).cgColor
            ring.position = CGPoint(x: layout.frame.plotRight, y: y)
            ring.opacity = 0

            let scale = CABasicAnimation(keyPath: "transform.scale")
            scale.fromValue = 1
            scale.toValue = 2.25
            let fade = CABasicAnimation(keyPath: "opacity")
            fade.fromValue = 0.35
            fade.toValue = 0
            let group = CAAnimationGroup()
            group.animations = [scale, fade]
            group.duration = duration
            group.repeatCount = .infinity
            group.timingFunction = CAMediaTimingFunction(name: .easeOut)
            ring.add(group, forKey: Self.pulseKey)

            layer.addSublayer(ring)
            pulseLayers.append(ring)
        }
    }

    private func applyAccessibility() {
        isAccessibilityElement = label != nil
        accessibilityTraits = label != nil ? .image : []
        accessibilityLabel = label
    }
}
