import JunDSCore
import UIKit

// MARK: - 열 정렬 격자 (DEC-042)
//
// 스택이 **구조적으로 못 하는** 유일한 배치다. `UIStackView`의 행들은 서로를 모르므로
// 1행의 "종목명" 폭과 2행의 "종목명" 폭이 각자 정해진다 — 표가 어긋난다. 소비자가 이걸
// 해결하려면 열마다 고정 폭을 손으로 박거나(내용이 길어지면 잘린다)
// `UICollectionViewCompositionalLayout`을 세워야 했다.
//
// 여기서는 **모든 행을 한 번에 측정해 열 폭을 공유**한다. 그래서 `fit` 열은 전 행에서
// 가장 넓은 내용에 맞고, `flexible` 열이 남는 폭을 가중치로 나눈다 — 표가 자동으로 맞는다.

/// 열 하나의 정의 — **폭 규칙과 정렬을 한 값에 담는다.**
///
/// 처음엔 `columns: [JdColumn]`과 `alignments: [JdColumnAlign]` 두 배열이었다(DEC-042).
/// 인덱스로 짝을 맞추는 API는 하나만 밀려도 **조용히 틀린 표**를 그린다 — 컴파일도 되고
/// 크래시도 없다. 한 값으로 합치면 그 실수가 불가능해진다 (DEC-043).
public struct JdColumn: Sendable, Equatable {
    public enum Width: Sendable, Equatable {
        /// 고정 폭. 소비자 의도라 전체가 넘쳐도 줄이지 않는다.
        case fixed(CGFloat)
        /// **전 행의 내용 중 가장 넓은 것**에 맞춘다. 넘칠 때 여기서 줄인다.
        case fit(max: CGFloat)
        /// 남는 폭을 가중치로 분배
        case flex(weight: CGFloat)
    }

    /// 열 안에서 셀을 어디에 붙일지. **숫자 열은 `.end`가 정답이다** — 자리수가 달라도 끝이 맞는다.
    public enum Align: String, CaseIterable, Sendable {
        case start, center, end
        /// 셀이 열 폭을 꽉 채운다(기본)
        case fill
    }

    public let width: Width
    public let align: Align

    public init(width: Width, align: Align = .fill) {
        self.width = width
        self.align = align
    }

    // 읽기 좋은 생성자 — 호출부가 `.fixed(96, align: .end)` 한 줄이 된다
    public static func fixed(_ value: CGFloat, align: Align = .fill) -> JdColumn {
        JdColumn(width: .fixed(value), align: align)
    }
    public static func fit(
        max: CGFloat = .greatestFiniteMagnitude, align: Align = .fill
    ) -> JdColumn {
        JdColumn(width: .fit(max: max), align: align)
    }
    public static func flex(weight: CGFloat = 1, align: Align = .fill) -> JdColumn {
        JdColumn(width: .flex(weight: weight), align: align)
    }
}

/// 행 목록 결과 빌더 — 각 행이 셀 배열이다
@resultBuilder
public enum JdRowBuilder {
    /// 빈 블록 `{ }` 허용 — `[]`만 적으면 [UIView]/[[UIView]] 사이에서 모호해진다(실측)
    public static func buildBlock() -> [[UIView]] { [] }
    public static func buildBlock(_ rows: [[UIView]]...) -> [[UIView]] { rows.flatMap { $0 } }
    public static func buildExpression(_ row: [UIView]) -> [[UIView]] { [row] }
    public static func buildExpression(_ rows: [[UIView]]) -> [[UIView]] { rows }
    public static func buildOptional(_ rows: [[UIView]]?) -> [[UIView]] { rows ?? [] }
    public static func buildEither(first: [[UIView]]) -> [[UIView]] { first }
    public static func buildEither(second: [[UIView]]) -> [[UIView]] { second }
    public static func buildArray(_ rows: [[[UIView]]]) -> [[UIView]] { rows.flatMap { $0 } }
}

public final class JdColumnsView: UIView {

    public private(set) var columns: [JdColumn]

    /// 열 사이 간격. `JdGap`만 받는다 — 원시 CGFloat 하드코딩 차단(JdStackView와 같은 규칙).
    public var columnGap: JdGap {
        didSet { invalidate() }
    }
    /// 행 사이 간격
    public var rowGap: JdGap {
        didSet { invalidate() }
    }

    /// 행별 셀. 열 개수보다 셀이 적은 행은 빈 칸으로 남는다(마지막 행이 덜 찬 표를 허용).
    public private(set) var rows: [[UIView]] = []

    public init(
        columns: [JdColumn],
        gap: JdGap = .sm,
        rowGap: JdGap = .sm,
        @JdRowBuilder rows: () -> [[UIView]]
    ) {
        self.columns = columns
        self.columnGap = gap
        self.rowGap = rowGap
        super.init(frame: .zero)
        setRows(rows())
    }

    required public init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    // MARK: - 내용

    /// 행을 통째로 교체한다. 목록이 갱신되는 표의 주 경로다.
    public func setRows(_ newRows: [[UIView]]) {
        for cell in rows.flatMap({ $0 }) where cell.superview === self {
            cell.removeFromSuperview()
        }
        rows = newRows
        for cell in newRows.flatMap({ $0 }) {
            cell.translatesAutoresizingMaskIntoConstraints = true  // frame 배치
            addSubview(cell)
        }
        invalidate()
    }

    /// 열 규칙을 바꾼다(예: 좁은 화면에서 열 하나를 접을 때)
    public func setColumns(_ newColumns: [JdColumn]) {
        columns = newColumns
        invalidate()
    }

