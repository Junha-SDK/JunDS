/** 도구 5종 단위 — 픽스처 주입(08-mcp §7-1): 매칭·랭킹·절단·미발견 제안·미전환 구조화. */
import { describe, expect, it } from "vitest";

import { searchComponents } from "../src/tools/search-components.mjs";
import { getComponent } from "../src/tools/get-component.mjs";
import { getUsage } from "../src/tools/get-usage.mjs";
import { getTokens } from "../src/tools/get-tokens.mjs";
import { getStatus } from "../src/tools/get-status.mjs";
import { fold, normStatus } from "../src/tools/common.mjs";
import { makeFixture } from "./fixtures.mjs";

const data = makeFixture();

describe("common", () => {
  it("fold — kebab↔Pascal 접기", () => {
    expect(fold("otp-input")).toBe(fold("OTPInput"));
    expect(fold("text-field")).toBe(fold("TextField"));
  });
  it("normStatus — 자유 서술 변형 흡수", () => {
    expect(normStatus("done(내부화)")).toBe("done");
    expect(normStatus("pass(1.2ms)")).toBe("done");
    expect(normStatus("n/a")).toBe("na");
    expect(normStatus("wip — 진행")).toBe("wip");
    expect(normStatus("todo")).toBe("todo");
    expect(normStatus("???")).toBe("other");
  });
});

describe("search_components", () => {
  it("query 랭킹 — id 정확일치 최상", () => {
    const r = searchComponents(data, { query: "button" });
    expect(r.ok).toBe(true);
    expect(r.results[0].id).toBe("Button");
    expect(r.results[0].web).toBe("done"); // 원문 상태 그대로
  });
  it("태그 매칭 — 한국어 태그", () => {
    const r = searchComponents(data, { query: "버튼" });
    expect(r.results.map((x) => x.id)).toContain("Button");
  });
  it("다중 텀 AND — 한 텀이라도 실패하면 제외", () => {
    const r = searchComponents(data, { query: "button 존재하지않는텀" });
    expect(r.total).toBe(0);
  });
  it("category 필터", () => {
    const r = searchComponents(data, { category: "hooks" });
    expect(r.results.map((x) => x.id)).toEqual(["useToast"]);
  });
  it("platform 단독 = 그 플랫폼 done — done(내부화)도 포함", () => {
    const r = searchComponents(data, { platform: "web" });
    const ids = r.results.map((x) => x.id);
    expect(ids).toContain("CoreProvider");
    expect(ids).not.toContain("OTPInput");
  });
  it("platform+status 조합", () => {
    const r = searchComponents(data, { platform: "ios", status: "todo" });
    expect(r.results.map((x) => x.id)).toEqual(["OTPInput"]);
  });
  it("절단 명시 — 50 초과는 truncated:true", () => {
    const big = makeFixture();
    big.ledger.rows = Array.from({ length: 60 }, (_, i) => ({
      id: `Comp${i}`, category: "composites", tier: "T2",
      web: "todo", ios: "todo", docs: "todo", tests: "todo", bench: "todo", notes: "",
    }));
    const r = searchComponents(big, {});
    expect(r.total).toBe(60);
    expect(r.results).toHaveLength(50);
    expect(r.truncated).toBe(true);
  });
});

