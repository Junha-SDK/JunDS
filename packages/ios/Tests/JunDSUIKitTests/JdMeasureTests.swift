import JunDSCore
import UIKit
import XCTest

@testable import JunDSUIKit

// JdMeasure 전용 스위트 (DEC-048).
//
// 왜 전용 파일인가: 측정 결함이 **두 번 연속** 같은 방식으로 났다.
//  · DEC-046 — 내부 제약으로 크기가 정해지는 카드가 0높이로 접혀 KPI 행이 비었다.
//  · DEC-047 — 흐름 배치에서 칩이 컨테이너 폭을 요구해 한 줄에 하나씩 깔렸다.
// 둘 다 컴포넌트를 만들다가 **우연히** 드러났다. 원인은 같다: 테스트 픽스처가
// `sizeThatFits`를 재정의해 첫 경로에서 답이 나왔고, 나머지 경로를 밟지 않았다.
//
// 그래서 여기서는 픽스처를 쓰지 않는다. **진짜 UIKit 뷰 세 종류**로 세 경로를 각각
// 강제하고, 지금까지 밟은 함정을 전제까지 함께 단언한다.
@MainActor
final class JdMeasureTests: XCTestCase {

    // MARK: - 경로별 대표 뷰 (재정의 없음 — 그게 요점이다)

