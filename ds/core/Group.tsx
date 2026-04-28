"use client";
import { forwardRef } from "react";
import { Flex } from "./Flex";
import type { FlexProps } from "./Flex";

export interface GroupProps extends Omit<FlexProps, "direction"> {
  /** 자식이 줄 바꿈 허용 */
  noWrap?: boolean;
}

export const Group = forwardRef<HTMLElement, GroupProps>(
  ({ gap = "sm", align = "center", noWrap, ...props }, ref) => (
    <Flex
      ref={ref}
      direction="row"
      gap={gap}
      align={align}
      wrap={noWrap ? "nowrap" : "wrap"}
      {...props}
    />
  ),
);

Group.displayName = "Group";
