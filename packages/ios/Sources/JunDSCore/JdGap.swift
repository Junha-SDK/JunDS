import Foundation
import CoreGraphics

// 웹 named gap 토큰(xs=4 sm=8 md=16 lg=24 xl=32 2xl=48 3xl=64 4xl=96) —
// JdToken.Space와 1:1 대응하는 이름 층. 스택/그룹 컴포넌트의 spacing 표면이
// 원시 CGFloat 대신 이 타입을 받아 하드코딩을 차단한다 (DESIGN §2.1).
public struct JdGap: Sendable, Equatable {
    public let value: CGFloat

    public static let none = JdGap(value: JdToken.Space.s0)  // 0
    public static let xs = JdGap(value: JdToken.Space.s1)    // 4
    public static let sm = JdGap(value: JdToken.Space.s2)    // 8
    public static let md = JdGap(value: JdToken.Space.s4)    // 16
    public static let lg = JdGap(value: JdToken.Space.s6)    // 24
    public static let xl = JdGap(value: JdToken.Space.s8)    // 32
    public static let xl2 = JdGap(value: JdToken.Space.s12)  // 48
    public static let xl3 = JdGap(value: JdToken.Space.s16)  // 64
    public static let xl4 = JdGap(value: JdToken.Space.s24)  // 96

    // 웹 gap="17px" 등가의 탈출구 — 토큰 밖 값의 책임은 소비자 몫 (grep 가능하게 유지)
    public static func custom(_ value: CGFloat) -> JdGap {
        JdGap(value: value)
    }
}
