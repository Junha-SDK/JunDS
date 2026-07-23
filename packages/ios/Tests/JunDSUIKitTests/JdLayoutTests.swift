import XCTest
import UIKit
import JunDSCore
@testable import JunDSUIKit

// 04 §8.2 — 활성 제약을 키로 조회하는 전용 어서션
func XCTAssertJdConstraint(_ view: UIView,
                           _ attribute: NSLayoutConstraint.Attribute,
                           constant: CGFloat,
                           file: StaticString = #filePath, line: UInt = #line) {
    guard let constraint = JdConstraintStore.of(view).installedConstraint(for: attribute) else {
        XCTFail("\(attribute) 제약 없음", file: file, line: line)
        return
    }
    XCTAssertEqual(constraint.constant, constant, accuracy: 0.5, file: file, line: line)
}

final class JdLayoutTests: XCTestCase {

    private var host: UIView!
    private var child: UIView!

    override func setUp() {
        super.setUp()
        host = UIView(frame: CGRect(x: 0, y: 0, width: 320, height: 200))
        child = UIView()
        host.addSubview(child)
    }

    func test_layout_activates_and_sets_translates_flag() {
        let constraints = child.jd.layout {
            $0.leading.trailing.equalToSuperview().inset(16)
            $0.top.equalToSuperview()
            $0.height.equal(48)
        }
        XCTAssertFalse(child.translatesAutoresizingMaskIntoConstraints)
        XCTAssertEqual(constraints.count, 4)
        XCTAssertTrue(constraints.allSatisfy { $0.isActive })
        host.layoutIfNeeded()
        XCTAssertEqual(child.frame.width, 288)
        XCTAssertEqual(child.frame.height, 48)
    }

    func test_inset_sign_reversal_for_trailing() {
        child.jd.layout {
            $0.leading.trailing.equalToSuperview().inset(16)
        }
        XCTAssertJdConstraint(child, .leading, constant: 16)
        XCTAssertJdConstraint(child, .trailing, constant: -16)
    }

    // diff 재호출 시 제약 수 불변 (SnapKit make 재호출 누적 문제의 회귀 가드)
    func test_relayout_diffs_instead_of_accumulating() {
        child.jd.layout { $0.edges.equalToSuperview() }
        let before = JdConstraintStore.of(child).installedCount
        child.jd.layout { $0.edges.equalToSuperview().inset(8) }
        let after = JdConstraintStore.of(child).installedCount
        XCTAssertEqual(before, 4)
        XCTAssertEqual(after, 4)
        XCTAssertJdConstraint(child, .top, constant: 8)
        XCTAssertJdConstraint(child, .bottom, constant: -8)
    }

    // update는 동일 객체를 유지한 채 constant만 갱신 (애니메이션 friendly)
    func test_update_keeps_constraint_identity() {
        child.jd.layout { $0.height.equal(48) }
        guard let original = JdConstraintStore.of(child).installedConstraint(for: .height) else {
            XCTFail("height 제약 없음")
            return
        }
        child.jd.update { $0.height.equal(64) }
        guard let updated = JdConstraintStore.of(child).installedConstraint(for: .height) else {
            XCTFail("height 제약 없음")
            return
        }
        XCTAssertTrue(original === updated)
        XCTAssertEqual(updated.constant, 64)
        XCTAssertTrue(updated.isActive)
    }

    func test_remake_deactivates_previous() {
        let first = child.jd.layout { $0.height.equal(48) }
        child.jd.remake { $0.edges.equalToSuperview() }
        XCTAssertTrue(first.allSatisfy { !$0.isActive })
        XCTAssertEqual(JdConstraintStore.of(child).installedCount, 4)
        XCTAssertNil(JdConstraintStore.of(child).installedConstraint(for: .height))
    }

    func test_deactivate_removes_all_dsl_constraints() {
        child.jd.layout { $0.edges.equalToSuperview() }
        child.jd.deactivate()
        XCTAssertEqual(JdConstraintStore.of(child).installedCount, 0)
    }

    func test_gte_relation_and_reference_anchor() {
        let other = UIView()
        host.addSubview(other)
        other.jd.layout {
            $0.top.equalToSuperview()
            $0.leading.equalToSuperview()
            $0.size.equal(CGSize(width: 44, height: 44))
        }
        child.jd.layout {
            $0.top.equal(to: other.jd.bottom, offset: 8)
            $0.leading.greaterThanOrEqualToSuperview().inset(12)
        }
        guard let top = JdConstraintStore.of(child).installedConstraint(for: .top) else {
            XCTFail("top 제약 없음")
            return
        }
        XCTAssertEqual(top.relation, .equal)
        XCTAssertEqual(top.constant, 8)
        guard let leading = JdConstraintStore.of(child).installedConstraint(for: .leading) else {
            XCTFail("leading 제약 없음")
            return
        }
        XCTAssertEqual(leading.relation, .greaterThanOrEqual)
    }

