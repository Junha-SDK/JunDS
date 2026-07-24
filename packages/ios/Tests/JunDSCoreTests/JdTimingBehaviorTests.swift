import XCTest
import JunDSCore

// JdDebouncer / JdThrottler 는 @MainActor 타이밍 타입이라 async 테스트로 검증한다.
// - Debouncer: 짧은 실측 delay(즉시 미발화 + delay 후 1회 + 마지막 호출 우선 + cancel).
// - Throttler: now 주입으로 결정적 검증(선행 즉시 발화, 간격 내 후행 예약, 경계 재발화,
//   여러 후행이 단 1회로 접힘). 예약된 후행의 실제 발화만 짧은 실측으로 확인한다.

// 참조 타입 카운터 — @MainActor 클로저가 안전하게 증가시킨다(캡처된 var 변이 경고 회피).
@MainActor
private final class JdTimingCounter {
    var count = 0
}

// 주입형 가상 시계 — 테스트가 seconds를 밀어 결정적 경과를 만든다.
@MainActor
private final class JdTimingClock {
    var seconds: Double = 0
    var date: Date { Date(timeIntervalSinceReferenceDate: seconds) }
}

@MainActor
final class JdDebouncerTests: XCTestCase {

    // 즉시 발화하지 않고 delay 후 1회 발화
    func test_does_not_fire_synchronously_then_fires_after_delay() async {
        let counter = JdTimingCounter()
        let debouncer = JdDebouncer(delay: 0.05)
        debouncer.call { counter.count += 1 }
        XCTAssertEqual(counter.count, 0, "디바운스는 즉시 발화하지 않는다")
        try? await Task.sleep(nanoseconds: 200_000_000)  // 0.2s
        XCTAssertEqual(counter.count, 1)
    }

    // 연속 호출은 마지막 1회만(앞선 예약 취소)
    func test_rapid_calls_fire_once() async {
        let counter = JdTimingCounter()
        let debouncer = JdDebouncer(delay: 0.06)
        debouncer.call { counter.count += 1 }
        debouncer.call { counter.count += 1 }
        debouncer.call { counter.count += 1 }
        XCTAssertEqual(counter.count, 0)
        try? await Task.sleep(nanoseconds: 250_000_000)  // 0.25s
        XCTAssertEqual(counter.count, 1, "연속 호출은 마지막 1회만 발화")
    }

    // 마지막 호출의 액션이 실행된다(older 클로저 아님)
    func test_last_action_wins() async {
        let counter = JdTimingCounter()
        let debouncer = JdDebouncer(delay: 0.05)
        debouncer.call { counter.count += 1 }        // 취소될 액션
        debouncer.call { counter.count += 100 }      // 실제 실행될 액션
        try? await Task.sleep(nanoseconds: 200_000_000)
        XCTAssertEqual(counter.count, 100, "마지막 호출의 클로저가 실행")
    }

    // cancel()은 예약을 무효화
    func test_cancel_prevents_fire() async {
        let counter = JdTimingCounter()
        let debouncer = JdDebouncer(delay: 0.05)
        debouncer.call { counter.count += 1 }
        debouncer.cancel()
        try? await Task.sleep(nanoseconds: 200_000_000)
        XCTAssertEqual(counter.count, 0, "cancel 후에는 발화하지 않는다")
    }

    // 발화 뒤 재사용 가능
    func test_reusable_after_fire() async {
        let counter = JdTimingCounter()
        let debouncer = JdDebouncer(delay: 0.05)
        debouncer.call { counter.count += 1 }
        try? await Task.sleep(nanoseconds: 200_000_000)
        XCTAssertEqual(counter.count, 1)
        debouncer.call { counter.count += 1 }
        try? await Task.sleep(nanoseconds: 200_000_000)
        XCTAssertEqual(counter.count, 2, "발화 후 다시 예약·발화")
    }
}

@MainActor
final class JdThrottlerTests: XCTestCase {

