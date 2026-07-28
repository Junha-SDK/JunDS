"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Descriptions } from "@/ds/composites/Descriptions";

export default function DescriptionsPage() {
  return (
    <ComponentPage
      name="Descriptions"
      description="키-값 쌍을 구조화하여 표시하는 컴포넌트. 테두리/비테두리 모드와 다중 컬럼을 지원합니다."
      importPath='import { Descriptions } from "@/ds/composites/Descriptions"'
      props={[
        {
          name: "items",
          type: "DescriptionItem[]",
          required: true,
          description: "키-값 아이템 목록",
        },
        { name: "title", type: "string", description: "제목" },
        { name: "columns", type: "number", default: "2", description: "컬럼 수" },
        { name: "bordered", type: "boolean", default: "false", description: "테두리 모드" },
        {
          name: "layout",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description: "레이아웃 방향",
        },
      ]}
    >
      <Section title="기본 사용">
        <Preview>
          <Descriptions
            title="사용자 정보"
            items={[
              { key: "name", label: "이름", value: "홍길동" },
              { key: "email", label: "이메일", value: "hong@example.com" },
              { key: "phone", label: "전화번호", value: "010-1234-5678" },
              { key: "address", label: "주소", value: "서울특별시 강남구" },
            ]}
          />
        </Preview>
      </Section>

      <Section title="테두리 모드">
        <Preview>
          <Descriptions
            title="주문 정보"
            bordered
            items={[
              { key: "orderNo", label: "주문번호", value: "ORD-20260420-001" },
              { key: "date", label: "주문일자", value: "2026.04.20" },
              { key: "status", label: "상태", value: "배송중" },
              { key: "total", label: "결제금액", value: "₩128,000" },
            ]}
          />
        </Preview>
      </Section>

      <Section title="3컬럼 레이아웃">
        <Preview>
          <Descriptions
            title="서버 상태"
            columns={3}
            bordered
            items={[
              { key: "cpu", label: "CPU", value: "42%" },
              { key: "memory", label: "메모리", value: "8.2 GB / 16 GB" },
              { key: "disk", label: "디스크", value: "120 GB / 500 GB" },
              { key: "uptime", label: "가동 시간", value: "72일 14시간" },
              { key: "os", label: "운영체제", value: "Ubuntu 22.04" },
              { key: "region", label: "리전", value: "ap-northeast-2" },
            ]}
          />
        </Preview>
      </Section>

      <Section title="세로 레이아웃">
        <Preview>
          <Descriptions
            title="프로젝트 요약"
            layout="vertical"
            bordered
            columns={3}
            items={[
              { key: "name", label: "프로젝트명", value: "JunDS" },
              { key: "version", label: "버전", value: "1.0.0" },
              { key: "license", label: "라이선스", value: "MIT" },
            ]}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
