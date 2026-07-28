# JunDS iOS — 오버레이 · 피드백 (USAGE 05)

화면 위에 얹히는 **오버레이 5종**과 상태를 알리는 **피드백 8종**의 SwiftUI · UIKit 사용법.
각 컴포넌트의 예제·파라미터 표는 실제 소스의 public init 시그니처와 1:1 대응한다(추측 없음).

```swift
import JunDS   // 이 한 줄로 Core·UIKit·SwiftUI 전부
```

| 그룹                                   | 컴포넌트                                                                                       |
| -------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **오버레이**(시스템 프레젠테이션 위임) | JdModal · JdDrawer · JdBottomSheet · JdActionSheet · JdAlertDialog                             |
| **피드백**(자체 구현)                  | JdAlert · JdBanner · JdCallout · JdNotification · JdEmptyState · JdResult · Toast · JdSnackbar |

## 공통 규약

### 오버레이 — 전부 시스템 위임 (04 §10.1)

- 모달/시트/액션시트/얼럿은 SwiftUI `sheet`/`confirmationDialog`/`alert`, UIKit `UISheetPresentationController`/
  `UIAlertController`에 위임한다. → **포커스 격리·스크롤 락·배경 딤·VoiceOver 격벽이 공짜**다.
  (예외: JdDrawer의 `left`/`right`는 iOS 관용이 없어 딤 + 가장자리 슬라이드를 자체 소유한다.)
- **cancelable 닫기 veto**: 시스템이 닫으려 할 때(스와이프·백드롭) 클로저가 `false`를 반환하면 닫힘을 취소한다.
  - SwiftUI Drawer/BottomSheet = `onDismissAttempt: ((JdDismissReason) -> Bool)?`
  - UIKit Drawer/BottomSheet = `onDismissAttempt`, UIKit Modal = `onRequestClose: ((JdModalCloseReason) -> Bool)?`
  - ⚠️ **SwiftUI Modal(`jdModal`)엔 veto 축이 없다** — `persistent`(=전면 차단)와 `onClose`(사후 통지)만 있다.
- **닫기 사유 열거형**: Modal은 `JdModalCloseReason`(`escape`·`backdrop`·`close`), Drawer/BottomSheet는
  `JdDismissReason`(+ `action`)을 쓴다. rawValue는 웹 `jd-request-close` detail 문자열과 일치(DEC-012).
- **size 축**: Modal = `JdModalSize`(`sm`·`md`·`lg`). Drawer/BottomSheet = `JdOverlaySize`(`sm`·`md`·`lg`·`xl`·`full`).
  px 값은 iOS에서 detent로 번역되므로 iPad·레이아웃 참고치다.
- **UIKit 프레젠테이션**: Controller/Coordinator는 `present(from: UIViewController)`로 띄우고, `contentView`(있는 경우)에
  자식 뷰를 얹는다. `requestClose(_:)`가 명시적 닫기 경로다.
- **별칭**: 웹 `Sheet` = `JdBottomSheet(draggable: true)`, 웹 `ConfirmDialog` = `JdAlertDialog`. 신규 타입 없이
  각 실타입의 파라미터로 표현하므로 이 문서는 실타입만 다룬다.

### 피드백 — 시스템 대응이 없어 자체 구현 (DESIGN-4 §B·§C)

- **색의 단일 소스**: `JdFeedbackVariant.color`(info/success/warning/danger), `JdCalloutVariant.color`(note/tip/info/
  warning/danger), `JdResultStatus.color`. 렌더는 이 토큰만 읽으므로 소비자가 색을 넘길 일은 없다.
- **라이브 리전 낭독**: 화면 변화 없이 뜨는 알림은 AT에 닿지 않으므로 `JdAnnouncer`로 낭독한다.
  `danger`는 **assertive**, 나머지는 polite(`JdFeedbackVariant.announcePriority`가 단일 소스).
  낭독하는 컴포넌트는 **Toast · Snackbar**, 그리고 **JdAlert**(단 Alert만 `danger`+`warning` 둘 다 낭독).
  Banner/Callout/Notification/EmptyState/Result는 인라인 콘텐츠라 낭독하지 않는다.
