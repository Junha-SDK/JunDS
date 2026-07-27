# JunDS iOS — 사용법 (USAGE)

구현된 iOS 컴포넌트의 **SwiftUI · UIKit 사용법**. 실제 소스의 public 표면과 1:1 대응한다.
소비자는 항상 `import JunDS` 하나로 3계층(Core·UIKit·SwiftUI)을 전부 얻는다(04 §2.2).

- 컴포넌트가 아닌 것(레이아웃 컨테이너·시스템 API·훅)의 조립법은 [RECIPES.md](RECIPES.md).
- 명명 규칙(04 §3): SwiftUI = `Jd<이름>`(View 구조체), UIKit = `Jd<이름>View`(UIView 서브클래스)
  또는 `Jd<이름>Controller`(프레젠테이션). 옵션 열거형은 Core에 1회 정의돼 양 계층이 공유한다.

```swift
import JunDS   // 이 한 줄로 JunDSCore + JunDSUIKit + JunDSSwiftUI 전부
```

## 목차

| 문서 | 범위 |
|---|---|
| [USAGE/01-layout-typography.md](USAGE/01-layout-typography.md) | Text · Heading · Divider · Stack · FlowLayout · Spacer · AppShell · Show/Hide |
| [USAGE/02-form-inputs.md](USAGE/02-form-inputs.md) | Toggle · Checkbox · RadioGroup · Slider · RangeSlider · Label · TextField · Textarea · NumberInput · CurrencyInput · PhoneInput · PasswordInput · PinInput · IconButton |
| [USAGE/03-display.md](USAGE/03-display.md) | Badge · Tag · Avatar · Spinner · StatusDot · SeverityBadge · BatteryIndicator · Kbd · KeyCap |
| [USAGE/04-text-actions.md](USAGE/04-text-actions.md) | Button · Code · Mark · Highlight · Link · MentionChip · Hashtag · Bookmark/Like/Follow/Star/Copy/BackTop/FileUpload |
| [USAGE/05-overlays-feedback.md](USAGE/05-overlays-feedback.md) | Modal · Drawer · BottomSheet · ActionSheet · AlertDialog · Alert · Banner · Callout · Notification · EmptyState · Result · Toast · Snackbar |
| [USAGE/06-finance.md](USAGE/06-finance.md) | LivePctText · LivePctBadge · LivePriceText · LiveStatusDot · PriceBadge · HotPctChip (+ 추세 판정 2규칙 · `JdFinanceTheme` 색 override) |
| [RECIPES.md](RECIPES.md) | 레시피(레이아웃 컨테이너·아이콘·이미지) + Behaviors(hooks → iOS) |

## 공통 규약

- **색·치수 토큰**: 모든 컴포넌트가 `JdToken`(색·간격·radius·타이포)과 `JdGap`(named gap)만 쓴다.
  소비자도 같은 토큰으로 주변을 맞추면 시각 일관성이 선다 — 예: `JdToken.Color.primary.color`(SwiftUI) /
  `.uiColor`(UIKit), `JdGap.md.value`(=16), `JdToken.Space.s4`(=16).
- **Dynamic Type**: 모든 텍스트가 자동 스케일된다. UIKit은 `adjustsFontForContentSizeCategory = true`가
  내장이라 소비자가 따로 켤 필요 없다.
- **다크 모드**: `JdDynamicColor`가 trait 클로저로 라이트/다크를 자동 전환한다 — 재렌더 불필요.
- **Reduce Motion**: 애니메이션은 `JdMotion` 경로라 시스템 설정을 존중한다(정지/즉시 전환).
- **접근성**: 아이콘 전용 컨트롤은 라벨이 init 인자로 강제된다. 상태는 트레이트/accessibilityValue로
  노출된다(문자열 조합 없음).
- **UIKit 콜백**: 웹의 커스텀 이벤트는 클로저 프로퍼티(`onChange`·`onTap`·`onDismiss` 등)로 번역된다.
  프로그램 대입(`view.isOn = true`)은 콜백을 발화시키지 않는다(사용자 조작만) — 웹 계약과 동일.
