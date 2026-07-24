/**
 * B5 특수 입력 10종 — 네이티브 위임·이벤트·a11y 표면과 배치 중 내린 판단의 회귀 고정.
 */
import { beforeEach, describe, expect, test, vi } from "vitest";
import "../src/components/number-input/index.js";
import "../src/components/password-input/index.js";
import "../src/components/pin-input/index.js";
import "../src/components/otp-input/index.js";
import "../src/components/currency-input/index.js";
import "../src/components/phone-input/index.js";
import "../src/components/file-upload/index.js";
import "../src/components/copy-button/index.js";
import "../src/components/star-rating/index.js";
import "../src/components/back-top/index.js";
import type { JdNumberInput } from "../src/components/number-input/element.js";
import type { JdPasswordInput } from "../src/components/password-input/element.js";
import type { JdPinInput } from "../src/components/pin-input/element.js";
import type { JdOtpInput } from "../src/components/otp-input/element.js";
import type { JdCurrencyInput } from "../src/components/currency-input/element.js";
import type { JdPhoneInput } from "../src/components/phone-input/element.js";
import type { JdFileUpload } from "../src/components/file-upload/element.js";
import type { JdCopyButton } from "../src/components/copy-button/element.js";
import type { JdStarRating } from "../src/components/star-rating/element.js";
import type { JdBackTop } from "../src/components/back-top/element.js";

const tick = () => new Promise<void>((r) => queueMicrotask(() => queueMicrotask(r)));

