# JunDS iOS — 사용법: 텍스트 런 · 액션 버튼 (14종)

## 목적

문단에 얹히는 **텍스트 런**(코드·형광펜·검색어 강조·링크·멘션·해시태그)과, 탭으로 값을
바꾸는 **액션 버튼**(버튼·북마크·좋아요·팔로우·별점·복사·상단이동·업로드존)의 SwiftUI/UIKit
사용법. 각 컴포넌트의 실제 public init을 소스에서 그대로 옮겼다.

### 텍스트 런 (6)

| 컴포넌트           | SwiftUI           | UIKit                 | 웹 동형           |
| ------------------ | ----------------- | --------------------- | ----------------- |
| 인라인 코드 칩     | `JdCode`          | `JdCodeView`          | `jd-code`         |
| 형광펜 강조        | `JdMark`          | `JdMarkView`          | `jd-mark`         |
| 검색어 강조        | `JdHighlightText` | `JdHighlightTextView` | `jd-highlight`    |
| 앵커 링크          | `JdLink`          | `JdLinkView`          | `jd-link`         |
| 멘션 칩 `@handle`  | `JdMentionLabel`  | `JdMentionLabelView`  | `jd-mention-chip` |
| 해시태그 칩 `#tag` | `JdHashtagLabel`  | `JdHashtagLabelView`  | `jd-hashtag`      |

### 액션 · 버튼 (8)

| 컴포넌트             | SwiftUI            | UIKit                  | 웹 동형              |
| -------------------- | ------------------ | ---------------------- | -------------------- |
| 기본 버튼            | `JdButton`         | `JdButtonView`         | `jd-button`          |
| 북마크 토글          | `JdBookmarkButton` | `JdBookmarkButtonView` | `jd-bookmark-button` |
| 좋아요 토글 + 카운트 | `JdLikeButton`     | `JdLikeButtonView`     | `jd-like-button`     |
| 팔로우 토글          | `JdFollowButton`   | `JdFollowButtonView`   | `jd-follow-button`   |
| 별점                 | `JdStarRating`     | `JdStarRatingView`     | `jd-star-rating`     |
| 복사 버튼            | `JdCopyButton`     | `JdCopyButtonView`     | `jd-copy-button`     |
| 상단 이동 버튼       | `JdBackTopButton`  | `JdBackTopButtonView`  | `jd-back-top`        |
| 파일 업로드존        | `JdFileUploadZone` | `JdFileUploadZoneView` | `jd-file-upload`     |

## 공통 규약

- **import는 하나**: `import JunDS` 가 Core·SwiftUI·UIKit을 모두 재수출한다.
- **색·치수는 토큰만**: `JdToken`(색·간격·반경) / `JdGap`(간격 이름 층) / `JdIconSize`·`JdControlSize`·`JdIconButtonSize`(치수 축). 리터럴 신설 금지.
- **상태 토글의 표면이 계층마다 다르다**:
  - SwiftUI = `@Binding`(`isBookmarked`/`isLiked`/`isFollowing`/`value`). 뷰가 곧 진실의 반영.
  - UIKit = 설정 가능한 값 프로퍼티 + `onChange`/`onValueChange`/`onCopy` 콜백. **프로그램 변경은 콜백을 발화시키지 않는다**(사용자 조작 전용 — 웹 `jd-change` 동형).
- **링크류의 열기 표면도 다르다**: SwiftUI 링크(Link·Mention·Hashtag)는 `destination: URL?`을 받아 시스템 `Link`/`openURL`이 연다. UIKit은 `onTap: (() -> Void)?` 클로저로 열기·라우팅을 소비자에게 넘긴다.
- **UIKit `isEnabled`는 UIControl 상속**이라 대개 init 인자가 아니다(`view.isEnabled = false`로 끈다). 일부 저장 프로퍼티는 UIKit이 이미 점유한 이름을 피해 개명됐다(`codeSize`·`hashtag`·`zoneDescription`·`content`) — **init 인자 라벨은 계약대로 유지**된다.
- **판정·포맷은 Core 소유**: 하이라이트 매칭·별점 채움·카운트 축약·스크롤 가시성은 렌더 계층이 재구현하지 않고 Core 함수를 호출한다(04 §4.2).

