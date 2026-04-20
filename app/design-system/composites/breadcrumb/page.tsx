"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Breadcrumb } from "@/ds/composites/Breadcrumb";

export default function BreadcrumbPage() {
  return (
    <ComponentPage
      name="Breadcrumb"
      description="경로 탐색 네비게이션."
      importPath='import { Breadcrumb } from "@/ds/composites/Breadcrumb"'
      props={[
        { name: "items", type: "BreadcrumbItem[]", required: true, description: "경로 항목" },
        { name: "separator", type: "ReactNode", description: "구분자 커스텀" },
      ]}
    >
      <Section title="Demo">
        <Preview>
          <Breadcrumb items={[
            { label: "홈", href: "/" },
            { label: "프로젝트", href: "/projects" },
            { label: "SLD 관리", href: "/projects/1" },
            { label: "설정" },
          ]} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