- **본문 슬롯의 계층차**: SwiftUI는 본문·액션을 `@ViewBuilder`(자유 뷰)로 받고, UIKit은 `message`/`description`
  문자열 + `actionLabel`로 받는다. 컴포넌트별 표에 정확히 표기한다.
- **자동 닫힘 정지**: 타이머형(Toast/Snackbar)은 hover·드래그 중 자동 닫힘을 멈춘다(WCAG 2.2.1) — `setPaused` 내장.

---

## 오버레이

### JdModal

시스템 시트(pageSheet)에 위임하는 중앙 모달. 콘텐츠를 담는 범용 오버레이다. `persistent`면 인터랙티브
닫기를 전면 차단(웹 백드롭 클릭 무시 등가).

```swift
// SwiftUI — jdModal은 View "모디파이어"다 (구조체가 아님)
struct ProfileScreen: View {
    @State private var isOpen = false
    var body: some View {
        Button("프로필 편집") { isOpen = true }
            .jdModal(isPresented: $isOpen, size: .md, persistent: false) {
                VStack(alignment: .leading, spacing: JdToken.Space.s4) {
                    Text("프로필 편집").jdFont(size: JdToken.FontSize.lg, weight: JdToken.FontWeight.semibold)
                    // …폼…
                }
            }
    }
}
```

```swift
// UIKit — JdModalViewController, present(from:)
let modal = JdModalViewController(size: .md, persistent: false)
modal.onRequestClose = { reason in     // false면 닫힘 취소 (reason: .escape/.backdrop/.close)
    reason != .backdrop                 // 예: 백드롭 스와이프만 막기
}
modal.onClose = { print("닫힘") }
let form = UILabel()                    // 임의 자식
modal.contentView.addSubview(form)      // 콘텐츠는 contentView에 얹는다
modal.present(from: self)               // self = 현재 UIViewController
// 닫기: modal.requestClose(.close)
```

| 파라미터                            | 타입                              | 기본    | 의미                                           |
| ----------------------------------- | --------------------------------- | ------- | ---------------------------------------------- |
| `isPresented`(SwiftUI)              | `Binding<Bool>`                   | —       | 표시 상태 바인딩                               |
| `size`                              | `JdModalSize`                     | `.md`   | `sm`/`md`=medium+large detent, `lg`=large 고정 |
| `persistent`                        | `Bool`                            | `false` | 인터랙티브 닫기 차단 + 그래버 숨김             |
| `onClose`(SwiftUI)·`onClose`(UIKit) | `(() -> Void)?`                   | `nil`   | 닫힌 뒤 사후 통지                              |
| `onRequestClose`(UIKit만)           | `((JdModalCloseReason) -> Bool)?` | `nil`   | `false` 반환 시 닫힘 취소(veto)                |
| `content`(SwiftUI)                  | `@ViewBuilder`                    | —       | 모달 본문                                      |

특이사항

- SwiftUI엔 per-dismiss veto가 없다(위 공통 규약 참조). 취소가 필요하면 UIKit `onRequestClose`를 쓰거나
  `persistent`로 전면 차단한다.
- UIKit `persistent`는 `didSet`이라 대입 즉시 그래버 가시성·`isModalInPresentation`이 갱신된다.
- `viewDidAppear`에서 VoiceOver 포커스를 `contentView`로 옮긴다(웹 focus trap의 initialFocus 등가).

### JdDrawer

가장자리에서 밀려나오는 서랍. `side`가 `left`/`right`면 커스텀 슬라이드+딤, `bottom`이면 시트 detent로 번역된다.
`title`을 주면 헤더 행(제목 + 닫기 버튼)이 붙는다.

```swift
// SwiftUI — 커스텀 슬라이드(left/right)는 화면 위에 그려지므로 .overlay로 얹는다
struct Catalog: View {
    @State private var isOpen = false
    var body: some View {
        Button("필터") { isOpen = true }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .overlay {
                JdDrawer(isPresented: $isOpen, side: .right, size: .md, title: "필터",
                         persistent: false,
                         onDismissAttempt: { _ in true }) {   // false면 닫힘 취소
                    Text("필터 옵션…")
                }
            }
    }
}
// (side: .bottom은 시스템 시트라 .background로 얹어도 된다)
```

