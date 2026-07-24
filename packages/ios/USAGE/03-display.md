# JunDS iOS — 사용법 03 · 표시 계열 (Display)

상태·정체성·측정값을 **비대화형으로 보여주는** 9종의 사용법이다. 전부 자기 크기를 스스로
결정하는(intrinsicContentSize) 정적 표시물이라 소비자는 위치만 잡아 주면 된다. 웹 primitives
`jd-badge`·`jd-tag`·`jd-avatar`·`jd-spinner`·`jd-status-dot`·`jd-severity-badge`·
`jd-battery-indicator`·`jd-kbd`·`jd-key-cap`과 각각 동형이며, 색·치수는 임의 상수가 아니라
전부 `JdToken`/`JdGap`과 Core 스펙(`JdDisplaySpecs`)에서 온다.

| # | SwiftUI | UIKit | 웹 | 한 줄 |
|---|---|---|---|---|
| 1 | `JdBadge` | `JdBadgeView` | `jd-badge` | 상태·카테고리 라벨 (+ 알림 카운트 모드) |
| 2 | `JdTag` | `JdTagView` | `jd-tag` | 태그/칩 (+ 닫기 버튼) |
| 3 | `JdAvatar` | `JdAvatarView` | `jd-avatar` | 이미지 또는 이니셜 폴백 + 상태 도트 |
| 4 | `JdSpinner` | `JdSpinnerView` | `jd-spinner` | 회전 로딩 표시기 |
| 5 | `JdStatusDot` | `JdStatusDotView` | `jd-status-dot` | 상태 점 + 선택 라벨 (+ pulse) |
| 6 | `JdSeverityBadge` | `JdSeverityBadgeView` | `jd-severity-badge` | 심각도 알약 뱃지 |
| 7 | `JdBatteryIndicator` | `JdBatteryIndicatorView` | `jd-battery-indicator` | 배터리형 레벨 게이지 |
| 8 | `JdKbd` | `JdKbdView` | `jd-kbd` | 단축키 표기 칩 |
| 9 | `JdKeyCap` | `JdKeyCapView` | `jd-key-cap` | 키 한 개 모양 칩 (+ 눌림) |

## 공통 규칙

- **임포트 하나** — `import JunDS`. 우산 타겟이 Core·UIKit·SwiftUI 세 계층을 `@_exported`로
  재수출한다. 계층을 개별 임포트할 필요가 없다.
- **크기 축은 `JdDisplaySize`(sm·md·lg) 공용** — Badge·StatusDot·SeverityBadge·Battery·KeyCap이
  같은 축을 받는다. Avatar만 `JdAvatarSize`(xs·sm·md·lg·xl)로 폭이 넓다.
- **색·간격은 토큰으로** — 예제의 `JdToken.Color.*`·`JdToken.Space.*`·`JdGap.*`는 하드코딩된
  값이 아니라 테마 반응 토큰이다. 표시 계열 일부는 웹 패리티상 v2 리터럴 팔레트를 승계한다(각
  컴포넌트 특이사항 참고).
- **⚠️ Badge 카운트 모드는 별도 init** — `JdBadge(count:maxCount:)` / `JdBadgeView(count:maxCount:)`는
  텍스트 모드와 다른 이니셜라이저다. variant/size 축을 받지 않고 원형·danger 고정이며, 텍스트 모드와
  병용할 수 없다(잘못된 조합을 타입으로 차단).
- **UIKit는 코드 생성 전용** — 전 뷰가 `init(coder:)`에서 `fatalError`. 스토리보드/xib 미지원.
  배치는 자체 DSL `view.jd.layout { … }`로 하며, `equalToSuperview()` 계열은 `addSubview` **이후**
  호출해야 한다(superview 부재 시 precondition 실패).

---

## 1. JdBadge / JdBadgeView

상태·카테고리를 나타내는 작은 라벨. 앞머리에 상태 점(`showsDot`)을 붙일 수 있고, 알림 개수를
표시하는 **카운트 모드**는 별도 init으로 분리돼 있다.

```swift
// SwiftUI — 텍스트 모드
JdBadge("신규", variant: .primary)
JdBadge("대기", variant: .warning, size: .sm, showsDot: true)
JdBadge("초안", variant: .outline)            // outline만 테두리 + 투명 배경

// 카운트 모드 — variant/size 없음, 원형·danger 고정
JdBadge(count: 5)                             // "5"
JdBadge(count: 128)                           // "99+" (maxCount 99 기본)
JdBadge(count: 250, maxCount: 200)            // "200+"
```

