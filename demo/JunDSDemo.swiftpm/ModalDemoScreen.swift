import SwiftUI
import JunDS

struct ModalDemoScreen: View {
    @State private var impl: DemoImpl = .swiftUI
    @State private var size: JdModalSize = .md
    @State private var persistent = false
    @State private var isPresented = false
    @State private var closeCount = 0

    var body: some View {
        Form {
            Section("미리보기") {
                if impl == .swiftUI {
                    HStack {
                        Spacer()
                        JdButton("SwiftUI 모달 열기", variant: .secondary) {
                            isPresented = true
                        }
                        Spacer()
                    }
                    .padding(.vertical, 24)
                } else {
                    UIKitModalHostRep(size: size, persistent: persistent)
                        .frame(height: 120)
                }
                Text("닫힘 횟수: \(closeCount)")
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
                    ForEach(JdModalSize.allCases, id: \.self) { item in
                        Text(item.rawValue)
                    }
                }
                Toggle("persistent", isOn: $persistent)
            }
        }
        .navigationTitle("Modal")
        .jdModal(isPresented: $isPresented,
                 size: size,
                 persistent: persistent,
                 onClose: { closeCount += 1 }) {
            VStack(alignment: .leading, spacing: 16) {
                Text("jdModal")
                    .font(.headline)
                Text(persistent
                     ? "persistent — 스와이프로 닫히지 않는다. 닫기 버튼만 동작한다 (웹 backdrop 무시와 동일 의미론)."
                     : "스와이프 다운으로 닫힌다 — 웹 backdrop 경로의 iOS 번역.")
                JdButton("닫기", variant: .primary) {
                    isPresented = false
                }
            }
        }
    }
}
