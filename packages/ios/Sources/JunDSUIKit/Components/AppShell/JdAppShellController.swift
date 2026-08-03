import JunDSCore
import UIKit

// 웹 jd-app-shell 동형 — 사이드바 레일 + 본문 2열 골격 (DESIGN-2 §A).
//
// regular 폭: 레일(접히면 collapsedWidth) + 본문. compact 폭(< md 768 = 웹 mobileBreakpoint
// 기본): 레일 대신 오버레이 드로어 + 딤 뷰, 딤을 탭하면 닫힌다(웹 backdrop 클릭 동형).
// 자식 VC 컨테인먼트 규약(addChild → addSubview → didMove) 준수.
//
// 웹 Ctrl/⌘+B 단축키는 하드웨어 키보드 한정이라 표면에서 제외 — isCollapsed / isCompactOpen로
// 소비자가 제어한다(compact에서 드로어를 여는 메뉴 버튼은 소비자 헤더 몫).
public final class JdAppShellController: UIViewController {

    // MARK: 표면

    /// 웹 sidebar-collapsed 동형 — 레일 폭 전환(애니메이션)
    public var isCollapsed: Bool = false {
        didSet {
            guard isCollapsed != oldValue else { return }
            applyLayout(animated: true)
        }
    }

    /// 웹 mobile-open 동형 — compact 폭에서만 의미가 있는 드로어 개폐.
    /// (SwiftUI JdAppShell의 compactOpen 바인딩과 대칭 표면)
    public var isCompactOpen: Bool {
        get { compactOpenStorage }
        set {
            guard newValue != compactOpenStorage else { return }
            compactOpenStorage = newValue
            applyLayout(animated: true)
        }
    }

    /// 웹 sidebarWidth — 기본 260(토큰 밖 레이아웃 상수, 웹 props 승계)
    public var sidebarWidth: CGFloat = 260 {
        didSet {
            guard sidebarWidth != oldValue else { return }
            applyLayout(animated: false)
        }
    }

    /// 웹 collapsedWidth — 기본 64(= JdToken.Space.s16)
    public var collapsedWidth: CGFloat = JdToken.Space.s16 {
        didSet {
            guard collapsedWidth != oldValue else { return }
            applyLayout(animated: false)
        }
    }

    // MARK: 내부 상태 · 뷰

    private var compactOpenStorage = false

    // compact 판정은 컨테이너 폭 기준 (04 §10) — 테스트가 읽는다 (04 §8.2)
    private(set) var isCompact = false

    let sidebarContainer = UIView()
    let contentContainer = UIView()

    private let dimView = UIControl()
    private let sidebarBorder = UIView()

    private let sidebarController: UIViewController
    private let contentController: UIViewController

    public init(sidebar: UIViewController, content: UIViewController) {
        self.sidebarController = sidebar
        self.contentController = content
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    // MARK: 생명주기

    public override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = JdToken.Color.background.uiColor
        // 닫힌 드로어는 왼쪽 밖에 대기한다 — 셸이 화면 일부만 차지해도 밖으로 새지 않게 자른다
        view.clipsToBounds = true

        // 웹의 사이드바 배경 white 리터럴은 card 토큰으로 승계(다크 대응 보정), 보더는 border 토큰
        sidebarContainer.backgroundColor = JdToken.Color.card.uiColor
        sidebarBorder.backgroundColor = JdToken.Color.border.uiColor

        // 웹 .jd-app-shell__backdrop — #000 · opacity 0.3
        dimView.backgroundColor = UIColor.black.withAlphaComponent(CGFloat(JdToken.Opacity.o30))
        dimView.alpha = 0
        dimView.isHidden = true
        // 웹 백드롭은 aria-hidden이라 AT에서 닫기 경로가 사라진다 — iOS는 버튼으로 노출해 보정 (04 §7.1)
        dimView.isAccessibilityElement = true
        dimView.accessibilityTraits = .button
        dimView.accessibilityLabel = "사이드바 닫기"
        dimView.addTarget(self, action: #selector(didTapDim), for: .touchUpInside)

        // z 순서: 본문 → 딤 → 드로어 (웹 z-index 1300/1400 동형)
        view.addSubview(contentContainer)
        view.addSubview(dimView)
        view.addSubview(sidebarContainer)

        embed(contentController, in: contentContainer)
        embed(sidebarController, in: sidebarContainer)

        // 보더는 자식 위에 — 사이드바 오른쪽 1pt
        sidebarContainer.addSubview(sidebarBorder)

        // 한 뷰의 제약은 한 블록에 모은다 — 같은 파일에서 layout을 두 번 부르면 diff가
        // 앞선 제약을 걷어내기 때문 (04 §5.3, DEC-013)
        contentContainer.jd.layout {
            $0.top.bottom.trailing.equalToSuperview()
            $0.leading.equalToSuperview().offset(0)
        }
        dimView.jd.layout {
            $0.edges.equalToSuperview()
        }
        sidebarContainer.jd.layout {
            $0.top.bottom.equalToSuperview()
            $0.leading.equalToSuperview().offset(0)
            $0.width.equal(sidebarWidth)
        }
        sidebarBorder.jd.layout {
            $0.top.bottom.trailing.equalToSuperview()
            $0.width.equal(JdToken.Border.thin)
        }

        // 초기 상수 확정 — compact 판정은 첫 배치(viewDidLayoutSubviews)에서 보정된다
        applyLayout(animated: false)
    }

    public override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        // 웹 matchMedia(max-width: mobileBreakpoint-1) 동형 — 컨테이너 폭이 판단 근거
        let compact = view.bounds.width < JdBreakpoint.md.width
        guard compact != isCompact else { return }
        isCompact = compact
        // regular 복귀 시 드로어 닫힘 (웹 #syncMobile 동형) — 공개 세터를 거치지 않아
        // 배치 도중 애니메이션이 재진입하지 않는다
        if !compact { compactOpenStorage = false }
        applyLayout(animated: false)
    }

