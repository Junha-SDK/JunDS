/**
 * B13 오버레이·피드백 12종 — Modal 파생축(공용 닫기·감금 계약 상속)과 피드백 표면.
 */
import { beforeEach, describe, expect, test, vi } from "vitest";
import "../src/components/modal/index.js";
import "../src/components/drawer/index.js";
import "../src/components/bottom-sheet/index.js";
import "../src/components/action-sheet/index.js";
import "../src/components/alert-dialog/index.js";
import "../src/components/alert/index.js";
import "../src/components/banner/index.js";
import "../src/components/callout/index.js";
import "../src/components/empty-state/index.js";
import "../src/components/result/index.js";
import "../src/components/notification/index.js";
import "../src/components/snackbar/index.js";
import "../src/components/toast/index.js";
import { toast } from "../src/components/toast/element.js";
import type { JdDrawer } from "../src/components/drawer/element.js";
import type { JdBottomSheet } from "../src/components/bottom-sheet/element.js";
import type { JdActionSheet } from "../src/components/action-sheet/element.js";
import type { JdAlertDialog } from "../src/components/alert-dialog/element.js";
import type { JdAlert } from "../src/components/alert/element.js";
import type { JdSnackbar } from "../src/components/snackbar/element.js";
import type { JdToast } from "../src/components/toast/element.js";

const tick = () => new Promise<void>((r) => queueMicrotask(() => queueMicrotask(r)));

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("Modal 파생축 — 공용 계약 상속", () => {
  test("jd-drawer: 패널 골격을 물려받고 ESC가 요청형 닫기를 낸다", async () => {
    document.body.innerHTML = `<jd-drawer open title="설정"><p id="c">내용</p></jd-drawer>`;
    await tick();
    const el = document.querySelector<JdDrawer>("jd-drawer")!;
    const panel = el.querySelector(".jd-modal__panel")!;
    expect(panel).not.toBeNull();
    expect(panel.querySelector("#c")).not.toBeNull(); // children이 패널로 이동
    expect(el.querySelector(".jd-drawer__title")!.textContent).toBe("설정");
    expect(panel.getAttribute("aria-label")).toBe("설정");
    expect(panel.getAttribute("aria-modal")).toBe("true");

    const req = vi.fn();
    el.addEventListener("jd-request-close", req);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await tick();
    expect(req).toHaveBeenCalledOnce();
    expect(el.open).toBe(false);
  });

  test("jd-drawer: 닫기 버튼 + jd-request-close 취소 시 열린 채 유지", async () => {
    document.body.innerHTML = `<jd-drawer open title="t"></jd-drawer>`;
    await tick();
    const el = document.querySelector<JdDrawer>("jd-drawer")!;
    el.addEventListener("jd-request-close", (e) => e.preventDefault());
    el.querySelector<HTMLButtonElement>(".jd-drawer__close")!.click();
    await tick();
    expect(el.open).toBe(true); // 소비자가 막았다
  });

  test("jd-bottom-sheet: 그래버 + 제목, draggable일 때만 끌기 대상", async () => {
    document.body.innerHTML = `<jd-bottom-sheet open title="공유" draggable></jd-bottom-sheet>`;
    await tick();
    const el = document.querySelector<JdBottomSheet>("jd-bottom-sheet")!;
    expect(el.querySelector(".jd-bottom-sheet__grabber")).not.toBeNull();
    expect(el.querySelector(".jd-bottom-sheet__title")!.textContent).toBe("공유");
    expect(el.hasAttribute("draggable")).toBe(true);
  });

  test("jd-action-sheet: JSON 슬롯 액션 + 선택 시 jd-select 후 닫힘", async () => {
    document.body.innerHTML = `<jd-action-sheet open title="선택"><script type="application/json">[
      {"label":"공유","value":"share"},{"label":"삭제","value":"delete","danger":true},
      {"label":"비활성","disabled":true}
    ]</script></jd-action-sheet>`;
    await tick();
    const el = document.querySelector<JdActionSheet>("jd-action-sheet")!;
    const items = el.querySelectorAll<HTMLButtonElement>(".jd-action-sheet__item");
    expect(items).toHaveLength(3);
    expect(items[1]!.hasAttribute("data-danger")).toBe(true);
    expect(items[2]!.disabled).toBe(true);
    expect(el.querySelector("script")).toBeNull(); // 소비 후 제거

    const sel = vi.fn();
    el.addEventListener("jd-select", sel);
    items[0]!.click();
    await tick();
    expect(sel.mock.calls[0]![0].detail).toEqual({ value: "share", label: "공유" });
    expect(el.open).toBe(false);
  });

  test("jd-alert-dialog: role=alertdialog + 라벨 연결 + 확인/취소 이벤트", async () => {
    document.body.innerHTML = `<jd-alert-dialog open title="삭제할까요?" description="되돌릴 수 없습니다" danger></jd-alert-dialog>`;
    await tick();
    const el = document.querySelector<JdAlertDialog>("jd-alert-dialog")!;
    const panel = el.querySelector(".jd-modal__panel")!;
    expect(panel.getAttribute("role")).toBe("alertdialog");
    const titleId = panel.getAttribute("aria-labelledby")!;
    expect(document.getElementById(titleId)!.textContent).toBe("삭제할까요?");
    const descId = panel.getAttribute("aria-describedby")!;
    expect(document.getElementById(descId)!.textContent).toBe("되돌릴 수 없습니다");

    const confirm = vi.fn();
    const dismiss = vi.fn();
    el.addEventListener("jd-confirm", confirm);
    el.addEventListener("jd-dismiss", dismiss);
    el.querySelector<HTMLButtonElement>(".jd-alert-dialog__confirm")!.click();
    await tick();
    expect(confirm).toHaveBeenCalledOnce();
    expect(el.open).toBe(false);

    el.open = true;
    await tick();
    el.querySelector<HTMLButtonElement>(".jd-alert-dialog__cancel")!.click();
    await tick();
    expect(dismiss).toHaveBeenCalledOnce();
    expect(el.open).toBe(false);
  });

  test("jd-alert-dialog: no-cancel이면 취소 버튼을 감춘다", async () => {
    document.body.innerHTML = `<jd-alert-dialog open title="알림" no-cancel></jd-alert-dialog>`;
    await tick();
    const el = document.querySelector<JdAlertDialog>("jd-alert-dialog")!;
    expect(el.querySelector<HTMLElement>(".jd-alert-dialog__cancel")!.hidden).toBe(true);
  });
});

