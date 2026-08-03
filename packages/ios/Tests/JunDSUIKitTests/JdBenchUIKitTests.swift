import JunDSCore
import UIKit
import XCTest

@testable import JunDSUIKit

// 벤치 반복 수 — tools/bench-budgets.json의 perInstanceDivisor와 반드시 일치한다.
// 러너(tools/run-bench.mjs)가 measure 평균을 이 값으로 나눠 인스턴스당 시간을 환산한다.
private enum JdBenchReps {
    /// (a)(b) 컴포넌트 init 반복 수 — I1: S·M 인스턴스당 <1ms (05-perf §1)
    static let viewInitCount = 100
    /// (c) JdStackView.vertical에 얹는 UILabel 수
    static let stackChildCount = 100
    /// (d) 레이아웃 DSL 일괄 설치 — 뷰 수 × 뷰당 제약 4개 = 400 제약
    static let dslViewCount = 100
    static let dslConstraintsPerView = 4
    /// (e) 동일 뷰 layout{} 재호출(diff 경로) 횟수
    static let dslRelayoutCount = 100
}

// 벤치 픽스처 치수 — 디자인 치수가 아니라 계측용 캔버스 크기(토큰 대상 아님).
// 기존 테스트 픽스처(JdLayoutTests의 320×200)와 같은 성격의 값이다.
private let jdBenchCanvas = CGRect(x: 0, y: 0, width: 320, height: 4000)

// UIKit 뷰 계층 생성 벤치 (05-perf §2.2, I1) — "뷰 계층 생성만 계측"이 규약이므로
// 데이터 준비(라벨 텍스트·자식 뷰 생성)는 계측 창 밖에서 수행한다(웹 W5 규약의 iOS 등가).
// 클래스 접두 JdBench = 러너의 채택 필터 — 이름을 바꾸면 러너가 결과를 버린다.
@MainActor
final class JdBenchUIKitTests: XCTestCase {

    // (a) JdButtonView init ×100 — resolve + 서브뷰 조립 + 자체 DSL 제약 설치까지가 init 비용
    func test_bench_buttonView_init_x100() {
        measure {
            for _ in 0..<JdBenchReps.viewInitCount {
                _ = JdButtonView(title: "벤치")
            }
        }
    }

    // (b) JdTextFieldView init ×100 — 라벨/필드/에러 행 3단 스택 조립 포함
    func test_bench_textFieldView_init_x100() {
        measure {
            for _ in 0..<JdBenchReps.viewInitCount {
                _ = JdTextFieldView(label: "라벨", placeholder: "플레이스홀더")
            }
        }
    }

    // (c) JdStackView.vertical + UILabel 100개 arranged + layoutIfNeeded —
    //     스택 생성과 1회 레이아웃 패스만 계측(라벨 생성은 계측 밖)
    func test_bench_stackView_vertical_100labels_layoutIfNeeded() {
        measureMetrics([.wallClockTime], automaticallyStartMeasuring: false) {
            let labels: [UILabel] = (0..<JdBenchReps.stackChildCount).map { index in
                let label = UILabel()
                label.text = "행 \(index)"
                return label
            }
            startMeasuring()
            let stack = JdStackView.vertical(labels)
            stack.frame = jdBenchCanvas
            stack.layoutIfNeeded()
            stopMeasuring()
        }
    }

    // (d) 레이아웃 DSL 일괄 설치 — 뷰 100개 × 제약 4개(top/leading/width/height)를
    //     layout{}로 생성+activate. 뷰 생성·addSubview는 계측 밖.
    func test_bench_layoutDSL_batch_100views_4constraints() {
        measureMetrics([.wallClockTime], automaticallyStartMeasuring: false) {
            let host = UIView(frame: jdBenchCanvas)
            let children: [UIView] = (0..<JdBenchReps.dslViewCount).map { _ in UIView() }
            for child in children {
                host.addSubview(child)
            }
            startMeasuring()
            for (index, child) in children.enumerated() {
                child.jd.layout {
                    $0.top.equalToSuperview().offset(CGFloat(index) * JdToken.Space.s10)
                    $0.leading.equalToSuperview().inset(JdToken.Space.s4)
                    $0.width.equal(JdToken.Space.s16)
                    $0.height.equal(JdToken.Space.s10)
                }
            }
            stopMeasuring()
        }
    }

    // (e) 동일 뷰 layout{} 재호출 ×100 — 최초 설치는 계측 밖에서 끝내고,
    //     계측 창 안은 전부 diff 경로(키 일치 → 기존 제약 재사용, 생성 0건)만 탄다.
    func test_bench_layoutDSL_relayout_diff_x100() {
        let host = UIView(frame: jdBenchCanvas)
        let child = UIView()
        host.addSubview(child)
        // 선설치 — 아래 재호출과 동일한 서술자 4건(diff 키: 축·관계·상대 항목 일치)
        child.jd.layout {
            $0.top.equalToSuperview().offset(JdToken.Space.s2)
            $0.leading.equalToSuperview().inset(JdToken.Space.s4)
            $0.width.equal(JdToken.Space.s16)
            $0.height.equal(JdToken.Space.s10)
        }
        measure {
            for _ in 0..<JdBenchReps.dslRelayoutCount {
                child.jd.layout {
                    $0.top.equalToSuperview().offset(JdToken.Space.s2)
                    $0.leading.equalToSuperview().inset(JdToken.Space.s4)
                    $0.width.equal(JdToken.Space.s16)
                    $0.height.equal(JdToken.Space.s10)
                }
            }
        }
    }
}
