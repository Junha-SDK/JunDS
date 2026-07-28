# 04-ios-arch — iOS 아키텍처 + 레이아웃 DSL (G0)

작성일: 2026-07-23 · 전제: DEC-002(레포 진화, Package.swift는 루트) · DEC-003(전량 전환) · DEC-004(iOS 16 최소) · DEC-006 D3/D4/D5 채택
참조: `docs-spec/00-inventory.md`(UI 320 + finance 86, iOS 난이도 S 97 · M 190 · L 25 · N/a 6), `docs-spec/DECISIONS.md`
상태: iOS 코드는 현재 **0줄** — 이 문서가 전체 표면의 단일 정의다. 여기 없는 공개 API는 존재하지 않는 것으로 간주한다.
개정: 2026-07-23 — **DEC-010 반영.** G0 게이트에서 최초안의 "JunDSSwiftUI→JunDSUIKit 의존(L급 Representable 랩)"이 사람에 의해 명시 기각됨 → SwiftUI/UIKit **완전 독립 2계통** + Core 이전 극대화로 개정 (§1 A3 · §2.2 · §4.2 신설 · §10 · §11).

---

## 1. 결정 요약

| #   | 결정                                                                                                          | 근거                                                                                                                                                                                                                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | 단일 제품 `JunDS`, 내부 4타겟(3계층 + 우산)                                                                   | 소비자 표면은 `import JunDS` 하나. `@_exported`는 우산 타겟이 필요하므로 계층 3 + 우산 1                                                                                                                                                                                |
| A2  | JunDSCore는 UIKit/SwiftUI import 금지 (Foundation + CoreGraphics까지만)                                       | 순수 로직을 호스트 macOS에서 시뮬레이터 없이 테스트, 향후 macOS/watchOS 확장 여지                                                                                                                                                                                       |
| A3  | JunDSSwiftUI와 JunDSUIKit은 **완전 독립 2계통**(상호 미의존) — 공유는 JunDSCore뿐                             | **DEC-010 (사람 결정)**: 최초안의 SwiftUI→UIKit 의존(L급 Representable 랩)을 게이트에서 명시 기각. L급 24종은 로직·상태머신·계산·측정을 Core로 최대한 내리고 렌더 표면만 각 계층이 관용적으로 구현 — **이중 구현 비용은 사람이 인지하고 감수한 결정**. 분할 기준은 §4.2 |
| A4  | 상태 공유는 ObservableObject (@Observable 금지)                                                               | @Observable(Observation)은 iOS 17+. 최소 지원이 16이므로 선택지가 없음. v4에서 최소 버전 상향 시 일괄 이행                                                                                                                                                              |
| A5  | 레이아웃 DSL은 NSLayoutConstraint 체이닝 래퍼 `view.jd.layout {}`                                             | DEC-006 D4. 플렉스 엔진 자작 금지 — 오토레이아웃 엔진을 대체하지 않고 표기만 대체                                                                                                                                                                                       |
| A6  | `layout {}` 재호출은 **diff** (SnapKit make의 중복 누적 문제 제거)                                            | SnapKit 최다 실수 유형(make 재호출로 제약 중복)을 구조적으로 봉쇄                                                                                                                                                                                                       |
| A7  | 스냅샷 테스트: 자체 최소 유틸 **도입** (약 60줄), 단 게이트는 M2부터                                          | 서드파티 0 원칙. 픽셀 비교는 취약하므로 CI 시뮬레이터 1종·OS 고정으로 변동 요인 제거                                                                                                                                                                                    |
| A8  | 명명: SwiftUI `JdButton`(View 구조체) / UIKit `JdButtonView`(UIView 서브클래스) / 옵션 열거형은 Core 1회 정의 | 웹 `jd-` 접두(D1)와 대칭. 접미사 `View`로 프레임워크 구분이 호출부에서 즉시 판독됨                                                                                                                                                                                      |

---

## 2. 패키지 구조와 Package.swift

### 2.1 디렉터리

```
JunDS/                          ← 레포 루트 (npm 레포와 공존)
├── Package.swift               ← 루트 고정 (DEC-002). Xcode "Add Package"가 레포 URL만으로 동작
├── packages/
│   └── ios/
│       ├── Sources/
│       │   ├── JunDSCore/      ← 토큰(생성 코드)·옵션 열거형·상태머신·순수 로직
│       │   ├── JunDSUIKit/     ← Jd*View, 레이아웃 DSL, UIKit 토큰 브리지
│       │   ├── JunDSSwiftUI/   ← Jd* View 구조체, 모디파이어, SwiftUI 토큰 브리지
│       │   └── JunDS/          ← 우산: Exports.swift 1파일
│       └── Tests/
│           ├── JunDSCoreTests/
│           ├── JunDSUIKitTests/
│           └── JunDSSwiftUITests/
└── (기존 ds/, app/, tokens/ 등 웹 자산)
```

- SPM 기본 경로(`Sources/<Target>`)를 쓰지 않으므로 모든 타겟에 `path:`를 명시한다. 루트 Package.swift + `packages/ios` 소스 배치의 유일한 비용이며, 이것으로 npm 워크스페이스와 충돌 없이 공존한다.
- `.build/`, `*.xcodeproj`(생성 시)는 .gitignore에 추가한다. Xcode 프로젝트 파일은 커밋하지 않는다 — SPM이 프로젝트다.

### 2.2 Package.swift 전체 초안

```swift
// swift-tools-version: 5.9
// JunDS v3 — iOS. 소스는 packages/ios/ 아래에 있고 매니페스트만 레포 루트다 (DEC-002).
import PackageDescription

let swiftSettings: [SwiftSetting] = [
    .enableUpcomingFeature("ExistentialAny"),
    .enableExperimentalFeature("StrictConcurrency"), // 5.9에선 experimental — 경고로 조기 검출
]

let package = Package(
    name: "JunDS",
    defaultLocalization: "ko",
    platforms: [
        .iOS(.v16), // DEC-004
    ],
    products: [
        // 제품은 하나. 내부 계층은 우산 타겟이 @_exported로 재수출한다.
        .library(name: "JunDS", targets: ["JunDS"]),
    ],
    targets: [
        // 계층 1 — 순수 로직. UIKit/SwiftUI import 금지 (CI에서 grep 게이트).
        .target(
            name: "JunDSCore",
            path: "packages/ios/Sources/JunDSCore",
            swiftSettings: swiftSettings
        ),
        // 계층 2 — UIKit 구현체 + 레이아웃 DSL.
        .target(
            name: "JunDSUIKit",
            dependencies: ["JunDSCore"],
            path: "packages/ios/Sources/JunDSUIKit",
            swiftSettings: swiftSettings
        ),
        // 계층 3 — SwiftUI. JunDSUIKit과 상호 미의존 — 완전 독립 2계통 (DEC-010, §4.2).
        .target(
            name: "JunDSSwiftUI",
            dependencies: ["JunDSCore"],
            path: "packages/ios/Sources/JunDSSwiftUI",
            swiftSettings: swiftSettings
        ),
        // 우산 — 소스는 Exports.swift 1파일.
        .target(
            name: "JunDS",
            dependencies: ["JunDSCore", "JunDSUIKit", "JunDSSwiftUI"],
            path: "packages/ios/Sources/JunDS",
            swiftSettings: swiftSettings
        ),
        .testTarget(
            name: "JunDSCoreTests",
            dependencies: ["JunDSCore"],
            path: "packages/ios/Tests/JunDSCoreTests"
        ),
        .testTarget(
            name: "JunDSUIKitTests",
            dependencies: ["JunDSUIKit"],
            path: "packages/ios/Tests/JunDSUIKitTests"
        ),
        .testTarget(
            name: "JunDSSwiftUITests",
            dependencies: ["JunDS"],
            path: "packages/ios/Tests/JunDSSwiftUITests"
        ),
    ]
)
```

`packages/ios/Sources/JunDS/Exports.swift`:

```swift
@_exported import JunDSCore
@_exported import JunDSUIKit
@_exported import JunDSSwiftUI
```

**결정과 근거**

- **tools-version 5.9** (Xcode 15.0+): iOS 16 타겟에 충분하고, 2026년 시점에서 소비자 툴체인 하한을 가장 넓게 잡는다. 매크로가 필요해지는 시점(현재 없음)에 5.10+로 올린다.
- **`@_exported` 채택**: 밑줄 API지만 Apple 자체 프레임워크(예: Foundation의 재수출)와 대형 SDK들이 수년째 쓰는 사실상 안정 표면이다. 대안(소비자가 `import JunDSCore` 3줄)은 "제품 1개 = import 1개" 목표를 깬다. 우산 타겟 1파일에만 격리했으므로, 만약 파손되면 그 1파일만 고치면 된다.
- **내부 타겟 직접 import는 미지원 공표**: `import JunDSCore`가 기술적으로는 가능하나(제품에 포함된 타겟), 문서·릴리스 노트에서 지원 표면은 `import JunDS` 하나임을 못박는다. 계층 재편 자유도를 지키기 위함이다.
- **계층 독립 게이트 (DEC-010)**: `JunDSSwiftUI` 소스에서 `import JunDSUIKit`, `JunDSUIKit` 소스에서 `import JunDSSwiftUI`를 CI grep으로 금지한다(Core의 UIKit 금지 게이트와 동일 방식). 단, 금지는 **우리 타겟 간 의존**이다 — JunDSSwiftUI가 시스템 UIKit 프레임워크를 직접 import하는 것(§6 `Color(uiColor:)` 브리지, §4.2 자체 Representable)은 허용.
- **테스트 3분할**: Core 테스트는 UIKit 비의존이라 macOS 호스트에서 `swift test`로도 돈다(빠른 루프). UIKit/SwiftUI 테스트는 시뮬레이터 `xcodebuild test` 대상.
- **리소스 없음**: 토큰은 JSON 리소스 로딩이 아니라 **Swift 코드 생성**(§6)이므로 `resources:` 선언이 없다. 번들 로딩 비용과 리소스 접근 API가 통째로 사라진다.

