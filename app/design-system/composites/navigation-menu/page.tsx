"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { NavigationMenu } from "@/ds/composites/NavigationMenu";

export default function NavigationMenuPage() {
  return (
    <ComponentPage
      name="NavigationMenu"
      description="네비게이션 메뉴. 메가메뉴 스타일의 드롭다운 패널을 지원하는 수평 내비게이션 바입니다."
      importPath='import { NavigationMenu } from "@/ds/composites/NavigationMenu"'
      props={[
        { name: "items", type: "NavMenuItem[]", required: true, description: "메뉴 항목 목록" },
      ]}
    >
      <Section title="기본 사용">
        <Preview>
          <NavigationMenu
            items={[
              { key: "home", label: "홈", href: "#" },
              {
                key: "products",
                label: "제품",
                children: [
                  {
                    key: "design-system",
                    label: "디자인 시스템",
                    description: "일관된 UI를 위한 컴포넌트 라이브러리",
                    href: "#",
                  },
                  {
                    key: "templates",
                    label: "템플릿",
                    description: "빠른 시작을 위한 프로젝트 템플릿",
                    href: "#",
                  },
                  {
                    key: "icons",
                    label: "아이콘",
                    description: "디자인 시스템 전용 아이콘 팩",
                    href: "#",
                  },
                ],
              },
              {
                key: "resources",
                label: "리소스",
                children: [
                  {
                    key: "docs",
                    label: "문서",
                    description: "API 레퍼런스 및 가이드",
                    href: "#",
                  },
                  {
                    key: "blog",
                    label: "블로그",
                    description: "최신 업데이트와 튜토리얼",
                    href: "#",
                  },
                ],
              },
              { key: "pricing", label: "가격", href: "#" },
            ]}
          />
        </Preview>
      </Section>

      <Section title="아이콘 포함">
        <Preview>
          <NavigationMenu
            items={[
              {
                key: "getting-started",
                label: "시작하기",
                children: [
                  {
                    key: "intro",
                    label: "소개",
                    description: "JunDS 디자인 시스템에 대해 알아보세요",
                    href: "#",
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                  },
                  {
                    key: "install",
                    label: "설치",
                    description: "프로젝트에 JunDS를 추가하는 방법",
                    href: "#",
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    ),
                  },
                ],
              },
              {
                key: "components",
                label: "컴포넌트",
                children: [
                  {
                    key: "primitives",
                    label: "프리미티브",
                    description: "기본 UI 빌딩 블록",
                    href: "#",
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    ),
                  },
                  {
                    key: "composites",
                    label: "컴포지트",
                    description: "복합 UI 컴포넌트",
                    href: "#",
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    ),
                  },
                ],
              },
            ]}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
