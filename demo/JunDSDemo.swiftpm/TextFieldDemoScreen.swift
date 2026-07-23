import SwiftUI
import JunDS

struct TextFieldDemoScreen: View {
    @State private var impl: DemoImpl = .swiftUI
    @State private var text = ""
    @State private var size: JdControlSize = .md
    @State private var showError = false
    @State private var disabled = false

    private var error: String? {
        showError ? "필수 입력입니다" : nil
    }

    var body: some View {
        Form {
            Section("미리보기") {
                Group {
                    if impl == .swiftUI {
                        JdTextField("이메일",
                                    placeholder: "you@example.com",
                                    text: $text,
                                    size: size,
                                    error: error)
                            .disabled(disabled)
                    } else {
                        JdTextFieldViewRep(label: "이메일",
                                           placeholder: "you@example.com",
                                           text: $text,
                                           size: size,
                                           error: error,
                                           disabled: disabled)
                    }
                }
                .padding(.vertical, 16)
                Text("value: \(text)")
                    .font(.footnote)
                    .foregroundColor(.secondary)
            }
            Section("컨트롤") {
                Picker("구현", selection: $impl) {
                    ForEach(DemoImpl.allCases, id: \.self) { item in
                        Text(item.rawValue)
                    }
                }
                .pickerStyle(.segmented)
                Picker("size", selection: $size) {
                    ForEach(JdControlSize.allCases, id: \.self) { item in
                        Text(item.rawValue)
                    }
                }
                Toggle("error", isOn: $showError)
                Toggle("disabled", isOn: $disabled)
            }
        }
        .navigationTitle("TextField")
    }
}
