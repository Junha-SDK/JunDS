import XCTest
import SwiftUI
import JunDS

// SwiftUI 입력 계열 호스팅 스모크 — 04 §8.2 "UIHostingController sizeThatFits > 0".
// 값 규칙(클램프 타이밍·마스킹·강도·핀 정리)은 Core 단위 테스트와 UIKit 뷰 테스트가
// 담당하고, 여기서는 조립·크기 축 계약만 본다.
final class JdInputPrimitiveHostTests: XCTestCase {

    private let box = CGSize(width: 375, height: 400)

    private func hostedSize<V: View>(_ view: V) -> CGSize {
        UIHostingController(rootView: view).sizeThatFits(in: box)
    }

    func test_jdNumberInput_hosts_with_and_without_controls() {
        // 텍스트 필드는 가로로 유연해 폭 비교가 성립하지 않는다 — 조립 성공만 본다
        for view in [JdNumberInput(value: .constant(3), min: 0, max: 10),
                     JdNumberInput(value: .constant(3), hidesControls: true)] {
            let size = hostedSize(view)
            XCTAssertGreaterThan(size.width, 0)
            XCTAssertGreaterThan(size.height, 0)
        }
    }

    // ⚠️ 유한 높이를 제안하면 호스팅이 제안값을 그대로 돌려줘(400 == 400) 램프가 관측되지 않는다 —
    //    자연 높이를 받으려면 높이를 사실상 무제한으로 제안해야 한다(실측).
    private func naturalHeight<V: View>(_ view: V) -> CGFloat {
        UIHostingController(rootView: view)
            .sizeThatFits(in: CGSize(width: box.width, height: .greatestFiniteMagnitude)).height
    }

    func test_jdNumberInput_size_ramp_grows_height() {
        let small = CGSize(width: 0, height: naturalHeight(JdNumberInput(value: .constant(1), size: .sm)))
        let large = CGSize(width: 0, height: naturalHeight(JdNumberInput(value: .constant(1), size: .lg)))
        // JdNumberInputSize 램프(32/36/44) — 컨트롤 램프(32/40/48)가 아니다
        XCTAssertGreaterThan(large.height, small.height)
    }

    func test_jdCurrencyInput_hosts_and_sizes() {
        let size = hostedSize(JdCurrencyInput(value: .constant(1500), placeholder: "금액"))
        XCTAssertGreaterThan(size.width, 0)
        XCTAssertGreaterThan(size.height, 0)
    }

    func test_jdPhoneInput_hosts_and_sizes() {
        let size = hostedSize(JdPhoneInput(value: .constant("01012345678"),
                                           country: .constant(.kr)))
        XCTAssertGreaterThan(size.width, 0)
        XCTAssertGreaterThan(size.height, 0)
    }

    func test_jdPasswordInput_strength_and_rules_add_height() {
        let bare = hostedSize(JdPasswordInput(text: .constant("Abcdef1!"), placeholder: "비밀번호"))
        let full = hostedSize(JdPasswordInput(text: .constant("Abcdef1!"),
                                              placeholder: "비밀번호",
                                              showsStrength: true,
                                              showsRules: true))
        XCTAssertGreaterThan(bare.height, 0)
        // 게이지 행 + 규칙 4행이 아래로 붙는다
        XCTAssertGreaterThan(full.height, bare.height)
    }

    func test_jdPasswordInput_empty_value_hides_strength_row() {
        let empty = hostedSize(JdPasswordInput(text: .constant(""), showsStrength: true))
        let filled = hostedSize(JdPasswordInput(text: .constant("a"), showsStrength: true))
        // 빈 값에는 강도를 매기지 않는다(웹 level "none" 동형) — 행 자체가 없다
        XCTAssertLessThan(empty.height, filled.height)
    }

    func test_jdPinInput_hosts_and_length_widens_it() {
        let four = hostedSize(JdPinInput(value: .constant("12"), length: 4))
        let six = hostedSize(JdPinInput(value: .constant("12"), length: 6, masked: true))
        XCTAssertGreaterThan(four.width, 0)
        XCTAssertGreaterThan(four.height, 0)
        // 칸 수가 곧 폭이다
        XCTAssertGreaterThan(six.width, four.width)
    }

    // OTP 변형은 별도 타입이 아니라 같은 컴포넌트의 설정이다 (R12 Switch=Toggle 선례)
    func test_jdPinInput_otp_variant_is_same_type() {
        let otp = JdPinInput(value: .constant("123456"), length: 6, alphanumeric: false)
        XCTAssertGreaterThan(hostedSize(otp).width, 0)
    }
}
