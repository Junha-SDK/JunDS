"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { EmojiPicker } from "@/ds/composites/EmojiPicker";

export default function EmojiPickerPage() {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <ComponentPage
      name="EmojiPicker"
      description="카테고리 탭과 검색을 지원하는 이모지 선택 패널."
      importPath='import { EmojiPicker } from "@/ds/composites/EmojiPicker"'
      props={[
        { name: "onSelect", type: "(emoji: string) => void", description: "이모지를 선택했을 때 호출되는 콜백" },
        { name: "className", type: "string", description: "컨테이너 클래스" },
      ]}
    >
      <Section title="Default">
        <Preview>
          <div className="flex items-start gap-4">
            <EmojiPicker onSelect={setPicked} />
            <div className="text-sm">
              선택됨: <span className="text-2xl">{picked ?? "—"}</span>
            </div>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
