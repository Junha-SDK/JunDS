#!/usr/bin/env node
/**
 * @junds/mcp — JunDS v3 MCP 서버 (08-mcp 스펙 구현).
 *
 * 소비자 조회 5종(전부 읽기 전용): search_components / get_component / get_usage /
 * get_tokens / get_status. 쓰기 도구는 없다 — v2 기여자 도구(scaffold 등)는
 * mcp/server.mjs(동결)가 담당(DEC-016-1).
 *
 * stdio JSON-RPC. 단독 디버그: node packages/mcp/src/server.mjs
 */
import { pathToFileURL } from "node:url";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { loadData, TOKEN_GROUPS } from "./data.mjs";
import { searchComponents } from "./tools/search-components.mjs";
import { getComponent } from "./tools/get-component.mjs";
import { getUsage } from "./tools/get-usage.mjs";
import { getTokens } from "./tools/get-tokens.mjs";
import { getStatus } from "./tools/get-status.mjs";

export const VERSION = "3.0.0-alpha.0";

// ─── 입력 스키마 ───────────────────────────────────────────────────────────

const CATEGORY = z.enum([
  "core",
  "layout",
  "primitives",
  "hooks",
  "composites",
  "patterns",
  "finance",
]);
const LEDGER_PLATFORM = z.enum(["web", "ios"]);
const NORM_STATUS = z.enum(["done", "wip", "todo"]);
const SNIPPET_PLATFORM = z.enum(["web", "swiftui", "uikit", "react"]);
const TOKEN_GROUP = z.enum(TOKEN_GROUPS);
const ID = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[A-Za-z0-9][A-Za-z0-9 _-]*$/, "component id (PascalCase or kebab-case)");
const QUERY = z.string().min(1).max(200);

// ─── 서버 ──────────────────────────────────────────────────────────────────

/**
 * @param {() => Promise<object>} loadDataFn 테스트 주입용 — 기본은 §3.3 우선순위 로더.
 */
export function createServer(loadDataFn = loadData) {
  const server = new McpServer({ name: "junds", version: VERSION });

  const wrap =
    (fn) =>
    async (input = {}) => {
      let payload;
      try {
        payload = fn(await loadDataFn(), input);
      } catch (err) {
        payload = { ok: false, error: String(err?.message ?? err) };
      }
      const result = {
        content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      };
      if (payload.ok === false) result.isError = true;
      return result;
    };

  server.registerTool(
    "search_components",
    {
      title: "search_components",
      description:
        "Search JunDS components across the 445-row migration ledger and docs-content " +
        "(ids, tags, descriptions, implementation notes). Returns per-platform migration " +
        "status (web/ios) for each hit — v3 is mid-migration, so availability IS part of " +
        "the answer. Without `query`, lists by filters (category browsing). `platform` " +
        'alone means "usable now on that platform" (status done); combine with `status` ' +
        "to ask e.g. platform:ios status:todo.",
      inputSchema: {
        query: QUERY.optional().describe(
          'Free-form terms, AND-matched (e.g. "button", "text input", "모달").',
        ),
        category: CATEGORY.optional().describe(
          "Ledger category filter (hooks = v2 hooks migrating to Behaviors).",
        ),
        platform: LEDGER_PLATFORM.optional().describe(
          'Platform filter. Alone = status "done" on it; with `status` = that status.',
        ),
        status: NORM_STATUS.optional().describe(
          "Normalized migration status filter (done / wip / todo).",
        ),
      },
    },
    wrap(searchComponents),
  );

  server.registerTool(
    "get_component",
    {
      title: "get_component",
      description:
        "Full detail for one component: ledger migration status per platform " +
        "(web/ios/docs/tests/bench), implementation notes, CE tag, description, " +
        "attribute table, a11y notes, authored snippet platforms, and gzip size. " +
        "Id matching is case-insensitive and folds kebab↔Pascal (otp-input ≡ OTPInput). " +
        "Unknown ids return suggestions.",
      inputSchema: {
        id: ID.describe('Ledger id, e.g. "Button", "Input", "otp-input".'),
      },
    },
    wrap(getComponent),
  );

  server.registerTool(
    "get_usage",
    {
      title: "get_usage",
      description:
        "Usage snippet ({imp, code}) for one component on one platform (web vanilla CE / " +
        "swiftui / uikit / react). When the platform is not yet migrated or authored, " +
        "returns a structured { available: false, status, alternatives } answer instead of " +
        "an error — report that status honestly rather than inventing an API.",
      inputSchema: {
        id: ID.describe('Ledger id, e.g. "Button".'),
        platform: SNIPPET_PLATFORM.describe(
          "web = vanilla Custom Element; swiftui / uikit = iOS; react = v3 adapter (pending).",
        ),
      },
    },
    wrap(getUsage),
  );

  server.registerTool(
    "get_tokens",
    {
      title: "get_tokens",
      description:
        "JunDS design tokens from the single-source tokens/*.json. Each entry: " +
        "{ group, path, cssVar (--jd-*), value (or {light,dark}), swift (JdToken.*) }. " +
        "No args = group list with counts only. `name` matches css var name, token path, " +
        "or Swift accessor (exact first, then substring).",
      inputSchema: {
        group: TOKEN_GROUP.optional().describe(
          "Token group (theme-presets is data-only: cssVar/swift are null).",
        ),
        name: QUERY.optional().describe(
          'e.g. "--jd-color-primary", "color.primary", "JdToken.Space.s4", "primary".',
        ),
      },
    },
    wrap(getTokens),
  );

  server.registerTool(
    "get_status",
    {
      title: "get_status",
      description:
        "v3 migration dashboard aggregated from the ledger: totals and per-category " +
        "done/wip/todo/na tallies for web and ios. Same source as the docs screen " +
        "badges, so numbers always agree.",
      inputSchema: {
        category: CATEGORY.optional().describe("Restrict to one ledger category."),
      },
    },
    wrap(getStatus),
  );

  return server;
}

// ─── main ──────────────────────────────────────────────────────────────────

const isMain = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isMain) {
  const server = createServer();
  const transport = new StdioServerTransport();
  server.connect(transport).catch((err) => {
    // stdout은 JSON-RPC 스트림 — 오염 금지, stderr로만 (v2 계승).
    process.stderr.write(`junds-mcp fatal: ${err?.stack ?? err}\n`);
    process.exit(1);
  });
}
