import JunDSCore
import UIKit

// MARK: - 한 줄 배치 (DEC-053)
//
// ## 무엇이 남아 있었나
// `jd.layout { … }`은 제약을 정확히 표현하지만 **가장 흔한 배치**에도 클로저를 열게 한다.
// 그리고 그 클로저 안의 `equalToSuperview()`는 addSubview를 먼저 하지 않으면
// `preconditionFailure`로 앱을 죽인다 — 순서를 기억해야 하는 함정이 남아 있었다.
//
// SnapKit도 같은 모양이다:
// ```swift
// parent.addSubview(view)                       // 잊으면 크래시
// view.snp.makeConstraints { make in
//     make.center.equalToSuperview()
//     make.size.equalTo(CGSize(width: 100, height: 100))
// }
// ```
// 네 줄이고, 첫 줄을 잊을 수 있고, `make`라는 이름을 배워야 한다.
//
// 여기서는:
// ```swift
// view.jdCenter(in: parent).jdSize(100)
// ```
// 부모를 **인자로 받으므로** addSubview를 스스로 하고, 그래서 순서를 틀릴 수가 없다.
// 클로저도 새 이름도 없다.
//
// ## 어디까지 넣었나 — 흔한 것만
// 제약 전반은 여전히 `jd.layout`의 몫이다. 여기 있는 것은 화면을 짤 때 반복해서 나오는
// 다섯 가지(채우기·안전영역·가운데·일부 변·형제 아래)와 비율뿐이다. 이 목록이 길어지면
// "어느 걸 쓰지"를 다시 고민하게 되므로 늘리지 않는 편이 낫다.
//
// ## 여백은 토큰으로 받는다
// `jdFill(parent, insets:)`는 `NSDirectionalEdgeInsets`만 받아서, 토큰을 쓰려면
// `JdEdge.all(.md)`를 거쳐야 했다. 한 단계 더 거치게 하면 결국 `16`을 적게 된다 —
// `JdGap`을 직접 받는 오버로드를 둔다 (JdGap이 원시 CGFloat를 막은 것과 같은 이유).

public extension NSDirectionalRectEdge {
    /// leading + trailing — `[.leading, .trailing]`을 매번 적지 않게
    static let horizontal: NSDirectionalRectEdge = [.leading, .trailing]
    /// top + bottom
    static let vertical: NSDirectionalRectEdge = [.top, .bottom]
}

public extension UIView {

    // MARK: 채우기

    /// 부모를 채운다 — 토큰 여백판. `jdFill(parent, insets: JdEdge.all(.md))`의 축약.
    @discardableResult
    func jdFill(_ parent: UIView, padding: JdGap) -> Self {
        jdFill(parent, insets: JdEdge.all(padding))
    }

    /// 부모의 안전 영역을 채운다 — 토큰 여백판.
    @discardableResult
    func jdFillSafeArea(_ parent: UIView, padding: JdGap) -> Self {
        jdFillSafeArea(parent, insets: JdEdge.all(padding))
    }

    // MARK: 가운데

    /// 부모 가운데에 놓는다 — `addSubview` + centerX/centerY를 한 줄로.
    ///
    /// ```swift
    /// spinner.jdCenter(in: view)
    /// badge.jdCenter(in: avatar, offsetX: 12, offsetY: -12)   // 모서리 배지
    /// ```
    @discardableResult
    func jdCenter(in parent: UIView, offsetX: CGFloat = 0, offsetY: CGFloat = 0) -> Self {
        translatesAutoresizingMaskIntoConstraints = false
        parent.addSubview(self)
        NSLayoutConstraint.activate([
            centerXAnchor.constraint(equalTo: parent.centerXAnchor, constant: offsetX),
            centerYAnchor.constraint(equalTo: parent.centerYAnchor, constant: offsetY),
        ])
        return self
    }

    // MARK: 일부 변만

