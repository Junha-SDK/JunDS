"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Transfer } from "@/ds/composites/Transfer";
import type { TransferItem } from "@/ds/composites/Transfer";

const initialSource: TransferItem[] = [
  { key: "react", label: "React" },
  { key: "vue", label: "Vue" },
  { key: "angular", label: "Angular" },
  { key: "svelte", label: "Svelte" },
  { key: "solid", label: "SolidJS" },
  { key: "next", label: "Next.js" },
  { key: "nuxt", label: "Nuxt" },
  { key: "remix", label: "Remix" },
  { key: "astro", label: "Astro" },
  { key: "qwik", label: "Qwik" },
];

export default function TransferPage() {
  const [source, setSource] = useState<TransferItem[]>(initialSource);
  const [target, setTarget] = useState<TransferItem[]>([]);

  const [source2, setSource2] = useState<TransferItem[]>([
    { key: "kr", label: "한국어" },
    { key: "en", label: "English" },
    { key: "ja", label: "日本語" },
    { key: "zh", label: "中文" },
    { key: "es", label: "Español" },
    { key: "fr", label: "Français" },
    { key: "de", label: "Deutsch" },
    { key: "disabled", label: "이동 불가", disabled: true },
  ]);
  const [target2, setTarget2] = useState<TransferItem[]>([]);

  return (
    <ComponentPage
      name="Transfer"
      description="트랜스퍼. 두 목록 간에 항목을 이동할 수 있습니다. 검색 기능과 비활성화 항목을 지원합니다."
      importPath='import { Transfer } from "@/ds/composites/Transfer"'
      props={[
        { name: "source", type: "TransferItem[]", required: true, description: "소스 목록" },
        { name: "target", type: "TransferItem[]", required: true, description: "대상 목록" },
        {
          name: "onChange",
          type: "(source, target) => void",
          required: true,
          description: "변경 핸들러",
        },
        { name: "sourceTitle", type: "string", default: '"소스"', description: "소스 패널 제목" },
        { name: "targetTitle", type: "string", default: '"대상"', description: "대상 패널 제목" },
        { name: "searchable", type: "boolean", default: "false", description: "검색 기능 활성화" },
      ]}
    >
      <Section title="검색 가능한 트랜스퍼">
        <Preview>
          <Transfer
            source={source}
            target={target}
            onChange={(s, t) => {
              setSource(s);
              setTarget(t);
            }}
            sourceTitle="프레임워크"
            targetTitle="선택됨"
            searchable
          />
        </Preview>
      </Section>

      <Section title="비활성화 항목 포함">
        <Preview>
          <Transfer
            source={source2}
            target={target2}
            onChange={(s, t) => {
              setSource2(s);
              setTarget2(t);
            }}
            sourceTitle="언어 선택"
            targetTitle="사용 언어"
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
