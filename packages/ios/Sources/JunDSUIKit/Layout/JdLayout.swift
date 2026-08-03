import JunDSCore
import UIKit

// MARK: - 앵커 참조: 다른 뷰/가이드의 한 변 (04 §5.4)

public struct JdAnchorRef {
    let item: AnyObject  // UIView | UILayoutGuide
    let attribute: NSLayoutConstraint.Attribute

    init(item: AnyObject, attribute: NSLayoutConstraint.Attribute) {
        self.item = item
        self.attribute = attribute
    }
}

public struct JdGuideRef {
    let guide: UILayoutGuide

    public init(guide: UILayoutGuide) {
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

@MainActor
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
    /// 첫 줄의 베이스라인 — 크기가 다른 글자를 나란히 놓을 때 중앙 정렬보다 이쪽이 맞다
    public var firstBaseline: JdAnchorRef { JdAnchorRef(item: view, attribute: .firstBaseline) }
    /// 마지막 줄의 베이스라인 — 여러 줄 라벨 아래에 무언가를 붙일 때
    public var lastBaseline: JdAnchorRef { JdAnchorRef(item: view, attribute: .lastBaseline) }
    public var safeArea: JdGuideRef { JdGuideRef(guide: view.safeAreaLayoutGuide) }
    public var margins: JdGuideRef { JdGuideRef(guide: view.layoutMarginsGuide) }

    // 최초: 일괄 activate. 재호출: 동일 파일 발원 제약에 한해 diff (04 §5.3, DEC-013 보정)
    @discardableResult
    public func layout(
        file: StaticString = #fileID, line: UInt = #line,
        _ make: (JdLayoutProxy) -> Void
    ) -> [NSLayoutConstraint] {
        return apply(make, mode: .diff, file: "\(file)", line: line)
    }

    // 기존 제약의 constant만 갱신 — 키 부재 시 DEBUG assertionFailure
    public func update(
        file: StaticString = #fileID, line: UInt = #line,
        _ make: (JdLayoutProxy) -> Void
    ) {
        _ = apply(make, mode: .constantsOnly, file: "\(file)", line: line)
    }

    // 이 DSL이 이 뷰에 설치한 제약 전부 해제 후 새로 설치
    @discardableResult
    public func remake(
        file: StaticString = #fileID, line: UInt = #line,
        _ make: (JdLayoutProxy) -> Void
    ) -> [NSLayoutConstraint] {
        JdConstraintStore.of(view).deactivateAll()
        return apply(make, mode: .diff, file: "\(file)", line: line)
    }

    public func deactivate() {
        JdConstraintStore.of(view).deactivateAll()
    }

    private func apply(
        _ make: (JdLayoutProxy) -> Void,
        mode: JdConstraintStore.Mode,
        file: String, line: UInt
    ) -> [NSLayoutConstraint] {
        view.translatesAutoresizingMaskIntoConstraints = false
        let proxy = JdLayoutProxy(view: view, sourceFile: file, sourceLine: line)
        make(proxy)
        return JdConstraintStore.of(view).apply(
            proxy.descriptors, mode: mode, view: view, sourceFile: file)
    }
}

public extension UIView {
    @MainActor
    var jd: JdLayoutDSL { JdLayoutDSL(view: self) }
}

public extension UILayoutGuide {
    /// 직접 만든 가이드도 뷰와 같은 문법으로 참조한다.
    ///
    /// ```swift
    /// let gutter = UILayoutGuide()
    /// container.addLayoutGuide(gutter)
    /// NSLayoutConstraint.activate([                       // 가이드 자체의 위치는 앵커로
    ///     gutter.leadingAnchor.constraint(equalTo: container.leadingAnchor, constant: 16),
    ///     gutter.trailingAnchor.constraint(equalTo: container.trailingAnchor, constant: -16),
    /// ])
    /// title.jd.layout { $0.horizontal.equal(to: gutter.jd) }   // 여러 뷰가 공유
    /// body.jd.layout { $0.horizontal.equal(to: gutter.jd) }
    /// ```
    ///
    /// 가이드는 화면에 그려지지 않는 배치용 기준선이다. 여백 규칙을 한 번 정의해 여러
    /// 뷰가 공유할 때 더미 뷰를 만드는 것보다 싸다(그리기·접근성 트리에 안 올라간다).
    ///
    /// ⚠️ 참조 전용이다. `JdConstraintStore`가 뷰 단위로 제약을 소유하므로 **가이드 자체를**
    /// `jd.layout`으로 배치하지는 않는다 — 위 예시처럼 앵커로 한 번 고정하고 쓴다.
    var jd: JdGuideRef { JdGuideRef(guide: self) }
}

// MARK: - 서술자: 활성화 전의 제약 1건 (후위 수정자가 변이하므로 클래스)

enum JdSecondItem {
    case none
    case superview
    case superviewSafeArea
    case superviewMargins
    case ref(JdAnchorRef)
}

@MainActor
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