    /// 지정한 변만 부모에 붙인다 — 나머지 변은 자유롭게 둔다.
    ///
    /// ```swift
    /// toast.jdPin(to: view, edges: [.horizontal, .bottom], padding: .md)
    /// ```
    ///
    /// `safeArea: true`면 안전 영역 가이드에 붙는다. bottom/trailing의 부호 반전은
    /// 여기서 처리하므로 소비자가 `-16`을 적을 일이 없다 (`jd.layout`의 `inset`과 동형).
    @discardableResult
    func jdPin(
        to parent: UIView,
        edges: NSDirectionalRectEdge = .all,
        padding: JdGap = .none,
        safeArea: Bool = false
    ) -> Self {
        translatesAutoresizingMaskIntoConstraints = false
        if superview !== parent { parent.addSubview(self) }

        let inset = padding.value
        var constraints: [NSLayoutConstraint] = []
        if edges.contains(.top) {
            constraints.append(
                topAnchor.constraint(
                    equalTo: safeArea ? parent.safeAreaLayoutGuide.topAnchor : parent.topAnchor,
                    constant: inset))
        }
        if edges.contains(.leading) {
            constraints.append(
                leadingAnchor.constraint(
                    equalTo: safeArea
                        ? parent.safeAreaLayoutGuide.leadingAnchor : parent.leadingAnchor,
                    constant: inset))
        }
        if edges.contains(.bottom) {
            constraints.append(
                bottomAnchor.constraint(
                    equalTo: safeArea
                        ? parent.safeAreaLayoutGuide.bottomAnchor : parent.bottomAnchor,
                    constant: -inset))
        }
        if edges.contains(.trailing) {
            constraints.append(
                trailingAnchor.constraint(
                    equalTo: safeArea
                        ? parent.safeAreaLayoutGuide.trailingAnchor : parent.trailingAnchor,
                    constant: -inset))
        }
        NSLayoutConstraint.activate(constraints)
        return self
    }

    // MARK: 형제 기준

    /// 형제 바로 아래에 놓는다 — 부모는 형제의 부모를 그대로 쓴다.
    ///
    /// ```swift
    /// header.jdPin(to: view, edges: [.top, .horizontal], safeArea: true)
    /// body.jdBelow(header, gap: .md).jdPin(to: view, edges: .horizontal, padding: .md)
    /// ```
    ///
    /// 세로 흐름은 대개 `JdVStack`이 낫다. 이건 스택에 넣을 수 없는 경우
    /// (오버레이 위, 스크롤뷰 콘텐츠 등)를 위한 것이다.
    @discardableResult
    func jdBelow(_ sibling: UIView, gap: JdGap = .none) -> Self {
        guard let parent = sibling.superview else {
            preconditionFailure("jdBelow: 기준 형제가 아직 계층에 없다 — 먼저 배치하라")
        }
        translatesAutoresizingMaskIntoConstraints = false
        if superview !== parent { parent.addSubview(self) }
        topAnchor.constraint(equalTo: sibling.bottomAnchor, constant: gap.value).isActive = true
        return self
    }

    /// 형제 바로 오른쪽(RTL에서는 왼쪽)에 놓는다.
    @discardableResult
    func jdAfter(_ sibling: UIView, gap: JdGap = .none) -> Self {
        guard let parent = sibling.superview else {
            preconditionFailure("jdAfter: 기준 형제가 아직 계층에 없다 — 먼저 배치하라")
        }
        translatesAutoresizingMaskIntoConstraints = false
        if superview !== parent { parent.addSubview(self) }
        leadingAnchor.constraint(equalTo: sibling.trailingAnchor, constant: gap.value).isActive =
            true
        return self
    }

    // MARK: 비율

    /// 가로:세로 비율을 고정한다 — 썸네일·미디어 영역.
    ///
    /// ```swift
    /// cover.jdAspect(16.0 / 9.0)
    /// ```
    ///
    /// 폭이나 높이 중 하나는 다른 제약이 정해 줘야 한다. 둘 다 자유로우면 Auto Layout이
    /// 크기를 정할 근거가 없어 0으로 접힌다.
    @discardableResult
    func jdAspect(_ ratio: CGFloat) -> Self {
        precondition(ratio > 0, "jdAspect: 비율은 양수여야 한다 — \(ratio)")
        translatesAutoresizingMaskIntoConstraints = false
        widthAnchor.constraint(equalTo: heightAnchor, multiplier: ratio).isActive = true
        return self
    }
}