```swift
// UIKit — JdDrawerController
let drawer = JdDrawerController(side: .right, size: .md, title: "필터", persistent: false)
drawer.onDismissAttempt = { reason in reason != .backdrop }   // 백드롭 탭만 막기
drawer.onClose = { /* 상태 동기화 */ }
drawer.contentView.addSubview(filterList)
drawer.present(from: self)
```

| 파라미터               | 타입                           | 기본     | 의미                                             |
| ---------------------- | ------------------------------ | -------- | ------------------------------------------------ |
| `isPresented`(SwiftUI) | `Binding<Bool>`                | —        | 표시 상태                                        |
| `side`                 | `JdDrawerSide`                 | `.right` | `left`·`right`(커스텀 슬라이드) / `bottom`(시트) |
| `size`                 | `JdOverlaySize`                | `.md`    | side별 폭·높이 프리셋(px는 참고치)               |
| `title`                | `String?`                      | `nil`    | 있으면 헤더 행(제목 + 닫기 버튼)                 |
| `persistent`           | `Bool`                         | `false`  | 인터랙티브 닫기 차단                             |
| `onDismissAttempt`     | `((JdDismissReason) -> Bool)?` | `nil`    | `false` 반환 시 닫힘 취소(veto)                  |
| `content`(SwiftUI)     | `@ViewBuilder`                 | —        | 서랍 본문                                        |

특이사항

- 명시적 닫기(헤더 버튼·`requestClose(.close)`)는 `persistent`와 무관하게 게이트만 통과하면 닫힌다. 인터랙티브
  사유(`.backdrop`/`.escape`)는 `persistent`면 차단된다.
- `left`/`right`는 `modalPresentationStyle = .custom`으로 딤(black·30%)+슬라이드를 직접 소유한다.

### JdBottomSheet

아래에서 올라오는 시트. `draggable: true`(기본)가 곧 웹 `Sheet` 별칭의 실체 — 끌어 닫기를 허용한다.
`draggable: false` 또는 `persistent: true`면 인터랙티브 닫기를 차단한다.

```swift
// SwiftUI — 시트는 시스템 레이어에 뜨므로 앵커만 .background에 심는다
struct Player: View {
    @State private var isOpen = false
    var body: some View {
        Button("공유") { isOpen = true }
            .background {
                JdBottomSheet(isPresented: $isOpen, size: .md, draggable: true) {
                    ShareContent()
                }
            }
    }
}
```

```swift
// UIKit — JdBottomSheetController
let sheet = JdBottomSheetController(size: .lg, draggable: true, persistent: false)
sheet.onDismissAttempt = { _ in true }
sheet.onClose = { }
sheet.contentView.addSubview(shareView)
sheet.present(from: self)
```

| 파라미터               | 타입                           | 기본    | 의미                                            |
| ---------------------- | ------------------------------ | ------- | ----------------------------------------------- |
| `isPresented`(SwiftUI) | `Binding<Bool>`                | —       | 표시 상태                                       |
| `size`                 | `JdOverlaySize`                | `.md`   | detent 높이(`full`=large)                       |
| `draggable`            | `Bool`                         | `true`  | 그래버 표시 + 끌어 닫기 허용(웹 `Sheet`의 실체) |
| `persistent`           | `Bool`                         | `false` | 인터랙티브 닫기 차단                            |
| `onDismissAttempt`     | `((JdDismissReason) -> Bool)?` | `nil`   | `false` 반환 시 닫힘 취소(veto)                 |
| `content`(SwiftUI)     | `@ViewBuilder`                 | —       | 시트 본문                                       |

특이사항

- **웹 `Sheet` 별칭**: 별도 타입 없이 `JdBottomSheet(draggable: true)`가 그 자리다.
- `persistent || !draggable`이면 `isModalInPresentation`으로 스와이프 닫기를 막는다.

### JdActionSheet

선택지 목록을 띄우는 액션 시트. SwiftUI는 `confirmationDialog`, UIKit은 `UIAlertController(.actionSheet)`에
위임한다. 취소 버튼은 시스템이 자동 제공한다(SwiftUI) / `cancelLabel` 액션 1개(UIKit).