---

# 텍스트 런

## JdCode — 인라인 코드 칩

mono 폰트 + variant별 옅은 배경의 한 줄 코드 칩. 문장 안에 `함수명`·명령어를 박을 때 쓴다.

```swift
// SwiftUI
JdCode("npm install")                         // 기본
JdCode("git push --force", variant: .danger)  // 위험 명령 강조
JdCode("SELECT *", variant: .primary, size: .lg)
```

```swift
// UIKit
let code = JdCodeView("npm install", variant: .primary, size: .md)
code.variant = .success       // 다시 그린다
code.codeSize = .lg           // ⚠️ size 프로퍼티는 UILabel API와 겹쳐 codeSize로 노출
```

| 파라미터  | 타입            | 기본값     | 설명                                           |
| --------- | --------------- | ---------- | ---------------------------------------------- |
| `_ text`  | `String`        | —          | 표시 문자열                                    |
| `variant` | `JdCodeVariant` | `.default` | `default·primary·success·warning·danger` (5종) |
| `size`    | `JdControlSize` | `.md`      | `sm·md·lg` — 폰트 11/12/14, 패딩 램프 결정     |

**특이사항**

- 배경 = variant별 `*Light` 토큰(default는 `cardHover`), 전경 = 해당 시맨틱 색. mono 폰트는 `JdFontBridge.scaledMono`.
- UIKit은 `numberOfLines = 1`(한 줄 칩) — 인라인 코드라 줄바꿈하지 않는다.
- 웹 `.jd-code`의 1pt 테두리는 대응 토큰이 없어 두 계층 모두 **생략**돼 있다(스펙 결손, notes 보고분).

## JdMark — 형광펜 강조

문단 서체를 **상속**하는 형광펜 런. 배경형(기본)과 밑줄형 두 표면.

```swift
// SwiftUI — 폰트 미지정: 둘러싼 Text 문단의 서체를 그대로 받는다
JdMark("여기가 핵심")                        // 노랑 배경형
JdMark("밑줄만", color: .blue, underline: true)
```

```swift
// UIKit — UILabel엔 상속 서체가 없어 본문 md를 기본으로 쓴다
let mark = JdMarkView("여기가 핵심", color: .yellow)
mark.content = "바뀐 문구"     // 원문 교체(attributedText 재구성)
mark.underline = true          // 배경형 ↔ 밑줄형 전환
```

| 파라미터    | 타입          | 기본값    | 설명                                         |
| ----------- | ------------- | --------- | -------------------------------------------- |
| `_ text`    | `String`      | —         | 강조 문자열                                  |
| `color`     | `JdMarkColor` | `.yellow` | `yellow·green·blue·pink·purple` (5종)        |
| `underline` | `Bool`        | `false`   | `true`면 배경 없이 밑줄 색만 팔레트를 따른다 |

**특이사항**

- 팔레트는 Core `JdTagSpec` 재사용: green/blue/purple은 동명, yellow→orange·pink→red는 인접 근사(전용 `JdMarkSpec` 미존재, notes 보고분).
- 밑줄 두께는 SwiftUI가 노출하지 않아 근사, UIKit은 `NSUnderlineStyle.thick`로 웹 2px에 맞춘다.

## JdHighlightText / JdHighlightTextView — 검색어 강조

원문에서 `query`와 일치하는 구간만 형광펜으로 칠한다. **매칭은 전부 Core `JdHighlight.segments`** — 대소문자 무시 부분 문자열 전수 매칭.

```swift
// SwiftUI
JdHighlightText("SwiftUI로 만든 디자인 시스템", query: "디자인")
JdHighlightText(row.title, query: searchText, color: .green)
```

```swift
// UIKit
let hl = JdHighlightTextView("SwiftUI로 만든 디자인 시스템", query: "디자인")
hl.query = searchText     // 입력마다 갱신 — 재매칭은 Core가 한다
hl.content = row.title
```

| 파라미터 | 타입          | 기본값    | 설명                                      |
| -------- | ------------- | --------- | ----------------------------------------- |
| `_ text` | `String`      | —         | 원문 전체                                 |
| `query`  | `String`      | —         | 강조어. 빈 문자열이면 전체가 비매치 1구간 |
| `color`  | `JdMarkColor` | `.yellow` | 매치 구간 형광펜 색                       |

