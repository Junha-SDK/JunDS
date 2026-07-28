import type {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementType,
  PropsWithChildren,
  ReactElement,
  ForwardRefRenderFunction,
} from "react";
import { forwardRef } from "react";

/**
 * Polymorphic `as` prop 타입 유틸리티
 *
 * @example
 * type ButtonProps = PolymorphicProps<"button", { variant: "primary" | "ghost" }>;
 * // Now accepts `as="a"` and all anchor props are available
 */

// Base props with `as`
type AsProp<C extends ElementType> = {
  as?: C;
};

// Merge own props with element props, excluding conflicts
type PropsToOmit<C extends ElementType, P> = keyof (AsProp<C> & P);

export type PolymorphicProps<C extends ElementType, Props = object> = PropsWithChildren<
  Props & AsProp<C>
> &
  Omit<ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

export type PolymorphicRef<C extends ElementType> = ComponentPropsWithRef<C>["ref"];

export type PolymorphicPropsWithRef<C extends ElementType, Props = object> = PolymorphicProps<
  C,
  Props
> & { ref?: PolymorphicRef<C> };
