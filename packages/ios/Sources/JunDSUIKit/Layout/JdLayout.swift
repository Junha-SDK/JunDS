import UIKit

// MARK: - 앵커 참조: 다른 뷰/가이드의 한 변 (04 §5.4)

public struct JdAnchorRef {
    let item: AnyObject // UIView | UILayoutGuide
    let attribute: NSLayoutConstraint.Attribute

    init(item: AnyObject, attribute: NSLayoutConstraint.Attribute) {
        self.item = item
        self.attribute = attribute
    }
}

public struct JdGuideRef {
    let guide: UILayoutGuide

    init(guide: UILayoutGuide) {
        self.guide = guide
    }

    public var top: JdAnchorRef { JdAnchorRef(item: guide, attribute: .top) }
    public var bottom: JdAnchorRef { JdAnchorRef(item: guide, attribute: .bottom) }
    public var leading: JdAnchorRef { JdAnchorRef(item: guide, attribute: .leading) }
    public var trailing: JdAnchorRef { JdAnchorRef(item: guide, attribute: .trailing) }
    public var centerX: JdAnchorRef { JdAnchorRef(item: guide, attribute: .centerX) }
    public var centerY: JdAnchorRef { JdAnchorRef(item: guide, attribute: .centerY) }
}

// MARK: - 진입 네임스페이스: view.jd

public struct JdLayoutDSL {
    let view: UIView

    public var top: JdAnchorRef { JdAnchorRef(item: view, attribute: .top) }
    public var bottom: JdAnchorRef { JdAnchorRef(item: view, attribute: .bottom) }
    public var leading: JdAnchorRef { JdAnchorRef(item: view, attribute: .leading) }
    public var trailing: JdAnchorRef { JdAnchorRef(item: view, attribute: .trailing) }
    public var centerX: JdAnchorRef { JdAnchorRef(item: view, attribute: .centerX) }
    public var centerY: JdAnchorRef { JdAnchorRef(item: view, attribute: .centerY) }
    public var width: JdAnchorRef { JdAnchorRef(item: view, attribute: .width) }
    public var height: JdAnchorRef { JdAnchorRef(item: view, attribute: .height) }
    public var safeArea: JdGuideRef { JdGuideRef(guide: view.safeAreaLayoutGuide) }
    public var margins: JdGuideRef { JdGuideRef(guide: view.layoutMarginsGuide) }

    // 최초: 일괄 activate. 재호출: 동일 파일 발원 제약에 한해 diff (04 §5.3, DEC-013 보정)
    @discardableResult
    public func layout(file: StaticString = #fileID, line: UInt = #line,
                       _ make: (JdLayoutProxy) -> Void) -> [NSLayoutConstraint] {
        return apply(make, mode: .diff, file: "\(file)", line: line)
    }

    // 기존 제약의 constant만 갱신 — 키 부재 시 DEBUG assertionFailure
    public func update(file: StaticString = #fileID, line: UInt = #line,
                       _ make: (JdLayoutProxy) -> Void) {
        _ = apply(make, mode: .constantsOnly, file: "\(file)", line: line)
    }

    // 이 DSL이 이 뷰에 설치한 제약 전부 해제 후 새로 설치
    @discardableResult
    public func remake(file: StaticString = #fileID, line: UInt = #line,
                       _ make: (JdLayoutProxy) -> Void) -> [NSLayoutConstraint] {
        JdConstraintStore.of(view).deactivateAll()
        return apply(make, mode: .diff, file: "\(file)", line: line)
    }

    public func deactivate() {
        JdConstraintStore.of(view).deactivateAll()
    }

    private func apply(_ make: (JdLayoutProxy) -> Void,
                       mode: JdConstraintStore.Mode,
                       file: String, line: UInt) -> [NSLayoutConstraint] {
        view.translatesAutoresizingMaskIntoConstraints = false
        let proxy = JdLayoutProxy(view: view, sourceFile: file, sourceLine: line)
        make(proxy)
        return JdConstraintStore.of(view).apply(proxy.descriptors, mode: mode, view: view, sourceFile: file)
    }
}

public extension UIView {
    var jd: JdLayoutDSL { JdLayoutDSL(view: self) }
}

