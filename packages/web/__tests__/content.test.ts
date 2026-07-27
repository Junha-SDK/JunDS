import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, test } from "vitest";
import {
  contentText,
  isUnsafeHtml,
  setContent,
  unsafeHtml,
} from "../src/core/content.js";

describe("소비자 콘텐츠 경계", () => {
  beforeEach(() => {
    document.body.textContent = "";
  });

  test("마크업처럼 보이는 일반 문자열도 평문으로 렌더한다", () => {
    const target = document.createElement("div");
    const input = '<img src=x onerror="globalThis.pwned=true"><strong>안전</strong>';

    setContent(target, input);

    expect(target.textContent).toBe(input);
    expect(target.querySelector("img")).toBeNull();
    expect(target.querySelector("strong")).toBeNull();
  });

  test("DOM 노드는 복제하지 않고 그대로 배치한다", () => {
    const target = document.createElement("div");
    const button = document.createElement("button");
    button.textContent = "저장";

    setContent(target, button);

    expect(target.firstChild).toBe(button);
  });

  test("unsafeHtml로 표시한 값만 HTML로 파싱한다", () => {
    const target = document.createElement("div");
    const markup = unsafeHtml("<strong>강조</strong>");

    expect(isUnsafeHtml(markup)).toBe(true);
    setContent(target, markup);

    expect(target.querySelector("strong")?.textContent).toBe("강조");
    expect(contentText(markup)).toBe("강조");
  });

  test("빈 값은 이전 콘텐츠를 완전히 지운다", () => {
    const target = document.createElement("div");
    target.innerHTML = "<span>old</span>";

    setContent(target, null);

    expect(target.childNodes).toHaveLength(0);
  });

  test("컴포넌트가 문자열 모양을 보고 HTML로 자동 승격하지 않는다", () => {
    /* cwd 는 실행 위치(레포 루트 / 패키지)에 따라 달라져 루트에서 돌리면 ENOENT 로
       죽었다(실측). import.meta.url 은 vitest 변환 후 file: 스킴이 아닐 수 있어 쓸 수
       없다. 그래서 cwd 에서 위로 올라가며 소스 트리를 찾는다 — 두 실행 위치 모두 통과. */
    const root = [
      "src/components",
      "packages/web/src/components",
    ]
      .map((rel) => resolve(process.cwd(), rel))
      .find((p) => existsSync(p));
    if (!root) throw new Error("src/components 를 찾지 못했다");
    const violations: string[] = [];
    const publicSink =
      /innerHTML\s*=\s*(?:(?:item|tab|it|n)\.(?:icon|content|question|answer)|custom\b|out\b)/;

    for (const entry of readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const file = `${root}/${entry.name}/element.ts`;
      const source = readFileSync(file, "utf8");
      if (
        source.includes('.trimStart().startsWith("<")') ||
        publicSink.test(source)
      ) {
        violations.push(entry.name);
      }
    }

    expect(violations).toEqual([]);
  });
});
