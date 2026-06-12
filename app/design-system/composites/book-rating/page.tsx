"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { BookRating } from "@/ds/composites/BookRating";

export default function BookRatingPage() {
  return (
    <ComponentPage
      name="BookRating"
      description="5점 별점 + 평균 + (선택) 점수 분포 막대."
      importPath='import { BookRating } from "@/ds/composites/BookRating"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <BookRating value={4.3} reviews={1820} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
