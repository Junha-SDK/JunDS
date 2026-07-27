/**
 * 네이티브 위임 폼 계약(03 §1.6-1) — light DOM의 최대 실리를 실브라우저로 검증:
 * 내부 <input name>의 폼 참여, 라벨 연결, submit 버튼, disabled 시맨틱.
 */
import { expect, test } from "@playwright/test";
import { mount } from "./helpers.js";

test("jd-text-field: 내부 input이 조상 <form>에 그냥 참여한다 (FormData)", async ({
  page,
}) => {
  await mount(
    page,
    `<form id="f"><jd-text-field name="email" label="이메일"></jd-text-field></form>`,
  );
  await page.locator("jd-text-field input").fill("a@b.c");
  const value = await page.evaluate(() =>
    new FormData(document.querySelector("form")!).get("email"),
  );
  expect(value).toBe("a@b.c");
});

test("jd-text-field: 라벨 클릭이 input에 포커스를 준다 (id 연결)", async ({
  page,
}) => {
  await mount(page, `<jd-text-field label="이름"></jd-text-field>`);
  await page.locator("jd-text-field label").click();
  await expect(page.locator("jd-text-field input")).toBeFocused();
});

test("jd-text-field error: aria-invalid + aria-describedby가 보이는 메시지를 가리킨다", async ({
  page,
}) => {
  await mount(
    page,
    `<jd-text-field label="이름" error="필수 입력"></jd-text-field>`,
  );
  const input = page.locator("jd-text-field input");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  const described = await input.evaluate((el) => {
    const id = el.getAttribute("aria-describedby");
    return id ? document.getElementById(id)?.textContent : null;
  });
  expect(described).toBe("필수 입력");
});

test("jd-text-field: start/end 슬롯과 메시지 없는 invalid 상태가 실 CSS에 반영된다", async ({
  page,
}) => {
  await mount(
    page,
    `<jd-text-field invalid>
       <span slot="start">₩</span>
       <button slot="end" type="button" aria-label="지우기">×</button>
     </jd-text-field>`,
  );
  await expect(page.locator(".jd-text-field__slot--start")).toContainText("₩");
  await expect(page.getByRole("button", { name: "지우기" })).toBeVisible();
  await expect(page.locator("jd-text-field input")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.locator(".jd-text-field__error")).toBeHidden();

  const padding = await page
    .locator("jd-text-field input")
    .evaluate((input) =>
      Number.parseFloat(getComputedStyle(input).paddingInlineStart),
    );
  expect(padding).toBeGreaterThanOrEqual(40);
});

test("jd-button type=submit이 폼을 제출한다 — disabled/loading은 클릭 불가", async ({
  page,
}) => {
  await mount(
    page,
    `<form id="f"><jd-text-field name="q"></jd-text-field>
       <jd-button id="go" type="submit">전송</jd-button></form>`,
  );
  const submitted = page.evaluate(
    () =>
      new Promise((r) =>
        document.querySelector("#f")!.addEventListener(
          "submit",
          (e) => {
            e.preventDefault();
            r(true);
          },
          { once: true },
        ),
      ),
  );
  await page.locator("#go button").click();
  expect(await submitted).toBe(true);

  // disabled — 네이티브 click 미발행이 공짜(§10 주해 3)
  await page.evaluate(() => {
    const b = document.querySelector("#go") as HTMLElement & {
      disabled: boolean;
    };
    b.disabled = true;
  });
  await expect(page.locator("#go button")).toBeDisabled();

  // loading — aria-busy + disabled 동시
  await page.evaluate(() => {
    const b = document.querySelector("#go") as HTMLElement & {
      disabled: boolean;
      loading: boolean;
    };
    b.disabled = false;
    b.loading = true;
  });
  await expect(page.locator("#go button")).toBeDisabled();
  await expect(page.locator("#go button")).toHaveAttribute("aria-busy", "true");
});

test("jd-input 실시간 입력 이벤트 — detail.value 정규화 (§1.5)", async ({
  page,
}) => {
  await mount(page, `<jd-text-field label="이름"></jd-text-field>`);
  const seen = page.evaluate(
    () =>
      new Promise((r) =>
        document
          .querySelector("jd-text-field")!
          .addEventListener(
            "jd-input",
            (e) => r((e as CustomEvent<{ value: string }>).detail.value),
            { once: true },
          ),
      ),
  );
  await page.locator("jd-text-field input").pressSequentially("한");
  expect(await seen).toBe("한");
});
