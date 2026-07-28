import SwiftUI

// 쇼룸 상세 화면의 선언적 스키마 — 화면 하나하나 수제 금지 원칙의 기반.
// 각 컴포넌트 데모는 ComponentDemo 하나(컨트롤 정의 + 스테이지 클로저)만 선언하고,
// 상세 화면 렌더는 ComponentDetail이 스키마로부터 일괄 구동한다.

enum DemoValue: Equatable {
    case string(String)
    case bool(Bool)
    case number(Double)
}

struct DemoControlSpec: Identifiable {
    enum Kind {
        case options([String])  // 열거 픽커 (variant/size 등)
        case toggle  // Bool 토글
        case slider(ClosedRange<Double>, step: Double)
        case text(placeholder: String)  // 자유 문자열
    }

    let id: String  // DemoState 키
    let label: String
    let kind: Kind
    let initial: DemoValue

    static func options(
        _ key: String, _ label: String, _ options: [String], initial: String
    ) -> DemoControlSpec {
        DemoControlSpec(id: key, label: label, kind: .options(options), initial: .string(initial))
    }

    static func toggle(_ key: String, _ label: String, initial: Bool = false) -> DemoControlSpec {
        DemoControlSpec(id: key, label: label, kind: .toggle, initial: .bool(initial))
    }

    static func slider(
        _ key: String, _ label: String, _ range: ClosedRange<Double>, step: Double = 1,
        initial: Double
    ) -> DemoControlSpec {
        DemoControlSpec(
            id: key, label: label, kind: .slider(range, step: step), initial: .number(initial))
    }

    static func text(
        _ key: String, _ label: String, placeholder: String = "", initial: String = ""
    ) -> DemoControlSpec {
        DemoControlSpec(
            id: key, label: label, kind: .text(placeholder: placeholder), initial: .string(initial))
    }
}

@MainActor
final class DemoState: ObservableObject {
    @Published var values: [String: DemoValue] = [:]

    init(controls: [DemoControlSpec]) {
        for control in controls {
            values[control.id] = control.initial
        }
    }

    func string(_ key: String, fallback: String = "") -> String {
        if case .string(let v)? = values[key] { return v }
        return fallback
    }

    func bool(_ key: String) -> Bool {
        if case .bool(let v)? = values[key] { return v }
        return false
    }

    func number(_ key: String, fallback: Double = 0) -> Double {
        if case .number(let v)? = values[key] { return v }
        return fallback
    }

    // 컨트롤 패널용 바인딩
    func stringBinding(_ key: String, fallback: String = "") -> Binding<String> {
        Binding(
            get: { self.string(key, fallback: fallback) },
            set: { self.values[key] = .string($0) }
        )
    }

    func boolBinding(_ key: String) -> Binding<Bool> {
        Binding(
            get: { self.bool(key) },
            set: { self.values[key] = .bool($0) }
        )
    }

    func numberBinding(_ key: String, fallback: Double = 0) -> Binding<Double> {
        Binding(
            get: { self.number(key, fallback: fallback) },
            set: { self.values[key] = .number($0) }
        )
    }
}

struct ComponentDemo {
    let id: String  // ledger id (예: "Button")
    let controls: [DemoControlSpec]
    let swiftUIStage: (DemoState) -> AnyView
    let uikitStage: ((DemoState) -> AnyView)?  // nil → UIKit 탭 숨김
    let stress: ((DemoState) -> AnyView)?  // L급 대량 데이터 씬 (nil → 탭 숨김)
    let recipe: String?  // 레시피 스니펫 (04 §10.1 레시피형 컴포넌트)

    init(
        id: String,
        controls: [DemoControlSpec],
        swiftUI: @escaping (DemoState) -> AnyView,
        uikit: ((DemoState) -> AnyView)? = nil,
        stress: ((DemoState) -> AnyView)? = nil,
        recipe: String? = nil
    ) {
        self.id = id
        self.controls = controls
        self.swiftUIStage = swiftUI
        self.uikitStage = uikit
        self.stress = stress
        self.recipe = recipe
    }
}
