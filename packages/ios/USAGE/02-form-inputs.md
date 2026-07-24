# JunDS iOS — 폼 입력 (02)

폼 입력 계열 14종의 **SwiftUI · UIKit 사용법**. 각 항목은 실제 소스의 public init·프로퍼티와 1:1
대응한다. 컴포넌트가 아닌 것(레이아웃·시스템 API)은 [../RECIPES.md](../RECIPES.md), 목차는
[../USAGE.md](../USAGE.md).

```swift
import JunDS   // 이 한 줄로 Core + UIKit + SwiftUI 전부 (Exports.swift가 @_exported)
```

## 이 문서의 공통 규약

- **상태 바인딩**: SwiftUI는 `@State` + `Binding`, UIKit은 프로퍼티 대입 + `onChange`류 클로저.
- **onChange는 사용자 조작 전용**: UIKit에서 `view.isOn = true`처럼 프로그램으로 값을 바꾸면
  콜백이 발화하지 않는다(웹 `jd-change` 계약과 동일). 값을 되쓰는 것과 이벤트를 쏘는 것은 별개다.
- **색·치수 토큰**: 전부 `JdToken`·`JdGap`만 쓴다 — `JdToken.Color.primary.color`(SwiftUI) /
  `.uiColor`(UIKit), `JdToken.Space.s4`(=16), `JdGap.md.value`(=16). 소비자도 같은 토큰으로
  주변 여백·색을 맞추면 시각 일관성이 선다.
- **판정은 Core**: 클램프·마스킹·강도·완료 판정은 전부 `JunDSCore`의 순수 함수가 단일 소스다.
  렌더 계층(및 소비자)은 결과만 그린다 — 규칙을 재구현하지 않는다.

### 크기 축이 컴포넌트마다 다르다

sm/md/lg라는 리터럴은 같지만 **어느 열거형을 받는지가 갈린다** — 잘못 넘기면 컴파일 에러다.

| 크기 열거형 | 값 | 쓰는 컴포넌트 |
|---|---|---|
| `JdToggleSize` | sm · md · lg | Toggle · Checkbox · RadioGroup · Slider |
| `JdControlSize` | sm · md · lg | TextField · CurrencyInput · PhoneInput · PasswordInput |
| `JdNumberInputSize` | sm · md · lg (높이 32 · 36 · 44) | NumberInput |
| `JdIconButtonSize` | xs · sm · md · lg (변 24 · 28 · 32 · 40) | IconButton |
| — (크기 축 없음) | — | Textarea · RangeSlider · Label |

Checkbox·RadioGroup·Slider가 `JdControlSize`가 아니라 `JdToggleSize`를 받는 것은 Core가 이 셋의
sm/md/lg 스펙(`JdChoiceSpec`·`JdSliderSpec`)을 토글 축에 얹어 풀기 때문이다 — 표면 리터럴은 같다.

---

## JdToggle

켬/끔 스위치. 웹 `jd-toggle`·`jd-switch` 동형이고, iOS는 둘 다 시스템 스위치로 귀결돼 단일 구현이다.
`JdSwitch`·`JdSwitchView`는 **별칭 한 줄**이다(별도 타입 아님 — R12).

```swift
// SwiftUI
struct NotificationRow: View {
    @State private var isOn = true

    var body: some View {
        JdToggle("알림 받기", isOn: $isOn)          // 가장 흔한 형태: 라벨 + 바인딩
        JdToggle(isOn: $isOn, size: .lg)            // 라벨 없이(트레이트는 시스템이 낭독)
        JdSwitch("동일 컨트롤", isOn: $isOn)         // 별칭 — JdToggle과 같은 타입
    }
}
```

```swift
// UIKit
let toggle = JdToggleView(label: "알림 받기", isOn: true, size: .md)
toggle.onChange = { isOn in          // 사용자 조작 시에만 발화(프로그램 대입은 미발화)
    settings.notify = isOn
}
container.addSubview(toggle)
toggle.jd.layout {
    $0.top.equalToSuperview().inset(JdToken.Space.s4)
    $0.leading.equalToSuperview().inset(JdToken.Space.s4)
}
```

| 파라미터 | 타입 | 기본값 | 의미 |
|---|---|---|---|
| `label` (첫 인자) | `String?` | `nil` | 옆 텍스트. 빈/`nil`이면 스위치만(라벨 숨김) |
| `isOn` | `Binding<Bool>` (SwiftUI) / `Bool` (UIKit) | UIKit `false` | 켬/끔 상태 |
| `size` | `JdToggleSize` | `.md` | SwiftUI는 `ControlSize`로 번역, UIKit은 라벨 폰트에만 반영 |

