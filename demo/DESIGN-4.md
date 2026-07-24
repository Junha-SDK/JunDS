# JunDS iOS — composites 오버레이·피드백 14종 API 계약 (2026-07-24)

**Core는 이미 작성돼 빌드 통과했다.** 필독: `packages/ios/Sources/JunDSCore/Specs/JdOverlaySpecs.swift`
(+ 기존 `JdModalViewController.swift`·`JdModal.swift`가 G1 파일럿의 오버레이 정본 — 패턴 상속).

판정(04 §10.1): **오버레이 6종은 시스템 프레젠테이션 위임**, **피드백 8종은 자체 구현**(iOS 시스템
대응 없음), **별칭 2종**. 시스템이 하는 일을 자체 컨테이너로 다시 만들지 않는다.

| 웹 | iOS 판정 | 산출물 |
|---|---|---|
| Modal | 기구현(G1) — `.sheet`/`JdModalViewController` | 이미 done. 데모만 재확인 |
| Drawer | 시스템 위임 — side별 `.sheet`(bottom=detent)/전환 | `JdDrawer`(SwiftUI)/`JdDrawerController`(UIKit) |
| BottomSheet | 시스템 위임 — `presentationDetents` | `JdBottomSheet`/`JdBottomSheetController` |
| Sheet | **별칭** — BottomSheet draggable(신규 타입 없음) | 데모만 |
| ActionSheet | 시스템 위임 — `.confirmationDialog`/`UIAlertController(.actionSheet)` | `JdActionSheet`/`JdActionSheetController` |
| AlertDialog | 시스템 위임 — `.alert`/`UIAlertController(.alert)` | `JdAlertDialog`/`JdAlertDialogController` |
| ConfirmDialog | **별칭** — AlertDialog(제목·설명·확인/취소·danger) | 데모만 |
| Alert | **자체** 인라인 — 좌측 강조선 + variant 4종 | `JdAlert`/`JdAlertView` |
| Banner | **자체** 인라인 — 폭 꽉 찬 알림 바 | `JdBanner`/`JdBannerView` |
| Callout | **자체** 문서 블록 — 이모지 + 강조선 5종, collapsible | `JdCallout`/`JdCalloutView` |
| Toast | **자체** — 큐 스택(Core JdToastQueue), 자동 닫힘·hover 정지 | `JdToastCenter` + `JdToastHost` |
| Snackbar | **자체** — 단일 바, 위치 4종, 자동 닫힘 | `JdSnackbar`/`JdSnackbarView` |
| Notification | **자체** 인라인 카드 — 아이콘+제목+설명+액션+닫기 | `JdNotification`/`JdNotificationView` |
| EmptyState | **자체** — `ContentUnavailableView`류 중앙 배치 | `JdEmptyState`/`JdEmptyStateView` |
| Result | **자체** — EmptyState 파생, status별 64pt 심볼 | `JdResult`/`JdResultView` |

공통 규칙(이전 배치 동일): 서드파티 0 · 계층 상호 import 금지(DEC-010) · 색·치수는 Core
스펙/JdToken/JdGap만 · Dynamic Type 경유 · SF Symbols · 애니메이션 `JdMotion.duration` ·
UIControl 서브클래스 state/isEnabled/isSelected/isHighlighted 이름 금지 · UIView/NSObject 상속
이름 충돌 회피(description/tag 등) · 테스트 UIControl 발화는 `jdSendActions(for:)`.

**cancelable 닫기(웹 jd-request-close)의 iOS 번역**: SwiftUI엔 per-dismiss veto가 없으므로
`onDismissAttempt: (JdDismissReason) -> Bool`(false면 취소) 클로저로 바인딩을 게이트한다.
UIKit은 `UIAdaptivePresentationControllerDelegate.presentationControllerShouldDismiss`.

---

## A. 오버레이 (시스템 위임 4)