// MARK: - 서술자: 활성화 전의 제약 1건 (후위 수정자가 변이하므로 클래스)

enum JdSecondItem {
    case none
    case superview
    case superviewSafeArea
    case superviewMargins
    case ref(JdAnchorRef)
}

final class JdConstraintDescriptor {
    let firstAttribute: NSLayoutConstraint.Attribute
    let relation: NSLayoutConstraint.Relation
    let second: JdSecondItem
    var constant: CGFloat
    var multiplier: CGFloat = 1
    var priority: UILayoutPriority = .required
    var identifier: String?
    let sourceFile: String
    let sourceLine: UInt

    init(firstAttribute: NSLayoutConstraint.Attribute,
         relation: NSLayoutConstraint.Relation,
         second: JdSecondItem,
         constant: CGFloat,
         sourceFile: String,
         sourceLine: UInt) {
        self.firstAttribute = firstAttribute
        self.relation = relation
        self.second = second
        self.constant = constant
        self.sourceFile = sourceFile
        self.sourceLine = sourceLine
    }
}

// MARK: - 수집 프록시: layout 블록의 $0

public final class JdLayoutProxy {
    let view: UIView
    let sourceFile: String
    let sourceLine: UInt
    var descriptors: [JdConstraintDescriptor] = []

    init(view: UIView, sourceFile: String, sourceLine: UInt) {
        self.view = view
        self.sourceFile = sourceFile
        self.sourceLine = sourceLine
    }

    public var top: JdConstraintBuilder { JdConstraintBuilder(self, [.top]) }
    public var bottom: JdConstraintBuilder { JdConstraintBuilder(self, [.bottom]) }
    public var leading: JdConstraintBuilder { JdConstraintBuilder(self, [.leading]) }
    public var trailing: JdConstraintBuilder { JdConstraintBuilder(self, [.trailing]) }
    public var centerX: JdConstraintBuilder { JdConstraintBuilder(self, [.centerX]) }
    public var centerY: JdConstraintBuilder { JdConstraintBuilder(self, [.centerY]) }
    public var width: JdConstraintBuilder { JdConstraintBuilder(self, [.width]) }
    public var height: JdConstraintBuilder { JdConstraintBuilder(self, [.height]) }
    public var edges: JdConstraintBuilder { JdConstraintBuilder(self, [.top, .leading, .bottom, .trailing]) }
    public var size: JdConstraintBuilder { JdConstraintBuilder(self, [.width, .height]) }
    public var center: JdConstraintBuilder { JdConstraintBuilder(self, [.centerX, .centerY]) }
}

// MARK: - 빌더: 앵커 체이닝 후 관계 확정

public final class JdConstraintBuilder {
    private let proxy: JdLayoutProxy
    private var attributes: [NSLayoutConstraint.Attribute]

    init(_ proxy: JdLayoutProxy, _ attributes: [NSLayoutConstraint.Attribute]) {
        self.proxy = proxy
        self.attributes = attributes
    }

    // 체이닝: $0.leading.trailing — 앵커 프로퍼티가 attributes에 누적
    public var top: JdConstraintBuilder { attributes.append(.top); return self }
    public var bottom: JdConstraintBuilder { attributes.append(.bottom); return self }
    public var leading: JdConstraintBuilder { attributes.append(.leading); return self }
    public var trailing: JdConstraintBuilder { attributes.append(.trailing); return self }
    public var centerX: JdConstraintBuilder { attributes.append(.centerX); return self }
    public var centerY: JdConstraintBuilder { attributes.append(.centerY); return self }
    public var width: JdConstraintBuilder { attributes.append(.width); return self }
    public var height: JdConstraintBuilder { attributes.append(.height); return self }

    // MARK: equal

    @discardableResult
    public func equal(to ref: JdAnchorRef, offset: CGFloat = 0) -> JdConstraintEditor {
        return finalize(.equal, constant: { _ in offset }, second: { _ in .ref(ref) })
    }

    @discardableResult
    public func equal(to guide: JdGuideRef, offset: CGFloat = 0) -> JdConstraintEditor {
        return finalize(.equal, constant: { _ in offset },
                        second: { attr in .ref(JdAnchorRef(item: guide.guide, attribute: attr)) })
    }

