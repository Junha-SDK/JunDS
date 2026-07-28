import JunDSCore
import UIKit
import XCTest

@testable import JunDSUIKit

// DSL 표현력 (DEC-055) — "SnapKit으로는 되는데 우리는 안 되는" 목록을 없애는 축.
//
// 여기 있는 것들은 전부 실제로 막혀 있던 것이다:
// 다축을 상대 뷰에 축별로 붙이기 · 베이스라인 정렬 · 커스텀 UILayoutGuide 참조 ·
// multiplier 변경. 표현력이 모자라면 소비자는 결국 DSL을 버리고 원시 앵커로 내려가고,
// 그 순간 토큰 강제도 진단 identifier도 같이 사라진다.
@MainActor
final class JdLayoutExpressivenessTests: XCTestCase {

    private var host: UIView!

    override func setUp() {
        super.setUp()
        host = UIView(frame: CGRect(x: 0, y: 0, width: 320, height: 480))
    }

    // MARK: - 다축 → 상대 뷰의 같은 축

    // 이전에는 `equal(to: other.jd.leading)`밖에 없어서, 여러 축을 체이닝하면 전부
    // 상대의 leading으로 갔다(leading==trailing → 폭 0). 뷰를 그대로 넘기면 축이 맞는다.
    func test_multi_axis_equal_to_view_matches_each_axis() {
        let anchorView = UIView()
        anchorView.jdPin(to: host, edges: [.top, .leading])
        anchorView.jdSize(width: 200, height: 40)

        let child = UIView()
        host.addSubview(child)
        child.jd.layout {
            $0.leading.trailing.equal(to: anchorView)
            $0.top.equal(to: anchorView.jd.bottom, offset: 8)
            $0.height.equal(30)
        }
        host.layoutIfNeeded()

        XCTAssertEqual(child.frame.minX, anchorView.frame.minX, accuracy: 0.5)
        XCTAssertEqual(child.frame.maxX, anchorView.frame.maxX, accuracy: 0.5)
        XCTAssertEqual(child.frame.width, 200, accuracy: 0.5, "축이 맞지 않아 폭이 무너졌다")
        XCTAssertEqual(child.frame.minY, 48, accuracy: 0.5)
    }

    func test_edges_equal_to_view_with_inset() {
        let anchorView = UIView()
        anchorView.jdFill(host)

        let child = UIView()
        host.addSubview(child)
        child.jd.layout { $0.edges.equal(to: anchorView).inset(12) }
        host.layoutIfNeeded()

        XCTAssertEqual(child.frame.minX, 12, accuracy: 0.5)
        XCTAssertEqual(child.frame.maxX, 308, accuracy: 0.5)
        XCTAssertEqual(child.frame.minY, 12, accuracy: 0.5)
        XCTAssertEqual(child.frame.maxY, 468, accuracy: 0.5)
    }

    func test_gte_lte_also_accept_a_view() {
        let anchorView = UIView()
        anchorView.jdPin(to: host, edges: [.top, .leading])
        anchorView.jdSize(width: 100, height: 40)

        let child = UIView()
        host.addSubview(child)
        child.jd.layout {
            $0.leading.greaterThanOrEqual(to: anchorView)
            $0.trailing.lessThanOrEqual(to: anchorView)
            $0.top.equal(to: anchorView.jd.top)
            $0.height.equal(20)
        }
        let leading = JdConstraintStore.of(child).installedConstraint(for: .leading)
        XCTAssertEqual(leading?.relation, .greaterThanOrEqual)
        XCTAssertEqual(leading?.secondAttribute, .leading, "축이 맞아야 한다")
    }

    // MARK: - 베이스라인