describe("get_component", () => {
  it("fold 매칭 + 사이즈는 tag(kebab) 키로", () => {
    const r = getComponent(data, { id: "input" });
    expect(r.ok).toBe(true);
    expect(r.id).toBe("Input");
    expect(r.tag).toBe("jd-text-field");
    expect(r.gzipBytes).toBe(1851); // size-baseline "text-field" — id "Input"과 다름
    expect(r.status.ios).toBe("done");
    expect(r.desc).toBe("텍스트 입력"); // oneLiner → desc
  });
  it("controls·tokensUsed·a11y 노출", () => {
    const r = getComponent(data, { id: "Button" });
    expect(r.controls.map((c) => c.prop)).toContain("variant");
    expect(r.tokensUsed[0].token).toBe("--jd-color-primary");
    expect(r.a11y[0].item).toBe("네이티브 위임");
    expect(r.snippetPlatforms).toEqual(["web", "swiftui"]); // 비-null만
  });
  it("kebab id 접기 — otp-input ≡ OTPInput", () => {
    const r = getComponent(data, { id: "otp-input" });
    expect(r.ok).toBe(true);
    expect(r.id).toBe("OTPInput");
    expect(r.snippetPlatforms).toEqual([]); // 콘텐츠 미저작
  });
  it("미발견 — 접두 겹침 제안", () => {
    const r = getComponent(data, { id: "Buttn" });
    expect(r.ok).toBe(false);
    expect(r.suggestions).toContain("Button");
  });
});

describe("get_usage", () => {
  it("저작된 스니펫 반환", () => {
    const r = getUsage(data, { id: "Button", platform: "swiftui" });
    expect(r.ok).toBe(true);
    expect(r.imp).toBe("import JunDS");
    expect(r.code).toContain("JdButton");
  });
  it("web 템플릿 토큰 — controls 기본값 치환(06 §2.3)", () => {
    const r = getUsage(data, { id: "Button", platform: "web" });
    expect(r.code).toContain('variant="primary"');
    expect(r.code).toContain('size="md"');
    expect(r.code).not.toContain("{variant}");
  });
  it("구현 done + 스니펫 미저작(null) — 저작 필요 안내", () => {
    const r = getUsage(data, { id: "Input", platform: "swiftui" });
    expect(r.ok).toBe(true); // 에러가 아니다(08-mcp §4.3)
    expect(r.available).toBe(false);
    expect(r.status).toBe("done");
    expect(r.note).toContain("docs-content");
    expect(r.alternatives).toEqual(["web"]);
  });
  it("미전환 플랫폼 — 상태·대안 구조화", () => {
    const r = getUsage(data, { id: "OTPInput", platform: "web" });
    expect(r.available).toBe(false);
    expect(r.status).toBe("todo");
  });
  it("react 미저작 — v2 전환기 안내", () => {
    const r = getUsage(data, { id: "Button", platform: "react" });
    expect(r.available).toBe(false);
    expect(r.status).toBe("planned");
    expect(r.note).toContain("@junds/ui");
  });
});

describe("get_tokens", () => {
  it("무인자 — 그룹 요약만(전체 덤프 방지)", () => {
    const r = getTokens(data, {});
    expect(r.tokens).toBeUndefined();
    expect(r.groups).toContainEqual({ group: "color", count: 2 });
  });
  it("cssVar 정확 일치", () => {
    const r = getTokens(data, { name: "--jd-color-primary" });
    expect(r.total).toBe(1);
    expect(r.tokens[0].value).toBe("#5b4cc7");
    expect(r.tokens[0].swift).toBe("JdToken.Color.primary");
  });
  it("부분 일치 완화 + 모드 쌍 값 보존", () => {
    const r = getTokens(data, { name: "background" });
    expect(r.tokens[0].value).toEqual({ light: "#f5f4f8", dark: "#0c0a14" });
  });
  it("group 필터 + theme-presets는 cssVar/swift null", () => {
    const r = getTokens(data, { group: "theme-presets" });
    expect(r.tokens[0].cssVar).toBeNull();
    expect(r.tokens[0].swift).toBeNull();
  });
});

describe("get_status", () => {
  it("전체 집계 — 상태 변형 정규화", () => {
    const r = getStatus(data, {});
    expect(r.total).toBe(5);
    expect(r.overall.web).toEqual({ done: 3, wip: 1, todo: 1, na: 0, other: 0 });
    expect(r.overall.ios).toEqual({ done: 2, wip: 0, todo: 1, na: 2, other: 0 });
  });
  it("category 필터", () => {
    const r = getStatus(data, { category: "primitives" });
    expect(r.total).toBe(2);
    expect(Object.keys(r.byCategory)).toEqual(["primitives"]);
  });
});