    // MARK: 배치 적용

    private func applyLayout(animated: Bool) {
        guard isViewLoaded else { return }
        updateConstants()

        let drawerVisible = isCompact && compactOpenStorage
        let dimAlpha: CGFloat = drawerVisible ? 1 : 0
        if drawerVisible { dimView.isHidden = false }

        // compact 닫힘 = 화면 밖 + AT 제외(웹 display:none 동형), 열림 = 배경 격리
        sidebarContainer.accessibilityElementsHidden = isCompact && !compactOpenStorage
        sidebarContainer.accessibilityViewIsModal = drawerVisible

        let duration = JdMotion.duration(JdToken.Duration.slow)
        guard animated, duration > 0 else {
            view.setNeedsLayout()
            dimView.alpha = dimAlpha
            dimView.isHidden = !drawerVisible
            return
        }

        // 웹 레일 전환 300ms cubic-bezier(0.16,1,0.3,1) = Duration.slow + Easing.default
        let curve = JdToken.Easing.default
        let animator = UIViewPropertyAnimator(
            duration: duration,
            controlPoint1: CGPoint(x: curve.0, y: curve.1),
            controlPoint2: CGPoint(x: curve.2, y: curve.3)
        ) { [weak self] in
            self?.view.layoutIfNeeded()
            self?.dimView.alpha = dimAlpha
        }
        animator.addCompletion { [weak self] _ in
            self?.dimView.isHidden = !drawerVisible
        }
        animator.startAnimation()
    }

    private func updateConstants() {
        let rail = isCollapsed ? collapsedWidth : sidebarWidth
        // compact의 드로어는 접힘과 무관하게 전체 폭(웹 --_jd-shell-drawer = sidebarWidth)
        let paneWidth = isCompact ? sidebarWidth : rail
        // compact 닫힘: 화면 밖으로 밀어 히트 테스트까지 차단
        let paneOffset = isCompact ? (compactOpenStorage ? 0 : -paneWidth) : 0

        sidebarContainer.jd.update {
            $0.leading.equalToSuperview().offset(paneOffset)
            $0.width.equal(paneWidth)
        }
        contentContainer.jd.update {
            // compact에선 본문이 전체 폭(드로어가 오버레이), regular에선 레일만큼 들여쓴다
            $0.leading.equalToSuperview().offset(isCompact ? 0 : rail)
        }
    }

    // MARK: 자식 컨테인먼트

    private func embed(_ child: UIViewController, in container: UIView) {
        addChild(child)
        container.addSubview(child.view)
        child.view.jd.layout {
            $0.edges.equalToSuperview()
        }
        child.didMove(toParent: self)
    }

    @objc private func didTapDim() {
        isCompactOpen = false
    }
}
