# JunDS iOS — primitives 잔여 27종 API 계약 (2026-07-24)

**Core는 이미 작성돼 빌드 통과했고 그것이 값·규칙의 정본이다.** 구현 전 필독:
`packages/ios/Sources/JunDSCore/Specs/JdPrimitiveExtras.swift`
(+ 기존 `JdPrimitiveOptions.swift` · `JdControlSpecs.swift` · `JdDisplaySpecs.swift`)

이번 배치의 성격: **"새 컴포넌트가 답이 아닌" 것이 다수다.** 정찰 결과 판정을 그대로 따른다 —
시스템 API가 이미 하는 일을 새 타입으로 감싸지 않는다(04 §10 번역 원칙). 아래 표가 계약이다.

| 웹 | iOS 판정 | 산출물 |
|---|---|---|
| **VisuallyHidden** | 컴포넌트 없음 | RECIPES.md 항목만(`.accessibilityLabel` 등). ⚠️ `.hidden()`/`isHidden`은 AT에서도 사라지므로 금지 |
| **AnnouncerProvider** | Core 래퍼(기구현) | `JdAnnouncer.announce(_:priority:)` — 뷰 없음. 데모만 |
| **NumberFormatter** | Core 함수(기구현) | `JdNumberFormat.string(...)` — 뷰 없음. 데모만 |
| **ScrollArea** | 레시피 | ScrollView 그 자체. RECIPES.md + 데모 |
| **AspectRatio** | 별칭 | AspectRatioBox 레시피와 동일. 데모만 |
| **Icon** | 레시피 | SF Symbols + `JdIconSize.side`. RECIPES.md + 데모 |
| **Image** | 레시피 | `AsyncImage` phase(로딩/에러 폴백). RECIPES.md + 데모 |
| **Motion** | 모디파이어 | `.jdMotion(_:delay:)` — Reduce Motion 시 즉시 최종 상태 |
| **Code · Mark · Highlight · Link · MentionChip · Hashtag** | 텍스트 런 | 모디파이어/뷰 소품(아래) |
| **CopyButton · BackTop · FileUpload** | 시스템 API + 작은 버튼 | 아래 |
| **BookmarkButton · LikeButton · FollowButton · StarRating** | 실컴포넌트 | 아래 |
| **NumberInput · CurrencyInput · PhoneInput · PasswordInput · PinInput · OTPInput** | 실컴포넌트 | 아래 |

공통 규칙(1·2차 배치와 동일): 서드파티 0 · 계층 상호 import 금지(DEC-010) · 색·치수는
Core 스펙/JdToken/JdGap만 · Dynamic Type은 `JdFontBridge.scaledFont(…, compatibleWith:)` /
`JdSwiftUIFont.scaled(…, category:)` 경유 · UIKit은 `adjustsFontForContentSizeCategory = true`
+ `traitCollectionDidChange` 재적용 · 아이콘은 SF Symbols · 애니메이션은 `JdMotion.duration` 경유.
**Core에 있는 계산을 렌더에서 재구현 금지**(포맷·마스킹·강도·하이라이트·클램프).

---

## A. 입력 계열 (실컴포넌트 6)

```swift
// NumberInput — 웹 램프는 컨트롤(32/40/48)이 아니라 JdNumberInputSize(32/36/44)다.
public struct JdNumberInput: View {
    public init(value: Binding<Double?>, min: Double? = nil, max: Double? = nil, step: Double = 1,
                size: JdNumberInputSize = .md, isError: Bool = false, hidesControls: Bool = false,
                placeholder: String = "", accessibilityLabel: String? = nil)
    // ⚠️ 클램프 타이밍 계약: 타이핑 중 클램프 금지, 커밋(포커스 종료)·스텝 버튼에서만
    //    JdNumberInputRules.clamp/stepped 호출. 매 키 입력 클램프는 v2 버그의 재도입이다.
    // a11y: 컨트롤 전체를 .accessibilityAdjustable로(스텝 버튼 2개를 따로 노출하지 않는다 —
    //       웹이 버튼에 tabIndex=-1을 준 것과 같은 의도)
}
public final class JdNumberInputView: UIView { … value: Double?, onValueChange, onCommit }

// CurrencyInput — 포맷은 전부 JdNumberFormat.string(style: .currency, …)
public struct JdCurrencyInput: View {
    public init(value: Binding<Double?>, currency: String = "KRW", locale: String = "ko-KR",
                size: JdControlSize = .md, isError: Bool = false, placeholder: String = "",
                accessibilityLabel: String? = nil)
    // 포커스 중엔 원시 숫자, 포커스 해제 시 포맷 문자열로 전환(웹 동형). keyboardType .decimalPad
}
public final class JdCurrencyInputView: UIView { … }

// PhoneInput — 마스킹은 전부 JdPhoneMask.format / fullNumber
public struct JdPhoneInput: View {
    public init(value: Binding<String>, country: Binding<JdPhoneCountry>,
                size: JdControlSize = .md, isError: Bool = false, accessibilityLabel: String? = nil)
    // 국가 선택은 시스템 Picker(.menu). keyboardType .phonePad
}
public final class JdPhoneInputView: UIView { … UIMenu 기반 국가 선택 }

// PasswordInput — 강도·규칙은 전부 JdPasswordStrength.evaluate
public struct JdPasswordInput: View {
    public init(text: Binding<String>, placeholder: String = "", size: JdControlSize = .md,
                isError: Bool = false, showsStrength: Bool = false, showsRules: Bool = false,
                accessibilityLabel: String? = nil)
    // 표시/숨김 토글은 SF "eye"/"eye.slash" + .textContentType(.password)
    // 강도 막대 색은 JdPasswordStrength.tone(JdSeverity) → JdSeverityBadgeSpec 색 재사용
}
public final class JdPasswordInputView: UIView { … }

// PinInput (+ OTPInput은 **같은 타입의 설정 변형**, 별도 컴포넌트 아님)
public struct JdPinInput: View {
    public init(value: Binding<String>, length: Int = 6, masked: Bool = false,
                alphanumeric: Bool = false, isError: Bool = false,
                accessibilityLabel: String? = nil, onComplete: ((String) -> Void)? = nil)
    // 셀 표시·정리·포커스 인덱스·완료 판정은 전부 JdPinRules. @FocusState<Int?>로 이동.
    // 붙여넣기 한 번에 전체 채움 지원(JdPinRules.sanitize가 그대로 처리).
    // a11y: 셀 N개를 각각 노출하지 않고 **컨트롤 하나**로 합쳐 값=입력된 자리수를 읽는다.
    // OTP 변형: alphanumeric=false + .textContentType(.oneTimeCode)(자동완성) — 데모에서 시연.
}
public final class JdPinInputView: UIView { … }
```

