"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Snackbar } from "@/ds/composites/Snackbar";

export default function SnackbarPage() {
  return (
    <ComponentPage
      name="Snackbar"
      description="TODO: 1–2문장 설명"
      importPath='import { Snackbar } from "@/ds/composites/Snackbar"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <Snackbar />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
