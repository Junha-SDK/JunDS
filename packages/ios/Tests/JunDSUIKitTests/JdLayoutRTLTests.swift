import JunDSCore
import UIKit
import XCTest

@testable import JunDSUIKit

// MARK: - RTL · 동적 타입 (DEC-057)
//
// ## 왜 이게 자부의 조건인가
// "leading/trailing을 쓰니 RTL은 당연히 된다"는 흔한 착각이다. 당연하지 않은 자리가 셋 있다:
//
//  1. `inset()`의 **부호 반전** — trailing에 음수를 넣는 규칙이 RTL에서도 같은 쪽을 좁히는가.
//  2. 우리가 **frame으로 직접 배치**하는 뷰들(JdWrapView·JdColumnsView·JdSidebarLayoutView의
//     축 전환) — Auto Layout이 자동 반전해 주지 않는 유일한 지점이다.
//  3. `jdAfter`처럼 "다음"이라는 말이 방향을 함축하는 API.
//
// 동적 타입은 별개 축이다. 의도 프리미티브가 폭만 보고 접는데, 글자가 커지면 **폭은 그대로인데
// 내용이 안 들어가는** 상태가 생긴다. 그때 무너지는지(잘리는지) 늘어나는지를 고정해 둔다.
@MainActor
final class JdLayoutRTLTests: XCTestCase {

    /// RTL 강제 — 실제 아랍어 로케일 없이 방향만 뒤집는다(UIKit 공식 경로).
    private func makeRTLHost(width: CGFloat = 320, height: CGFloat = 480) -> UIView {
        let host = UIView(frame: CGRect(x: 0, y: 0, width: width, height: height))
        host.semanticContentAttribute = .forceRightToLeft
        return host
    }

    private func makeLTRHost(width: CGFloat = 320, height: CGFloat = 480) -> UIView {
        let host = UIView(frame: CGRect(x: 0, y: 0, width: width, height: height))
        host.semanticContentAttribute = .forceLeftToRight
        return host
    }

    // MARK: - inset 부호 반전이 RTL에서도 옳은가

    // LTR에서 leading=왼쪽, RTL에서 leading=오른쪽. inset(16)은 **양쪽 다 안쪽으로** 16이어야 한다.
    // 우리 inset은 trailing/bottom에 음수를 넣는데, 그 규칙이 방향에 무관하게 성립하는지 본다.
    func test_inset_narrows_from_both_edges_in_rtl() {
        let host = makeRTLHost()
        let child = UIView()
        host.addSubview(child)
        child.jd.layout {
            $0.leading.trailing.equalToSuperview().inset(16)
            $0.top.equalToSuperview()
            $0.height.equal(40)
        }
        host.layoutIfNeeded()

        XCTAssertEqual(child.frame.minX, 16, accuracy: 0.5, "RTL에서 왼쪽 여백이 어긋났다")
        XCTAssertEqual(child.frame.maxX, 304, accuracy: 0.5, "RTL에서 오른쪽 여백이 어긋났다")
    }

    // MARK: - leading이 실제로 반대편으로 가는가

    func test_leading_flips_side_between_ltr_and_rtl() {
        func placedMinX(in host: UIView) -> CGFloat {
            let child = UIView()
            host.addSubview(child)
            child.jd.layout {
                $0.leading.equalToSuperview()
                $0.top.equalToSuperview()
                $0.size.equal(CGSize(width: 100, height: 40))
            }
            host.layoutIfNeeded()
            return child.frame.minX
        }

        XCTAssertEqual(placedMinX(in: makeLTRHost()), 0, accuracy: 0.5)
        XCTAssertEqual(
            placedMinX(in: makeRTLHost()), 220, accuracy: 0.5,
            "RTL에서 leading이 오른쪽으로 가지 않았다")
    }

    // MARK: - jdAfter / jdPin

    // "다음"이 LTR에선 오른쪽, RTL에선 왼쪽이어야 한다. leadingAnchor 기반이라 성립해야 하지만,
    // 이름이 방향을 함축하는 API는 실제로 확인해 두지 않으면 나중에 offset을 손으로 넣게 된다.
    func test_jdAfter_follows_reading_direction() {
        func secondItemMinX(in host: UIView) -> CGFloat {
            let first = UIView()
            first.jdPin(to: host, edges: [.top, .leading])
            first.jdSize(width: 60, height: 40)
            let second = UIView()
            second.jdAfter(first, gap: .sm).jdPin(to: host, edges: [.top])
            second.jdSize(width: 60, height: 40)
            host.layoutIfNeeded()
            return second.frame.minX
        }

        // LTR: 0..60 다음 8 띄고 68
        XCTAssertEqual(secondItemMinX(in: makeLTRHost()), 68, accuracy: 0.5)
        // RTL: first는 260..320, 그 "다음"은 왼쪽 → 260 - 8 - 60 = 192
        XCTAssertEqual(
            secondItemMinX(in: makeRTLHost()), 192, accuracy: 0.5,
            "RTL에서 jdAfter가 읽기 방향을 따르지 않았다")
    }