```swift
// SwiftUI — 앵커를 .background에 심고 isPresented로 연다
struct PostRow: View {
    @State private var isOpen = false
    private let actions = [
        JdActionItem(id: "edit", label: "편집"),
        JdActionItem(id: "delete", label: "삭제", isDestructive: true),
    ]
    var body: some View {
        Button("⋯") { isOpen = true }
            .background {
                JdActionSheet(isPresented: $isOpen, title: "게시물", message: "작업을 고르세요",
                              actions: actions) { item in
                    handle(item.id)     // 취소는 자동 — 여기로 오지 않는다
                }
            }
    }
}
```

```swift
// UIKit — JdActionSheetController, present(from:sourceView:)
let actions = [
    JdActionItem(id: "edit", label: "편집"),
    JdActionItem(id: "delete", label: "삭제", isDestructive: true),
]
let sheet = JdActionSheetController(title: "게시물", message: "작업을 고르세요",
                                    actions: actions, cancelLabel: "취소") { item in
    handle(item.id)
}
sheet.present(from: self, sourceView: moreButton)   // iPad popover 앵커(없으면 크래시)
```

| 파라미터               | 타입                     | 기본     | 의미                                 |
| ---------------------- | ------------------------ | -------- | ------------------------------------ |
| `isPresented`(SwiftUI) | `Binding<Bool>`          | —        | 표시 상태                            |
| `title`                | `String?`                | `nil`    | 시트 제목(nil이면 숨김)              |
| `message`              | `String?`                | `nil`    | 부제                                 |
| `actions`              | `[JdActionItem]`         | —        | 선택지(`id`·`label`·`isDestructive`) |
| `cancelLabel`(UIKit만) | `String`                 | `"취소"` | 취소 버튼 라벨                       |
| `onSelect`             | `(JdActionItem) -> Void` | —        | 항목 탭 콜백                         |

특이사항

- SwiftUI엔 `cancelLabel`이 없다 — `confirmationDialog`가 취소를 자동 제공하기 때문(웹 판정 승계).
- `JdActionItem(id:label:isDestructive:)` — `isDestructive: true`면 빨간(.destructive) 항목.
- UIKit `present(from:animated:sourceView:)`: iPad에서 액션시트는 popover라 `sourceView`가 없으면 `presenter.view`를
  앵커로 쓴다(앵커가 완전히 없으면 크래시).

### JdAlertDialog

확인/취소 2버튼 다이얼로그. 시스템 `alert`/`UIAlertController(.alert)`에 위임. 웹 `ConfirmDialog` 별칭의 실체다.
`cancelLabel: nil`이면 확인 단일 버튼.

```swift
// SwiftUI
struct DeleteButton: View {
    @State private var isOpen = false
    var body: some View {
        Button("삭제") { isOpen = true }
            .background {
                JdAlertDialog(isPresented: $isOpen,
                              title: "삭제할까요?", message: "되돌릴 수 없습니다.",
                              confirmLabel: "삭제", cancelLabel: "취소",
                              isDestructive: true,
                              onConfirm: { delete() },
                              onCancel: { })
            }
    }
}
```

```swift
// UIKit — JdAlertDialogController
let dialog = JdAlertDialogController(title: "삭제할까요?", message: "되돌릴 수 없습니다.",
                                     confirmLabel: "삭제", cancelLabel: "취소",
                                     isDestructive: true,
                                     onConfirm: { delete() },
                                     onCancel: { })
dialog.present(from: self)
```

| 파라미터               | 타입            | 기본     | 의미                             |
| ---------------------- | --------------- | -------- | -------------------------------- |
| `isPresented`(SwiftUI) | `Binding<Bool>` | —        | 표시 상태                        |
| `title`                | `String`        | —        | 제목(필수)                       |
| `message`              | `String?`       | `nil`    | 본문                             |
| `confirmLabel`         | `String`        | `"확인"` | 확인 버튼 라벨                   |
| `cancelLabel`          | `String?`       | `"취소"` | `nil`이면 확인 단일 버튼         |
| `isDestructive`        | `Bool`          | `false`  | 확인 버튼을 .destructive(빨강)로 |
| `onConfirm`            | `() -> Void`    | —        | 확인 콜백                        |
| `onCancel`             | `(() -> Void)?` | `nil`    | 취소 콜백                        |

특이사항

