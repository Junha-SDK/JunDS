import Foundation

// MARK: - 차트 지표 계산 17종 (웹 ds/finance/lib/chartIndicators.ts)
//
// 웹 finance 차트의 기술 지표 계산부를 Core로 옮긴 것. 순수 함수 — UIKit/SwiftUI 없음.
// 렌더(서브패널)는 후속이고, 여기는 산수만이다 (04 §4.2 규칙 1 · DEC-052 정신).
//
// 웹 계약 승계 규칙:
//  · 모든 시리즈 함수는 **입력과 같은 길이**를 반환한다. 계산 불가 구간(웜업)은 웹이
//    `null`로 채우듯 Swift에선 `nil`([Double?])로 채운다 — 지우면 인덱스가 밀려
//    차트 x축이 어긋난다(DEC-049 규칙 ②의 지표판).
//  · 수치 파라미터 기본값(period 등)은 웹 기본값 그대로다.
//  · 봉 입력은 웹 `Bar { o,h,l,c,v }` 대신 기존 `JdCandle`을 재사용한다(중복 타입 금지).
//
// 웹과 의도적으로 다른 것:
//  · period ≤ 0 같은 무의미 인자: 웹은 미정의 동작(Infinity/NaN 전파), Swift는 트랩까지
//    갈 수 있어 **전부-nil(또는 빈 결과)로 눕힌다.** 웹 테스트가 커버하지 않는 구간이라
//    수치 패리티엔 영향이 없다.
//  · volumeProfile에서 비수치 h/l 봉은 건너뛴다 — JS는 NaN 인덱스가 조용히 무시되지만
//    Swift는 `Int(nan)`이 트랩이다.

/// 볼린저 밴드 — 웹 `BollingerSeries`
public struct JdBollingerSeries: Sendable {
    public var upper: [Double?]
    public var middle: [Double?]
    public var lower: [Double?]
}

/// MACD — 웹 `MacdSeries`
public struct JdMacdSeries: Sendable {
    /// EMA(fast) − EMA(slow)
    public var macd: [Double?]
    /// EMA(macd, signalPeriod) — macd의 null을 건너뛰며 SMA 시드
    public var signal: [Double?]
    /// macd − signal
    public var histogram: [Double?]
}

/// Stochastic — 웹 `StochasticSeries`
public struct JdStochasticSeries: Sendable {
    /// Fast %K
    public var k: [Double?]
    /// %D = SMA(%K, smoothPeriod)
    public var d: [Double?]
}

/// Ichimoku — 웹 `IchimokuSeries`. spanA/spanB는 26봉(base period) 앞으로 시프트된 값.
public struct JdIchimokuSeries: Sendable {
    /// Tenkan-sen (전환선) — (9 high + 9 low) / 2
    public var conversion: [Double?]
    /// Kijun-sen (기준선) — (26 high + 26 low) / 2
    public var base: [Double?]
    /// Senkou Span A (선행스팬1) — (Tenkan + Kijun) / 2, 26 ahead
    public var spanA: [Double?]
    /// Senkou Span B (선행스팬2) — (52 high + 52 low) / 2, 26 ahead
    public var spanB: [Double?]
}

/// 표준 피봇 포인트 — 웹 `PivotLevels`
public struct JdPivotLevels: Sendable {
    public var pivot: Double
    public var r1: Double
    public var r2: Double
    public var r3: Double
    public var s1: Double
    public var s2: Double
    public var s3: Double
}

/// 선형 회귀 채널 — 웹 `RegressionChannel`
public struct JdRegressionChannel: Sendable {
    /// 시작점 y — 회귀 직선 값(intercept)
    public var startY: Double
    /// 끝점 y — slope × (n−1) + intercept
    public var endY: Double
    /// 잔차 표준편차(±Nσ 채널 폭)
    public var stdDev: Double
    /// R² 적합도
    public var r2: Double
}