    // MARK: - 레이아웃

    public override func layoutSubviews() {
        super.layoutSubviews()
        _ = solve(width: bounds.width, place: true)
    }

    public override var intrinsicContentSize: CGSize {
        guard bounds.width > 0 else {
            return CGSize(width: UIView.noIntrinsicMetric, height: UIView.noIntrinsicMetric)
        }
        return CGSize(
            width: UIView.noIntrinsicMetric, height: solve(width: bounds.width, place: false))
    }

    public override func sizeThatFits(_ size: CGSize) -> CGSize {
        CGSize(width: size.width, height: solve(width: size.width, place: false))
    }

    private func invalidate() {
        invalidateIntrinsicContentSize()
        setNeedsLayout()
    }

    private func align(_ index: Int) -> JdColumn.Align {
        index < columns.count ? columns[index].align : .fill
    }

    /// 열 폭을 풀고(전 행 공유) 배치까지 겸한다. 반환값은 필요한 전체 높이.
    private func solve(width total: CGFloat, place: Bool) -> CGFloat {
        guard !rows.isEmpty, !columns.isEmpty, total > 0 else { return 0 }

        let widths = resolveColumnWidths(total: total)
        let isRTL = effectiveUserInterfaceLayoutDirection == .rightToLeft

        var y: CGFloat = 0
        for row in rows {
            // 행 높이 = 그 행 셀들이 **자기 열 폭에서** 요구하는 높이의 최대값.
            // 열 폭이 먼저 정해져야 높이를 알 수 있다 — 그래서 두 단계다.
            var heights: [CGFloat] = []
            for (index, cell) in row.enumerated() where index < widths.count {
                heights.append(measure(cell, width: widths[index]).height)
            }
            let rowHeight = heights.max() ?? 0

            if place {
                var x: CGFloat = 0
                for (index, cell) in row.enumerated() {
                    guard index < widths.count else { break }
                    let colWidth = widths[index]
                    let cellSize = measure(cell, width: colWidth)
                    let w = align(index) == .fill ? colWidth : min(cellSize.width, colWidth)
                    let offset: CGFloat
                    switch align(index) {
                    case .start, .fill: offset = 0
                    case .center: offset = (colWidth - w) / 2
                    case .end: offset = colWidth - w
                    }
                    // 세로는 행 안에서 중앙 — 높이가 다른 셀이 섞여도 기준선이 흔들리지 않는다
                    let cellY = y + (rowHeight - cellSize.height) / 2
                    let originX = isRTL ? total - (x + offset) - w : x + offset
                    cell.frame = CGRect(x: originX, y: cellY, width: w, height: cellSize.height)
                    x += colWidth + columnGap.value
                }
            }
            y += rowHeight + rowGap.value
        }
        return max(0, y - rowGap.value)
    }

    /// fixed → fit → flexible 순으로 폭을 확정한다.
    /// fit은 **전 행을 훑어** 가장 넓은 내용을 찾는다 — 이게 열이 맞는 이유다.
    private func resolveColumnWidths(total: CGFloat) -> [CGFloat] {
        let gaps = columnGap.value * CGFloat(max(columns.count - 1, 0))
        var widths = [CGFloat](repeating: 0, count: columns.count)
        var flexIndexes: [Int] = []
        var flexWeightTotal: CGFloat = 0
        var consumed: CGFloat = 0

        for (index, column) in columns.enumerated() {
            switch column.width {
            case .fixed(let w):
                widths[index] = max(0, w)
                consumed += widths[index]
            case .fit(let cap):
                var widest: CGFloat = 0
                for row in rows where index < row.count {
                    // 상한 없는 제안으로 측정 — 내용이 원하는 폭을 알아야 한다
                    widest = max(widest, measure(row[index], width: .greatestFiniteMagnitude).width)
                }
                widths[index] = min(widest, cap)
                consumed += widths[index]
            case .flex(let weight):
                flexIndexes.append(index)
                flexWeightTotal += max(0, weight)
            }
        }

        let remaining = max(0, total - gaps - consumed)
        if !flexIndexes.isEmpty {
            if flexWeightTotal <= 0 {
                // 가중치가 전부 0이면 균등 분배 — 0으로 나누지 않는다
                let each = remaining / CGFloat(flexIndexes.count)
                for index in flexIndexes { widths[index] = each }
            } else {
                for index in flexIndexes {
                    guard case .flex(let weight) = columns[index].width else { continue }
                    widths[index] = remaining * max(0, weight) / flexWeightTotal
                }
            }
        } else if consumed + gaps > total {
            // 신축 열이 없는데 넘친다 → fit 열을 비율로 줄여 잘림을 막는다.
            // 고정 열은 소비자가 의도한 값이므로 건드리지 않는다.
            let fitIndexes = columns.indices.filter {
                if case .fit = columns[$0].width { return true }
                return false
            }
            let fitTotal = fitIndexes.reduce(0) { $0 + widths[$1] }
            let over = consumed + gaps - total
            if fitTotal > 0 {
                let scale = max(0, (fitTotal - over) / fitTotal)
                for index in fitIndexes { widths[index] *= scale }
            }
        }
        return widths
    }

    /// 셀 측정 — 규칙은 JdMeasure 한 곳에 있다 (DEC-046).
    /// 여기서 직접 sizeThatFits만 묻던 옛 코드는 내부 제약으로 크기가 정해지는 셀에 0을
    /// 받아 행 높이를 0으로 접었다.
    private func measure(_ view: UIView, width: CGFloat) -> CGSize {
        JdMeasure.size(of: view, width: width)
    }
}