- UIKit 프로퍼티: `label` · `isOn` · `size` · `isEnabled` · `onChange: ((Bool) -> Void)?`
- **시스템 컨트롤 스킨 우선**(04 §10.1): 트랙/썸 기하는 시스템(UISwitch/Toggle)이 그린다 —
  픽셀 재현이 아니라 크기 어휘 번역이다. 켬/끔은 스위치가 스스로 accessibilityValue로 낭독한다.
- 라벨 탭도 사용자 조작으로 취급한다(웹 `<label>` 래핑 동형) — UIKit도 라벨 탭에서 `onChange` 발화.

---

## JdCheckbox

3상태 체크박스(off · on · indeterminate). iOS 관용구가 없어 SF Symbols 자체 드로잉이다.

```swift
// SwiftUI
struct TermsRow: View {
    @State private var state: JdCheckboxState = .off

    var body: some View {
        JdCheckbox("약관에 동의합니다", state: $state)
        // 부분 선택(mixed)을 순환에 넣으려면:
        JdCheckbox("전체 선택", state: $state, indeterminateAllowed: true)
    }
}
```

```swift
// UIKit — UIControl이라 isSelected가 이미 점유돼 상태 프로퍼티는 isSelectedState다
let box = JdCheckboxView(label: "약관에 동의합니다", state: .off, indeterminateAllowed: true)
box.onChange = { state in
    viewModel.agreed = (state == .on)
}
box.jd.layout { $0.edges.equalToSuperview() }
```

| 파라미터 | 타입 | 기본값 | 의미 |
|---|---|---|---|
| `label` (첫 인자) | `String?` | `nil` | 옆 텍스트(행 전체가 히트 영역) |
| `state` | `Binding<JdCheckboxState>` (SwiftUI) / `JdCheckboxState` (UIKit) | UIKit `.off` | 3상태 값 |
| `size` | `JdToggleSize` | `.md` | 박스·라벨 스펙 |
| `indeterminateAllowed` | `Bool` | `false` | true면 off → on → indeterminate → off 순환 |

- UIKit 프로퍼티: `label` · `isSelectedState` · `size` · `indeterminateAllowed` · `isEnabled`
  (UIControl 상속) · `onChange: ((JdCheckboxState) -> Void)?`
- 상태는 문자열로 라벨에 붙이지 않고 트레이트(`.isSelected`) + `accessibilityValue`로만 노출한다
  (04 §7.1). `.disabled(true)`(SwiftUI) / `isEnabled = false`(UIKit)면 웹 disabled처럼 50% 흐려진다.

---

## JdRadioGroup

옵션 배열 + 단일 선택. 세로(기본)는 스택, 가로는 좁은 폭에서 다음 줄로 넘어간다(SwiftUI는
`JdFlowLayout`, UIKit은 no-wrap 폴백).

```swift
// SwiftUI — 선택값은 옵션 value와 매칭되는 String?
struct PlanPicker: View {
    @State private var plan: String? = "pro"
    private let options = [
        JdRadioOption(value: "free", label: "무료"),
        JdRadioOption(value: "pro", label: "프로"),
        JdRadioOption(value: "team", label: "팀", isDisabled: true),
    ]

    var body: some View {
        JdRadioGroup(options, selection: $plan, axis: .vertical)
    }
}
```

```swift
// UIKit
let group = JdRadioGroupView(
    options: [JdRadioOption(value: "free", label: "무료"),
              JdRadioOption(value: "pro", label: "프로")],
    selectedValue: "pro",
    axis: .horizontal
)
group.onChange = { value in viewModel.plan = value }   // 선택된 옵션 value
group.jd.layout { $0.edges.equalToSuperview() }
```

| 파라미터 | 타입 | 기본값 | 의미 |
|---|---|---|---|
| `options` (첫 인자) | `[JdRadioOption]` | UIKit `[]` | `value`·`label`·`isDisabled`로 구성 |
| `selection` / `selectedValue` | `Binding<String?>` (SwiftUI) / `String?` (UIKit) | `nil` | 선택된 옵션의 value |
| `axis` | `JdAxis` | `.vertical` | 배치 방향 |
| `size` | `JdToggleSize` | `.md` | 심볼·라벨 스펙 |
| `isEnabled` (SwiftUI init 인자) | `Bool` | `true` | 그룹 전체 활성 |

