"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { PageHeader } from "@/ds/composites/PageHeader";

export default function PageHeaderPage() {
  return (
    <ComponentPage
      name="PageHeader"
      description="TODO: 1–2문장 설명"
      importPath='import { PageHeader } from "@/ds/composites/PageHeader"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <PageHeader title="사용자 관리" description="조직 내 사용자를 관리하세요" breadcrumb={[{label:"홈",href:"#"},{label:"사용자"}]} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
