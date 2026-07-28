"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ProductCard } from "@/ds/composites/ProductCard";

export default function ProductCardPage() {
  return (
    <ComponentPage
      name="ProductCard"
      description="TODO: 1–2문장 설명"
      importPath='import { ProductCard } from "@/ds/composites/ProductCard"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <ProductCard
            title="베이직 셔츠"
            image="https://placehold.co/400x400"
            price={<span>₩29,000</span>}
            rating={4.5}
            reviewCount={128}
            badge="NEW"
            brand="JunDS"
            onWishlist={() => {}}
            onAddToCart={() => {}}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