    // 크기가 다른 글자를 나란히 놓을 때 centerY로 맞추면 글자가 떠 보인다.
    // 베이스라인 앵커가 아예 없어서 그 배치를 DSL로 표현할 수 없었다.
    func test_baseline_anchors_align_text_not_boxes() {
        let big = UILabel()
        big.text = "12,345"
        big.font = .systemFont(ofSize: 34, weight: .bold)
        big.jdPin(to: host, edges: [.top, .leading], padding: .md)

        let small = UILabel()
        small.text = "원"
        small.font = .systemFont(ofSize: 13)
        host.addSubview(small)
        small.jd.layout {
            $0.firstBaseline.equal(to: big.jd.firstBaseline)
            $0.leading.equal(to: big.jd.trailing, offset: 4)
        }
        host.layoutIfNeeded()

        // 베이스라인이 같으면 두 라벨의 밑선이 맞는다 — 박스 중앙은 서로 다르다.
        let bigBaseline = big.frame.maxY - big.font.descender * -1
        let smallBaseline = small.frame.maxY - small.font.descender * -1
        XCTAssertEqual(bigBaseline, smallBaseline, accuracy: 1.0)
        XCTAssertNotEqual(
            big.frame.midY, small.frame.midY, accuracy: 0.5,
            "중앙까지 같으면 이 테스트가 베이스라인을 검증하지 못한다")
    }

    func test_baseline_appears_in_diagnostic_identifier() {
        let label = UILabel()
        label.text = "x"
        label.jdPin(to: host, edges: [.leading])
        label.jd.layout { $0.firstBaseline.equal(to: host.jd.centerY) }
        let constraint = JdConstraintStore.of(label).installedConstraint(for: .firstBaseline)
        // 진단 문자열이 attr(12)로 찍히면 제약 충돌 로그를 읽는 가치가 반감된다
        XCTAssertEqual(constraint?.identifier?.contains("firstBaseline"), true)
    }

    // MARK: - 커스텀 UILayoutGuide

    // 여백 규칙을 한 번 정의해 여러 뷰가 공유하는 표준 기법. 지금까지 safeArea·margins만
    // 열려 있어서 커스텀 가이드를 쓰려면 DSL 밖으로 나가야 했다.
    func test_custom_layout_guide_can_be_referenced() {
        let gutter = UILayoutGuide()
        host.addLayoutGuide(gutter)
        NSLayoutConstraint.activate([
            gutter.leadingAnchor.constraint(equalTo: host.leadingAnchor, constant: 24),
            gutter.trailingAnchor.constraint(equalTo: host.trailingAnchor, constant: -24),
        ])

        let title = UIView()
        let body = UIView()
        for (index, view) in [title, body].enumerated() {
            host.addSubview(view)
            view.jd.layout {
                $0.leading.trailing.equal(to: gutter.jd)
                $0.top.equalToSuperview().offset(CGFloat(index) * 60)
                $0.height.equal(50)
            }
        }
        host.layoutIfNeeded()

        for view in [title, body] {
            XCTAssertEqual(view.frame.minX, 24, accuracy: 0.5)
            XCTAssertEqual(view.frame.width, 320 - 48, accuracy: 0.5)
        }
    }

    // MARK: - multiplier

    // 주석은 "update에서 변경 시 remake 필요"라고만 적혀 있었다. Key에 multiplier가
    // 들어 있으므로 layout 재호출은 새 제약을 만들고 옛 것을 stale로 걷어 갈 것으로
    // 보였는데, 확인한 적이 없었다. 확인해 둔다 — 되는 것을 안 된다고 알고 있으면
    // 소비자는 쓸 수 있는 길을 두고 remake로 돌아간다.
    func test_layout_handles_multiplier_change_without_remake() {
        let child = UIView()
        host.addSubview(child)
        child.jd.layout {
            $0.top.leading.equalToSuperview()
            $0.height.equal(20)
            $0.width.equal(to: host.jd.width).multiplier(0.5)
        }
        host.layoutIfNeeded()
        XCTAssertEqual(child.frame.width, 160, accuracy: 0.5)

        child.jd.layout {
            $0.top.leading.equalToSuperview()
            $0.height.equal(20)
            $0.width.equal(to: host.jd.width).multiplier(0.25)
        }
        host.setNeedsLayout()
        host.layoutIfNeeded()
        XCTAssertEqual(child.frame.width, 80, accuracy: 0.5, "multiplier 변경이 반영되지 않았다")
        // 옛 제약이 살아 있으면 0.5와 0.25가 동시에 걸려 충돌한다
        XCTAssertEqual(JdConstraintStore.of(child).installedCount, 4, "옛 multiplier 제약이 남았다")
    }
}
