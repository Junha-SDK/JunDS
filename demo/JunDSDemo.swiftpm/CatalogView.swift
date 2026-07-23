import SwiftUI
import JunDS

enum DemoImpl: String, CaseIterable, Hashable {
    case swiftUI = "SwiftUI"
    case uikit = "UIKit"
}

struct CatalogView: View {
    @State private var darkMode = false

    var body: some View {
        NavigationStack {
            List {
                Section("파일럿 컴포넌트") {
                    NavigationLink("Button") { ButtonDemoScreen() }
                    NavigationLink("TextField") { TextFieldDemoScreen() }
                    NavigationLink("Modal") { ModalDemoScreen() }
                }
                Section("표시") {
                    Toggle("다크 모드", isOn: $darkMode)
                }
                Section {
                    Text("G1 iOS 슬라이스 — SwiftUI/UIKit 완전 독립 2계통 (DEC-010). 각 화면의 구현 탭으로 두 계통을 같은 컨트롤 패널로 비교한다.")
                        .font(.footnote)
                        .foregroundColor(.secondary)
                }
            }
            .navigationTitle("JunDS 카탈로그")
        }
        .preferredColorScheme(darkMode ? .dark : .light)
    }
}
