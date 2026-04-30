"use client";
import { useState, type ReactNode } from "react";
import type { PropDef } from "./PropsTable";
import { PropsTable } from "./PropsTable";
import { Box, Flex, VStack, HStack, Heading, Text } from "@/ds/core";
import { Badge } from "@/ds/primitives/Badge";
import { cn } from "@/ds/utils/cn";

/* ═══════════════════════ Main Page ═══════════════════════ */

export interface ComponentPageProps {
  name: string;
  description: string;
  importPath: string;
  children: ReactNode;
  props?: PropDef[];
  /** 관련 컴포넌트 */
  related?: { name: string; href: string }[];
  /** 상태 뱃지 */
  status?: "stable" | "beta" | "deprecated" | "new";
  /** 버전 */
  version?: string;
}

const statusVariant: Record<string, "success" | "warning" | "danger" | "primary"> = {
  stable: "success",
  beta: "warning",
  deprecated: "danger",
  new: "primary",
};

const statusLabel: Record<string, string> = {
  stable: "Stable",
  beta: "Beta",
  deprecated: "Deprecated",
  new: "New",
};

export function ComponentPage({
  name,
  description,
  importPath,
  children,
  props,
  related,
  status,
  version,
}: ComponentPageProps) {
  return (
    <Box maxW="896px">
      {/* ── Header ── */}
      <Box mb={8}>
        <HStack gap="sm" mb={2}>
          <Heading level={1} mb={0}>{name}</Heading>
          {status && (
            <Badge variant={statusVariant[status]} size="sm">
              {statusLabel[status]}
            </Badge>
          )}
          {version && (
            <Text as="span" fontSize="xs" mono dimmed
              className="bg-gray-100 px-1.5 py-0.5 rounded"
            >
              v{version}
            </Text>
          )}
        </HStack>
        <Text fontSize="sm" dimmed mb={3} lineHeight="relaxed">{description}</Text>
        <HStack gap={2}>
          <Box
            as="code"
            fontSize="xs"
            color="muted"
            bg="surface-raised"
            px={2.5}
            py={1}
            radius="lg"
            border
            className="font-mono"
          >
            {importPath}
          </Box>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(importPath)}
            className="p-1.5 text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
            aria-label="import 복사"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M9.5 4.5V3a1.5 1.5 0 00-1.5-1.5H3A1.5 1.5 0 001.5 3v5A1.5 1.5 0 003 9.5h1.5" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
        </HStack>

        <McpHint name={name} />
      </Box>

      {/* ── Content ── */}
      <VStack gap={10}>
        {children}
      </VStack>

      {/* ── Props Table ── */}
      {props && props.length > 0 && (
        <Box mt={10}>
          <Heading level={2} mb={1}>API Reference</Heading>
          <Text fontSize="xs" dimmed mb={4}>컴포넌트에 전달할 수 있는 모든 props입니다.</Text>
          <PropsTable props={props} />
        </Box>
      )}

      {/* ── Related Components ── */}
      {related && related.length > 0 && (
        <Box mt={10}>
          <Heading level={2} mb={3}>관련 컴포넌트</Heading>
          <Box display="grid" cols={{ base: 2, sm: 3 }} gap={3}>
            {related.map((r) => (
              <a
                key={r.name}
                href={r.href}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <Text as="span" fontSize="sm" fontWeight="medium" color="foreground" className="group-hover:text-primary transition-colors">
                  {r.name}
                </Text>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ml-auto text-muted group-hover:text-primary transition-colors">
                  <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

/* ═══════════════════════ MCP Hint ═══════════════════════ */

function McpHint({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const lines: { tool: string; arg: string; desc: string }[] = [
    { tool: "get_component_props", arg: `"${name}"`, desc: "한국어 JSDoc 포함 prop 시그니처" },
    { tool: "locate", arg: `"${name.toLowerCase()}"`, desc: "관련 페이지·요구사항·테스트 랭킹" },
    { tool: "get_a11y", arg: `"${name}"`, desc: "axe-core 접근성 보고서" },
    { tool: "get_bundle_info", arg: `"${name}"`, desc: "raw + gzip 사이즈" },
  ];

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <Box mt={3}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer",
          "bg-primary/5 border border-primary/15 text-primary hover:bg-primary/10 hover:border-primary/30",
        )}
      >
        <Box as="span" className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span>AI 에디터로 사용하기 (MCP)</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          className={cn("transition-transform", open ? "rotate-180" : undefined)}
          aria-hidden
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <Box mt={2} radius="xl" border p={4} className="bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
          <Text fontSize="xs" dimmed mb={3} lineHeight="relaxed">
            Cursor / Claude Code에서 다음 도구를 호출하면 hallucination 없이 정확한 정보를 받을 수 있습니다.
          </Text>
          <VStack gap={1.5} align="stretch">
            {lines.map((l) => {
              const call = `${l.tool}(${l.arg})`;
              const isCopied = copied === call;
              return (
                <Flex key={l.tool} align="center" gap={2} className="bg-white border border-border rounded-lg px-3 py-2">
                  <Box as="code" fontSize="xs" className="font-mono text-foreground flex-1 truncate">
                    <span className="text-primary">{l.tool}</span>
                    <span className="text-muted">(</span>
                    <span className="text-emerald-600">{l.arg}</span>
                    <span className="text-muted">)</span>
                  </Box>
                  <Text as="span" fontSize="2xs" dimmed mb={0} className="hidden sm:inline">
                    {l.desc}
                  </Text>
                  <button
                    type="button"
                    onClick={() => handleCopy(call)}
                    aria-label={isCopied ? "복사됨" : "도구 호출 복사"}
                    className={cn(
                      "shrink-0 p-1 rounded-md transition-colors cursor-pointer",
                      isCopied ? "text-success" : "text-muted hover:text-primary hover:bg-primary/5",
                    )}
                  >
                    {isCopied ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                        <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                        <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M9.5 4.5V3a1.5 1.5 0 00-1.5-1.5H3A1.5 1.5 0 001.5 3v5A1.5 1.5 0 003 9.5h1.5" stroke="currentColor" strokeWidth="1.3" />
                      </svg>
                    )}
                  </button>
                </Flex>
              );
            })}
          </VStack>
          <Text fontSize="2xs" dimmed mt={3} mb={0} lineHeight="relaxed">
            <Box as="code" className="px-1 py-0.5 rounded bg-white border border-border font-mono text-[10px]">.mcp.json</Box>
            은 저장소 루트에 이미 포함되어 있습니다 — AI 에디터로 프로젝트를 열면 자동 연결.
          </Text>
        </Box>
      )}
    </Box>
  );
}

/* ═══════════════════════ Section ═══════════════════════ */

export function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Box as="section">
      <Heading level={4} mb={description ? 0.5 : 3}>{title}</Heading>
      {description && <Text fontSize="xs" dimmed mb={3} lineHeight="relaxed">{description}</Text>}
      {children}
    </Box>
  );
}

