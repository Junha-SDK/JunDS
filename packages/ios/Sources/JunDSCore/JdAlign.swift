import Foundation

/// 교차축 정렬 — 웹 `align-items` 어휘 그대로 (DEC-043).
///
/// 왜 Core에 두는가: 지금까지 UIKit 배치 표면이 `UIStackView.Alignment`를 그대로 노출하고
/// 있었다. 그러면 (1) 소비자 코드에 플랫폼 타입이 새고 (2) 같은 개념을 웹은 `stretch`,
/// iOS는 `.fill`로 불러 3플랫폼 문서가 갈라진다. `JdGap`이 원시 CGFloat를 막은 것과 같은
/// 이유로 정렬도 이름 층을 갖는다.
///
/// 웹 `ALIGN_MAP`(style-props.ts)과 값 집합이 동일하다:
/// `start · center · end · stretch · baseline`.
public enum JdAlign: String, CaseIterable, Sendable {
    case start, center, end, stretch, baseline
}

/// 주축 분배 — 웹 `justify-content` 어휘.
public enum JdJustify: String, CaseIterable, Sendable {
    case start, center, end
    /// 웹 `space-between`
    case between
    /// 웹 `space-around`
    case around
    /// 웹 `space-evenly`
    case evenly
}