/** 사용자 입력 시뮬레이션 — 값 대입 후 네이티브 input 이벤트 */
function type(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("jd-number-input", () => {
  test("골격: 감소 버튼 + input[type=number] + 증가 버튼, 버튼은 탭 순서 밖", async () => {
    document.body.innerHTML = `<jd-number-input value="3"></jd-number-input>`;
    await tick();
    const el = document.querySelector<JdNumberInput>("jd-number-input")!;
    const input = el.querySelector<HTMLInputElement>("input.jd-number-input__input")!;
    expect(input.type).toBe("number");
    expect(input.value).toBe("3");
    const btns = el.querySelectorAll<HTMLButtonElement>("button.jd-number-input__step");
    expect(btns).toHaveLength(2);
    expect(btns[0]!.getAttribute("aria-label")).toBe("감소");
    expect(btns[1]!.getAttribute("aria-label")).toBe("증가");
    expect(btns[0]!.tabIndex).toBe(-1);
  });

  test("스텝 버튼은 step만큼 이동하고 min/max에서 클램프 + 버튼 비활성", async () => {
    document.body.innerHTML = `<jd-number-input value="8" min="0" max="10" step="5"></jd-number-input>`;
    await tick();
    const el = document.querySelector<JdNumberInput>("jd-number-input")!;
    const [dec, inc] = Array.from(el.querySelectorAll<HTMLButtonElement>("button"));
    inc!.click();
    await tick();
    expect(el.value).toBe(10); // 8+5=13 → 클램프
    expect(inc!.disabled).toBe(true);
    dec!.click();
    dec!.click();
    await tick();
    expect(el.value).toBe(0);
    expect(dec!.disabled).toBe(true);
  });

  test("min/max 미지정(NaN)이면 제한 없음 — attribute도 붙지 않는다", async () => {
    document.body.innerHTML = `<jd-number-input></jd-number-input>`;
    await tick();
    const el = document.querySelector<JdNumberInput>("jd-number-input")!;
    const input = el.querySelector<HTMLInputElement>("input")!;
    expect(Number.isNaN(el.value)).toBe(true);
    expect(input.value).toBe(""); // NaN = 비어 있음
    expect(input.hasAttribute("min")).toBe(false);
    expect(input.hasAttribute("max")).toBe(false);
    el.querySelectorAll<HTMLButtonElement>("button")[0]!.click();
    await tick();
    expect(el.value).toBe(-1); // 빈 값의 기준은 0
  });

  test("입력 중(jd-input)은 클램프하지 않고 확정(change)에서만 클램프", async () => {
    document.body.innerHTML = `<jd-number-input min="10"></jd-number-input>`;
    await tick();
    const el = document.querySelector<JdNumberInput>("jd-number-input")!;
    const input = el.querySelector<HTMLInputElement>("input")!;
    const onInput = vi.fn();
    const onChange = vi.fn();
    el.addEventListener("jd-input", onInput);
    el.addEventListener("jd-change", onChange);

    type(input, "5"); // min=10 미만이지만 타이핑 중이므로 유지 — "50"을 칠 수 있어야 한다
    await tick();
    expect(el.value).toBe(5);
    expect(input.value).toBe("5");
    expect(onInput).toHaveBeenCalledOnce();

    input.dispatchEvent(new Event("change", { bubbles: true }));
    await tick();
    expect(el.value).toBe(10); // 확정 시점에 클램프
    expect(onChange.mock.calls[0]![0].detail).toEqual({ value: 10 });
  });

  test('소수점 입력 중 "1."이 되쓰기로 잘리지 않는다', async () => {
    document.body.innerHTML = `<jd-number-input></jd-number-input>`;
    await tick();
    const el = document.querySelector<JdNumberInput>("jd-number-input")!;
    const input = el.querySelector<HTMLInputElement>("input")!;
    type(input, "1.");
    await tick();
    expect(input.value).toBe("1.");
  });

  test("hide-controls는 버튼을 감춘다", async () => {
    document.body.innerHTML = `<jd-number-input hide-controls></jd-number-input>`;
    await tick();
    const el = document.querySelector<JdNumberInput>("jd-number-input")!;
    for (const b of el.querySelectorAll<HTMLButtonElement>("button")) expect(b.hidden).toBe(true);
  });
});

describe("jd-pin-input", () => {
  test("length만큼 칸 생성 + 자릿수 aria-label + role=group", async () => {
    document.body.innerHTML = `<jd-pin-input length="4"></jd-pin-input>`;
    await tick();
    const el = document.querySelector<JdPinInput>("jd-pin-input")!;
    const cells = el.querySelectorAll<HTMLInputElement>("input.jd-pin-input__cell");
    expect(cells).toHaveLength(4);
    expect(el.getAttribute("role")).toBe("group");
    expect(cells[0]!.getAttribute("aria-label")).toBe("1번째 자리");
    expect(cells[0]!.maxLength).toBe(1);
    expect(cells[0]!.autocomplete).toBe("one-time-code");
    expect(cells[0]!.inputMode).toBe("numeric");
  });

  test("입력하면 다음 칸으로 전진하고 전 칸이 차면 jd-complete", async () => {
    document.body.innerHTML = `<jd-pin-input length="3"></jd-pin-input>`;
    await tick();
    const el = document.querySelector<JdPinInput>("jd-pin-input")!;
    const cells = Array.from(el.querySelectorAll<HTMLInputElement>("input"));
    const done = vi.fn();
    const input = vi.fn();
    el.addEventListener("jd-complete", done);
    el.addEventListener("jd-input", input);

    type(cells[0]!, "1");
    expect(document.activeElement).toBe(cells[1]);
    type(cells[1]!, "2");
    expect(done).not.toHaveBeenCalled();
    type(cells[2]!, "3");
    await tick();
    expect(el.value).toBe("123");
    expect(done).toHaveBeenCalledOnce();
    expect(done.mock.calls[0]![0].detail).toEqual({ value: "123" });
    expect(input).toHaveBeenCalledTimes(3);
  });

  test("숫자 전용이 기본 — 비숫자는 폐기, alphanumeric이면 허용", async () => {
    document.body.innerHTML = `<jd-pin-input length="2"></jd-pin-input>
      <jd-pin-input length="2" alphanumeric></jd-pin-input>`;
    await tick();
    const [numeric, alpha] = Array.from(document.querySelectorAll<JdPinInput>("jd-pin-input"));
    const nCell = numeric!.querySelector<HTMLInputElement>("input")!;
    type(nCell, "a");
    expect(nCell.value).toBe("");
    const aCell = alpha!.querySelector<HTMLInputElement>("input")!;
    type(aCell, "a");
    expect(aCell.value).toBe("a");
    expect(aCell.inputMode).toBe("text");
  });

  test("Backspace는 지우고, 빈 칸이면 이전 칸으로 후퇴하며 지운다", async () => {
    document.body.innerHTML = `<jd-pin-input length="3" value="12"></jd-pin-input>`;
    await tick();
    const el = document.querySelector<JdPinInput>("jd-pin-input")!;
    const cells = Array.from(el.querySelectorAll<HTMLInputElement>("input"));
    const bs = () => new KeyboardEvent("keydown", { key: "Backspace", bubbles: true });

    cells[1]!.dispatchEvent(bs());
    await tick();
    expect(el.value).toBe("1");

    cells[1]!.dispatchEvent(bs()); // 이미 비었으므로 앞칸으로
    await tick();
    expect(document.activeElement).toBe(cells[0]);
    expect(el.value).toBe("");
  });

  test("붙여넣기: 숫자 모드는 구분자를 걷어내고 채운다(v2는 전량 거부)", async () => {
    document.body.innerHTML = `<jd-pin-input length="6"></jd-pin-input>`;
    await tick();
    const el = document.querySelector<JdPinInput>("jd-pin-input")!;
    const cells = Array.from(el.querySelectorAll<HTMLInputElement>("input"));
    const e = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(e, "clipboardData", { value: { getData: () => "123-456" } });
    cells[0]!.dispatchEvent(e);
    await tick();
    expect(el.value).toBe("123456");
    expect(e.defaultPrevented).toBe(true);
  });

  test("masked는 password 타입 · length 변경은 칸을 재구축", async () => {
    document.body.innerHTML = `<jd-pin-input length="2" masked></jd-pin-input>`;
    await tick();
    const el = document.querySelector<JdPinInput>("jd-pin-input")!;
    expect(el.querySelector<HTMLInputElement>("input")!.type).toBe("password");
    el.length = 5;
    await tick();
    expect(el.querySelectorAll("input")).toHaveLength(5);
  });
});

describe("jd-otp-input", () => {
  test("PinInput 파생: 중앙 구분자 + 숫자 고정(alphanumeric 무시)", async () => {
    document.body.innerHTML = `<jd-otp-input alphanumeric></jd-otp-input>`;
    await tick();
    const el = document.querySelector<JdOtpInput>("jd-otp-input")!;
    expect(el.querySelectorAll("input.jd-otp-input__cell")).toHaveLength(6);
    expect(el.querySelectorAll(".jd-otp-input__separator")).toHaveLength(1);
    // 구분자는 3번째 칸 앞 — 앞선 형제 input이 3개
    const sep = el.querySelector(".jd-otp-input__separator")!;
    const before = Array.from(el.children).indexOf(sep);
    expect(before).toBe(3);

    const cell = el.querySelector<HTMLInputElement>("input")!;
    type(cell, "a"); // alphanumeric이 있어도 숫자 전용
    expect(cell.value).toBe("");
    expect(el.getAttribute("aria-label")).toBe("인증 코드 입력");
  });
});

describe("jd-password-input", () => {
  test("표시 토글이 type을 뒤집고 aria-label을 갱신", async () => {
    document.body.innerHTML = `<jd-password-input></jd-password-input>`;
    await tick();
    const el = document.querySelector<JdPasswordInput>("jd-password-input")!;
    const input = el.querySelector<HTMLInputElement>("input")!;
    const toggle = el.querySelector<HTMLButtonElement>(".jd-password-input__toggle")!;
    expect(input.type).toBe("password");
    expect(input.autocomplete).toBe("new-password");
    expect(toggle.getAttribute("aria-label")).toBe("비밀번호 보기");
    toggle.click();
    await tick();
    expect(input.type).toBe("text");
    expect(toggle.getAttribute("aria-label")).toBe("비밀번호 숨기기");
  });

  test("강도 산식(v2 이식) — 통과 규칙 + 길이 보너스", async () => {
    document.body.innerHTML = `<jd-password-input show-strength></jd-password-input>`;
    await tick();
    const el = document.querySelector<JdPasswordInput>("jd-password-input")!;
    expect(el.strength.level).toBe("none");

    const input = el.querySelector<HTMLInputElement>("input")!;
    type(input, "abc"); // 소문자 1/5 + 보너스 → weak
    await tick();
    expect(el.strength.level).toBe("weak");
    expect(el.querySelector<HTMLElement>(".jd-password-input__strength")!.hidden).toBe(false);

    type(input, "Abcdef1!"); // 5/5 + 보너스 → strong
    await tick();
    expect(el.strength.passed).toBe(5);
    expect(el.strength.level).toBe("strong");
    expect(el.querySelector(".jd-password-input__level")!.textContent).toBe("강력");
    expect(el.querySelectorAll(".jd-password-input__bar[data-on]")).toHaveLength(4);
  });

  test("규칙 체크리스트는 값이 있을 때만 · 통과 항목만 data-passed", async () => {
    document.body.innerHTML = `<jd-password-input show-rules></jd-password-input>`;
    await tick();
    const el = document.querySelector<JdPasswordInput>("jd-password-input")!;
    const list = el.querySelector<HTMLElement>(".jd-password-input__rules")!;
    expect(list.hidden).toBe(true);
    type(el.querySelector<HTMLInputElement>("input")!, "abcdefgh"); // 길이·소문자만
    await tick();
    expect(list.hidden).toBe(false);
    expect(list.children).toHaveLength(5);
    expect(list.querySelectorAll("[data-passed]")).toHaveLength(2);
  });

  test("JSON 슬롯 규칙 — pattern/minLength 선언으로 기본 규칙 대체", async () => {
    document.body.innerHTML = `<jd-password-input show-rules><script type="application/json">[
      {"label":"4자 이상","minLength":4},{"label":"숫자","pattern":"[0-9]"}
    ]</script></jd-password-input>`;
    await tick();
    const el = document.querySelector<JdPasswordInput>("jd-password-input")!;
    expect(el.rules).toHaveLength(2);
    expect(el.querySelector("script")).toBeNull(); // 소비 후 제거
    type(el.querySelector<HTMLInputElement>("input")!, "abcd");
    await tick();
    const list = el.querySelector<HTMLElement>(".jd-password-input__rules")!;
    expect(list.children).toHaveLength(2);
    expect(list.querySelectorAll("[data-passed]")).toHaveLength(1);
  });
});

describe("jd-currency-input", () => {
  test("포커스 밖이면 통화 표기, 포커스 중이면 원시값", async () => {
    document.body.innerHTML = `<jd-currency-input value="1500"></jd-currency-input>`;
    await tick();
    const el = document.querySelector<JdCurrencyInput>("jd-currency-input")!;
    const input = el.querySelector<HTMLInputElement>("input")!;
    expect(input.value).toContain("1,500"); // ₩1,500 (ICU 표기)
    expect(input.type).toBe("text");
    expect(input.inputMode).toBe("numeric");

    input.dispatchEvent(new Event("focus"));
    await tick();
    expect(input.value).toBe("1500");

    input.dispatchEvent(new Event("blur"));
    await tick();
    expect(input.value).toContain("1,500");
  });

  test("소수 자릿수는 Intl 통화 기본값 — KRW/JPY 0자리, USD 2자리", async () => {
    document.body.innerHTML = `
      <jd-currency-input value="12.5" currency="USD" locale="en-US"></jd-currency-input>
      <jd-currency-input value="800" currency="JPY" locale="en-US"></jd-currency-input>`;
    await tick();
    const [usd, jpy] = Array.from(document.querySelectorAll<JdCurrencyInput>("jd-currency-input"));
    expect(usd!.querySelector<HTMLInputElement>("input")!.value).toBe("$12.50");
    // v2는 KRW 외 전부 2자리 강제라 ￥800.00이었다 — 0자리 통화를 Intl이 바로잡는다
    expect(jpy!.querySelector<HTMLInputElement>("input")!.value).toBe("¥800");
  });

  test("비우면 NaN(빈 값)을 유지한다 — v2는 0을 강제했다", async () => {
    document.body.innerHTML = `<jd-currency-input value="100"></jd-currency-input>`;
    await tick();
    const el = document.querySelector<JdCurrencyInput>("jd-currency-input")!;
    const input = el.querySelector<HTMLInputElement>("input")!;
    input.dispatchEvent(new Event("focus"));
    type(input, "");
    await tick();
    expect(Number.isNaN(el.value)).toBe(true);
    input.dispatchEvent(new Event("blur"));
    await tick();
    expect(input.value).toBe("");
  });
});

describe("jd-phone-input", () => {
  test("네이티브 select 5국가 + 라벨, 번호는 숫자만 보관하고 표시만 포맷", async () => {
    document.body.innerHTML = `<jd-phone-input></jd-phone-input>`;
    await tick();
    const el = document.querySelector<JdPhoneInput>("jd-phone-input")!;
    const select = el.querySelector<HTMLSelectElement>("select")!;
    expect(select.options).toHaveLength(5);
    expect(select.value).toBe("KR");
    expect(select.getAttribute("aria-label")).toBe("국가 선택");

    const input = el.querySelector<HTMLInputElement>("input")!;
    expect(input.type).toBe("tel");
    type(input, "01012345678");
    await tick();
    expect(el.value).toBe("01012345678"); // 값은 숫자만
    expect(input.value).toBe("010-1234-5678"); // 표시는 하이픈
    expect(el.fullNumber).toBe("+8201012345678");
  });

  test("국가 변경은 jd-change를 발행하고 country를 반영", async () => {
    document.body.innerHTML = `<jd-phone-input value="1234"></jd-phone-input>`;
    await tick();
    const el = document.querySelector<JdPhoneInput>("jd-phone-input")!;
    const spy = vi.fn();
    el.addEventListener("jd-change", spy);
    const select = el.querySelector<HTMLSelectElement>("select")!;
    select.value = "US";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await tick();
    expect(el.country).toBe("US");
    expect(el.getAttribute("country")).toBe("US");
    expect(spy.mock.calls[0]![0].detail.fullNumber).toBe("+11234");
  });

  test("11자리 초과 입력은 잘린다", async () => {
    document.body.innerHTML = `<jd-phone-input></jd-phone-input>`;
    await tick();
    const el = document.querySelector<JdPhoneInput>("jd-phone-input")!;
    type(el.querySelector<HTMLInputElement>("input")!, "0101234567890");
    await tick();
    expect(el.value).toHaveLength(11);
  });
});

describe("jd-file-upload", () => {
  const file = (name: string, size: number): File => {
    const f = new File(["x"], name);
    Object.defineProperty(f, "size", { value: size });
    return f;
  };
  const drop = (zone: Element, files: File[]): Event => {
    const e = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(e, "dataTransfer", { value: { files } });
    zone.dispatchEvent(e);
    return e;
  };

  test("드롭존 골격: role=button · 탭 가능 · 숨은 파일 input", async () => {
    document.body.innerHTML = `<jd-file-upload accept="image/*" multiple></jd-file-upload>`;
    await tick();
    const el = document.querySelector<JdFileUpload>("jd-file-upload")!;
    const zone = el.querySelector<HTMLElement>(".jd-file-upload__zone")!;
    expect(zone.getAttribute("role")).toBe("button");
    expect(zone.tabIndex).toBe(0);
    expect(zone.getAttribute("aria-label")).toBe("파일을 드래그하거나 클릭하여 업로드");
    const input = el.querySelector<HTMLInputElement>("input[type=file]")!;
    expect(input.multiple).toBe(true);
    expect(input.accept).toBe("image/*");
    expect(input.tabIndex).toBe(-1);
  });

  test("드롭한 파일은 jd-change로 통지되고 files에 남는다", async () => {
    document.body.innerHTML = `<jd-file-upload></jd-file-upload>`;
    await tick();
    const el = document.querySelector<JdFileUpload>("jd-file-upload")!;
    const spy = vi.fn();
    el.addEventListener("jd-change", spy);
    const e = drop(el.querySelector(".jd-file-upload__zone")!, [file("a.png", 10)]);
    await tick();
    expect(e.defaultPrevented).toBe(true);
    expect(spy).toHaveBeenCalledOnce();
    expect(el.files).toHaveLength(1);
  });

  test("max-size 초과는 jd-error + 메시지 표시, jd-change 없음", async () => {
    document.body.innerHTML = `<jd-file-upload max-size="1048576"></jd-file-upload>`;
    await tick();
    const el = document.querySelector<JdFileUpload>("jd-file-upload")!;
    const ok = vi.fn();
    const bad = vi.fn();
    el.addEventListener("jd-change", ok);
    el.addEventListener("jd-error", bad);
    drop(el.querySelector(".jd-file-upload__zone")!, [file("big.zip", 2 * 1024 * 1024)]);
    await tick();
    expect(ok).not.toHaveBeenCalled();
    expect(bad.mock.calls[0]![0].detail.reason).toBe("max-size");
    expect(el.error).toBe("파일 크기가 1MB를 초과합니다");
    expect(el.querySelector<HTMLElement>(".jd-file-upload__error")!.hidden).toBe(false);
  });

  test("children이 있으면 트리거 모드 — 드롭존 대신 그 children이 피커를 연다", async () => {
    document.body.innerHTML = `<jd-file-upload><button id="t">업로드</button></jd-file-upload>`;
    await tick();
    const el = document.querySelector<JdFileUpload>("jd-file-upload")!;
    expect(el.querySelector(".jd-file-upload__zone")).toBeNull();
    const trigger = el.querySelector<HTMLElement>(".jd-file-upload__trigger")!;
    expect(trigger.querySelector("#t")).not.toBeNull();
    const input = el.querySelector<HTMLInputElement>("input[type=file]")!;
    const clicked = vi.fn();
    input.addEventListener("click", clicked);
    trigger.click();
    expect(clicked).toHaveBeenCalledOnce();
  });

  test("Enter/Space는 피커를 열고 기본 스크롤을 막는다", async () => {
    document.body.innerHTML = `<jd-file-upload></jd-file-upload>`;
    await tick();
    const el = document.querySelector<JdFileUpload>("jd-file-upload")!;
    const input = el.querySelector<HTMLInputElement>("input[type=file]")!;
    const clicked = vi.fn();
    input.addEventListener("click", clicked);
    const e = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });
    el.querySelector(".jd-file-upload__zone")!.dispatchEvent(e);
    expect(clicked).toHaveBeenCalledOnce();
    expect(e.defaultPrevented).toBe(true);
  });
});

