import SwiftUI
import JunDSCore

/// 엘리베이션 렌더러 (DEC-039).
///
/// 왜 필요한가: `JdToken.Shadow.*`는 이제 단 하나가 아니라 **여러 겹**이다
/// (라이트 = 접지 그림자 + 주변광 그림자, 다크 = 헤어라인 링 + 주변광 그림자).
/// 기존 컴포넌트들은 각자 `Shadow.lg.light.first`로 **첫 장만** 꺼내 쓰고 있었고,
/// 그 관용구는 (1) 라이트에서 주변광을 버리고 (2) 다크에서는 링(blur 0)을 그림자로
/// 오해해 사실상 아무것도 그리지 않는다. 겹을 아는 단일 렌더러가 정답이다.
///
/// 매핑 규칙:
/// - blur == 0 && spread > 0 인 겹은 **테두리**다 (CSS `0 0 0 1px`). SwiftUI의 shadow는
///   spread를 표현할 수 없으므로 shape stroke로 그린다.
/// - 그 외 겹은 `.shadow(radius: blur / 2)` — CSS blur는 렌더 반경의 2배다.
/// - 음수 spread(면 축소)는 SwiftUI에 대응물이 없어 무시한다. 토큰의 음수 spread는
///   그림자를 물체 아래로 좁히는 미세 조정이므로, 누락 시 약간 더 퍼져 보일 뿐이다.
public struct JdElevation<S: InsettableShape>: ViewModifier {
    private let dynamic: JdToken.Shadow.Dynamic
    private let shape: S

    @Environment(\.colorScheme) private var colorScheme

    public init(_ dynamic: JdToken.Shadow.Dynamic, in shape: S) {
        self.dynamic = dynamic
        self.shape = shape
    }

    public func body(content: Content) -> some View {
        let layers = colorScheme == .dark ? dynamic.dark : dynamic.light
        let rings = layers.filter { $0.blur == 0 && $0.spread > 0 }
        let drops = layers.filter { !($0.blur == 0 && $0.spread > 0) }

        // 그림자는 겹칠수록 짙어지므로 **토큰 순서대로** 겹쳐야 의도한 깊이가 나온다.
        return drops
            .reduce(AnyView(content.overlay(ringOverlay(rings)))) { view, layer in
                AnyView(
                    view.shadow(
                        color: Color(UIColor(jdHex: layer.color)),
                        radius: layer.blur / 2,
                        x: layer.x,
                        y: layer.y
                    )
                )
            }
    }

    @ViewBuilder
    private func ringOverlay(_ rings: [JdToken.Shadow.Layer]) -> some View {
        if let ring = rings.first {
            shape.strokeBorder(Color(UIColor(jdHex: ring.color)), lineWidth: ring.spread)
        }
    }
}

public extension View {
    /// 토큰 엘리베이션을 겹 단위로 적용한다. `shape`는 헤어라인 링을 그릴 윤곽이다.
    func jdElevation<S: InsettableShape>(_ dynamic: JdToken.Shadow.Dynamic, in shape: S) -> some View {
        modifier(JdElevation(dynamic, in: shape))
    }

    /// 사각 컨테이너용 축약 — 반경만 주면 continuous 라운드 사각으로 링을 그린다.
    func jdElevation(_ dynamic: JdToken.Shadow.Dynamic, cornerRadius: CGFloat) -> some View {
        modifier(JdElevation(dynamic, in: RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)))
    }
}