```swift
// UIKit — 생성 + 프로퍼티 + 배치
let badge = JdBadgeView("대기", variant: .warning, size: .sm, showsDot: true)
badge.variant = .danger        // didSet → 스펙 재해석·재적용
badge.showsDot = false
container.addSubview(badge)
badge.jd.layout {
    $0.centerY.equalToSuperview()
    $0.leading.equal(to: titleLabel.jd.trailing, offset: JdGap.sm.value)
}

// 카운트 모드는 전용 init — 이후 axes를 바꿀 수 없다
let unread = JdBadgeView(count: 12)
```

| 파라미터 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `text` | `String` | — | 라벨 문자열(첫 인자, 인자 레이블 생략) |
| `variant` | `JdBadgeVariant` | `.default` | `default`·`primary`·`success`·`warning`·`danger`·`info`·`outline` |
| `size` | `JdDisplaySize` | `.md` | `sm`·`md`·`lg` |
| `showsDot` | `Bool` | `false` | 앞머리 6pt 상태 점(장식 — AT에서 숨김) |

카운트 모드 전용 init `init(count:maxCount:)`:

| 파라미터 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `count` | `Int` | — | 표시할 개수 |
| `maxCount` | `Int` | `99` | 초과 시 `"maxCount+"`로 표기 |

UIKit 프로퍼티: `text`·`variant`·`size`·`showsDot`(전부 `var`, 대입 시 재적용). 카운트 모드는 init에서
확정되고 이후 축을 바꿀 수 없다.

**특이사항** — 카운트 모드는 원형 최소 지름 18pt(한 자리는 정원, 여러 자리는 알약), 색은 danger
고정·글자는 흰색이라 `variant`/`size`를 받지 않는다. `outline`만 테두리를 그리고 나머지 variant는
10% 워시 배경 + 진한 동색 글자다. 상태 점 색은 전경색을 따른다.

---

## 2. JdTag / JdTagView

태그/칩. **닫기(x) 버튼의 유무 = `onRemove` 콜백의 유무**다. 웹의 `closable` 어트리뷰트를
콜백 하나로 대신한다 — 삭제 자체(목록에서 빼는 일)는 소비자 몫이다.

```swift
// SwiftUI
JdTag("Swift")                                // gray 기본, 닫기 없음
JdTag("iOS", color: .blue)
JdTag("삭제 가능", color: .green) {            // onRemove 있으면 x 버튼 노출
    removeFromSelection()
}
```

```swift
// UIKit
let tag = JdTagView("Swift", color: .blue)
tag.onRemove = { [weak self] in self?.remove(tag) }   // 대입하면 닫기 버튼 표시
container.addSubview(tag)
tag.jd.layout {
    $0.top.equalToSuperview()
    $0.leading.equalToSuperview()
}
```

| 파라미터 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `text` | `String` | — | 태그 문자열(첫 인자) |
| `color` | `JdTagColor` | `.gray` | `gray`·`primary`·`blue`·`green`·`red`·`orange`·`purple`·`teal` |
| `onRemove` | `(() -> Void)?` | `nil` | 있으면 닫기(x) 버튼 + 탭 시 콜백. `nil`이면 버튼 없음 |

UIKit 프로퍼티: `text`·`color`·`onRemove`(전부 `var`).

**특이사항** — `primary`만 토큰 기반이라 테마에 반응하고, 나머지 7색은 v2 리터럴 팔레트를 승계한다
(다크에서는 알파 워시로 대비 보정). 닫기 버튼 a11y 라벨은 `"삭제"`. ⚠️ 승계 아이콘이 12pt라 히트
타깃이 HIG 44pt에 크게 못 미친다 — 표면은 패리티 때문에 유지하므로, 삭제가 잦은 화면이라면 소비자가
별도 액션을 제공하는 편이 좋다.

---

## 3. JdAvatar / JdAvatarView

이미지가 있으면 이미지를, 없으면 이름에서 뽑은 이니셜을 원형으로 보여주고, 우하단에 선택적 상태
도트를 얹는다. **이니셜 폴백 배경색은 이름 해시로 결정**되어 같은 이름은 항상 같은 색이 된다.

```swift
// SwiftUI — image는 SwiftUI Image?
JdAvatar(name: "김준하", image: Image("profile"), size: .lg, status: .online)
JdAvatar(name: "홍길동")                       // 이미지 없음 → 이니셜 "홍길", 이름 해시 색
JdAvatar(name: "Ada Lovelace", size: .xl)      // 2어절 → "AL"
JdAvatar()                                     // 이름·이미지 없음 → "?"
```

