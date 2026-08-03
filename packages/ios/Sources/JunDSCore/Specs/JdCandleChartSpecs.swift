import UIKit

// MARK: - 캔들 계열 지오메트리 (DEC-049 — Candle·MarketIndex·RealCandle)
//
// 웹 CandleChart.tsx의 좌표 계산부를 Core로 옮긴 것. 렌더 계층(SwiftUI Canvas /
// UIKit draw(_:))은 이 결과만 그린다 (04 §4.2 규칙 1).
//
// 웹 계약 중 iOS로 옮기지 않은 것: 마우스 hover 크로스헤어·툴팁(DOM 전용 상호작용),
// 기술 지표 서브패널 15종(RSI·MACD 등 — 후속), 이벤트 마커, heikin/line/area 표현 변형
// (area는 JdAreaChart가 담당), compareLine. 대응분은 원장(DECISIONS)에 기록한다.

/// 봉 하나 — 웹 `Candle { o, h, l, c, v, t }` 동형.
public struct JdCandle: Sendable, Equatable {
    public var o: Double
    public var h: Double
    public var l: Double
    public var c: Double
    public var v: Double
    public var t: String

    public init(o: Double, h: Double, l: Double, c: Double, v: Double = 0, t: String = "") {
        self.o = o
        self.h = h
        self.l = l
        self.c = c
        self.v = v
        self.t = t
    }

    /// 양봉 판정 — 웹 `c >= o`
    public var isUp: Bool { c >= o }

    var isFiniteCandle: Bool {
        o.isFinite && h.isFinite && l.isFinite && c.isFinite && v.isFinite
    }
}

/// 가로 마커 라인 — 웹 `MarkerLine`. `live`면 점선 + 우측 맥동 점(KIS 실시간 체결가 등).
public struct JdCandleMarkerLine: Sendable {
    public var label: String
    public var price: Double
    public var color: JdDynamicColor
    public var live: Bool

    public init(label: String, price: Double, color: JdDynamicColor, live: Bool = false) {
        self.label = label
        self.price = price
        self.color = color
        self.live = live
    }
}

/// x축 라벨 — 웹 `xLabels: { index, label, bold }`
public struct JdCandleXLabel: Sendable {
    public var index: Int
    public var label: String
    public var bold: Bool

    public init(index: Int, label: String, bold: Bool = false) {
        self.index = index
        self.label = label
        self.bold = bold
    }
}

public struct JdCandleChartLayout: Sendable {
    public var frame: JdChartFrame
    /// 캔들 영역 높이(거래량 패널 제외)
    public var candleH: CGFloat
    public var volH: CGFloat
    public var slot: CGFloat
    public var bodyW: CGFloat
    /// 4% 숨 반영 후의 가격 범위
    public var minPrice: Double
    public var maxPrice: Double
    /// 로그 스케일은 양수 범위에서만 켠다(웹 `logScale && min > 0` 자동 폴백)
    public var useLog: Bool
    public var maxVol: Double
    public var volTop: CGFloat
    public var volBottom: CGFloat
    public var ticks: [Double]

    /// 마지막 봉 강조·나머지 봉 투명도 — 웹 `opacity={isLast ? 1 : 0.92}`
    public static let bodyAlpha: Double = 0.92
    /// live 마커 클램프 여백 — 웹 `padT + 10` / `padT + candleH - 10`
    public static let liveClampInset: CGFloat = 10

    /// 비수치 봉은 대입 시점에 거른다(규칙 ②) — OHLC 하나가 NaN이면 심지·몸통·범위가
    /// 전부 조용히 무너진다.
    public static func sanitize(_ candles: [JdCandle]) -> [JdCandle] {
        candles.filter(\.isFiniteCandle)
    }

