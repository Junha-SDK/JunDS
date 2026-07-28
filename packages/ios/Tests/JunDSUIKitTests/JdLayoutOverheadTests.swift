import JunDSCore
import UIKit
import XCTest

@testable import JunDSUIKit

// MARK: - DSL 오버헤드 상한 (DEC-056)
//
// ## 왜 비율인가
// 벤치의 절대 초는 기기·빌드 설정·동시 부하마다 흔들려서, CI에서 지키게 하면
// 임계값을 계속 올리다가 결국 아무것도 못 잡는 숫자가 된다.
//
// 반면 **같은 프로세스에서 잰 두 방식의 비율**은 그 잡음이 대부분 상쇄된다.
// 그리고 우리가 실제로 지키고 싶은 약속이 바로 비율이다:
//
//   "표현력·토큰 강제·진단 identifier를 원시 앵커 대비 거의 공짜로 얻는다."
//
// 그 "거의"가 몇 배인지를 여기서 못 박는다. 이 테스트가 깨지면 DSL이 살찐 것이고,
// 그 순간 소비자는 성능을 이유로 DSL을 버리고 원시 앵커로 내려갈 명분을 얻는다.
//
// ## 상한을 2.0배로 잡은 이유
// 실측(iPhone 17 시뮬레이터, 디버그 빌드)에서 중앙값 기준 약 1.2배였다.
// 2.0배는 그 두 배에 조금 못 미치는 자리 — 잡음으로는 안 넘고 진짜 회귀로는 넘는다.
// 디버그 빌드가 릴리스보다 DSL(클래스 할당·클로저)에 불리하므로 실사용은 더 낫다.
@MainActor
final class JdLayoutOverheadTests: XCTestCase {

    private static let viewCount = 100
    private static let rounds = 7
    /// 원시 NSLayoutAnchor 대비 허용 배수
    private static let maxOverheadRatio = 2.0

    func test_dsl_overhead_over_raw_anchors_stays_bounded() {
        // 워밍업 — 첫 회는 클래스 로드·메모리 확보가 섞여 몇 배씩 튄다(벤치 실측에서 확인).
        _ = measureMedian { self.installWithDSL() }
        _ = measureMedian { self.installWithRawAnchors() }

        let dsl = measureMedian { self.installWithDSL() }
        let raw = measureMedian { self.installWithRawAnchors() }

        XCTAssertGreaterThan(raw, 0, "측정이 0이면 비율이 무의미하다")
        let ratio = dsl / raw
        XCTAssertLessThan(
            ratio, Self.maxOverheadRatio,
            """
            DSL 오버헤드가 원시 앵커 대비 \(String(format: "%.2f", ratio))배 — 상한 \
            \(Self.maxOverheadRatio)배를 넘었다.
            (DSL \(String(format: "%.3f", dsl * 1000))ms vs 앵커 \
            \(String(format: "%.3f", raw * 1000))ms · 뷰 \(Self.viewCount)개)
            제약 1건당 하는 일이 늘었는지 JdConstraintStore.apply를 확인하라.
            """)
    }

    // 프레임 직접 배치가 Auto Layout보다 훨씬 싸다는 것은 우리 결함이 아니라
    // Auto Layout의 성질이다. 그래도 **얼마나** 차이 나는지는 알고 있어야 안내할 수 있다
    // (대량 스크롤 셀에서는 JdWrapView·JdColumnsView의 프레임 경로를 권한다).
    // 여기서는 "차이가 실재한다"만 고정하고 상한은 두지 않는다 — 우리가 통제하는 값이 아니다.
    func test_frame_path_is_measurably_cheaper_than_auto_layout() {
        _ = measureMedian { self.installWithFrames() }
        let frame = measureMedian { self.installWithFrames() }
        let raw = measureMedian { self.installWithRawAnchors() }
        XCTAssertLessThan(
            frame, raw,
            "프레임 경로가 Auto Layout보다 싸지 않다면 픽스처가 같은 일을 하지 않는 것이다")
    }

    // MARK: - 측정

    private func measureMedian(_ body: () -> Void) -> Double {
        var samples: [Double] = []
        samples.reserveCapacity(Self.rounds)
        for _ in 0..<Self.rounds {
            let start = CFAbsoluteTimeGetCurrent()
            body()
            samples.append(CFAbsoluteTimeGetCurrent() - start)
        }
        // 평균이 아니라 중앙값 — 한 번의 GC·스케줄링 튐이 결과를 지배하지 않게.
        samples.sort()
        return samples[samples.count / 2]
    }

    // MARK: - 픽스처 (JdBenchLayoutComparisonTests와 같은 배치를 만든다)

    private func installWithDSL() {
        let host = UIView(frame: CGRect(x: 0, y: 0, width: 320, height: 4000))
        for index in 0..<Self.viewCount {
            let child = UIView()
            host.addSubview(child)
            child.jd.layout {
                $0.top.equalToSuperview().offset(CGFloat(index) * 48)
                $0.leading.trailing.equalToSuperview().inset(16)
                $0.height.equal(40)
            }
        }
        host.layoutIfNeeded()
    }

    private func installWithRawAnchors() {
        let host = UIView(frame: CGRect(x: 0, y: 0, width: 320, height: 4000))
        var constraints: [NSLayoutConstraint] = []
        constraints.reserveCapacity(Self.viewCount * 4)
        for index in 0..<Self.viewCount {
            let child = UIView()
            host.addSubview(child)
            child.translatesAutoresizingMaskIntoConstraints = false
            constraints.append(contentsOf: [
                child.topAnchor.constraint(equalTo: host.topAnchor, constant: CGFloat(index) * 48),
                child.leadingAnchor.constraint(equalTo: host.leadingAnchor, constant: 16),
                child.trailingAnchor.constraint(equalTo: host.trailingAnchor, constant: -16),
                child.heightAnchor.constraint(equalToConstant: 40),
            ])
        }
        NSLayoutConstraint.activate(constraints)
        host.layoutIfNeeded()
    }

    private func installWithFrames() {
        let host = UIView(frame: CGRect(x: 0, y: 0, width: 320, height: 4000))
        for index in 0..<Self.viewCount {
            let child = UIView()
            host.addSubview(child)
            child.frame = CGRect(x: 16, y: CGFloat(index) * 48, width: 288, height: 40)
        }
    }
}
