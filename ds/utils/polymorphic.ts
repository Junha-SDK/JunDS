import type { ComponentPropsWithoutRef, ElementType } from "react";

/** `as` prop으로 렌더링 요소를 바꿀 수 있는 다형성 타입 */
export type PolymorphicProps<
  E extends ElementType,
  P = object,
> = P &
  Omit<ComponentPropsWithoutRef<E>, keyof P | "as"> & {
    as?: E;
  };