- UIKit 프로퍼티: `options` · `selectedValue` · `axis` · `size` · `isEnabled` ·
  `onChange: ((String) -> Void)?`
- 각 행이 개별 접근성 요소(`.isButton` + 선택 시 `.isSelected`)다. **그룹 라벨(aria-label 등가)은
  소비자 몫** — 컴포넌트가 임의 문자열을 만들지 않는다. 그룹 disabled 또는 옵션 `isDisabled`면 그 행이 비활성.

---

## JdSlider

단일 값 슬라이더. 시스템 `Slider`/`UISlider`에 위임하고, step 양자화·fraction은 Core `JdRangeState`가
단일 소스다. 헤더(min·현재값·max)와 마크는 이 계층이 그린다.

```swift
// SwiftUI
struct VolumeControl: View {
    @State private var volume: Double = 40

    var body: some View {
        JdSlider(value: $volume, in: 0...100, step: 5,
                 color: .primary, showsValue: true)

        // 마크 + 커스텀 포맷
        JdSlider(value: $volume, in: 0...100, step: 10,
                 showsValue: true,
                 marks: [JdSliderMark(value: 0, label: "0"),
                         JdSliderMark(value: 50, label: "50"),
                         JdSliderMark(value: 100, label: "100")],
                 format: { "\(Int($0))%" })
    }
}
```

```swift
// UIKit — 웹 이벤트 대응: onValueChange = jd-input, onCommit = jd-change
let slider = JdSliderView(value: 40, in: 0...100, step: 5,
                          color: .success, showsValue: true)
slider.format = { "\(Int($0))%" }
slider.onValueChange = { v in liveLabel.text = "\(Int(v))%" }   // 드래그 중
slider.onCommit = { v in save(v) }                              // 손을 뗄 때
slider.jd.layout {
    $0.leading.equalToSuperview().inset(JdToken.Space.s4)
    $0.trailing.equalToSuperview().inset(JdToken.Space.s4)
}
```

| 파라미터 | 타입 | 기본값 | 의미 |
|---|---|---|---|
| `value` | `Binding<Double>` (SwiftUI) / `Double` (UIKit) | UIKit `0` | 현재 값(Core가 양자화) |
| `in bounds` | `ClosedRange<Double>` | `0...100` | 최소·최대 |
| `step` | `Double` | `1` | 양자화 간격 |
| `color` | `JdSliderColor` | `.primary` | 채움 트랙 액센트(primary·success·warning·danger) |
| `size` | `JdToggleSize` | `.md` | 값 글꼴 스펙 |
| `showsValue` | `Bool` | `false` | 상단 헤더 행 노출 |
| `marks` | `[JdSliderMark]` | `[]` | 트랙 아래 틱 + 라벨(장식) |
| `format` | `((Double) -> String)?` | `nil` | 현재값·낭독 표기(min/max 라벨은 원값) |

- UIKit 프로퍼티: 위 인자 + `format` · `isEnabled` · `onValueChange` · `onCommit`
  (둘 다 `((Double) -> Void)?`). SwiftUI는 `format`을 init 인자로 받는다.
- 헤더·마크는 슬라이더가 이미 값을 낭독하므로 `accessibilityHidden`(시각 중복 제거).

---

## JdRangeSlider

두 손잡이 범위 슬라이더. 네이티브 컨트롤이 단일 값뿐이라 자체 드로잉·자체 트래킹이다.
**클램프·양자화·최소 간격 유지는 전부 Core `JdRangeState`가 한다** — 이 계층은 fraction만 읽어 그린다.

```swift
// SwiftUI — 값은 JdRangeState 하나로 묶여 다닌다(두 손잡이의 규칙이 Core에 있으므로)
struct PriceFilter: View {
    @State private var range = JdRangeState(bounds: 0...100, step: 5, lower: 20, upper: 80)

    var body: some View {
        JdRangeSlider(state: $range, showsValues: true,
                      format: { "\(Int($0))만원" })
        // 읽을 때: range.lower / range.upper (읽기 전용 — 세터는 setLower/setUpper)
    }
}
```

```swift
// UIKit — UIControl.state가 이미 있어 상태 프로퍼티는 rangeState다
let slider = JdRangeSliderView(
    state: JdRangeState(bounds: 0...100, step: 5, lower: 20, upper: 80),
    showsValues: true
)
slider.format = { "\(Int($0))만원" }
slider.onChange = { state in                 // 드래그 중·조정 직후 모두 통지
    applyFilter(min: state.lower, max: state.upper)
}
slider.jd.layout {
    $0.leading.equalToSuperview().inset(JdToken.Space.s4)
    $0.trailing.equalToSuperview().inset(JdToken.Space.s4)
}
```

