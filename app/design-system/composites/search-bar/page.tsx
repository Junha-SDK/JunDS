"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { SearchBar } from "@/ds/composites/SearchBar";

export default function SearchBarPage() {
  return (
    <ComponentPage
      name="SearchBar"
      description="TODO: 1–2문장 설명"
      importPath='import { SearchBar } from "@/ds/composites/SearchBar"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <SearchBar placeholder="검색" focusShortcut="mod+k" />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