```swift
// Drawer — side별 프레젠테이션. left/right는 iOS 관용이 약해 커스텀 전환, bottom은 시트.
public struct JdDrawer<Content: View>: View {
    public init(isPresented: Binding<Bool>, side: JdDrawerSide = .right,
                size: JdOverlaySize = .md, title: String? = nil, persistent: Bool = false,
                onDismissAttempt: ((JdDismissReason) -> Bool)? = nil,
                @ViewBuilder content: () -> Content)
    // bottom → .sheet + presentationDetents(높이=size.sheetHeight). left/right → 커스텀
    //   오버레이 전환(딤 + 슬라이드, JdMotion.duration). persistent → interactiveDismissDisabled.
    // title 있으면 헤더 행(제목 + 닫기 버튼). aria-label 등가 = 시트 접근성 라벨.
}
public final class JdDrawerController: UIViewController { … present(from:), side, size, persistent, onDismissAttempt }

// BottomSheet — detent 시트. draggable=true가 Sheet 별칭의 실체(끌어 닫기 허용).
public struct JdBottomSheet<Content: View>: View {
    public init(isPresented: Binding<Bool>, size: JdOverlaySize = .md, draggable: Bool = true,
                persistent: Bool = false, onDismissAttempt: ((JdDismissReason) -> Bool)? = nil,
                @ViewBuilder content: () -> Content)
    // presentationDetents(size.sheetHeight 기반 .height 또는 .medium/.large),
    // presentationDragIndicator(draggable ? .visible : .hidden), interactiveDismissDisabled(persistent || !draggable)
}
public final class JdBottomSheetController: UIViewController { … UISheetPresentationController detents }

// ActionSheet — 선택지 목록. Core JdActionItem 배열.
public struct JdActionSheet: View {   // .confirmationDialog 래핑 모디파이어형이 자연스러우나 계약은 뷰
    public init(isPresented: Binding<Bool>, title: String? = nil, message: String? = nil,
                actions: [JdActionItem], onSelect: @escaping (JdActionItem) -> Void)
    // .confirmationDialog(title, isPresented:) { ForEach(actions) { Button(role: destructive ? .destructive : nil) } }
}
public final class JdActionSheetController { … UIAlertController(.actionSheet), present(from:) }

// AlertDialog (+ ConfirmDialog 별칭) — 제목·설명·확인/취소. danger면 확인 버튼 destructive.
public struct JdAlertDialog: View {   // .alert 래핑
    public init(isPresented: Binding<Bool>, title: String, message: String? = nil,
                confirmLabel: String = "확인", cancelLabel: String? = "취소",
                isDestructive: Bool = false, onConfirm: @escaping () -> Void, onCancel: (() -> Void)? = nil)
    // .alert(title, isPresented:) { Button(confirm, role: destructive ? .destructive : nil); if cancel { Button(cancel, role:.cancel) } }
}
public final class JdAlertDialogController { … UIAlertController(.alert), present(from:) }
```

## B. 인라인 피드백 (자체 구현 6)

```swift
// Alert — 좌측 강조선 + variant. role은 danger/warning만 alert(웹 판정 승계).
public struct JdAlert<Content: View>: View {
    public init(_ title: String, variant: JdFeedbackVariant = .info,
                isDismissible: Bool = false, onDismiss: (() -> Void)? = nil,
                @ViewBuilder content: () -> Content = { EmptyView() })
    // 좌측 3pt 강조선(variant.color) + 5% 틴트 배경. a11y: danger/warning는 .isStaticText+announce assertive/polite
}
public final class JdAlertView: UIView { … }

// Banner — 폭 꽉 찬 알림 바. 배경 = variant.color, 흰 글자(대비 위해 배경에 foreground 20% 혼합)
public struct JdBanner: View {
    public init(_ message: String, variant: JdFeedbackVariant = .info,
                actionLabel: String? = nil, onAction: (() -> Void)? = nil,
                isDismissible: Bool = false, onDismiss: (() -> Void)? = nil)
}
public final class JdBannerView: UIView { … }

// Callout — 문서 강조 블록. Core JdCalloutVariant(이모지+색). collapsible은 DisclosureGroup.
public struct JdCallout<Content: View>: View {
    public init(_ title: String, variant: JdCalloutVariant = .note, isCollapsible: Bool = false,
                initiallyExpanded: Bool = true, @ViewBuilder content: () -> Content)
    // collapsible → DisclosureGroup(제목 라벨 + 이모지). 아니면 정적 블록. 좌측 3pt 강조선.
}
public final class JdCalloutView: UIView { … }

// Notification — 인라인 카드(아이콘+제목+설명+액션+닫기). 30% 테두리 + 5% 틴트.
public struct JdNotification<Extra: View>: View {
    public init(title: String? = nil, description: String? = nil, variant: JdFeedbackVariant = .info,
                systemImage: String? = nil, isDismissible: Bool = false,
                onDismiss: (() -> Void)? = nil, @ViewBuilder extra: () -> Extra = { EmptyView() })
}
public final class JdNotificationView: UIView { … }

// EmptyState — 중앙 배치(아이콘 칩 + 제목 + 설명 + 액션). ContentUnavailableView는 iOS17+라 자체 구현.
public struct JdEmptyState<Action: View>: View {
    public init(title: String, description: String? = nil, systemImage: String = "tray",
                @ViewBuilder action: () -> Action = { EmptyView() })
    // 3pt 원형 아이콘 칩(cardHover 배경, muted 아이콘). a11y: 요소 합치기
}
public final class JdEmptyStateView: UIView { … }

// Result — EmptyState 파생. Core JdResultStatus(심볼·색). 64pt 대형 심볼.
public struct JdResult<Action: View>: View {
    public init(status: JdResultStatus, title: String, description: String? = nil,
                @ViewBuilder action: () -> Action = { EmptyView() })
}
public final class JdResultView: UIView { … }
```

