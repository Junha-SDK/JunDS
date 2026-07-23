import Foundation

// 데모 레지스트리 — 구현된 데모만 등록한다. 카탈로그(원장) 항목 중 여기 없는 것은 "예정" 화면.
// 새 데모 파일(enum XxxDemo.demo)을 추가하면 이 배열에 한 줄 등록한다(통합 단계에서 일괄 — 병합 충돌 방지).

@MainActor
enum DemoRegistry {
    static let all: [ComponentDemo] = [
        // 파일럿 3종
        ButtonDemo.demo,
        TextFieldDemo.demo,   // ledger id: Input
        ModalDemo.demo,
        // B-core 12종
        BoxDemo.demo,
        CenterDemo.demo,
        DividerDemo.demo,     // ledger id: CoreDivider
        FlexDemo.demo,
        GridLayoutDemo.demo,
        GroupDemo.demo,
        HStackDemo.demo,
        HeadingDemo.demo,
        PageDemo.demo,
        SectionDemo.demo,
        TextDemo.demo,
        VStackDemo.demo,
    ]

    static let byId: [String: ComponentDemo] = Dictionary(
        all.map { ($0.id, $0) },
        uniquingKeysWith: { first, _ in first }
    )
}
