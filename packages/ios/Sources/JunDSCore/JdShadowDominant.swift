import UIKit

/// CALayer용 엘리베이션 축약 (DEC-039).
///
/// `CALayer`는 그림자를 **한 장만** 가질 수 있다. 토큰이 2겹이 된 뒤로 UIKit 계층은
/// 겹 하나를 골라야 하는데, 기존 관용구인 `.light.first`는 두 모드에서 모두 틀린 장을
/// 고른다:
///  - 라이트: 첫 장은 물체 바로 아래 접지 그림자(blur 1~2)다. 이것만 쓰면 융기가 아니라
///    윤곽선처럼 보인다. 눈에 '떠 있음'을 만드는 것은 넓은 주변광 쪽이다.
///  - 다크: 첫 장은 헤어라인 링(`0 0 0 1px`, blur 0)이라 그림자로 그리면 아무것도
///    안 보인다.
///
/// 그래서 규칙은 "첫 장"이 아니라 **blur가 가장 큰 장**이다 — 두 모드에서 자동으로
/// 주변광 겹을 고른다. 겹을 다 그려야 하는 곳(SwiftUI)은 `jdElevation`을 쓴다.
public extension JdToken.Shadow.Dynamic {
    /// 모드별로 blur가 가장 큰 겹을 고른 뒤, 그 겹의 색을 다이내믹 색으로 짝지어 돌려준다.
    /// 어느 모드에도 그릴 겹이 없으면(none) nil.
    var dominant: (ink: JdDynamicColor, geometry: JdToken.Shadow.Layer)? {
        let widest: ([JdToken.Shadow.Layer]) -> JdToken.Shadow.Layer? = { layers in
            layers.max(by: { $0.blur < $1.blur })
        }
        guard let lightLayer = widest(light), let darkLayer = widest(dark) else { return nil }
        guard lightLayer.blur > 0 || darkLayer.blur > 0 else { return nil }
        return (
            ink: JdDynamicColor(light: lightLayer.color, dark: darkLayer.color),
            // 기하는 라이트를 정본으로 쓴다 — 두 모드의 오프셋·blur는 같게 설계되어 있고,
            // trait 변화마다 레이아웃을 다시 잡지 않아도 되게 한다.
            geometry: lightLayer
        )
    }
}