/// 패턴 종류 — 웹 union 그대로. higher-high/lower-low는 웹도 선언만 하고 아직 안 낸다.
public enum JdPatternKind: String, CaseIterable, Sendable {
    case doubleTop = "double-top"
    case doubleBottom = "double-bottom"
    case goldenCross = "golden-cross"
    case deadCross = "dead-cross"
    case higherHigh = "higher-high"
    case lowerLow = "lower-low"
}

/// 패턴 감지 결과 — 웹 `PatternHit`
public struct JdPatternHit: Sendable {
    public var kind: JdPatternKind
    public var startIndex: Int
    public var endIndex: Int
    /// 0.0~1.0 — confidence
    public var strength: Double
    public var note: String?
}

/// 가격대별 누적 거래량 — 웹 `VolumeProfileBin`
public struct JdVolumeProfileBin: Sendable {
    public var priceMin: Double
    public var priceMax: Double
    public var volume: Double
}

public enum JdChartIndicators {

    // MARK: - Moving Averages

    /// 단순 이동평균 — 웹 computeSMA 동형. 웜업 구간은 nil.
    public static func sma(_ values: [Double], period: Int) -> [Double?] {
        guard period >= 1 else { return values.map { _ in nil } }
        var out: [Double?] = []
        out.reserveCapacity(values.count)
        var sum = 0.0
        for i in 0..<values.count {
            sum += values[i]
            if i >= period { sum -= values[i - period] }
            out.append(i >= period - 1 ? sum / Double(period) : nil)
        }
        return out
    }

    /// 지수 이동평균 — 웹 computeEMA 동형. 첫 값은 SMA로 시드, 이후 k = 2/(period+1) 스무딩.
    public static func ema(_ values: [Double], period: Int) -> [Double?] {
        guard period >= 1 else { return values.map { _ in nil } }
        var out: [Double?] = []
        out.reserveCapacity(values.count)
        let k = 2 / Double(period + 1)
        var prev = 0.0
        var smaSum = 0.0
        for i in 0..<values.count {
            smaSum += values[i]
            if i < period - 1 {
                out.append(nil)
                continue
            }
            if i == period - 1 {
                prev = smaSum / Double(period)  // seed with SMA
                out.append(prev)
                continue
            }
            let cur = values[i] * k + prev * (1 - k)
            out.append(cur)
            prev = cur
        }
        return out
    }

    // MARK: - Bollinger Bands

    /// 볼린저 밴드 — middle = SMA(period), upper/lower = middle ± stdDev × σ(모집단).
    public static func bollinger(
        _ closes: [Double], period: Int = 20, stdDev: Double = 2
    ) -> JdBollingerSeries {
        let mid = sma(closes, period: period)
        var upper: [Double?] = []
        var lower: [Double?] = []
        for i in 0..<closes.count {
            guard i >= period - 1, let m = mid[i] else {
                upper.append(nil)
                lower.append(nil)
                continue
            }
            var s = 0.0
            for j in (i - period + 1)...i {
                let diff = closes[j] - m
                s += diff * diff
            }
            let sd = (s / Double(period)).squareRoot()
            upper.append(m + stdDev * sd)
            lower.append(m - stdDev * sd)
        }
        return JdBollingerSeries(upper: upper, middle: mid, lower: lower)
    }

    // MARK: - RSI

    /// RSI — Wilder's smoothing. `closes.count <= period`면 전부 nil(웹 동형).
    public static func rsi(_ closes: [Double], period: Int = 14) -> [Double?] {
        var out: [Double?] = Array(repeating: nil, count: closes.count)
        guard period >= 1, closes.count > period else { return out }
        var gain = 0.0
        var loss = 0.0
        for i in 1...period {
            let diff = closes[i] - closes[i - 1]
            if diff > 0 { gain += diff } else { loss -= diff }
        }
        gain /= Double(period)
        loss /= Double(period)
        out[period] = loss == 0 ? 100 : 100 - 100 / (1 + gain / loss)
        for i in (period + 1)..<closes.count {
            let diff = closes[i] - closes[i - 1]
            let g = diff > 0 ? diff : 0
            let l = diff < 0 ? -diff : 0
            // Wilder's smoothing
            gain = (gain * Double(period - 1) + g) / Double(period)
            loss = (loss * Double(period - 1) + l) / Double(period)
            out[i] = loss == 0 ? 100 : 100 - 100 / (1 + gain / loss)
        }
        return out
    }