**특이사항**

- ⚠️ **타입명 주의**: Core에 이미 `enum JdHighlight`가 있어 SwiftUI 뷰는 `JdHighlightText`, UIKit 뷰는 `JdHighlightTextView`로 이름을 양보했다(Core 우선).
- 접근성: 매치/비매치로 쪼개 읽히지 않도록 **원문 전체를 라벨 1개**로 노출한다.

## JdLink / JdLinkView — 앵커 링크

텍스트 + 선택적 외부 아이콘. 실제 열기는 시스템이 한다. `destination`이 `nil`이면 링크가 아니라 그냥 텍스트다(웹 "href 없는 `<a>`" 동형 — 탭 순서·접근성에서 빠진다).

```swift
// SwiftUI — 시스템 Link → openURL
JdLink("문서 열기", destination: URL(string: "https://junds.dev"))
JdLink("외부 사이트", destination: url, isExternal: true)   // ↗ 아이콘 + "새 창에서 열림" 라벨
JdLink("밑줄 없이", destination: url, variant: .muted, underline: false)
```

```swift
// UIKit — 기본은 UIApplication.open, onTap을 주면 라우터가 가로챈다
let link = JdLinkView("문서 열기", destination: URL(string: "https://junds.dev"), isExternal: true)
link.onTap = { router.push(route) }   // ⚠️ 지정 시 destination 열기 대신 이 클로저만 실행
link.text = "바뀐 링크 문구"
```

| 파라미터          | 타입            | 기본값     | 설명                                          |
| ----------------- | --------------- | ---------- | --------------------------------------------- |
| `_ text`          | `String`        | —          | 링크 문구                                     |
| `destination`     | `URL?`          | —          | `nil`이면 비활성(그냥 텍스트)                 |
| `variant`         | `JdLinkVariant` | `.default` | `default·primary·muted` (3종)                 |
| `underline`       | `Bool`          | `true`     | 밑줄 표시                                     |
| `isExternal`      | `Bool`          | `false`    | 외부 링크(↗ 아이콘 + a11y 안내)               |
| `onTap` _(UIKit)_ | `(() -> Void)?` | `nil`      | 소비자 가로채기(라우터). destination보다 우선 |

**특이사항**

- ⚠️ Core `JdLinkVariant`는 `default/primary/muted`인데 웹 기준(`.jd-link { color: primary }`)을 지켜 **`default`와 `primary`가 같은 색**으로 결의된다(어휘 재심의는 Core 몫).
- `isExternal`이면 웹은 아이콘으로만 알리지만 iOS는 접근성 라벨에 `"새 창에서 열림"`(`JdLinkStyle.externalHint`)을 **합류**시켜 보정한다. 아이콘 자체는 장식(AT 무노출).

## JdMentionLabel / JdMentionLabelView — 멘션 칩 `@handle`

`@handle` 또는 표시 이름 + 선택적 인증 배지. 표시 문자열은 Core `JdMentionChip.displayText`(label이 비면 `"@handle"`로 폴백).

```swift
// SwiftUI — destination으로 프로필 링크
JdMentionLabel(handle: "junha")                                   // "@junha"
JdMentionLabel(handle: "junha", label: "전준하", isVerified: true)  // "전준하" + ✓
JdMentionLabel(handle: "junha", destination: URL(string: "app://user/junha"))
```

```swift
// UIKit — 열기는 onTap 클로저(소비자·라우터 몫)
let mention = JdMentionLabelView(handle: "junha", label: "전준하", isVerified: true)
mention.onTap = { router.openProfile("junha") }
mention.isVerified = false
```

| 파라미터                  | 타입            | 기본값  | 설명                                    |
| ------------------------- | --------------- | ------- | --------------------------------------- |
| `handle`                  | `String`        | —       | `@` 없는 핸들                           |
| `label`                   | `String`        | `""`    | 표시 이름. 비면 `"@handle"` 폴백        |
| `isVerified`              | `Bool`          | `false` | `checkmark.seal.fill` + `"인증됨"` 라벨 |
| `destination` _(SwiftUI)_ | `URL?`          | `nil`   | 프로필 링크                             |
| `onTap` _(UIKit)_         | `(() -> Void)?` | `nil`   | 탭 처리                                 |