## C. Toast (자체 — 큐 상태머신)

```swift
// 앱 루트에 1회 부착하는 호스트 + 어디서든 부르는 센터(웹 toast() 싱글턴 동형).
@MainActor
public final class JdToastCenter: ObservableObject {
    public static let shared = JdToastCenter()
    @Published public private(set) var queue: JdToastQueue   // Core 상태머신
    public init(maxVisible: Int = 4)
    @discardableResult public func show(_ toast: JdToast) -> JdToast.ID   // 자동 닫힘 타이머 관리
    public func dismiss(_ id: JdToast.ID)
    public func clear()
    // 자동 닫힘: duration>0이면 Task.sleep 후 dismiss. hover/드래그 중이면 정지(WCAG 2.2.1).
}
public extension View {
    /// position별 정렬로 큐를 오버레이. 앱 루트에 1회.
    func jdToastHost(_ center: JdToastCenter = .shared, position: JdToastPosition = .topRight) -> some View
}
// UIKit: JdToastHostView(center:position:) — 클로저 구독 + 스택 재렌더(§4.1 UIKit 브리지 패턴)

// Snackbar — 단일 바(스택 아님). 위치 4종(bottom/top/bottom-left/bottom-right).
public struct JdSnackbar: View {
    public init(isPresented: Binding<Bool>, message: String, variant: JdFeedbackVariant = .info,
                position: JdToastPosition = .bottom, duration: TimeInterval = 4,
                actionLabel: String? = nil, onAction: (() -> Void)? = nil)
    // 자동 닫힘 + hover/focus 정지. 배경 surfaceOverlay(default) 또는 variant.color, 흰 글자.
}
public final class JdSnackbarView: UIView { … }
```

## D. 테스트 요구

- **Core 전수**: `JdToastQueue`(add·max 초과 축출·dismiss·clear), `JdOverlaySize` 프리셋 값,
  `JdFeedbackVariant.color/announcePriority`(danger만 assertive), `JdResultStatus.systemImage/color`,
  `JdCalloutVariant.emoji/color`, `JdToastPosition.isTop/isLeading/isCentered`, `JdDismissReason` 전수.
- UIKit 뷰: init 상태·프로퍼티 didSet·접근성(라벨/트레이트/닫기 버튼).
- SwiftUI: 호스팅 스모크. **오버레이는 present 자체를 단위 테스트하기 어려우니** 바인딩 토글·
  onDismissAttempt 게이트·JdActionItem destructive 매핑만 검증(프레젠테이션은 쇼룸 실기동으로).

## E. 데모

`demo/JunDSDemo.swiftpm/Demos/<LedgerId>Demo.swift`, ledger id 정확히. DemoRegistry 등록은 통합자만.
오버레이는 "열기" 버튼 + 프레젠테이션 시연. 별칭(Sheet/ConfirmDialog)도 데모는 만든다(BottomSheet
draggable / AlertDialog 확인·취소 형태로). `DemoState` free function엔 @MainActor. `body` 저장 금지.
