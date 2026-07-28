import JunDSCore
import XCTest

// 벤치 반복 수 — tools/bench-budgets.json의 perInstanceDivisor와 반드시 일치한다.
// 러너(tools/run-bench.mjs)가 measure 평균을 이 값으로 나눠 인스턴스당 시간을 환산한다.
private enum JdBenchReps {
    /// (a) JdButtonSpec.resolve — 조합 전수(variant 4 × size 3 = 12) × 1000회 = 12,000 resolve
    static let buttonSpecRounds = 1000
    static let buttonSpecTotal =
        1000 * JdButtonVariant.allCases.count * JdControlSize.allCases.count
    /// (b) JdTextFieldSpec.resolve — size는 순환 소비, 총 3,000 resolve
    static let textFieldSpecTotal = 3000
    /// (c) 타이포 스펙 — (JdTextSize 9 + JdHeadingLevel 6 = 15) × 1000회 = 15,000 resolve
    static let typographyRounds = 1000
    static let typographyTotal = 1000 * (JdTextSize.allCases.count + JdHeadingLevel.allCases.count)
}

// 순수 함수 resolve 마이크로벤치 (05-perf §2.2) — Core가 "정확히 1회만 도는" 구조(04 §4.2)의
// 기준 수치를 남긴다. 절대 예산(I1)의 대상이 아니라 회귀 감지선이다(상한은 bench-budgets.json).
// 클래스 접두 JdBench = 러너의 채택 필터 — 이름을 바꾸면 러너가 결과를 버린다.
final class JdBenchCoreTests: XCTestCase {

    // (a) 버튼 스펙 — variant×size 전 조합을 1000회 왕복 (총 12,000 resolve)
    func test_bench_buttonSpec_resolve_allCombos_x1000() {
        measure {
            for _ in 0..<JdBenchReps.buttonSpecRounds {
                for variant in JdButtonVariant.allCases {
                    for size in JdControlSize.allCases {
                        _ = JdButtonSpec.resolve(variant: variant, size: size)
                    }
                }
            }
        }
    }

    // (b) 텍스트필드 스펙 — size 3종 순환으로 총 3,000 resolve
    func test_bench_textFieldSpec_resolve_x3000() {
        let sizes = JdControlSize.allCases
        measure {
            for index in 0..<JdBenchReps.textFieldSpecTotal {
                _ = JdTextFieldSpec.resolve(size: sizes[index % sizes.count])
            }
        }
    }

    // (c) 타이포 스펙 — 텍스트 사다리 9종 + 헤딩 램프 6종 전수 × 1000회 (총 15,000 resolve).
    //     JdHeadingSpec은 내부에서 JdTextSpec을 경유하므로 중첩 resolve 비용까지 함께 계측된다.
    func test_bench_typographySpec_resolve_allValues_x1000() {
        measure {
            for _ in 0..<JdBenchReps.typographyRounds {
                for size in JdTextSize.allCases {
                    _ = JdTextSpec.resolve(size: size)
                }
                for level in JdHeadingLevel.allCases {
                    _ = JdHeadingSpec.resolve(level: level)
                }
            }
        }
    }
}
