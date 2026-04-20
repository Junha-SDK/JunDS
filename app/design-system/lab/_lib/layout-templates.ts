import type { LayoutTemplate } from "./types";

// Helper to generate unique IDs
let _slotId = 0;
function slotId(): string {
  return `slot_${++_slotId}`;
}

export const layoutTemplates: LayoutTemplate[] = [
  // 1. Dashboard
  {
    id: "dashboard",
    label: "대시보드",
    description: "사이드바 + 헤더 + 컨텐츠 영역의 관리자 대시보드",
    gridTemplate: '"header header" "sidebar content"',
    gridColumns: "240px 1fr",
    gridRows: "64px 1fr",
    regions: [
      {
        id: "header",
        label: "Header",
        gridArea: "header",
        tag: "header",
        defaultStyle: {
          backgroundColor: "white",
          padding: "0 24px",
          gap: "16px",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        defaultSlots: [
          {
            id: slotId(),
            componentId: "Label",
            props: { required: false },
            children: "Dashboard",
          },
          {
            id: slotId(),
            componentId: "Avatar",
            props: { size: "sm" },
            children: undefined,
          },
        ],
      },
      {
        id: "sidebar",
        label: "Sidebar",
        gridArea: "sidebar",
        tag: "aside",
        defaultStyle: {
          backgroundColor: "#f8f8fa",
          padding: "16px",
          gap: "4px",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "flex-start",
        },
        defaultSlots: [
          {
            id: slotId(),
            componentId: "Button",
            props: { variant: "ghost", fullWidth: true },
            children: "메뉴 1",
          },
          {
            id: slotId(),
            componentId: "Button",
            props: { variant: "ghost", fullWidth: true },
            children: "메뉴 2",
          },
          {
            id: slotId(),
            componentId: "Button",
            props: { variant: "ghost", fullWidth: true },
            children: "메뉴 3",
          },
          {
            id: slotId(),
            componentId: "Divider",
            props: {},
            children: undefined,
          },
          {
            id: slotId(),
            componentId: "Button",
            props: { variant: "ghost", fullWidth: true },
            children: "설정",
          },
        ],
      },
      {
        id: "content",
        label: "Content",
        gridArea: "content",
        tag: "main",
        defaultStyle: {
          backgroundColor: "#f5f4f8",
          padding: "24px",
          gap: "16px",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "flex-start",
        },
        defaultSlots: [
          {
            id: slotId(),
            componentId: "Input",
            props: { placeholder: "검색...", size: "md" },
            children: undefined,
          },
          {
            id: slotId(),
            componentId: "Card",
            props: { hoverable: true },
            children: "통계 카드 영역",
          },
          {
            id: slotId(),
            componentId: "Card",
            props: { hoverable: true },
            children: "데이터 테이블 영역",
          },
        ],
      },
    ],
  },

  // 2. Landing Page
  {
    id: "landing",
    label: "랜딩 페이지",
    description: "헤더 + 히어로 + 특징 + CTA + 푸터",
    gridTemplate: '"header" "hero" "features" "cta" "footer"',
    gridColumns: "1fr",
    gridRows: "64px auto auto auto 80px",
    regions: [
      {
        id: "header",
        label: "Header",
        gridArea: "header",
        tag: "header",
        defaultStyle: {
          backgroundColor: "white",
          padding: "0 32px",
          gap: "24px",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        defaultSlots: [
          { id: slotId(), componentId: "Label", props: {}, children: "Brand" },
          {
            id: slotId(),
            componentId: "Button",
            props: { variant: "primary", size: "sm" },
            children: "시작하기",
          },
        ],
      },
      {
        id: "hero",
        label: "Hero",
        gridArea: "hero",
        tag: "section",
        defaultStyle: {
          backgroundColor: "white",
          padding: "80px 32px",
          gap: "16px",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        },
        defaultSlots: [
          {
            id: slotId(),
            componentId: "Label",
            props: {},
            children: "당신의 제품을 소개하세요",
          },
          {
            id: slotId(),
            componentId: "Badge",
            props: { variant: "primary", size: "lg" },
            children: "New",
          },
          {
            id: slotId(),
            componentId: "Button",
            props: { variant: "primary", size: "lg" },
            children: "무료로 시작",
          },
        ],
      },
      {
        id: "features",
        label: "Features",
        gridArea: "features",
        tag: "section",
        defaultStyle: {
          backgroundColor: "#f8f8fa",
          padding: "48px 32px",
          gap: "24px",
          flexDirection: "row",
          alignItems: "stretch",
          justifyContent: "center",
        },
        defaultSlots: [
          {
            id: slotId(),
            componentId: "Card",
            props: {},
            children: "기능 1",
          },
          {
            id: slotId(),
            componentId: "Card",
            props: {},
            children: "기능 2",
          },
          {
            id: slotId(),
            componentId: "Card",
            props: {},
            children: "기능 3",
          },
        ],
      },
      {
        id: "cta",
        label: "CTA",
        gridArea: "cta",
        tag: "section",
        defaultStyle: {
          backgroundColor: "white",
          padding: "48px 32px",
          gap: "16px",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        },
        defaultSlots: [
          {
            id: slotId(),
            componentId: "Label",
            props: {},
            children: "지금 바로 시작하세요",
          },
          {
            id: slotId(),
            componentId: "Input",
            props: { placeholder: "이메일 입력" },
            children: undefined,
          },
          {
            id: slotId(),
            componentId: "Button",
            props: { variant: "primary" },
            children: "가입하기",
          },
        ],
      },
      {
        id: "footer",
        label: "Footer",
        gridArea: "footer",
        tag: "footer",
        defaultStyle: {
          backgroundColor: "#1a1726",
          padding: "0 32px",
          gap: "16px",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        defaultSlots: [
          {
            id: slotId(),
            componentId: "Label",
            props: {},
            children: "© 2026 Brand",
          },
        ],
      },
    ],
  },

  // 3. Settings Page
  {
    id: "settings",
    label: "설정 페이지",
    description: "사이드바 네비게이션 + 폼 컨텐츠",
    gridTemplate: '"header header" "sidebar content"',
    gridColumns: "220px 1fr",
    gridRows: "56px 1fr",
    regions: [
      {
        id: "header",
        label: "Header",
        gridArea: "header",
        tag: "header",
        defaultStyle: {
          backgroundColor: "white",
          padding: "0 24px",
          gap: "16px",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
        },
        defaultSlots: [
          { id: slotId(), componentId: "Label", props: {}, children: "설정" },
        ],
      },
      {
        id: "sidebar",
        label: "Sidebar",
        gridArea: "sidebar",
        tag: "aside",
        defaultStyle: {
          backgroundColor: "white",
          padding: "16px",
          gap: "2px",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "flex-start",
        },
        defaultSlots: [
          {
            id: slotId(),
            componentId: "Button",
            props: { variant: "ghost", fullWidth: true },
            children: "프로필",
          },
          {
            id: slotId(),
            componentId: "Button",
            props: { variant: "primary", fullWidth: true },
            children: "계정",
          },
          {
            id: slotId(),
            componentId: "Button",
            props: { variant: "ghost", fullWidth: true },
            children: "알림",
          },
          {
            id: slotId(),
            componentId: "Button",
            props: { variant: "ghost", fullWidth: true },
            children: "보안",
          },
        ],
      },
      {
        id: "content",
        label: "Content",
        gridArea: "content",
        tag: "main",
        defaultStyle: {
          backgroundColor: "#f5f4f8",
          padding: "32px",
          gap: "16px",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "flex-start",
        },
        defaultSlots: [
          {
            id: slotId(),
            componentId: "Label",
            props: {},
            children: "계정 설정",
          },
          {
            id: slotId(),
            componentId: "Input",
            props: { placeholder: "이름" },
            children: undefined,
          },
          {
            id: slotId(),
            componentId: "Input",
            props: { placeholder: "이메일" },
            children: undefined,
          },
          {
            id: slotId(),
            componentId: "Textarea",
            props: { placeholder: "자기소개" },
            children: undefined,
          },
          {
            id: slotId(),
            componentId: "Button",
            props: { variant: "primary" },
            children: "저장",
          },
        ],
      },
    ],
  },

  // 4. List/Detail
  {
    id: "list-detail",
    label: "리스트/상세",
    description: "왼쪽 목록 + 오른쪽 상세 보기",
    gridTemplate: '"header header" "list detail"',
    gridColumns: "360px 1fr",
    gridRows: "56px 1fr",
    regions: [
      {
        id: "header",
        label: "Header",
        gridArea: "header",
        tag: "header",
        defaultStyle: {
          backgroundColor: "white",
          padding: "0 24px",
          gap: "16px",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        defaultSlots: [
          {
            id: slotId(),
            componentId: "Label",
            props: {},
            children: "메시지",
          },
          {
            id: slotId(),
            componentId: "Input",
            props: { placeholder: "검색...", size: "sm" },
            children: undefined,
          },
        ],
      },
      {
        id: "list",
        label: "List",
        gridArea: "list",
        tag: "aside",
        defaultStyle: {
          backgroundColor: "white",
          padding: "8px",
          gap: "4px",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "flex-start",
        },
        defaultSlots: [
          {
            id: slotId(),
            componentId: "Card",
            props: { hoverable: true },
            children: "항목 1",
          },
          {
            id: slotId(),
            componentId: "Card",
            props: { hoverable: true },
            children: "항목 2",
          },
          {
            id: slotId(),
            componentId: "Card",
            props: { hoverable: true },
            children: "항목 3",
          },
        ],
      },
      {
        id: "detail",
        label: "Detail",
        gridArea: "detail",
        tag: "main",
        defaultStyle: {
          backgroundColor: "#f5f4f8",
          padding: "32px",
          gap: "16px",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "flex-start",
        },
        defaultSlots: [
          {
            id: slotId(),
            componentId: "Label",
            props: {},
            children: "상세 내용",
          },
          {
            id: slotId(),
            componentId: "Divider",
            props: {},
            children: undefined,
          },
          {
            id: slotId(),
            componentId: "Skeleton",
            props: { width: "100%", height: "200px" },
            children: undefined,
          },
        ],
      },
    ],
  },

  // 5. Simple
  {
    id: "simple",
    label: "심플",
    description: "헤더 + 컨텐츠 + 푸터",
    gridTemplate: '"header" "content" "footer"',
    gridColumns: "1fr",
    gridRows: "56px 1fr 48px",
    regions: [
      {
        id: "header",
        label: "Header",
        gridArea: "header",
        tag: "header",
        defaultStyle: {
          backgroundColor: "white",
          padding: "0 24px",
          gap: "16px",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        defaultSlots: [
          {
            id: slotId(),
            componentId: "Label",
            props: {},
            children: "My App",
          },
          {
            id: slotId(),
            componentId: "Avatar",
            props: { size: "sm" },
            children: undefined,
          },
        ],
      },
      {
        id: "content",
        label: "Content",
        gridArea: "content",
        tag: "main",
        defaultStyle: {
          backgroundColor: "white",
          padding: "32px",
          gap: "16px",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
        },
        defaultSlots: [
          {
            id: slotId(),
            componentId: "Label",
            props: {},
            children: "환영합니다",
          },
          {
            id: slotId(),
            componentId: "Input",
            props: { placeholder: "검색..." },
            children: undefined,
          },
          {
            id: slotId(),
            componentId: "Button",
            props: { variant: "primary" },
            children: "시작하기",
          },
        ],
      },
      {
        id: "footer",
        label: "Footer",
        gridArea: "footer",
        tag: "footer",
        defaultStyle: {
          backgroundColor: "#f8f8fa",
          padding: "0 24px",
          gap: "8px",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        },
        defaultSlots: [
          {
            id: slotId(),
            componentId: "Label",
            props: {},
            children: "© 2026",
          },
        ],
      },
    ],
  },
];

export const layoutTemplateMap = new Map(
  layoutTemplates.map((t) => [t.id, t]),
);