describe("피드백 표면", () => {
  test("jd-alert: variant별 role 구분 — 정보성은 status, 위험은 alert", async () => {
    document.body.innerHTML = `<jd-alert title="안내">본문</jd-alert>
      <jd-alert variant="danger">위험</jd-alert>`;
    await tick();
    const [info, danger] = Array.from(document.querySelectorAll<JdAlert>("jd-alert"));
    expect(info!.getAttribute("role")).toBe("status");
    expect(danger!.getAttribute("role")).toBe("alert");
    expect(info!.querySelector(".jd-alert__title")!.textContent).toBe("안내");
    expect(info!.querySelector(".jd-alert__content")!.textContent).toBe("본문");
    expect(info!.querySelector(".jd-alert__icon svg")).not.toBeNull(); // 기본 아이콘
  });

  test("jd-alert: dismissible 닫기는 노드를 지우지 않고 감춘다", async () => {
    document.body.innerHTML = `<jd-alert dismissible>x</jd-alert>`;
    await tick();
    const el = document.querySelector<JdAlert>("jd-alert")!;
    const spy = vi.fn();
    el.addEventListener("jd-dismiss", spy);
    el.querySelector<HTMLButtonElement>(".jd-alert__close")!.click();
    expect(el.hidden).toBe(true);
    expect(el.isConnected).toBe(true); // 되살릴 수 있다
    expect(spy).toHaveBeenCalledOnce();
  });

  test("jd-alert: slot=icon이 있으면 기본 아이콘 대신 쓴다", async () => {
    document.body.innerHTML = `<jd-alert><span slot="icon" id="ci">!</span>본문</jd-alert>`;
    await tick();
    const el = document.querySelector<JdAlert>("jd-alert")!;
    expect(el.querySelector(".jd-alert__icon #ci")).not.toBeNull();
    expect(el.querySelector(".jd-alert__icon svg")).toBeNull();
  });

  test("jd-banner: role=status (v2 role=banner는 랜드마크 오용)", async () => {
    document.body.innerHTML = `<jd-banner variant="warning">점검 예정</jd-banner>`;
    await tick();
    const el = document.querySelector("jd-banner")!;
    expect(el.getAttribute("role")).toBe("status");
    expect(el.querySelector(".jd-banner__content")!.textContent).toBe("점검 예정");
    el.querySelector<HTMLButtonElement>(".jd-banner__close")!.click();
    expect((el as HTMLElement).hidden).toBe(true);
  });

  test("jd-callout: collapsible은 네이티브 details로 — 상태가 AT에 전달된다", async () => {
    document.body.innerHTML = `<jd-callout variant="tip" title="힌트">본문</jd-callout>
      <jd-callout collapsible open title="접기">본문2</jd-callout>`;
    await tick();
    const [plain, coll] = Array.from(document.querySelectorAll("jd-callout"));
    expect(plain!.querySelector("details")).toBeNull();
    expect(plain!.querySelector(".jd-callout__icon")!.textContent).toBe("\u{1F4A1}");
    const details = coll!.querySelector("details")!;
    expect(details.open).toBe(true);
    expect(details.querySelector("summary")).not.toBeNull();
  });

  test("jd-empty-state / jd-result: 골격 공유 + status별 아이콘", async () => {
    document.body.innerHTML = `<jd-empty-state title="없음" description="설명"></jd-empty-state>
      <jd-result status="success" title="완료"></jd-result>`;
    await tick();
    const empty = document.querySelector("jd-empty-state")!;
    expect(empty.querySelector(".jd-empty-state__title")!.textContent).toBe("없음");
    expect(empty.querySelector(".jd-empty-state__desc")!.textContent).toBe("설명");
    const result = document.querySelector("jd-result")!;
    // Result는 EmptyState 파생 — 같은 클래스 골격을 쓴다
    expect(result.querySelector(".jd-empty-state__title")!.textContent).toBe("완료");
    expect(result.querySelector(".jd-empty-state__icon svg")!.getAttribute("viewBox")).toBe(
      "0 0 64 64",
    );
  });

  test("jd-notification: 제목·설명·닫기", async () => {
    document.body.innerHTML = `<jd-notification variant="success" title="저장됨" description="반영되었습니다" dismissible></jd-notification>`;
    await tick();
    const el = document.querySelector("jd-notification")!;
    expect(el.getAttribute("role")).toBe("status");
    expect(el.querySelector(".jd-notification__title")!.textContent).toBe("저장됨");
    expect(el.querySelector(".jd-notification__desc")!.textContent).toBe("반영되었습니다");
    el.querySelector<HTMLButtonElement>(".jd-notification__close")!.click();
    expect((el as HTMLElement).hidden).toBe(true);
  });

  test("jd-snackbar: duration 후 자동 닫힘, 포인터가 올라가면 멈춘다", async () => {
    vi.useFakeTimers();
    document.body.innerHTML = `<jd-snackbar message="저장했습니다" duration="1000"></jd-snackbar>`;
    await vi.advanceTimersByTimeAsync(0);
    const el = document.querySelector<JdSnackbar>("jd-snackbar")!;
    el.show();
    await vi.advanceTimersByTimeAsync(0);
    expect(el.open).toBe(true);

    el.dispatchEvent(new Event("pointerenter"));
    await vi.advanceTimersByTimeAsync(2000);
    expect(el.open).toBe(true); // 읽는 중에는 사라지지 않는다(WCAG 2.2.1)

    el.dispatchEvent(new Event("pointerleave"));
    await vi.advanceTimersByTimeAsync(1000);
    expect(el.open).toBe(false);
    vi.useRealTimers();
  });

  test("jd-toast: 스택 호스트 + max 초과 시 오래된 것부터 제거", async () => {
    document.body.innerHTML = `<jd-toast max="2"></jd-toast>`;
    await tick();
    const host = document.querySelector<JdToast>("jd-toast")!;
    expect(host.getAttribute("aria-live")).toBe("polite");
    host.show({ title: "1" });
    host.show({ title: "2" });
    host.show({ title: "3" });
    expect(host.children).toHaveLength(2);
    expect(host.firstElementChild!.textContent).toContain("2"); // 1은 밀려났다

    const handle = host.show({ title: "4", duration: 0 });
    expect(host.children).toHaveLength(2);
    handle.close();
    expect(host.children).toHaveLength(1);
    host.clear();
    expect(host.children).toHaveLength(0);
  });

  test("모듈 toast()는 문서당 하나를 지연 생성해 재사용", async () => {
    expect(document.querySelector("jd-toast")).toBeNull();
    toast({ title: "첫 알림" });
    await tick();
    expect(document.querySelectorAll("jd-toast")).toHaveLength(1);
    toast({ title: "두 번째" });
    await tick();
    expect(document.querySelectorAll("jd-toast")).toHaveLength(1);
    expect(document.querySelector("jd-toast")!.children.length).toBe(2);
  });
});
