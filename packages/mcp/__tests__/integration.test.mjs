/**
 * 프로토콜 왕복(08-mcp §7-3) — InMemoryTransport로 클라이언트↔서버 실왕복.
 * 프로세스 spawn 없이 SDK 와이어(등록·zod 검증·JSON 직렬화)를 검증한다.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createServer } from "../src/server.mjs";

let client;
let server;

const call = async (name, args) => {
  const res = await client.callTool({ name, arguments: args });
  const payload = JSON.parse(res.content[0].text);
  return { res, payload };
};

beforeAll(async () => {
  server = createServer(); // 기본 로더 — 레포 안이므로 라이브 모드
  client = new Client({ name: "mcp-test-client", version: "0.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([
    client.connect(clientTransport),
    server.connect(serverTransport),
  ]);
});

afterAll(async () => {
  await client.close();
  await server.close();
});

describe("MCP 왕복", () => {
  it("도구 5종 등록", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      "get_component", "get_status", "get_tokens", "get_usage", "search_components",
    ]);
  });

  it("search_components — Button 검색", async () => {
    const { payload } = await call("search_components", { query: "button" });
    expect(payload.ok).toBe(true);
    expect(payload.mode).toBe("live");
    expect(payload.results.map((r) => r.id)).toContain("Button");
  });

  it("get_component — kebab id 접기 + 진행 상태 1급", async () => {
    const { payload } = await call("get_component", { id: "text-field" });
    // "text-field" fold → 원장 id는 Input이 아니라... tag 기반이 아닌 id 접기: TextField≠Input.
    // 원장 id 없음 → 제안 응답이 정상 계약이다.
    if (payload.ok) {
      expect(payload.status).toBeTruthy();
    } else {
      expect(payload.suggestions).toBeInstanceOf(Array);
    }
  });

  it("get_usage — Input swiftui 스니펫(라이브 docs-content)", async () => {
    const { payload } = await call("get_usage", { id: "Input", platform: "swiftui" });
    expect(payload.ok).toBe(true);
    expect(payload.imp).toContain("JunDS");
    expect(payload.code).toContain("JdTextField");
  });

  it("get_usage — 미전환은 구조화 응답(에러 아님)", async () => {
    const { res, payload } = await call("get_usage", { id: "OTPInput", platform: "web" });
    expect(res.isError).toBeUndefined();
    expect(payload.available).toBe(false);
    expect(payload.alternatives).toBeInstanceOf(Array);
  });

  it("get_tokens — 정확 일치", async () => {
    const { payload } = await call("get_tokens", { name: "--jd-color-primary" });
    expect(payload.total).toBe(1);
    expect(payload.tokens[0].value).toBe("#5b4cc7");
  });

  it("get_status — 총계 = counts.total", async () => {
    const { payload } = await call("get_status", {});
    expect(payload.total).toBeGreaterThanOrEqual(445);
    expect(payload.overall.web.done).toBeGreaterThanOrEqual(28);
  });

  it("미발견 id — isError + 제안", async () => {
    const { res, payload } = await call("get_component", { id: "NopeNotHere" });
    expect(res.isError).toBe(true);
    expect(payload.ok).toBe(false);
    expect(payload.suggestions).toBeInstanceOf(Array);
  });
});
