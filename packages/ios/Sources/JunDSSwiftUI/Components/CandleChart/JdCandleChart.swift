import JunDSCore
import SwiftUI

// 웹 CandleChart 동형(핵심 계약) — 캔들 + 거래량 + 이동평균 + 마커 라인. (DEC-049)
//
// 좌표는 전부 Core(JdCandleChartLayout)가 만들고 여기서는 Canvas 한 패스로 그린다.
// live 마커의 맥동 점만 Canvas 밖 overlay다 — Canvas 안에서는 반복 애니메이션을 돌릴 수
// 없고, 점 하나의 scale/opacity는 뷰 1개로 충분하다(Reduce Motion이면 붙지 않는다).
//
// 웹 계약 중 옮기지 않은 것: hover 크로스헤어·툴팁(DOM 전용), 기술 지표 서브패널 15종(후속),
// 이벤트 마커, heikin/line/area 표현 변형(area는 JdAreaChart), compareLine.
public struct JdCandleChart: View {
    private let candles: [JdCandle]
    private let width: CGFloat
    private let height: CGFloat
    private let markers: [JdCandleMarkerLine]
    private let showsCurrent: Bool
    private let separatorIndex: Int?
    private let xLabels: [JdCandleXLabel]
    private let showsVolume: Bool
    private let movingAverages: [Int]
    private let logScale: Bool
    private let label: String?