---

## 3. 명명 규약

| 대상              | 규약                                                          | 예                                                               |
| ----------------- | ------------------------------------------------------------- | ---------------------------------------------------------------- |
| SwiftUI 컴포넌트  | `Jd<이름>` — View 구조체                                      | `JdButton`, `JdToggle`, `JdBottomSheet`                          |
| UIKit 컴포넌트    | `Jd<이름>View` — UIView/UIControl 서브클래스                  | `JdButtonView`, `JdToggleView`                                   |
| UIKit 컨트롤러급  | `Jd<이름>Controller`                                          | `JdBottomSheetController` (UISheetPresentationController 래핑)   |
| 옵션 열거형       | `Jd<이름><축>` — **JunDSCore에 1회 정의**, 양 프레임워크 공유 | `JdButtonVariant`, `JdToastVariant`                              |
| 공용 축           | 컴포넌트 무관 축은 공용 타입                                  | `JdControlSize`(sm/md/lg), `JdTone`(info/success/warning/danger) |
| 상태머신/센터     | `Jd<이름>Center` / `Jd<이름>State` — Core                     | `JdToastCenter`, `JdWizardState`                                 |
| 레이아웃 DSL      | `jd` 네임스페이스 + `Jd` 접두 타입                            | `view.jd.layout {}`, `JdLayoutProxy`                             |
| 모디파이어/스타일 | `jd` 소문자 프리픽스 메서드                                   | `.jdToastHost()`, `.jdFont(.body)`                               |

규칙:

1. **옵션 열거형은 Core에만 있다.** SwiftUI와 UIKit이 같은 `JdButtonVariant`를 받으므로 양쪽 API 시그니처가 자동으로 동기화된다. 웹 쪽 variant 문자열(`"primary"` 등)과 rawValue를 일치시켜 토큰 생성기·문서·테스트 픽스처가 3플랫폼에서 같은 리터럴을 쓴다.
2. 공용 축을 우선 쓴다. 컴포넌트별 `JdBadgeSize` 같은 파생은 그 컴포넌트에만 있는 축일 때만 허용한다(인벤토리 320개 × 축 2~3개의 열거형 폭발 방지).
3. `left/right` 대신 `leading/trailing`. DSL에도 left/right 앵커를 **제공하지 않는다**(§5.6) — RTL 무결성을 컴파일 타임에 강제.
4. 파일 배치: 컴포넌트당 1파일 원칙. `JunDSUIKit/Components/Button/JdButtonView.swift`, `JunDSSwiftUI/Components/Button/JdButton.swift`, 공유 스펙은 `JunDSCore/Specs/JdButtonSpec.swift`.

---

## 4. 상태 공유 패턴

원칙: **로직은 Core의 순수 타입으로 정확히 1회 구현**하고, 프레임워크 계층은 "구독 브리지"만 쓴다.

| 계층         | 브리지                                                      | 근거                                                                                       |
| ------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| JunDSCore    | 콜백 구독(`observe → JdCancellable`) + 값 타입 상태         | Combine조차 안 씀 — Core를 순수 Swift로 유지, 테스트에 스케줄러 주입                       |
| JunDSSwiftUI | `ObservableObject` + `@Published` 미러                      | A4: iOS 16이라 @Observable 불가. ObservableObject는 16에서 완전 동작                       |
| JunDSUIKit   | 클로저 콜백 기본, 델리게이트 프로토콜은 다이벤트 컴포넌트만 | 단일 이벤트는 클로저가 호출부 소음이 적음. 이벤트 4개↑(예: 시트 라이프사이클)만 델리게이트 |

UI 상태 센터는 `@MainActor` 고정이다. UI 갱신 외 소비자가 없고, 스레드 규약을 타입에 박는 편이 문서보다 강하다. 시간 의존성은 전부 주입한다(테스트 가상 시계).

### 4.1 정본 예시 — Toast 큐 (전체 코드)

새 상태 공유 컴포넌트는 이 3단 구조를 그대로 복제한다.

**JunDSCore/Specs/JdToast.swift**

```swift
import Foundation

public enum JdToastVariant: String, CaseIterable, Sendable {
    case info, success, warning, danger
}

public struct JdToast: Identifiable, Equatable, Sendable {
    public let id: UUID
    public var message: String
    public var variant: JdToastVariant
    public var duration: TimeInterval // 0 = 수동 dismiss 전용

    public init(message: String,
                variant: JdToastVariant = .info,
                duration: TimeInterval = 3) {
        self.id = UUID()
        self.message = message
        self.variant = variant
        self.duration = duration
    }
}

/// 구독 해지 토큰. deinit 시 자동 해지된다.
public final class JdCancellable {
    private var onCancel: (() -> Void)?
    public init(_ onCancel: @escaping () -> Void) { self.onCancel = onCancel }
    public func cancel() { onCancel?(); onCancel = nil }
    deinit { cancel() }
}
```

**JunDSCore/State/JdToastCenter.swift**

```swift
import Foundation

/// 토스트 큐 상태머신 — UIKit/SwiftUI/Combine 미의존.
/// 웹 v3의 DsToastProvider → 명령형 toast() 전환(00-inventory)과 동형 설계.
@MainActor
public final class JdToastCenter {

    public struct Config: Sendable {
        public var maxVisible: Int
        public init(maxVisible: Int = 3) { self.maxVisible = maxVisible }
    }

    /// 타이머 주입점. 기본은 메인 큐 지연 실행, 테스트는 가상 시계.
    public typealias Scheduler =
        (_ delay: TimeInterval, _ work: @escaping @MainActor () -> Void) -> JdCancellable

    public static let shared = JdToastCenter()

    public private(set) var visible: [JdToast] = []
    private var pending: [JdToast] = []
    private var timers: [JdToast.ID: JdCancellable] = [:]
    private var observers: [UUID: ([JdToast]) -> Void] = [:]
    private let config: Config
    private let schedule: Scheduler

    public init(config: Config = .init(),
                schedule: @escaping Scheduler = JdToastCenter.mainQueueScheduler) {
        self.config = config
        self.schedule = schedule
    }

    // MARK: 명령

    @discardableResult
    public func show(_ toast: JdToast) -> JdToast.ID {
        pending.append(toast)
        promote()
        return toast.id
    }

    @discardableResult
    public func show(_ message: String,
                     variant: JdToastVariant = .info,
                     duration: TimeInterval = 3) -> JdToast.ID {
        show(JdToast(message: message, variant: variant, duration: duration))
    }

    public func dismiss(_ id: JdToast.ID) {
        timers.removeValue(forKey: id)?.cancel()
        pending.removeAll { $0.id == id }
        guard let idx = visible.firstIndex(where: { $0.id == id }) else { return }
        visible.remove(at: idx)
        promote() // 자리가 났으니 대기열 승격 (승격이 없어도 promote가 notify함)
    }

    public func dismissAll() {
        timers.values.forEach { $0.cancel() }
        timers.removeAll()
        pending.removeAll()
        visible.removeAll()
        notify()
    }

    // MARK: 구독 — 등록 즉시 현재 상태를 1회 방출한다

    public func observe(_ handler: @escaping ([JdToast]) -> Void) -> JdCancellable {
        let key = UUID()
        observers[key] = handler
        handler(visible)
        return JdCancellable { [weak self] in
            Task { @MainActor in self?.observers.removeValue(forKey: key) }
        }
    }

    // MARK: 내부

    private func promote() {
        while visible.count < config.maxVisible, !pending.isEmpty {
            let toast = pending.removeFirst()
            visible.append(toast)
            if toast.duration > 0 {
                timers[toast.id] = schedule(toast.duration) { [weak self] in
                    self?.dismiss(toast.id)
                }
            }
        }
        notify()
    }

    private func notify() {
        let snapshot = visible
        observers.values.forEach { $0(snapshot) }
    }

    public static let mainQueueScheduler: Scheduler = { delay, work in
        let item = DispatchWorkItem { work() }
        DispatchQueue.main.asyncAfter(deadline: .now() + delay, execute: item)
        return JdCancellable { item.cancel() }
    }
}
```

**JunDSSwiftUI 브리지** — ObservableObject 미러 + 호스트 모디파이어:

