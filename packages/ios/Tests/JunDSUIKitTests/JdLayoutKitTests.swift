import JunDSCore
import UIKit
import XCTest

@testable import JunDSUIKit

// 선언형 배치 + 열 정렬 계약 (DEC-042).
//
// 이 파일이 지키는 약속은 하나다: **"진짜 어렵고 복잡한 것도 문제없이"**. 그래서 쉬운
// 케이스가 아니라 어긋나기 쉬운 케이스를 본다 — 행 간 열 공유, 폭 부족, 마지막 행이 덜 찬
// 표, RTL, 반응형 축 전환, 그리고 보고 높이와 실제 배치의 일치.
@MainActor
final class JdLayoutKitTests: XCTestCase {

    private final class Box: UIView {
        private let size: CGSize
        init(_ w: CGFloat, _ h: CGFloat) {
            size = CGSize(width: w, height: h)
            super.init(frame: .zero)
        }
        required init?(coder: NSCoder) { fatalError() }
        override var intrinsicContentSize: CGSize { size }
        override func sizeThatFits(_ s: CGSize) -> CGSize {
            // 폭이 좁으면 줄바꿈처럼 높이가 늘어나는 라벨을 흉내낸다
            guard s.width.isFinite, s.width < size.width, s.width > 0 else { return size }
            let lines = (size.width / s.width).rounded(.up)
            return CGSize(width: s.width, height: size.height * lines)
        }
    }

    private func laidOut(_ view: UIView, width: CGFloat) {
        let height = view.sizeThatFits(
            CGSize(width: width, height: CGFloat.greatestFiniteMagnitude)
        ).height
        view.frame = CGRect(x: 0, y: 0, width: width, height: height)
        view.layoutSubviews()
    }

    // MARK: - 선언형 트리

    // 블록으로 적은 트리가 실제로 만들어지고, addSubview를 소비자가 만지지 않는다
    func test_builder_creates_nested_tree_without_manual_addSubview() {
        let leaf = Box(40, 20)
        let stack = JdVStack(gap: .sm) {
            Box(60, 20)
            JdHStack(gap: .xs) {
                leaf
                JdFlex()
            }
        }
        XCTAssertEqual(stack.arrangedSubviews.count, 2)
        let inner = stack.arrangedSubviews[1] as? JdStackView
        XCTAssertNotNil(inner, "중첩 스택이 아이템으로 들어가지 않았다")
        XCTAssertEqual(inner?.arrangedSubviews.count, 2)
        XCTAssertTrue(leaf.superview === inner, "빌더가 자식을 붙이지 않았다")
    }

    // if / for / 옵셔널이 블록 안에서 동작한다 — 조건부 화면을 적을 수 있어야 한다
    func test_builder_supports_control_flow() {
        let showExtra = false
        let optional: UIView? = nil
        let stack = JdVStack {
            Box(10, 10)
            if showExtra { Box(10, 10) }
            optional
            for _ in 0..<3 { Box(10, 10) }
        }
        XCTAssertEqual(stack.arrangedSubviews.count, 4, "1 + (조건 거짓 0) + (nil 0) + 3")
    }

    func test_padding_uses_layout_margins_not_a_wrapper_view() {
        let stack = JdVStack(padding: .md) { Box(10, 10) }
        XCTAssertTrue(stack.isLayoutMarginsRelativeArrangement)
        XCTAssertEqual(stack.directionalLayoutMargins.top, JdGap.md.value)
        XCTAssertEqual(stack.arrangedSubviews.count, 1, "패딩 때문에 래퍼가 한 겹 더 생겼다")
    }

    // 신축 여백은 고정 간격(JdSpacerView)과 다른 물건이다 — 섞이면 배치가 무너진다
    func test_flex_spacer_is_zero_sized_and_lowest_priority() {
        let flex = JdFlexSpacerView()
        XCTAssertEqual(flex.intrinsicContentSize, .zero)
        XCTAssertLessThan(
            flex.contentHuggingPriority(for: .horizontal),
            JdSpacerView(.md, axis: .horizontal).contentHuggingPriority(for: .horizontal),
            "신축 여백이 고정 간격보다 우선순위가 높으면 밀어내기가 안 된다")
    }

    // jdFill은 addSubview를 스스로 한다 — jd.layout의 preconditionFailure 함정이 불가능해진다
    func test_jdFill_attaches_and_constrains_in_one_call() {
        let parent = UIView(frame: CGRect(x: 0, y: 0, width: 100, height: 50))
        let child = Box(10, 10)
        child.jdFill(parent)
        XCTAssertTrue(child.superview === parent)
        parent.layoutIfNeeded()
        XCTAssertEqual(child.frame, parent.bounds)
    }

