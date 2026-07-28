# JunDS Showroom — 아키텍처 + B-core iOS API 계약 (2026-07-24)

쇼룸 개편(확장 지령 B)과 core 12종 배치의 **단일 계약 문서**. 배치 에이전트는 여기 고정된
시그니처를 그대로 구현한다 — 표면 변경은 통합자(iOS 트랙 본선)만 한다.

## 1. 쇼룸 구조 (demo/JunDSDemo.swiftpm/)

```
ShowroomApp.swift            @main — CatalogHome + ShowroomRouter + .onOpenURL + JdUIKitMotionBridge.bootstrap()
AdditionalInfo.plist         CFBundleURLTypes(junds://) — Package.swift의 additionalInfoPlistContentFilePath
Generated/ShowroomCatalog.swift   ← demo/tools/gen-catalog.mjs 가 ledger.json에서 생성 (수기 편집 금지)
Showroom/
  DemoSchema.swift           DemoValue · DemoControlSpec(.options/.toggle/.slider/.text) · DemoState · ComponentDemo
  DemoRegistry.swift         구현된 데모 목록 — ⚠️ 배치 에이전트 수정 금지(통합자만 갱신, 병합 충돌 방지)
  StageHost.swift            트레이트 오버라이드 스테이지(다크+Dynamic Type XS~AX5) + A11y 스냅샷 + TypeLadder
  CatalogHome.swift          원장 445행 카탈로그 + 검색 + 상태 배지 + 진행률 + 딥링크 실패 배너
  ComponentDetail.swift      스키마 구동 상세(스테이지/환경/컨트롤/레시피/원장) + PlannedDetail + A11yInspector
  DeepLink.swift             junds://component/<id> 파싱·원장 조회 (실패 사유를 Result로 반환)
  ShowroomRouter.swift       NavigationStack 경로 소유자 + 딥링크 실패 알림(DeepLinkNotice)
  FpsOverlay.swift           CADisplayLink fps (DEBUG 전용)
Demos/
  ButtonDemo.swift           ★ 스키마 구동 패턴의 정본 — 새 데모는 이 구조를 복제
  <Component>Demo.swift      배치마다 추가
UIKitRepresentables.swift    데모앱(소비자)의 UIKit 랩 — DEC-010 각주로 허용
```

### 1.1 딥링크 — 445행을 스크롤하지 않고 상세로

카탈로그가 445행이고 finance는 맨 아래 카테고리다. 시뮬레이터에서 상세까지 60회 넘게 스와이프해야
닿아 실질적으로 눈으로 확인이 불가능했다(DEC-040에서 시각 확인을 생략한 원인). 딥링크가 그 경로다.

```sh
xcrun simctl openurl booted 'junds://component/PriceBadge'          # 원장 row id
xcrun simctl openurl booted 'junds://component/finance/AreaChart'   # 중복 id는 카테고리로 구분
```

- id는 원장(`docs-spec/registry/ledger.json`) row id와 같은 문자열. 대소문자는 무시한다.
- 같은 id가 여러 카테고리에 있으면(예: AreaChart) `ios == "done"`인 쪽을 먼저 연다.
- **실패는 조용히 무시하지 않는다** — 카탈로그 상단 빨간 배너 + 콘솔 양쪽으로 보고한다.
  콘솔은 `xcrun simctl spawn booted log show --last 2m --predicate 'subsystem == "kr.junha.junds.demo"'`.
- URL scheme 등록은 **두 곳**이다: `AdditionalInfo.plist`(Xcode/.swiftpm 경로)와
  `demo/tools/sim-run.sh`가 직접 쓰는 Info.plist(CLI 우회 경로). 한쪽만 고치면 다른 경로에서 안 뜬다.

데모 추가 절차: `enum XxxDemo { static let demo = ComponentDemo(...) }` 파일 1개 작성
→ 통합자가 DemoRegistry.all에 한 줄 추가. 컨트롤 키·값 리터럴은 웹 attribute와 일치.

## 2. B-core 라이브러리 API 계약 (정찰 실측 기반 — 웹 대조본 값 그대로)

### 2.1 JunDSCore 신설

