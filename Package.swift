// swift-tools-version: 5.9
// JunDS v3 — iOS. 소스는 packages/ios/ 아래에 있고 매니페스트만 레포 루트다 (DEC-002, 04 §2.2).
import PackageDescription

let swiftSettings: [SwiftSetting] = [
    .enableUpcomingFeature("ExistentialAny"),
    .enableExperimentalFeature("StrictConcurrency"), // 5.9에선 experimental — 경고로 조기 검출
]

let package = Package(
    name: "JunDS",
    defaultLocalization: "ko",
    platforms: [
        .iOS(.v16), // DEC-004
    ],
    products: [
        // 제품은 하나. 내부 계층은 우산 타겟이 @_exported로 재수출한다.
        .library(name: "JunDS", targets: ["JunDS"]),
    ],
    targets: [
        // 계층 1 — 순수 로직. UIKit/SwiftUI import 금지 (CI에서 grep 게이트).
        .target(
            name: "JunDSCore",
            path: "packages/ios/Sources/JunDSCore",
            swiftSettings: swiftSettings
        ),
        // 계층 2 — UIKit 구현체 + 레이아웃 DSL.
        .target(
            name: "JunDSUIKit",
            dependencies: ["JunDSCore"],
            path: "packages/ios/Sources/JunDSUIKit",
            swiftSettings: swiftSettings
        ),
        // 계층 3 — SwiftUI. JunDSUIKit과 상호 미의존 — 완전 독립 2계통 (DEC-010, 04 §4.2).
        .target(
            name: "JunDSSwiftUI",
            dependencies: ["JunDSCore"],
            path: "packages/ios/Sources/JunDSSwiftUI",
            swiftSettings: swiftSettings
        ),
        // 우산 — 소스는 Exports.swift 1파일.
        .target(
            name: "JunDS",
            dependencies: ["JunDSCore", "JunDSUIKit", "JunDSSwiftUI"],
            path: "packages/ios/Sources/JunDS",
            swiftSettings: swiftSettings
        ),
        .testTarget(
            name: "JunDSCoreTests",
            dependencies: ["JunDSCore"],
            path: "packages/ios/Tests/JunDSCoreTests"
        ),
        .testTarget(
            name: "JunDSUIKitTests",
            dependencies: ["JunDSUIKit"],
            path: "packages/ios/Tests/JunDSUIKitTests"
        ),
        .testTarget(
            name: "JunDSSwiftUITests",
            dependencies: ["JunDS"],
            path: "packages/ios/Tests/JunDSSwiftUITests"
        ),
    ]
)
