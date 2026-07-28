"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Notification } from "@/ds/composites/Notification";
import { Button } from "@/ds/primitives/Button";

export default function NotificationPage() {
  return (
    <ComponentPage
      name="Notification"
      description="제목, 설명, 액션, 닫기를 포함하는 알림 카드. info/success/warning/danger 4종을 지원합니다."
      importPath='import { Notification } from "@/ds/composites/Notification"'
      props={[
        { name: "title", type: "string", description: "알림 제목" },
        { name: "description", type: "string", description: "보조 설명" },
        {
          name: "variant",
          type: '"info"|"success"|"warning"|"danger"',
          default: '"info"',
          description: "유형",
        },
        { name: "icon", type: "ReactNode", description: "좌측 아이콘" },
        { name: "action", type: "ReactNode", description: "본문 하단 액션 영역" },
        { name: "onClose", type: "() => void", description: "닫기 핸들러 (있으면 X 버튼 표시)" },
      ]}
    >
      <Section title="All Variants">
        <Preview>
          <div className="flex flex-col gap-3 w-full max-w-md">
            <Notification
              variant="info"
              title="새 메시지"
              description="3개의 새 메시지가 도착했습니다."
            />
            <Notification
              variant="success"
              title="저장 완료"
              description="변경 사항이 저장되었습니다."
            />
            <Notification
              variant="warning"
              title="용량 부족"
              description="저장 공간이 90% 이상 찼습니다."
            />
            <Notification
              variant="danger"
              title="연결 실패"
              description="서버에 연결할 수 없습니다."
            />
          </div>
        </Preview>
      </Section>

      <Section title="액션 + 닫기">
        <Preview>
          <div className="w-full max-w-md">
            <Notification
              variant="info"
              title="업데이트 가능"
              description="새로운 버전(v1.2.0)이 출시되었습니다."
              action={<Button size="sm">지금 업데이트</Button>}
              onClose={() => {}}
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
