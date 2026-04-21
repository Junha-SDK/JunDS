"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { DetailPanel } from "@/ds/composites/DetailPanel";

export default function DetailPanelPage() {
  const [basicOpen, setBasicOpen] = useState(false);
  const [tabOpen, setTabOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusVariant, setStatusVariant] = useState<"success" | "warning" | "danger" | "info">("success");

  return (
    <ComponentPage
      name="DetailPanel"
      description="오른쪽에서 슬라이드되는 상세 정보 패널 컴포넌트. 탭, 상태 배지, 커스텀 콘텐츠를 지원합니다."
      importPath='import { DetailPanel } from "@/ds/composites/DetailPanel"'
      props={[
        { name: "open", type: "boolean", required: true, description: "패널 열림 상태" },
        { name: "onClose", type: "() => void", required: true, description: "닫기 핸들러" },
        { name: "title", type: "string", required: true, description: "패널 제목" },
        { name: "subtitle", type: "string", description: "부제목" },
        { name: "status", type: '"success"|"warning"|"danger"|"info"', description: "상태 배지" },
        { name: "tabs", type: "DetailPanelTab[]", description: "탭 목록 ({ key, label, content, badge? })" },
        { name: "children", type: "ReactNode", description: "탭이 없을 때 기본 콘텐츠" },
        { name: "width", type: "number", default: "420", description: "패널 너비 (px)" },
      ]}
    >
      <Section title="기본">
        <p className="text-sm text-muted mb-3">
          버튼을 클릭하면 오른쪽에서 패널이 슬라이드됩니다. ESC 키로도 닫을 수 있습니다.
        </p>
        <Preview>
          <button
            type="button"
            onClick={() => setBasicOpen(true)}
            className="h-9 px-4 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
          >
            패널 열기
          </button>
          <DetailPanel
            open={basicOpen}
            onClose={() => setBasicOpen(false)}
            title="사용자 상세"
            subtitle="ID: USR-00142"
          >
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">이름</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">홍길동</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">이메일</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">hong@example.com</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">부서</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">개발팀</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">가입일</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">2022-03-15</p>
              </div>
            </div>
          </DetailPanel>
        </Preview>
      </Section>

      <Section title="탭 + 배지">
        <p className="text-sm text-muted mb-3">
          tabs prop을 사용하면 패널 내부에서 탭으로 콘텐츠를 전환할 수 있습니다. badge 속성으로 탭에 숫자 배지를 표시합니다.
        </p>
        <Preview>
          <button
            type="button"
            onClick={() => setTabOpen(true)}
            className="h-9 px-4 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
          >
            탭 패널 열기
          </button>
          <DetailPanel
            open={tabOpen}
            onClose={() => setTabOpen(false)}
            title="주문 상세"
            subtitle="주문번호 #ORD-2024-00142"
            status="success"
            tabs={[
              {
                key: "info",
                label: "정보",
                content: (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">상품명</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">무선 블루투스 이어폰</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">수량</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">2개</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">결제금액</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">₩128,000</p>
                    </div>
                  </div>
                ),
              },
              {
                key: "history",
                label: "이력",
                badge: 3,
                content: (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                      <span className="text-gray-900">배송 완료</span>
                      <span className="text-gray-400 ml-auto">01/18 14:30</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-gray-900">배송 중</span>
                      <span className="text-gray-400 ml-auto">01/17 09:00</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0" />
                      <span className="text-gray-900">주문 접수</span>
                      <span className="text-gray-400 ml-auto">01/15 18:22</span>
                    </div>
                  </div>
                ),
              },
              {
                key: "memo",
                label: "메모",
                badge: 1,
                content: (
                  <p className="text-sm text-gray-600">
                    고객 요청: 부재 시 경비실에 맡겨주세요.
                  </p>
                ),
              },
            ]}
          />
        </Preview>
      </Section>

      <Section title="상태">
        <p className="text-sm text-muted mb-3">
          status prop으로 패널 제목 옆에 상태 배지를 표시할 수 있습니다. success, warning, danger, info 4가지 변형을 지원합니다.
        </p>
        <Preview>
          <div className="flex gap-2 flex-wrap">
            {(["success", "warning", "danger", "info"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setStatusVariant(s);
                  setStatusOpen(true);
                }}
                className="h-9 px-4 text-sm font-medium rounded-lg bg-gray-100 text-foreground hover:bg-gray-200 transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
          <DetailPanel
            open={statusOpen}
            onClose={() => setStatusOpen(false)}
            title="서버 모니터링"
            subtitle="server-prod-01"
            status={statusVariant}
          >
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">CPU</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">42%</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">메모리</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">8.2 / 16 GB</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">가동시간</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">45일 12시간</p>
              </div>
            </div>
          </DetailPanel>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
