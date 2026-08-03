import JunDS
import SwiftUI
import XCTest

// SwiftUI 버튼 계열 호스팅 스모크 — 04 §8.2 "UIHostingController sizeThatFits > 0".
// 렌더 내부(심볼·색)는 스냅샷 배치의 몫이고 여기서는 조립·크기 축 계약만 본다.
final class JdActionButtonHostTests: XCTestCase {

    private let fitting = CGSize(width: 320, height: 400)

    private func size<V: View>(_ view: V) -> CGSize {
        UIHostingController(rootView: view).sizeThatFits(in: fitting)
    }

    // 1 — Bookmark / Like (같은 골격, 심볼·색만 다르다)
    func test_social_buttons_host_and_size() {
        let bookmark = size(JdBookmarkButton(isBookmarked: .constant(true)))
        XCTAssertGreaterThan(bookmark.width, 0)
        XCTAssertGreaterThan(bookmark.height, 0)

        let bare = size(JdLikeButton(isLiked: .constant(false)))
        let counted = size(JdLikeButton(isLiked: .constant(true), count: 12_345))
        XCTAssertGreaterThan(bare.height, 0)
        // 카운트가 붙으면 하트 단독보다 넓어진다 (gap + 축약 숫자)
        XCTAssertGreaterThan(counted.width, bare.width)
    }

    // 2 — Follow (두 변형 모두 호스팅되고 크기 축이 산다)
    func test_followButton_hosts_and_size_axis_grows() {
        let small = size(JdFollowButton(isFollowing: .constant(false), size: .sm))
        let large = size(JdFollowButton(isFollowing: .constant(true), size: .lg))
        XCTAssertGreaterThan(small.width, 0)
        XCTAssertGreaterThan(large.height, small.height)
    }

    // 3 — StarRating (별 수가 늘면 넓어진다 · 읽기 전용도 같은 표면)
    func test_starRating_hosts_and_widens_with_star_count() {
        let five = size(JdStarRating(value: .constant(3.5)))
        let ten = size(JdStarRating(value: .constant(3.5), max: 10))
        XCTAssertGreaterThan(five.height, 0)
        XCTAssertGreaterThan(ten.width, five.width)

        let readOnly = size(JdStarRating(value: .constant(2), isReadOnly: true))
        XCTAssertGreaterThan(readOnly.width, 0)
    }

    // 4 — CopyButton (아이콘 + 라벨)
    func test_copyButton_hosts_and_sizes() {
        let copy = size(JdCopyButton("npm i @junds/ui"))
        XCTAssertGreaterThan(copy.width, 0)
        XCTAssertGreaterThan(copy.height, 0)
    }

    // 5 — BackTop (40pt 원형)
    func test_backTopButton_hosts_as_circle() {
        let button = size(JdBackTopButton(action: {}))
        XCTAssertGreaterThan(button.width, 0)
        XCTAssertEqual(button.width, button.height, accuracy: 1)
    }

    // 6 — FileUploadZone (파일 목록이 붙으면 높아진다)
    func test_fileUploadZone_hosts_and_grows_with_files() {
        let empty = size(JdFileUploadZone(onTap: {}))
        let filled = size(JdFileUploadZone(fileNames: ["a.png", "b.pdf"], onTap: {}))
        XCTAssertGreaterThan(empty.height, 0)
        XCTAssertGreaterThan(filled.height, empty.height)
    }
}
