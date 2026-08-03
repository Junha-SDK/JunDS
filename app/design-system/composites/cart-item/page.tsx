"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { CartItem } from "@/ds/composites/CartItem";

export default function CartItemPage() {
  return (
    <ComponentPage
      name="CartItem"
      description="TODO: 1–2문장 설명"
      importPath='import { CartItem } from "@/ds/composites/CartItem"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <CartItem
            title="베이직 셔츠"
            variant="블랙 / M"
            image="https://placehold.co/200"
            price="₩29,000"
            subtotal="₩58,000"
            quantity={2}
            onQuantityChange={() => {}}
            onRemove={() => {}}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
