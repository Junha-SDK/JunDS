import JunDSCore
import XCTest

// 차트 지오메트리 계약 (DEC-049).
//
// 남은 finance 차트 8종이 전부 이 계산을 공유한다 — 여기가 틀리면 8종이 함께 틀린다.
// 그래서 "그려 보고 눈으로" 대신 좌표를 직접 단언한다.
final class JdChartGeometryTests: XCTestCase {

    private let box = CGSize(width: 100, height: 20)

    // MARK: - 정규화

    func test_points_span_full_width() {
        let pts = JdChartGeometry.points([0, 1, 2], in: box, inset: 0)
        XCTAssertEqual(pts.count, 3)
        XCTAssertEqual(pts[0].x, 0, accuracy: 0.001)
        XCTAssertEqual(pts[2].x, 100, accuracy: 0.001, "마지막 점이 오른쪽 끝에 닿아야 한다")
        XCTAssertEqual(pts[1].x, 50, accuracy: 0.001)
    }

    // y축은 뒤집힌다 — 큰 값이 위(작은 y)
    func test_larger_values_are_higher_on_screen() {
        let pts = JdChartGeometry.points([0, 10], in: box, inset: 0)
        XCTAssertEqual(pts[0].y, 20, accuracy: 0.001, "최솟값이 바닥")
        XCTAssertEqual(pts[1].y, 0, accuracy: 0.001, "최댓값이 천장")
    }

    // 평평한 데이터는 0으로 나누지 않는다 — 웹 `range = max - min || 1`
    func test_flat_data_does_not_divide_by_zero() {
        let pts = JdChartGeometry.points([5, 5, 5], in: box, inset: 0)
        XCTAssertEqual(pts.count, 3)
        for p in pts {
            XCTAssertTrue(p.y.isFinite, "평평한 데이터에서 좌표가 NaN이 됐다")
            XCTAssertEqual(p.y, 20, accuracy: 0.001, "눕혀서 바닥에 붙인다")
        }
    }

    // 비수치는 걸러진다 — 좌표 하나가 NaN이면 path 전체가 에러 없이 사라진다
    func test_non_finite_values_are_dropped() {
        XCTAssertEqual(JdChartGeometry.sanitize([1, .nan, 2, .infinity, 3]), [1, 2, 3])
        let pts = JdChartGeometry.points([1, .nan, 3], in: box, inset: 0)
        XCTAssertEqual(pts.count, 2, "NaN이 좌표로 살아남았다")
        for p in pts { XCTAssertTrue(p.x.isFinite && p.y.isFinite) }
    }

    // 값 하나는 왼쪽 끝 — 스파크라인은 시간축이라 시작점이 왼쪽이다
    func test_single_value_sits_at_left_edge() {
        let pts = JdChartGeometry.points([7], in: box, inset: 0)
        XCTAssertEqual(pts.count, 1)
        XCTAssertEqual(pts[0].x, 0, accuracy: 0.001)
    }

    func test_empty_and_zero_size_are_safe() {
        XCTAssertTrue(JdChartGeometry.points([], in: box).isEmpty)
        XCTAssertTrue(JdChartGeometry.points([1, 2], in: .zero).isEmpty)
        XCTAssertTrue(JdChartGeometry.points([1, 2], in: CGSize(width: 100, height: 0)).isEmpty)
    }

    // inset은 획이 상자에서 잘리지 않게 위아래를 비운다
    func test_inset_keeps_stroke_inside_the_box() {
        let pts = JdChartGeometry.points([0, 10], in: box, inset: 2)
        XCTAssertEqual(pts[1].y, 2, accuracy: 0.001, "천장이 inset만큼 내려와야 한다")
        XCTAssertEqual(pts[0].y, 18, accuracy: 0.001, "바닥도 inset만큼 올라와야 한다")
    }

    // MARK: - 면적·기준선·방향

    func test_area_path_closes_to_the_floor() {
        let pts = JdChartGeometry.points([0, 10], in: box, inset: 0)
        let area = JdChartGeometry.areaPath(pts, in: box)
        XCTAssertEqual(area.count, 4, "선 2점 + 바닥 2점")
        XCTAssertEqual(area[2].y, 20, accuracy: 0.001)
        XCTAssertEqual(area[3].y, 20, accuracy: 0.001)
        XCTAssertEqual(area[3].x, pts[0].x, accuracy: 0.001, "시작 x로 돌아와 닫힌다")
    }

    func test_area_path_needs_two_points() {
        XCTAssertTrue(JdChartGeometry.areaPath([], in: box).isEmpty)
        XCTAssertTrue(JdChartGeometry.areaPath([CGPoint(x: 0, y: 0)], in: box).isEmpty)
    }

    func test_baseline_is_the_first_value_height() {
        let pts = JdChartGeometry.points([3, 9], in: box, inset: 0)
        XCTAssertEqual(JdChartGeometry.baselineY(pts), pts[0].y)
        XCTAssertNil(JdChartGeometry.baselineY([]))
    }

    // 방향은 gainOrEven — 보합이 없다. 스파크라인은 색으로 방향을 말하는 물건이라
    // 회색이 끼면 "데이터가 없다"로 오독된다.
    func test_direction_uses_first_and_last() {
        XCTAssertEqual(JdChartGeometry.direction([1, 5]), .up)
        XCTAssertEqual(JdChartGeometry.direction([5, 1]), .down)
        XCTAssertEqual(JdChartGeometry.direction([5, 5]), .up, "같으면 상승 쪽(보합 없음)")
        XCTAssertNil(JdChartGeometry.direction([5]), "값 하나엔 방향이 없다")
        XCTAssertNil(JdChartGeometry.direction([]))
        // 중간이 어떻든 처음과 끝만 본다
        XCTAssertEqual(JdChartGeometry.direction([1, 100, 2]), .up)
    }

    // MARK: - Sparkline 스펙

    func test_sparkline_color_follows_direction_when_unspecified() {
        JdFinanceTheme.resetToDefaults()
        XCTAssertEqual(
            JdSparklineSpec.resolve(values: [1, 5]).lineColor.light,
            JdFinanceTheme.color(.up).light)
        XCTAssertEqual(
            JdSparklineSpec.resolve(values: [5, 1]).lineColor.light,
            JdFinanceTheme.color(.down).light)
        // 명시 색이 있으면 그쪽이 이긴다
        let custom = JdDynamicColor(light: 0x1234_56FF, dark: 0x1234_56FF)
        XCTAssertEqual(
            JdSparklineSpec.resolve(values: [5, 1], color: custom).lineColor.light,
            custom.light)
    }

    // 획이 굵어지면 여백도 따라 커진다 — 안 그러면 두꺼운 선이 상자 밖으로 잘린다
    func test_inset_follows_stroke_width() {
        XCTAssertEqual(JdSparklineSpec.resolve(strokeWidth: 1.6).inset, 1, accuracy: 0.001)
        XCTAssertEqual(JdSparklineSpec.resolve(strokeWidth: 6).inset, 3, accuracy: 0.001)
    }
}
