"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { TrustIndicator } from "@/ds/composites/TrustIndicator";

export default function TrustIndicatorPage() {
  return (
    <ComponentPage
      name="TrustIndicator"
      description="보안 신뢰 지표. 항목별 통과/실패 상태와 전체 점수를 표시합니다."
      importPath='import { TrustIndicator } from "@/ds/composites/TrustIndicator"'
      props={[
        { name: "items", type: "TrustItem[]", required: true, description: "검사 항목 배열" },
        { name: "title", type: "string", description: "제목" },
      ]}
    >
      <Section title="Demo">
        <Preview>
          <div className="max-w-md">
            <TrustIndicator
              title="보안 점검 결과"
              items={[
                {
                  key: "ssl",
                  label: "SSL/TLS 암호화",
                  description: "TLS 1.3 적용됨",
                  status: "pass",
                },
                { key: "2fa", label: "2단계 인증", description: "활성화됨 (TOTP)", status: "pass" },
                {
                  key: "pw",
                  label: "비밀번호 강도",
                  description: "마지막 변경: 15일 전",
                  status: "pass",
                },
                {
                  key: "session",
                  label: "세션 관리",
                  description: "자동 만료: 30분",
                  status: "pass",
                },
                {
                  key: "ip",
                  label: "IP 화이트리스트",
                  description: "설정이 필요합니다",
                  status: "fail",
                },
                {
                  key: "audit",
                  label: "감사 로그",
                  description: "마지막 점검: 3일 전",
                  status: "warning",
                },
              ]}
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