**특이사항**

- ⚠️ **타입명 주의**: Core `enum JdMentionChip`과 충돌을 피해 뷰는 `JdMentionLabel`/`JdMentionLabelView`다.
- 인증 배지 ✓는 장식이고 의미는 a11y 라벨(`"…, 인증됨"`)이 싣는다. 색은 `primary`.

## JdHashtagLabel / JdHashtagLabelView — 해시태그 칩 `#tag`

`#tag` + 선택적 인기 불꽃 + 선택적 게시물 수. 표시·축약은 Core `JdHashtag.displayText`/`countText`.

```swift
// SwiftUI
JdHashtagLabel(tag: "SwiftUI")                                  // "#SwiftUI"
JdHashtagLabel(tag: "iOS", count: 12800, isTrending: true)     // 🔥 #iOS (1.3만)
JdHashtagLabel(tag: "design", destination: URL(string: "app://tag/design"))
```

```swift
// UIKit
let tag = JdHashtagLabelView(tag: "iOS", count: 12800, isTrending: true)
tag.onTap = { router.openTag("iOS") }
tag.count = 12801             // ⚠️ 저장 프로퍼티는 hashtag/count/isTrending (init 라벨은 tag:)
```

| 파라미터                  | 타입            | 기본값  | 설명                                       |
| ------------------------- | --------------- | ------- | ------------------------------------------ |
| `tag`                     | `String`        | —       | `#` 없는 태그                              |
| `count`                   | `Int?`          | `nil`   | 게시물 수. `nil`이면 미표시                |
| `isTrending`              | `Bool`          | `false` | `flame.fill`(warning) + `"인기 태그"` 라벨 |
| `destination` _(SwiftUI)_ | `URL?`          | `nil`   | 태그 링크                                  |
| `onTap` _(UIKit)_         | `(() -> Void)?` | `nil`   | 탭 처리                                    |

**특이사항**

- ⚠️ **타입명 주의**: Core `enum JdHashtag`과 충돌을 피해 뷰는 `JdHashtagLabel`/`JdHashtagLabelView`다. UIKit 저장 프로퍼티는 `tag`가 UIView 소유라 `hashtag`로 비켰다(init 인자 `tag:`는 유지).
- 카운트 숫자는 `JdHashtag.countText`(= `JdNumberFormat.compactCount`)가 만들고 괄호만 표기 규약(`(1.3만)`).

---

# 액션 · 버튼

## JdButton / JdButtonView — 기본 버튼

variant 4종 캡슐형 버튼. 로딩 시 스피너 + 입력 차단.

```swift
// SwiftUI — action 클로저를 init에서 받는다
JdButton("저장") { save() }
JdButton("삭제", variant: .danger, size: .lg) { delete() }
JdButton("전송 중", variant: .primary, loading: isSubmitting) { submit() }
```

```swift
// UIKit — 동작은 onTap 프로퍼티, 로딩은 isLoading 프로퍼티
let button = JdButtonView(title: "저장", variant: .primary, size: .md)
button.onTap = { save() }
button.isLoading = isSubmitting   // 스피너 시작 + 입력 차단 + a11y 값 "로딩 중"
button.isEnabled = false          // UIControl 상속
```

| 파라미터                | 타입              | 기본값     | 설명                                   |
| ----------------------- | ----------------- | ---------- | -------------------------------------- |
| `title` / `_ title`     | `String`          | —          | 버튼 라벨                              |
| `variant`               | `JdButtonVariant` | `.primary` | `primary·secondary·ghost·danger` (4종) |
| `size`                  | `JdControlSize`   | `.md`      | `sm·md·lg` — 높이 32/40/48             |
| `loading` / `isLoading` | `Bool`            | `false`    | 스피너 + 입력 차단                     |
| `action` _(SwiftUI)_    | `() -> Void`      | —          | 탭 동작                                |
| `onTap` _(UIKit)_       | `(() -> Void)?`   | `nil`      | 탭 동작                                |

**특이사항**