    // width/height 전용 상수 관계 — 그 외 축이면 DEBUG assertion
    @discardableResult
    public func equal(_ constant: CGFloat) -> JdConstraintEditor {
        assertDimensionOnly()
        return finalize(.equal, constant: { _ in constant }, second: { _ in JdSecondItem.none })
    }

    @discardableResult
    public func equal(_ size: CGSize) -> JdConstraintEditor {
        assertDimensionOnly()
        return finalize(.equal,
                        constant: { attr in attr == .width ? size.width : size.height },
                        second: { _ in JdSecondItem.none })
    }

    @discardableResult
    public func equalToSuperview() -> JdConstraintEditor {
        return finalize(.equal, constant: { _ in 0 }, second: { _ in .superview })
    }

    @discardableResult
    public func equalToSafeArea() -> JdConstraintEditor {
        return finalize(.equal, constant: { _ in 0 }, second: { _ in .superviewSafeArea })
    }

    @discardableResult
    public func equalToMargins() -> JdConstraintEditor {
        return finalize(.equal, constant: { _ in 0 }, second: { _ in .superviewMargins })
    }

    // MARK: greaterThanOrEqual

    @discardableResult
    public func greaterThanOrEqual(to ref: JdAnchorRef, offset: CGFloat = 0) -> JdConstraintEditor {
        return finalize(.greaterThanOrEqual, constant: { _ in offset }, second: { _ in .ref(ref) })
    }

    @discardableResult
    public func greaterThanOrEqual(to guide: JdGuideRef, offset: CGFloat = 0) -> JdConstraintEditor {
        return finalize(.greaterThanOrEqual, constant: { _ in offset },
                        second: { attr in .ref(JdAnchorRef(item: guide.guide, attribute: attr)) })
    }

    @discardableResult
    public func greaterThanOrEqual(_ constant: CGFloat) -> JdConstraintEditor {
        assertDimensionOnly()
        return finalize(.greaterThanOrEqual, constant: { _ in constant }, second: { _ in JdSecondItem.none })
    }

    @discardableResult
    public func greaterThanOrEqualToSuperview() -> JdConstraintEditor {
        return finalize(.greaterThanOrEqual, constant: { _ in 0 }, second: { _ in .superview })
    }

    @discardableResult
    public func greaterThanOrEqualToSafeArea() -> JdConstraintEditor {
        return finalize(.greaterThanOrEqual, constant: { _ in 0 }, second: { _ in .superviewSafeArea })
    }

    @discardableResult
    public func greaterThanOrEqualToMargins() -> JdConstraintEditor {
        return finalize(.greaterThanOrEqual, constant: { _ in 0 }, second: { _ in .superviewMargins })
    }

    // MARK: lessThanOrEqual

    @discardableResult
    public func lessThanOrEqual(to ref: JdAnchorRef, offset: CGFloat = 0) -> JdConstraintEditor {
        return finalize(.lessThanOrEqual, constant: { _ in offset }, second: { _ in .ref(ref) })
    }

    @discardableResult
    public func lessThanOrEqual(to guide: JdGuideRef, offset: CGFloat = 0) -> JdConstraintEditor {
        return finalize(.lessThanOrEqual, constant: { _ in offset },
                        second: { attr in .ref(JdAnchorRef(item: guide.guide, attribute: attr)) })
    }

    @discardableResult
    public func lessThanOrEqual(_ constant: CGFloat) -> JdConstraintEditor {
        assertDimensionOnly()
        return finalize(.lessThanOrEqual, constant: { _ in constant }, second: { _ in JdSecondItem.none })
    }

    @discardableResult
    public func lessThanOrEqualToSuperview() -> JdConstraintEditor {
        return finalize(.lessThanOrEqual, constant: { _ in 0 }, second: { _ in .superview })
    }

    @discardableResult
    public func lessThanOrEqualToSafeArea() -> JdConstraintEditor {
        return finalize(.lessThanOrEqual, constant: { _ in 0 }, second: { _ in .superviewSafeArea })
    }

    @discardableResult
    public func lessThanOrEqualToMargins() -> JdConstraintEditor {
        return finalize(.lessThanOrEqual, constant: { _ in 0 }, second: { _ in .superviewMargins })
    }