    // MARK: - MACD

    /// MACD — macd = EMA(fast) − EMA(slow), signal = macd의 null을 건너뛰며 SMA 시드 후 EMA.
    public static func macd(
        _ closes: [Double], fast: Int = 12, slow: Int = 26, signalPeriod: Int = 9
    ) -> JdMacdSeries {
        let empty: [Double?] = Array(repeating: nil, count: closes.count)
        guard fast >= 1, slow >= 1, signalPeriod >= 1 else {
            return JdMacdSeries(macd: empty, signal: empty, histogram: empty)
        }
        let emaFast = ema(closes, period: fast)
        let emaSlow = ema(closes, period: slow)
        let macdLine: [Double?] = (0..<closes.count).map { i in
            guard let a = emaFast[i], let b = emaSlow[i] else { return nil }
            return a - b
        }
        // macd 라인 위의 signal EMA — null은 건너뛰고 처음 signalPeriod개로 SMA 시드(웹 동형)
        var signal: [Double?] = empty
        var started = false
        var prev = 0.0
        var warmup = 0
        let k = 2 / Double(signalPeriod + 1)
        for i in 0..<macdLine.count {
            guard let m = macdLine[i] else { continue }
            if !started {
                prev += m
                warmup += 1
                if warmup >= signalPeriod {
                    let seed = prev / Double(signalPeriod)
                    signal[i] = seed
                    prev = seed
                    started = true
                }
                continue
            }
            let next = m * k + prev * (1 - k)
            signal[i] = next
            prev = next
        }
        let histogram: [Double?] = (0..<closes.count).map { i in
            guard let m = macdLine[i], let s = signal[i] else { return nil }
            return m - s
        }
        return JdMacdSeries(macd: macdLine, signal: signal, histogram: histogram)
    }

    // MARK: - Heikin Ashi

    /// 일반 캔들 → Heikin Ashi 캔들(웹 toHeikinAshi 동형). `t`는 원본을 승계한다.
    ///
    ///   HA-Close = (O+H+L+C)/4 · HA-Open = (이전 HA-Open + 이전 HA-Close)/2
    ///   HA-High  = max(H, HA-Open, HA-Close) · HA-Low = min(L, HA-Open, HA-Close)
    public static func heikinAshi(_ bars: [JdCandle]) -> [JdCandle] {
        guard !bars.isEmpty else { return [] }
        var out: [JdCandle] = []
        out.reserveCapacity(bars.count)
        var prevO = bars[0].o
        var prevC = (bars[0].o + bars[0].h + bars[0].l + bars[0].c) / 4
        for i in 0..<bars.count {
            let b = bars[i]
            let haClose = (b.o + b.h + b.l + b.c) / 4
            let haOpen = i == 0 ? (b.o + b.c) / 2 : (prevO + prevC) / 2
            let haHigh = Swift.max(b.h, Swift.max(haOpen, haClose))
            let haLow = Swift.min(b.l, Swift.min(haOpen, haClose))
            out.append(JdCandle(o: haOpen, h: haHigh, l: haLow, c: haClose, v: b.v, t: b.t))
            prevO = haOpen
            prevC = haClose
        }
        return out
    }

    // MARK: - Stochastic