/* ═══════════════════════ Do / Don't ═══════════════════════ */

export interface GuidelineItem {
  type: "do" | "dont" | "caution";
  description: string;
  preview?: ReactNode;
}

export function Guidelines({ items }: { items: GuidelineItem[] }) {
  const config = {
    do: { label: "Do", icon: "\u2713", border: "border-success/30", bg: "bg-success/5", text: "text-success", iconBg: "bg-success" },
    dont: { label: "Don't", icon: "\u2715", border: "border-danger/30", bg: "bg-danger/5", text: "text-danger", iconBg: "bg-danger" },
    caution: { label: "Caution", icon: "!", border: "border-warning/30", bg: "bg-warning/5", text: "text-warning", iconBg: "bg-warning" },
  };

  return (
    <Box display="grid" cols={{ base: 1, md: 2 }} gap={4}>
      {items.map((item, i) => {
        const c = config[item.type];
        return (
          <Box key={i} radius="xl" border overflow="hidden" className={c.border}>
            {item.preview && (
              <Flex align="center" justify="center" p={5} minH="120px" className={c.bg}>
                {item.preview}
              </Flex>
            )}
            <Flex gap={2.5} px={4} py={3} align="start" className="bg-white">
              <Box
                as="span"
                shrink={0}
                w={20}
                h={20}
                radius="full"
                display="flex"
                align="center"
                justify="center"
                color="white"
                fontSize="2xs"
                fontWeight="bold"
                mt={0.5}
                className={c.iconBg}
              >
                {c.icon}
              </Box>
              <Box>
                <Text as="span" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" className={c.text}>
                  {c.label}
                </Text>
                <Text fontSize="xs" dimmed mt={0.5} lineHeight="relaxed">{item.description}</Text>
              </Box>
            </Flex>
          </Box>
        );
      })}
    </Box>
  );
}

