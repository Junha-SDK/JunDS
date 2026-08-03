import JunDSCore
import UIKit

// 차트 draw(_:) 공용 텍스트 헬퍼 (DEC-049).
//
// 차트 8종의 눈금·라벨·범례가 전부 "한 줄을 앵커 기준으로" 그린다 — SVG의
// textAnchor(start/middle/end) 대응분. 8곳이 각자 NSAttributedString 좌표 보정을
// 복사하면 세로 중앙 규칙이 반드시 어긋난다.
enum JdChartDraw {
    enum Anchor {
        case leading, center, trailing
    }

    /// `point.y`는 텍스트 **세로 중앙**이다(SVG `y + 3` 근사 관용구의 정리판).
    static func text(
        _ string: String,
        at point: CGPoint,
        size: CGFloat,
        weight: CGFloat,
        color: UIColor,
        anchor: Anchor = .leading
    ) {
        // 차트 숫자는 항상 등폭 숫자 폰트 — 값이 바뀌어도 라벨 폭이 흔들리지 않는다
        let font = UIFont.monospacedDigitSystemFont(ofSize: size, weight: uiWeight(weight))
        let rendered = NSAttributedString(
            string: string,
            attributes: [.font: font, .foregroundColor: color])
        let bounds = rendered.size()
        var origin = CGPoint(x: point.x, y: point.y - bounds.height / 2)
        switch anchor {
        case .leading: break
        case .center: origin.x -= bounds.width / 2
        case .trailing: origin.x -= bounds.width
        }
        rendered.draw(at: origin)
    }

    static func uiWeight(_ weight: CGFloat) -> UIFont.Weight {
        if weight >= 800 { return .heavy }
        if weight >= 700 { return .bold }
        if weight >= 600 { return .semibold }
        if weight >= 500 { return .medium }
        return .regular
    }
}