    /// Stochastic Oscillator (기본 14, 3) — 웹 computeStochastic 동형.
    /// %K = (C − LowestLow) / (HighestHigh − LowestLow) × 100 — 창 폭 0이면 50.
    public static func stochastic(
        _ bars: [JdCandle], period: Int = 14, smoothPeriod: Int = 3
    ) -> JdStochasticSeries {
        var k: [Double?] = Array(repeating: nil, count: bars.count)
        guard period >= 1, smoothPeriod >= 1 else {
            return JdStochasticSeries(k: k, d: k)
        }
        if period - 1 < bars.count {
            for i in (period - 1)..<bars.count {
                var hi = -Double.infinity
                var lo = Double.infinity
                for j in (i - period + 1)...i {
                    if bars[j].h > hi { hi = bars[j].h }
                    if bars[j].l < lo { lo = bars[j].l }
                }
                let span = hi - lo
                k[i] = span > 0 ? (bars[i].c - lo) / span * 100 : 50
            }
        }
        // %D — 웹의 NaN 슬라이딩 합 알고리즘 그대로(패리티가 계약이다)
        let kNumeric = k.map { $0 ?? Double.nan }
        var d: [Double?] = []
        d.reserveCapacity(bars.count)
        var sum = 0.0
        var count = 0
        for i in 0..<kNumeric.count {
            if !kNumeric[i].isNaN {
                sum += kNumeric[i]
                count += 1
                if count > smoothPeriod {
                    let old = kNumeric[i - smoothPeriod]
                    if !old.isNaN { sum -= old } else { count -= 1 }
                }
            }
            d.append(count >= smoothPeriod ? sum / Double(smoothPeriod) : nil)
        }
        return JdStochasticSeries(k: k, d: d)
    }

    // MARK: - OBV

    /// On-Balance Volume — 종가 상승이면 +v, 하락이면 −v, 보합이면 유지. 첫 값 0.
    public static func obv(_ bars: [JdCandle]) -> [Double] {
        var out: [Double] = []
        out.reserveCapacity(bars.count)
        var total = 0.0
        for i in 0..<bars.count {
            if i == 0 {
                out.append(0)
                continue
            }
            let prev = bars[i - 1].c
            let cur = bars[i].c
            if cur > prev { total += bars[i].v } else if cur < prev { total -= bars[i].v }
            out.append(total)
        }
        return out
    }

    // MARK: - VWAP

    /// VWAP — 누적 (typical × volume) / 누적 volume. `sessionBoundary`가 true를 돌려주면
    /// 그 봉부터 새 세션 누적(멀티데이 차트의 일별 리셋). 누적 거래량 0이면 nil.
    public static func vwap(
        _ bars: [JdCandle],
        sessionBoundary: ((_ prev: JdCandle, _ cur: JdCandle, _ index: Int) -> Bool)? = nil
    ) -> [Double?] {
        var out: [Double?] = []
        out.reserveCapacity(bars.count)
        var cumPV = 0.0
        var cumV = 0.0
        for i in 0..<bars.count {
            if i > 0, sessionBoundary?(bars[i - 1], bars[i], i) == true {
                cumPV = 0
                cumV = 0
            }
            let typical = (bars[i].h + bars[i].l + bars[i].c) / 3
            cumPV += typical * bars[i].v
            cumV += bars[i].v
            out.append(cumV > 0 ? cumPV / cumV : nil)
        }
        return out
    }

    // MARK: - ATR

    /// Average True Range — Wilder's smoothing. `bars.count < period + 1`이면 전부 nil.
    /// TR = max(H−L, |H−prevC|, |L−prevC|)
    public static func atr(_ bars: [JdCandle], period: Int = 14) -> [Double?] {
        let empty: [Double?] = Array(repeating: nil, count: bars.count)
        guard period >= 1, bars.count >= period + 1 else { return empty }
        var trs: [Double] = []
        trs.reserveCapacity(bars.count)
        for i in 0..<bars.count {
            if i == 0 {
                trs.append(bars[i].h - bars[i].l)
                continue
            }
            let tr = Swift.max(
                bars[i].h - bars[i].l,
                Swift.max(abs(bars[i].h - bars[i - 1].c), abs(bars[i].l - bars[i - 1].c)))
            trs.append(tr)
        }
        var out = empty
        var value = 0.0
        for i in 0..<period { value += trs[i] }
        value /= Double(period)
        out[period - 1] = value
        for i in period..<bars.count {
            value = (value * Double(period - 1) + trs[i]) / Double(period)
            out[i] = value
        }
        return out
    }