## B. 버튼 계열 (실컴포넌트 4 + 시스템 API 3)

```swift
// BookmarkButton / LikeButton — 심볼 토글. 같은 골격, 심볼·색만 다르다.
public struct JdBookmarkButton: View {
    public init(isBookmarked: Binding<Bool>, size: JdIconButtonSize = .md, isEnabled: Bool = true)
    // 심볼 "bookmark.fill"/"bookmark", 켜짐 색 JdToken.Color.warning
    // a11y: .accessibilityAddTraits(isBookmarked ? [.isButton, .isSelected] : .isButton)
    //       라벨은 "북마크"/"북마크 해제"(웹 aria-pressed + 라벨 교체 동형)
}
public struct JdLikeButton: View {
    public init(isLiked: Binding<Bool>, count: Int? = nil, size: JdIconButtonSize = .md, isEnabled: Bool = true)
    // 심볼 "heart.fill"/"heart", 켜짐 색 JdToken.Color.danger
    // count는 JdNumberFormat.compactCount로 표기(직접 포맷 금지)
}
public final class JdBookmarkButtonView: UIControl { … }
public final class JdLikeButtonView: UIControl { … }

// FollowButton — 두 변형 캡슐 버튼(팔로우/팔로잉, 호버 없는 iOS라 눌림만)
public struct JdFollowButton: View {
    public init(isFollowing: Binding<Bool>, size: JdControlSize = .md, isEnabled: Bool = true,
                followLabel: String = "팔로우", followingLabel: String = "팔로잉")
    // 미팔로우 = primary 채움, 팔로잉 = secondary 외곽선(JdButtonSpec 재사용)
}
public final class JdFollowButtonView: UIControl { … }

// StarRating — iOS에 시스템 대응이 없는 진짜 신규 컴포넌트
public struct JdStarRating: View {
    public init(value: Binding<Double>, max: Int = 5, size: JdIconSize = .md,
                isReadOnly: Bool = false, accessibilityLabel: String = "별점")
    // 별 상태는 JdStarRating(Core).fill(index:value:), 탭 값은 .value(forTappedIndex:current:)
    // ⚠️ a11y: 별 N개를 각각 버튼으로 노출하지 말 것 — **컨트롤 하나**에 .adjustable을 주고
    //    increment/decrement로 0.5씩 움직인다(VoiceOver로 별점 주기가 가능해야 한다)
}
public final class JdStarRatingView: UIControl { … }

// CopyButton — 복사는 시스템 API(UIPasteboard). 버튼만 얇게.
public struct JdCopyButton: View {
    public init(_ text: String, label: String = "복사", copiedLabel: String = "복사됨",
                variant: JdButtonVariant = .secondary, size: JdControlSize = .md)
    // 복사 후 2초간 copiedLabel + "checkmark" 심볼(웹 동형). 타이머는 Task.sleep 취소 가능하게.
    // a11y: 복사 시 JdAnnouncer.announce(copiedLabel) — 웹이 라벨 교체로만 알리던 것을 보정
}
public final class JdCopyButtonView: UIControl { … }

// BackTop — 스크롤은 시스템(ScrollViewReader/setContentOffset), 버튼만 컴포넌트
public struct JdBackTopButton: View {
    public init(action: @escaping () -> Void, label: String = JdBackTop.defaultLabel)
    // 40pt 원형, card 배경 + border 1pt + shadow lg, SF "arrow.up"
    // 가시성 판정은 소비자가 JdBackTop.shouldShow(scrollY:threshold:)로 (Core 재사용)
}
public final class JdBackTopButtonView: UIControl { … }

// FileUpload — 피커는 반드시 시스템(.fileImporter / UIDocumentPickerViewController).
// 컴포넌트는 **드롭존 외형 + 선택된 파일 목록**만 담당한다.
public struct JdFileUploadZone: View {
    public init(description: String = "파일을 선택하세요", isError: Bool = false,
                isEnabled: Bool = true, fileNames: [String] = [], onTap: @escaping () -> Void)
    // 점선 테두리(dash) + 아이콘 + 설명. 실제 선택은 소비자가 .fileImporter로 붙인다(데모가 시연).
}
public final class JdFileUploadZoneView: UIControl { … }
```