```swift
// UIKit — image는 UIImage?
let avatar = JdAvatarView(name: "김준하", size: .lg, status: .online)
avatar.image = UIImage(named: "profile")       // 있으면 이미지, 없으면 이니셜 폴백
avatar.status = .busy                          // nil이면 도트 제거
container.addSubview(avatar)
avatar.jd.layout {
    $0.top.leading.equalToSuperview()
}
```

| 파라미터 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `name` | `String` | `""` | 이니셜·폴백 색·접근성 라벨의 단일 입력 |
| `image` | `Image?` (SwiftUI) / `UIImage?` (UIKit) | `nil` | 있으면 이미지 우선, 없으면 이니셜 폴백 |
| `size` | `JdAvatarSize` | `.md` | `xs`·`sm`·`md`·`lg`·`xl` (24/32/36/44/56pt) |
| `status` | `JdAvatarStatus?` | `nil` | `online`·`offline`·`away`·`busy`. `nil`이면 도트 없음 |

UIKit 프로퍼티: `name`·`image`·`status`(`var`). ⚠️ 크기는 `avatarSize`(public `let`)로 노출되며 생성
후 변경 불가.

**특이사항** — 이니셜 규칙: 공백 기준 2어절 이상이면 앞 두 어절의 첫 글자, 아니면 앞 2글자를
대문자화(한글은 그대로). 이름이 비면 `"?"`. 폴백 색 팔레트는 6색(primary·accent·info·success·
warning·danger)이고 이름 해시로 고정된다. a11y는 이미지·이니셜·도트를 **한 요소로 합치고** 라벨=`name`
(비면 `"아바타"`), 상태는 문자열 조합이 아니라 `accessibilityValue`로 노출한다
(`"온라인"`/`"오프라인"`/`"자리 비움"`/`"다른 용무 중"`) — 색으로만 상태를 주는 웹의 결함을 보정하는
지점이다.

---

## 4. JdSpinner / JdSpinnerView

회전 로딩 표시기. **Reduce Motion이 켜지면 회전을 멈추고 마지막 프레임을 그대로 남긴다** — 사라지지
않는다(로딩 중이라는 사실은 유지돼야 한다).

```swift
// SwiftUI — 자체 드로잉(25% 트랙 링 + 75% 1/4 호)
JdSpinner()                                    // md, label "로딩 중", primary
JdSpinner(size: .sm)
JdSpinner(size: .lg, label: "업로드 중", color: JdToken.Color.danger)
```

```swift
// UIKit — 시스템 UIActivityIndicatorView 스킨
let spinner = JdSpinnerView(size: .lg, color: JdToken.Color.primary)
spinner.label = "동기화 중"                     // 접근성 라벨(var)
container.addSubview(spinner)
spinner.jd.layout {
    $0.center.equalToSuperview()
}
// spinner.isAnimating  // get-only — Reduce Motion 정지 여부 관측용
```

| 파라미터 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `size` | `JdDisplaySize` | `.md` | `sm`·`md`·`lg` (지름 16/24/32pt) |
| `label` | `String` | `JdSpinnerSpec.defaultLabel`(`"로딩 중"`) | 접근성 라벨 |
| `color` | `JdDynamicColor` | `JdToken.Color.primary` | 링·호 색 |

UIKit 프로퍼티: `label`(`var`), `isAnimating`(get-only). ⚠️ `size`·`color`는 init 전용이라 이후 변경할
수 없다(프로퍼티 없음).

**특이사항** — 웹은 Reduce Motion에서 주기만 늦추지만(1.6s) iOS는 **완전 정지**시킨다(04 §7.3).
SwiftUI는 픽셀 동형으로 자체 드로잉하고, UIKit은 04 §10.1 "시스템 컨트롤 우선"에 따라
`UIActivityIndicatorView`를 스펙 지름으로 스케일해 쓴다(`hidesWhenStopped = false`). a11y는 웹
`role=status`의 번역으로 `updatesFrequently` 트레이트를 단다.

---

## 5. JdStatusDot / JdStatusDotView

상태를 나타내는 작은 점 + 선택적 라벨. `pulse` 상태만 맥동하며 **Reduce Motion 시 정지**한다.