    // MARK: - Williams %R

    /// Williams %R — −100~0. 창 폭 0이면 −50(웹 동형).
    public static func williamsR(_ bars: [JdCandle], period: Int = 14) -> [Double?] {
        var out: [Double?] = Array(repeating: nil, count: bars.count)
        guard period >= 1, period - 1 < bars.count else { return out }
        for i in (period - 1)..<bars.count {
            var hi = -Double.infinity
            var lo = Double.infinity
            for j in (i - period + 1)...i {
                if bars[j].h > hi { hi = bars[j].h }
                if bars[j].l < lo { lo = bars[j].l }
            }
            let span = hi - lo
            out[i] = span > 0 ? (hi - bars[i].c) / span * -100 : -50
        }
        return out
    }

    // MARK: - CCI

    /// Commodity Channel Index — (TP − SMA(TP)) / (0.015 × 평균편차). 편차 0이면 0.
    public static func cci(_ bars: [JdCandle], period: Int = 20) -> [Double?] {
        var out: [Double?] = Array(repeating: nil, count: bars.count)
        guard period >= 1, period - 1 < bars.count else { return out }
        let tp = bars.map { ($0.h + $0.l + $0.c) / 3 }
        let tpSma = sma(tp, period: period)
        for i in (period - 1)..<bars.count {
            guard let mean = tpSma[i] else { continue }
            var md = 0.0
            for j in (i - period + 1)...i { md += abs(tp[j] - mean) }
            md /= Double(period)
            out[i] = md > 0 ? (tp[i] - mean) / (0.015 * md) : 0
        }
        return out
    }

    // MARK: - Ichimoku Cloud (간이)

    /// Ichimoku — 전환/기준/선행스팬 A·B. 선행스팬은 base period(기본 26)만큼 인덱스를
    /// **앞으로 시프트**해 담는다(웹 동형 — 배열 길이는 그대로, 앞쪽이 nil로 밀린다).
    public static func ichimoku(
        _ bars: [JdCandle], conversionPeriod: Int = 9, basePeriod: Int = 26, spanBPeriod: Int = 52
    ) -> JdIchimokuSeries {
        let empty: [Double?] = Array(repeating: nil, count: bars.count)
        guard conversionPeriod >= 1, basePeriod >= 1, spanBPeriod >= 1 else {
            return JdIchimokuSeries(conversion: empty, base: empty, spanA: empty, spanB: empty)
        }
        func hl(_ period: Int, _ end: Int) -> Double? {
            guard end >= period - 1 else { return nil }
            var hi = -Double.infinity
            var lo = Double.infinity
            for j in (end - period + 1)...end {
                if bars[j].h > hi { hi = bars[j].h }
                if bars[j].l < lo { lo = bars[j].l }
            }
            return (hi + lo) / 2
        }
        let conversion: [Double?] = (0..<bars.count).map { hl(conversionPeriod, $0) }
        let base: [Double?] = (0..<bars.count).map { hl(basePeriod, $0) }
        let spanARaw: [Double?] = (0..<bars.count).map { i in
            guard let c = conversion[i], let b = base[i] else { return nil }
            return (c + b) / 2
        }
        let spanBRaw: [Double?] = (0..<bars.count).map { hl(spanBPeriod, $0) }
        // 선행스팬은 26봉 앞으로 그려지므로 인덱스 시프트
        let shift = basePeriod
        var spanA = empty
        var spanB = empty
        for i in 0..<bars.count where i - shift >= 0 {
            spanA[i] = spanARaw[i - shift]
            spanB[i] = spanBRaw[i - shift]
        }
        return JdIchimokuSeries(conversion: conversion, base: base, spanA: spanA, spanB: spanB)
    }