- ⚠️ SwiftUI는 `action`을 init 마지막 인자(trailing closure)로 받고, UIKit은 init에서 `title/variant/size`만 받고 `onTap`·`isLoading`·`title`·`variant`·`size`를 **설정 가능한 프로퍼티**로 노출한다.
- 웹의 `outline/link/xs` variant는 iOS 표면에서 제외됐다(DEC-013). 색·치수는 `JdButtonSpec.resolve`가 단일 소스.
- 높이는 `minHeight`만 두고 Dynamic Type XXXL에서 자라게 한다(고정 height 금지, 04 §7.2).

## JdBookmarkButton / JdBookmarkButtonView — 북마크 토글

`bookmark` ↔ `bookmark.fill` 심볼 토글. 켜짐 = warning 색. 기하는 아이콘 버튼(ghost) 스펙 재사용.

```swift
// SwiftUI — @Binding
@State private var bookmarked = false
JdBookmarkButton(isBookmarked: $bookmarked)
JdBookmarkButton(isBookmarked: $bookmarked, size: .lg, isEnabled: canBookmark)
```

```swift
// UIKit — 값 프로퍼티 + onChange (사용자 조작만 발화)
let bookmark = JdBookmarkButtonView(isBookmarked: false, size: .md)
bookmark.onChange = { isOn in store.setBookmark(isOn) }
bookmark.isBookmarked = true   // 프로그램 변경 — onChange 미발화
bookmark.isEnabled = false     // UIControl 상속
```

| 파라미터                | 타입                                   | 기본값        | 설명                                       |
| ----------------------- | -------------------------------------- | ------------- | ------------------------------------------ |
| `isBookmarked`          | SwiftUI `Binding<Bool>` / UIKit `Bool` | UIKit `false` | 켜짐 상태                                  |
| `size`                  | `JdIconButtonSize`                     | `.md`         | `xs·sm·md·lg` (아이콘 버튼 램프)           |
| `isEnabled` _(SwiftUI)_ | `Bool`                                 | `true`        | SwiftUI만 init 인자. UIKit은 상속 프로퍼티 |
| `onChange` _(UIKit)_    | `((Bool) -> Void)?`                    | `nil`         | 사용자 토글 콜백                           |

**특이사항**

- ⚠️ 상태 이름이 `isBookmarked`인 이유: UIControl의 `isSelected/isHighlighted/isEnabled`와 충돌 회피.
- 접근성: 라벨은 "다음 동작"(`"북마크"`/`"북마크 해제"`), 현재 상태는 `.isSelected` 트레이트(웹 aria-pressed 동형).

## JdLikeButton / JdLikeButtonView — 좋아요 토글 + 카운트

하트 토글 + 선택적 카운트. 켜짐 = danger 색. **카운트 표기는 `JdNumberFormat.compactCount` 단일 소스**(자리수 축약 재구현 금지).

```swift
// SwiftUI
@State private var liked = false
JdLikeButton(isLiked: $liked)
JdLikeButton(isLiked: $liked, count: 1200, size: .md)   // ♥ 1.2천
```

```swift
// UIKit
let like = JdLikeButtonView(isLiked: false, count: 1200)
like.onChange = { isOn in api.setLike(isOn) }
like.count = 1201     // 카운트 갱신(축약은 Core)
```

| 파라미터                | 타입                                   | 기본값        | 설명                                  |
| ----------------------- | -------------------------------------- | ------------- | ------------------------------------- |
| `isLiked`               | SwiftUI `Binding<Bool>` / UIKit `Bool` | UIKit `false` | 켜짐 상태                             |
| `count`                 | `Int?`                                 | `nil`         | 좋아요 수. `nil`이면 카운트 슬롯 숨김 |
| `size`                  | `JdIconButtonSize`                     | `.md`         | `xs·sm·md·lg`                         |
| `isEnabled` _(SwiftUI)_ | `Bool`                                 | `true`        | SwiftUI만 init 인자                   |
| `onChange` _(UIKit)_    | `((Bool) -> Void)?`                    | `nil`         | 사용자 토글 콜백                      |

**특이사항**