```swift
// SwiftUI
JdStatusDot(.success, label: "정상 가동")
JdStatusDot(.danger, label: "오류", size: .lg)
JdStatusDot(.pulse, label: "실시간")           // success 색 + 2s 맥동
JdStatusDot(.neutral)                          // 라벨 없음 → 상태명이 AT 라벨로
```

```swift
// UIKit
let dot = JdStatusDotView(.warning, label: "지연", size: .md)
dot.status = .pulse            // didSet → 재해석 + 맥동 재부착
dot.label = nil                // 라벨 제거 시 상태명이 접근성 라벨 대체
container.addSubview(dot)
dot.jd.layout {
    $0.leading.centerY.equalToSuperview()
}
```

| 파라미터 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `status` | `JdStatusKind` | `.neutral` | `neutral`·`success`·`warning`·`danger`·`info`·`pulse`(첫 인자) |
| `label` | `String?` | `nil` | 점 옆 라벨. `nil`/빈 문자열이면 점만 표시 |
| `size` | `JdDisplaySize` | `.md` | `sm`·`md`·`lg` (점 6/8/10pt) |

UIKit 프로퍼티: `status`·`label`·`size`(전부 `var`).

**특이사항** — `pulse`는 success 색 + 2초 왕복 맥동이며 Reduce Motion 시 멈춘다(04 §7.3). `info`는
primary 색으로 그린다. 웹은 라벨 없는 점에 role·aria가 전무해 AT에 아무것도 주지 않는다 — iOS는
라벨이 없으면 상태명을 접근성 라벨로 노출해 보정한다(`"중립"`/`"정상"`/`"경고"`/`"위험"`/`"정보"`/
`"활성"`).

---

## 6. JdSeverityBadge / JdSeverityBadgeView

심각도를 나타내는 알약(radius full) 뱃지. status-dot과 **어휘가 다르다**(`ok`/`warn` vs
`success`/`warning`).

```swift
// SwiftUI
JdSeverityBadge("정상", severity: .ok, showsDot: true)
JdSeverityBadge("점검 필요", severity: .warn)
JdSeverityBadge("장애", severity: .danger, size: .sm)
JdSeverityBadge("기본")                        // neutral — 심각도 값 미노출
```

```swift
// UIKit
let sev = JdSeverityBadgeView("점검 필요", severity: .warn, showsDot: true)
sev.severity = .danger         // didSet → 재해석·재적용
sev.showsDot = false
container.addSubview(sev)
sev.jd.layout {
    $0.top.equalToSuperview()
    $0.trailing.equalToSuperview()
}
```

| 파라미터 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `text` | `String` | — | 라벨 문자열(첫 인자) |
| `severity` | `JdSeverity` | `.neutral` | `ok`·`warn`·`danger`·`info`·`neutral` |
| `size` | `JdDisplaySize` | `.md` | `sm`·`md`·`lg`(md·lg 동일 패딩, sm만 축소) |
| `showsDot` | `Bool` | `false` | 앞머리 8pt 점(장식 — AT에서 숨김) |

UIKit 프로퍼티: `text`·`severity`·`size`·`showsDot`(전부 `var`).

**특이사항** — 항상 알약 도형(웹 `radius-full`). 라이트 리터럴 팔레트를 다크에서 알파 워시로 보정한다.
색으로만 심각도를 주는 웹을 보정해 심각도명을 `accessibilityValue`로 노출하되(`"정상"`/`"주의"`/
`"위험"`/`"정보"`), `neutral`은 기본값이라 값을 노출하지 않는다(잡음 방지).

---

## 7. JdBatteryIndicator / JdBatteryIndicatorView

배터리 모양 레벨 게이지. 값은 0–100으로 클램프되고, **`autoColor`가 켜지면 임계값으로 색이 자동
결정**된다(그 외에는 `color`를 그대로 쓴다).

```swift
// SwiftUI
JdBatteryIndicator(value: 82, autoColor: true)          // >70 → success
JdBatteryIndicator(value: 45, size: .lg, label: "배터리", autoColor: true)  // >30 → warning, lg는 % 노출
JdBatteryIndicator(value: 15, color: .danger)           // 수동 색
JdBatteryIndicator(value: 150)                          // 100으로 클램프
```

```swift
// UIKit
let battery = JdBatteryIndicatorView(value: 82, size: .lg, autoColor: true)
battery.value = 24             // didSet → 채움 폭·색 애니메이션(Reduce Motion 시 즉시)
battery.label = "배터리"
container.addSubview(battery)
battery.jd.layout {
    $0.center.equalToSuperview()
}
```

