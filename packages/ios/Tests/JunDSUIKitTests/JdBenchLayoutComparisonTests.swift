import JunDSCore
import UIKit
import XCTest

@testable import JunDSUIKit

// MARK: - 비교 벤치 (DEC-056)
//
// ## 왜 필요했나
// "우리 레이아웃이 빠른가"에 답할 근거가 없었다. 기존 벤치는 **우리 자신의 회귀**만 본다
// (어제보다 느려졌나). 그건 다른 도구와 견줄 때 아무 말도 못 하게 한다.
//
// 그래서 같은 화면을 세 방식으로 짜고 나란히 잰다:
//
//  1. JunDS DSL       — `jd.layout { … }`
//  2. 원시 NSLayoutAnchor — Auto Layout의 **바닥**. DSL이 얼마를 더 쓰는지가 여기서 나온다.
//  3. 프레임 직접 배치   — Auto Layout을 아예 쓰지 않는 길(PinLayout·FlexLayout 계열이 택한 쪽).
//
// ## 무엇을 주장할 수 있게 되나
// - (1) vs (2) → **DSL 오버헤드**. 작으면 "표현력을 공짜로 얻는다"가 사실이 된다.
// - (2) vs (3) → **Auto Layout 자체의 비용**. 이건 우리가 이길 수 없는 축이고,
//   그래서 프레임 기반 도구를 상대로 "우리가 더 빠르다"고 말하면 안 된다.
//   대신 어디서 그 차이가 문제가 되는지(대량 스크롤 셀) 알고 안내할 수 있다.
//
// 셋 다 **같은 결과 배치**를 만든다. 아니면 비교가 성립하지 않으므로,
// 아래 정합성 테스트가 세 방식의 최종 프레임이 일치함을 먼저 확인한다.
//
// ⚠️ 시뮬레이터 디버그 빌드 수치는 절대값이 아니라 **비율**로만 읽는다.

private enum JdBenchLayoutFixture {
    static let viewCount = 100
    static let canvas = CGRect(x: 0, y: 0, width: 320, height: 4000)

    static let rowHeight = JdToken.Space.s10  // 40
    static let rowInset = JdToken.Space.s4  // 16
    static let rowGap = JdToken.Space.s2  // 8

    static func frame(for index: Int) -> CGRect {
        CGRect(
            x: rowInset,
            y: CGFloat(index) * (rowHeight + rowGap),
            width: canvas.width - rowInset * 2,
            height: rowHeight)
    }
}

@MainActor
final class JdBenchLayoutComparisonTests: XCTestCase {

    // MARK: - 세 방식이 같은 배치를 만드는가 (비교의 전제)

    // 이 테스트가 없으면 "더 빠른 쪽이 실은 일을 덜 하고 있었다"를 못 잡는다.
    func test_three_strategies_produce_identical_frames() {
        let dsl = buildWithDSL()
        let anchor = buildWithRawAnchors()
        let frame = buildWithFrames()

        for index in 0..<JdBenchLayoutFixture.viewCount {
            let expected = JdBenchLayoutFixture.frame(for: index)
            XCTAssertEqual(dsl.subviews[index].frame, expected, "DSL[\(index)]")
            XCTAssertEqual(anchor.subviews[index].frame, expected, "anchor[\(index)]")
            XCTAssertEqual(frame.subviews[index].frame, expected, "frame[\(index)]")
        }
    }

    // MARK: - (1) JunDS DSL

    func test_bench_compare_dsl_100rows() {
        measureMetrics([.wallClockTime], automaticallyStartMeasuring: false) {
            let host = UIView(frame: JdBenchLayoutFixture.canvas)
            let children = makeChildren(in: host)
            startMeasuring()
            applyDSL(children, in: host)
            host.layoutIfNeeded()
            stopMeasuring()
        }
    }

    // MARK: - (2) 원시 NSLayoutAnchor — Auto Layout의 바닥

    func test_bench_compare_rawAnchor_100rows() {
        measureMetrics([.wallClockTime], automaticallyStartMeasuring: false) {
            let host = UIView(frame: JdBenchLayoutFixture.canvas)
            let children = makeChildren(in: host)
            startMeasuring()
            applyRawAnchors(children, in: host)
            host.layoutIfNeeded()
            stopMeasuring()
        }
    }

    // MARK: - (3) 프레임 직접 배치 — Auto Layout 밖

    func test_bench_compare_frame_100rows() {
        measureMetrics([.wallClockTime], automaticallyStartMeasuring: false) {
            let host = UIView(frame: JdBenchLayoutFixture.canvas)
            let children = makeChildren(in: host)
            startMeasuring()
            applyFrames(children)
            stopMeasuring()
        }
    }

    // MARK: - 픽스처

    private func makeChildren(in host: UIView) -> [UIView] {
        let children = (0..<JdBenchLayoutFixture.viewCount).map { _ in UIView() }
        for child in children { host.addSubview(child) }
        return children
    }

    private func applyDSL(_ children: [UIView], in host: UIView) {
        for (index, child) in children.enumerated() {
            child.jd.layout {
                $0.top.equalToSuperview()
                    .offset(
                        CGFloat(index)
                            * (JdBenchLayoutFixture.rowHeight + JdBenchLayoutFixture.rowGap))
                $0.leading.trailing.equalToSuperview().inset(JdBenchLayoutFixture.rowInset)
                $0.height.equal(JdBenchLayoutFixture.rowHeight)
            }
        }
    }

    private func applyRawAnchors(_ children: [UIView], in host: UIView) {
        var constraints: [NSLayoutConstraint] = []
        constraints.reserveCapacity(children.count * 4)
        for (index, child) in children.enumerated() {
            child.translatesAutoresizingMaskIntoConstraints = false
            let y = CGFloat(index) * (JdBenchLayoutFixture.rowHeight + JdBenchLayoutFixture.rowGap)
            constraints.append(contentsOf: [
                child.topAnchor.constraint(equalTo: host.topAnchor, constant: y),
                child.leadingAnchor.constraint(
                    equalTo: host.leadingAnchor,
                    constant: JdBenchLayoutFixture.rowInset),
                child.trailingAnchor.constraint(
                    equalTo: host.trailingAnchor,
                    constant: -JdBenchLayoutFixture.rowInset),
                child.heightAnchor.constraint(equalToConstant: JdBenchLayoutFixture.rowHeight),
            ])
        }
        NSLayoutConstraint.activate(constraints)
    }

    private func applyFrames(_ children: [UIView]) {
        for (index, child) in children.enumerated() {
            child.frame = JdBenchLayoutFixture.frame(for: index)
        }
    }

    private func buildWithDSL() -> UIView {
        let host = UIView(frame: JdBenchLayoutFixture.canvas)
        let children = makeChildren(in: host)
        applyDSL(children, in: host)
        host.layoutIfNeeded()
        return host
    }

    private func buildWithRawAnchors() -> UIView {
        let host = UIView(frame: JdBenchLayoutFixture.canvas)
        let children = makeChildren(in: host)
        applyRawAnchors(children, in: host)
        host.layoutIfNeeded()
        return host
    }

    private func buildWithFrames() -> UIView {
        let host = UIView(frame: JdBenchLayoutFixture.canvas)
        let children = makeChildren(in: host)
        applyFrames(children)
        return host
    }
}
