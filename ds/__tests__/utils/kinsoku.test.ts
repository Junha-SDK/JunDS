import { describe, it, expect } from "vitest";
import {
  applyKinsoku,
  applyKinsokuToHtml,
  stripKinsoku,
  WORD_JOINER as WJ,
} from "../../utils/kinsoku";

describe("applyKinsoku", () => {
  it("binds a closing punctuation mark to the character before it", () => {
    expect(applyKinsoku("끝났다.")).toBe(`끝났다${WJ}.`);
    expect(applyKinsoku("괜찮아?")).toBe(`괜찮아${WJ}?`);
    expect(applyKinsoku("(안쪽)")).toBe(`(안쪽${WJ})`);
  });

  it("leaves punctuation that already starts a line alone", () => {
    // 앞이 공백이면 어차피 줄바꿈 지점이라 묶을 대상이 없다
    expect(applyKinsoku("가 .")).toBe("가 .");
  });

  it("is idempotent", () => {
    const once = applyKinsoku("문장이다.");
    expect(applyKinsoku(once)).toBe(once);
  });

  it("round-trips through stripKinsoku", () => {
    const original = "그는 말했다. 정말?";
    expect(stripKinsoku(applyKinsoku(original))).toBe(original);
  });
});

describe("applyKinsokuToHtml", () => {
  it("processes text but not tags", () => {
    const out = applyKinsokuToHtml("<p>끝났다.</p>");
    expect(out).toBe(`<p>끝났다${WJ}.</p>`);
  });

  it("does not corrupt URLs inside attributes", () => {
    const html = '<a href="https://example.com/a.html">링크다.</a>';
    const out = applyKinsokuToHtml(html);
    expect(out).toContain('href="https://example.com/a.html"');
    expect(out).toContain(`링크다${WJ}.`);
  });

  it("leaves code contents untouched so copied code still runs", () => {
    const html = "<code>a.b()</code><p>설명이다.</p>";
    const out = applyKinsokuToHtml(html);
    expect(out).toContain("<code>a.b()</code>");
    expect(out).toContain(`설명이다${WJ}.`);
  });
});
