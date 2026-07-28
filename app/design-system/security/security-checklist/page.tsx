"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { SecurityChecklist } from "@/ds/patterns/SecurityChecklist";

export default function SecurityChecklistPage() {
  return (
    <ComponentPage
      name="SecurityChecklist"
      description="보안 체크리스트. 보안 설정 현황을 한눈에 확인하고 즉시 조치할 수 있습니다."
      importPath='import { SecurityChecklist } from "@/ds/patterns/SecurityChecklist"'
      props={[
        { name: "items", type: "SecurityCheckItem[]", required: true, description: "체크 항목" },
        { name: "title", type: "string", default: '"보안 체크리스트"', description: "제목" },
      ]}
    >
      <Section title="Demo">
        <Preview>
          <div className="max-w-lg">
            <SecurityChecklist
              items={[
                {
                  key: "pw",
                  title: "비밀번호 강도",
                  description: "강력한 비밀번호가 설정되어 있습니다",
                  status: "secure",
                },
                {
                  key: "2fa",
                  title: "2단계 인증 (2FA)",
                  description: "계정 보호를 위해 2FA를 활성화하세요",
                  status: "insecure",
                  action: { label: "설정하기", onClick: () => {} },
                },
                {
                  key: "session",
                  title: "세션 타임아웃",
                  description: "30분 비활동 시 자동 로그아웃 (권장: 15분)",
                  status: "attention",
                  action: { label: "변경", onClick: () => {} },
                },
                {
                  key: "recovery",
                  title: "복구 이메일",
                  description: "복구용 이메일이 등록되어 있습니다",
                  status: "secure",
                },
                {
                  key: "device",
                  title: "신뢰할 수 있는 기기",
                  description: "3개의 기기가 등록되어 있습니다",
                  status: "secure",
                },
                {
                  key: "audit",
                  title: "로그인 기록 확인",
                  description: "아직 확인하지 않았습니다",
                  status: "unchecked",
                  action: { label: "확인", onClick: () => {} },
                },
              ]}
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
