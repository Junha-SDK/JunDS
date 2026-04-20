"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Result } from "@/ds/composites/Result";
import { Button } from "@/ds/primitives/Button";

export default function ResultPage() {
  return (
    <ComponentPage
      name="Result"
      description="작업 결과를 시각적으로 표시하는 페이지 컴포넌트. 성공, 에러, 404 등 다양한 상태를 지원합니다."
      importPath='import { Result } from "@/ds/composites/Result"'
      props={[
        { name: "status", type: '"success" | "error" | "warning" | "info" | "404" | "403"', required: true, description: "결과 상태" },
        { name: "title", type: "string", required: true, description: "제목" },
        { name: "description", type: "string", description: "설명 텍스트" },
        { name: "extra", type: "ReactNode", description: "추가 액션 버튼 영역" },
        { name: "icon", type: "ReactNode", description: "커스텀 아이콘" },
      ]}
    >
      <Section title="성공">
        <Preview>
          <Result
            status="success"
            title="결제가 완료되었습니다"
            description="주문 내역은 마이페이지에서 확인할 수 있습니다."
            extra={
              <>
                <Button variant="primary">마이페이지로 이동</Button>
                <Button variant="ghost">홈으로</Button>
              </>
            }
          />
        </Preview>
      </Section>

      <Section title="에러">
        <Preview>
          <Result
            status="error"
            title="요청 처리에 실패했습니다"
            description="잠시 후 다시 시도해주세요. 문제가 계속되면 고객센터에 문의하세요."
            extra={
              <>
                <Button variant="primary">다시 시도</Button>
                <Button variant="ghost">고객센터</Button>
              </>
            }
          />
        </Preview>
      </Section>

      <Section title="404 페이지">
        <Preview>
          <Result
            status="404"
            title="페이지를 찾을 수 없습니다"
            description="요청하신 페이지가 존재하지 않거나 이동되었습니다."
            extra={<Button variant="primary">홈으로 돌아가기</Button>}
          />
        </Preview>
      </Section>

      <Section title="경고 / 정보">
        <Preview>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Result
              status="warning"
              title="주의가 필요합니다"
              description="일부 설정이 권장 사항과 다릅니다."
            />
            <Result
              status="info"
              title="안내"
              description="시스템 점검이 예정되어 있습니다."
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