| 파라미터 | 타입 | 기본값 | 의미 |
|---|---|---|---|
| `state` | `Binding<JdRangeState>` (SwiftUI) / `JdRangeState` (UIKit) | UIKit `JdRangeState()` | 범위 상태(bounds·step·lower·upper) |
| `showsValues` | `Bool` | `false` | 상단 값 행 노출 |
| `format` | `((Double) -> String)?` | `nil` | 값 행·낭독 표기 |

- UIKit 프로퍼티: `rangeState` · `showsValues` · `format` · `isEnabled` ·
  `onChange: ((JdRangeState) -> Void)?`. SwiftUI는 `format`을 init 인자로 받는다.
- `JdRangeState`는 값 타입이고 `setLower`/`setUpper`가 유일한 변경 경로다 — 넘겨진 값은 자동으로
  양자화·클램프되고 두 손잡이 사이 최소 간격(step)이 강제된다. 경계값은 step 배수가 아니어도 도달 가능.
- **접근성**: 컨테이너가 아니라 손잡이 2개가 각각 `.adjustable` 요소다(VoiceOver 증감 = step 단위).

---

## JdLabel

폼 필드 라벨. `isRequired`면 "*"를 그리고, 웹이 CSS로만 그려 AT가 못 읽던 결함을 iOS는
접근성 라벨에 "필수"로 합류시켜 보정한다.

```swift
// SwiftUI
VStack(alignment: .leading, spacing: JdToken.Space.s1_5) {
    JdLabel("이메일", isRequired: true)     // 화면엔 "이메일 *", AT는 "이메일 필수"
    JdTextField(placeholder: "you@example.com", text: $email)
}
```

```swift
// UIKit — JdLabelView는 UILabel 서브클래스라 그대로 스택에 넣는다
let label = JdLabelView("이메일", isRequired: true)
label.jd.layout { $0.leading.top.equalToSuperview() }
// 이후 텍스트 교체도 표식·접근성 계약 유지: label.text = "이메일 주소"
```

| 파라미터 | 타입 | 기본값 | 의미 |
|---|---|---|---|
| `text` (첫 인자) | `String` | — | 라벨 문구 |
| `isRequired` | `Bool` | `false` | "*" 표식 + 접근성 라벨에 "필수" 합류 |

- UIKit 프로퍼티: `isRequired` · `text`(오버라이드 — UILabel API로 바꿔도 계약 유지).
- 표식 앞 여백은 웹 `margin-inline-start 2px` 동형(UIKit은 마지막 글자 커닝, 이모지도 안 쪼갬).

---

## JdTextField

한 줄 텍스트 입력 + 라벨 + 에러 메시지. 에러는 **메시지 문자열**이 곧 상태다(비어 있지 않으면 에러).

```swift
// SwiftUI
struct EmailField: View {
    @State private var email = ""
    @State private var error: String?

    var body: some View {
        JdTextField("이메일",
                    placeholder: "you@example.com",
                    text: $email,
                    size: .md,
                    error: error,                       // nil/"" = 정상, 문자열 = 에러
                    onCommit: { validate() })
    }
}
```

```swift
// UIKit
let field = JdTextFieldView(label: "이메일", placeholder: "you@example.com", size: .md)
field.onTextChange = { text in draft = text }       // 매 키 입력
field.onCommit = { text in validate(text) }         // 편집 종료
field.error = "올바른 이메일이 아닙니다"              // 문자열 대입 = 에러 표시 + 낭독
field.jd.layout {
    $0.leading.trailing.equalToSuperview().inset(JdToken.Space.s4)
}
```

| 파라미터 | 타입 | 기본값 | 의미 |
|---|---|---|---|
| `label` (첫 인자) | `String?` | `nil` | 상단 라벨(빈/nil이면 숨김) |
| `placeholder` | `String` (SwiftUI) / `String?` (UIKit) | `""`/`nil` | 안내 문구 |
| `text` | `Binding<String>` (SwiftUI) | — | SwiftUI 전용 init 인자 |
| `size` | `JdControlSize` | `.md` | 높이 32/40/48 |
| `error` | `String?` | `nil` | 메시지 = 상태. SwiftUI는 init 인자, UIKit은 프로퍼티 |
| `onCommit` | `(() -> Void)?` | `nil` | SwiftUI 전용 init 인자(제출/포커스 종료) |

