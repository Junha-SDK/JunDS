"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { BarList } from "@/ds/composites/BarList";

const ITEMS = [
  { label: "영화", value: 42 },
  { label: "책", value: 31 },
  { label: "애니", value: 18 },
  { label: "뮤지컬", value: 9 },
  { label: "만화", value: 4 },
];

export default function BarListPage() {
  return (
    <ComponentPage
      name="BarList"
      description="가로 막대 순위 목록 — 이름·막대·수치 한 줄. 막대는 장식이고 수치가 본문이다."
      importPath='import { BarList } from "@/ds/composites/BarList"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <div className="w-full max-w-sm">
            <BarList items={ITEMS} sorted />
          </div>
        </Preview>
      </Section>

      <Section title="Top 3 with formatting">
        <Preview>
          <div className="w-full max-w-sm">
            <BarList
              items={ITEMS}
              sorted
              limit={3}
              formatValue={(v) => `${v}편`}
              color="var(--accent)"
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
