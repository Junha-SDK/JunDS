"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Banner } from "@/ds/composites/Banner";

export default function BannerPage() {
  return (
    <ComponentPage
      name="Banner"
      description="페이지 최상단에 가로로 펼쳐지는 공지 배너. 시스템 알림·프로모션·중요 안내에 사용합니다."
      importPath='import { Banner } from "@/ds/composites/Banner"'
      props={[
        {
          name: "variant",
          type: '"info"|"success"|"warning"|"danger"',
          default: '"info"',
          description: "유형",
        },
        { name: "dismissible", type: "boolean", default: "true", description: "닫기 버튼 표시" },
        { name: "icon", type: "ReactNode", description: "좌측 아이콘" },
        { name: "action", type: "ReactNode", description: "우측 액션 (예: 버튼/링크)" },
      ]}
    >
      <Section title="All Variants">
        <Preview>
          <div className="flex flex-col gap-2 w-full">
            <Banner variant="info">시스템 점검이 오늘 23시부터 진행됩니다.</Banner>
            <Banner variant="success">새로운 기능이 출시되었습니다.</Banner>
            <Banner variant="warning">곧 유효 기간이 만료됩니다.</Banner>
            <Banner variant="danger">결제에 실패했습니다. 카드 정보를 확인해 주세요.</Banner>
          </div>
        </Preview>
      </Section>

      <Section title="Action 포함">
        <Preview>
          <Banner
            variant="info"
            action={
              <button type="button" className="underline text-xs font-semibold">
                자세히 보기
              </button>
            }
          >
            새로운 약관에 동의해 주세요.
          </Banner>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
