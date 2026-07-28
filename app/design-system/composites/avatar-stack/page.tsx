"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { AvatarStack } from "@/ds/composites/AvatarStack";

const names = ["김준하", "이서연", "박민수", "최유진", "정다은", "한지호", "윤채원"];

export default function AvatarStackPage() {
  return (
    <ComponentPage
      name="AvatarStack"
      description="아바타 스택. 여러 사용자를 겹쳐진 아바타로 표시합니다."
      importPath='import { AvatarStack } from "@/ds/composites/AvatarStack"'
      props={[
        { name: "names", type: "string[]", description: "사용자 이름 목록" },
        { name: "max", type: "number", default: "4", description: "최대 표시 수" },
        {
          name: "size",
          type: '"xs"|"sm"|"md"|"lg"|"xl"',
          default: '"sm"',
          description: "아바타 크기",
        },
      ]}
    >
      <Section title="기본">
        <Preview>
          <AvatarStack names={names} />
        </Preview>
      </Section>

      <Section title="크기">
        <Preview>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted w-8">xs</span>
              <AvatarStack names={names} size="xs" max={5} />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted w-8">sm</span>
              <AvatarStack names={names} size="sm" max={5} />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted w-8">md</span>
              <AvatarStack names={names} size="md" max={5} />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted w-8">lg</span>
              <AvatarStack names={names} size="lg" max={5} />
            </div>
          </div>
        </Preview>
      </Section>

      <Section title="최대 표시 수">
        <Preview>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted w-16">max=2</span>
              <AvatarStack names={names} max={2} />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted w-16">max=4</span>
              <AvatarStack names={names} max={4} />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted w-16">max=7</span>
              <AvatarStack names={names} max={7} />
            </div>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
