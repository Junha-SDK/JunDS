import XCTest
import JunDSCore

// JdRangeState는 RangeSlider의 유일한 판정 지점이다 — 렌더 계층(SwiftUI/UIKit)은
// fraction만 읽고 드래그 좌표를 value(atFraction:)로 되돌린다(04 §4.2 규칙 3).
// 그래서 클램프·양자화·최소 간격·역변환을 여기서 전수 검증한다 (DESIGN-2 §C).
final class JdRangeStateTests: XCTestCase {

    private let epsilon = 1e-9

    // MARK: - 클램프

    func test_init_clamps_values_outside_bounds() {
        let state = JdRangeState(bounds: 0...100, step: 1, lower: -40, upper: 260)
        XCTAssertEqual(state.lower, 0, accuracy: epsilon)
        XCTAssertEqual(state.upper, 100, accuracy: epsilon)
    }

    func test_init_clamps_into_non_zero_origin_bounds() {
        let state = JdRangeState(bounds: 20...60, step: 5, lower: 0, upper: 999)
        XCTAssertEqual(state.lower, 20, accuracy: epsilon)
        XCTAssertEqual(state.upper, 60, accuracy: epsilon)
    }

    func test_setters_stay_inside_bounds() {
        var state = JdRangeState(bounds: 0...100, step: 10, lower: 20, upper: 80)
        state.setLower(-500)
        XCTAssertEqual(state.lower, 0, accuracy: epsilon)
        state.setUpper(500)
        XCTAssertEqual(state.upper, 100, accuracy: epsilon)
    }

    // MARK: - step 양자화

    func test_init_quantizes_to_step_grid() {
        let state = JdRangeState(bounds: 0...100, step: 10, lower: 13, upper: 47)
        XCTAssertEqual(state.lower, 10, accuracy: epsilon)  // round(1.3) × 10
        XCTAssertEqual(state.upper, 50, accuracy: epsilon)  // round(4.7) × 10
    }

    func test_setters_quantize_to_step_grid() {
        var state = JdRangeState(bounds: 0...100, step: 10, lower: 10, upper: 90)
        state.setUpper(34)
        XCTAssertEqual(state.upper, 30, accuracy: epsilon)  // round(3.4) × 10
        state.setLower(4)
        XCTAssertEqual(state.lower, 0, accuracy: epsilon)   // round(0.4) × 10
    }

    // step ≤ 0은 나눗셈이 무너지므로 Core가 1로 방어한다
    func test_non_positive_step_falls_back_to_one() {
        XCTAssertEqual(JdRangeState(bounds: 0...100, step: 0, lower: 10, upper: 20).step, 1, accuracy: epsilon)
        XCTAssertEqual(JdRangeState(bounds: 0...100, step: -5, lower: 10, upper: 20).step, 1, accuracy: epsilon)
    }

    // MARK: - 최소 간격(step) 유지

    func test_setLower_keeps_one_step_below_upper() {
        var state = JdRangeState(bounds: 0...100, step: 10, lower: 40, upper: 60)
        state.setLower(100) // upper를 밀어내지 못하고 자기가 멈춘다
        XCTAssertEqual(state.lower, 50, accuracy: epsilon)
        XCTAssertEqual(state.upper, 60, accuracy: epsilon)
        XCTAssertGreaterThanOrEqual(state.upper - state.lower, state.step - epsilon)
    }

    func test_setUpper_keeps_one_step_above_lower() {
        var state = JdRangeState(bounds: 0...100, step: 10, lower: 40, upper: 60)
        state.setUpper(-100)
        XCTAssertEqual(state.lower, 40, accuracy: epsilon)
        XCTAssertEqual(state.upper, 50, accuracy: epsilon)
        XCTAssertGreaterThanOrEqual(state.upper - state.lower, state.step - epsilon)
    }

    // 위쪽 경계에 눌린 경우: upper를 못 올리니 lower가 내려온다(양방향 압박)
    func test_gap_recovery_pushes_lower_down_at_upper_bound() {
        let state = JdRangeState(bounds: 0...100, step: 10, lower: 100, upper: 100)
        XCTAssertEqual(state.lower, 90, accuracy: epsilon)
        XCTAssertEqual(state.upper, 100, accuracy: epsilon)
    }

    // 아래쪽 경계에 눌린 경우: lower는 그대로고 upper가 올라간다
    func test_gap_recovery_pushes_upper_up_at_lower_bound() {
        let state = JdRangeState(bounds: 0...100, step: 10, lower: 0, upper: 0)
        XCTAssertEqual(state.lower, 0, accuracy: epsilon)
        XCTAssertEqual(state.upper, 10, accuracy: epsilon)
    }