    /// 웹 pad 8/64/6/22 · 거래량 패널 70
    public static func resolve(
        candles: [JdCandle],
        width: CGFloat = 380,
        height: CGFloat = 380,
        markers: [JdCandleMarkerLine] = [],
        showVolume: Bool = true,
        logScale: Bool = false
    ) -> JdCandleChartLayout? {
        guard width > 0, height > 0 else { return nil }
        let data = sanitize(candles)
        let frame = JdChartFrame(
            width: width, height: height, padL: 8, padR: 64, padT: 6, padB: 22)
        let volH: CGFloat = showVolume ? 70 : 0
        let candleH = height - frame.padT - frame.padB - volH
        let slot = frame.innerW / CGFloat(Swift.max(1, data.count))
        let bodyW = Swift.max(2, slot * 0.7)

        var minV = Double.infinity
        var maxV = -Double.infinity
        for candle in data {
            if candle.l < minV { minV = candle.l }
            if candle.h > maxV { maxV = candle.h }
        }
        // 정적 마커는 y축 범위에 포함해야 의미가 있다. live 마커는 캔들 범위와 동떨어진
        // 값으로 들어와 차트를 쏠리게 할 수 있어 제외한다(웹 동형).
        for marker in markers where !marker.live && marker.price.isFinite {
            if marker.price < minV { minV = marker.price }
            if marker.price > maxV { maxV = marker.price }
        }
        if !minV.isFinite || !maxV.isFinite {
            minV = 0
            maxV = 1
        }
        // 위아래 4% 숨 — 평평하면 1(웹 `(max - min) * 0.04 || 1`)
        let breathing = (maxV - minV) * 0.04 == 0 ? 1 : (maxV - minV) * 0.04
        minV -= breathing
        maxV += breathing

        let useLog = logScale && minV > 0
        let ticks: [Double]
        if useLog {
            // 1·2·5 사다리를 자릿수마다 — 웹 로그 눈금 동형
            var out: [Double] = []
            let minExp = Int(floor(log10(Swift.max(1e-6, minV))))
            let maxExp = Int(ceil(log10(Swift.max(1e-6, maxV))))
            for exp in minExp...maxExp {
                for m in [1.0, 2.0, 5.0] {
                    let value = m * pow(10, Double(exp))
                    if value >= minV && value <= maxV { out.append(value) }
                }
            }
            ticks = out
        } else {
            ticks = JdChartAxis.ticks(
                min: minV, max: maxV,
                step: JdChartAxis.niceStep((maxV - minV) / 6, minimum: 1))
        }

        let volTop = frame.padT + candleH + 6
        return JdCandleChartLayout(
            frame: frame,
            candleH: candleH,
            volH: volH,
            slot: slot,
            bodyW: bodyW,
            minPrice: minV,
            maxPrice: maxV,
            useLog: useLog,
            maxVol: Swift.max(1, data.map(\.v).max() ?? 1),
            volTop: volTop,
            volBottom: volTop + volH,
            ticks: ticks)
    }

    /// 가격→y. 로그 스케일이면 log10 공간에서 보간한다(웹 동형).
    public func yPrice(_ price: Double) -> CGFloat {
        let lo = useLog ? log10(minPrice) : minPrice
        let hi = useLog ? log10(maxPrice) : maxPrice
        let value: Double
        if useLog {
            value = price > 0 ? log10(price) : lo
        } else {
            value = price.isFinite ? price : lo
        }
        let range = (hi - lo) == 0 ? 1 : (hi - lo)
        return frame.padT + CGFloat((hi - value) / range) * candleH
    }

    /// live 마커용 — 화면 밖 가격을 캔들 영역 안쪽 10pt로 접는다(웹 동형)
    public func yPriceClamped(_ price: Double) -> CGFloat {
        let y = yPrice(price)
        let top = frame.padT + Self.liveClampInset
        let bottom = frame.padT + candleH - Self.liveClampInset
        return Swift.max(top, Swift.min(bottom, y))
    }