```swift
import SwiftUI
import JunDSCore

@MainActor
public final class JdToastModel: ObservableObject {
    @Published public private(set) var toasts: [JdToast] = []
    private var subscription: JdCancellable?

    public init(center: JdToastCenter = .shared) {
        subscription = center.observe { [weak self] in self?.toasts = $0 }
    }
}

public extension View {
    /// 앱 루트에 1회 부착. 이후 어디서든 JdToastCenter.shared.show(...)
    func jdToastHost(center: JdToastCenter = .shared) -> some View {
        modifier(JdToastHostModifier(model: JdToastModel(center: center),
                                     center: center))
    }
}

struct JdToastHostModifier: ViewModifier {
    @ObservedObject var model: JdToastModel
    let center: JdToastCenter
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    func body(content: Content) -> some View {
        content.overlay(alignment: .bottom) {
            VStack(spacing: JdToken.space.sm) {
                ForEach(model.toasts) { toast in
                    JdToastCard(toast: toast) { center.dismiss(toast.id) }
                        .transition(reduceMotion
                            ? .opacity
                            : .move(edge: .bottom).combined(with: .opacity))
                }
            }
            .padding(JdToken.space.md)
            .animation(reduceMotion ? nil : .spring(duration: 0.3),
                       value: model.toasts)
        }
    }
}
```

**JunDSUIKit 브리지** — 클로저 구독 호스트 뷰:

```swift
import UIKit
import JunDSCore

/// window 또는 루트 뷰에 1회 부착하는 토스트 스택.
public final class JdToastHostView: UIView {
    private let center: JdToastCenter
    private var subscription: JdCancellable?
    private let stack = UIStackView()

    public init(center: JdToastCenter = .shared) {
        self.center = center
        super.init(frame: .zero)
        stack.axis = .vertical
        stack.spacing = JdToken.space.sm
        addSubview(stack)
        stack.jd.layout { $0.edges.equalToSuperview() }
        subscription = center.observe { [weak self] toasts in
            self?.render(toasts)
        }
    }

    required init?(coder: NSCoder) { fatalError("코드 생성 전용") }

    private func render(_ toasts: [JdToast]) {
        stack.arrangedSubviews.forEach { $0.removeFromSuperview() }
        for toast in toasts {
            let card = JdToastCardView(toast: toast)
            card.onDismiss = { [weak self] in self?.center.dismiss(toast.id) }
            stack.addArrangedSubview(card)
        }
        UIAccessibility.post(notification: .announcement,
                             argument: toasts.last?.message)
    }

    /// 이 뷰 자체는 터치를 삼키지 않는다 — 카드 영역만 히트.
    public override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        let view = super.hitTest(point, with: event)
        return view === self ? nil : view
    }
}
```

**패턴 규칙 정리**