    // MARK: 내부

    private func assertDimensionOnly() {
        assert(attributes.allSatisfy { $0 == .width || $0 == .height },
               "jd.layout: 상수 관계는 width/height 축 전용이다")
    }

    private func finalize(_ relation: NSLayoutConstraint.Relation,
                          constant: (NSLayoutConstraint.Attribute) -> CGFloat,
                          second: (NSLayoutConstraint.Attribute) -> JdSecondItem) -> JdConstraintEditor {
        var items: [JdConstraintDescriptor] = []
        for attr in attributes {
            let descriptor = JdConstraintDescriptor(
                firstAttribute: attr,
                relation: relation,
                second: second(attr),
                constant: constant(attr),
                sourceFile: proxy.sourceFile,
                sourceLine: proxy.sourceLine
            )
            items.append(descriptor)
        }
        proxy.descriptors.append(contentsOf: items)
        return JdConstraintEditor(items: items)
    }
}

// MARK: - 후위 수정자: 수집된 서술자를 활성화 전에 변이

public final class JdConstraintEditor {
    let items: [JdConstraintDescriptor]

    init(items: [JdConstraintDescriptor]) {
        self.items = items
    }

    @discardableResult
    public func offset(_ value: CGFloat) -> JdConstraintEditor {
        for item in items { item.constant = value }
        return self
    }

    // trailing/bottom은 부호 반전 (04 §5.2)
    @discardableResult
    public func inset(_ value: CGFloat) -> JdConstraintEditor {
        for item in items {
            if item.firstAttribute == .trailing || item.firstAttribute == .bottom {
                item.constant = -value
            } else {
                item.constant = value
            }
        }
        return self
    }

    @discardableResult
    public func inset(_ insets: NSDirectionalEdgeInsets) -> JdConstraintEditor {
        for item in items {
            switch item.firstAttribute {
            case .top: item.constant = insets.top
            case .leading: item.constant = insets.leading
            case .bottom: item.constant = -insets.bottom
            case .trailing: item.constant = -insets.trailing
            default: break
            }
        }
        return self
    }

    // 활성화 전에만 유효 — update에서 변경 시 remake 필요 (NSLayoutConstraint 자체 제약)
    @discardableResult
    public func multiplier(_ value: CGFloat) -> JdConstraintEditor {
        for item in items { item.multiplier = value }
        return self
    }

    @discardableResult
    public func priority(_ value: UILayoutPriority) -> JdConstraintEditor {
        for item in items { item.priority = value }
        return self
    }

    @discardableResult
    public func priority(_ value: Float) -> JdConstraintEditor {
        return priority(UILayoutPriority(rawValue: value))
    }

    @discardableResult
    public func identifier(_ value: String) -> JdConstraintEditor {
        for item in items { item.identifier = value }
        return self
    }
}

// MARK: - 저장소: 뷰별 설치 제약 (associated object) + diff 적용

private var jdConstraintStoreKey: UInt8 = 0

final class JdConstraintStore {
    enum Mode {
        case diff
        case constantsOnly
    }

    struct Key: Hashable {
        let firstAttribute: Int
        let secondItem: ObjectIdentifier?
        let secondAttribute: Int
        let relation: Int
        let multiplier: CGFloat
    }

    struct Entry {
        let constraint: NSLayoutConstraint
        let sourceFile: String
    }

    private var installed: [Key: Entry] = [:]