    // 선행(leading)은 동기적으로 즉시 발화
    func test_leading_edge_fires_immediately() {
        let clock = JdTimingClock()
        let counter = JdTimingCounter()
        let throttler = JdThrottler(interval: 0.1, now: { clock.date })
        throttler.call { counter.count += 1 }
        XCTAssertEqual(counter.count, 1, "첫 호출은 즉시 발화")
    }

    // 간격 안의 후행은 즉시 발화하지 않고 예약된 뒤 발화한다
    func test_within_interval_defers_then_fires() async {
        let clock = JdTimingClock()
        let counter = JdTimingCounter()
        let throttler = JdThrottler(interval: 0.1, now: { clock.date })
        throttler.call { counter.count += 1 }               // 선행 즉시(count 1)
        XCTAssertEqual(counter.count, 1)
        clock.seconds = 0.09                                 // 아직 간격 안(remaining ~0.01)
        throttler.call { counter.count += 1 }                // 예약만
        XCTAssertEqual(counter.count, 1, "간격 내 후행은 즉시 발화 안 함")
        try? await Task.sleep(nanoseconds: 200_000_000)      // 0.2s — 예약 발화 대기
        XCTAssertEqual(counter.count, 2, "예약된 후행이 발화")
    }

    // 간격 경과 후의 호출은 다시 선행처럼 즉시 발화
    func test_after_interval_fires_immediately_again() {
        let clock = JdTimingClock()
        let counter = JdTimingCounter()
        let throttler = JdThrottler(interval: 0.1, now: { clock.date })
        throttler.call { counter.count += 1 }   // count 1, lastFire 0
        clock.seconds = 0.2                       // 간격 초과
        throttler.call { counter.count += 1 }     // else 분기 → 즉시
        XCTAssertEqual(counter.count, 2)
    }

    // 정확히 interval 경계(경과 == interval)는 간격 밖으로 보고 즉시 발화(< 판정)
    func test_exact_interval_boundary_fires_immediately() {
        let clock = JdTimingClock()
        let counter = JdTimingCounter()
        let throttler = JdThrottler(interval: 0.1, now: { clock.date })
        throttler.call { counter.count += 1 }   // count 1, lastFire 0
        clock.seconds = 0.1                       // 경과 == interval → 0.1 < 0.1 false
        throttler.call { counter.count += 1 }
        XCTAssertEqual(counter.count, 2, "경계(==interval)는 즉시 발화")
    }

    // 간격 내 여러 후행 호출은 단 한 번만 발화(최신이 이전 예약을 대체)
    func test_multiple_within_interval_collapse_to_one() async {
        let clock = JdTimingClock()
        let counter = JdTimingCounter()
        let throttler = JdThrottler(interval: 0.1, now: { clock.date })
        throttler.call { counter.count += 1 }   // 선행(count 1)
        clock.seconds = 0.03
        throttler.call { counter.count += 1 }   // 예약(remaining 0.07)
        clock.seconds = 0.06
        throttler.call { counter.count += 1 }   // 이전 예약 취소·재예약(remaining 0.04)
        XCTAssertEqual(counter.count, 1)
        try? await Task.sleep(nanoseconds: 300_000_000)  // 0.3s
        XCTAssertEqual(counter.count, 2, "여러 후행도 단 1회만 발화")
    }

    // cancel()은 예약된 후행을 무효화
    func test_cancel_prevents_pending_trailing() async {
        let clock = JdTimingClock()
        let counter = JdTimingCounter()
        let throttler = JdThrottler(interval: 0.1, now: { clock.date })
        throttler.call { counter.count += 1 }   // 선행(count 1)
        clock.seconds = 0.05
        throttler.call { counter.count += 1 }   // 예약
        throttler.cancel()                        // 예약 취소
        try? await Task.sleep(nanoseconds: 200_000_000)
        XCTAssertEqual(counter.count, 1, "cancel 후 예약된 후행은 발화하지 않는다")
    }
}
