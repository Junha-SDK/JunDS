import UIKit
import JunDSCore

// 웹 jd-pin-input 동형 — 자릿수 분할 코드 입력 (DESIGN-3 §A).
// **OTPInput은 별도 타입이 아니라 이 컴포넌트의 설정 변형이다**(alphanumeric=false +
// .oneTimeCode 자동완성) — R12 Switch=Toggle 선례.
//
// 셀 표시·정리·포커스 인덱스·완료 판정은 전부 JdPinRules다(재구현 금지).
// 칸마다 UITextField를 두지 않는다: 빈 칸 Backspace·한 번에 붙여넣기·마스킹 표시가
// 전부 칸별 필드에서 깨진다. **값을 쥔 필드는 하나**이고 칸은 파생 표시이며, 그래서
// 접근성 요소도 자연히 하나로 합쳐진다(값 = 입력된 자리수 — DESIGN-3 §A).
public final class JdPinInputView: UIView {

    /// 대입도 Core 규칙을 통과한다(허용 문자·자리수) — 표시는 파생
    public var value: String {
        didSet {
            let next = JdPinRules.sanitize(value, length: length, alphanumeric: alphanumeric)
            // 관찰자 안의 재대입은 didSet을 다시 부르지 않는다(Swift 규칙) — 무한 재귀 없음
            if next != value { value = next }
            if field.text != value { field.text = value }
            applyCells()
        }
    }

    public var length: Int {
        didSet { rebuildCells() }
    }

    public var masked: Bool {
        didSet { applyCells() }
    }

    public var alphanumeric: Bool {
        didSet {
            field.keyboardType = alphanumeric ? .asciiCapable : .numberPad
            value = JdPinRules.sanitize(value, length: length, alphanumeric: alphanumeric)
        }
    }

    public var isError: Bool {
        didSet { applyCells() }
    }

    public var isEnabled: Bool = true {
        didSet {
            field.isEnabled = isEnabled
            alpha = isEnabled ? 1 : JdToken.Opacity.o50 // 웹 :disabled opacity-50
        }
    }

    public var onValueChange: ((String) -> Void)?
    public var onComplete: ((String) -> Void)?

    /// 웹 v2 PinInput 칸: 40×48. 토큰 조합으로만 표기한다(전용 스펙 부재분)
    private static let cellWidth = JdToken.Space.s10   // 40
    private static let cellHeight = JdToken.Space.s12  // 48

    /// 편집 중 여부 — isFirstResponder 대신 편집 이벤트로 추적한다(창 없는 환경에서도
    /// 같은 판정이 나오고, 되쓰기 가드·포커스 테두리가 한 소스를 본다)
    private var isEditing = false

    private let cellStack = UIStackView()
    private var cells: [UILabel] = []
    /// 글자·캐럿을 감춘 채 칸 위를 덮는 단일 필드 — 어느 칸을 눌러도 키보드가 올라온다
    private let field = UITextField()

    public init(value: String = "",
                length: Int = 6,
                masked: Bool = false,
                alphanumeric: Bool = false,
                isError: Bool = false,
                accessibilityLabel: String? = nil) {
        self.length = length
        self.masked = masked
        self.alphanumeric = alphanumeric
        self.isError = isError
        self.value = JdPinRules.sanitize(value, length: length, alphanumeric: alphanumeric)
        super.init(frame: .zero)

        cellStack.axis = .horizontal
        cellStack.alignment = .center
        cellStack.spacing = JdToken.Space.s2
        cellStack.isUserInteractionEnabled = false // 터치는 덮개 필드가 전부 받는다
        addSubview(cellStack)

        field.text = self.value
        field.textColor = .clear
        field.tintColor = .clear
        field.backgroundColor = .clear
        field.keyboardType = alphanumeric ? .asciiCapable : .numberPad
        field.textContentType = .oneTimeCode // OTP 변형의 자동완성 (설정 변형 — 별도 타입 아님)
        field.autocapitalizationType = .none
        field.autocorrectionType = .no
        field.accessibilityLabel = accessibilityLabel ?? "인증 번호 입력"
        field.addTarget(self, action: #selector(editingChanged), for: .editingChanged)
        field.addTarget(self, action: #selector(editingBegan), for: .editingDidBegin)
        field.addTarget(self, action: #selector(editingEnded), for: .editingDidEnd)
        addSubview(field)

        cellStack.jd.layout {
            $0.edges.equalToSuperview()
        }
        field.jd.layout {
            $0.edges.equalToSuperview()
        }

        // 칸 N개를 각각 노출하지 않고 컨트롤 하나로 합친다 (DESIGN-3 §A · 04 §7.1)
        accessibilityElements = [field]

        rebuildCells()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 CGColor(border)와 스케일 폰트는 수동 재적용
        applyCells()
    }

    public override func becomeFirstResponder() -> Bool {
        return field.becomeFirstResponder()
    }

    public override func resignFirstResponder() -> Bool {
        return field.resignFirstResponder()
    }

    // MARK: - 칸 (표시 전용)

    private func rebuildCells() {
        for cell in cells { cell.removeFromSuperview() }
        cells.removeAll()
        for _ in 0..<Swift.max(length, 0) {
            let cell = UILabel()
            cell.textAlignment = .center
            cell.adjustsFontForContentSizeCategory = true
            cell.layer.cornerCurve = .continuous
            cell.layer.cornerRadius = JdToken.Radius.lg
            cell.backgroundColor = JdToken.Color.card.uiColor
            cell.layer.borderWidth = JdToken.Border.thin
            // 고정 크기 금지 — 하한만 두고 Dynamic Type에서 자란다 (04 §7.2)
            cell.jd.layout {
                $0.width.greaterThanOrEqual(JdPinInputView.cellWidth)
                $0.height.greaterThanOrEqual(JdPinInputView.cellHeight)
            }
            cells.append(cell)
            cellStack.addArrangedSubview(cell)
        }
        value = JdPinRules.sanitize(value, length: length, alphanumeric: alphanumeric)
        applyCells()
    }

    private func applyCells() {
        let font = JdFontBridge.scaledFont(size: JdToken.FontSize.lg,
                                           weight: JdToken.FontWeight.bold,
                                           compatibleWith: traitCollection)
        // 다음 입력이 들어갈 칸 — 인덱스 판정은 Core
        let active = JdPinRules.focusIndex(value, length: length)
        for (index, cell) in cells.enumerated() {
            cell.font = font
            cell.textColor = JdToken.Color.foreground.uiColor
            cell.text = JdPinRules.cellText(value, index: index, masked: masked)
            let border: JdDynamicColor
            if isError {
                border = JdToken.Color.danger
            } else if isEditing && index == active {
                border = JdToken.Color.primary
            } else {
                border = JdToken.Color.border
            }
            cell.layer.borderColor = border.uiColor.resolvedColor(with: traitCollection).cgColor
        }
        field.accessibilityValue = "\(value.count)자리 입력됨"
    }

    // MARK: - 입력 (정리·완료 판정은 전부 Core)

    @objc private func editingChanged() {
        let next = JdPinRules.sanitize(field.text ?? "", length: length, alphanumeric: alphanumeric)
        let changed = next != value
        value = next // didSet → 필드 되쓰기 + 칸 갱신
        guard changed else { return }
        onValueChange?(next)
        if JdPinRules.isComplete(next, length: length) {
            onComplete?(next)
        }
    }

    @objc private func editingBegan() {
        isEditing = true
        applyCells()
    }

    @objc private func editingEnded() {
        isEditing = false
        applyCells()
    }
}