describe("jd-copy-button", () => {
  test("복사 성공 시 jd-copy + copied 상태(2초 후 해제)", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    document.body.innerHTML = `<jd-copy-button text="안녕"></jd-copy-button>`;
    await vi.advanceTimersByTimeAsync(0);
    const el = document.querySelector<JdCopyButton>("jd-copy-button")!;
    const spy = vi.fn();
    el.addEventListener("jd-copy", spy);

    await el.copy();
    await vi.advanceTimersByTimeAsync(0);
    expect(writeText).toHaveBeenCalledWith("안녕");
    expect(el.copied).toBe(true);
    expect(el.hasAttribute("copied")).toBe(true);
    expect(spy.mock.calls[0]![0].detail).toEqual({ text: "안녕" });
    expect(el.querySelector("button")!.getAttribute("aria-label")).toBe("복사됨!");

    await vi.advanceTimersByTimeAsync(2000);
    expect(el.copied).toBe(false);
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test("클립보드 거부는 jd-error로 흡수 — unhandled rejection이 없다", async () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    document.body.innerHTML = `<jd-copy-button text="x"></jd-copy-button>`;
    await tick();
    const el = document.querySelector<JdCopyButton>("jd-copy-button")!;
    const spy = vi.fn();
    el.addEventListener("jd-error", spy);
    await expect(el.copy()).resolves.toBe(false);
    expect(el.copied).toBe(false);
    expect(spy).toHaveBeenCalledOnce();
    vi.unstubAllGlobals();
  });

  test("icon 변형은 라벨을 감추되 접근 이름은 유지 · button 변형은 노출", async () => {
    document.body.innerHTML = `<jd-copy-button text="a"></jd-copy-button>
      <jd-copy-button text="b" variant="button" label="코드 복사"></jd-copy-button>`;
    await tick();
    const [icon, button] = Array.from(document.querySelectorAll<JdCopyButton>("jd-copy-button"));
    const iconLabel = icon!.querySelector<HTMLElement>(".jd-copy-button__label")!;
    expect(iconLabel.hidden).toBe(true);
    expect(icon!.querySelector("button")!.getAttribute("aria-label")).toBe("복사");
    expect(icon!.querySelector("button")!.title).toBe("복사");
    const btnLabel = button!.querySelector<HTMLElement>(".jd-copy-button__label")!;
    expect(btnLabel.hidden).toBe(false);
    expect(btnLabel.textContent).toBe("코드 복사");
  });
});

