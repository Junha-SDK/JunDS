"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Callout } from "@/ds/composites/Callout";

export default function CalloutPage() {
  return (
    <ComponentPage
      name="Callout"
      description="독자의 주의를 끌기 위한 강조 블록. 5가지 variant로 메모, 경고, 위험, 팁, 정보를 구분합니다."
      importPath='import { Callout } from "@/ds/composites/Callout"'
      props={[
        { name: "variant", type: '"note"|"warning"|"danger"|"tip"|"info"', default: '"info"', description: "콜아웃 스타일" },
        { name: "title", type: "string", description: "콜아웃 제목" },
        { name: "children", type: "ReactNode", description: "콜아웃 내용" },
        { name: "collapsible", type: "boolean", default: "false", description: "접기/펼치기 가능 여부" },
        { name: "className", type: "string", description: "추가 CSS 클래스" },
      ]}
    >
      <Section title="변형">
        <Preview>
          <div className="flex flex-col gap-4">
            <Callout variant="note" title="노트">
              이것은 일반적인 참고 사항입니다. 독자에게 부가 정보를 전달할 때 사용합니다.
            </Callout>
            <Callout variant="warning" title="경고">
              이 작업은 되돌릴 수 없습니다. 진행하기 전에 데이터를 백업하세요.
            </Callout>
            <Callout variant="danger" title="위험">
              프로덕션 환경에서 이 명령을 실행하면 모든 데이터가 삭제됩니다.
            </Callout>
            <Callout variant="tip" title="팁">
              <code className="text-xs bg-emerald-100 dark:bg-emerald-900/30 px-1 py-0.5 rounded">Cmd + K</code>를 눌러 빠른 검색을 열 수 있습니다.
            </Callout>
            <Callout variant="info" title="정보">
              다음 업데이트에서 새로운 API가 추가될 예정입니다. 변경 사항을 확인하세요.
            </Callout>
          </div>
        </Preview>
      </Section>

      <Section title="접기 가능">
        <Preview>
          <div className="flex flex-col gap-4">
            <Callout variant="tip" title="클릭하여 펼치기" collapsible>
              이 콜아웃은 접기/펼치기가 가능합니다. 제목을 클릭하면 내용이 토글됩니다.
              긴 보충 설명이나 선택적으로 읽을 수 있는 내용에 적합합니다.
            </Callout>
            <Callout variant="warning" title="고급 설정 안내" collapsible>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>환경 변수를 수정하기 전에 기존 값을 기록하세요.</li>
                <li>변경 후 서버를 반드시 재시작해야 합니다.</li>
                <li>문제가 발생하면 <code className="text-xs bg-amber-100 dark:bg-amber-900/30 px-1 py-0.5 rounded">.env.backup</code> 파일을 복원하세요.</li>
              </ul>
            </Callout>
          </div>
        </Preview>
      </Section>

      <Section title="커스텀 제목">
        <Preview>
          <div className="flex flex-col gap-4">
            <Callout variant="info" title="v2.0 마이그레이션 가이드">
              기존 <code className="text-xs bg-blue-100 dark:bg-blue-900/30 px-1 py-0.5 rounded">useQuery</code> 훅이 deprecated 되었습니다. 새로운 <code className="text-xs bg-blue-100 dark:bg-blue-900/30 px-1 py-0.5 rounded">useSuspenseQuery</code>로 전환하세요.
            </Callout>
            <Callout variant="danger" title="보안 취약점 발견 (CVE-2024-1234)">
              즉시 패키지를 최신 버전으로 업데이트하세요. 영향받는 버전: 1.0.0 ~ 1.2.3
            </Callout>
            <Callout variant="note">
              제목 없이도 사용할 수 있습니다. 짧은 인라인 메모에 적합합니다.
            </Callout>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