- **웹 `ConfirmDialog` 별칭**: 별도 타입 없이 이 표면(제목·본문·확인/취소·danger)으로 표현한다.
- UIKit은 `isDestructive`면 `preferredAction`을 취소 쪽에 두지 않고 비운다 — 파괴적 확인을 기본 강조하지 않는
  웹 danger 패턴을 따른다.

---

## 피드백

### JdAlert

좌측 3pt 강조선 + 5% 틴트의 **인라인** 피드백 블록(시스템 `.alert` 다이얼로그와 다르다).

```swift
// SwiftUI — 본문은 @ViewBuilder content
JdAlert("저장됨", variant: .success, isDismissible: true, onDismiss: { hide() }) {
    Text("변경 사항이 반영되었습니다.")
}
```

```swift
// UIKit — 본문은 message 문자열
let alert = JdAlertView("저장됨", message: "변경 사항이 반영되었습니다.",
                        variant: .success, isDismissible: true, onDismiss: { })
container.addSubview(alert)
```

| 파라미터                  | 타입                | 기본        | 의미                        |
| ------------------------- | ------------------- | ----------- | --------------------------- |
| `title`(1번째, 라벨 없음) | `String`            | —           | 제목                        |
| `content`(SwiftUI)        | `@ViewBuilder`      | `EmptyView` | 본문 뷰                     |
| `message`(UIKit)          | `String?`           | `nil`       | 본문 문자열                 |
| `variant`                 | `JdFeedbackVariant` | `.info`     | info/success/warning/danger |
| `isDismissible`           | `Bool`              | `false`     | 우측 닫기 버튼              |
| `onDismiss`               | `(() -> Void)?`     | `nil`       | 닫기 콜백                   |

특이사항

- ⚠️ **본문 표면이 계층별로 다르다**: SwiftUI = `content` ViewBuilder, UIKit = `message` String.
- 피드백 중 유일하게 **`danger`+`warning` 둘 다** 라이브 리전 낭독(onAppear/didMoveToWindow). 우선순위는
  `danger`=assertive, `warning`=polite.

### JdBanner

폭을 꽉 채우는 알림 바. 배경 = variant 색(대비 확보 위해 foreground 20% 혼합), 흰 글자. 액션·닫기 옵션.

```swift
// SwiftUI
JdBanner("새 버전이 있습니다", variant: .info,
         actionLabel: "업데이트", onAction: { update() },
         isDismissible: true, onDismiss: { })
```

```swift
// UIKit — 동일 시그니처
let banner = JdBannerView("새 버전이 있습니다", variant: .info,
                          actionLabel: "업데이트", onAction: { update() },
                          isDismissible: true, onDismiss: { })
container.addSubview(banner)
```

| 파라미터                    | 타입                | 기본    | 의미                                     |
| --------------------------- | ------------------- | ------- | ---------------------------------------- |
| `message`(1번째, 라벨 없음) | `String`            | —       | 메시지                                   |
| `variant`                   | `JdFeedbackVariant` | `.info` | 배경 색                                  |
| `actionLabel`               | `String?`           | `nil`   | 우측 액션 버튼 라벨                      |
| `onAction`                  | `(() -> Void)?`     | `nil`   | 액션 콜백(`actionLabel`과 함께여야 표시) |
| `isDismissible`             | `Bool`              | `false` | 닫기 버튼                                |
| `onDismiss`                 | `(() -> Void)?`     | `nil`   | 닫기 콜백                                |

특이사항

- SwiftUI·UIKit 시그니처가 동일하다.
- 흰 글자는 전용 온-액센트 토큰이 없어 시스템 상수(`Color.white`/`UIColor.white`)를 쓴다.

### JdCallout

문서 강조 블록. 이모지·색은 `JdCalloutVariant`가 단일 소스. `isCollapsible`이면 접힌다(SwiftUI는
`DisclosureGroup`, UIKit은 헤더 탭 토글).

```swift
// SwiftUI — 본문은 @ViewBuilder content
JdCallout("알아두기", variant: .tip, isCollapsible: true, initiallyExpanded: false) {
    Text("이 값은 캐시됩니다.")
}
```

```swift
// UIKit — 본문은 message 문자열
let callout = JdCalloutView("알아두기", message: "이 값은 캐시됩니다.",
                            variant: .tip, isCollapsible: true, initiallyExpanded: false)
container.addSubview(callout)
// callout.toggleExpansion()  // 프로그램 토글
```

