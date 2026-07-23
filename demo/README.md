# JunDS Showroom (JunDSDemo.swiftpm)

원장(ledger.json) 동기화 카탈로그 앱 — 445행 전부 노출(구현체는 라이브 데모, 미구현은 "예정"),
컴포넌트별 상세는 스키마 구동(라이브 스테이지 + 컨트롤 + SwiftUI↔UIKit 탭 + 다크/Dynamic Type
XS~AX5/Reduce Motion + 접근성 검사 + fps 오버레이). 구조·계약은 `demo/DESIGN.md`.
로컬 JunDS 패키지(`../..`)를 상대 경로로 의존한다.

빠른 실행(시뮬레이터, Xcode 불필요):

```sh
demo/tools/sim-run.sh          # 부팅된 시뮬레이터에 빌드·설치·실행 (카탈로그 재생성 포함)
```

## 여는 법 · 기기 서명

1. Xcode에서 `demo/JunDSDemo.swiftpm`을 연다 (Finder 더블클릭 또는 File → Open).
2. 프로젝트 설정 → Signing & Capabilities에서 본인 팀(무료 Apple ID 개인 팀 가능)을 선택한다.
3. 상단 기기 목록에서 연결된 iPhone을 선택하고 Run(⌘R). 최초 실행 시 iPhone의 설정 → 일반 → VPN 및 기기 관리에서 개발자 앱을 신뢰한다.

⚠️ 2026-07-24 현재 이 머신의 Xcode 26.2는 코드서명 손상 상태(DEC-014)라 위 절차는 **Xcode 재설치 후**에만 동작한다. `.swiftpm` 매니페스트의 `AppleProductTypes`는 Xcode 전용이라 CLI 빌드도 불가. 단, 데모 소스 자체는 typecheck 통과 + 아래 우회로 시뮬레이터 실기동 확인 완료(카탈로그·Button 양 계통·Modal 시트·다크모드).

## Xcode 없이 시뮬레이터 구동 (검증된 우회 — 2026-07-24)

CLT 툴체인 + iPhoneSimulator SDK 직접 지정. 레포 루트에서:

```sh
PLATFORM=/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneSimulator.platform
B=.build/arm64-apple-ios-simulator/debug

# 1) 라이브러리 빌드
/Library/Developer/CommandLineTools/usr/bin/swift build \
  --triple arm64-apple-ios16.0-simulator \
  --sdk "$PLATFORM/Developer/SDKs/iPhoneSimulator.sdk"

# 2) 데모 실행 파일 링크 (모듈 .o 직접 링크, @main이라 -parse-as-library 필수)
mkdir -p /tmp/JunDSDemo.app
/Library/Developer/CommandLineTools/usr/bin/swiftc \
  -sdk "$PLATFORM/Developer/SDKs/iPhoneSimulator.sdk" \
  -target arm64-apple-ios16.0-simulator -parse-as-library \
  -I "$B/Modules" \
  demo/JunDSDemo.swiftpm/JunDSDemoApp.swift demo/JunDSDemo.swiftpm/CatalogView.swift \
  demo/JunDSDemo.swiftpm/ButtonDemoScreen.swift demo/JunDSDemo.swiftpm/TextFieldDemoScreen.swift \
  demo/JunDSDemo.swiftpm/ModalDemoScreen.swift demo/JunDSDemo.swiftpm/UIKitRepresentables.swift \
  "$B"/JunDSCore.build/*.o "$B"/JunDSUIKit.build/*.o "$B"/JunDSSwiftUI.build/*.o "$B"/JunDS.build/*.o \
  -o /tmp/JunDSDemo.app/JunDSDemo

# 3) Info.plist(CFBundleIdentifier=kr.junha.junds.demo, CFBundleExecutable=JunDSDemo,
#    MinimumOSVersion=16.0, CFBundleSupportedPlatforms=[iPhoneSimulator], UILaunchScreen={},
#    CFBundlePackageType=APPL) 작성 후:
codesign --force --sign - /tmp/JunDSDemo.app
xcrun simctl install booted /tmp/JunDSDemo.app
xcrun simctl launch booted kr.junha.junds.demo
```

XCTest 시뮬레이터 실행(31개 전부 이 방법으로 통과 — `--build-tests` + XCTest 검색 경로 필요):

```sh
/Library/Developer/CommandLineTools/usr/bin/swift build --build-tests \
  --triple arm64-apple-ios16.0-simulator \
  --sdk "$PLATFORM/Developer/SDKs/iPhoneSimulator.sdk" \
  -Xswiftc -F -Xswiftc "$PLATFORM/Developer/Library/Frameworks" \
  -Xswiftc -I -Xswiftc "$PLATFORM/Developer/usr/lib" \
  -Xlinker -F -Xlinker "$PLATFORM/Developer/Library/Frameworks" \
  -Xlinker -L -Xlinker "$PLATFORM/Developer/usr/lib"

SIMCTL_CHILD_DYLD_FRAMEWORK_PATH="$PLATFORM/Developer/Library/Frameworks" \
SIMCTL_CHILD_DYLD_LIBRARY_PATH="$PLATFORM/Developer/usr/lib" \
xcrun simctl spawn booted "$PLATFORM/Developer/Library/Xcode/Agents/xctest" \
  "$PWD/$B/JunDSPackageTests.xctest"
```