    init(
        firstAttribute: NSLayoutConstraint.Attribute,
        relation: NSLayoutConstraint.Relation,
        second: JdSecondItem,
        constant: CGFloat,
        sourceFile: String,
        sourceLine: UInt
    ) {
        self.firstAttribute = firstAttribute
        self.relation = relation
        self.second = second
        self.constant = constant
        self.sourceFile = sourceFile
        self.sourceLine = sourceLine
    }
}

// MARK: - 수집 프록시: layout 블록의 $0

@MainActor
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
    public var firstBaseline: JdConstraintBuilder { JdConstraintBuilder(self, [.firstBaseline]) }
    public var lastBaseline: JdConstraintBuilder { JdConstraintBuilder(self, [.lastBaseline]) }
    /// leading + trailing — `$0.leading.trailing`을 매번 적지 않게
    public var horizontal: JdConstraintBuilder { JdConstraintBuilder(self, [.leading, .trailing]) }
    /// top + bottom
    public var vertical: JdConstraintBuilder { JdConstraintBuilder(self, [.top, .bottom]) }
    public var edges: JdConstraintBuilder {
        JdConstraintBuilder(self, [.top, .leading, .bottom, .trailing])
    }
    public var size: JdConstraintBuilder { JdConstraintBuilder(self, [.width, .height]) }
    public var center: JdConstraintBuilder { JdConstraintBuilder(self, [.centerX, .centerY]) }
}

// MARK: - 빌더: 앵커 체이닝 후 관계 확정