## C. 텍스트 런 계열 (모디파이어·소품 6)

```swift
// Code — 인라인 코드 칩
public struct JdCode: View {
    public init(_ text: String, variant: JdCodeVariant = .default, size: JdControlSize = .md)
    // mono 폰트(JdSwiftUIFont.scaledMono / JdFontBridge.scaledMonoFont), 배경 = variant별
    // *Light 토큰, 전경 = 해당 시맨틱 색, radius sm, padding 2/6
}
public final class JdCodeView: UILabel { … }

// Mark — 형광펜
public struct JdMark: View {
    public init(_ text: String, color: JdMarkColor = .yellow, underline: Bool = false)
}
public final class JdMarkView: UILabel { … }

// Highlight — 검색어 강조. 구간 계산은 JdHighlight.segments (재구현 금지)
public struct JdHighlight: View {
    public init(_ text: String, query: String, color: JdMarkColor = .yellow)
    // 세그먼트를 Text 연결로 합성(AttributedString도 가능). a11y 라벨은 원문 전체 1개.
}
public final class JdHighlightView: UILabel { … NSAttributedString }

// Link — 실제 열기는 시스템(SwiftUI Link / UIApplication.open)
public struct JdLink: View {
    public init(_ text: String, destination: URL?, variant: JdLinkVariant = .default,
                underline: Bool = true, isExternal: Bool = false)
    // isExternal이면 뒤에 "arrow.up.right" 심볼 + a11y 라벨에 "새 창에서 열림" 합류
}
public final class JdLinkView: UIControl { … }

// MentionChip / Hashtag — 표시 문자열은 Core(JdMentionChip.displayText / JdHashtag)
public struct JdMentionChip: View {
    public init(handle: String, label: String = "", isVerified: Bool = false,
                destination: URL? = nil)
}
public struct JdHashtag: View {
    public init(tag: String, count: Int? = nil, isTrending: Bool = false, destination: URL? = nil)
}
// UIKit: JdMentionChipView / JdHashtagView (UILabel 기반, 링크는 onTap 클로저)
```

## D. 미디어·모션 (모디파이어·레시피 3)

```swift
// Motion — 등장 애니메이션 모디파이어
public extension View {
    /// Reduce Motion이면 애니메이션 없이 즉시 최종 상태(04 §7.3)
    func jdMotion(_ preset: JdMotionPreset, delay: TimeInterval = 0) -> some View
}
// Image / Icon / ScrollArea / AspectRatio / VisuallyHidden → RECIPES.md 항목 + 데모만
```

## E. 테스트 요구

- **Core 전수(가장 중요)**: `JdNumberFormat`(4 스타일 · decimals nil/지정 · percent ×100 ·
  compactCount 경계 999/1000/1050/9999/10000/1억), `JdNumberInputRules`(nil 경계 · 스텝 ·
  canIncrement/Decrement 경계), `JdPinRules`(sanitize 필터·자르기 · cellText 마스킹 · focusIndex ·
  isComplete), `JdPhoneMask`(KR/US/JP 부분 입력·초과 입력 · fullNumber 선행 0), `JdPasswordStrength`
  (규칙 4종 각각 · 점수 경계 · tone), `JdHighlight.segments`(무매치·다중 매치·대소문자 무시·빈 쿼리),
  `JdStarRating`(fill 0.5 경계 · 같은 별 재탭 반값), `JdBackTop.shouldShow`(경계 엄격 초과).
- UIKit 뷰: init 기본 상태 · 프로퍼티 didSet 반영 · 접근성 표면(라벨/트레이트/값).
  ⚠️ `sendActions(for:)`는 이 하네스에서 무동작이다 — 기존 `jdSendActions(for:)` 헬퍼를 쓸 것
  (`Tests/JunDSUIKitTests/Support/JdControlActionDispatch.swift`).
- SwiftUI: `UIHostingController` 호스팅 스모크(sizeThatFits > 0).

## F. 데모

`demo/JunDSDemo.swiftpm/Demos/<LedgerId>Demo.swift`, ledger id 정확히.
레시피형은 `recipe:` 인자에 스니펫. `DemoRegistry.all` 등록은 **통합자만** 한다.
`DemoState`를 읽는 free function엔 반드시 `@MainActor`. View 준수 타입에 `body` 저장 프로퍼티 금지.
