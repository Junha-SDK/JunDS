"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Kbd } from "@/ds/primitives/Kbd";

export default function KbdPage() {
  return (
    <ComponentPage
      name="Kbd"
      description="키보드 단축키 표시."
      importPath='import { Kbd } from "@/ds/primitives/Kbd"'
      props={[
        { name: "keys", type: "string[]", description: "키 조합" },
      ]}
    >
      <Section title="Examples">
        <Preview>
          <div className="flex items-center gap-4 flex-wrap">
            <Kbd keys={["⌘", "K"]} />
            <Kbd keys={["⌘", "S"]} />
            <Kbd keys={["⌘", "⇧", "P"]} />
            <Kbd>Esc</Kbd>
            <Kbd>Enter</Kbd>
            <Kbd keys={["Ctrl", "+", "C"]} />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