- 카운트는 `JdNumberFormat.compactCount(count)` — `999`→`"999"`, `1200`→`"1.2천"`, `12800`→`"1.3만"` 식(단위 사다리 억/만/천, 경계값 Core 전수 테스트).
- 접근성: 카운트는 a11y `value`로 실린다. 하트+숫자가 한 컨트롤 = 접근성 요소 1개.

## JdFollowButton / JdFollowButtonView — 팔로우 토글

두 변형 캡슐 버튼. 미팔로우 = primary 채움 / 팔로잉 = secondary 외곽선. `JdButtonSpec` 재사용 + 모서리만 캡슐.

```swift
// SwiftUI
@State private var following = false
JdFollowButton(isFollowing: $following)
JdFollowButton(isFollowing: $following, size: .sm,
               followLabel: "구독", followingLabel: "구독 중")
```

```swift
// UIKit
let follow = JdFollowButtonView(isFollowing: false)
follow.onChange = { isOn in api.setFollow(isOn) }
follow.followLabel = "구독"
follow.size = .lg
```

| 파라미터                | 타입                                   | 기본값        | 설명                |
| ----------------------- | -------------------------------------- | ------------- | ------------------- |
| `isFollowing`           | SwiftUI `Binding<Bool>` / UIKit `Bool` | UIKit `false` | 팔로잉 상태         |
| `size`                  | `JdControlSize`                        | `.md`         | `sm·md·lg`          |
| `isEnabled` _(SwiftUI)_ | `Bool`                                 | `true`        | SwiftUI만 init 인자 |
| `followLabel`           | `String`                               | `"팔로우"`    | 미팔로우 라벨       |
| `followingLabel`        | `String`                               | `"팔로잉"`    | 팔로잉 라벨         |
| `onChange` _(UIKit)_    | `((Bool) -> Void)?`                    | `nil`         | 사용자 토글 콜백    |

**특이사항**

- iOS엔 호버가 없어 웹의 "팔로잉 → 언팔로우" 호버 문구 교체는 이식하지 않는다(눌림만).
- 라벨 교체가 곧 상태 표기 + `.isSelected` 트레이트. 캡슐 = `Radius.full`(9999)의 기하 번역(UIKit은 높이의 절반).

## JdStarRating / JdStarRatingView — 별점

0.5 단위 별점. iOS 시스템 대응이 없는 진짜 신규 컴포넌트. **접근성이 본체**: 별 N개는 전부 장식이고 컨트롤 하나가 `.adjustable`로 위/아래 스와이프 0.5씩 조절. 채움·탭 값은 Core `JdStarRating`.

```swift
// SwiftUI — @Binding
@State private var rating = 3.5
JdStarRating(value: $rating)                                  // 5점 만점
JdStarRating(value: $rating, max: 5, size: .lg)
JdStarRating(value: .constant(4.0), isReadOnly: true,        // 표시 전용
             accessibilityLabel: "평균 별점")
```

```swift
// UIKit — 값 프로퍼티 + onValueChange (사용자 조작만 발화)
let stars = JdStarRatingView(value: 3.5, max: 5, size: .md)
stars.onValueChange = { v in draft.rating = v }
stars.value = 4.0        // 프로그램 변경 — onValueChange 미발화
stars.isReadOnly = true
```

| 파라미터                  | 타입                                       | 기본값    | 설명                          |
| ------------------------- | ------------------------------------------ | --------- | ----------------------------- |
| `value`                   | SwiftUI `Binding<Double>` / UIKit `Double` | UIKit `0` | 현재 별점(0…max)              |
| `max`                     | `Int`                                      | `5`       | 별 개수                       |
| `size`                    | `JdIconSize`                               | `.md`     | `xs·sm·md·lg·xl` (별 변 길이) |
| `isReadOnly`              | `Bool`                                     | `false`   | 표시 전용(조절 불가)          |
| `accessibilityLabel`      | `String`                                   | `"별점"`  | VoiceOver 라벨                |
| `onValueChange` _(UIKit)_ | `((Double) -> Void)?`                      | `nil`     | 사용자 조절 콜백              |

**특이사항**