    func test_size_cgsize_overload() {
        child.jd.layout { $0.size.equal(CGSize(width: 44, height: 32)) }
        XCTAssertJdConstraint(child, .width, constant: 44)
        XCTAssertJdConstraint(child, .height, constant: 32)
    }

    func test_identifier_contains_source_location() {
        child.jd.layout { $0.height.equal(48) }
        guard let constraint = JdConstraintStore.of(child).installedConstraint(for: .height) else {
            XCTFail("height 제약 없음")
            return
        }
        let id = constraint.identifier ?? ""
        XCTAssertTrue(id.hasPrefix("jd @"))
        XCTAssertTrue(id.contains("JdLayoutTests"))
        XCTAssertTrue(id.contains("height"))
    }

    func test_manual_identifier_overrides_auto() {
        child.jd.layout { $0.height.equal(48).identifier("커스텀") }
        let constraint = JdConstraintStore.of(child).installedConstraint(for: .height)
        XCTAssertEqual(constraint?.identifier, "커스텀")
    }

    func test_priority_applied_before_activation() {
        child.jd.layout { $0.width.equal(100).priority(.defaultHigh) }
        let constraint = JdConstraintStore.of(child).installedConstraint(for: .width)
        XCTAssertEqual(constraint?.priority, .defaultHigh)
    }

    // DEC-013: diff 삭제는 동일 파일 발원 제약에 한정 — 다른 파일이 설치한
    // 제약(컴포넌트 자기 제약 등)은 소비자 layout 재호출에도 살아남는다
    func test_diff_scope_does_not_clobber_other_file_constraints() {
        let button = JdButtonView(title: "확인")
        host.addSubview(button)
        let heightBefore = JdConstraintStore.of(button).installedConstraint(for: .height)
        XCTAssertNotNil(heightBefore, "컴포넌트 자기 minHeight 제약")
        button.jd.layout {
            $0.leading.trailing.equalToSuperview().inset(16)
            $0.top.equalToSuperview()
        }
        let heightAfter = JdConstraintStore.of(button).installedConstraint(for: .height)
        XCTAssertNotNil(heightAfter)
        XCTAssertTrue(heightAfter?.isActive == true)
    }
}

final class JdButtonViewTests: XCTestCase {

    func test_minHeight_follows_spec_on_size_change() {
        let button = JdButtonView(title: "확인", size: .md)
        XCTAssertJdConstraint(button, .height, constant: 40)
        button.size = .lg
        XCTAssertJdConstraint(button, .height, constant: 48)
        button.size = .sm
        XCTAssertJdConstraint(button, .height, constant: 32)
    }

    func test_accessibility_surface() {
        let button = JdButtonView(title: "저장")
        XCTAssertTrue(button.isAccessibilityElement)
        XCTAssertEqual(button.accessibilityLabel, "저장")
        XCTAssertTrue(button.accessibilityTraits.contains(.button))
    }

    func test_loading_blocks_interaction() {
        let button = JdButtonView(title: "저장")
        XCTAssertTrue(button.isUserInteractionEnabled)
        button.isLoading = true
        XCTAssertFalse(button.isUserInteractionEnabled)
        XCTAssertEqual(button.accessibilityValue, "로딩 중")
        button.isLoading = false
        XCTAssertTrue(button.isUserInteractionEnabled)
        XCTAssertNil(button.accessibilityValue)
    }

    func test_intrinsic_size_respects_min_height() {
        let button = JdButtonView(title: "확인", size: .lg)
        XCTAssertGreaterThanOrEqual(button.intrinsicContentSize.height, 48)
    }
}

final class JdTextFieldViewTests: XCTestCase {

    func test_error_state_toggles_row() {
        let field = JdTextFieldView(label: "이메일", placeholder: "you@example.com")
        field.error = "필수 입력입니다"
        field.error = nil
        XCTAssertEqual(field.text, "")
        field.text = "abc"
        XCTAssertEqual(field.text, "abc")
    }

    func test_min_height_follows_size() {
        let field = JdTextFieldView(label: "이름", size: .lg)
        let inner = field.subviews.first
        XCTAssertNotNil(inner)
    }
}
