// swift-tools-version: 5.9
// JunDS v3 — 실기기 데모 카탈로그 (Swift Playgrounds 앱 포맷, Xcode로 열어 iPhone에 바로 Run).
import PackageDescription
import AppleProductTypes

let package = Package(
    name: "JunDSDemo",
    platforms: [
        .iOS("16.0")
    ],
    products: [
        .iOSApplication(
            name: "JunDSDemo",
            targets: ["AppModule"],
            bundleIdentifier: "kr.junha.junds.demo",
            displayVersion: "1.0",
            bundleVersion: "1",
            appIcon: .placeholder(icon: .box),
            accentColor: .presetColor(.purple),
            supportedDeviceFamilies: [
                .pad,
                .phone
            ],
            supportedInterfaceOrientations: [
                .portrait,
                .landscapeRight,
                .landscapeLeft
            ],
            // 딥링크 junds://component/<id> — CFBundleURLTypes 등록
            additionalInfoPlistContentFilePath: "AdditionalInfo.plist"
        )
    ],
    dependencies: [
        // 로컬 JunDS 패키지 — 워크트리 디렉터리명과 무관하게 identity 고정 (DEC-013)
        .package(name: "JunDS", path: "../..")
    ],
    targets: [
        .executableTarget(
            name: "AppModule",
            dependencies: [
                .product(name: "JunDS", package: "JunDS")
            ],
            path: ".",
            exclude: ["AdditionalInfo.plist"]
        )
    ]
)