    func test_jdSize_modifiers_chain_and_return_self() {
        let box = Box(10, 10).jdSize(44)
        let parent = UIView(frame: CGRect(x: 0, y: 0, width: 200, height: 200))
        parent.addSubview(box)
        box.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            box.topAnchor.constraint(equalTo: parent.topAnchor),
            box.leadingAnchor.constraint(equalTo: parent.leadingAnchor),
        ])
        parent.layoutIfNeeded()
        XCTAssertEqual(box.frame.size, CGSize(width: 44, height: 44))
    }

    // MARK: - 열 정렬 — 스택이 못 하는 일

    // 핵심 계약: `fit` 열은 **전 행에서 가장 넓은 내용**에 맞는다. 이게 표가 맞는 이유다.
    func test_fit_column_width_is_shared_across_all_rows() {
        let narrow = Box(40, 20)
        let wide = Box(120, 20)
        let table = JdColumnsView(columns: [.fit(), .flex()], gap: .custom(10)) {
            [narrow, Box(30, 20)]
            [wide, Box(30, 20)]
        }
        laidOut(table, width: 400)
        XCTAssertEqual(
            narrow.frame.width, 120, accuracy: 0.001,
            "1행 셀이 자기 내용(40)만큼만 잡혔다 — 열이 공유되지 않는다")
        XCTAssertEqual(wide.frame.width, 120, accuracy: 0.001)
        // 두 행의 두 번째 열도 같은 x에서 시작해야 한다
        let secondColumnXs = table.rows.map { $0[1].frame.minX }
        XCTAssertEqual(Set(secondColumnXs).count, 1, "열 시작 x가 행마다 다르다")
    }

    func test_fixed_and_flexible_columns_split_remaining_width() {
        let a = Box(10, 20)
        let b = Box(10, 20)
        let c = Box(10, 20)
        let table = JdColumnsView(
            columns: [.fixed(60), .flex(weight: 1), .flex(weight: 3)],
            gap: .custom(10)
        ) {
            [a, b, c]
        }
        laidOut(table, width: 280)  // 280 - 60 - 20(gap) = 200 → 50 / 150
        XCTAssertEqual(a.frame.width, 60, accuracy: 0.001)
        XCTAssertEqual(b.frame.width, 50, accuracy: 0.001)
        XCTAssertEqual(c.frame.width, 150, accuracy: 0.001)
    }

    // 가중치가 전부 0이어도 0으로 나누지 않고 균등 분배한다
    func test_zero_weights_fall_back_to_equal_split() {
        let a = Box(10, 20)
        let b = Box(10, 20)
        let table = JdColumnsView(
            columns: [.flex(weight: 0), .flex(weight: 0)],
            gap: .none
        ) { [a, b] }
        laidOut(table, width: 200)
        XCTAssertEqual(a.frame.width, 100, accuracy: 0.001)
        XCTAssertEqual(b.frame.width, 100, accuracy: 0.001)
    }

    // 열 정렬 — 숫자 열은 trailing이라야 자리수가 달라도 끝이 맞는다
    func test_column_alignment_places_cell_within_its_column() {
        let lead = Box(40, 20)
        let center = Box(40, 20)
        let trail = Box(40, 20)
        // 정렬이 폭 규칙과 **한 값**에 붙어 있다 — 인덱스로 짝을 맞출 일이 없다
        let table = JdColumnsView(
            columns: [
                .fixed(100, align: .start),
                .fixed(100, align: .center),
                .fixed(100, align: .end),
            ],
            gap: .none
        ) {
            [lead, center, trail]
        }
        laidOut(table, width: 300)
        XCTAssertEqual(lead.frame.minX, 0, accuracy: 0.001)
        XCTAssertEqual(center.frame.midX, 150, accuracy: 0.001)
        XCTAssertEqual(trail.frame.maxX, 300, accuracy: 0.001)
        // fill이 아니면 셀은 자기 내용 폭을 지킨다
        XCTAssertEqual(lead.frame.width, 40, accuracy: 0.001)
    }

    // 폭이 모자라면 fit 열을 줄여 잘림을 막는다. 고정 열은 소비자 의도라 건드리지 않는다.
    func test_overflow_shrinks_fit_columns_not_fixed_ones() {
        let fixed = Box(10, 20)
        let fit = Box(300, 20)
        let table = JdColumnsView(columns: [.fixed(80), .fit()], gap: .none) { [fixed, fit] }
        laidOut(table, width: 200)
        XCTAssertEqual(fixed.frame.width, 80, accuracy: 0.001, "고정 열이 줄어들었다")
        XCTAssertLessThanOrEqual(fit.frame.maxX, 200.001, "내용이 컨테이너를 넘쳤다")
    }

    func test_fit_column_respects_max_cap() {
        let cell = Box(300, 20)
        let table = JdColumnsView(columns: [.fit(max: 100), .flex()], gap: .none) {
            [cell, Box(10, 20)]
        }
        laidOut(table, width: 400)
        XCTAssertEqual(cell.frame.width, 100, accuracy: 0.001)
    }

    // 마지막 행이 덜 찬 표 — 빈 칸이 남을 뿐 깨지지 않는다(웹 KeyValueGrid 결함의 iOS 방지)
    func test_ragged_last_row_does_not_break_layout() {
        let table = JdColumnsView(columns: [.flex(), .flex(), .flex()], gap: .sm) {
            [Box(10, 20), Box(10, 20), Box(10, 20)]
            [Box(10, 20)]
        }
        laidOut(table, width: 320)
        XCTAssertEqual(table.rows[1].count, 1)
        XCTAssertGreaterThan(table.rows[1][0].frame.minY, table.rows[0][0].frame.minY)
        XCTAssertEqual(table.rows[1][0].frame.minX, 0, accuracy: 0.001)
    }

    // 보고 높이 == 실제 배치 하단. 어긋나면 부모가 자르거나 빈 공간을 남긴다.
    func test_reported_height_matches_placed_rows() {
        let table = JdColumnsView(
            columns: [.flex(), .flex()], gap: .custom(10), rowGap: .custom(6)
        ) {
            [Box(10, 20), Box(10, 30)]
            [Box(10, 20), Box(10, 20)]
        }
        let reported = table.sizeThatFits(
            CGSize(width: 200, height: CGFloat.greatestFiniteMagnitude)
        ).height
        laidOut(table, width: 200)
        let bottom = table.rows.flatMap { $0 }.map(\.frame.maxY).max() ?? 0
        XCTAssertEqual(reported, bottom, accuracy: 0.001)
        XCTAssertEqual(reported, 56, accuracy: 0.001, "max(20,30)=30 + 6 + 20")
    }

    // 좁은 폭에서 셀이 여러 줄이 되면 행 높이가 그만큼 늘어난다 — 폭→높이 순서가 맞아야 한다
    func test_row_height_follows_cell_height_at_its_column_width() {
        let tall = Box(200, 20)  // 폭 100이면 2줄 → 높이 40
        let table = JdColumnsView(columns: [.fixed(100), .fixed(100)], gap: .none) {
            [tall, Box(10, 20)]
        }
        laidOut(table, width: 200)
        XCTAssertEqual(tall.frame.height, 40, accuracy: 0.001)
        XCTAssertEqual(
            table.sizeThatFits(CGSize(width: 200, height: CGFloat.greatestFiniteMagnitude)).height,
            40, accuracy: 0.001)
    }

    func test_set_rows_replaces_children() {
        let table = JdColumnsView(columns: [.flex()], gap: .none) { [Box(10, 10)] }
        let fresh = Box(10, 10)
        table.setRows([[fresh]])
        XCTAssertEqual(table.subviews.count, 1)
        XCTAssertTrue(table.subviews.first === fresh)
    }

    func test_empty_table_and_zero_width_are_safe() {
        let empty = JdColumnsView(columns: [.flex()], gap: .none) {}
        XCTAssertEqual(empty.sizeThatFits(CGSize(width: 200, height: 200)).height, 0)
        let table = JdColumnsView(columns: [.flex()], gap: .none) { [Box(10, 10)] }
        XCTAssertEqual(table.sizeThatFits(CGSize(width: 0, height: 200)).height, 0)
    }

    // MARK: - 반응형 축 전환

    func test_adaptive_stack_flips_axis_below_breakpoint() {
        let stack = JdAdaptiveStackView(breakpoint: 400, wideAxis: .horizontal) {
            Box(10, 10); Box(10, 10)
        }
        stack.frame = CGRect(x: 0, y: 0, width: 500, height: 100)
        stack.layoutSubviews()
        XCTAssertEqual(stack.stack.axis, .horizontal)
        XCTAssertFalse(stack.isCompact)

        stack.frame = CGRect(x: 0, y: 0, width: 320, height: 100)
        stack.layoutSubviews()
        XCTAssertEqual(stack.stack.axis, .vertical, "임계값 미만인데 축이 안 바뀌었다")
        XCTAssertTrue(stack.isCompact)

        stack.frame = CGRect(x: 0, y: 0, width: 500, height: 100)
        stack.layoutSubviews()
        XCTAssertEqual(stack.stack.axis, .horizontal, "넓어질 때 되돌아오지 않는다")
    }

    // 폭 0(부모가 아직 폭을 안 준 상태)에서는 좁다고 판정하지 않는다 — 초기 1프레임 깜빡임 방지
    func test_adaptive_stack_ignores_zero_width() {
        let stack = JdAdaptiveStackView(breakpoint: 400) { Box(10, 10) }
        stack.frame = .zero
        stack.layoutSubviews()
        XCTAssertFalse(stack.isCompact)
        XCTAssertEqual(stack.stack.axis, .horizontal)
    }

    // MARK: - 읽기 표면 계약 (DEC-043)
    //
    // 가독성은 취향이 아니라 **기본값**의 문제다. JdVStack/JdHStack이 웹 jd-vstack/jd-hstack의
    // 기본값을 그대로 갖지 않으면, 소비자가 매번 인자를 적어야 해서 호출부가 길어진다.

    func test_axis_named_constructors_carry_web_defaults() {
        let v = JdVStack { Box(10, 10) }
        XCTAssertEqual(v.axis, .vertical)
        XCTAssertEqual(v.spacing, JdGap.md.value, "웹 jd-vstack 기본 gap md")
        XCTAssertEqual(v.alignment, .fill, "웹 stretch")

        let h = JdHStack { Box(10, 10) }
        XCTAssertEqual(h.axis, .horizontal)
        XCTAssertEqual(h.spacing, JdGap.sm.value, "웹 jd-hstack 기본 gap sm")
        XCTAssertEqual(h.alignment, .center)
    }

    // 웹 어휘 → UIKit 매핑. stretch가 .fill인 것이 유일한 이름 차이다.
    func test_align_vocabulary_maps_to_uikit() {
        XCTAssertEqual(JdAlign.start.uiStackAlignment, .leading)
        XCTAssertEqual(JdAlign.center.uiStackAlignment, .center)
        XCTAssertEqual(JdAlign.end.uiStackAlignment, .trailing)
        XCTAssertEqual(JdAlign.stretch.uiStackAlignment, .fill)
        XCTAssertEqual(JdAlign.baseline.uiStackAlignment, .firstBaseline)
        XCTAssertEqual(JdAlign.allCases.count, 5, "웹 ALIGN_MAP과 값 집합이 같아야 한다")
    }

    func test_align_argument_flows_into_stack() {
        XCTAssertEqual(JdHStack(align: .end) { Box(10, 10) }.alignment, .trailing)
        XCTAssertEqual(JdVStack(align: .start) { Box(10, 10) }.alignment, .leading)
    }

    // JdEdge — NSDirectionalEdgeInsets를 손으로 적지 않게 한다
    func test_edge_helpers_build_insets_from_tokens() {
        XCTAssertEqual(JdEdge.all(.md).top, JdGap.md.value)
        XCTAssertEqual(JdEdge.symmetric(v: .sm, h: .lg).leading, JdGap.lg.value)
        XCTAssertEqual(JdEdge.symmetric(v: .sm, h: .lg).top, JdGap.sm.value)
        XCTAssertEqual(JdEdge.only(top: .xs).bottom, 0)
    }

    // 열 정의가 **한 값**이라 폭과 정렬이 분리될 수 없다 — 평행 배열 시절의 조용한 오정렬 차단
    func test_column_bundles_width_and_align_in_one_value() {
        let column = JdColumn.fixed(96, align: .end)
        XCTAssertEqual(column.width, .fixed(96))
        XCTAssertEqual(column.align, .end)
        XCTAssertEqual(JdColumn.fit().align, .fill, "정렬 기본값은 fill")
        XCTAssertEqual(JdColumn.flex().width, .flex(weight: 1))
    }

    // 간격이 JdGap만 받는다 — 원시 CGFloat 하드코딩 차단(JdStackView와 같은 규칙)
    func test_column_gaps_are_token_typed() {
        let table = JdColumnsView(columns: [.flex(), .flex()], gap: .md, rowGap: .sm) {
            [Box(10, 20), Box(10, 20)]
            [Box(10, 20), Box(10, 20)]
        }
        XCTAssertEqual(table.columnGap, .md)
        XCTAssertEqual(table.rowGap, .sm)
        laidOut(table, width: 200)
        XCTAssertEqual(
            table.rows[0][1].frame.minX - table.rows[0][0].frame.maxX,
            JdGap.md.value, accuracy: 0.001)
    }

    // MARK: - 측정 회귀 (DEC-046)
    //
    // 위 Box 픽스처는 sizeThatFits를 **재정의**한다. 그래서 첫 경로에서 답이 나와 나머지
    // 경로를 밟지 않았고, 실제 결함(내부 제약으로 크기가 정해지는 뷰가 0높이로 접힘)을
    // 통과시켰다 — 시뮬레이터에서 KPI 행이 테두리 선만 남은 빈 줄로 렌더됐다.
    // 여기서는 **재정의하지 않은** 진짜 Auto Layout 뷰로 본다.

    /// 내부 스택을 네 변에 핀 컨테이너 — JdMicroKpiCellView와 같은 구조.
    /// sizeThatFits도 intrinsicContentSize도 재정의하지 않는다(그게 요점이다).
    private final class AutoLayoutCard: UIView {
        init(text: String) {
            super.init(frame: .zero)
            let label = UILabel()
            label.text = text
            label.numberOfLines = 1
            label.translatesAutoresizingMaskIntoConstraints = false
            addSubview(label)
            NSLayoutConstraint.activate([
                label.topAnchor.constraint(equalTo: topAnchor, constant: 10),
                label.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -10),
                label.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 12),
                label.trailingAnchor.constraint(lessThanOrEqualTo: trailingAnchor, constant: -12),
            ])
        }
        required init?(coder: NSCoder) { fatalError() }
    }

    // 이 단언이 DEC-046 이전 코드에서 실패한다 — sizeThatFits가 .zero를 주기 때문이다
    func test_measure_reads_internal_constraints_not_just_sizeThatFits() {
        let card = AutoLayoutCard(text: "USD/KRW")
        XCTAssertEqual(
            card.sizeThatFits(CGSize(width: 132, height: 999)), .zero,
            "전제 확인: 기본 sizeThatFits는 bounds(=0)를 돌려준다")
        XCTAssertEqual(
            card.intrinsicContentSize.height, UIView.noIntrinsicMetric,
            "전제 확인: 컨테이너는 고유 높이가 없다")

        let measured = JdMeasure.size(of: card, width: 132)
        XCTAssertGreaterThan(
            measured.height, 20,
            "내부 제약(위아래 10 + 라벨 높이)을 읽지 못했다 — 셀이 0높이로 접힌다")
        XCTAssertLessThanOrEqual(measured.width, 132)
    }

    // 자체 배치 뷰(제약 없음)는 두 번째 경로로 내려가야 한다 — 순서가 뒤바뀌면 여기서 깨진다
    func test_measure_falls_through_to_sizeThatFits_for_self_laying_views() {
        let inner = JdWrapView(itemSpacing: 8, [Box(40, 20), Box(40, 20)])
        let measured = JdMeasure.size(of: inner, width: 200)
        XCTAssertEqual(
            measured.height, 20, accuracy: 0.001,
            "자체 배치 뷰의 sizeThatFits를 쓰지 못했다")
    }

    func test_measure_uses_intrinsic_for_content_leaves() {
        let label = UILabel()
        label.text = "71,200"
        let measured = JdMeasure.size(of: label, width: CGFloat.greatestFiniteMagnitude)
        XCTAssertGreaterThan(measured.width, 0)
        XCTAssertGreaterThan(measured.height, 0)
    }

    // 랩·열 뷰가 Auto Layout 카드를 실제로 배치한다 — 결함의 최종 재현 지점
    func test_wrap_places_auto_layout_cards_with_real_height() {
        let wrap = JdWrapView(
            itemSpacing: 8, equalWidths: true, minItemWidth: 132,
            [AutoLayoutCard(text: "USD/KRW"), AutoLayoutCard(text: "외국인")])
        laidOut(wrap, width: 360)
        for card in wrap.arrangedViews {
            XCTAssertGreaterThan(card.frame.height, 20, "카드가 0높이로 접혔다")
            XCTAssertGreaterThan(card.frame.width, 0)
        }
        XCTAssertGreaterThan(
            wrap.sizeThatFits(CGSize(width: 360, height: CGFloat.greatestFiniteMagnitude)).height,
            20)
    }

    func test_columns_places_auto_layout_cards_with_real_height() {
        let table = JdColumnsView(columns: [.fit(), .flex()], gap: .sm) {
            [AutoLayoutCard(text: "삼성전자"), AutoLayoutCard(text: "71,200")]
        }
        laidOut(table, width: 320)
        for cell in table.rows[0] {
            XCTAssertGreaterThan(cell.frame.height, 20, "셀이 0높이로 접혔다")
        }
    }
}