    /// 경로 ① 내부 Auto Layout 제약으로만 크기가 정해지는 컨테이너.
    /// sizeThatFits도 intrinsicContentSize도 재정의하지 않는다.
    private final class ConstraintCard: UIView {
        let label = UILabel()
        init(_ text: String, padding: CGFloat = 10, lines: Int = 1) {
            super.init(frame: .zero)
            label.text = text
            label.numberOfLines = lines
            label.translatesAutoresizingMaskIntoConstraints = false
            addSubview(label)
            NSLayoutConstraint.activate([
                label.topAnchor.constraint(equalTo: topAnchor, constant: padding),
                label.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -padding),
                label.leadingAnchor.constraint(equalTo: leadingAnchor, constant: padding),
                label.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -padding),
            ])
        }
        required init?(coder: NSCoder) { fatalError() }
    }

    /// 경로 ② 스스로 배치하고 sizeThatFits로만 크기를 말하는 뷰(우리 랩·열 뷰가 이 부류).
    private final class SelfLayingView: UIView {
        override func sizeThatFits(_ size: CGSize) -> CGSize {
            // 폭이 좁으면 두 줄이 된다고 답한다 — 폭 의존 높이를 흉내
            let w = min(size.width, 200)
            return CGSize(width: w, height: w < 120 ? 60 : 30)
        }
    }

    /// 경로 ③ 내용 리프 — UILabel(intrinsicContentSize)
    private func contentLeaf(_ text: String) -> UILabel {
        let l = UILabel()
        l.text = text
        return l
    }

    // MARK: - 전제: 프레임워크가 실제로 답을 안 준다

    // 이 전제가 깨지면(UIKit 동작 변경) JdMeasure의 존재 이유가 바뀐다 — 그때 알아야 한다
    func test_premise_uikit_defaults_do_not_answer_for_constraint_containers() {
        let card = ConstraintCard("USD/KRW")
        XCTAssertEqual(
            card.sizeThatFits(CGSize(width: 132, height: 999)), .zero,
            "UIView 기본 sizeThatFits는 bounds(=0)를 돌려준다")
        XCTAssertEqual(card.intrinsicContentSize.width, UIView.noIntrinsicMetric)
        XCTAssertEqual(card.intrinsicContentSize.height, UIView.noIntrinsicMetric)
    }

    // MARK: - 세 경로가 각각 쓰인다

    func test_path1_constraint_container_is_measured_by_system_layout() {
        let card = ConstraintCard("USD/KRW", padding: 10)
        let size = JdMeasure.size(of: card, width: 132)
        XCTAssertGreaterThan(size.height, 20, "위아래 패딩 20 + 라벨 높이를 읽지 못했다")
        XCTAssertLessThanOrEqual(size.width, 132)
    }

    func test_path2_self_laying_view_falls_through_to_sizeThatFits() {
        let view = SelfLayingView()
        XCTAssertEqual(JdMeasure.size(of: view, width: 300).height, 30, accuracy: 0.001)
        // 폭 의존 높이도 그대로 전달된다
        XCTAssertEqual(JdMeasure.size(of: view, width: 100).height, 60, accuracy: 0.001)
    }

    func test_path3_content_leaf_uses_intrinsic() {
        let size = JdMeasure.size(of: contentLeaf("71,200"), width: .infinity)
        XCTAssertGreaterThan(size.width, 0)
        XCTAssertGreaterThan(size.height, 0)
    }

    // 순서가 뒤바뀌면 여기서 깨진다: 자체 배치 뷰는 제약이 없어 경로①이 0을 주고,
    // 경로②로 내려가야 한다. 반대 순서면 컨테이너가 0높이로 접힌다(DEC-046 재발).
    func test_path_order_is_system_then_fits_then_intrinsic() {
        let card = ConstraintCard("A")
        let selfLaying = SelfLayingView()
        XCTAssertGreaterThan(JdMeasure.size(of: card, width: 200).height, 0)
        XCTAssertGreaterThan(JdMeasure.size(of: selfLaying, width: 200).height, 0)
    }

    // MARK: - 함정 ①: .greatestFiniteMagnitude 는 유한하다 (DEC-047)

    func test_greatestFiniteMagnitude_is_treated_as_unbounded() {
        XCTAssertTrue(
            CGFloat.greatestFiniteMagnitude.isFinite,
            "전제: isFinite 만으로는 '무제한'을 판정할 수 없다")
        let card = ConstraintCard("아주아주긴텍스트라벨입니다")
        let huge = JdMeasure.size(of: card, width: .greatestFiniteMagnitude)
        let infinite = JdMeasure.size(of: card, width: .infinity)
        XCTAssertEqual(
            huge.width, infinite.width, accuracy: 0.5,
            "greatestFiniteMagnitude 를 '폭 1.8e308으로 강제'로 읽고 있다")
        XCTAssertLessThan(huge.width, JdMeasure.unboundedThreshold)
    }

    // MARK: - 함정 ②: 흐름과 격자는 다른 측정이다 (DEC-047)

    // 격자는 폭을 강제한다 — 그래서 열이 맞는다
    func test_grid_measurement_forces_the_given_width() {
        let card = ConstraintCard("짧음")
        XCTAssertEqual(
            JdMeasure.size(of: card, width: 300).width, 300, accuracy: 0.5,
            "격자 측정이 폭을 강제하지 않으면 열이 어긋난다")
    }

    // 흐름은 자연 폭을 쓴다 — 강제하면 아이템마다 컨테이너 폭을 요구해 한 줄에 하나가 된다
    func test_flow_measurement_uses_natural_width() {
        let card = ConstraintCard("짧음")
        let flow = JdMeasure.flowSize(of: card, maxWidth: 300)
        XCTAssertLessThan(flow.width, 200, "흐름 측정이 폭을 강제하고 있다")
        XCTAssertGreaterThan(flow.width, 0)
    }

    // 자연 폭이 컨테이너보다 넓으면 그때만 강제한다(여러 줄 높이를 얻기 위해)
    func test_flow_clamps_and_remeasures_when_wider_than_container() {
        let wide = ConstraintCard("아주 긴 텍스트를 가진 카드입니다 줄바꿈이 필요합니다", lines: 0)
        let natural = JdMeasure.flowSize(of: wide, maxWidth: .infinity)
        let clamped = JdMeasure.flowSize(of: wide, maxWidth: 120)
        XCTAssertGreaterThan(natural.width, 120, "전제: 이 카드는 120보다 넓다")
        XCTAssertLessThanOrEqual(clamped.width, 120.5, "컨테이너를 넘쳤다")
        XCTAssertGreaterThan(clamped.height, natural.height, "좁힌 만큼 높이가 늘어야 한다")
    }

    // MARK: - 경계값

    func test_zero_and_negative_width_are_safe() {
        let card = ConstraintCard("A")
        XCTAssertGreaterThanOrEqual(JdMeasure.size(of: card, width: 0).height, 0)
        XCTAssertGreaterThanOrEqual(JdMeasure.size(of: card, width: -10).height, 0)
        XCTAssertGreaterThanOrEqual(JdMeasure.flowSize(of: card, maxWidth: 0).height, 0)
    }

    func test_empty_view_measures_to_zero_without_crashing() {
        let empty = UIView()
        let size = JdMeasure.size(of: empty, width: 100)
        XCTAssertEqual(size.height, 0)
        XCTAssertGreaterThanOrEqual(size.width, 0)
    }

    // 측정은 부작용이 없어야 한다 — 두 번 재도 같은 답이고 뷰 상태를 바꾸지 않는다
    func test_measurement_is_pure() {
        let card = ConstraintCard("USD/KRW")
        let before = card.frame
        let first = JdMeasure.size(of: card, width: 132)
        let second = JdMeasure.size(of: card, width: 132)
        XCTAssertEqual(first, second)
        XCTAssertEqual(card.frame, before, "측정이 프레임을 건드렸다")
    }
}