    func test_inverted_input_is_normalized_to_valid_gap() {
        let state = JdRangeState(bounds: 0...100, step: 10, lower: 80, upper: 20)
        XCTAssertGreaterThanOrEqual(state.upper - state.lower, state.step - epsilon)
        XCTAssertTrue(state.bounds.contains(state.lower))
        XCTAssertTrue(state.bounds.contains(state.upper))
    }

    // MARK: - fraction ↔ value 왕복

    func test_fraction_value_round_trip_on_step_grid() {
        let state = JdRangeState(bounds: 0...100, step: 5, lower: 0, upper: 100)
        for value in stride(from: 0.0, through: 100.0, by: 5.0) {
            XCTAssertEqual(state.value(atFraction: state.fraction(of: value)), value, accuracy: epsilon)
        }
    }

    func test_fraction_value_round_trip_on_shifted_bounds() {
        let state = JdRangeState(bounds: 20...60, step: 5, lower: 20, upper: 60)
        for value in stride(from: 20.0, through: 60.0, by: 5.0) {
            XCTAssertEqual(state.value(atFraction: state.fraction(of: value)), value, accuracy: epsilon)
        }
    }

    func test_fraction_clamps_outside_inputs_to_unit_interval() {
        let state = JdRangeState(bounds: 0...100, step: 1, lower: 25, upper: 75)
        XCTAssertEqual(state.fraction(of: -1000), 0, accuracy: epsilon)
        XCTAssertEqual(state.fraction(of: 1000), 1, accuracy: epsilon)
        XCTAssertEqual(state.lowerFraction, 0.25, accuracy: epsilon)
        XCTAssertEqual(state.upperFraction, 0.75, accuracy: epsilon)
    }

    func test_value_atFraction_clamps_outside_inputs() {
        let state = JdRangeState(bounds: 20...60, step: 5, lower: 20, upper: 60)
        XCTAssertEqual(state.value(atFraction: -3), 20, accuracy: epsilon)
        XCTAssertEqual(state.value(atFraction: 4), 60, accuracy: epsilon)
    }

    // MARK: - span 0 방어 (0으로 나누기 → NaN 유입 차단)

    func test_zero_span_bounds_never_produce_nan() {
        let state = JdRangeState(bounds: 5...5, step: 1, lower: 5, upper: 5)
        XCTAssertEqual(state.lower, 5, accuracy: epsilon)
        XCTAssertEqual(state.upper, 5, accuracy: epsilon)
        XCTAssertEqual(state.fraction(of: 5), 0, accuracy: epsilon)
        XCTAssertEqual(state.lowerFraction, 0, accuracy: epsilon)
        XCTAssertEqual(state.upperFraction, 0, accuracy: epsilon)
        XCTAssertFalse(state.value(atFraction: 0.5).isNaN)
        XCTAssertEqual(state.value(atFraction: 0.5), 5, accuracy: epsilon)
    }

    // MARK: - 값 타입 계약

    func test_equatable_matches_on_all_axes() {
        let a = JdRangeState(bounds: 0...100, step: 10, lower: 20, upper: 80)
        let b = JdRangeState(bounds: 0...100, step: 10, lower: 24, upper: 76) // 같은 격자로 양자화
        XCTAssertEqual(a, b)
        var c = a
        c.setLower(40)
        XCTAssertNotEqual(a, c)
    }
}

// 통합 검증에서 발견된 회귀 가드 — 양자화/클램프 순서 (DEC-029)
final class JdRangeStateBoundsQuantizeTests: XCTestCase {

    // upperBound가 step 배수가 아닐 때 반올림이 범위를 넘지 않아야 한다
    func test_quantize_never_exceeds_bounds() {
        var state = JdRangeState(bounds: 0...95, step: 10, lower: 0, upper: 95)
        XCTAssertLessThanOrEqual(state.upper, 95)
        XCTAssertGreaterThanOrEqual(state.lower, 0)

        state.setUpper(95)
        XCTAssertLessThanOrEqual(state.upper, 95)

        state.setUpper(1000)
        XCTAssertLessThanOrEqual(state.upper, 95)
    }

    // 화면 비율 역변환도 범위 밖으로 나가지 않는다
    func test_value_atFraction_stays_in_bounds() {
        let state = JdRangeState(bounds: 0...95, step: 10, lower: 0, upper: 95)
        XCTAssertLessThanOrEqual(state.value(atFraction: 1), 95)
        XCTAssertGreaterThanOrEqual(state.value(atFraction: 0), 0)
    }

    // 경계값은 step 배수가 아니어도 도달 가능하다(네이티브 range 계약)
    func test_bounds_edges_are_reachable() {
        var state = JdRangeState(bounds: 0...95, step: 10, lower: 0, upper: 50)
        state.setUpper(95)
        XCTAssertEqual(state.upper, 95, accuracy: 0.001)
    }
}