```swift
// JdOptions.swift에 추가
public enum JdOrientation: String, CaseIterable, Sendable { case horizontal, vertical }

// Specs/JdTypographySpec.swift (신설)
// 웹 fontSize 어휘 = v2 리터럴(DEC-014-1 패리티 우선, --jd-text-*와 별개) — pt 환산 1rem=16pt
public enum JdTextSize: String, CaseIterable, Sendable {
    case xs2 = "2xs", xs, sm, md, lg, xl, xl2 = "2xl", xl3 = "3xl", xl4 = "4xl"
    // pt: 10, 12, 14, 16(기본), 18, 20, 24, 30, 36  (5xl/6xl은 텍스트 컴포넌트 표면 밖 — 필요 시 G2)
}
public struct JdTextSpec: Sendable {
    public var fontSize: CGFloat
    public var lineHeightMultiple: CGFloat   // 웹 기본 relaxed 1.625
    public static func resolve(size: JdTextSize) -> JdTextSpec
}
// 웹 jd-heading 레벨 램프(모바일 값 채택 — iPhone=모바일 브레이크포인트):
// L1 24pt bold tight / L2 20 bold tight / L3 20 semibold snug / L4 18 semibold snug
// L5 16 semibold / L6 14 semibold + uppercase
public enum JdHeadingLevel: Int, CaseIterable, Sendable { case h1 = 1, h2, h3, h4, h5, h6 }
public struct JdHeadingSpec: Sendable {
    public var fontSize: CGFloat
    public var fontWeight: CGFloat     // JdToken.FontWeight 값
    public var uppercase: Bool
    public static func resolve(level: JdHeadingLevel) -> JdHeadingSpec
}

// JdGap.swift (신설) — 웹 named gap 토큰(xs=4 sm=8 md=16 lg=24 xl=32 2xl=48 3xl=64 4xl=96)
public struct JdGap: Sendable, Equatable {
    public let value: CGFloat
    public static let none = JdGap(value: 0)
    public static let xs = JdGap(value: JdToken.Space.s1)    // 4
    public static let sm = JdGap(value: JdToken.Space.s2)    // 8
    public static let md = JdGap(value: JdToken.Space.s4)    // 16
    public static let lg = JdGap(value: JdToken.Space.s6)    // 24
    public static let xl = JdGap(value: JdToken.Space.s8)    // 32
    public static let xl2 = JdGap(value: JdToken.Space.s12)  // 48
    public static let xl3 = JdGap(value: JdToken.Space.s16)  // 64
    public static let xl4 = JdGap(value: JdToken.Space.s24)  // 96
    public static func custom(_ value: CGFloat) -> JdGap
}
```

### 2.2 JunDSSwiftUI 신설

```swift
// Components/Text/JdText.swift
public struct JdText: View {
    public init(_ text: String, size: JdTextSize = .md, weight: CGFloat = JdToken.FontWeight.normal,
                dimmed: Bool = false, mono: Bool = false, lineLimit: Int? = nil)
    // dimmed → JdToken.Color.muted, mono → .monospaced 디자인, lineLimit → .lineLimit + .truncationMode(.tail)
    // 폰트는 JdSwiftUIFont.scaled(…, category:) 경유(Dynamic Type 필수), 색은 JdToken만
}
// Components/Heading/JdHeading.swift
public struct JdHeading: View {
    public init(_ text: String, level: JdHeadingLevel = .h2, truncate: Bool = false)
    // .accessibilityAddTraits(.isHeader) + .accessibilityHeading(...) 필수, uppercase는 스펙 따라 적용
}
// Components/Divider/JdDivider.swift — 웹 jd-divider 동형(role=separator)
public struct JdDivider: View {
    public init(orientation: JdOrientation = .horizontal, label: String? = nil)
    // 두께 JdToken.Border.thin, 색 JdToken.Color.border
    // label 모드: HStack(spacing: s3) { line; Text(label) footnote·muted; line } — 웹 line—label—line 동형
    // vertical: 폭 1, 세로 stretch. a11y: 장식(accessibilityHidden) + label 있으면 라벨만 노출
}
// Layout/JdFlowLayout.swift — 웹 jd-group(row+wrap+gap sm+align center) 번역용, iOS16 Layout 프로토콜
public struct JdFlowLayout: Layout {
    public init(spacing: CGFloat = JdToken.Space.s2, rowSpacing: CGFloat? = nil)
    // 단순 좌→우 흐름, 넘치면 다음 행. RTL은 Layout이 자동 반전 처리(leading 기준 배치)
}
```