    /// i번째 봉의 중심 x — 웹 `padL + i * slot + slot / 2`
    public func centerX(_ index: Int) -> CGFloat {
        frame.padL + CGFloat(index) * slot + slot / 2
    }

    /// 거래량 막대 높이 — 웹 `((v / maxVol) * (volH - 8)) | 0` (내림)
    public func volumeBarHeight(_ volume: Double) -> CGFloat {
        guard volH > 8, volume.isFinite, volume > 0 else { return 0 }
        return floor(CGFloat(volume / maxVol) * (volH - 8))
    }

    /// 이동평균 — 웹 computeMA 동형(기간 미달 구간은 nil)
    public static func movingAverage(_ candles: [JdCandle], period: Int) -> [Double?] {
        guard period > 0 else { return candles.map { _ in nil } }
        var out: [Double?] = []
        var sum = 0.0
        for index in 0..<candles.count {
            sum += candles[index].c
            if index >= period { sum -= candles[index - period].c }
            out.append(index >= period - 1 ? sum / Double(period) : nil)
        }
        return out
    }

    /// MA 계열색 — 서로 구분되는 것 자체가 기능이라 의미 토큰으로 접지 않는다(웹 주석 승계).
    /// 값은 웹 MarketIndexChart 범례(5 보라 · 10 파랑 · 20 warning · 60 success · 120 슬레이트).
    public static func maColor(period: Int) -> JdDynamicColor {
        switch period {
        case 5: return JdDynamicColor(light: 0xA855_F7FF, dark: 0xA855_F7FF)
        case 10: return JdDynamicColor(light: 0x1D4E_D8FF, dark: 0x3B82_F6FF)
        case 20: return JdToken.Color.warning
        case 60: return JdToken.Color.success
        case 120: return JdDynamicColor(light: 0x4755_69FF, dark: 0x94A3_B8FF)
        default: return JdDynamicColor(light: 0x94A3_B8FF, dark: 0x94A3_B8FF)
        }
    }

    /// 거래량 막대색 — **웹과 의도적으로 다르다.** 웹 v2는 리터럴 빨강/파랑(한국 관례)을
    /// 박아 두어 `--bm-up/down` 테마를 바꿔도 거래량만 따로 놀았다. iOS는 추세색 토큰의
    /// 55% 워시를 쓴다 — 앱이 JdFinanceTheme를 바꾸면 거래량도 함께 따라온다.
    public static func volumeColor(up: Bool) -> JdDynamicColor {
        JdFinanceSpecMix.wash(up ? JdFinanceTheme.up : JdFinanceTheme.down, alpha: 0.55)
    }

    /// 우측 가격 눈금 라벨 — 웹 `t >= 1000 ? toLocaleString("ko-KR") : t.toFixed(2)`
    public static func tickText(_ value: Double) -> String {
        value >= 1000
            ? JdNumberFormat.string(value: value, locale: "ko-KR", decimals: 0)
            : String(format: "%.2f", value)
    }

    /// 마커·현재가 칩의 가격 문자열 — 웹 `Math.round(price).toLocaleString("ko-KR")`
    public static func priceChipText(_ value: Double) -> String {
        JdNumberFormat.string(value: value.rounded(), locale: "ko-KR", decimals: 0)
    }
}

// MARK: - MarketIndexChart (웹 MarketIndexChart.tsx)
//
// 웹은 타임프레임별 mock 캔들을 컴포넌트 안에서 생성했다. iOS는 데이터 생성이 라이브러리
// 밖이므로(DEC-019) **타임프레임별 캔들을 인자로 받는다** — 라이브 배선은 후속.

public struct JdMarketIndexTimeframe: Sendable {
    public var label: String
    public var candles: [JdCandle]
    public var separatorIndex: Int?
    public var xLabels: [JdCandleXLabel]

