"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { SettingsLayout } from "@/ds/patterns/SettingsLayout";

export default function SettingsLayoutPage() {
  return (
    <ComponentPage
      name="SettingsLayout"
      description="TODO: 1–2문장 설명"
      importPath='import { SettingsLayout } from "@/ds/patterns/SettingsLayout"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <SettingsLayout title="설정" sections={[
            { id:"profile", label:"프로필", content:<div className="text-sm text-muted">프로필 설정</div> },
            { id:"security", label:"보안", content:<div className="text-sm text-muted">보안 설정</div> },
            { id:"notif", label:"알림", group:"환경", content:<div className="text-sm text-muted">알림 설정</div> },
          ]} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