describe("jd-star-rating", () => {
  test("네이티브 radio max개 · 단일 선택 · role=radiogroup", async () => {
    document.body.innerHTML = `<jd-star-rating value="3"></jd-star-rating>`;
    await tick();
    const el = document.querySelector<JdStarRating>("jd-star-rating")!;
    expect(el.getAttribute("role")).toBe("radiogroup");
    const radios = Array.from(el.querySelectorAll<HTMLInputElement>("input[type=radio]"));
    expect(radios).toHaveLength(5);
    expect(radios[0]!.getAttribute("aria-label")).toBe("1점");
    // v2는 value 이하 전부를 aria-checked=true로 노출했다 — 네이티브는 하나만
    expect(radios.filter((r) => r.checked)).toHaveLength(1);
    expect(radios[2]!.checked).toBe(true);
    // 채움 표시는 3개
    expect(el.querySelectorAll("[data-filled]")).toHaveLength(3);
    // 같은 name = 단일 탭스톱 + 화살표 순회(네이티브)
    expect(new Set(radios.map((r) => r.name)).size).toBe(1);
  });

  test("선택은 jd-change를 발행", async () => {
    document.body.innerHTML = `<jd-star-rating></jd-star-rating>`;
    await tick();
    const el = document.querySelector<JdStarRating>("jd-star-rating")!;
    const spy = vi.fn();
    el.addEventListener("jd-change", spy);
    const radios = Array.from(el.querySelectorAll<HTMLInputElement>("input"));
    radios[3]!.checked = true;
    radios[3]!.dispatchEvent(new Event("change", { bubbles: true }));
    await tick();
    expect(el.value).toBe(4);
    expect(spy.mock.calls[0]![0].detail).toEqual({ value: 4 });
    expect(el.querySelectorAll("[data-filled]")).toHaveLength(4);
  });

  test("소수 값은 내림 표시하고 어떤 radio도 checked가 아니다", async () => {
    document.body.innerHTML = `<jd-star-rating value="4.5" readonly></jd-star-rating>`;
    await tick();
    const el = document.querySelector<JdStarRating>("jd-star-rating")!;
    expect(el.querySelectorAll("[data-filled]")).toHaveLength(4);
    const radios = Array.from(el.querySelectorAll<HTMLInputElement>("input"));
    expect(radios.some((r) => r.checked)).toBe(false);
    expect(radios.every((r) => r.disabled)).toBe(true); // readonly = 조작 불가
    expect(el.getAttribute("aria-readonly")).toBe("true");
  });

  test("max 변경은 별을 재구축", async () => {
    document.body.innerHTML = `<jd-star-rating max="3"></jd-star-rating>`;
    await tick();
    const el = document.querySelector<JdStarRating>("jd-star-rating")!;
    expect(el.querySelectorAll("input")).toHaveLength(3);
    el.max = 10;
    await tick();
    expect(el.querySelectorAll("input")).toHaveLength(10);
  });
});

