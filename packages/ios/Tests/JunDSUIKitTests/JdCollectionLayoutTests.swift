import JunDSCore
import UIKit
import XCTest

@testable import JunDSUIKit

// Compositional Layout 어댑터 (DEC-058).
//
// 핵심은 `columnCount` — 순수 함수라 전수에 가깝게 검증할 수 있고, 격자 어댑터에서
// 가장 흔한 실수(간격을 빼먹어 마지막 열이 삐져나감)가 여기 한 곳에 모여 있다.
// 나머지는 실제 컬렉션 뷰에 붙여 프레임으로 확인한다 — 섹션 객체의 프로퍼티만 보면
// "값은 맞는데 화면은 틀린" 경우를 못 잡는다.
@MainActor
final class JdCollectionLayoutTests: XCTestCase {

    // MARK: - 열 수 계산

    func test_column_count_accounts_for_gaps() {
        // 폭 320, 최소 100, 간격 16 → 3열이면 3*100 + 2*16 = 332 > 320 이므로 2열이 맞다.
        // 간격을 빼먹고 320/100 = 3으로 계산하면 마지막 열이 삐져나간다.
        XCTAssertEqual(
            JdCollectionLayout.columnCount(available: 320, minItemWidth: 100, gap: 16), 2)
        // 간격이 0이면 3열이 들어간다 — 차이가 간격에서 온다는 것을 고정한다
        XCTAssertEqual(JdCollectionLayout.columnCount(available: 320, minItemWidth: 100, gap: 0), 3)
    }

    func test_column_count_exact_fit_is_inclusive() {
        // 3*100 + 2*10 = 320 — 딱 맞으면 들어가야 한다(부동소수 반올림으로 2열이 되면 안 된다)
        XCTAssertEqual(
            JdCollectionLayout.columnCount(available: 320, minItemWidth: 100, gap: 10), 3)
    }

    func test_column_count_never_returns_zero() {
        // 0열이면 섹션이 통째로 사라진다 — 좁아도 1열은 보장한다
        XCTAssertEqual(JdCollectionLayout.columnCount(available: 50, minItemWidth: 300, gap: 16), 1)
        XCTAssertEqual(JdCollectionLayout.columnCount(available: 0, minItemWidth: 300, gap: 16), 1)
    }

    func test_column_count_grows_monotonically_with_width() {
        var previous = 0
        for width in stride(from: 100.0, through: 1600.0, by: 20.0) {
            let count = JdCollectionLayout.columnCount(available: width, minItemWidth: 160, gap: 16)
            XCTAssertGreaterThanOrEqual(count, previous, "폭이 늘었는데 열이 줄었다 (폭 \(width))")
            previous = count
        }
    }

    // MARK: - 토큰이 실제 간격으로 나가는가

    func test_section_uses_gap_and_padding_tokens() {
        let section = JdCollectionLayout.list(estimatedHeight: 60, gap: .sm, padding: .lg)
        XCTAssertEqual(section.interGroupSpacing, JdGap.sm.value)
        XCTAssertEqual(section.contentInsets.leading, JdGap.lg.value)
        XCTAssertEqual(section.contentInsets.trailing, JdGap.lg.value)
    }

    // MARK: - 실제 배치 (섹션 프로퍼티가 아니라 화면에서 확인)