    // MARK: - 프레임 직접 배치 뷰 (Auto Layout이 반전해 주지 않는 자리)

    // JdWrapView는 자식을 frame으로 놓는다. 즉 **우리가 직접 반전을 구현해야 하는** 유일한 부류다.
    // RECIPES.md가 "RTL에서 좌우가 뒤집힌다"고 약속하고 있으므로 그 약속을 고정한다.
    func test_wrap_view_flows_from_right_in_rtl() {
        func firstItemMaxX(in host: UIView) -> CGFloat {
            let items = (0..<3).map { _ -> UIView in
                let v = UIView()
                v.jdSize(width: 60, height: 30)
                return v
            }
            let wrap = JdWrapView(itemSpacing: JdGap.sm.value, items)
            // 프레임 배치 뷰는 Auto Layout처럼 상위 방향이 자동으로 내려오지 않는다 —
            // effectiveUserInterfaceLayoutDirection은 자기 semanticContentAttribute에서 나온다.
            // 실제 RTL 앱에서는 윈도우 전체가 RTL이라 모든 뷰가 RTL로 해석되므로,
            // 여기서도 뷰 자신에 지정해 그 상태를 재현한다.
            wrap.semanticContentAttribute = host.semanticContentAttribute
            wrap.jdFill(host)
            host.layoutIfNeeded()
            return items[0].frame.maxX
        }

        let ltr = firstItemMaxX(in: makeLTRHost())
        let rtl = firstItemMaxX(in: makeRTLHost())
        XCTAssertEqual(ltr, 60, accuracy: 1.0, "LTR에서 첫 아이템은 왼쪽에서 시작한다")
        XCTAssertEqual(rtl, 320, accuracy: 1.0, "RTL에서 첫 아이템이 오른쪽 끝에서 시작하지 않았다")
    }

    // MARK: - 동적 타입

    // 의도 프리미티브는 **폭**만 보고 접는다. 글자가 커지면 폭은 그대로인데 내용이 커지므로,
    // 접히지 않은 채 높이가 늘어나야 한다(잘리면 안 된다). 어느 쪽인지 고정해 둔다.
    func test_switcher_grows_in_height_rather_than_clipping_at_large_text() {
        let host = UIView(frame: CGRect(x: 0, y: 0, width: 700, height: 400))

        func totalHeight(for style: UIFont.TextStyle, traits: UITraitCollection) -> CGFloat {
            let labels = (0..<2).map { index -> UILabel in
                let label = UILabel()
                label.numberOfLines = 0
                label.text = "긴 설명 문장이 들어가는 자리입니다 \(index)"
                label.font = UIFont.preferredFont(forTextStyle: style, compatibleWith: traits)
                return label
            }
            let switcher = JdSwitcherView(threshold: .sm) { labels }
            switcher.jdFill(host)
            host.layoutIfNeeded()
            let height = switcher.systemLayoutSizeFitting(
                CGSize(width: 700, height: UIView.layoutFittingCompressedSize.height),
                withHorizontalFittingPriority: .required,
                verticalFittingPriority: .fittingSizeLevel
            ).height
            switcher.removeFromSuperview()
            return height
        }

        let normal = totalHeight(
            for: .body,
            traits: UITraitCollection(preferredContentSizeCategory: .large))
        let huge = totalHeight(
            for: .body,
            traits: UITraitCollection(
                preferredContentSizeCategory: .accessibilityExtraExtraExtraLarge))

        XCTAssertGreaterThan(
            huge, normal,
            "글자를 키웠는데 높이가 그대로다 — 내용이 잘리고 있다는 뜻이다")
    }

    // 사이드바는 폭 기준이므로 글자 크기와 무관하게 접힘 판정이 같아야 한다.
    // (폭이 충분한데 글자가 크다는 이유로 접히면 데스크톱급 화면에서 이상해진다)
    func test_sidebar_stacking_decision_is_width_based_not_text_based() {
        let layout = JdSidebarLayoutView(sideWidth: 240, contentMin: 320, gap: .lg) {
            UILabel(); UILabel()
        }
        layout.frame = CGRect(x: 0, y: 0, width: 700, height: 400)
        layout.layoutIfNeeded()
        XCTAssertFalse(layout.isStacked)

        // 자식 내용을 크게 바꿔도(= 글자가 커진 것과 같은 효과) 폭이 그대로면 판정도 그대로.
        // traitOverrides는 iOS 17+라 배포 하한(16)에서 쓸 수 없어, 내용 쪽을 키워 확인한다.
        let bigLabel = UILabel()
        bigLabel.numberOfLines = 0
        bigLabel.font = .systemFont(ofSize: 60)
        bigLabel.text = "아주 큰 글자가 여러 줄로 들어가는 경우"
        bigLabel.jdFill(layout.stack.arrangedSubviews[1])
        layout.setNeedsLayout()
        layout.layoutIfNeeded()
        XCTAssertFalse(layout.isStacked, "폭이 그대로인데 내용 크기로 접힘 판정이 바뀌었다")
    }
}
