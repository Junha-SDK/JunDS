"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { DocPager } from "@/ds/composites/DocPager";

export default function DocPagerPage() {
  return (
    <ComponentPage
      name="DocPager"
      description="문서 하단의 이전/다음 내비게이션. 한쪽만 있으면 나머지 자리를 비워 '다음'이 항상 오른쪽에 오게 한다."
      importPath='import { DocPager } from "@/ds/composites/DocPager"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <div className="w-full">
            <DocPager
              prev={{ href: "#", title: "설치하기", description: "시작하기" }}
              next={{ href: "#", title: "테마 구성", description: "기초" }}
            />
          </div>
        </Preview>
      </Section>

      <Section title="Next only">
        <Preview>
          <div className="w-full">
            <DocPager next={{ href: "#", title: "첫 컴포넌트 만들기" }} />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
