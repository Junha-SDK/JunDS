/**
 * B7 인프라·소셜 — 실브라우저에서만 증명되는 계약.
 * 실키보드 Tab 감금, 조상 CE 재부모화(disconnect→connect) 생존, CSS만으로 도는
 * 팔로우 호버 라벨 교체 — happy-dom으로는 어느 것도 재현되지 않는다.
 */
import { expect, test } from "@playwright/test";
import { mount, pressTab } from "./helpers.js";

test("jd-focus-guard: 실제 Tab이 영역 밖으로 나가지 못한다", async ({
  page,
  browserName,
}) => {
  await mount(
    page,
    `<button id="out">밖</button>
     <jd-focus-guard id="g" active>
       <button id="a">A</button><button id="b">B</button><button id="c">C</button>
     </jd-focus-guard>`,
  );
  await expect(page.locator("#a")).toBeFocused(); // active면 첫 요소로 진입

  for (let i = 0; i < 6; i++) {
    await pressTab(page, browserName);
    const inside = await page.evaluate(() =>
      document.querySelector("#g")!.contains(document.activeElement),
    );
    expect(inside).toBe(true);
  }
  // Shift+Tab 역방향도 감금
  await pressTab(page, browserName, true);
  expect(
    await page.evaluate(() => document.querySelector("#g")!.contains(document.activeElement)),
  ).toBe(true);
});

test("jd-focus-guard: 기본(비활성)은 포커스를 강탈하지 않는다", async ({
  page,
  browserName,
}) => {
  await mount(
    page,
    `<button id="out">밖</button>
     <jd-focus-guard><button id="a">A</button></jd-focus-guard>
     <button id="after">다음</button>`,
  );
  await page.locator("#out").focus();
  await expect(page.locator("#out")).toBeFocused();
  await pressTab(page, browserName);
  await expect(page.locator("#a")).toBeFocused(); // 그냥 통과
  await pressTab(page, browserName);
  await expect(page.locator("#after")).toBeFocused(); // 감금 없이 다음 컨트롤로 나간다
});

test("jd-focus-guard: 조상이 재부모화해도 감금이 살아남는다", async ({
  page,
  browserName,
}) => {
  await mount(
    page,
    `<div id="box1"><jd-focus-guard id="g" active>
       <button id="a">A</button><button id="b">B</button>
     </jd-focus-guard></div><div id="box2"></div>`,
  );
  // own()한 Behavior는 disconnect에서 destroy된다 — 재연결에서 다시 만들지 않으면 죽는다
  await page.evaluate(() =>
    document.querySelector("#box2")!.append(document.querySelector("#g")!),
  );
  await page.locator("#b").focus();
  await pressTab(page, browserName);
  expect(await page.evaluate(() => document.activeElement?.id)).toBe("a"); // 순환 유지
});

test("jd-portal: 대상으로 실제 이동하고 재부모화 후에도 다시 나간다", async ({ page }) => {
  await mount(
    page,
    `<div id="t"></div><div id="box1"><jd-portal to="#t"><span id="x">내용</span></jd-portal></div>
     <div id="box2"></div>`,
  );
  expect(await page.evaluate(() => document.querySelector("#x")!.parentElement!.id)).toBe("t");

  await page.evaluate(() =>
    document.querySelector("#box2")!.append(document.querySelector("jd-portal")!),
  );
  expect(await page.evaluate(() => document.querySelector("#x")!.parentElement!.id)).toBe("t");

  // 호스트 제거 시 고아 노드를 남기지 않는다 — 떼어낸 호스트 안으로 회수된다
  // (문서에서 사라지므로 document.querySelector로는 찾을 수 없는 것이 정상)
  const recalled = await page.evaluate(() => {
    const portal = document.querySelector("jd-portal")!;
    portal.remove();
    return { inDocument: !!document.querySelector("#x"), inHost: !!portal.querySelector("#x") };
  });
  expect(recalled).toEqual({ inDocument: false, inHost: true });
});

test("jd-visually-hidden: 화면에서 안 보이지만 접근성 트리에 남는다", async ({ page }) => {
  await mount(page, `<p>정렬 <jd-visually-hidden>(오름차순)</jd-visually-hidden>기준</p>`);
  const box = await page.locator("jd-visually-hidden").evaluate((el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    // position:absolute는 display를 블록화한다 — 중요한 건 none이 아니라는 것
    return { w: Math.round(r.width), h: Math.round(r.height), hidden: cs.display === "none" };
  });
  expect(box).toEqual({ w: 1, h: 1, hidden: false });
  // 텍스트는 남아 AT가 읽는다
  await expect(page.locator("jd-visually-hidden")).toHaveText("(오름차순)");
});

test("jd-error-boundary: auto가 자손 이미지 로드 실패를 잡아 폴백으로 바꾼다", async ({ page }) => {
  await mount(
    page,
    `<jd-error-boundary auto><jd-image src="/nope.png" alt="x" style="width:60px"></jd-image>
       <p id="body">본문</p></jd-error-boundary>`,
  );
  const eb = page.locator("jd-error-boundary");
  await expect(eb).toHaveAttribute("failed", "");
  await expect(page.locator(".jd-error-boundary__fallback")).toBeVisible();
  await expect(page.locator("#body")).toBeHidden(); // 본문은 은닉(삭제 아님)

  await page.locator(".jd-error-boundary__retry").click();
  await expect(eb).not.toHaveAttribute("failed", "");
  await expect(page.locator("#body")).toBeVisible(); // 노드를 지우지 않았으므로 복원된다
});

test("jd-follow-button: 팔로잉 호버가 언팔로우 라벨로 바뀐다 (CSS만)", async ({ page }) => {
  await mount(page, `<jd-follow-button following></jd-follow-button>`);
  const shown = () =>
    page.locator("jd-follow-button").evaluate((el) =>
      [...el.querySelectorAll("span")]
        .filter((s) => getComputedStyle(s).display !== "none")
        .map((s) => s.textContent),
    );
  expect(await shown()).toEqual(["팔로잉"]);
  await page.locator("jd-follow-button button").hover();
  expect(await shown()).toEqual(["언팔로우"]);
  // 접근 이름은 호버로 흔들리지 않는다
  await expect(page.locator("jd-follow-button button")).toHaveAttribute("aria-label", "팔로잉");
});

test("jd-like-button: 클릭이 aria-pressed와 카운트를 함께 바꾼다", async ({ page }) => {
  await mount(page, `<jd-like-button count="41"></jd-like-button>`);
  const btn = page.locator("jd-like-button button");
  await expect(btn).toHaveAttribute("aria-pressed", "false");
  await btn.click();
  await expect(btn).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".jd-like-button__count")).toHaveText("42");
  // 색 전이가 끝난 뒤 확인 — 즉시 읽으면 중간값이 잡힌다
  await expect
    .poll(() => btn.evaluate((el) => getComputedStyle(el).color))
    .toBe("rgb(244, 63, 94)"); // v2 rose-500
});
