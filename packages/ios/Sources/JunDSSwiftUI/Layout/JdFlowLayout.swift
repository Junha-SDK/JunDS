import JunDSCore
import SwiftUI

// 웹 jd-group(row·wrap·gap sm·align center) 번역 — iOS 16 Layout 프로토콜 (DESIGN §2.2).
// 좌→우 흐름, 넘치면 다음 행, 행 내 세로 중앙 정렬(웹 align-items: center 동형).
// RTL은 Layout이 자동 반전 처리(leading 기준 배치). 아이템 수가 작아 캐시는 두지 않는다.
public struct JdFlowLayout: Layout {

    private let spacing: CGFloat  // 행 안 아이템 간격 — 웹 gap sm(8) 기본
    private let rowSpacing: CGFloat  // 행 사이 간격 — 미지정 시 spacing과 동일(웹 gap 단일값 동형)

    public init(spacing: CGFloat = JdToken.Space.s2, rowSpacing: CGFloat? = nil) {
        self.spacing = spacing
        self.rowSpacing = rowSpacing ?? spacing
    }

    public func sizeThatFits(
        proposal: ProposedViewSize, subviews: Subviews, cache: inout ()
    ) -> CGSize {
        // 폭 제안이 없으면 무한 폭 취급 — 한 행에 전부 배치
        let rows = makeRows(maxWidth: proposal.width ?? .infinity, subviews: subviews)
        let width = rows.map(\.width).max() ?? 0
        let height =
            rows.map(\.height).reduce(0, +)
            + rowSpacing * CGFloat(max(rows.count - 1, 0))
        return CGSize(width: width, height: height)
    }

    public func placeSubviews(
        in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()
    ) {
        let rows = makeRows(maxWidth: bounds.width, subviews: subviews)
        var y = bounds.minY
        for row in rows {
            var x = bounds.minX
            for item in row.items {
                // 행 내 세로 중앙 정렬
                let itemY = y + (row.height - item.size.height) / 2
                subviews[item.index].place(
                    at: CGPoint(x: x, y: itemY),
                    proposal: ProposedViewSize(item.size))
                x += item.size.width + spacing
            }
            y += row.height + rowSpacing
        }
    }

    // MARK: 내부 — 행 분해

    private struct Item {
        let index: Int
        let size: CGSize
    }

    private struct Row {
        var items: [Item] = []
        var width: CGFloat = 0
        var height: CGFloat = 0
    }

    private func makeRows(maxWidth: CGFloat, subviews: Subviews) -> [Row] {
        var rows: [Row] = []
        var current = Row()
        for (index, subview) in subviews.enumerated() {
            let size = subview.sizeThatFits(.unspecified)
            let needed = current.items.isEmpty ? size.width : current.width + spacing + size.width
            // 폭 초과 시 다음 행으로 — 단독으로도 넘치는 아이템은 자기 행을 차지
            if !current.items.isEmpty && needed > maxWidth {
                rows.append(current)
                current = Row()
            }
            current.width =
                current.items.isEmpty ? size.width : current.width + spacing + size.width
            current.height = max(current.height, size.height)
            current.items.append(Item(index: index, size: size))
        }
        if !current.items.isEmpty {
            rows.append(current)
        }
        return rows
    }
}