    // MARK: - Pivot Points

    /// 표준 피봇 포인트 — 전일 H/L/C로 지지·저항 추정(웹 computePivot 동형).
    ///   P = (H+L+C)/3 · R1 = 2P−L · R2 = P+(H−L) · R3 = H+2(P−L)
    ///   S1 = 2P−H · S2 = P−(H−L) · S3 = L−2(H−P)
    public static func pivot(previous prev: JdCandle) -> JdPivotLevels {
        let p = (prev.h + prev.l + prev.c) / 3
        return JdPivotLevels(
            pivot: p,
            r1: 2 * p - prev.l,
            r2: p + (prev.h - prev.l),
            r3: prev.h + 2 * (p - prev.l),
            s1: 2 * p - prev.h,
            s2: p - (prev.h - prev.l),
            s3: prev.l - 2 * (prev.h - p))
    }

    // MARK: - Linear Regression

    /// 종가 시리즈 선형 회귀 + 잔차 σ + R². 4점 미만이거나 분모 0이면 nil(웹 동형).
    public static func regression(_ closes: [Double]) -> JdRegressionChannel? {
        let n = closes.count
        guard n >= 4 else { return nil }
        var sumX = 0.0
        var sumY = 0.0
        var sumXY = 0.0
        var sumXX = 0.0
        for i in 0..<n {
            let x = Double(i)
            sumX += x
            sumY += closes[i]
            sumXY += x * closes[i]
            sumXX += x * x
        }
        let dn = Double(n)
        let meanX = sumX / dn
        let meanY = sumY / dn
        let denom = sumXX - dn * meanX * meanX
        guard denom != 0 else { return nil }
        let slope = (sumXY - dn * meanX * meanY) / denom
        let intercept = meanY - slope * meanX
        var ssRes = 0.0
        var ssTot = 0.0
        for i in 0..<n {
            let predicted = slope * Double(i) + intercept
            ssRes += (closes[i] - predicted) * (closes[i] - predicted)
            ssTot += (closes[i] - meanY) * (closes[i] - meanY)
        }
        return JdRegressionChannel(
            startY: intercept,
            endY: slope * Double(n - 1) + intercept,
            stdDev: (ssRes / dn).squareRoot(),
            r2: ssTot > 0 ? 1 - ssRes / ssTot : 0)
    }

    // MARK: - 패턴 감지

