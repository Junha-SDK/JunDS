import JunDSCore
import SwiftUI

// 웹 jd-app-shell 동형 — 사이드바 레일 + 헤더/본문/푸터 골격 (DESIGN-2 §A).
//
// regular 폭: 레일(collapsed면 collapsedWidth) + 본문 열.
// compact 폭(< md 768 = 웹 mobileBreakpoint 기본): 레일 대신 오버레이 드로어 + 딤 배경,
// 딤을 탭하면 닫힌다(웹 backdrop 클릭 동형).
//
// 웹 Ctrl/⌘+B 단축키는 iOS에서 하드웨어 키보드 한정이라 표면에서 제외했다 —
// collapsed / compactOpen 바인딩으로 소비자가 제어한다(compact에서 드로어를 여는
// 메뉴 버튼도 소비자 header 몫: 웹이 헤더에 심던 햄버거의 iOS 번역).
public struct JdAppShell<Sidebar: View, Header: View, Content: View, Footer: View>: View {

    private let sidebarWidth: CGFloat
    private let collapsedWidth: CGFloat
    @Binding private var collapsed: Bool
    @Binding private var compactOpen: Bool

    private let sidebar: Sidebar
    private let header: Header
    private let content: Content
    private let footer: Footer

    // Reduce Motion 존중 (04 §7.3) — 환경값과 JdMotion 부트스트랩 둘 다 확인
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    // 기본값은 웹 jd-app-shell props 그대로 (sidebarWidth 260 / collapsedWidth 64 = JdToken.Space.s16)
    public init(
        sidebarWidth: CGFloat = 260,
        collapsedWidth: CGFloat = 64,
        collapsed: Binding<Bool>,
        compactOpen: Binding<Bool>,
        @ViewBuilder sidebar: () -> Sidebar,
        @ViewBuilder header: () -> Header,
        @ViewBuilder content: () -> Content,
        @ViewBuilder footer: () -> Footer
    ) {
        self.sidebarWidth = sidebarWidth
        self.collapsedWidth = collapsedWidth
        self._collapsed = collapsed
        self._compactOpen = compactOpen
        self.sidebar = sidebar()
        self.header = header()
        self.content = content()
        self.footer = footer()
    }

    public var body: some View {
        GeometryReader { proxy in
            // compact 판정은 컨테이너 폭 기준 (04 §10) — 웹 matchMedia(max-width: 767px) 동형
            shell(isCompact: proxy.size.width < JdBreakpoint.md.width)
        }
        .background(JdToken.Color.background.color)
    }

    // MARK: 골격

    @ViewBuilder
    private func shell(isCompact: Bool) -> some View {
        ZStack(alignment: .leading) {
            HStack(spacing: 0) {
                if hasSidebar && !isCompact {
                    sidebarPane
                        .frame(width: collapsed ? collapsedWidth : sidebarWidth)
                }
                mainColumn
            }
            if hasSidebar && isCompact && compactOpen {
                backdrop
                sidebarPane
                    .frame(width: sidebarWidth)
                    .transition(.move(edge: .leading))
                    // 드로어가 열린 동안 배경은 VoiceOver에서 격리 — 웹 스크롤 락의 iOS 번역
                    .accessibilityAddTraits(.isModal)
            }
        }
        // 드로어가 밀려 들어오는 동안 셸 밖으로 새지 않게 자른다
        .clipped()
        .animation(shellAnimation, value: collapsed)
        .animation(shellAnimation, value: compactOpen)
        .onChange(of: isCompact) { compact in
            // regular 복귀 시 드로어 닫힘 (웹 #syncMobile 동형)
            if !compact && compactOpen { compactOpen = false }
        }
    }

    // 웹 .jd-app-shell__sidebar — 배경 white 리터럴은 card 토큰으로 승계(다크 대응 보정),
    // 오른쪽 1pt 보더는 --jd-color-border 그대로.
    private var sidebarPane: some View {
        sidebar
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .background(JdToken.Color.card.color)
            .overlay(alignment: .trailing) { verticalLine }
    }

    // 웹 .jd-app-shell__main — header / content / footer 세로 열
    private var mainColumn: some View {
        VStack(spacing: 0) {
            if hasHeader {
                header
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(JdToken.Color.card.color)
                    .overlay(alignment: .bottom) { horizontalLine }
            }
            content
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            if hasFooter {
                footer
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(JdToken.Color.card.color)
                    .overlay(alignment: .top) { horizontalLine }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // 웹 .jd-app-shell__backdrop — #000 · opacity 0.3. 탭하면 닫힘.
    // 웹은 aria-hidden이라 AT에서 닫기 경로가 사라지는데, iOS는 버튼으로 노출해 보정한다 (04 §7.1).
    private var backdrop: some View {
        Button {
            compactOpen = false
        } label: {
            Color.black.opacity(JdToken.Opacity.o30)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(Text("사이드바 닫기"))
        .transition(.opacity)
    }

    private var verticalLine: some View {
        JdToken.Color.border.color.frame(width: JdToken.Border.thin)
    }

    private var horizontalLine: some View {
        JdToken.Color.border.color.frame(height: JdToken.Border.thin)
    }

    // MARK: 모션

    // 웹 레일 전환 300ms cubic-bezier(0.16,1,0.3,1) = Duration.slow + Easing.default
    private var shellAnimation: Animation? {
        let duration = reduceMotion ? 0 : JdMotion.duration(JdToken.Duration.slow)
        guard duration > 0 else { return nil }
        let curve = JdToken.Easing.default
        return .timingCurve(curve.0, curve.1, curve.2, curve.3, duration: duration)
    }

    // MARK: 슬롯 유무 — 웹이 슬롯 노드가 있을 때만 영역을 만드는 것과 동형(빈 슬롯에 보더 방지)

    private var hasSidebar: Bool { Sidebar.self != EmptyView.self }
    private var hasHeader: Bool { Header.self != EmptyView.self }
    private var hasFooter: Bool { Footer.self != EmptyView.self }
}