| 파라미터                  | 타입               | 기본    | 의미                                             |
| ------------------------- | ------------------ | ------- | ------------------------------------------------ |
| `title`(1번째, 라벨 없음) | `String`           | —       | 제목                                             |
| `content`(SwiftUI)        | `@ViewBuilder`     | —       | 본문 뷰                                          |
| `message`(UIKit)          | `String?`          | `nil`   | 본문 문자열                                      |
| `variant`                 | `JdCalloutVariant` | `.note` | note(📝)/tip(💡)/info(ℹ️)/warning(⚠️)/danger(🚨) |
| `isCollapsible`           | `Bool`             | `false` | 접기 가능                                        |
| `initiallyExpanded`       | `Bool`             | `true`  | 초기 펼침 상태(`isCollapsible`일 때 의미)        |

특이사항

- ⚠️ **본문 표면이 계층별로 다르다**: SwiftUI = `content` ViewBuilder, UIKit = `message` String.
- 이모지는 장식이라 AT에서 숨긴다 — 제목이 유일한 표면이다.

### JdNotification

아이콘 + 제목 + 설명 + (액션) + 닫기의 인라인 카드. 30% 테두리 + 5% 틴트로 variant를 형태로도 구분한다.

```swift
// SwiftUI — 추가 콘텐츠는 @ViewBuilder extra 슬롯(액션 파라미터 없음)
JdNotification(title: "결제 완료", description: "영수증을 메일로 보냈습니다.",
               variant: .success, systemImage: "checkmark.seal", isDismissible: true,
               onDismiss: { }) {
    Button("영수증 보기") { openReceipt() }   // extra 슬롯
}
```

```swift
// UIKit — actionLabel/onAction 파라미터(extra 슬롯 없음)
let note = JdNotificationView(title: "결제 완료", description: "영수증을 메일로 보냈습니다.",
                              variant: .success, systemImage: "checkmark.seal",
                              actionLabel: "영수증 보기", onAction: { openReceipt() },
                              isDismissible: true, onDismiss: { })
container.addSubview(note)
```

| 파라미터             | 타입                | 기본        | 의미                  |
| -------------------- | ------------------- | ----------- | --------------------- |
| `title`              | `String?`           | `nil`       | 제목                  |
| `description`        | `String?`           | `nil`       | 설명                  |
| `variant`            | `JdFeedbackVariant` | `.info`     | 아이콘·테두리·틴트 색 |
| `systemImage`        | `String?`           | `nil`       | SF Symbol 이름(장식)  |
| `extra`(SwiftUI)     | `@ViewBuilder`      | `EmptyView` | 하단 추가 콘텐츠 슬롯 |
| `actionLabel`(UIKit) | `String?`           | `nil`       | 액션 버튼 라벨        |
| `onAction`(UIKit)    | `(() -> Void)?`     | `nil`       | 액션 콜백             |
| `isDismissible`      | `Bool`              | `false`     | 닫기 버튼             |
| `onDismiss`          | `(() -> Void)?`     | `nil`       | 닫기 콜백             |

특이사항

- ⚠️ **액션 표면이 계층별로 다르다**: SwiftUI = 자유 `extra` ViewBuilder, UIKit = `actionLabel`+`onAction`.
- 아이콘은 장식이라 AT에서 숨긴다 — 제목/설명이 표면이다.

### JdEmptyState

중앙 배치 빈 상태(아이콘 칩 + 제목 + 설명 + 액션). `ContentUnavailableView`(iOS17+) 대신 iOS16 하한 자체 구현.

```swift
// SwiftUI — 액션은 @ViewBuilder action 슬롯
JdEmptyState(title: "메시지가 없습니다", description: "새 대화를 시작해 보세요.",
             systemImage: "tray") {
    Button("새 대화") { startChat() }
}
```

```swift
// UIKit — actionLabel/onAction 파라미터
let empty = JdEmptyStateView(title: "메시지가 없습니다", description: "새 대화를 시작해 보세요.",
                             systemImage: "tray",
                             actionLabel: "새 대화", onAction: { startChat() })
container.addSubview(empty)
```