### 2.3 JunDSUIKit 신설

```swift
// Components/Stack/JdStackView.swift — 웹 HStack/VStack/Group/Flex 흡수(04 §10.1)
public final class JdStackView: UIStackView {
    public init(axis: NSLayoutConstraint.Axis = .vertical, gap: JdGap = .md,
                alignment: UIStackView.Alignment = .fill,
                distribution: UIStackView.Distribution = .fill,
                arranged: [UIView] = [])
    public static func horizontal(gap: JdGap = .sm, alignment: UIStackView.Alignment = .center,
                                  _ views: [UIView] = []) -> JdStackView   // 웹 jd-hstack 기본 동형
    public static func vertical(gap: JdGap = .md, _ views: [UIView] = []) -> JdStackView // 웹 jd-vstack 동형(stretch=fill)
    public var gap: JdGap { get set }   // didSet → spacing 갱신
}
// Components/Divider/JdDividerView.swift
public final class JdDividerView: UIView {
    public init(orientation: JdOrientation = .horizontal, label: String? = nil)
    public var label: String? { get set }
    // 1px 라인(intrinsic), JdToken.Color.border, label 모드는 내부 JdStackView(line/label/line)
    // accessibilityTraits 없음·장식, label 있으면 그 텍스트가 accessibilityLabel
}
// Components/Text/JdTextView.swift — UILabel 서브클래스(A8 명명 규칙 Jd<이름>View — UITextView 아님 주의)
public final class JdTextView: UILabel {
    public init(_ text: String, size: JdTextSize = .md, weight: CGFloat = JdToken.FontWeight.normal,
                dimmed: Bool = false, mono: Bool = false)
    public var textSize: JdTextSize { get set }   // size는 UILabel과 충돌 → textSize
    public var dimmed: Bool { get set }
    public var mono: Bool { get set }
    // adjustsFontForContentSizeCategory=true, JdFontBridge.scaledFont(…, compatibleWith: traitCollection)
    // numberOfLines 기본 0(웹 p 동형), traitCollectionDidChange에서 재적용
}
// Components/Heading/JdHeadingView.swift
public final class JdHeadingView: UILabel {
    public init(_ text: String, level: JdHeadingLevel = .h2)
    public var level: JdHeadingLevel { get set }
    // accessibilityTraits = .header, uppercase 레벨은 표시 텍스트 대문자화(원문 보존해 재적용 가능하게)
}
```

mono 폰트: `UIFont.monospacedSystemFont(ofSize:weight:)` → UIFontMetrics 스케일 적용
(JdFontBridge에 `scaledMonoFont(size:weight:compatibleWith:)` 추가 허용).

### 2.4 레시피형 (컴포넌트 신설 없음 — 04 §10.1)

Box·Center·Flex·GridLayout·HStack·VStack·Page·Section은 iOS 신규 타입을 만들지 않는다.
쇼룸 데모가 곧 레시피(SwiftUI 관용구 + JdStackView) — `recipe:` 필드에 핵심 스니펫 문자열을 담고,
packages/ios/RECIPES.md에 전체 레시피를 적는다. Group은 JdFlowLayout(SwiftUI)/JdStackView no-wrap(UIKit).

## 3. 검증 규약 (배치 에이전트)

- 빌드: `/Library/Developer/CommandLineTools/usr/bin/swift build --triple arm64-apple-ios16.0-simulator --sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneSimulator.platform/Developer/SDKs/iPhoneSimulator.sdk --scratch-path <자기 전용 경로>` — 공용 .build 금지(동시 빌드 충돌).
- 데모 파일 typecheck: swiftc -typecheck -parse-as-library + `-I <자기 scratch>/arm64-apple-ios-simulator/debug/Modules` (파일 목록 명시 — Showroom/_ + Generated/_ + UIKitRepresentables + 자기 데모).
- 테스트 실행은 통합자가 일괄 수행. 에이전트는 컴파일 통과까지.
- 색·치수 하드코딩 금지 — JdToken/JdGap/스펙 상수만. 예외는 DECISIONS 기록감.