    private func makeCollectionView(
        width: CGFloat,
        itemCount: Int,
        section: @escaping (NSCollectionLayoutEnvironment) -> NSCollectionLayoutSection
    ) -> UICollectionView {
        let layout = UICollectionViewCompositionalLayout { _, environment in section(environment) }
        let view = UICollectionView(
            frame: CGRect(x: 0, y: 0, width: width, height: 800),
            collectionViewLayout: layout)
        let identifier = "cell"
        view.register(UICollectionViewCell.self, forCellWithReuseIdentifier: identifier)
        let source = JdTestDataSource(itemCount: itemCount, identifier: identifier)
        view.dataSource = source
        objc_setAssociatedObject(
            view, Unmanaged.passUnretained(view).toOpaque(),
            source, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
        view.layoutIfNeeded()
        return view
    }

    private func frames(_ view: UICollectionView, count: Int) -> [CGRect] {
        (0..<count).compactMap {
            view.layoutAttributesForItem(at: IndexPath(item: $0, section: 0))?.frame
        }
    }

    func test_grid_places_requested_number_of_columns_per_row() {
        let view = makeCollectionView(width: 320, itemCount: 6) { _ in
            JdCollectionLayout.grid(columns: 3, gap: .md, padding: .md)
        }
        let f = frames(view, count: 6)
        XCTAssertEqual(f.count, 6)
        // 앞 3개는 같은 행(y 동일), 4번째는 다음 행
        XCTAssertEqual(f[0].minY, f[1].minY, accuracy: 0.5)
        XCTAssertEqual(f[1].minY, f[2].minY, accuracy: 0.5)
        XCTAssertGreaterThan(f[3].minY, f[0].minY)
        // 첫 셀은 padding 만큼 들어와 있다
        XCTAssertEqual(f[0].minX, JdGap.md.value, accuracy: 0.5)
    }

    // 이 어댑터의 요점 — 브레이크포인트를 고르지 않아도 컨테이너 폭에서 열 수가 나온다.
    func test_adaptive_grid_derives_columns_from_container_width() {
        func columnsOnFirstRow(width: CGFloat) -> Int {
            let view = makeCollectionView(width: width, itemCount: 12) { environment in
                JdCollectionLayout.adaptiveGrid(
                    minItemWidth: 150, gap: .md, padding: .md,
                    environment: environment)
            }
            let f = frames(view, count: 12)
            guard let firstY = f.first?.minY else { return 0 }
            return f.filter { abs($0.minY - firstY) < 0.5 }.count
        }

        let narrow = columnsOnFirstRow(width: 375)  // iPhone 세로
        let wide = columnsOnFirstRow(width: 1024)  // iPad 가로
        XCTAssertGreaterThan(wide, narrow, "넓은 컨테이너에서 열이 늘지 않았다")
        XCTAssertGreaterThanOrEqual(narrow, 1)
    }

    // 셀이 최소 폭보다 좁아지면 어댑터가 제 일을 못한 것이다.
    func test_adaptive_grid_respects_min_item_width() {
        let minWidth: CGFloat = 150
        let view = makeCollectionView(width: 700, itemCount: 8) { environment in
            JdCollectionLayout.adaptiveGrid(
                minItemWidth: minWidth, gap: .md, padding: .md,
                environment: environment)
        }
        for frame in frames(view, count: 8) {
            XCTAssertGreaterThanOrEqual(
                frame.width, minWidth - 0.5,
                "셀이 최소 폭보다 좁다 — 간격 계산이 어긋났다")
        }
    }

    // MARK: - 브레이크포인트 연동

    func test_environment_breakpoint_helper_switches_section_shape() {
        func rowsAreSingleColumn(width: CGFloat) -> Bool {
            let view = makeCollectionView(width: width, itemCount: 4) { environment in
                environment.jdIsAtLeast(.md)
                    ? JdCollectionLayout.grid(columns: 3)
                    : JdCollectionLayout.list()
            }
            let f = frames(view, count: 4)
            guard f.count >= 2 else { return true }
            return f[0].minY != f[1].minY  // 세로로 쌓였으면 y가 다르다
        }

        XCTAssertTrue(rowsAreSingleColumn(width: JdBreakpoint.md.width - 100), "md 미만은 리스트")
        XCTAssertFalse(rowsAreSingleColumn(width: JdBreakpoint.md.width + 100), "md 이상은 격자")
    }
}

// 컬렉션 뷰는 데이터 소스가 없으면 셀을 배치하지 않는다 — 테스트 전용 최소 구현
private final class JdTestDataSource: NSObject, UICollectionViewDataSource {
    private let itemCount: Int
    private let identifier: String

    init(itemCount: Int, identifier: String) {
        self.itemCount = itemCount
        self.identifier = identifier
    }

    func collectionView(
        _ collectionView: UICollectionView,
        numberOfItemsInSection section: Int
    ) -> Int { itemCount }

    func collectionView(
        _ collectionView: UICollectionView,
        cellForItemAt indexPath: IndexPath
    ) -> UICollectionViewCell {
        collectionView.dequeueReusableCell(withReuseIdentifier: identifier, for: indexPath)
    }
}
