"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { KeyValueGrid } from "@/ds/composites/KeyValueGrid";
import type { KeyValueItem } from "@/ds/composites/KeyValueGrid";

const basicItems: KeyValueItem[] = [
  { key: "name", label: "이름", value: "홍길동" },
  { key: "email", label: "이메일", value: "hong@example.com" },
  { key: "phone", label: "전화번호", value: "010-1234-5678" },
  { key: "dept", label: "부서", value: "개발팀" },
  { key: "role", label: "직급", value: "시니어 엔지니어" },
  { key: "joined", label: "입사일", value: "2022-03-15" },
];

const borderedItems: KeyValueItem[] = [
  { key: "orderId", label: "주문번호", value: "ORD-2024-00142" },
  { key: "date", label: "주문일", value: "2024-01-15" },
  { key: "status", label: "상태", value: "배송 중" },
  { key: "amount", label: "결제금액", value: "₩128,000" },
  { key: "method", label: "결제수단", value: "신용카드 (****-1234)" },
  { key: "address", label: "배송지", value: "서울시 강남구 테헤란로 123" },
];

const threeColItems: KeyValueItem[] = [
  { key: "cpu", label: "CPU 사용률", value: "42%" },
  { key: "memory", label: "메모리", value: "8.2 / 16 GB" },
  { key: "disk", label: "디스크", value: "120 / 500 GB" },
  { key: "network", label: "네트워크", value: "1.2 Gbps" },
  { key: "uptime", label: "가동시간", value: "45일 12시간" },
  { key: "requests", label: "요청 수", value: "1,234/초" },
];

export default function KeyValueGridPage() {
  return (
    <ComponentPage
      name="KeyValueGrid"
      description="필드명과 값을 그리드로 배치하여 정보를 표시하는 컴포넌트. 테두리 스타일과 다양한 컬럼 수를 지원합니다."
      importPath='import { KeyValueGrid } from "@/ds/composites/KeyValueGrid"'
      props={[
        { name: "items", type: "KeyValueItem[]", required: true, description: "키-값 항목 목록 ({ key, label, value, span? })" },
        { name: "columns", type: "2 | 3 | 4", default: "3", description: "컬럼 수" },
        { name: "bordered", type: "boolean", default: "false", description: "테두리 스타일 적용" },
      ]}
    >
      <Section title="기본">
        <p className="text-sm text-muted mb-3">
          6개의 항목을 2컬럼으로 배치한 기본 형태입니다. 라벨은 작은 대문자로, 값은 본문 텍스트로 표시됩니다.
        </p>
        <Preview>
          <KeyValueGrid items={basicItems} columns={2} />
        </Preview>
      </Section>

      <Section title="테두리">
        <p className="text-sm text-muted mb-3">
          bordered prop을 사용하면 각 항목에 테두리가 적용되어 구분이 더 명확해집니다.
        </p>
        <Preview>
          <KeyValueGrid items={borderedItems} columns={2} bordered />
        </Preview>
      </Section>

      <Section title="3컬럼">
        <p className="text-sm text-muted mb-3">
          columns=3으로 설정하면 더 많은 항목을 한 줄에 표시할 수 있습니다.
        </p>
        <Preview>
          <KeyValueGrid items={threeColItems} columns={3} bordered />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