- ⚠️ 별을 각각 버튼으로 노출하면 VoiceOver가 값을 조절하지 못한다 → 별은 `children: .ignore`/장식으로 합치고 **컨트롤 하나에 `.adjustable`**. 낭독은 `"5점 만점에 3.5점"`(숫자 표기는 `JdNumberFormat`).
- 같은 별 재탭 시 반값 토글(`JdStarRating.value(forTappedIndex:current:)`), 채움 판정 0.5/1.0은 `JdStarRating.fill`. 심볼 `star.fill`/`star.leadinghalf.filled`/`star`, 색 warning(채움)/border(빈).
- `isReadOnly`면 트레이트가 `.staticText`로 바뀐다.

## JdCopyButton / JdCopyButtonView — 복사 버튼

텍스트를 클립보드로 복사하고 2초간 "복사됨"으로 바뀌었다 복귀. **복사는 시스템 `UIPasteboard`**, 성공은 `JdAnnouncer`로 낭독.

```swift
// SwiftUI
JdCopyButton("복사할 코드")
JdCopyButton(shareURL.absoluteString, label: "링크 복사", copiedLabel: "복사됨!")
JdCopyButton(token, variant: .primary, size: .sm)
```

```swift
// UIKit
let copy = JdCopyButtonView(text: "복사할 코드")
copy.onCopy = { copied in analytics.log("copy", copied) }
copy.text = newValue          // 복사 대상 갱신
// copy.isCopied 는 읽기 전용(private(set)) — 2초 뒤 자동 복귀
```

| 파라미터           | 타입                  | 기본값       | 설명                 |
| ------------------ | --------------------- | ------------ | -------------------- |
| `text` / `_ text`  | `String`              | —            | 클립보드에 실릴 원문 |
| `label`            | `String`              | `"복사"`     | 기본 라벨            |
| `copiedLabel`      | `String`              | `"복사됨"`   | 복사 직후 라벨       |
| `variant`          | `JdButtonVariant`     | `.secondary` | 버튼 variant         |
| `size`             | `JdControlSize`       | `.md`        | `sm·md·lg`           |
| `onCopy` _(UIKit)_ | `((String) -> Void)?` | `nil`        | 복사 완료 콜백       |

**특이사항**

- 복사 = `UIPasteboard.general.string = text`. 아이콘 `doc.on.doc` → 성공 시 `checkmark`.
- 성공은 시각 체크만으로 AT에 닿지 않아 `JdAnnouncer.announce(copiedLabel)`로 낭독 보정(04 §7.1).
- 복귀 지연 2초는 토큰 사다리 밖 값이라 상수(DESIGN-3 §B). 연타 시 이전 복귀 예약을 취소한다.

## JdBackTopButton / JdBackTopButtonView — 상단 이동 버튼

40pt 원형 부양 버튼. **버튼만 컴포넌트**다 — 스크롤은 시스템, **가시성 판정은 소비자가 Core `JdBackTop.shouldShow(scrollY:threshold:)`로** 한다.

```swift
// SwiftUI — ScrollViewReader로 스크롤, shouldShow로 노출 제어
ScrollViewReader { proxy in
    // …콘텐츠, 최상단에 .id("top")…
    if JdBackTop.shouldShow(scrollY: offset, threshold: JdBackTop.defaultThreshold) {  // 400
        JdBackTopButton {
            withAnimation { proxy.scrollTo("top", anchor: .top) }
        }
    }
}
// 라벨 커스터마이즈: JdBackTopButton(action: …, label: "맨 위로")
```

```swift
// UIKit — onTap에서 setContentOffset, isHidden으로 노출 제어
let backTop = JdBackTopButtonView()      // label 기본 "상단으로 이동"
backTop.onTap = { [weak scrollView] in
    scrollView?.setContentOffset(.zero, animated: true)
}
// scrollViewDidScroll(_:)에서:
backTop.isHidden = !JdBackTop.shouldShow(scrollY: scrollView.contentOffset.y,
                                         threshold: JdBackTop.defaultThreshold)
```

| 파라미터             | 타입            | 기본값                   | 설명                                                   |
| -------------------- | --------------- | ------------------------ | ------------------------------------------------------ |
| `action` _(SwiftUI)_ | `() -> Void`    | —                        | 탭 동작(스크롤 실행은 소비자)                          |
| `label`              | `String`        | `JdBackTop.defaultLabel` | `"상단으로 이동"` — 아이콘뿐이라 유일한 VoiceOver 표면 |
| `onTap` _(UIKit)_    | `(() -> Void)?` | `nil`                    | 탭 동작                                                |

