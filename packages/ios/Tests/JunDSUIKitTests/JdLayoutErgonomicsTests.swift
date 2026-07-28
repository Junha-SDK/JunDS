import JunDSCore
import UIKit
import XCTest

@testable import JunDSUIKit

// MARK: - 호출부 표면 (DEC-060)
//
// ## 왜 이게 기능만큼 중요한가
// `inset(16)`이 통과하는 한 "토큰이 API에 강제된다"는 우리 차별점은 사실이 아니다.
// 스택의 `spacing`은 `JdGap`으로 막아 뒀는데 제약의 `inset`·`offset`은 원시 CGFloat를
// 받고 있었다 — 같은 화면에서 여백이 반은 토큰, 반은 숫자로 적히는 정확한 구멍이다.
//
// 축 묶음(`horizontal`·`vertical`)도 같은 성격이다. `$0.leading.trailing`을 매번 적게 하면
// 사람들은 결국 한쪽을 빼먹는다. 짧은 이름이 있으면 안 빼먹는다.
@MainActor
final class JdLayoutErgonomicsTests: XCTestCase {

    private var host: UIView!

    override func setUp() {
        super.setUp()
        host = UIView(frame: CGRect(x: 0, y: 0, width: 320, height: 480))
    }

    // MARK: 토큰 여백

    func test_inset_accepts_gap_token() {
        let child = UIView()
        host.addSubview(child)
        child.jd.layout {
            $0.edges.equalToSuperview().inset(.md)  // 16 — 숫자를 적지 않는다
        }
        host.layoutIfNeeded()
        XCTAssertEqual(child.frame.minX, 16, accuracy: 0.5)
        XCTAssertEqual(child.frame.maxX, 304, accuracy: 0.5)
        XCTAssertEqual(child.frame.maxY, 464, accuracy: 0.5)
    }

    func test_offset_accepts_gap_token() {
        let header = UIView()
        header.jdPin(to: host, edges: [.top, .horizontal])
        header.jdHeight(44)

        let body = UIView()
        host.addSubview(body)
        body.jd.layout {
            $0.top.equal(to: header.jd.bottom).offset(.sm)  // 8
            $0.horizontal.equalToSuperview()
            $0.height.equal(40)
        }
        host.layoutIfNeeded()
        XCTAssertEqual(body.frame.minY, 44 + 8, accuracy: 0.5)
    }

    // 토큰 오버로드가 CGFloat 경로와 **같은 결과**를 내야 한다 — 두 길이 갈리면
    // 어느 쪽을 쓰느냐로 화면이 달라진다.
    func test_token_and_raw_paths_agree() {
        func insetMinX(_ apply: (JdConstraintBuilder) -> JdConstraintEditor) -> CGFloat {
            let parent = UIView(frame: CGRect(x: 0, y: 0, width: 320, height: 200))
            let child = UIView()
            parent.addSubview(child)
            child.jd.layout { _ = apply($0.edges) }
            parent.layoutIfNeeded()
            return child.frame.minX
        }
        XCTAssertEqual(
            insetMinX { $0.equalToSuperview().inset(.md) },
            insetMinX { $0.equalToSuperview().inset(JdGap.md.value) })
    }

    // MARK: 축 묶음

    func test_horizontal_covers_leading_and_trailing() {
        let child = UIView()
        host.addSubview(child)
        child.jd.layout {
            $0.horizontal.equalToSuperview().inset(.lg)  // 24
            $0.top.equalToSuperview()
            $0.height.equal(30)
        }
        host.layoutIfNeeded()
        XCTAssertEqual(child.frame.minX, 24, accuracy: 0.5)
        XCTAssertEqual(child.frame.maxX, 296, accuracy: 0.5)
    }

    func test_vertical_covers_top_and_bottom() {
        let child = UIView()
        host.addSubview(child)
        child.jd.layout {
            $0.vertical.equalToSuperview().inset(.md)
            $0.leading.equalToSuperview()
            $0.width.equal(50)
        }
        host.layoutIfNeeded()
        XCTAssertEqual(child.frame.minY, 16, accuracy: 0.5)
        XCTAssertEqual(child.frame.maxY, 464, accuracy: 0.5)
    }

    // 축 묶음은 체이닝에서도 붙어야 한다 — `$0.horizontal.top`처럼
    func test_axis_groups_chain_with_single_axes() {
        let child = UIView()
        host.addSubview(child)
        child.jd.layout {
            $0.horizontal.top.equalToSuperview()
            $0.height.equal(20)
        }
        // leading·trailing·top·height
        XCTAssertEqual(JdConstraintStore.of(child).installedCount, 4)
    }

    // MARK: 변 묶음 (jdPin)

    func test_pin_edge_groups() {
        let child = UIView()
        child.jdPin(to: host, edges: [.horizontal, .bottom], padding: .md)
        child.jdHeight(50)
        host.layoutIfNeeded()
        XCTAssertEqual(child.frame.minX, 16, accuracy: 0.5)
        XCTAssertEqual(child.frame.maxX, 304, accuracy: 0.5)
        XCTAssertEqual(child.frame.maxY, 464, accuracy: 0.5)
    }

    func test_edge_groups_equal_their_expansion() {
        XCTAssertEqual(NSDirectionalRectEdge.horizontal, [.leading, .trailing])
        XCTAssertEqual(NSDirectionalRectEdge.vertical, [.top, .bottom])
        XCTAssertEqual(NSDirectionalRectEdge([.horizontal, .vertical]), .all)
    }

    // MARK: 컬렉션 — environment 꼬리 인자 제거

    // 클로저가 이미 env를 주는데 다시 `environment: env`로 넘기는 모양이 호출부에서
    // 가장 눈에 걸렸다. 축약이 원본과 같은 결과를 내는지 확인한다.
    func test_environment_shorthand_matches_static_call() {
        var shorthandColumns: Int?
        var staticColumns: Int?

        let probe = { (section: NSCollectionLayoutSection) -> Int in
            // 섹션 자체에서 열 수를 직접 못 읽으므로 같은 입력으로 계산해 비교한다
            Int(section.contentInsets.leading)
        }

        let layout = UICollectionViewCompositionalLayout { index, env in
            let section =
                index == 0
                ? env.jdAdaptiveGrid(minItemWidth: 150, gap: .md, padding: .md)
                : JdCollectionLayout.adaptiveGrid(
                    minItemWidth: 150, gap: .md, padding: .md,
                    environment: env)
            if index == 0 {
                shorthandColumns = probe(section)
            } else {
                staticColumns = probe(section)
            }
            return section
        }

        let view = UICollectionView(
            frame: CGRect(x: 0, y: 0, width: 700, height: 600),
            collectionViewLayout: layout)
        view.register(UICollectionViewCell.self, forCellWithReuseIdentifier: "c")
        let source = JdErgoDataSource()
        view.dataSource = source
        view.layoutIfNeeded()

        XCTAssertNotNil(shorthandColumns)
        XCTAssertEqual(shorthandColumns, staticColumns)
    }
}

private final class JdErgoDataSource: NSObject, UICollectionViewDataSource {
    func numberOfSections(in collectionView: UICollectionView) -> Int { 2 }

    func collectionView(
        _ collectionView: UICollectionView,
        numberOfItemsInSection section: Int
    ) -> Int { 4 }

    func collectionView(
        _ collectionView: UICollectionView,
        cellForItemAt indexPath: IndexPath
    ) -> UICollectionViewCell {
        collectionView.dequeueReusableCell(withReuseIdentifier: "c", for: indexPath)
    }
}