| 파라미터 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `value` | `Double` | — | 레벨(0–100으로 클램프) |
| `size` | `JdDisplaySize` | `.md` | `sm`·`md`·`lg`(본체 40×16/56×24/80×32pt) |
| `label` | `String?` | `nil` | 게이지 앞 텍스트 라벨 |
| `autoColor` | `Bool` | `false` | `true`면 값으로 색 자동 결정(`color` 무시) |
| `color` | `JdBatteryColor` | `.primary` | 수동 채움색 `primary`·`success`·`warning`·`danger` |

UIKit 프로퍼티: `value`·`size`·`label`·`autoColor`·`color`(전부 `var`).

**특이사항** — 자동 색 임계값: **>70 success · >30 warning · 그 외 danger**. 퍼센트 텍스트는 `lg`에서만
노출된다(임의 채움색 위 판독성을 위해 흰 글자 + 검정 헤일로). 채움색은 v2 Tailwind-500 리터럴이라
테마 불변이다. 채움 전환은 `JdMotion` 경유라 Reduce Motion 시 즉시 반영된다. 폭으로만 값을 주는 웹을
보정해 a11y 라벨(기본 `"배터리"`) + `accessibilityValue`로 `"N 퍼센트"`를 노출한다.

---

## 8. JdKbd / JdKbdView

단축키를 표기하는 모노스페이스 칩. 입력의 **공백은 Core가 전부 제거**한다(`"⌘ K"` → `"⌘K"`).

```swift
// SwiftUI
JdKbd("⌘K")
JdKbd("⌘ ⇧ P")                                 // → "⌘⇧P"
JdKbd("Esc")
```

```swift
// UIKit — UILabel 서브클래스
let kbd = JdKbdView("⌘K")
kbd.keys = "⌘ ⇧ P"            // 대입 시 재정규화 → "⌘⇧P"
container.addSubview(kbd)
kbd.jd.layout {
    $0.trailing.centerY.equalToSuperview()
}
```

| 파라미터 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `keys` | `String` | — | 단축키 문자열(첫 인자, 공백 자동 제거) |

UIKit 프로퍼티: `keys`(`var`, 대입 시 재정규화). `JdKbdView`는 `UILabel` 서브클래스다.

**특이사항** — 11pt mono medium, 배경 `cardHover`·테두리 `border`·글자 `muted`. 웹의 미세 바닥
그림자는 대응 토큰이 없어 UIKit에서 생략한다. 여러 키를 개별 칩으로 쪼개지 않고 정규화된 한 문자열을
한 요소로 그린다(웹 `textContent` 동형).

---

## 9. JdKeyCap / JdKeyCapView

키 한 개 모양의 칩. **`isPressed`가 참이면 아래로 1pt 내려가고 그림자가 사라진다**. 눌림 상태는
소비자가 소유한다(자체 터치 처리 없음).

```swift
// SwiftUI
JdKeyCap("A")
JdKeyCap("⏎", variant: .primary, size: .lg)
JdKeyCap("⌫", variant: .muted)
JdKeyCap("W", isPressed: keyStates.contains("W"))   // 소비자 상태에 바인딩
```

```swift
// UIKit — UILabel 서브클래스
let cap = JdKeyCapView("A", variant: .default, size: .lg)
cap.isPressed = true           // didSet → 1pt 하강 + 그림자 제거(Reduce Motion 시 즉시)
container.addSubview(cap)
cap.jd.layout {
    $0.top.leading.equalToSuperview()
}
```

| 파라미터 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `key` | `String` | — | 키 글자(첫 인자) |
| `variant` | `JdKeyCapVariant` | `.default` | `default`(카드+그림자)·`primary`(강조색+흰 글자)·`muted`(연한 표면) |
| `size` | `JdDisplaySize` | `.md` | `sm`·`md`·`lg`(높이 20/24/32pt) |
| `isPressed` | `Bool` | `false` | 눌림 상태 — 아래로 1pt + 그림자 제거 |

UIKit 프로퍼티: `isPressed`(`var`). ⚠️ `variant`·`keyCapSize`는 public `let`이라 생성 후 변경 불가.
`JdKeyCapView`는 `UILabel` 서브클래스다.

**특이사항** — 바닥 그림자는 `default` variant에만 있다(눌림 시 제거). 눌림 전환은 `JdMotion` 경유라
Reduce Motion 시 즉시 반영된다. mono medium이며 높이/최소폭은 고정이 아니라 하한이라 Dynamic Type
확대 시 자란다(04 §7.2).
