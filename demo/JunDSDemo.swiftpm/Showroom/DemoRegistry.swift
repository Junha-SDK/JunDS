import Foundation

// 데모 레지스트리 — 구현된 데모만 등록한다. 카탈로그(원장) 항목 중 여기 없는 것은 "예정" 화면.
// 새 데모 파일(enum XxxDemo.demo)을 추가하면 이 배열에 한 줄 등록한다(통합 단계에서 일괄 — 병합 충돌 방지).

@MainActor
enum DemoRegistry {
    static let all: [ComponentDemo] = [
        // G1 파일럿 3종
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

        // B-layout 12종
        StackDemo.demo,
        GridDemo.demo,
        ContainerDemo.demo,
        SpacerDemo.demo,
        AppShellDemo.demo,
        WrapDemo.demo,
        SimpleGridDemo.demo,
        ShowDemo.demo,
        HideDemo.demo,
        AspectRatioBoxDemo.demo,
        OverlayDemo.demo,
        LayoutDividerDemo.demo,

        // B-primitives 폼 9종
        ToggleDemo.demo,
        SwitchDemo.demo,
        CheckboxDemo.demo,
        RadioGroupDemo.demo,
        SliderDemo.demo,
        RangeSliderDemo.demo,
        LabelDemo.demo,
        TextareaDemo.demo,
        IconButtonDemo.demo,

        // B-primitives 표시 10종
        BadgeDemo.demo,
        TagDemo.demo,
        AvatarDemo.demo,
        SpinnerDemo.demo,
        DividerPrimitiveDemo.demo,   // ledger id: Divider (CoreDivider와 동일 구현, R12)
        KbdDemo.demo,
        KeyCapDemo.demo,
        StatusDotDemo.demo,
        SeverityBadgeDemo.demo,
        BatteryIndicatorDemo.demo,

        // B-primitives 잔여 27종
        // 입력 계열 6
        NumberInputDemo.demo,
        CurrencyInputDemo.demo,
        PhoneInputDemo.demo,
        PasswordInputDemo.demo,
        PinInputDemo.demo,
        OTPInputDemo.demo,        // PinInput의 설정 변형(별도 타입 없음)
        // 버튼·인터랙션 9
        BookmarkButtonDemo.demo,
        LikeButtonDemo.demo,
        FollowButtonDemo.demo,
        StarRatingDemo.demo,
        CopyButtonDemo.demo,
        BackTopDemo.demo,
        FileUploadDemo.demo,
        ScrollAreaDemo.demo,      // 레시피
        AspectRatioDemo.demo,     // 별칭(AspectRatioBox)
        // 텍스트 런·유틸리티 12
        CodeDemo.demo,
        MarkDemo.demo,
        HighlightDemo.demo,
        LinkDemo.demo,
        MentionChipDemo.demo,
        HashtagDemo.demo,
        MotionDemo.demo,
        IconDemo.demo,            // 레시피(SF Symbols)
        ImageDemo.demo,           // 레시피(AsyncImage)
        VisuallyHiddenDemo.demo,  // 컴포넌트 없음(접근성 모디파이어)
        AnnouncerProviderDemo.demo, // 뷰 없음(JdAnnouncer)
        NumberFormatterDemo.demo, // 뷰 없음(JdNumberFormat)
    ]

    static let byId: [String: ComponentDemo] = Dictionary(
        all.map { ($0.id, $0) },
        uniquingKeysWith: { first, _ in first }
    )
}