/* ═══════════════════════ Anatomy ═══════════════════════ */

export function Anatomy({ items }: { items: { label: string; description: string }[] }) {
  return (
    <VStack gap={2}>
      {items.map((item, i) => (
        <HStack key={i} gap={3} px={4} py={3} radius="lg" align="start" className="bg-gray-50/70 border border-border-light">
          <Box
            as="span"
            shrink={0}
            w={24}
            h={24}
            radius="full"
            display="flex"
            align="center"
            justify="center"
            fontSize="xs"
            fontWeight="bold"
            mt={0.5}
            className="bg-primary/10 text-primary"
          >
            {i + 1}
          </Box>
          <Box>
            <Text as="p" fontSize="sm" fontWeight="semibold" color="foreground">{item.label}</Text>
            <Text fontSize="xs" dimmed mt={0.5}>{item.description}</Text>
          </Box>
        </HStack>
      ))}
    </VStack>
  );
}

/* ═══════════════════════ Usage Note ═══════════════════════ */

export function UsageNote({ children, type = "info" }: { children: ReactNode; type?: "info" | "warning" | "tip" }) {
  const config = {
    info: { icon: "\u2139", bg: "bg-info/5", border: "border-info/20", text: "text-info" },
    warning: { icon: "\u26A0", bg: "bg-warning/5", border: "border-warning/20", text: "text-warning" },
    tip: { icon: "\uD83D\uDCA1", bg: "bg-success/5", border: "border-success/20", text: "text-success" },
  };
  const c = config[type];

  return (
    <Flex gap={3} px={4} py={3} radius="xl" border className={cn(c.bg, c.border)}>
      <Text as="span" fontSize="md" shrink={0} className={c.text}>{c.icon}</Text>
      <Box fontSize="xs" color="foreground" lineHeight="relaxed">{children}</Box>
    </Flex>
  );
}

/* ═══════════════════════ Accessibility Note ═══════════════════════ */

export function AccessibilityNote({ items }: { items: string[] }) {
  return (
    <Box radius="xl" border p={4} className="bg-gray-50/50">
      <HStack gap={2} mb={3}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="4.5" r="1" fill="currentColor" />
          <path d="M5.5 7L8 7.5M10.5 7L8 7.5M8 7.5V12M8 12L6 14M8 12L10 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <Heading level={5} mb={0}>접근성</Heading>
      </HStack>
      <VStack as="ul" gap={1.5}>
        {items.map((item, i) => (
          <HStack as="li" key={i} gap={2} align="start" fontSize="xs" color="muted">
            <Text as="span" color="primary" shrink={0} mt={0.5}>•</Text>
            <Text as="span" fontSize="xs" dimmed>{item}</Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}

/* ═══════════════════════ Code Block ═══════════════════════ */

export function CodeExample({ code, language = "tsx" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable (insecure context) — silently ignore
    }
  };
  return (
    <Box radius="xl" border overflow="hidden" position="relative">
      <Flex align="center" justify="between" px={4} py={2} className="bg-gray-50 border-b border-border">
        <Text as="span" fontSize="2xs" fontWeight="semibold" dimmed textTransform="uppercase" letterSpacing="wider">
          {language}
        </Text>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "코드가 복사되었습니다" : "코드 복사"}
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer",
            copied
              ? "bg-success/10 text-success"
              : "text-muted hover:text-primary hover:bg-gray-100",
          )}
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>복사됨</span>
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M9.5 4.5V3a1.5 1.5 0 00-1.5-1.5H3A1.5 1.5 0 001.5 3v5A1.5 1.5 0 003 9.5h1.5" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              <span>복사</span>
            </>
          )}
        </button>
      </Flex>
      <pre className="p-4 text-xs leading-relaxed overflow-x-auto bg-gray-950 text-gray-100">
        <code>{code}</code>
      </pre>
    </Box>
  );
}

