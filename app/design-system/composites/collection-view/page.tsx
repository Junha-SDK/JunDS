"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { CollectionView } from "@/ds/composites/CollectionView";
import type { CollectionItem } from "@/ds/composites/CollectionView";

const sampleItems: CollectionItem[] = [
  {
    key: "button",
    label: "Button",
    description: "클릭 가능한 기본 버튼 컴포넌트",
    category: "Primitives",
    tags: ["입력", "기본"],
    preview: (
      <div className="w-full h-full bg-blue-100 flex items-center justify-center">
        <div className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium">
          Button
        </div>
      </div>
    ),
  },
  {
    key: "input",
    label: "Input",
    description: "텍스트 입력 필드 컴포넌트",
    category: "Primitives",
    tags: ["입력", "폼"],
    preview: (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center px-6">
        <div className="w-full max-w-[180px] h-9 border border-slate-300 rounded-lg bg-white" />
      </div>
    ),
  },
  {
    key: "badge",
    label: "Badge",
    description: "상태 또는 카운트를 나타내는 배지",
    category: "Primitives",
    tags: ["표시", "상태"],
    preview: (
      <div className="w-full h-full bg-purple-50 flex items-center justify-center gap-2">
        <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">New</span>
        <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">3</span>
      </div>
    ),
  },
  {
    key: "toggle",
    label: "Toggle",
    description: "온/오프 전환 토글 스위치",
    category: "Primitives",
    tags: ["입력", "전환"],
    preview: (
      <div className="w-full h-full bg-green-50 flex items-center justify-center">
        <div className="w-11 h-6 bg-emerald-500 rounded-full relative">
          <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
        </div>
      </div>
    ),
  },
  {
    key: "avatar",
    label: "Avatar",
    description: "사용자 프로필 이미지 또는 이니셜 표시",
    category: "Primitives",
    tags: ["표시", "사용자"],
    preview: (
      <div className="w-full h-full bg-indigo-50 flex items-center justify-center">
        <div className="w-12 h-12 bg-indigo-400 rounded-full flex items-center justify-center text-white font-bold">
          JH
        </div>
      </div>
    ),
  },
  {
    key: "select",
    label: "Select",
    description: "드롭다운 선택 컴포넌트",
    category: "Composites",
    tags: ["입력", "선택"],
    preview: (
      <div className="w-full h-full bg-teal-50 flex items-center justify-center px-6">
        <div className="w-full max-w-[180px] h-9 border border-teal-300 rounded-lg bg-white flex items-center px-3 text-xs text-teal-600">
          옵션 선택...
        </div>
      </div>
    ),
  },
  {
    key: "modal",
    label: "Modal",
    description: "오버레이 대화상자 컴포넌트",
    category: "Composites",
    tags: ["오버레이", "대화"],
    preview: (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="w-32 h-20 bg-white rounded-lg shadow-lg border flex items-center justify-center text-xs text-gray-500">
          Modal
        </div>
      </div>
    ),
  },
  {
    key: "tabs",
    label: "Tabs",
    description: "탭 기반 콘텐츠 전환 컴포넌트",
    category: "Composites",
    tags: ["네비게이션", "레이아웃"],
    preview: (
      <div className="w-full h-full bg-orange-50 flex flex-col items-center justify-center gap-2">
        <div className="flex gap-1">
          <span className="px-3 py-1 bg-orange-500 text-white text-xs rounded-t">탭 1</span>
          <span className="px-3 py-1 bg-orange-200 text-orange-700 text-xs rounded-t">탭 2</span>
        </div>
        <div className="w-32 h-8 bg-white rounded border border-orange-200" />
      </div>
    ),
  },
  {
    key: "accordion",
    label: "Accordion",
    description: "접고 펼칠 수 있는 아코디언",
    category: "Composites",
    tags: ["레이아웃", "접기"],
    preview: (
      <div className="w-full h-full bg-rose-50 flex flex-col items-center justify-center gap-1 px-6">
        <div className="w-full max-w-[180px] h-6 bg-rose-200 rounded text-xs flex items-center px-2 text-rose-700">섹션 1 ▾</div>
        <div className="w-full max-w-[180px] h-6 bg-white border border-rose-200 rounded" />
        <div className="w-full max-w-[180px] h-6 bg-rose-200 rounded text-xs flex items-center px-2 text-rose-700">섹션 2 ▸</div>
      </div>
    ),
  },
  {
    key: "toast",
    label: "Toast",
    description: "알림 메시지를 표시하는 토스트",
    category: "Composites",
    tags: ["피드백", "알림"],
    preview: (
      <div className="w-full h-full bg-amber-50 flex items-end justify-center pb-4">
        <div className="px-4 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
          저장 완료!
        </div>
      </div>
    ),
  },
  {
    key: "data-table",
    label: "DataTable",
    description: "정렬, 필터, 페이지네이션을 지원하는 데이터 테이블",
    category: "Patterns",
    tags: ["데이터", "테이블"],
    preview: (
      <div className="w-full h-full bg-cyan-50 flex items-center justify-center px-4">
        <div className="w-full max-w-[200px] border border-cyan-200 rounded bg-white overflow-hidden">
          <div className="h-5 bg-cyan-200 flex gap-1 px-2 items-center">
            <span className="w-8 h-2 bg-cyan-400 rounded" />
            <span className="w-12 h-2 bg-cyan-400 rounded" />
            <span className="w-6 h-2 bg-cyan-400 rounded" />
          </div>
          <div className="h-4 border-t border-cyan-100 px-2 flex gap-1 items-center">
            <span className="w-8 h-1.5 bg-cyan-100 rounded" />
            <span className="w-12 h-1.5 bg-cyan-100 rounded" />
            <span className="w-6 h-1.5 bg-cyan-100 rounded" />
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "kanban",
    label: "Kanban",
    description: "드래그 앤 드롭 칸반 보드",
    category: "Patterns",
    tags: ["레이아웃", "드래그"],
    preview: (
      <div className="w-full h-full bg-violet-50 flex items-center justify-center gap-2 px-4">
        {["bg-violet-200", "bg-violet-300", "bg-violet-400"].map((c) => (
          <div key={c} className="flex flex-col gap-1">
            <div className={`w-12 h-3 ${c} rounded`} />
            <div className="w-12 h-8 bg-white border border-violet-200 rounded" />
          </div>
        ))}
      </div>
    ),
  },
  {
    key: "sidebar",
    label: "Sidebar",
    description: "앱 네비게이션을 위한 사이드바",
    category: "Patterns",
    tags: ["네비게이션", "레이아웃"],
    preview: (
      <div className="w-full h-full bg-sky-50 flex">
        <div className="w-16 h-full bg-sky-200 flex flex-col gap-1 p-2 pt-3">
          <div className="w-full h-2 bg-sky-400 rounded" />
          <div className="w-full h-2 bg-sky-300 rounded" />
          <div className="w-full h-2 bg-sky-300 rounded" />
        </div>
        <div className="flex-1" />
      </div>
    ),
  },
  {
    key: "calendar",
    label: "Calendar",
    description: "날짜 선택을 위한 캘린더 컴포넌트",
    category: "Patterns",
    tags: ["날짜", "선택"],
    preview: (
      <div className="w-full h-full bg-pink-50 flex items-center justify-center">
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: 14 }, (_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded text-[8px] flex items-center justify-center ${
                i === 9
                  ? "bg-pink-500 text-white"
                  : "bg-white text-pink-400 border border-pink-100"
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: "carousel",
    label: "Carousel",
    description: "이미지나 콘텐츠를 슬라이드로 보여주는 캐러셀",
    category: "Composites",
    tags: ["레이아웃", "슬라이드"],
    preview: (
      <div className="w-full h-full bg-lime-50 flex items-center justify-center gap-1">
        <div className="w-4 h-4 text-lime-400 flex items-center justify-center text-xs">&lt;</div>
        <div className="w-24 h-14 bg-lime-200 rounded-lg" />
        <div className="w-4 h-4 text-lime-400 flex items-center justify-center text-xs">&gt;</div>
      </div>
    ),
  },
];

export default function CollectionViewPage() {
  return (
    <ComponentPage
      name="CollectionView"
      description="아이템을 시각적으로 탐색할 수 있는 그리드/리스트 컬렉션 뷰. 검색, 카테고리 필터, 뷰 전환을 지원합니다."
      importPath='import { CollectionView } from "@/ds/composites/CollectionView"'
      props={[
        { name: "items", type: "CollectionItem[]", required: true, description: "표시할 아이템 배열" },
        { name: "view", type: '"grid" | "list"', default: '"grid"', description: "초기 뷰 모드" },
        { name: "searchable", type: "boolean", default: "false", description: "검색 입력 표시 여부" },
        { name: "filterable", type: "boolean", default: "false", description: "카테고리 필터 칩 표시 여부" },
        { name: "columns", type: "2 | 3 | 4", default: "3", description: "그리드 컬럼 수" },
        { name: "emptyMessage", type: "string", default: '"항목이 없습니다."', description: "빈 상태 메시지" },
        { name: "className", type: "string", description: "추가 CSS 클래스" },
      ]}
    >
      <Section title="기본 그리드 뷰">
        <Preview>
          <CollectionView
            items={sampleItems.slice(0, 6)}
            columns={3}
          />
        </Preview>
      </Section>

      <Section title="검색 + 카테고리 필터">
        <Preview>
          <CollectionView
            items={sampleItems}
            searchable
            filterable
            columns={3}
          />
        </Preview>
      </Section>

      <Section title="리스트 뷰">
        <Preview>
          <CollectionView
            items={sampleItems.slice(0, 8)}
            view="list"
          />
        </Preview>
      </Section>

      <Section title="2 컬럼 그리드">
        <Preview>
          <CollectionView
            items={sampleItems.slice(0, 4)}
            columns={2}
            searchable
          />
        </Preview>
      </Section>

      <Section title="4 컬럼 그리드">
        <Preview>
          <CollectionView
            items={sampleItems}
            columns={4}
            filterable
          />
        </Preview>
      </Section>

      <Section title="클릭 가능한 아이템">
        <Preview>
          <CollectionView
            items={sampleItems.slice(0, 6).map((item) => ({
              ...item,
              onClick: () => alert(`${item.label} 클릭됨`),
            }))}
            columns={3}
            searchable
            filterable
          />
        </Preview>
      </Section>

      <Section title="빈 상태">
        <Preview>
          <CollectionView
            items={[]}
            emptyMessage="검색 결과가 없습니다. 다른 키워드로 시도해 보세요."
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