- UIKit 프로퍼티: `label` · `placeholder` · `error` · `size` · `text` · `isEnabled` ·
  `onTextChange: ((String) -> Void)?` · `onCommit: ((String) -> Void)?`. `becomeFirstResponder()`로 포커스.
- 에러가 바뀌면 UIKit은 접근성 announce로 알린다(웹 aria-live 등가). 포커스 시 테두리 primary, 에러 시 danger.

---

## JdTextarea

여러 줄 입력. `maxLength`·글자 수 카운터·에러(메시지 없는 boolean)를 지원한다.
**UIKit에는 `autoResize`(내용만큼 높이 성장)가 있고 SwiftUI에는 없다** — 유일한 표면 차이다.

```swift
// SwiftUI
struct BioEditor: View {
    @State private var bio = ""

    var body: some View {
        JdTextarea(text: $bio,
                   placeholder: "소개를 입력하세요",
                   rows: 4,
                   maxLength: 200,
                   isError: false,
                   showsCount: true)     // "12/200" 배지
    }
}
```

```swift
// UIKit
let area = JdTextareaView(placeholder: "소개를 입력하세요",
                          rows: 4, maxLength: 200,
                          showsCount: true, autoResize: true)
area.onTextChange = { text in draft = text }
area.onCommit = { text in save(text) }
area.jd.layout {
    $0.leading.trailing.equalToSuperview().inset(JdToken.Space.s4)
}
```

| 파라미터 | 타입 | 기본값 | 의미 |
|---|---|---|---|
| `text` | `Binding<String>` (SwiftUI) | — | SwiftUI 전용 init 인자 |
| `placeholder` | `String` | `""` | 안내 문구 |
| `rows` | `Int` | `4` | 초기 표시 행 수(최소 높이 계산) |
| `maxLength` | `Int` | `0` | 0이면 무제한. 사용자 입력만 자름(프로그램 대입은 제한 안 함) |
| `isError` | `Bool` | `false` | 테두리 danger + 낭독 "오류" |
| `showsCount` | `Bool` | `false` | `maxLength > 0`일 때만 카운터 배지 |
| `autoResize` | `Bool` | `false` | **UIKit 전용** — 스크롤 대신 높이 성장 |

- UIKit 프로퍼티: `text` · `placeholder` · `isError` · `showsCount` · `autoResize` · `maxLength` ·
  `isEnabled` · `onTextChange` · `onCommit`.
- 웹이 `aria-invalid`를 안 달아 AT가 오류를 모르던 것을 iOS는 `accessibilityValue("오류")`로 보정.
  카운터는 장식이라 접근성에서 제외한다.

---

## JdNumberInput

숫자 입력 + 증감(−/+) 버튼. **클램프 타이밍이 이 컴포넌트의 계약이다**: 타이핑 중에는 클램프하지
않고 **커밋(포커스 종료)·스텝 버튼에서만** 클램프한다(min=10 필드에 "50"을 칠 수 있어야 한다).
크기 램프는 컨트롤(32/40/48)이 아니라 `JdNumberInputSize`(32/36/44)다.

```swift
// SwiftUI — 값은 Double? (빈 값 = nil, v2처럼 0을 강제하지 않는다)
struct QuantityStepper: View {
    @State private var qty: Double? = 1

    var body: some View {
        JdNumberInput(value: $qty, min: 1, max: 99, step: 1, size: .md)
        // 버튼 없이 숫자 필드만:
        JdNumberInput(value: $qty, min: 0, hidesControls: true,
                      accessibilityLabel: "수량")
    }
}
```

```swift
// UIKit — 프로퍼티명은 minValue/maxValue다(Swift.min/max와의 충돌 회피)
let input = JdNumberInputView(value: 1, min: 1, max: 99, step: 1, size: .md)
input.onValueChange = { v in draft = v }     // 타이핑 중(클램프 전)
input.onCommit = { v in save(v) }            // 커밋·스텝(클램프 후)
// 이후 경계 변경 시: input.minValue = 5 / input.maxValue = 50
input.jd.layout { $0.leading.top.equalToSuperview() }
```