**특이사항**

- 가시성 임계값은 Core: `JdBackTop.shouldShow`는 `scrollY > threshold`(엄격 초과), `defaultThreshold = 400`. 컴포넌트는 임계값을 다시 계산하지 않는다.
- 외형: card 배경 + border 1pt + shadow lg, 아이콘 `arrow.up`. 40pt·아이콘 20pt는 아이콘 버튼 lg 스펙에서 가져와 형태만 원형으로.

## JdFileUploadZone / JdFileUploadZoneView — 파일 업로드존

점선 드롭존(아이콘 + 설명) + 선택된 파일 목록 표시. **피커는 만들지 않는다** — 실제 선택은 소비자가 시스템 피커를 `onTap`에 붙인다.

```swift
// SwiftUI — 피커는 .fileImporter로 소비자가 붙인다
@State private var files: [String] = []
@State private var importing = false

JdFileUploadZone(description: "PDF를 선택하세요", fileNames: files) {
    importing = true
}
.fileImporter(isPresented: $importing,
              allowedContentTypes: [.pdf],
              allowsMultipleSelection: true) { result in
    files = (try? result.get())?.map(\.lastPathComponent) ?? files
}
// 오류 상태: JdFileUploadZone(isError: true, …)
```

```swift
// UIKit — 피커는 UIDocumentPickerViewController로 소비자가 붙인다
let zone = JdFileUploadZoneView(description: "PDF를 선택하세요", fileNames: [])
zone.onTap = { [weak self] in
    let picker = UIDocumentPickerViewController(forOpeningContentTypes: [.pdf])
    picker.delegate = self
    self?.present(picker, animated: true)
}
// 델리게이트에서: zone.fileNames = urls.map { $0.lastPathComponent }
// zone.isError = true / zone.isEnabled = false
```

| 파라미터                | 타입                                         | 기본값                | 설명                                           |
| ----------------------- | -------------------------------------------- | --------------------- | ---------------------------------------------- |
| `description`           | `String`                                     | `"파일을 선택하세요"` | 드롭존 설명(저장 프로퍼티는 `zoneDescription`) |
| `isError`               | `Bool`                                       | `false`               | 테두리를 danger 색으로                         |
| `isEnabled` _(SwiftUI)_ | `Bool`                                       | `true`                | SwiftUI만 init 인자. UIKit은 상속 프로퍼티     |
| `fileNames`             | `[String]`                                   | `[]`                  | 선택된 파일 목록(표시 전용)                    |
| `onTap`                 | SwiftUI `() -> Void` / UIKit `(() -> Void)?` | UIKit `nil`           | 드롭존 탭 → 피커 표시                          |

**특이사항**

- 컴포넌트 책임은 **드롭존 외형 + 파일 목록 표시뿐**. 파일 선택·삭제·업로드는 소비자 몫(시스템 API가 이미 하는 일을 감싸지 않는다, 04 §10).
- ⚠️ 저장 프로퍼티 `zoneDescription`은 `NSObject.description` 회피 개명(init 인자 `description:`은 유지).
- 점선 = `Radius.xl` + 대시 길이 `Space.s1`(4). 파일 목록은 컨트롤 하나의 a11y `value`로 합류(요소 미분할).

---

## 참조

- 옵션·순수 로직: `JunDSCore/Specs/JdPrimitiveExtras.swift`(`JdCodeVariant`·`JdMarkColor`·`JdLinkVariant`·`JdHighlight`·`JdMentionChip`·`JdHashtag`·`JdStarRating`·`JdStarFill`·`JdBackTop`·`JdNumberFormat`·`JdIconSize`), `JunDSCore/Specs/JdButtonSpec.swift`(`JdButtonVariant`), `JunDSCore/JdOptions.swift`(`JdControlSize`), `JunDSCore/JdPrimitiveOptions.swift`(`JdIconButtonSize`).
- 레이아웃 조립·behaviors: `RECIPES.md`.
