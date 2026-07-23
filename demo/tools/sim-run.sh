#!/bin/zsh
# JunDS Showroom — Xcode 없이 시뮬레이터 구동 (DEC-015 우회 경로의 공식화)
# 사용: demo/tools/sim-run.sh [디바이스이름]   (기본: booted)
# 절차: 원장→카탈로그 재생성 → 라이브러리 빌드 → 데모 링크 → 번들 → 서명 → 설치 → 실행
set -e

REPO="$(cd "$(dirname "$0")/../.." && pwd)"
DEVICE="${1:-booted}"
CLT=/Library/Developer/CommandLineTools/usr/bin
PLATFORM=/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneSimulator.platform
SDK="$PLATFORM/Developer/SDKs/iPhoneSimulator.sdk"
B="$REPO/.build/arm64-apple-ios-simulator/debug"
APP_DIR="${TMPDIR:-/tmp}/JunDSShowroom.app"
BUNDLE_ID="kr.junha.junds.demo"

echo "① 카탈로그 재생성 (원장 동기화)"
node "$REPO/demo/tools/gen-catalog.mjs"

echo "② 라이브러리 빌드 (iOS 16 시뮬레이터)"
"$CLT/swift" build --package-path "$REPO" \
  --triple arm64-apple-ios16.0-simulator --sdk "$SDK"

echo "③ 데모 실행 파일 링크"
rm -rf "$APP_DIR" && mkdir -p "$APP_DIR"
DEMO_SOURCES=($(find "$REPO/demo/JunDSDemo.swiftpm" -name '*.swift' ! -name 'Package.swift' | sort))
"$CLT/swiftc" \
  -sdk "$SDK" -target arm64-apple-ios16.0-simulator -parse-as-library \
  -I "$B/Modules" \
  "${DEMO_SOURCES[@]}" \
  "$B"/JunDSCore.build/*.o "$B"/JunDSUIKit.build/*.o "$B"/JunDSSwiftUI.build/*.o "$B"/JunDS.build/*.o \
  -o "$APP_DIR/JunDSShowroom" 2>&1 | grep -v "search path" || true
[ -x "$APP_DIR/JunDSShowroom" ] || { echo "링크 실패"; exit 1; }

echo "④ Info.plist + 서명"
cat > "$APP_DIR/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleExecutable</key><string>JunDSShowroom</string>
	<key>CFBundleIdentifier</key><string>kr.junha.junds.demo</string>
	<key>CFBundleName</key><string>JunDSShowroom</string>
	<key>CFBundleDisplayName</key><string>JunDS Showroom</string>
	<key>CFBundlePackageType</key><string>APPL</string>
	<key>CFBundleShortVersionString</key><string>3.0</string>
	<key>CFBundleVersion</key><string>1</string>
	<key>CFBundleSupportedPlatforms</key><array><string>iPhoneSimulator</string></array>
	<key>MinimumOSVersion</key><string>16.0</string>
	<key>LSRequiresIPhoneOS</key><true/>
	<key>UIDeviceFamily</key><array><integer>1</integer><integer>2</integer></array>
	<key>UILaunchScreen</key><dict/>
	<key>UISupportedInterfaceOrientations</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
		<string>UIInterfaceOrientationLandscapeLeft</string>
		<string>UIInterfaceOrientationLandscapeRight</string>
	</array>
</dict>
</plist>
PLIST
codesign --force --sign - "$APP_DIR" > /dev/null 2>&1

echo "⑤ 설치 + 실행 ($DEVICE)"
xcrun simctl install "$DEVICE" "$APP_DIR"
xcrun simctl terminate "$DEVICE" "$BUNDLE_ID" 2>/dev/null || true
xcrun simctl launch "$DEVICE" "$BUNDLE_ID"
echo "완료 — JunDS Showroom 구동"