1. Core 상태머신은 `visible`을 유일 진실로 갖고, 모든 변이는 `notify()`로 끝난다. 구독은 등록 즉시 1회 방출(늦게 붙은 호스트도 현재 상태를 그린다).
2. SwiftUI 미러 클래스는 `@Published` 프로퍼티 **복사**만 한다 — 로직 금지.
3. UIKit 호스트는 구독 → 전체 재렌더. 토스트 3개 수준에서 diff 최적화는 과설계다(D6: 측정 없는 최적화 금지).
4. 같은 패턴 적용 대상: `JdNotificationCenter`(NotificationCenter 컴포넌트), `JdWizardState`(FormWizard/Stepper), `JdTourState`(Tour/Onboarding), `JdCommandPaletteState`, finance `JdTickStore`(Live\* 계열 — 00-inventory 리스크 #4의 "상태 계층 분리"가 바로 이것).

### 4.2 Core 이전 극대화 — L급 24종의 분할 기준 (DEC-010)

DEC-010으로 JunDSSwiftUI와 JunDSUIKit은 완전 독립이다. L급 24종의 렌더 표면은 양 계층이 각자 구현하며, **이중 구현 비용은 사람이 인지하고 감수한 결정**이다. 그 비용을 통제하는 유일한 지렛대가 이 절이다: 이중화되는 것은 "그리기"뿐이어야 하고, 어렵고 틀리기 쉬운 것(로직·상태머신·계산·측정)은 전부 Core에 1회만 존재해야 한다.

**판정 규칙 4개** (설계 리뷰 게이트로 사용):

1. **시그니처에 프레임워크 타입이 없으면 Core다.** 입력(데이터 배열·포인터 좌표·가시 영역 CGRect·컨테이너 크기)과 출력(배치 지오메트리·정렬 결과·상태 전이·패스 좌표 목록)이 값 타입으로 표현 가능한 코드는 무조건 Core로 내린다.
2. **계층 파일에 허용되는 동사는 3개뿐**: 이벤트 수집 → Core 호출 → 결과 그리기. 계층 파일에 분기/계산 로직이 자라면 Core 이전 누락 신호다 — 코드 리뷰에서 반려한다.
3. **측정은 Core의 순수 함수다.** 레이아웃 계산, 가상화 윈도우 계산(가시 rect → 아이템 범위), 차트 스케일/리샘플, 히트테스트 판정은 Core가 하고, 프레임워크는 크기·오프셋 숫자만 공급한다. Core 단위 테스트가 곧 양 계층의 정합성 테스트가 된다.
4. **Core 타입은 양 계층 렌더를 동시에 지탱해야 스펙 통과.** 한쪽 계층 전용 편의 API를 Core에 넣지 않는다(넣는 순간 반대 계층과의 대칭이 깨져 이중 구현이 로직까지 번진다).

시스템 프레임워크 사용 규칙: 금지는 **우리 타겟 간 의존**(JunDSSwiftUI↔JunDSUIKit)이지 시스템 프레임워크가 아니다. SwiftUI 관용구 자체가 시스템 뷰 랩인 경우(예: 텍스트 편집 = UITextView)에는 JunDSSwiftUI가 **시스템 UIKit을 직접 import해 자체 최소 Representable**을 만든다 — JunDSUIKit 타겟은 참조하지 않고, 바인딩 글루만 이중화한다. 각주: 소비자 앱이 `JdButtonView` 등을 스스로 UIViewRepresentable로 감싸 쓰는 것은 라이브러리 관할 밖이며 무관하다(DEC-010 명시).

**L급 분할 기준표** (24종 전수를 대표 그룹 10행으로 — 개별 컴포넌트 스펙은 이 행을 정본으로 상속):

| L급 그룹                                  | JunDSCore (1회 구현)                                                                                    | JunDSUIKit 렌더                                 | JunDSSwiftUI 렌더                                                         |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------- |
| DataGrid / DataTable / Table              | 가상화 윈도우 계산(`JdVirtualWindow`: 가시 rect→행 범위), 정렬 비교기, 선택·밀도 상태머신, 컬럼 폭 해석 | UICollectionView diffable + 컴포지셔널 레이아웃 | `Table`/LazyVStack + `onGeometryChange`로 가시 영역을 Core에 보고         |
| RichTextEditor                            | `JdRichDoc` 문서 모델, 커맨드(볼드/리스트/링크)·셀렉션 상태머신, 직렬화(HTML/MD)                        | UITextView(TextKit 2) 바인딩                    | 자체 최소 UITextView Representable(시스템 UIKit 직접 — JunDSUIKit 미참조) |
| CodeEditor / MarkdownViewer / DiffViewer  | 토크나이저, 하이라이트 스팬 계산, 라인/워드 diff 알고리즘                                               | UITextView + NSAttributedString 적용            | AttributedString + Text/ScrollView                                        |
| CommandPalette                            | 퍼지 매칭 스코어러, 결과 랭킹, 키보드 내비 상태머신(§4 패턴)                                            | UICollectionView 리스트 + UIKeyCommand          | `List` + `.searchable`/`.onKeyPress`                                      |
| Kanban / SortableList / Transfer          | DnD 상태머신(소스/타깃/드롭 판정·재정렬 diff), 키보드 DnD 접근성 시퀀스                                 | UIDrag/UIDropInteraction + DropDelegate         | `.onDrag`/`.onDrop` + DropDelegate                                        |
| DsCalendar / DateRangePicker / GanttChart | 날짜 연산, 월 그리드 생성, 이벤트 겹침 배치 계산, 범위 선택 상태머신                                    | UICollectionView 월 그리드                      | LazyVGrid                                                                 |
| 커스텀 차트 (캔들/Sankey/Treemap/Flow)    | 스케일·리샘플·지오메트리 계산(정규화 좌표의 패스 목록 출력)                                             | CALayer/CAShapeLayer 드로잉                     | `Canvas` 드로잉                                                           |
| ColorPicker / SignaturePad                | HSV↔RGB 변환, 포인터 지오메트리, 스트로크 스무딩(패스 리샘플)                                           | 커스텀 UIControl + CAShapeLayer                 | `Canvas` + DragGesture                                                    |
| EmojiPicker                               | 카탈로그·검색 인덱스·최근 사용 상태                                                                     | UICollectionView 그리드                         | LazyVGrid                                                                 |
| BookReader / EmailInbox                   | 페이지네이션 계산·읽음 상태머신 / 스레드 그룹핑·3단 내비 상태                                           | UIPageViewController / UISplitViewController    | `TabView(.page)` / NavigationSplitView                                    |

---

## 5. 레이아웃 DSL — `JdLayout` (이 문서의 핵심)

SnapKit 대체. 목표는 SnapKit 사용자가 표를 한 번 보고 10분 안에 갈아탈 수 있는 표면이되, SnapKit의 두 가지 고질(재호출 시 제약 누적, 익명 제약의 디버깅 불능)을 구조적으로 제거하는 것이다.

### 5.1 표면 — 규범 예시

```swift
import JunDS

let card = UIView()
let title = UILabel()
view.addSubview(card)
card.addSubview(title)

card.jd.layout {
    $0.top.equal(to: header.jd.bottom, offset: 8)
    $0.leading.trailing.equalToSuperview().inset(16)
    $0.height.equal(48)
}

title.jd.layout {
    $0.center.equalToSuperview()
    $0.leading.greaterThanOrEqualToSuperview().inset(JdToken.space.md)
}

// 상수만 갱신 (SnapKit updateConstraints 등가)
card.jd.update { $0.height.equal(64) }

// 전면 재작성 / 해제
card.jd.remake { $0.edges.equalToSuperview() }
card.jd.deactivate()
```

### 5.2 앵커와 관계 — 전체 표

**앵커** (`JdLayoutProxy`의 프로퍼티, `.`으로 체이닝해 다축 동시 지정):

| 앵커                                | 전개                                 | 비고                                      |
| ----------------------------------- | ------------------------------------ | ----------------------------------------- |
| `top` `bottom` `leading` `trailing` | 해당 1축                             | `left/right` 미제공 (§5.6)                |
| `centerX` `centerY`                 | 해당 1축                             |                                           |
| `width` `height`                    | 치수                                 | 상수 관계(`equal(48)`) 허용되는 유일한 축 |
| `edges`                             | top+leading+bottom+trailing          | `inset`은 4변 부호 자동 처리              |
| `size`                              | width+height                         | `equal(CGSize)` 오버로드 제공             |
| `center`                            | centerX+centerY                      |                                           |
| 체이닝                              | `$0.leading.trailing` 처럼 임의 조합 | SnapKit 동형                              |

**참조** (`equal(to:)`의 우변 — `other.jd.<앵커>`):

| 참조                                              | 의미                                |
| ------------------------------------------------- | ----------------------------------- |
| `other.jd.top` … `other.jd.height`                | 다른 뷰의 앵커                      |
| `other.jd.safeArea` / `other.jd.safeArea.top` …   | `safeAreaLayoutGuide` 전체 또는 1축 |
| `other.jd.margins` / `other.jd.margins.leading` … | `layoutMarginsGuide`                |

**관계** (빌더의 종결 메서드 — 각각 아래 오버로드 3형):

| 관계                 | 오버로드                                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `equal`              | `equal(to: JdAnchorRef, offset: CGFloat = 0)` / `equal(_ constant: CGFloat)`(width·height 전용) / `equalToSuperview()` |
| `greaterThanOrEqual` | 동형 3종                                                                                                               |
| `lessThanOrEqual`    | 동형 3종                                                                                                               |
| 슈가                 | `equalToSafeArea()` `equalToMargins()` (+ GTE/LTE 변형) — superview의 해당 가이드 기준                                 |

**후위 수정자** (관계 메서드가 반환하는 `JdConstraintEditor`에 체이닝):

| 수정자                                             | 의미                                                                                            |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `.offset(CGFloat)`                                 | constant 그대로 설정                                                                            |
| `.inset(CGFloat)`                                  | trailing/bottom은 부호 반전, edges는 4변 일괄. `.inset(NSDirectionalEdgeInsets)` 오버로드       |
| `.multiplier(CGFloat)`                             | 곱 계수. **활성화 전에만 유효** — update에서 변경 시 remake 필요 (NSLayoutConstraint 자체 제약) |
| `.priority(UILayoutPriority)` / `.priority(Float)` | 우선순위                                                                                        |
| `.identifier(String)`                              | 수동 식별자 (자동 부여를 덮어씀)                                                                |

### 5.3 라이프사이클 — layout / update / remake / deactivate

| 메서드         | 의미                                                                                                                         | SnapKit 대응                                                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `layout {}`    | 최초: 수집 후 일괄 activate. **재호출: diff** — 동일 키 제약은 constant만 갱신, 사라진 제약은 deactivate, 새 제약은 activate | `makeConstraints` (단, SnapKit은 재호출 시 중복 누적 — 우리는 diff) |
| `update {}`    | 기존 제약의 **constant만** 갱신. 키가 없는 제약을 만나면 DEBUG에서 `assertionFailure`                                        | `updateConstraints`                                                 |
| `remake {}`    | 이 DSL이 이 뷰에 설치한 제약 전부 deactivate 후 새로 설치                                                                    | `remakeConstraints`                                                 |
| `deactivate()` | 이 DSL이 설치한 제약 전부 해제 (다른 경로로 설치된 제약은 불간섭)                                                            | `removeConstraints`                                                 |

자동 처리 2건:

- **`translatesAutoresizingMaskIntoConstraints = false`**: `layout/update/remake` 진입 시 대상 뷰에 자동 설정. 참조되는 상대 뷰는 건드리지 않는다(시스템 뷰를 참조할 수 있으므로).
- **제약 identifier 자동 부여**: `"jd @ViewController.swift:42 UILabel.top→UIView.bottom"` 형식(`#fileID`/`#line` 캡처). "Unable to simultaneously satisfy constraints" 로그에서 **어느 파일 몇 번째 줄의 어떤 제약인지** 즉시 판독된다. SnapKit 대비 가장 체감 큰 개선점.

### 5.4 구현 설계 + 핵심 타입 코드 스케치

파이프라인: **수집 → 서술자(descriptor) → 키 계산 → diff → 일괄 activate**.

- 블록 안에서는 `NSLayoutConstraint`를 만들지 않는다. `JdConstraintDescriptor`(참조 타입)만 쌓고, 블록 종료 후 한 번에 변환·`NSLayoutConstraint.activate(_:)` — 개별 `isActive = true` 대비 레이아웃 패스 유발이 적다.
- 후위 수정자(`.inset` 등)는 이미 수집된 서술자를 **활성화 전에** 변이한다. 서술자가 클래스인 이유다.
- diff 키 = `firstAttribute | 상대 item의 ObjectIdentifier | secondAttribute | relation | multiplier`. constant는 키에서 제외 — constant 변화가 곧 "같은 제약의 갱신"이다. 설치된 제약은 뷰의 associated object(`JdConstraintStore`)에 `[키: NSLayoutConstraint]`로 보관한다.
- `equalToSuperview()` 계열은 수집 시점이 아니라 **적용 시점**에 superview를 해석한다. superview 부재 시 `preconditionFailure("addSubview 이후에 layout을 호출하라")` — SnapKit과 동일한 계약을 더 이른 시점에 명시적으로 터뜨린다.

핵심 타입 스케치 (JunDSUIKit/Layout/ — 실제 구현의 골격, 약 100줄):

```swift
import UIKit

// MARK: 앵커 참조 — 다른 뷰/가이드의 한 변
public struct JdAnchorRef {
    let item: AnyObject                              // UIView | UILayoutGuide
    let attribute: NSLayoutConstraint.Attribute
}

// MARK: 진입 네임스페이스 — view.jd
public struct JdLayoutDSL {
    let view: UIView
    public var top: JdAnchorRef      { .init(item: view, attribute: .top) }
    public var bottom: JdAnchorRef   { .init(item: view, attribute: .bottom) }
    public var leading: JdAnchorRef  { .init(item: view, attribute: .leading) }
    public var trailing: JdAnchorRef { .init(item: view, attribute: .trailing) }
    public var centerX: JdAnchorRef  { .init(item: view, attribute: .centerX) }
    public var centerY: JdAnchorRef  { .init(item: view, attribute: .centerY) }
    public var width: JdAnchorRef    { .init(item: view, attribute: .width) }
    public var height: JdAnchorRef   { .init(item: view, attribute: .height) }
    public var safeArea: JdGuideRef  { .init(guide: view.safeAreaLayoutGuide) }
    public var margins: JdGuideRef   { .init(guide: view.layoutMarginsGuide) }

    @discardableResult
    public func layout(file: StaticString = #fileID, line: UInt = #line,
                       _ make: (JdLayoutProxy) -> Void) -> [NSLayoutConstraint] {
        apply(make, mode: .diff, source: "\(file):\(line)")
    }
    public func update(file: StaticString = #fileID, line: UInt = #line,
                       _ make: (JdLayoutProxy) -> Void) {
        apply(make, mode: .constantsOnly, source: "\(file):\(line)")
    }
    public func remake(file: StaticString = #fileID, line: UInt = #line,
                       _ make: (JdLayoutProxy) -> Void) {
        JdConstraintStore.of(view).deactivateAll()
        apply(make, mode: .diff, source: "\(file):\(line)")
    }
    public func deactivate() { JdConstraintStore.of(view).deactivateAll() }

    @discardableResult
    private func apply(_ make: (JdLayoutProxy) -> Void,
                       mode: JdConstraintStore.Mode,
                       source: String) -> [NSLayoutConstraint] {
        view.translatesAutoresizingMaskIntoConstraints = false
        let proxy = JdLayoutProxy(view: view, source: source)
        make(proxy)
        return JdConstraintStore.of(view).apply(proxy.descriptors, mode: mode)
    }
}
public extension UIView { var jd: JdLayoutDSL { .init(view: self) } }

public struct JdGuideRef {   // other.jd.safeArea / .margins — 전체 또는 1축 참조
    let guide: UILayoutGuide
    public var top: JdAnchorRef      { .init(item: guide, attribute: .top) }
    public var bottom: JdAnchorRef   { .init(item: guide, attribute: .bottom) }
    public var leading: JdAnchorRef  { .init(item: guide, attribute: .leading) }
    public var trailing: JdAnchorRef { .init(item: guide, attribute: .trailing) }
    public var centerX: JdAnchorRef  { .init(item: guide, attribute: .centerX) }
    public var centerY: JdAnchorRef  { .init(item: guide, attribute: .centerY) }
}

// MARK: 서술자 — 활성화 전의 제약 1건 (후위 수정자가 변이하므로 클래스)
final class JdConstraintDescriptor {
    let firstAttribute: NSLayoutConstraint.Attribute
    let relation: NSLayoutConstraint.Relation
    let second: JdSecondItem            // .none | .superview | .superviewGuide(...) | .ref(JdAnchorRef)
    var constant: CGFloat = 0
    var multiplier: CGFloat = 1
    var priority: UILayoutPriority = .required
    var identifier: String?             // nil이면 자동 부여
    let source: String                  // "#fileID:#line"
    // diff 키: firstAttribute | 해석된 second의 ObjectIdentifier | secondAttribute | relation | multiplier
}

// MARK: 수집 프록시 — layout 블록의 $0
public final class JdLayoutProxy {
    let view: UIView; let source: String
    var descriptors: [JdConstraintDescriptor] = []

    public var top: JdConstraintBuilder      { .init(self, [.top]) }
    public var bottom: JdConstraintBuilder   { .init(self, [.bottom]) }
    public var leading: JdConstraintBuilder  { .init(self, [.leading]) }
    public var trailing: JdConstraintBuilder { .init(self, [.trailing]) }
    public var centerX: JdConstraintBuilder  { .init(self, [.centerX]) }
    public var centerY: JdConstraintBuilder  { .init(self, [.centerY]) }
    public var width: JdConstraintBuilder    { .init(self, [.width]) }
    public var height: JdConstraintBuilder   { .init(self, [.height]) }
    public var edges: JdConstraintBuilder    { .init(self, [.top, .leading, .bottom, .trailing]) }
    public var size: JdConstraintBuilder     { .init(self, [.width, .height]) }
    public var center: JdConstraintBuilder   { .init(self, [.centerX, .centerY]) }
}

// MARK: 빌더 — 앵커 체이닝 후 관계 확정
public final class JdConstraintBuilder {
    private let proxy: JdLayoutProxy
    private var attributes: [NSLayoutConstraint.Attribute]
    init(_ proxy: JdLayoutProxy, _ attrs: [NSLayoutConstraint.Attribute]) { … }

    // 체이닝: $0.leading.trailing — 프록시와 동일한 11개 앵커 프로퍼티가 attributes에 누적
    public var trailing: JdConstraintBuilder { attributes.append(.trailing); return self }
    // …(top/bottom/leading/centerX/centerY/width/height 동형)…

    @discardableResult
    public func equal(to ref: JdAnchorRef, offset: CGFloat = 0) -> JdConstraintEditor {
        finalize(.equal, .ref(ref), constant: offset)
    }
    @discardableResult
    public func equal(_ constant: CGFloat) -> JdConstraintEditor {  // width/height 전용 — 그 외 축이면 assertionFailure
        finalize(.equal, .none, constant: constant)
    }
    @discardableResult
    public func equalToSuperview() -> JdConstraintEditor { finalize(.equal, .superview, constant: 0) }
    // greaterThanOrEqual / lessThanOrEqual: 위 3종과 동형 오버로드
    // equalToSafeArea() / equalToMargins(): finalize(.equal, .superviewGuide(.safeArea|.margins), 0)

    private func finalize(_ rel: NSLayoutConstraint.Relation,
                          _ second: JdSecondItem, constant: CGFloat) -> JdConstraintEditor {
        let items = attributes.map { attr in
            JdConstraintDescriptor(first: attr, relation: rel, second: second,
                                   constant: constant, source: proxy.source)
        }
        proxy.descriptors.append(contentsOf: items)
        return JdConstraintEditor(items: items)
    }
}

// MARK: 후위 수정자 — 수집된 서술자를 활성화 전에 변이
public final class JdConstraintEditor {
    let items: [JdConstraintDescriptor]
    @discardableResult public func offset(_ v: CGFloat) -> Self { items.forEach { $0.constant = v }; return self }
    @discardableResult public func inset(_ v: CGFloat) -> Self {
        items.forEach { $0.constant = [.trailing, .bottom, .right].contains($0.firstAttribute) ? -v : v }
        return self
    }
    @discardableResult public func multiplier(_ v: CGFloat) -> Self { items.forEach { $0.multiplier = v }; return self }
    @discardableResult public func priority(_ p: UILayoutPriority) -> Self { items.forEach { $0.priority = p }; return self }
    @discardableResult public func identifier(_ s: String) -> Self { items.forEach { $0.identifier = s }; return self }
}

// MARK: 저장소 — 뷰별 설치 제약 (associated object), diff 적용
final class JdConstraintStore {
    enum Mode { case diff, constantsOnly }
    private var installed: [JdConstraintKey: NSLayoutConstraint] = [:]
    static func of(_ view: UIView) -> JdConstraintStore { /* objc_get/setAssociatedObject */ }

    func apply(_ descriptors: [JdConstraintDescriptor], mode: Mode) -> [NSLayoutConstraint] {
        // 1. 각 서술자의 second를 해석(superview/guide → 실제 item). superview 부재 시 preconditionFailure
        // 2. 키 계산 → installed 매칭:
        //    - 일치: constant만 다르면 constraint.constant 갱신 (활성 유지 — 애니메이션 friendly)
        //    - 부재: mode == .constantsOnly 이면 DEBUG assertionFailure, 아니면 신규 생성
        // 3. 신규는 identifier(수동 ?? "jd @\(source) \(설명)") 부여 후 모아서 NSLayoutConstraint.activate
        // 4. mode == .diff: 이번 서술자에 없는 기존 키는 deactivate 후 installed에서 제거
    }
    func deactivateAll() { NSLayoutConstraint.deactivate(Array(installed.values)); installed.removeAll() }
}
```

동작 세부 결정:

- **constant 갱신은 기존 제약 객체를 유지**한 채 `constant`만 바꾼다 → `UIView.animate` 블록 안 `layoutIfNeeded()`로 제약 애니메이션이 SnapKit과 동일하게 동작.
- **multiplier 변경은 diff에서 "다른 제약"** 이다(키에 포함) — NSLayoutConstraint의 multiplier가 불변이므로 자동으로 deactivate+재생성 경로를 탄다. update에서는 금지(assertion).
- `size.equal(CGSize)` / `edges.inset(NSDirectionalEdgeInsets)` 등 편의 오버로드는 위 골격의 얇은 슈가로만 추가한다. **골격 타입 6개(DSL/GuideRef/Proxy/Builder/Editor/Store) 외 신규 타입 추가 금지** — SnapKit이 15년간 표면이 안 무너진 이유가 타입 수 절제다.

### 5.5 SnapKit → JdLayout 마이그레이션 표

| SnapKit                                                | JunDS                                                                    | 비고                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `v.snp.makeConstraints { make in … }`                  | `v.jd.layout { … }`                                                      | 재호출 시 누적이 아니라 diff                                 |
| `make.top.equalToSuperview().offset(8)`                | `$0.top.equalToSuperview().offset(8)`                                    | 동형                                                         |
| `make.leading.trailing.equalToSuperview().inset(16)`   | `$0.leading.trailing.equalToSuperview().inset(16)`                       | 동형 (부호 반전 동일)                                        |
| `make.edges.equalToSuperview()`                        | `$0.edges.equalToSuperview()`                                            | 동형                                                         |
| `make.edges.equalToSuperview().inset(UIEdgeInsets(…))` | `$0.edges.equalToSuperview().inset(NSDirectionalEdgeInsets(…))`          | directional로 통일                                           |
| `make.width.equalTo(48)`                               | `$0.width.equal(48)`                                                     | `equalTo`→`equal` (상수)                                     |
| `make.size.equalTo(CGSize(width: 44, height: 44))`     | `$0.size.equal(CGSize(width: 44, height: 44))`                           |                                                              |
| `make.top.equalTo(other.snp.bottom).offset(8)`         | `$0.top.equal(to: other.jd.bottom, offset: 8)`                           | offset을 인자로도, 후위로도 허용                             |
| `make.height.equalTo(other).multipliedBy(0.5)`         | `$0.height.equal(to: other.jd.height).multiplier(0.5)`                   | 상대 앵커를 항상 명시 (SnapKit의 "같은 attribute 암시" 제거) |
| `make.top.equalTo(view.safeAreaLayoutGuide)`           | `$0.top.equalToSafeArea()` 또는 `$0.top.equal(to: view.jd.safeArea.top)` |                                                              |
| `make.leading.greaterThanOrEqualToSuperview()`         | `$0.leading.greaterThanOrEqualToSuperview()`                             | 동형                                                         |
| `.priority(.high)` / `.priority(750)`                  | `.priority(.defaultHigh)` / `.priority(750)`                             | UIKit 표준 명칭 사용                                         |
| `v.snp.updateConstraints { … }`                        | `v.jd.update { … }`                                                      | constant 외 변경은 assertion                                 |
| `v.snp.remakeConstraints { … }`                        | `v.jd.remake { … }`                                                      |                                                              |
| `make.left.equalTo(…)`                                 | 컴파일 에러                                                              | `leading`으로 강제 (§5.6)                                    |

### 5.6 비목표 (명시적 제외)

- **left/right 앵커**: 미제공. RTL을 깨는 유일한 합법 경로를 없앤다. 정말 필요한 절대 좌표(예: 서명 캔버스)는 DSL을 우회해 raw NSLayoutConstraint를 쓰면 된다 — DSL은 raw API와 공존한다.
- **플렉스/자체 레이아웃 엔진**: DEC-006 D4. 오토레이아웃 엔진 위의 표기법일 뿐이다. Yoga류 재작성 금지.
- **뷰 계층 조작**: `addSubview`를 DSL이 대신하지 않는다. 계층은 소유 코드의 책임.
- **KeyPath 애니메이션 DSL, 비율 그리드 등 확장 표면**: G0 스코프 외. 필요가 **측정**되면 별도 스펙으로.

---

## 6. 토큰 브리지 — 생성된 `JdToken`

토큰은 `tokens/*.json` → 코드 생성(별도 스펙 02-tokens)이며, iOS 산출물은 **JunDSCore의 Swift 상수 파일**이다(리소스 로딩 없음 — 컴파일 타임 안전 + 시작 비용 0). Core는 UIKit 금지(A2)이므로 **값은 Core, 변환은 각 계층**으로 나눈다.

**JunDSCore (생성 코드 — 수동 편집 금지 헤더 삽입):**

```swift
public struct JdColorValue: Hashable, Sendable {
    public let light: UInt32   // 0xRRGGBBAA
    public let dark: UInt32
}

public enum JdFontWeight: Sendable { case regular, medium, semibold, bold }
public enum JdTextRole: Sendable {  // Dynamic Type 기준 스타일에 대응하는 중립 enum
    case largeTitle, title, headline, body, callout, footnote, caption
}
public struct JdTextStyle: Sendable {
    public let size: CGFloat
    public let weight: JdFontWeight
    public let lineHeight: CGFloat
    public let role: JdTextRole      // 스케일링 기준 축
}

public enum JdToken {
    public enum color {
        public static let accent      = JdColorValue(light: 0x2F6F_EDFF, dark: 0x6C9E_FFFF)
        public static let bgSurface   = JdColorValue(light: 0xFFFF_FFFF, dark: 0x1C1C_1EFF)
        public static let fgPrimary   = JdColorValue(light: 0x1A1A_1AFF, dark: 0xF2F2_F2FF)
        // … 생성기가 tokens/color.json 전체를 방출
    }
    public enum space  { public static let xs: CGFloat = 4;  public static let sm: CGFloat = 8
                         public static let md: CGFloat = 16; public static let lg: CGFloat = 24 /* … */ }
    public enum radius { public static let sm: CGFloat = 6;  public static let md: CGFloat = 10 /* … */ }
    public enum typography {
        public static let body = JdTextStyle(size: 16, weight: .regular, lineHeight: 24, role: .body)
        // …
    }
}
```

**JunDSUIKit 브리지** — color는 **다이나믹 필수**(trait 클로저), 타이포는 UIFontMetrics:

```swift
public extension JdColorValue {
    var uiColor: UIColor {
        UIColor { trait in
            UIColor(jdPacked: trait.userInterfaceStyle == .dark ? dark : light)
        }
    }
}
public extension JdTextStyle {
    /// UIFontMetrics 스케일 적용 폰트. 사용처는 반드시
    /// adjustsFontForContentSizeCategory = true 를 함께 켠다 (린트 규칙화).
    var uiFont: UIFont {
        let base = UIFont.systemFont(ofSize: size, weight: weight.uiWeight)
        return UIFontMetrics(forTextStyle: role.uiTextStyle).scaledFont(for: base)
    }
}
```

**JunDSSwiftUI 브리지** — Color는 UIColor 경유로 다이나믹 유지, 폰트는 sizeCategory 반응 모디파이어:

```swift
public extension JdColorValue {
    var color: Color { Color(uiColor) }   // 다이나믹 유지 — Color(hex) 직접 생성 금지
}

/// Font.system(size:)는 Dynamic Type에 스케일되지 않는다.
/// 따라서 sizeCategory를 읽어 UIFontMetrics 결과를 매번 재생성하는 모디파이어를 정본으로 한다.
public extension View {
    func jdFont(_ style: JdTextStyle) -> some View { modifier(JdFontModifier(style: style)) }
}
struct JdFontModifier: ViewModifier {
    let style: JdTextStyle
    @Environment(\.sizeCategory) private var sizeCategory  // 변경 시 재평가 트리거
    func body(content: Content) -> some View { content.font(Font(style.uiFont)) }
}
```

정책 요약:

1. **색은 어느 계층에서도 정적 생성 금지.** `UIColor { trait in }` / `Color(uiColor:)` 경유만 허용 — 다크모드 전환이 재렌더 없이 반영된다.
2. **spacing/radius는 CGFloat 그대로.** 래퍼 타입 없음(레이아웃 DSL·SwiftUI padding에 마찰 없이 투입).
3. **타이포는 항상 role 동반.** 고정 pt 폰트를 만들 방법을 API에서 제거한다 — Dynamic Type이 기본값이 아니라 유일값. 예외(차트 눈금 등 스케일 부적합)는 `JdTextStyle.fixed(…)` 팩토리로만 열고 사용처를 grep 가능하게 한다.
4. 생성기는 웹 CSS 변수와 **동일한 토큰 이름**을 방출한다(`--jd-color-accent` ↔ `JdToken.color.accent`) — 크로스 플랫폼 문서·디자인 QA의 전제.

---

## 7. 접근성 규칙

### 7.1 VoiceOver 라벨 규약

| 규칙               | 내용                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 텍스트 있는 컨트롤 | 표시 텍스트가 자동으로 `accessibilityLabel`. 별도 지정 불필요                                                                                          |
| 아이콘 전용 컨트롤 | **초기화 인자에서 라벨 강제** — `JdIconButton(icon: .close, accessibilityLabel: "닫기", …)`. 라벨 없는 init을 제공하지 않아 컴파일 타임 강제           |
| 상태               | 문자열 조합 금지, traits로: 선택 `.selected`, 비활성 UIKit `isEnabled`/SwiftUI 자동. 커스텀 상태(예: 북마크됨)는 `accessibilityValue`                  |
| 복합 카드          | 카드 1개 = 요소 1개(`shouldGroupAccessibilityChildren` / `.accessibilityElement(children: .combine)`). 내부 액션은 `accessibilityCustomActions`로 노출 |
| 라이브 알림        | Toast/Notification/OfflineIndicator 계열은 `UIAccessibility.post(.announcement)` (웹 aria-live의 등가 — 00-inventory AnnouncerProvider 항목과 일치)    |
| 모달               | 시트/다이얼로그는 시스템 프레젠테이션을 쓰므로 포커스 격리가 공짜. 커스텀 오버레이(Tour, Spotlight)만 `accessibilityViewIsModal = true` 수동 지정      |

### 7.2 Dynamic Type

- 모든 텍스트는 §6의 `uiFont`/`jdFont` 경유 — 정책상 예외를 API가 막는다.
- **고정 height 금지, minHeight만.** JdButton 스펙의 height는 `heightAnchor >= spec.height`(UIKit) / `frame(minHeight:)`(SwiftUI)로 해석한다. XXXL에서 컨트롤이 자란다.
- accessibility 카테고리(AX1~AX5)에서 수평 배치가 깨지는 복합 컴포넌트(MetricCard, StatsGrid 등)는 세로 폴백 배치를 컴포넌트 내부에서 제공한다 — 소비자 책임으로 떠넘기지 않는다.
- 테스트 게이트: 대표 컴포넌트 스냅샷을 `.large`(기본)와 `.accessibilityExtraExtraExtraLarge` 2종으로 찍는다(§8).

### 7.3 Reduce Motion

- 유일 진입점: Core의 `JdMotion`.

```swift
public enum JdMotion {
    /// 각 계층 브리지가 시스템 설정을 주입 (Core는 UIKit 미의존이므로 함수 포인터 주입)
    public static var isReduced: () -> Bool = { false }
    public static func duration(_ base: TimeInterval) -> TimeInterval { isReduced() ? 0 : base }
}
```

- 규칙: Reduce Motion 시 이동·스케일·스프링 → **크로스페이드 또는 즉시 전환**. Confetti·Marquee·Typewriter·AnimatedCounter류는 정지 최종 프레임 표시.
- SwiftUI는 `@Environment(\.accessibilityReduceMotion)`을 각 컴포넌트에서 직접 읽고(§4.1 Toast 참조), UIKit은 `UIAccessibility.isReduceMotionEnabled`를 `JdMotion.isReduced`에 부트스트랩 시 연결한다.

---

## 8. 테스트 전략

### 8.1 계층별

| 계층         | 방식                                                                                                                                   | 실행 환경                             |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| JunDSCore    | XCTest 순수 단위 — 상태머신에 가상 스케줄러 주입 (ToastCenter: show→promote→auto dismiss→pending 승격 시나리오)                        | macOS 호스트 `swift test` (빠른 루프) |
| JunDSUIKit   | 레이아웃 assert + DSL 자체 테스트 + 스냅샷                                                                                             | 시뮬레이터 `xcodebuild test`          |
| JunDSSwiftUI | 호스팅(UIHostingController) 후 레이아웃/스냅샷. ViewInspector류 서드파티 금지 — 로직은 어차피 Core에 있으므로 뷰 내부 검사 수요가 작다 | 시뮬레이터                            |

### 8.2 레이아웃 assert

DSL이 diff 저장소(§5.4)를 가지므로 **활성 제약을 키로 조회하는 전용 어서션**을 제공한다:

```swift
// JunDSUIKitTests/Support/XCTAssertJd.swift
func XCTAssertJdConstraint(_ view: UIView,
                           _ attribute: NSLayoutConstraint.Attribute,
                           constant: CGFloat,
                           file: StaticString = #filePath, line: UInt = #line) {
    guard let c = JdConstraintStore.of(view).installedConstraint(for: attribute) else {
        return XCTFail("\(attribute) 제약 없음", file: file, line: line)
    }
    XCTAssertEqual(c.constant, constant, accuracy: 0.5, file: file, line: line)
}

// 사용 — 프레임 검증과 병행
func test_button_layout() {
    let host = UIView(frame: CGRect(x: 0, y: 0, width: 320, height: 200))
    let button = JdButtonView(title: "확인")
    host.addSubview(button)
    button.jd.layout { $0.leading.trailing.equalToSuperview().inset(16); $0.top.equalToSuperview() }
    host.layoutIfNeeded()
    XCTAssertEqual(button.frame.width, 288)
    XCTAssertJdConstraint(button, .leading, constant: 16)
}
```

DSL 자체의 회귀 스위트(G1 필수): diff 재호출 시 제약 수 불변 / update의 constant 갱신이 동일 객체 유지 / remake 후 이전 제약 비활성 / superview 부재 precondition / inset 부호 / identifier 형식.

### 8.3 스냅샷 — 결정: 자체 최소 유틸 **도입**

판단: 서드파티(swift-snapshot-testing) 금지 조건에서, 320개 컴포넌트의 시각 회귀를 사람 눈으로만 지키는 것은 불가능하다. 픽셀 비교의 취약성(GPU/OS 렌더 편차)은 **CI 시뮬레이터 1기종·1 OS 버전 고정 + 허용 오차**로 통제 가능하므로 도입한다. 단 **G1(파운데이션)에서는 레이아웃 assert만 게이트**로 삼고, 스냅샷은 M2(컴포넌트 양산 시작)부터 게이트에 편입한다 — 초기 디자인 유동기에 스냅샷 갱신 소음을 피하기 위함.

```swift
// JunDSUIKitTests/Support/JdSnapshot.swift  (~60줄 전체 설계)
enum JdSnapshot {
    /// JD_SNAPSHOT_RECORD=1 이면 기준 이미지를 기록하고 실패 처리(기록 커밋 유도).
    static func assert(_ view: UIView, named name: String,
                       size: CGSize? = nil,
                       perPixelTolerance: CGFloat = 0.02,   // 채널당 2% — 서브픽셀 AA 편차 흡수
                       maxDifferingRatio: CGFloat = 0.001,  // 전체 픽셀의 0.1%까지 허용
                       file: StaticString = #filePath, line: UInt = #line) {
        let target = size ?? view.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize)
        view.frame = CGRect(origin: .zero, size: target)
        view.layoutIfNeeded()
        let format = UIGraphicsImageRendererFormat()
        format.scale = 2  // 기기 무관 고정 스케일 — 기준 이미지 이식성
        let image = UIGraphicsImageRenderer(size: target, format: format)
            .image { view.layer.render(in: $0.cgContext) }
        // __Snapshots__/<테스트파일명>/<name>.png 와 RGBA 바이트 비교:
        //  1. 크기 다르면 즉시 실패
        //  2. 픽셀별 채널 차 > perPixelTolerance*255 인 픽셀을 집계
        //  3. 집계/전체 > maxDifferingRatio 면 실패 — 실패 시 actual/diff PNG를 attachment로 첨부
    }
}
```

운영 규칙: 기준 이미지는 저장소 커밋(`packages/ios/Tests/**/__Snapshots__/`), CI는 시뮬레이터 기종·OS를 워크플로에 상수로 박고 로컬 기록도 같은 조합에서만 수행한다. 조합 변경은 기준 전체 재기록 커밋과 함께만 허용.

---

## 9. 규범 예시 — JdButton 3계층 전체 스케치

새 컴포넌트는 이 파일 3개 구조를 복제한다. **스타일 해석은 Core의 순수 함수 1곳**, 프레임워크 계층은 그 스펙을 그리기만 한다.

**JunDSCore/Specs/JdButtonSpec.swift**

```swift
public enum JdButtonVariant: String, CaseIterable, Sendable {
    case primary, secondary, ghost, danger   // 웹 variant 문자열과 rawValue 일치
}

public struct JdButtonSpec: Sendable {
    public var minHeight: CGFloat
    public var hPadding: CGFloat
    public var radius: CGFloat
    public var textStyle: JdTextStyle
    public var background: JdColorValue
    public var foreground: JdColorValue
    public var pressedBackground: JdColorValue
    public var disabledOpacity: CGFloat

    /// 토큰만 읽는 순수 함수 — 단위 테스트로 variant×size 전 조합 검증
    public static func resolve(variant: JdButtonVariant, size: JdControlSize) -> JdButtonSpec {
        let metrics: (h: CGFloat, pad: CGFloat, text: JdTextStyle) = switch size {
        case .sm: (36, JdToken.space.sm, JdToken.typography.footnote)
        case .md: (48, JdToken.space.md, JdToken.typography.body)
        case .lg: (56, JdToken.space.lg, JdToken.typography.headline)
        }
        // variant → 색 토큰 매핑 … (primary=accent, danger=tone.danger, ghost=clear …)
        return JdButtonSpec(minHeight: metrics.h, hPadding: metrics.pad,
                            radius: JdToken.radius.md, textStyle: metrics.text,
                            background: /*…*/, foreground: /*…*/,
                            pressedBackground: /*…*/, disabledOpacity: 0.4)
    }
}
```

**JunDSSwiftUI/Components/Button/JdButton.swift**

```swift
import SwiftUI
import JunDSCore

public struct JdButton: View {
    private let title: String
    private let spec: JdButtonSpec
    private let action: () -> Void

    public init(_ title: String,
                variant: JdButtonVariant = .primary,
                size: JdControlSize = .md,
                action: @escaping () -> Void) {
        self.title = title
        self.spec = .resolve(variant: variant, size: size)
        self.action = action
    }

    public var body: some View {
        Button(action: action) {
            Text(title).jdFont(spec.textStyle)
        }
        .buttonStyle(JdButtonPressStyle(spec: spec))
    }
}

struct JdButtonPressStyle: ButtonStyle {
    let spec: JdButtonSpec
    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(.horizontal, spec.hPadding)
            .frame(minHeight: spec.minHeight)          // §7.2 — 고정 height 금지
            .foregroundStyle(spec.foreground.color)
            .background(configuration.isPressed
                        ? spec.pressedBackground.color : spec.background.color)
            .clipShape(RoundedRectangle(cornerRadius: spec.radius, style: .continuous))
            .opacity(isEnabled ? 1 : spec.disabledOpacity)
            .animation(reduceMotion ? nil : .easeOut(duration: 0.12),
                       value: configuration.isPressed)
    }
}
```

**JunDSUIKit/Components/Button/JdButtonView.swift**

```swift
import UIKit
import JunDSCore

public final class JdButtonView: UIControl {

    public var title: String { didSet { titleLabel.text = title; accessibilityLabel = title } }
    public var variant: JdButtonVariant { didSet { resolveAndApply() } }
    public var size: JdControlSize { didSet { resolveAndApply() } }
    public var onTap: (() -> Void)?

    private let titleLabel = UILabel()
    private var spec: JdButtonSpec

    public init(title: String,
                variant: JdButtonVariant = .primary,
                size: JdControlSize = .md) {
        self.title = title; self.variant = variant; self.size = size
        self.spec = .resolve(variant: variant, size: size)
        super.init(frame: .zero)

        titleLabel.text = title
        titleLabel.adjustsFontForContentSizeCategory = true   // §6 정책
        titleLabel.textAlignment = .center
        addSubview(titleLabel)
        titleLabel.jd.layout {                                // §5 DSL이 곧 내부 표준
            $0.center.equalToSuperview()
            $0.top.leading.greaterThanOrEqualToSuperview().inset(JdToken.space.xs)
        }
        jd.layout { $0.height.greaterThanOrEqual(spec.minHeight) }

        isAccessibilityElement = true
        accessibilityTraits = .button
        accessibilityLabel = title

        addTarget(self, action: #selector(didTap), for: .touchUpInside)
        applyColors()
    }

    required init?(coder: NSCoder) { fatalError("코드 생성 전용") }

    public override var intrinsicContentSize: CGSize {
        let label = titleLabel.intrinsicContentSize
        return CGSize(width: label.width + spec.hPadding * 2,
                      height: max(spec.minHeight, label.height + JdToken.space.xs * 2))
    }

    public override var isHighlighted: Bool { didSet { applyColors() } }
    public override var isEnabled: Bool { didSet { applyColors() } }

    private func resolveAndApply() {
        spec = .resolve(variant: variant, size: size)
        jd.update { $0.height.greaterThanOrEqual(spec.minHeight) }
        applyColors(); invalidateIntrinsicContentSize()
    }

    private func applyColors() {
        titleLabel.font = spec.textStyle.uiFont
        titleLabel.textColor = spec.foreground.uiColor
        backgroundColor = (isHighlighted ? spec.pressedBackground : spec.background).uiColor
        layer.cornerRadius = spec.radius
        layer.cornerCurve = .continuous
        alpha = isEnabled ? 1 : spec.disabledOpacity
    }

    @objc private func didTap() { onTap?() }
}
```

결정: UIKit 쪽은 `UIButton(configuration:)`이 아니라 **UIControl 서브클래스**다. Configuration API는 자체 스타일 시스템과 상태 갱신 타이밍이 충돌하고(백그라운드/폰트를 두 시스템이 소유), 토큰 충실도를 위해 소유권을 우리가 전부 가진다. `intrinsicContentSize` + minHeight 제약으로 스택/DSL 양쪽 배치에 자연스럽게 들어간다.

**소비자 사용 예시**

```swift
// SwiftUI
JdButton("저장", variant: .primary) { save() }
JdButton("삭제", variant: .danger, size: .sm) { remove() }

// UIKit
let button = JdButtonView(title: "저장")
button.onTap = { save() }
view.addSubview(button)
button.jd.layout {
    $0.leading.trailing.equalToSuperview().inset(JdToken.space.md)
    $0.bottom.equalToSafeArea().inset(JdToken.space.md)
}

// 공통 — 토스트 (§4)
JdToastCenter.shared.show("저장되었습니다", variant: .success)
```

---

## 10. 웹 320개 컴포넌트의 iOS 표현 전략

원칙: **웹 DOM을 모사하지 않는다. 컴포넌트의 "의도"를 iOS 관용구로 번역한다.** JunDS iOS의 가치는 토큰·스펙·상태머신의 일관성이지 픽셀 동형이 아니다. 난이도 분포(iOS S 90 · M 187 · L 24 · N/a 3)가 웹보다 L이 적은 이유 자체가 이 번역 원칙이다 — 차트·가상스크롤·미디어가 네이티브로 강등된다.

### 10.1 카테고리별 번역 원칙

| 카테고리 (개수)                                                                            | 전략                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| core + layout (25)                                                                         | SwiftUI: 신규 컴포넌트를 만들지 않는다 — VStack/HStack/Grid/Spacer가 이미 관용구이므로 **토큰 스페이싱 확장만** 제공(`VStack(spacing: JdToken.space.md)` 패턴 문서화). UIKit: `JdStackView`(UIStackView + 토큰 스페이싱 프리셋) 1개로 Stack/HStack/VStack/Group을 흡수. 웹의 Divider 삼중복(00-inventory 횡단 리스크 2)은 iOS에서 `JdDivider` 하나로 선제 단일화 |
| primitives (51)                                                                            | 시스템 컨트롤 스킨 우선: Toggle/Switch→UISwitch·Toggle, Slider→UISlider, Checkbox/RadioGroup은 iOS 관용구가 없으므로 자체 드로잉(M). ScrollArea→UIScrollView 그 자체(별도 컴포넌트 없음, S로 강등된 이유)                                                                                                                                                        |
| composites — 오버레이 (Modal/Drawer/BottomSheet/ActionSheet/AlertDialog/Sheet)             | 전부 **시스템 프레젠테이션** 위임: UISheetPresentationController(detent)·`.sheet`·`.confirmationDialog`·UIAlertController. Jd 계층은 detent 프리셋+토큰 스킨만. focus trap/scroll lock/포털 등 웹의 M 비용이 통째로 소멸                                                                                                                                         |
| composites — 선택 (Select/Dropdown/Combobox/ContextMenu/Menubar/MultiSelect)               | **UIMenu/Menu/Picker로 번역** — 커스텀 드롭다운 패널을 그리지 않는다. MultiSelect·Combobox(검색형)만 시트 기반 자체 UI                                                                                                                                                                                                                                           |
| composites — 차트 (Line/Bar/Pie/Area/Radar/Scatter/Funnel/Gauge/Heatmap/MiniChart…)        | **Swift Charts**(iOS 16 가용 — DEC-004의 실질 근거 중 하나) 위에 토큰 테마 적용. Sankey/Treemap/캔들(finance)은 Swift Charts 표현력 밖 → Core 순수 지오메트리 계산 + 렌더는 UIKit=CALayer / SwiftUI=Canvas 각자(§4.2 분할표, L 유지)                                                                                                                             |
| composites — 리스트/스크롤 (VirtualScroll/InfiniteList/PullToRefresh/SwipeAction/DataGrid) | 컴포넌트가 아니라 **데이터소스 헬퍼**로 번역: UICollectionView diffable + 컴포지셔널 레이아웃 프리셋, `.refreshable`/UIRefreshControl, UISwipeActionsConfiguration. 가상화를 자작하지 않는다(웹 L → iOS M 강등의 본체)                                                                                                                                           |
| composites — 미디어 (AudioPlayer/VideoPlayer/ImageLightbox/QRCode)                         | AVKit/AVFoundation 위임 + 토큰 스킨. QRCode는 CoreImage `CIQRCodeGenerator`(웹 L → iOS S)                                                                                                                                                                                                                                                                        |
| composites — 피드백 (Toast/Notification/Snackbar/Alert/Banner/Skeleton)                    | 시스템 부재 영역 — §4 ToastCenter 패턴으로 자체 구현. Skeleton은 Reduce Motion 시 셔머 정지(§7.3)                                                                                                                                                                                                                                                                |
| patterns (43)                                                                              | 페이지 템플릿(AuthLayout/SettingsLayout/PricingPage 등)은 **컴포넌트가 아니라 조립 레시피 문서**로 격하 — NavigationStack/Form 관용구 예제 코드 제공. 상태형 패턴(FormWizard/Tour/CommandPalette/Kanban)만 Core 상태머신 + 양 프레임워크가 각자 뷰로 정식 구현(§4.2)                                                                                             |
| finance (86)                                                                               | `JdTickStore`(Core, §4 패턴) 분리 선행 → Live\* 계열은 스토어 구독 뷰로. 데이터 연동은 @junds/finance-data 대응 Swift 패키지 스코프 밖(DEC-003)                                                                                                                                                                                                                  |

주 (DEC-010): 위 전략 전반에서 두 계층은 서로를 참조하지 않는다 — L급의 "UIKit 1회 구현 후 SwiftUI가 Representable로 랩" 경로는 폐기됐고, 각 계층이 §4.2 분할표의 Core 타입 위에 자기 관용구로 렌더를 각자 구현한다. 소비자 앱이 스스로 UIViewRepresentable로 감싸는 것은 무관하다.

### 10.2 N/a 3개와 개념 대체

| 웹            | iOS 판정 | 대체                                                             |
| ------------- | -------- | ---------------------------------------------------------------- |
| Portal        | N/a      | 개념 불요 — 프레젠테이션/오버레이가 시스템 소관                  |
| ErrorBoundary | N/a      | React 렌더 모델 전용. 오류 UI는 `JdResult`/`JdEmptyState`로 표현 |
| FocusGuard    | N/a      | `accessibilityViewIsModal` + 시스템 프레젠테이션이 처리          |

추가 개념 번역: VisuallyHidden→`accessibilityLabel`(뷰 없음), AnnouncerProvider→`UIAccessibility.post(.announcement)`(§7.1), hover 계열(HoverCard/Tooltip)→iPad 포인터·롱프레스 폴백으로 번역하되 정보 은닉 금지(터치에서 접근 불가한 정보를 hover에만 두지 않는다), focus ring→개념 없음(키보드 포커스는 시스템 처리).

### 10.3 구현 순서 원칙 (상세 로드맵은 G1 계획 문서로)

1. 파운데이션: 토큰 생성 → 레이아웃 DSL → JdMotion/접근성 유틸 → 테스트 유틸
2. §4/§9 패턴 검증: JdButton + JdToast를 3계층 관통으로 완성 (이 문서의 정본 2종)
3. S 90종(스킨 위주) → M 187종(상태머신 위주) → L 24종(§4.2 분할표 순 — Core 타입 완성 후 양 계층 렌더 병행)
4. 각 단계에서 웹 rawValue·토큰 이름 정합을 스냅샷 픽스처로 교차 검증

---

## 11. 열린 쟁점 (사람 확인 필요)

1. **A7 — 스냅샷 자체 유틸**: 서드파티 0 준수 하의 픽셀 비교는 시뮬레이터 조합 고정이라는 운영 규율을 요구한다. 이 규율(CI 기종/OS 상수화, 조합 변경 시 전체 재기록)을 팀 정책으로 승인할지, 아니면 스냅샷 자체를 포기하고 레이아웃 assert만으로 갈지.

**해소된 쟁점**: (구)1번 "JunDSSwiftUI의 JunDSUIKit 의존" — G0 게이트에서 사람이 **기각**하고 완전 독립 2계통을 선택함으로써 해소(DEC-010, 2026-07-23). 본 문서 A3·§2.2·§4.2·§10에 반영 완료.