    static func of(_ view: UIView) -> JdConstraintStore {
        if let existing = objc_getAssociatedObject(view, &jdConstraintStoreKey) as? JdConstraintStore {
            return existing
        }
        let store = JdConstraintStore()
        objc_setAssociatedObject(view, &jdConstraintStoreKey, store, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
        return store
    }

    func apply(_ descriptors: [JdConstraintDescriptor],
               mode: Mode,
               view: UIView,
               sourceFile: String) -> [NSLayoutConstraint] {
        var result: [NSLayoutConstraint] = []
        var created: [NSLayoutConstraint] = []
        var seen = Set<Key>()

        for descriptor in descriptors {
            let resolved = resolveSecond(descriptor, view: view)
            var secondID: ObjectIdentifier?
            if let item = resolved.item { secondID = ObjectIdentifier(item) }
            let key = Key(firstAttribute: descriptor.firstAttribute.rawValue,
                          secondItem: secondID,
                          secondAttribute: resolved.attribute.rawValue,
                          relation: descriptor.relation.rawValue,
                          multiplier: descriptor.multiplier)
            seen.insert(key)

            if let entry = installed[key] {
                if entry.constraint.constant != descriptor.constant {
                    entry.constraint.constant = descriptor.constant
                }
                result.append(entry.constraint)
                continue
            }

            if mode == .constantsOnly {
                assertionFailure("jd.update: 대응하는 기존 제약이 없다 — layout/remake를 쓰라 (\(sourceFile))")
                continue
            }

            let constraint = NSLayoutConstraint(
                item: view,
                attribute: descriptor.firstAttribute,
                relatedBy: descriptor.relation,
                toItem: resolved.item,
                attribute: resolved.attribute,
                multiplier: descriptor.multiplier,
                constant: descriptor.constant
            )
            constraint.priority = descriptor.priority
            if let manual = descriptor.identifier {
                constraint.identifier = manual
            } else {
                let name = JdConstraintStore.attributeName(descriptor.firstAttribute)
                constraint.identifier = "jd @\(descriptor.sourceFile):\(descriptor.sourceLine) \(type(of: view)).\(name)"
            }
            installed[key] = Entry(constraint: constraint, sourceFile: sourceFile)
            created.append(constraint)
            result.append(constraint)
        }

        if mode == .diff {
            // diff 범위는 동일 파일 발원 제약으로 한정 — 컴포넌트 자기 제약과
            // 소비자 제약의 상호 삭제 방지 (DEC-013, 04 §5.3 보정)
            var stale: [Key] = []
            for (key, entry) in installed {
                if entry.sourceFile == sourceFile && !seen.contains(key) {
                    stale.append(key)
                }
            }
            for key in stale {
                if let entry = installed.removeValue(forKey: key) {
                    entry.constraint.isActive = false
                }
            }
        }

        NSLayoutConstraint.activate(created)
        return result
    }

    func deactivateAll() {
        let constraints = installed.values.map { $0.constraint }
        NSLayoutConstraint.deactivate(constraints)
        installed.removeAll()
    }

    // 테스트 어서션 지원 (04 §8.2)
    func installedConstraint(for attribute: NSLayoutConstraint.Attribute) -> NSLayoutConstraint? {
        for (key, entry) in installed where key.firstAttribute == attribute.rawValue {
            return entry.constraint
        }
        return nil
    }

    var installedCount: Int { installed.count }

    private func resolveSecond(_ descriptor: JdConstraintDescriptor,
                               view: UIView) -> (item: AnyObject?, attribute: NSLayoutConstraint.Attribute) {
        switch descriptor.second {
        case .none:
            return (nil, .notAnAttribute)
        case .superview:
            guard let superview = view.superview else {
                preconditionFailure("jd.layout: addSubview 이후에 layout을 호출하라 (superview 부재)")
            }
            return (superview, descriptor.firstAttribute)
        case .superviewSafeArea:
            guard let superview = view.superview else {
                preconditionFailure("jd.layout: addSubview 이후에 layout을 호출하라 (superview 부재)")
            }
            return (superview.safeAreaLayoutGuide, descriptor.firstAttribute)
        case .superviewMargins:
            guard let superview = view.superview else {
                preconditionFailure("jd.layout: addSubview 이후에 layout을 호출하라 (superview 부재)")
            }
            return (superview.layoutMarginsGuide, descriptor.firstAttribute)
        case .ref(let ref):
            return (ref.item, ref.attribute)
        }
    }

    static func attributeName(_ attribute: NSLayoutConstraint.Attribute) -> String {
        switch attribute {
        case .top: return "top"
        case .bottom: return "bottom"
        case .leading: return "leading"
        case .trailing: return "trailing"
        case .centerX: return "centerX"
        case .centerY: return "centerY"
        case .width: return "width"
        case .height: return "height"
        default: return "attr(\(attribute.rawValue))"
        }
    }
}