| 파라미터 | 타입 | 기본값 | 의미 |
|---|---|---|---|
| `value` | `Binding<Double?>` (SwiftUI) / `Double?` (UIKit) | UIKit `nil` | 값(빈 값 = nil) |
| `min` | `Double?` | `nil` | 하한(nil = 무제한). UIKit 프로퍼티는 `minValue` |
| `max` | `Double?` | `nil` | 상한(nil = 무제한). UIKit 프로퍼티는 `maxValue` |
| `step` | `Double` | `1` | 증감 폭 |
| `size` | `JdNumberInputSize` | `.md` | 높이 32/36/44 |
| `isError` | `Bool` | `false` | 테두리 danger |
| `hidesControls` | `Bool` | `false` | −/+ 버튼 숨김(순수 숫자 필드) |
| `placeholder` | `String` | `""` | 안내 문구 |
| `accessibilityLabel` | `String?` | `nil` | 필드 낭독 라벨 |

- UIKit 프로퍼티: `value` · `minValue` · `maxValue` · `step` · `isError` · `hidesControls` ·
  `placeholder` · `isEnabled` · `onValueChange: ((Double?) -> Void)?` · `onCommit: ((Double?) -> Void)?`.
- **접근성**: −/+ 버튼 2개를 따로 노출하지 않고 필드 하나를 `.adjustable`로 만든다(VoiceOver 증감).
  경계 판정(canIncrement/canDecrement)은 Core `JdNumberInputRules`가 단일 소스.

---

## JdCurrencyInput

통화 포맷 금액 입력. **포커스 중엔 원시 숫자, 포커스 해제 시 통화 포맷**으로 표기가 갈린다.
포맷 문자열은 전부 Core `JdNumberFormat.string(style: .currency, …)`가 만든다(통화별 소수 자릿수·구분자).

```swift
// SwiftUI
struct AmountField: View {
    @State private var amount: Double? = 12000

    var body: some View {
        JdCurrencyInput(value: $amount)                       // ₩12,000 (KRW·ko-KR 기본)
        JdCurrencyInput(value: $amount, currency: "USD",
                        locale: "en-US", size: .lg)           // $12,000.00
    }
}
```

```swift
// UIKit
let field = JdCurrencyInputView(value: 12000, currency: "KRW", locale: "ko-KR")
field.onValueChange = { v in draft = v }     // 타이핑 중(숫자만 파싱)
field.onCommit = { v in save(v) }            // 편집 종료(통화 표기로 확정)
field.jd.layout {
    $0.leading.trailing.equalToSuperview().inset(JdToken.Space.s4)
}
```

| 파라미터 | 타입 | 기본값 | 의미 |
|---|---|---|---|
| `value` | `Binding<Double?>` (SwiftUI) / `Double?` (UIKit) | UIKit `nil` | 금액(빈 값 = nil) |
| `currency` | `String` | `"KRW"` | ISO 통화 코드(소수 자릿수 결정) |
| `locale` | `String` | `"ko-KR"` | 구분자·기호 로케일(결정성 위해 상수) |
| `size` | `JdControlSize` | `.md` | 높이 32/40/48 |
| `isError` | `Bool` | `false` | 테두리 danger |
| `placeholder` | `String` | `""` | 안내 문구 |
| `accessibilityLabel` | `String?` | `nil` | 필드 낭독 라벨 |

- UIKit 프로퍼티: `value` · `currency` · `locale` · `isError` · `placeholder` · `isEnabled` ·
  `onValueChange: ((Double?) -> Void)?` · `onCommit: ((Double?) -> Void)?`.
- 낭독 값은 편집 중이라도 항상 통화 표기다("얼마인지"가 들려야 한다). 통화별 소수 규칙은 Core에 위임.

---

## JdPhoneInput

국가 코드 선택 + 전화번호 입력. **마스킹(하이픈)은 전부 Core `JdPhoneMask.format`가 만든다** —
`value`는 웹과 같이 **숫자만** 보관한다(하이픈은 표시 전용). 지원 국가는 KR·US·JP.

```swift
// SwiftUI — 값과 국가 둘 다 바인딩
struct PhoneField: View {
    @State private var phone = ""                  // 숫자만: "01012345678"
    @State private var country: JdPhoneCountry = .kr

    var body: some View {
        JdPhoneInput(value: $phone, country: $country, size: .md,
                     accessibilityLabel: "휴대폰 번호")
        // 표시는 "010-1234-5678", 국제 표기는 JdPhoneMask.fullNumber(phone, country: country)
    }
}
```

