import SwiftUI
import JunDS

// 컨트롤 패널 = 웹 문서 상세와 동일 의미론: variant / size / loading / disabled
struct ButtonDemoScreen: View {
    @State private var impl: DemoImpl = .swiftUI
    @State private var variant: JdButtonVariant = .primary
    @State private var size: JdControlSize = .md
    @State private var loading = false
    @State private var disabled = false
    @State private var tapCount = 0

    var body: some View {
        Form {
            Section("미리보기") {
                HStack {
                    Spacer()
                    if impl == .swiftUI {
                        JdButton("저장하기", variant: variant, size: size, loading: loading) {
                            tapCount += 1
                        }
                        .disabled(disabled)
                    } else {
                        JdButtonViewRep(title: "저장하기",
                                        variant: variant,
                                        size: size,
                                        loading: loading,
                                        disabled: disabled) {
                            tapCount += 1
                        }
                        .fixedSize()
                    }
                    Spacer()
                }
                .padding(.vertical, 24)
                Text("탭 횟수: \(tapCount)")
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
                Picker("variant", selection: $variant) {
                    ForEach(JdButtonVariant.allCases, id: \.self) { item in
                        Text(item.rawValue)
                    }
                }
                Picker("size", selection: $size) {
                    ForEach(JdControlSize.allCases, id: \.self) { item in
                        Text(item.rawValue)
                    }
                }
                Toggle("loading", isOn: $loading)
                Toggle("disabled", isOn: $disabled)
            }
        }
        .navigationTitle("Button")
    }
}