    public init(
        label: String,
        candles: [JdCandle],
        separatorIndex: Int? = nil,
        xLabels: [JdCandleXLabel] = []
    ) {
        self.label = label
        self.candles = candles
        self.separatorIndex = separatorIndex
        self.xLabels = xLabels
    }
}

public enum JdMarketIndexChartSpec {
    public struct Pill: Sendable {
        public var background: JdDynamicColor
        public var foreground: JdDynamicColor
        public var fontWeight: CGFloat
    }

    /// 웹 11px — 선택 pill은 호스트 강조 톤(accent 소프트) + bold, 아니면 소프트 회색 + medium
    public static let pillFontSize: CGFloat = 11

    public static func pill(selected: Bool) -> Pill {
        selected
            ? Pill(
                background: JdToken.Color.accentLight,
                foreground: JdToken.Color.primaryInk,
                fontWeight: JdToken.FontWeight.bold)
            : Pill(
                background: JdToken.Color.neutralN100,
                foreground: JdToken.Color.muted,
                fontWeight: JdToken.FontWeight.medium)
    }

    public struct MaLegendEntry: Sendable {
        public var period: Int
        public var color: JdDynamicColor
    }

    /// MA 범례 — 캔들 차트가 기본으로 그리는 5개 기간과 1:1
    public static let maLegend: [MaLegendEntry] =
        [5, 10, 20, 60, 120].map { MaLegendEntry(period: $0, color: JdCandleChartLayout.maColor(period: $0)) }
}

// MARK: - RealCandleChart (웹 RealCandleChart.tsx)
//
// 웹은 fetch + 폴링까지 안은 라이브 래퍼다. iOS는 네트워크 없이 **데이터를 인자로 받는
// 뷰**이고(라이브 배선은 후속), 여기엔 헤더(출처 배지·신선도)의 표시 계산만 둔다.

public enum JdRealCandleSource: String, CaseIterable, Sendable {
    case live, sample, loading
}

public struct JdRealCandleHeaderSpec: Sendable {
    public var text: String
    public var background: JdDynamicColor
    public var foreground: JdDynamicColor
    public var dotColor: JdDynamicColor

    /// 웹: 라이브면 success 소프트 배지("… · 실시간"), 로딩/샘플이면 무채 배지.
    /// `liveLabel`엔 앱이 데이터 출처를 넣는다(웹 "Yahoo Finance · 실시간" 대응).
    public static func resolve(
        source: JdRealCandleSource,
        liveLabel: String = "실시간"
    ) -> JdRealCandleHeaderSpec {
        switch source {
        case .live:
            return JdRealCandleHeaderSpec(
                text: liveLabel,
                background: JdToken.Color.successLight,
                foreground: JdToken.Color.success,
                dotColor: JdToken.Color.success)
        case .loading:
            return JdRealCandleHeaderSpec(
                text: "데이터 불러오는 중…",
                background: JdToken.Color.neutralN100,
                foreground: JdToken.Color.muted,
                dotColor: JdToken.Color.muted)
        case .sample:
            return JdRealCandleHeaderSpec(
                text: "샘플 데이터",
                background: JdToken.Color.neutralN100,
                foreground: JdToken.Color.muted,
                dotColor: JdToken.Color.muted)
        }
    }

    /// 신선도 라벨 — 웹 `sec < 5 "방금" / < 60 "n초 전" / "n분 전"`.
    /// 5초 타이머 재계산은 뷰가 아니라 앱의 몫이다(웹 setInterval 대응은 후속 라이브 배선).
    public static func freshnessText(secondsAgo: Int) -> String {
        let sec = Swift.max(0, secondsAgo)
        if sec < 5 { return "방금" }
        if sec < 60 { return "\(sec)초 전" }
        return "\(sec / 60)분 전"
    }

    /// 봉 수 캡션 — 웹 `${n}봉 · ${range} ${interval}`
    public static func caption(count: Int, range: String, interval: String) -> String {
        "\(count)봉 · \(range) \(interval)"
    }
}
