import SwiftUI
import UIKit
import JunDS

// 스테이지 호스트 — 다크/Dynamic Type 시뮬레이션의 핵심.
// UIHostingController를 자식으로 안고 setOverrideTraitCollection으로
// userInterfaceStyle + preferredContentSizeCategory를 주입한다.
// 오버라이드된 트레이트는 UIKit(JdDynamicColor trait 클로저·UIFontMetrics)과
// SwiftUI 환경(colorScheme·sizeCategory) 양쪽에 자동 전파된다.

// Dynamic Type 사다리 XS~AX5 (12단)
enum TypeLadder {
    static let categories: [UIContentSizeCategory] = [
        .extraSmall, .small, .medium, .large, .extraLarge, .extraExtraLarge,
        .extraExtraExtraLarge, .accessibilityMedium, .accessibilityLarge,
        .accessibilityExtraLarge, .accessibilityExtraExtraLarge,
        .accessibilityExtraExtraExtraLarge,
    ]
    static let labels: [String] = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "AX1", "AX2", "AX3", "AX4", "AX5"]
    static let defaultIndex = 3 // .large
}

struct A11yRow: Identifiable {
    let id = UUID()
    let depth: Int
    let type: String
    let label: String
    let value: String?
    let traits: String
    let hint: String?
}

// 상세 화면이 스테이지 컨트롤러에 접근하는 프록시 (접근성 스냅샷용)
@MainActor
final class StageProxy: ObservableObject {
    weak var controller: StageHostController?

    func a11ySnapshot() -> [A11yRow] {
        controller?.a11ySnapshot() ?? []
    }
}

struct StageHost: UIViewControllerRepresentable {
    let content: AnyView
    let dark: Bool
    let sizeCategory: UIContentSizeCategory
    let proxy: StageProxy

    func makeUIViewController(context: Context) -> StageHostController {
        let controller = StageHostController()
        proxy.controller = controller
        return controller
    }

    func updateUIViewController(_ controller: StageHostController, context: Context) {
        proxy.controller = controller
        controller.render(content: content, dark: dark, category: sizeCategory)
    }
}

final class StageHostController: UIViewController {
    private var host: UIHostingController<AnyView>?

    func render(content: AnyView, dark: Bool, category: UIContentSizeCategory) {
        let hosting: UIHostingController<AnyView>
        if let existing = host {
            hosting = existing
            hosting.rootView = content
        } else {
            hosting = UIHostingController(rootView: content)
            // 배경은 반드시 오버라이드를 받는 자식(hosting.view) 쪽에서 칠한다 —
            // 바깥(List 행)에서 칠하면 바깥 트레이트(라이트)로 해석돼 다크 스테이지가 안 먹는다.
            hosting.view.backgroundColor = JdToken.Color.background.uiColor
            addChild(hosting)
            view.addSubview(hosting.view)
            hosting.view.jd.layout { $0.edges.equalToSuperview() }
            hosting.didMove(toParent: self)
            host = hosting
        }
        let traits = UITraitCollection(traitsFrom: [
            UITraitCollection(userInterfaceStyle: dark ? .dark : .light),
            UITraitCollection(preferredContentSizeCategory: category),
        ])
        setOverrideTraitCollection(traits, forChild: hosting)
    }

    // MARK: 접근성 스냅샷 — UIView 트리 + accessibilityElements(SwiftUI 호스트) 워크

    func a11ySnapshot() -> [A11yRow] {
        guard let root = host?.view else { return [] }
        var rows: [A11yRow] = []
        walk(root, depth: 0, into: &rows)
        return rows
    }

    private func walk(_ object: NSObject, depth: Int, into rows: inout [A11yRow]) {
        // SwiftUI 호스팅 계층은 쉽게 20단을 넘는다 — 얕은 상한(12)을 두면 실제 컨트롤에
        // 닿기 전에 잘려 "요소 없음"으로 오보한다(실측). 순환 방어 목적이므로 넉넉히 잡는다.
        if depth > 60 { return }

        if object.isAccessibilityElement {
            rows.append(row(for: object, depth: depth))
        }
        // SwiftUI 호스트는 뷰 트리가 아니라 accessibilityElements 배열로 요소를 노출한다
        if let elements = object.accessibilityElements {
            for case let element as NSObject in elements {
                if element.isAccessibilityElement {
                    rows.append(row(for: element, depth: depth + 1))
                }
                walk(element, depth: depth + 1, into: &rows)
            }
        }
        if let view = object as? UIView {
            for subview in view.subviews {
                walk(subview, depth: depth + 1, into: &rows)
            }
        }
    }

    private func row(for object: NSObject, depth: Int) -> A11yRow {
        A11yRow(
            depth: depth,
            type: String(describing: type(of: object)),
            label: object.accessibilityLabel ?? "(라벨 없음)",
            value: object.accessibilityValue,
            traits: Self.describe(object.accessibilityTraits),
            hint: object.accessibilityHint
        )
    }

    private static func describe(_ traits: UIAccessibilityTraits) -> String {
        var names: [String] = []
        if traits.contains(.button) { names.append("button") }
        if traits.contains(.header) { names.append("header") }
        if traits.contains(.staticText) { names.append("staticText") }
        if traits.contains(.image) { names.append("image") }
        if traits.contains(.link) { names.append("link") }
        if traits.contains(.adjustable) { names.append("adjustable") }
        if traits.contains(.selected) { names.append("selected") }
        if traits.contains(.notEnabled) { names.append("notEnabled") }
        if traits.contains(.updatesFrequently) { names.append("updatesFrequently") }
        if traits.contains(.searchField) { names.append("searchField") }
        return names.isEmpty ? "—" : names.joined(separator: " · ")
    }
}