```swift
// UIKit — 국가는 프로퍼티 + onCountryChange
let field = JdPhoneInputView(value: "", country: .kr)
field.onValueChange = { digits in draft = digits }      // 숫자만
field.onCommit = { digits in save(digits) }
field.onCountryChange = { c in print(c.dialCode) }      // 웹 jd-change(detail.country) 동형
let intl = field.fullNumber                              // "+82 1012345678"
field.jd.layout {
    $0.leading.trailing.equalToSuperview().inset(JdToken.Space.s4)
}
```

| 파라미터 | 타입 | 기본값 | 의미 |
|---|---|---|---|
| `value` | `Binding<String>` (SwiftUI) / `String` (UIKit) | UIKit `""` | 숫자만 보관(대입 시에도 숫자만 남김) |
| `country` | `Binding<JdPhoneCountry>` (SwiftUI) / `JdPhoneCountry` (UIKit) | UIKit `.kr` | 국가(dialCode·그룹 규칙) |
| `size` | `JdControlSize` | `.md` | 높이 32/40/48 |
| `isError` | `Bool` | `false` | 테두리 danger |
| `accessibilityLabel` | `String?` | `nil` | 필드 낭독 라벨(기본 "전화번호") |

- UIKit 프로퍼티: `value` · `country` · `isError` · `isEnabled` · `fullNumber`(읽기 전용) ·
  `onValueChange: ((String) -> Void)?` · `onCommit: ((String) -> Void)?` ·
  `onCountryChange: ((JdPhoneCountry) -> Void)?`.
- 국가 선택은 시스템 Picker(SwiftUI `.menu`) / UIMenu(UIKit)에 위임. 낭독 값은 국제 표기(국가번호 포함).
  마스킹 그룹은 Core가 단일 소스(KR `[3,4,4]` · US `[3,3,4]` · JP `[3,4,4]`).

---

## JdPasswordInput

표시 토글(눈 아이콘) + 강도 게이지 + 규칙 체크리스트. **강도·규칙 판정은 전부 Core
`JdPasswordStrength.evaluate`가 단일 소스다**(규칙 5종: 길이·대문자·소문자·숫자·특수문자, 강도 4단).

```swift
// SwiftUI
struct PasswordField: View {
    @State private var pw = ""

    var body: some View {
        JdPasswordInput(text: $pw,
                        placeholder: "비밀번호",
                        showsStrength: true,        // 강도 막대 + 라벨(취약/보통/양호/강력)
                        showsRules: true,           // 규칙 체크리스트
                        accessibilityLabel: "비밀번호")
    }
}
```

```swift
// UIKit
let field = JdPasswordInputView(text: "", placeholder: "비밀번호",
                                showsStrength: true, showsRules: true)
field.onTextChange = { text in draft = text }
field.onCommit = { text in submit(text) }
let level = field.strength.level          // .weak / .fair / .good / .strong (판정은 Core)
field.jd.layout {
    $0.leading.trailing.equalToSuperview().inset(JdToken.Space.s4)
}
```

| 파라미터 | 타입 | 기본값 | 의미 |
|---|---|---|---|
| `text` | `Binding<String>` (SwiftUI) / `String` (UIKit) | UIKit `""` | 비밀번호 값 |
| `placeholder` | `String` | `""` | 안내 문구 |
| `size` | `JdControlSize` | `.md` | 높이 32/40/48 |
| `isError` | `Bool` | `false` | 테두리 danger + 낭독 "오류" |
| `showsStrength` | `Bool` | `false` | 강도 막대 + 라벨(빈 값엔 숨김) |
| `showsRules` | `Bool` | `false` | 규칙 체크리스트 |
| `accessibilityLabel` | `String?` | `nil` | 필드 낭독 라벨 |

- UIKit 프로퍼티: `text` · `placeholder` · `isError` · `showsStrength` · `showsRules` · `isEnabled` ·
  `strength: JdPasswordStrength`(읽기 전용) · `onTextChange` · `onCommit`.
- 강도 막대 색은 `tone`(JdSeverity)을 `JdSeverityBadgeSpec`에 넘겨 재사용(색 어휘를 새로 만들지 않음).
  빈 값엔 강도를 매기지 않는다(웹 level "none" 동형). 강도 막대는 장식, 문구가 상태를 말한다.

---

## JdPinInput

자릿수 분할 코드 입력(핀/인증번호). **OTP 변형은 별도 타입이 아니라 이 컴포넌트의 설정**이다:
`alphanumeric: false` + 내부적으로 `.oneTimeCode` 자동완성이 붙어 문자 메시지 코드를 자동 채운다.
정리·포커스 인덱스·완료 판정은 전부 Core `JdPinRules`다.

