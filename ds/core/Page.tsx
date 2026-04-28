"use client";
import { Box } from "./Box";
import { Heading } from "./Heading";
import { Text } from "./Text";
import type { ReactNode } from "react";
import type { SpacingToken, Responsive } from "./styleProps";

export interface PageProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  p?: Responsive<SpacingToken>;
  className?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
  className?: string;
}

export interface PageBodyProps {
  children: ReactNode;
  gap?: Responsive<SpacingToken>;
  className?: string;
}

const maxWidthMap = {
  sm: "640px", md: "768px", lg: "1024px",
  xl: "1280px", "2xl": "1536px", full: "100%",
};

export function Page({ children, maxWidth = "xl", p = { base: 4, md: 6 }, className }: PageProps) {
  return (
    <Box
      mx="auto"
      w="full"
      p={p}
      maxW={maxWidthMap[maxWidth]}
      className={className}
    >
      {children}
    </Box>
  );
}

function PageHeader({ title, description, actions, breadcrumb, className }: PageHeaderProps) {
  return (
    <Box mb={6} className={className}>
      {breadcrumb && <Box mb={3}>{breadcrumb}</Box>}
      <Box display={{ base: "block", md: "flex" }} align="start" justify="between" gap={4}>
        <Box>
          <Heading level={1} mb={description ? 1 : 0}>{title}</Heading>
          {description && <Text fontSize="sm" dimmed>{description}</Text>}
        </Box>
        {actions && (
          <Box display="flex" align="center" gap={2} shrink={0} mt={{ base: 3, md: 0 }}>
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
}

function PageBody({ children, gap = { base: 4, md: 6 }, className }: PageBodyProps) {
  return (
    <Box display="flex" direction="column" gap={gap} className={className}>
      {children}
    </Box>
  );
}

Page.Header = PageHeader;
Page.Body = PageBody;