| 파라미터             | 타입            | 기본        | 의미                |
| -------------------- | --------------- | ----------- | ------------------- |
| `title`              | `String`        | —           | 제목(필수)          |
| `description`        | `String?`       | `nil`       | 설명                |
| `systemImage`        | `String`        | `"tray"`    | 아이콘 칩 SF Symbol |
| `action`(SwiftUI)    | `@ViewBuilder`  | `EmptyView` | 액션 뷰 슬롯        |
| `actionLabel`(UIKit) | `String?`       | `nil`       | 액션 버튼 라벨      |
| `onAction`(UIKit)    | `(() -> Void)?` | `nil`       | 액션 콜백           |

특이사항

- ⚠️ **액션 표면이 계층별로 다르다**: SwiftUI = `action` ViewBuilder, UIKit = `actionLabel`+`onAction`.
- 제목·설명은 하나의 접근성 요소로 합쳐지고, 액션 버튼만 독립 포커스를 갖는다.

### JdResult

`JdEmptyState` 파생 결과 화면. `status`별 64pt 시맨틱 심볼(정보 없는 일러스트 대체). 심볼·색은
`JdResultStatus`가 단일 소스.

```swift
// SwiftUI
JdResult(status: .success, title: "주문 완료", description: "곧 배송을 시작합니다.") {
    Button("주문 내역") { openOrders() }
}
```

```swift
// UIKit
let result = JdResultView(status: .notFound, title: "페이지를 찾을 수 없어요",
                          description: "주소를 다시 확인해 주세요.",
                          actionLabel: "홈으로", onAction: { goHome() })
container.addSubview(result)
```

| 파라미터             | 타입             | 기본        | 의미           |
| -------------------- | ---------------- | ----------- | -------------- |
| `status`             | `JdResultStatus` | —           | 심볼·색 결정   |
| `title`              | `String`         | —           | 제목(필수)     |
| `description`        | `String?`        | `nil`       | 설명           |
| `action`(SwiftUI)    | `@ViewBuilder`   | `EmptyView` | 액션 뷰 슬롯   |
| `actionLabel`(UIKit) | `String?`        | `nil`       | 액션 버튼 라벨 |
| `onAction`(UIKit)    | `(() -> Void)?`  | `nil`       | 액션 콜백      |

`JdResultStatus` 6종(심볼): `success`(checkmark.circle.fill) · `error`(xmark.circle.fill) ·
`warning`(exclamationmark.triangle.fill) · `info`(info.circle.fill) · `notFound`(rawValue `"404"`, questionmark.circle) ·
`forbidden`(rawValue `"403"`, lock.circle).

특이사항

- ⚠️ **액션 표면이 계층별로 다르다**: SwiftUI = `action` ViewBuilder, UIKit = `actionLabel`+`onAction`.
- 심볼은 장식이라 AT에서 숨긴다 — 상태는 제목/설명이 말한다.

### Toast

전역 큐 기반의 임시 알림 스택. **싱글턴 센터에 `show` 호출**하고, **앱 루트에 호스트를 1회 부착**한다.
Core `JdToastQueue`가 큐 상태머신(`maxVisible` 초과 시 가장 오래된 것 축출), 렌더 계층이 자동 닫힘 타이머를 얹는다.

```swift
// SwiftUI — ① 앱 루트에 호스트 1회 부착
struct RootView: View {
    var body: some View {
        ContentView()
            .jdToastHost(.shared, position: .topRight)   // 큐를 position별로 오버레이
    }
}
// ② 어디서든 센터에 show
JdToastCenter.shared.show(
    JdToast(title: "업로드 완료", message: "3개 파일", variant: .success, duration: 4)
)
// 수동 닫기: let id = center.show(...); center.dismiss(id) / center.clear()
```

```swift
// UIKit — ① 윈도우/루트에 호스트 뷰 1회 부착
let host = JdToastHostView(position: .topRight, maxVisible: 4)
window.addSubview(host)
host.jd.layout { $0.edges.equalToSuperview() }   // 빈 공간은 터치 통과(카드만 상호작용)
// ② show
host.show(JdToast(title: "업로드 완료", message: "3개 파일", variant: .success))
// host.dismiss(id) / host.clear()
```

`JdToast` 값 타입: `JdToast(id: UUID = UUID(), title: String? = nil, message: String? = nil, variant: JdFeedbackVariant = .info, duration: TimeInterval = 4)`. **`duration: 0` = 수동 닫기 전용**(웹 duration 0 동형).

