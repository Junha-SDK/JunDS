import Foundation

// 데모 레지스트리 — 구현된 데모만 등록한다. 카탈로그(원장) 항목 중 여기 없는 것은 "예정" 화면.
// ⚠️ 배치 에이전트는 이 파일을 직접 수정하지 않는다 — 통합 단계에서 한 곳(여기)만 갱신(병합 충돌 방지).

@MainActor
enum DemoRegistry {
    static let all: [ComponentDemo] = [
        ButtonDemo.demo,
    ]

    static let byId: [String: ComponentDemo] = Dictionary(
        all.map { ($0.id, $0) },
        uniquingKeysWith: { first, _ in first }
    )
}
