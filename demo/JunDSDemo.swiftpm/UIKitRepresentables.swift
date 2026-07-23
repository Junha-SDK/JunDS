import SwiftUI
import UIKit
import JunDS

// 데모 앱은 소비자이므로 UIKit 구현을 스스로 랩해 쓴다 — 라이브러리 관할 밖 (DEC-010 각주)

struct JdButtonViewRep: UIViewRepresentable {
    var title: String
    var variant: JdButtonVariant
    var size: JdControlSize
    var loading: Bool
    var disabled: Bool
    var onTap: () -> Void

    func makeUIView(context: Context) -> JdButtonView {
        let view = JdButtonView(title: title, variant: variant, size: size)
        view.setContentHuggingPriority(.required, for: .horizontal)
        view.setContentHuggingPriority(.required, for: .vertical)
        view.setContentCompressionResistancePriority(.required, for: .vertical)
        return view
    }

    func updateUIView(_ view: JdButtonView, context: Context) {
        if view.title != title { view.title = title }
        if view.variant != variant { view.variant = variant }
        if view.size != size { view.size = size }
        view.isLoading = loading
        view.isEnabled = !disabled
        view.onTap = onTap
    }
}

struct JdTextFieldViewRep: UIViewRepresentable {
    var label: String
    var placeholder: String
    @Binding var text: String
    var size: JdControlSize
    var error: String?
    var disabled: Bool

    final class Coordinator {
        var text: Binding<String>
        init(text: Binding<String>) { self.text = text }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(text: $text)
    }

    func makeUIView(context: Context) -> JdTextFieldView {
        let view = JdTextFieldView(label: label, placeholder: placeholder, size: size)
        let coordinator = context.coordinator
        view.onTextChange = { value in
            coordinator.text.wrappedValue = value
        }
        view.setContentCompressionResistancePriority(.required, for: .vertical)
        return view
    }

    func updateUIView(_ view: JdTextFieldView, context: Context) {
        context.coordinator.text = $text
        if view.label != label { view.label = label }
        if view.size != size { view.size = size }
        view.text = text
        view.error = error
        view.isEnabled = !disabled
    }
}

struct UIKitModalHostRep: UIViewControllerRepresentable {
    var size: JdModalSize
    var persistent: Bool

    func makeUIViewController(context: Context) -> UIKitModalHostController {
        UIKitModalHostController()
    }

    func updateUIViewController(_ controller: UIKitModalHostController, context: Context) {
        controller.modalSize = size
        controller.persistent = persistent
    }
}

final class UIKitModalHostController: UIViewController {
    var modalSize: JdModalSize = .md
    var persistent = false

    private let openButton = JdButtonView(title: "UIKit 모달 열기", variant: .secondary)

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .clear
        view.addSubview(openButton)
        openButton.jd.layout {
            $0.center.equalToSuperview()
        }
        openButton.onTap = { [weak self] in
            self?.openModal()
        }
    }

    private func openModal() {
        let modal = JdModalViewController(size: modalSize, persistent: persistent)

        let title = UILabel()
        title.text = "JdModalViewController"
        title.font = UIFont.preferredFont(forTextStyle: .headline)
        title.adjustsFontForContentSizeCategory = true

        let body = UILabel()
        body.text = persistent
            ? "persistent — 스와이프로 닫히지 않는다. 닫기 버튼이 requestClose(.close)를 호출한다."
            : "스와이프 다운 = 웹 백드롭 경로(jd-request-close reason: backdrop)."
        body.numberOfLines = 0
        body.font = UIFont.preferredFont(forTextStyle: .body)
        body.adjustsFontForContentSizeCategory = true

        let closeButton = JdButtonView(title: "닫기", variant: .primary)
        closeButton.onTap = { [weak modal] in
            modal?.requestClose(.close)
        }

        let stack = UIStackView(arrangedSubviews: [title, body, closeButton])
        stack.axis = .vertical
        stack.alignment = .leading
        stack.spacing = 16
        modal.contentView.addSubview(stack)
        stack.jd.layout {
            $0.top.equalToSuperview()
            $0.leading.trailing.equalToSuperview()
        }
        modal.present(from: self)
    }
}