```swift
// SwiftUI — onComplete는 init 인자
struct OTPField: View {
    @State private var code = ""

    var body: some View {
        // OTP: 숫자 6자리 + 자동완성(설정 변형 — 별도 타입 아님)
        JdPinInput(value: $code, length: 6, alphanumeric: false) { completed in
            verify(completed)
        }
        // 마스킹 핀(●):
        JdPinInput(value: $code, length: 4, masked: true)
    }
}
```

```swift
// UIKit — onComplete는 프로퍼티(init 인자 아님)
let pin = JdPinInputView(value: "", length: 6, masked: false, alphanumeric: false)
pin.onValueChange = { v in draft = v }
pin.onComplete = { completed in verify(completed) }   // length 채워지면 발화
pin.jd.layout { $0.center.equalToSuperview() }
```

| 파라미터 | 타입 | 기본값 | 의미 |
|---|---|---|---|
| `value` | `Binding<String>` (SwiftUI) / `String` (UIKit) | UIKit `""` | 입력된 코드 |
| `length` | `Int` | `6` | 칸 수 |
| `masked` | `Bool` | `false` | true면 "●"로 가림 |
| `alphanumeric` | `Bool` | `false` | true면 영숫자, false면 숫자만(+ OTP 자동완성) |
| `isError` | `Bool` | `false` | 테두리 danger |
| `accessibilityLabel` | `String?` | `nil` | 낭독 라벨(기본 "인증 번호 입력") |
| `onComplete` | `((String) -> Void)?` | `nil` | **SwiftUI만 init 인자**, UIKit은 프로퍼티 |

- UIKit 프로퍼티: `value` · `length` · `masked` · `alphanumeric` · `isError` · `isEnabled` ·
  `onValueChange: ((String) -> Void)?` · `onComplete: ((String) -> Void)?`.
- **값을 쥔 입력 필드는 하나**이고 칸은 파생 표시다(칸별 필드는 Backspace·붙여넣기·마스킹이 깨진다).
  붙여넣기 한 번에 전체가 채워지고 접근성 요소도 하나로 합쳐진다(값 = "N자리 입력됨").

---

## JdIconButton

아이콘 전용 버튼. 아이콘은 SF Symbols 이름(`systemImage`)으로 넘긴다. **`accessibilityLabel`이
init 인자로 강제된다** — 라벨 없는 init이 없어 컴파일 타임에 접근성이 보장된다.

```swift
// SwiftUI — action은 후행 클로저
struct Toolbar: View {
    var body: some View {
        HStack(spacing: JdGap.sm.value) {
            JdIconButton(systemImage: "heart", accessibilityLabel: "좋아요",
                         variant: .ghost, size: .md) { toggleLike() }
            JdIconButton(systemImage: "square.and.arrow.up", accessibilityLabel: "공유",
                         variant: .outline) { share() }
            JdIconButton(systemImage: "plus", accessibilityLabel: "추가",
                         variant: .filled, size: .lg) { add() }
        }
    }
}
```

```swift
// UIKit — 탭은 onTap 프로퍼티
let button = JdIconButtonView(systemImage: "heart",
                              accessibilityLabel: "좋아요",
                              variant: .ghost, size: .md)
button.onTap = { toggleLike() }
button.jd.layout { $0.top.trailing.equalToSuperview().inset(JdToken.Space.s2) }
```

| 파라미터 | 타입 | 기본값 | 의미 |
|---|---|---|---|
| `systemImage` | `String` | — | SF Symbol 이름 |
| `accessibilityLabel` | `String` | — | **필수**(라벨 없는 init 없음) |
| `variant` | `JdIconButtonVariant` | `.ghost` | ghost · outline · filled |
| `size` | `JdIconButtonSize` | `.md` | 변 24/28/32/40(xs/sm/md/lg) |
| `action` | `@escaping () -> Void` | — | **SwiftUI만 init 인자** |

- UIKit: 탭은 `onTap: (() -> Void)?` 프로퍼티, 활성은 `isEnabled`(UIControl 상속).
- **히트 타깃 각주**: 네 크기 모두 HIG 최소 44pt에 미달한다(3플랫폼 패리티로 웹 크기 승계).
  단독 배치되는 주요 액션에는 `.lg` + 소비자 측 여백(터치 영역 확장)을 권한다. Dynamic Type에서는
  intrinsic이 자라 실질 타깃도 커진다. 버튼 안 아이콘 크기는 `JdIconSize`가 아니라 변의 0.5배다.