    @Environment(\.accessibilityReduceMotion) private var reduceMotion

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
        // 비수치 봉은 대입 시점에 거른다 — OHLC 하나가 NaN이면 심지·범위가 조용히 무너진다
        self.candles = JdCandleChartLayout.sanitize(candles)
        self.width = width
        self.height = height
        self.markers = markers
        self.showsCurrent = showsCurrent
        self.separatorIndex = separatorIndex
        self.xLabels = xLabels
        self.showsVolume = showsVolume
        self.movingAverages = movingAverages
        self.logScale = logScale
        self.label = label
    }

    public var body: some View {
        let layout = JdCandleChartLayout.resolve(
            candles: candles, width: width, height: height,
            markers: markers, showVolume: showsVolume, logScale: logScale)
        ZStack(alignment: .topLeading) {
            Canvas { context, size in
                guard let layout else { return }
                draw(&context, layout: layout, size: size)
            }
            if let layout {
                ForEach(Array(markers.enumerated()), id: \.offset) { _, marker in
                    if marker.live {
                        LivePulseDot(color: marker.color.color, animates: !reduceMotion)
                            .position(
                                x: layout.frame.plotRight,
                                y: layout.yPriceClamped(marker.price))
                    }
                }
            }
        }
        .frame(width: width, height: height)
        .accessibilityElement(children: .ignore)
        .accessibilityHidden(label == nil)
        .accessibilityAddTraits(.isImage)
        .accessibilityLabel(Text(label ?? ""))
    }

    // MARK: 그리기 (Canvas 한 패스)

    private func draw(
        _ context: inout GraphicsContext, layout: JdCandleChartLayout, size: CGSize
    ) {
        let gridColor = JdChartTheme.grid.color
        let axisColor = JdChartTheme.axis.color
        let frame = layout.frame

        // 격자(점선) + 우측 가격 눈금
        for tick in layout.ticks {
            let y = layout.yPrice(tick)
            var line = Path()
            line.move(to: CGPoint(x: frame.padL, y: y))
            line.addLine(to: CGPoint(x: frame.plotRight, y: y))
            context.stroke(
                line, with: .color(gridColor),
                style: StrokeStyle(lineWidth: 1, dash: [2, 4]))
            context.draw(
                Text(JdCandleChartLayout.tickText(tick))
                    .font(Font.system(size: 10).monospacedDigit())
                    .foregroundColor(axisColor),
                at: CGPoint(x: frame.plotRight + 6, y: y),
                anchor: .leading)
        }

        // 구간 분리선
        if let separatorIndex {
            let x = frame.padL + CGFloat(separatorIndex) * layout.slot
            var line = Path()
            line.move(to: CGPoint(x: x, y: frame.padT))
            line.addLine(
                to: CGPoint(x: x, y: frame.padT + layout.candleH + layout.volH + 6))
            context.stroke(line, with: .color(axisColor), lineWidth: 1)
        }

        // 캔들 — 심지 + 몸통, 마지막 봉만 불투명 강조(웹 0.92/1)
        let upColor = JdFinanceTheme.up.color
        let downColor = JdFinanceTheme.down.color
        for (index, candle) in candles.enumerated() {
            let cx = layout.centerX(index)
            let color = candle.isUp ? upColor : downColor
            let isLast = index == candles.count - 1
            let alpha = isLast ? 1 : JdCandleChartLayout.bodyAlpha
            let yHigh = layout.yPrice(candle.h)
            let yLow = layout.yPrice(candle.l)
            var wick = Path()
            wick.move(to: CGPoint(x: cx, y: yHigh))
            wick.addLine(to: CGPoint(x: cx, y: yLow))
            context.stroke(wick, with: .color(color.opacity(alpha)), lineWidth: 1)

            let yOpen = layout.yPrice(candle.o)
            let yClose = layout.yPrice(candle.c)
            let top = min(yOpen, yClose)
            context.fill(
                Path(
                    CGRect(
                        x: cx - layout.bodyW / 2, y: top,
                        width: layout.bodyW,
                        height: max(1, abs(yClose - yOpen)))),
                with: .color(color.opacity(alpha)))
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
            var line = Path()
            line.addLines(points)
            context.stroke(
                line,
                with: .color(JdCandleChartLayout.maColor(period: period).color.opacity(0.85)),
                style: StrokeStyle(lineWidth: 1.4, lineCap: .round, lineJoin: .round))
        }

        // 마커 라인 — 정적: 실선 + 좌측 라벨 칩, live: 점선 + 우측 맥동 점(overlay) + 범위
        // 밖이면 ▲/▼로 접힌 방향을 알린다
        for marker in markers where marker.price.isFinite {
            drawMarker(&context, marker: marker, layout: layout)
        }

        // 현재가 라인 + 우측 칩
        if showsCurrent, let last = candles.last {
            let y = layout.yPrice(last.c)
            let color = last.isUp ? upColor : downColor
            var line = Path()
            line.move(to: CGPoint(x: frame.padL, y: y))
            line.addLine(to: CGPoint(x: frame.plotRight, y: y))
            context.stroke(
                line, with: .color(color.opacity(0.6)),
                style: StrokeStyle(lineWidth: 1, dash: [2, 3]))
            drawPriceChip(
                &context, text: JdCandleChartLayout.priceChipText(last.c),
                y: y, color: color, layout: layout)
        }

        // 거래량 막대
        if showsVolume {
            for (index, candle) in candles.enumerated() {
                let h = layout.volumeBarHeight(candle.v)
                guard candle.v > 0 || h > 0 else { continue }
                context.fill(
                    Path(
                        CGRect(
                            x: layout.centerX(index) - layout.bodyW / 2,
                            y: layout.volBottom - max(1, h),
                            width: layout.bodyW,
                            height: max(1, h))),
                    with: .color(JdCandleChartLayout.volumeColor(up: candle.isUp).color))
            }
        }

        // x축 라벨
        for xLabel in xLabels {
            context.draw(
                Text(xLabel.label)
                    .font(
                        Font.system(size: 10, weight: xLabel.bold ? .bold : .medium)
                            .monospacedDigit())
                    .foregroundColor(axisColor),
                at: CGPoint(
                    x: frame.padL + CGFloat(xLabel.index) * layout.slot,
                    y: size.height - 6),
                anchor: .leading)
        }
    }

    private func drawMarker(
        _ context: inout GraphicsContext,
        marker: JdCandleMarkerLine,
        layout: JdCandleChartLayout
    ) {
        let frame = layout.frame
        let rawY = layout.yPrice(marker.price)
        let y = marker.live ? layout.yPriceClamped(marker.price) : rawY
        let inset = JdCandleChartLayout.liveClampInset
        let offTop = marker.live && rawY < frame.padT + inset
        let offBottom = marker.live && rawY > frame.padT + layout.candleH - inset
        let offRange = offTop || offBottom
        let color = marker.color.color

        if !offRange {
            var line = Path()
            line.move(to: CGPoint(x: frame.padL, y: y))
            line.addLine(to: CGPoint(x: frame.plotRight, y: y))
            context.stroke(
                line, with: .color(color.opacity(marker.live ? 0.85 : 1)),
                style: StrokeStyle(lineWidth: 1.5, dash: marker.live ? [5, 4] : []))
        }
        if marker.live {
            // 정적 점 — 맥동 링은 overlay가 얹는다(Reduce Motion이면 이 점만 남는다)
            context.fill(
                Path(ellipseIn: CGRect(x: frame.plotRight - 5, y: y - 5, width: 10, height: 10)),
                with: .color(color.opacity(0.25)))
            context.fill(
                Path(
                    ellipseIn: CGRect(x: frame.plotRight - 3.2, y: y - 3.2, width: 6.4, height: 6.4)),
                with: .color(color))
            if offTop {
                context.draw(
                    Text("▲").font(Font.system(size: 9, weight: .bold)).foregroundColor(color),
                    at: CGPoint(x: frame.plotRight, y: y - 8), anchor: .center)
            }
            if offBottom {
                context.draw(
                    Text("▼").font(Font.system(size: 9, weight: .bold)).foregroundColor(color),
                    at: CGPoint(x: frame.plotRight, y: y + 14), anchor: .center)
            }
        }
        if !(marker.live && offRange) {
            // 좌측 라벨 칩
            let rect = CGRect(x: frame.plotRight - 36, y: y - 9, width: 32, height: 18)
            context.fill(Path(roundedRect: rect, cornerRadius: 4), with: .color(color))
            context.draw(
                Text(marker.label)
                    .font(Font.system(size: 10.5, weight: .bold))
                    .foregroundColor(.white),
                at: CGPoint(x: rect.midX, y: rect.midY),
                anchor: .center)
        }
        drawPriceChip(
            &context, text: JdCandleChartLayout.priceChipText(marker.price),
            y: y, color: color, layout: layout)
    }

    /// 우측 가격 칩 — 마커·현재가가 공유(웹 rect+text 관용구)
    private func drawPriceChip(
        _ context: inout GraphicsContext,
        text: String, y: CGFloat, color: Color,
        layout: JdCandleChartLayout
    ) {
        let frame = layout.frame
        let rect = CGRect(
            x: frame.plotRight + 2, y: y - 9, width: frame.padR - 6, height: 18)
        context.fill(Path(roundedRect: rect, cornerRadius: 4), with: .color(color))
        context.draw(
            Text(text)
                .font(Font.system(size: 10.5, weight: .bold).monospacedDigit())
                .foregroundColor(.white),
            at: CGPoint(x: frame.width - 6, y: rect.midY),
            anchor: .trailing)
    }
}

// MARK: - live 마커 맥동 점 (웹 SMIL r 4→9 · opacity 0.35→0, 1.8s 반복)

struct LivePulseDot: View {
    let color: Color
    let animates: Bool

    @State private var expanded = false

    var body: some View {
        Circle()
            .fill(color)
            .frame(width: 8, height: 8)
            .scaleEffect(expanded ? 2.25 : 1)
            .opacity(expanded ? 0 : 0.35)
            .allowsHitTesting(false)
            .onAppear {
                guard animates, JdMotion.duration(1.8) > 0 else { return }
                withAnimation(.easeOut(duration: 1.8).repeatForever(autoreverses: false)) {
                    expanded = true
                }
            }
    }
}
