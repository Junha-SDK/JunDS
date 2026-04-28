"use client";
import { forwardRef, useId } from "react";
import { cn } from "../utils/cn";
import { resolveStyleProps, splitStyleProps, hasResponsiveProps, generateResponsiveCSS } from "./styleProps";
import type { StyleProps } from "./styleProps";
import type { ElementType, ComponentPropsWithRef, ReactNode } from "react";

export interface BoxOwnProps extends StyleProps {
  as?: ElementType;
  children?: ReactNode;
  className?: string;
}

export type BoxProps<C extends ElementType = "div"> = BoxOwnProps &
  Omit<ComponentPropsWithRef<C>, keyof BoxOwnProps>;

/**
 * JunDS Framework의 기본 빌딩 블록.
 *
 * 모든 스타일링은 토큰 기반 props를 통해 이루어집니다.
 * 반응형 props 지원: `p={{ base: 2, md: 4, lg: 6 }}`
 *
 * @example
 * <Box p={4} bg="primary" radius="lg" color="white">Content</Box>
 * <Box p={{ base: 2, md: 4 }} display={{ base: "block", md: "flex" }}>Responsive</Box>
 */
export const Box = forwardRef<HTMLElement, BoxProps>(
  ({ as: Component = "div", children, className, style, ...rest }, ref) => {
    const { styleProps, rest: htmlProps } = splitStyleProps(rest);
    const hasResponsive = hasResponsiveProps(styleProps);

    if (hasResponsive) {
      const responsive = generateResponsiveCSS(styleProps);
      if (responsive) {
        return (
          <>
            <style dangerouslySetInnerHTML={{ __html: responsive.responsiveCSS }} />
            <Component
              ref={ref}
              className={cn(responsive.className, className)}
              style={{ ...responsive.baseStyle, ...style }}
              {...htmlProps}
            >
              {children}
            </Component>
          </>
        );
      }
    }

    const resolvedStyle = resolveStyleProps(styleProps);

    return (
      <Component
        ref={ref}
        className={cn(className)}
        style={{ ...resolvedStyle, ...style }}
        {...htmlProps}
      >
        {children}
      </Component>
    );
  },
);

Box.displayName = "Box";