/* ═══════════════════════ Variant Grid ═══════════════════════ */

export function VariantGrid({ children, cols = 2 }: { children: ReactNode; cols?: number }) {
  return (
    <Box
      display="grid"
      gap={4}
      cols={{ base: 1, md: cols }}
    >
      {children}
    </Box>
  );
}

export function VariantItem({
  label,
  description,
  children,
  sourceCode,
}: {
  label: string;
  description?: string;
  children: ReactNode;
  /** 이 변형의 코드 스니펫. 넘기면 라벨 옆에 "복사" 버튼이 표시됩니다. */
  sourceCode?: string;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    if (!sourceCode) return;
    try {
      await navigator.clipboard.writeText(sourceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };
  return (
    <Box radius="xl" border overflow="hidden">
      <Flex align="center" justify="center" p={5} minH="100px" bg="card">
        {children}
      </Flex>
      <Flex align="start" justify="between" gap={2} px={4} py={2.5} className="bg-gray-50/70 border-t border-border">
        <Box className="flex-1 min-w-0">
          <Text as="p" fontSize="xs" fontWeight="semibold" color="foreground">{label}</Text>
          {description && <Text fontSize="2xs" dimmed mt={0.5}>{description}</Text>}
        </Box>
        {sourceCode && (
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "코드가 복사되었습니다" : "이 변형의 코드 복사"}
            className={cn(
              "shrink-0 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors cursor-pointer border",
              copied
                ? "bg-success/10 text-success border-success/20"
                : "bg-white text-muted border-border hover:text-primary hover:border-primary/30",
            )}
          >
            {copied ? (
              <>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>복사됨</span>
              </>
            ) : (
              <>
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M9.5 4.5V3a1.5 1.5 0 00-1.5-1.5H3A1.5 1.5 0 001.5 3v5A1.5 1.5 0 003 9.5h1.5" stroke="currentColor" strokeWidth="1.3" />
                </svg>
                <span>코드</span>
              </>
            )}
          </button>
        )}
      </Flex>
    </Box>
  );
}

/* ═══════════════════════ Decision Matrix ═══════════════════════ */

export interface DecisionMatrixRow {
  /** 컴포넌트 이름 */
  name: string;
  /** 상세 페이지 경로 */
  href?: string;
  /** 언제 쓰면 좋은지 (한 줄) */
  useWhen: string;
  /** 언제 피해야 하는지 (한 줄) */
  avoidWhen?: string;
  /** 핵심 차이점 한 단어 키워드 */
  signature?: string;
}

export function DecisionMatrix({
  title = "비슷한 컴포넌트, 어떤 걸 골라야 할까?",
  description,
  rows,
}: {
  title?: string;
  description?: string;
  rows: DecisionMatrixRow[];
}) {
  return (
    <Box radius="xl" border overflow="hidden">
      <Box px={4} py={3} className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border">
        <Heading level={5} mb={description ? 0.5 : 0}>{title}</Heading>
        {description && <Text fontSize="xs" dimmed mb={0} lineHeight="relaxed">{description}</Text>}
      </Box>
      <Box className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-gray-50/50">
              <th className="text-left px-4 py-2.5 font-semibold text-muted uppercase tracking-wider text-[10px]">컴포넌트</th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted uppercase tracking-wider text-[10px]">언제 쓰는가</th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted uppercase tracking-wider text-[10px]">피해야 할 때</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.name} className={cn("border-b border-border last:border-0", i % 2 === 1 ? "bg-gray-50/30" : "bg-white")}>
                <td className="px-4 py-3 align-top">
                  {row.href ? (
                    <a href={row.href} className="font-mono text-[12px] font-semibold text-primary hover:underline">
                      {row.name}
                    </a>
                  ) : (
                    <span className="font-mono text-[12px] font-semibold text-foreground">{row.name}</span>
                  )}
                  {row.signature && (
                    <Box mt={1}>
                      <Box as="span" className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                        {row.signature}
                      </Box>
                    </Box>
                  )}
                </td>
                <td className="px-4 py-3 align-top text-foreground leading-relaxed">{row.useWhen}</td>
                <td className="px-4 py-3 align-top text-muted leading-relaxed">{row.avoidWhen || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
}
