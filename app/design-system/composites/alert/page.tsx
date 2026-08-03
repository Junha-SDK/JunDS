"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Alert } from "@/ds/composites/Alert";

export default function AlertPage() {
  return (
    <ComponentPage
      name="Alert"
      description="알림 배너. info, success, warning, danger 4종."
      importPath='import { Alert } from "@/ds/composites/Alert"'
      props={[
        {
          name: "variant",
          type: '"info"|"success"|"warning"|"danger"',
          default: '"info"',
          description: "유형",
        },
        { name: "title", type: "string", description: "제목" },
        { name: "onClose", type: "() => void", description: "닫기 핸들러" },
      ]}
    >
      <Section title="All Variants">
        <Preview>
          <div className="flex flex-col gap-3 max-w-lg">
            <Alert variant="info" title="정보">
              시스템 점검이 예정되어 있습니다.
            </Alert>
            <Alert variant="success" title="성공">
              배포가 완료되었습니다.
            </Alert>
            <Alert variant="warning" title="주의">
              디스크 용량이 80%를 초과했습니다.
            </Alert>
            <Alert variant="danger" title="오류">
              서버 연결에 실패했습니다.
            </Alert>
            <Alert variant="info" onClose={() => {}}>
              닫기 버튼이 있는 알림입니다.
            </Alert>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
