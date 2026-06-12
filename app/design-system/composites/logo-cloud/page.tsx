"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { LogoCloud } from "@/ds/composites/LogoCloud";

export default function LogoCloudPage() {
  return (
    <ComponentPage
      name="LogoCloud"
      description="TODO: 1–2문장 설명"
      importPath='import { LogoCloud } from "@/ds/composites/LogoCloud"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <LogoCloud title="신뢰받는 파트너" columns={5} logos={[{name:"Acme"},{name:"Globex"},{name:"Initech"},{name:"Umbrella"},{name:"Stark"}]} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