    /// 룰베이스 패턴 감지 — 웹 detectPatterns 동형. 25봉 미만이면 빈 배열.
    /// golden/dead cross는 MA(5)×MA(20) 교차, double top/bottom은 8봉 창 피봇 비교.
    public static func detectPatterns(_ bars: [JdCandle]) -> [JdPatternHit] {
        var hits: [JdPatternHit] = []
        guard bars.count >= 25 else { return hits }
        let closes = bars.map(\.c)
        let ma5 = sma(closes, period: 5)
        let ma20 = sma(closes, period: 20)
        // Golden/Dead cross
        for i in 21..<bars.count {
            guard let a0 = ma5[i - 1], let a1 = ma5[i],
                let b0 = ma20[i - 1], let b1 = ma20[i]
            else { continue }
            if a0 <= b0 && a1 > b1 {
                hits.append(
                    JdPatternHit(
                        kind: .goldenCross, startIndex: i, endIndex: i,
                        strength: 0.7, note: "MA5↑MA20"))
            } else if a0 >= b0 && a1 < b1 {
                hits.append(
                    JdPatternHit(
                        kind: .deadCross, startIndex: i, endIndex: i,
                        strength: 0.7, note: "MA5↓MA20"))
            }
        }
        // Double top/bottom — pivot 비교(가장 단순한 룰)
        let window = 8
        func maxHIndex(_ arr: [JdCandle]) -> Int {
            var idx = 0
            for k in 1..<arr.count where arr[k].h > arr[idx].h { idx = k }
            return idx
        }
        func minLIndex(_ arr: [JdCandle]) -> Int {
            var idx = 0
            for k in 1..<arr.count where arr[k].l < arr[idx].l { idx = k }
            return idx
        }
        var i = window * 2
        while i < bars.count - window {
            let left = Array(bars[(i - window * 2)..<(i - window)])
            let center = bars[i]
            let right = Array(bars[i..<(i + window)])
            let leftMaxIdx = maxHIndex(left)
            let rightMaxIdx = maxHIndex(right)
            let leftMax = left[leftMaxIdx].h
            let rightMax = right[rightMaxIdx].h
            if abs(leftMax - center.h) / center.h < 0.02,
                abs(rightMax - center.h) / center.h < 0.02,
                leftMax > center.l * 1.05
            {
                hits.append(
                    JdPatternHit(
                        kind: .doubleTop,
                        startIndex: i - window * 2 + leftMaxIdx,
                        endIndex: i + rightMaxIdx,
                        strength: 0.55, note: "쌍봉"))
            }
            let leftMinIdx = minLIndex(left)
            let rightMinIdx = minLIndex(right)
            let leftMin = left[leftMinIdx].l
            let rightMin = right[rightMinIdx].l
            if abs(leftMin - center.l) / center.l < 0.02,
                abs(rightMin - center.l) / center.l < 0.02,
                leftMin < center.h * 0.95
            {
                hits.append(
                    JdPatternHit(
                        kind: .doubleBottom,
                        startIndex: i - window * 2 + leftMinIdx,
                        endIndex: i + rightMinIdx,
                        strength: 0.55, note: "쌍바닥"))
            }
            i += 1
        }
        return hits
    }

    // MARK: - Volume Profile

    /// 가격대별 누적 거래량 분포 — 봉이 걸치는 bin마다 h−l 겹침 비례로 거래량을 나눈다.
    /// 빈 입력·bins ≤ 0·단일 가격(min ≥ max)이면 빈 배열(웹 동형).
    public static func volumeProfile(_ bars: [JdCandle], bins: Int = 24) -> [JdVolumeProfileBin] {
        guard !bars.isEmpty, bins > 0 else { return [] }
        var minP = Double.infinity
        var maxP = -Double.infinity
        for b in bars {
            if b.l < minP { minP = b.l }
            if b.h > maxP { maxP = b.h }
        }
        guard minP.isFinite, maxP.isFinite, minP < maxP else { return [] }
        let step = (maxP - minP) / Double(bins)
        var out: [JdVolumeProfileBin] = (0..<bins).map { i in
            JdVolumeProfileBin(
                priceMin: minP + step * Double(i),
                priceMax: minP + step * Double(i + 1),
                volume: 0)
        }
        for b in bars {
            // 비수치 봉은 건너뛴다 — JS와 달리 Swift는 Int(nan)이 트랩이다
            guard b.l.isFinite, b.h.isFinite else { continue }
            // 봉이 걸치는 모든 bin에 거래량을 균등 분배(h−l 비례)
            let span = Swift.max(0.0001, b.h - b.l)
            let startIdx = Swift.max(0, Int(((b.l - minP) / step).rounded(.down)))
            let endIdx = Swift.min(bins - 1, Int(((b.h - minP) / step).rounded(.down)))
            guard startIdx <= endIdx else { continue }
            for k in startIdx...endIdx {
                let lo = Swift.max(b.l, out[k].priceMin)
                let hi = Swift.min(b.h, out[k].priceMax)
                let overlap = Swift.max(0, hi - lo)
                out[k].volume += overlap / span * b.v
            }
        }
        return out
    }
}