describe("jd-back-top", () => {
  test("초기 골격은 항상 숨김 — render에서 scrollY를 읽지 않는다(§3.1-3)", async () => {
    document.body.innerHTML = `<jd-back-top></jd-back-top>`;
    const el = document.querySelector<JdBackTop>("jd-back-top")!;
    expect(el.hasAttribute("visible")).toBe(false);
    await tick();
    expect(el.querySelector("button.jd-back-top__button")).not.toBeNull();
    expect(el.querySelector("button")!.getAttribute("aria-label")).toBe("상단으로 이동");
  });

  test("임계 초과 스크롤에서 visible, 되돌아오면 해제", async () => {
    document.body.innerHTML = `<jd-back-top threshold="100"></jd-back-top>`;
    await tick();
    const el = document.querySelector<JdBackTop>("jd-back-top")!;
    Object.defineProperty(window, "scrollY", { value: 500, configurable: true });
    window.dispatchEvent(new Event("scroll"));
    await tick();
    expect(el.visible).toBe(true);
    expect(el.hasAttribute("visible")).toBe(true);

    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    window.dispatchEvent(new Event("scroll"));
    await tick();
    expect(el.hasAttribute("visible")).toBe(false);
  });

  test("클릭은 최상단으로 스크롤하고 jd-select를 발행", async () => {
    document.body.innerHTML = `<jd-back-top></jd-back-top>`;
    await tick();
    const el = document.querySelector<JdBackTop>("jd-back-top")!;
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);
    const spy = vi.fn();
    el.addEventListener("jd-select", spy);
    el.querySelector<HTMLButtonElement>("button")!.click();
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
    expect(spy).toHaveBeenCalledOnce();
    vi.unstubAllGlobals();
  });

  test("children이 있으면 기본 아이콘 대신 그것을 넣는다", async () => {
    document.body.innerHTML = `<jd-back-top><span id="up">TOP</span></jd-back-top>`;
    await tick();
    const el = document.querySelector<JdBackTop>("jd-back-top")!;
    const btn = el.querySelector("button")!;
    expect(btn.querySelector("#up")).not.toBeNull();
    expect(btn.querySelector("svg")).toBeNull();
  });
});