@MainActor
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
    public var firstBaseline: JdConstraintBuilder { attributes.append(.firstBaseline); return self }
    public var lastBaseline: JdConstraintBuilder { attributes.append(.lastBaseline); return self }
    public var horizontal: JdConstraintBuilder {
        attributes.append(contentsOf: [.leading, .trailing]); return self
    }
    public var vertical: JdConstraintBuilder {
        attributes.append(contentsOf: [.top, .bottom]); return self
    }

    // MARK: equal

    /// 명시한 **한 축**에 붙인다 — `$0.top.equal(to: header.jd.bottom)`처럼 축을 건너뛸 때.
    ///
    /// 여러 축을 체이닝한 채 단일 앵커를 주면 전부 그 한 축에 붙는다. 그게 의도인 경우는
    /// 거의 없으므로(예: leading·trailing을 둘 다 상대의 leading에 붙이면 폭이 0이 된다)
    /// DEBUG에서 잡는다. 축을 맞춰 붙이려면 뷰나 가이드를 그대로 넘겨라.
    @discardableResult
    public func equal(to ref: JdAnchorRef, offset: CGFloat = 0) -> JdConstraintEditor {
        assertSingleAxisForExplicitAnchor()
        return finalize(.equal, constant: { _ in offset }, second: { _ in .ref(ref) })
    }

    /// 상대 뷰의 **같은 축**에 붙인다 — `$0.leading.trailing.equal(to: other)`.
    @discardableResult
    public func equal(to view: UIView, offset: CGFloat = 0) -> JdConstraintEditor {
        return finalize(
            .equal, constant: { _ in offset },
            second: { attr in .ref(JdAnchorRef(item: view, attribute: attr)) })
    }

    @discardableResult
    public func equal(to guide: JdGuideRef, offset: CGFloat = 0) -> JdConstraintEditor {
        return finalize(
            .equal, constant: { _ in offset },
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
        return finalize(
            .equal,
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
        assertSingleAxisForExplicitAnchor()
        return finalize(.greaterThanOrEqual, constant: { _ in offset }, second: { _ in .ref(ref) })
    }

    /// 상대 뷰의 **같은 축** 기준
    @discardableResult
    public func greaterThanOrEqual(to view: UIView, offset: CGFloat = 0) -> JdConstraintEditor {
        return finalize(
            .greaterThanOrEqual, constant: { _ in offset },
            second: { attr in .ref(JdAnchorRef(item: view, attribute: attr)) })
    }

    @discardableResult
    public func greaterThanOrEqual(to guide: JdGuideRef, offset: CGFloat = 0) -> JdConstraintEditor
    {
        return finalize(
            .greaterThanOrEqual, constant: { _ in offset },
            second: { attr in .ref(JdAnchorRef(item: guide.guide, attribute: attr)) })
    }

    @discardableResult
    public func greaterThanOrEqual(_ constant: CGFloat) -> JdConstraintEditor {
        assertDimensionOnly()
        return finalize(
            .greaterThanOrEqual, constant: { _ in constant }, second: { _ in JdSecondItem.none })
    }

    @discardableResult
    public func greaterThanOrEqualToSuperview() -> JdConstraintEditor {
        return finalize(.greaterThanOrEqual, constant: { _ in 0 }, second: { _ in .superview })
    }

    @discardableResult
    public func greaterThanOrEqualToSafeArea() -> JdConstraintEditor {
        return finalize(
            .greaterThanOrEqual, constant: { _ in 0 }, second: { _ in .superviewSafeArea })
    }

    @discardableResult
    public func greaterThanOrEqualToMargins() -> JdConstraintEditor {
        return finalize(
            .greaterThanOrEqual, constant: { _ in 0 }, second: { _ in .superviewMargins })
    }

    // MARK: lessThanOrEqual

    @discardableResult
    public func lessThanOrEqual(to ref: JdAnchorRef, offset: CGFloat = 0) -> JdConstraintEditor {
        assertSingleAxisForExplicitAnchor()
        return finalize(.lessThanOrEqual, constant: { _ in offset }, second: { _ in .ref(ref) })
    }

    /// 상대 뷰의 **같은 축** 기준
    @discardableResult
    public func lessThanOrEqual(to view: UIView, offset: CGFloat = 0) -> JdConstraintEditor {
        return finalize(
            .lessThanOrEqual, constant: { _ in offset },
            second: { attr in .ref(JdAnchorRef(item: view, attribute: attr)) })
    }

    @discardableResult
    public func lessThanOrEqual(to guide: JdGuideRef, offset: CGFloat = 0) -> JdConstraintEditor {
        return finalize(
            .lessThanOrEqual, constant: { _ in offset },
            second: { attr in .ref(JdAnchorRef(item: guide.guide, attribute: attr)) })
    }

    @discardableResult
    public func lessThanOrEqual(_ constant: CGFloat) -> JdConstraintEditor {
        assertDimensionOnly()
        return finalize(
            .lessThanOrEqual, constant: { _ in constant }, second: { _ in JdSecondItem.none })
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

    // 여러 축 + 단일 앵커 = 거의 항상 실수다. SnapKit의 `equalTo(other)`처럼 축이
    // 알아서 맞기를 기대하고 `equal(to: other.jd.leading)`을 적는 경우가 대부분이라,
    // 조용히 이상한 배치를 만드는 대신 고치는 법을 알려 준다.
    private func assertSingleAxisForExplicitAnchor() {
        assert(
            attributes.count == 1,
            """
            jd.layout: 축을 여럿 체이닝한 채 단일 앵커에 붙이면 전부 그 한 축으로 간다.
            축을 맞춰 붙이려면 앵커가 아니라 뷰/가이드를 넘겨라 —
            `$0.horizontal.equal(to: other)` (O)
            `$0.horizontal.equal(to: other.jd.leading)` (X)
            """)
    }

    private func assertDimensionOnly() {
        assert(
            attributes.allSatisfy { $0 == .width || $0 == .height },
            "jd.layout: 상수 관계는 width/height 축 전용이다")
    }

    private func finalize(
        _ relation: NSLayoutConstraint.Relation,
        constant: (NSLayoutConstraint.Attribute) -> CGFloat,
        second: (NSLayoutConstraint.Attribute) -> JdSecondItem
    ) -> JdConstraintEditor {
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

@MainActor
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

    /// 토큰 간격 — `offset(16)` 대신 `offset(.md)`.
    ///
    /// 원시 CGFloat만 받으면 "토큰이 API에 강제된다"는 성질이 여기서 샌다.
    /// `JdGap`이 스택의 spacing에서 하드코딩을 막은 것과 같은 이유로 제약에도 둔다 —
    /// 토큰 밖 값이 필요하면 `.custom(17)`이 남아 있고, 그건 grep으로 찾힌다.
    @discardableResult
    public func offset(_ gap: JdGap) -> JdConstraintEditor {
        offset(gap.value)
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

    /// 토큰 여백 — `inset(16)` 대신 `inset(.md)`. trailing/bottom 부호 반전은 그대로 처리된다.
    @discardableResult
    public func inset(_ gap: JdGap) -> JdConstraintEditor {
        inset(gap.value)
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

    // `NSLayoutConstraint.multiplier`는 읽기 전용이라 설치된 제약을 그 자리에서 못 바꾼다.
    // 그래서 Key에 multiplier를 넣어 뒀다 — **`layout` 재호출은 값이 바뀌면 자연히 새 제약을
    // 만들고 옛 것을 stale로 걷어 간다.** remake가 필요하지 않다(회귀 테스트로 고정).
    // 못 바꾸는 것은 `update`뿐이고, 그건 "상수만 갱신"이라는 계약 그대로다.
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

@MainActor
final class JdConstraintStore {
    // associated object 키. `var` 전역의 주소(`&key`)를 쓰는 옛 관용구는 Swift 6에서
    // 전역 가변 상태로 진단된다. 액터 격리된 static let으로 두면 주소는 안정적이면서
    // 격리 검사도 통과한다 — 접근하는 of(_:)가 이미 MainActor다.
    private static let associatedKey =
        UnsafeMutableRawPointer.allocate(byteCount: 1, alignment: 1)

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
        if let existing = objc_getAssociatedObject(view, associatedKey) as? JdConstraintStore {
            return existing
        }
        let store = JdConstraintStore()
        objc_setAssociatedObject(view, associatedKey, store, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
        return store
    }

    func apply(
        _ descriptors: [JdConstraintDescriptor],
        mode: Mode,
        view: UIView,
        sourceFile: String
    ) -> [NSLayoutConstraint] {
        var result: [NSLayoutConstraint] = []
        var created: [NSLayoutConstraint] = []
        var seen = Set<Key>()

        for descriptor in descriptors {
            let resolved = resolveSecond(descriptor, view: view)
            var secondID: ObjectIdentifier?
            if let item = resolved.item { secondID = ObjectIdentifier(item) }
            let key = Key(
                firstAttribute: descriptor.firstAttribute.rawValue,
                secondItem: secondID,
                secondAttribute: resolved.attribute.rawValue,
                relation: descriptor.relation.rawValue,
                multiplier: descriptor.multiplier)
            seen.insert(key)

            if let entry = installed[key] {
                if entry.constraint.constant != descriptor.constant {
                    entry.constraint.constant = descriptor.constant
                }
                if let manual = descriptor.identifier, entry.constraint.identifier != manual {
                    entry.constraint.identifier = manual
                }
                // 우선순위 변경은 layout/remake(.diff)에서만 의미가 있다. update는
                // "상수만 갱신"이 계약이고 descriptor의 priority는 기본값(.required)이라
                // 여기서 비교하면 없던 변경을 만들어 낸다.
                //
                // 제자리 갱신이 원칙이지만 **설치된** 제약을 required와 오가게 바꾸는 것은
                // UIKit이 예외로 막는다. 그 조합일 때만 폐기하고 아래 생성 경로로
                // 떨어뜨린다 — 조용히 무시하면 두 번째 layout 호출에서 priority가 사라진
                // 채로 화면만 이상해진다(DEC-013 보정 2).
                let old = entry.constraint.priority
                let new = descriptor.priority
                let mustRecreate =
                    mode == .diff && old != new
                    && (old == .required || new == .required)
                if mode == .diff && old != new && !mustRecreate {
                    entry.constraint.priority = new
                }
                if !mustRecreate {
                    result.append(entry.constraint)
                    continue
                }
                entry.constraint.isActive = false
                installed.removeValue(forKey: key)
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
                constraint.identifier =
                    "jd @\(descriptor.sourceFile):\(descriptor.sourceLine) \(type(of: view)).\(name)"
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

    private func resolveSecond(
        _ descriptor: JdConstraintDescriptor,
        view: UIView
    ) -> (item: AnyObject?, attribute: NSLayoutConstraint.Attribute) {
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
        case .firstBaseline: return "firstBaseline"
        case .lastBaseline: return "lastBaseline"
        default: return "attr(\(attribute.rawValue))"
        }
    }
}
