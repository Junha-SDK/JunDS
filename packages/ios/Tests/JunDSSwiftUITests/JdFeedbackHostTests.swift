import JunDS
import SwiftUI
import XCTest

// 인라인 피드백 6종의 SwiftUI 호스팅 스모크 — 우산 표면(import JunDS)으로 6종이 모두 보이고
// UIHostingController에 올라 유효한 크기를 낸다. 프레젠테이션이 아니라 인라인 뷰라 크기가 곧 검증치다.
final class JdFeedbackHostTests: XCTestCase {

    private func assertHosts<V: View>(_ view: V, file: StaticString = #filePath, line: UInt = #line)
    {
        let host = UIHostingController(rootView: view)
        let size = host.sizeThatFits(in: CGSize(width: 375, height: 600))
        XCTAssertGreaterThan(size.width, 0, file: file, line: line)
        XCTAssertGreaterThan(size.height, 0, file: file, line: line)
    }

    func test_alert_hosts() {
        assertHosts(
            JdAlert("업데이트 완료", variant: .success, isDismissible: true, onDismiss: {}) {
                Text("세부 내용을 확인하세요")
            })
    }

    func test_banner_hosts() {
        assertHosts(
            JdBanner(
                "저장되었습니다", variant: .info,
                actionLabel: "실행 취소", onAction: {},
                isDismissible: true, onDismiss: {}))
    }

    func test_callout_collapsible_hosts() {
        assertHosts(
            JdCallout("참고", variant: .tip, isCollapsible: true, initiallyExpanded: true) {
                Text("접을 수 있는 본문")
            })
    }

    func test_callout_static_hosts() {
        assertHosts(
            JdCallout("경고", variant: .warning) {
                Text("정적 블록 본문")
            })
    }

    func test_notification_hosts() {
        assertHosts(
            JdNotification(
                title: "새 알림", description: "설명 텍스트",
                variant: .warning, systemImage: "bell.fill",
                isDismissible: true, onDismiss: {}
            ) {
                Text("액션 영역")
            })
    }

    func test_empty_state_hosts() {
        assertHosts(
            JdEmptyState(title: "항목 없음", description: "검색어를 바꿔보세요", systemImage: "tray") {
                JdButton("새로 만들기", variant: .primary) {}
            })
    }

    func test_result_hosts() {
        assertHosts(
            JdResult(status: .success, title: "완료되었습니다", description: "성공적으로 처리했습니다") {
                JdButton("홈으로", variant: .secondary) {}
            })
    }

    // 우산 하나로 6종이 모두 보인다(Core variant/status 매핑까지)
    func test_umbrella_exposes_all_feedback_types() {
        XCTAssertEqual(JdFeedbackVariant.danger.announcePriority, .assertive)
        XCTAssertEqual(JdCalloutVariant.tip.emoji, "💡")
        XCTAssertEqual(JdResultStatus.notFound.systemImage, "questionmark.circle")
    }
}