| API     | SwiftUI                                                    | UIKit                                                     |
| ------- | ---------------------------------------------------------- | --------------------------------------------------------- |
| 표시    | `JdToastCenter.shared.show(JdToast) -> JdToast.ID`         | `JdToastHostView.show(JdToast) -> JdToast.ID`             |
| 닫기    | `center.dismiss(id)` / `center.clear()`                    | `host.dismiss(id)` / `host.clear()`                       |
| 정지    | `center.setPaused(Bool)`                                   | `host.setPaused(Bool)`                                    |
| 호스트  | `.jdToastHost(_ center: = .shared, position: = .topRight)` | `JdToastHostView(position: = .topRight, maxVisible: = 4)` |
| 큐 상한 | `JdToastCenter(maxVisible: = 4)`                           | `init`의 `maxVisible`                                     |

`JdToastPosition` 6종: `topRight`·`topLeft`·`bottomRight`·`bottomLeft`·`top`·`bottom`(rawValue는 `"top-right"` 등).

특이사항

- SwiftUI `JdToastCenter`와 UIKit `JdToastHostView`는 **서로 참조하지 않는다**(DEC-010 — 계층 상호 import 금지).
  각자 Core `JdToastQueue`를 소유한다. 한 앱에서 한 계층만 고르면 된다.
- hover·드래그 중 자동 닫힘이 정지된다(WCAG 2.2.1). 정지 해제 시 남은 토스트의 타이머를 처음부터 다시 건다.
- `danger`는 assertive, 나머지는 polite로 낭독한다(제목+메시지 결합).

### JdSnackbar

스택이 아닌 **단일** 하단 바(위치 4모서리+상/하 중앙). variant `.info`는 중립 바(surfaceOverlay), 시맨틱
variant만 색을 입힌다. 자동 닫힘 + hover/드래그 정지.

```swift
// SwiftUI — isPresented 바인딩으로 제어, 트리에 얹는다(오버레이)
struct Editor: View {
    @State private var show = false
    var body: some View {
        Button("실행 취소 표시") { show = true }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .overlay {
                JdSnackbar(isPresented: $show, message: "메시지를 보관함으로 옮겼습니다",
                           variant: .info, position: .bottom, duration: 4,
                           actionLabel: "실행 취소", onAction: { undo() })
            }
    }
}
```

```swift
// UIKit — present(in:)으로 컨테이너에 얹는다
let snack = JdSnackbarView(message: "메시지를 보관함으로 옮겼습니다",
                           variant: .info, position: .bottom, duration: 4,
                           actionLabel: "실행 취소", onAction: { undo() })
snack.onDismiss = { /* 상태 동기화 */ }
snack.present(in: view)      // view.safeArea 기준 위치별 정렬
// 수동 닫기: snack.dismiss()
```

| 파라미터                 | 타입                | 기본      | 의미                                   |
| ------------------------ | ------------------- | --------- | -------------------------------------- |
| `isPresented`(SwiftUI만) | `Binding<Bool>`     | —         | 표시 상태                              |
| `message`                | `String`            | —         | 메시지(필수)                           |
| `variant`                | `JdFeedbackVariant` | `.info`   | `.info`=중립(surfaceOverlay), 그 외=색 |
| `position`               | `JdToastPosition`   | `.bottom` | 정렬 위치                              |
| `duration`               | `TimeInterval`      | `4`       | 자동 닫힘 초(0이면 자동 닫힘 없음)     |
| `actionLabel`            | `String?`           | `nil`     | 액션 버튼 라벨                         |
| `onAction`               | `(() -> Void)?`     | `nil`     | 액션 콜백(탭 시 바도 닫힘)             |
| `onDismiss`(UIKit만)     | `(() -> Void)?`     | `nil`     | 컨테이너에서 제거된 뒤 통지            |

특이사항

- UIKit `message`·`variant`·`position`·`actionLabel`은 `didSet`이라 대입 즉시 재스타일/재배치된다.
- 흰 글자는 전용 토큰이 없어 `.white`를 쓴다(웹 `color:#fff` 승계).
- 낭독: `danger`=assertive, 나머지 polite. `onAction` 탭은 콜백 실행 후 바를 닫는다.
