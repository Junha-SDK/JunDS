/**
 * <jd-show> / <jd-hide> — CSS 전용 브레이크포인트 표시 전환 (JS 상태 없음).
 * happy-dom은 미디어 평가를 못 하므로 규칙 텍스트와 반영 표면을 검증한다
 * (실브라우저 표시 전환은 데모 puppeteer 검증 몫).
 */
import { beforeEach, expect, test } from "vitest";
import { squish } from "./css-text.js";
import "../src/components/show/index.js";
import { JdHide, JdShow } from "../src/components/show/element.js";
import showStyles from "../src/components/show/show.css.js";

const tick = () => new Promise<void>((r) => queueMicrotask(() => queueMicrotask(r)));

beforeEach(() => {
  document.body.innerHTML = "";
});

test("display:contents 기본 — 레이아웃 무개입 (v2 래퍼 없는 렌더 등가)", () => {
  expect(squish(showStyles.text)).toContain(squish("jd-show, jd-hide { display: contents; }"));
});

test("above/below 규칙이 v2 BREAKPOINTS 전 구간을 커버", () => {
  // show[above=md]: 768 미만 숨김 / show[below=md]: 768 이상 숨김
  expect(squish(showStyles.text)).toContain(
    squish('@media (max-width: 767.98px) { jd-show[above="md"] { display: none; } }'),
  );
  expect(squish(showStyles.text)).toContain(
    squish('@media (min-width: 768px) { jd-show[below="md"] { display: none; } }'),
  );
  // hide는 역방향
  expect(squish(showStyles.text)).toContain(
    squish('@media (min-width: 768px) { jd-hide[above="md"] { display: none; } }'),
  );
  expect(squish(showStyles.text)).toContain(
    squish('@media (max-width: 767.98px) { jd-hide[below="md"] { display: none; } }'),
  );
  for (const bp of ["sm", "md", "lg", "xl", "2xl"]) {
    expect(squish(showStyles.text)).toContain(`jd-show[above="${bp}"]`);
    expect(squish(showStyles.text)).toContain(`jd-show[below="${bp}"]`);
    expect(squish(showStyles.text)).toContain(`jd-hide[above="${bp}"]`);
    expect(squish(showStyles.text)).toContain(`jd-hide[below="${bp}"]`);
  }
});

test("above/below 프로퍼티 ↔ attribute 반영 (CSS 훅)", async () => {
  document.body.innerHTML = `<jd-show above="md"><span>x</span></jd-show>`;
  await tick();
  const el = document.querySelector<JdShow>("jd-show")!;
  expect(el.above).toBe("md");
  el.below = "xl";
  await tick();
  expect(el.getAttribute("below")).toBe("xl");
});

test("children을 건드리지 않는다 — 골격 없음", async () => {
  document.body.innerHTML = `<jd-hide above="lg"><nav id="m">모바일 메뉴</nav></jd-hide>`;
  await tick();
  const el = document.querySelector<JdHide>("jd-hide")!;
  expect(el.childElementCount).toBe(1);
  expect(el.firstElementChild!.id).toBe("m");
});
