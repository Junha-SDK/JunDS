import JunDS
import SwiftUI
import UIKit

// AppShell 데모 — 실컴포넌트 JdAppShell(SwiftUI) / JdAppShellController(UIKit).
// 웹 jd-app-shell 동형: regular 폭 = 레일 + 본문, compact 폭(< md 768) = 드로어 오버레이 + 딤.
//
// 컨트롤 키는 iOS 표면(바인딩 이름)을 따른다 — 웹의 sidebar-collapsed / mobile-open은
// DESIGN-2 §A에서 collapsed / compactOpen으로 의도적으로 개명됐다("mobile"이 아니라
// 컨테이너 폭 기준 compact가 iOS의 판단 근거이기 때문, 04 §10). 웹 Ctrl/⌘+B는
// 하드웨어 키보드 한정이라 표면에서 제외 — 소비자가 바인딩으로 제어한다.

enum AppShellDemo {
    static let demo = ComponentDemo(
        id: "AppShell",
        controls: [
            .toggle("collapsed", "collapsed"),
            .toggle("compactOpen", "compactOpen"),
        ],
        swiftUI: { state in AnyView(AppShellStageSwiftUI(state: state)) },
        uikit: { state in AnyView(AppShellStageUIKit(state: state)) }
    )

    // 셸이 실물로 보이려면 높이가 필요하다 — 토큰 파생(80×4)
    static let stageHeight = JdToken.Space.s20 * 4

    static let menu = ["대시보드", "가계부", "리포트", "설정"]

    static let note =
        "compact 판정은 컨테이너 폭 < 768(JdBreakpoint.md) — iPhone 세로 무대는 항상 compact다. "
        + "그래서 여기선 compactOpen이 드로어를 열고, collapsed는 regular 폭(iPad·분할 화면)에서 레일 폭을 바꾼다."
}

// MARK: - SwiftUI 스테이지

private struct AppShellStageSwiftUI: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s3) {
            JdAppShell(
                collapsed: state.boolBinding("collapsed"),
                compactOpen: state.boolBinding("compactOpen"),
                sidebar: { AppShellSidebarPane() },
                header: { AppShellHeaderPane() },
                content: { AppShellContentPane() },
                footer: { AppShellFooterPane() }
            )
            .frame(minHeight: AppShellDemo.stageHeight)
            .cornerRadius(JdToken.Radius.lg)
            .overlay(
                RoundedRectangle(cornerRadius: JdToken.Radius.lg)
                    .stroke(JdToken.Color.border.color, lineWidth: JdToken.Border.thin)
            )

            Text(AppShellDemo.note)
                .font(.footnote)
                .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

private struct AppShellSidebarPane: View {
    var body: some View {
        VStack(alignment: .leading, spacing: JdToken.Space.s2) {
            JdText("메뉴", size: .xs, dimmed: true)
            ForEach(AppShellDemo.menu, id: \.self) { item in
                JdText(item, size: .sm, lineLimit: 1)
            }
        }
        .padding(JdToken.Space.s4)
    }
}

private struct AppShellHeaderPane: View {
    var body: some View {
        JdHeading("가계부", level: .h4)
            .padding(.horizontal, JdToken.Space.s4)
            .padding(.vertical, JdToken.Space.s3)
    }
}

private struct AppShellContentPane: View {
    var body: some View {
        VStack(alignment: .leading, spacing: JdToken.Space.s2) {
            JdText("본문 영역 — 소비자 콘텐츠가 들어간다", size: .sm)
            RoundedRectangle(cornerRadius: JdToken.Radius.md)
                .fill(JdToken.Color.primaryLight.color)
                .frame(height: JdToken.Space.s16)
        }
        .padding(JdToken.Space.s4)
    }
}

private struct AppShellFooterPane: View {
    var body: some View {
        JdText("푸터", size: .xs, dimmed: true)
            .padding(.horizontal, JdToken.Space.s4)
            .padding(.vertical, JdToken.Space.s2)
    }
}

// MARK: - UIKit 스테이지

private struct AppShellStageUIKit: View {
    @ObservedObject var state: DemoState

    var body: some View {
        VStack(spacing: JdToken.Space.s3) {
            AppShellRep(
                collapsed: state.bool("collapsed"),
                compactOpen: state.bool("compactOpen")
            )
            .frame(minHeight: AppShellDemo.stageHeight)
            .cornerRadius(JdToken.Radius.lg)
            .overlay(
                RoundedRectangle(cornerRadius: JdToken.Radius.lg)
                    .stroke(JdToken.Color.border.color, lineWidth: JdToken.Border.thin)
            )

            // UIKit 컨트롤러는 header/footer 슬롯이 없다(사이드바 + 본문 2열) — 표면 차이를 명시
            Text(
                "JdAppShellController는 sidebar + content 2열 표면이다(헤더·푸터는 소비자 본문 몫). "
                    + AppShellDemo.note
            )
            .font(.footnote)
            .foregroundColor(.secondary)
        }
        .padding(JdToken.Space.s6)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주)
private struct AppShellRep: UIViewControllerRepresentable {
    var collapsed: Bool
    var compactOpen: Bool

    func makeUIViewController(context: Context) -> JdAppShellController {
        let controller = JdAppShellController(
            sidebar: appShellSidebarController(),
            content: appShellContentController())
        controller.isCollapsed = collapsed
        controller.isCompactOpen = compactOpen
        return controller
    }

    func updateUIViewController(_ controller: JdAppShellController, context: Context) {
        controller.isCollapsed = collapsed
        controller.isCompactOpen = compactOpen
    }
}

private func appShellSidebarController() -> UIViewController {
    let controller = UIViewController()
    var rows: [UIView] = [JdTextView("메뉴", size: .xs, dimmed: true)]
    rows.append(
        contentsOf: AppShellDemo.menu.map { item -> UIView in
            let label = JdTextView(item, size: .sm)
            label.numberOfLines = 1
            return label
        })
    let stack = JdStackView.vertical(gap: .sm, rows)
    controller.view.addSubview(stack)
    stack.jd.layout {
        $0.top.leading.trailing.equalToSuperview().inset(JdToken.Space.s4)
    }
    return controller
}

private func appShellContentController() -> UIViewController {
    let controller = UIViewController()
    controller.view.backgroundColor = .clear

    let block = UIView()
    block.backgroundColor = JdToken.Color.primaryLight.uiColor
    block.layer.cornerRadius = JdToken.Radius.md
    block.jd.layout { $0.height.equal(JdToken.Space.s16) }

    let stack = JdStackView.vertical(
        gap: .sm,
        [
            JdTextView("본문 영역 — 소비자 콘텐츠가 들어간다", size: .sm),
            block,
        ])
    controller.view.addSubview(stack)
    stack.jd.layout {
        $0.top.leading.trailing.equalToSuperview().inset(JdToken.Space.s4)
    }
    return controller
}
