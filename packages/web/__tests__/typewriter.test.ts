import { beforeEach, describe, expect, test, vi } from "vitest";
import "../src/components/typewriter/index.js";
import type { JdTypewriter } from "../src/components/typewriter/element.js";

const tick = () => new Promise<void>((resolve) => queueMicrotask(() => queueMicrotask(resolve)));

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("jd-typewriter 동적 소스", () => {
  test("once 완료 뒤 text를 바꾸면 새 문장을 처음부터 다시 타이핑한다", async () => {
    vi.useFakeTimers();
    try {
      document.body.innerHTML = `<jd-typewriter text="이전" speed="1" once></jd-typewriter>`;
      await tick();
      const typewriter = document.querySelector<JdTypewriter>("jd-typewriter")!;
      const typed = typewriter.querySelector<HTMLElement>(".jd-typewriter__typed")!;

      await vi.advanceTimersByTimeAsync(1);
      expect(typed.textContent).toBe("이전");

      typewriter.text = "새문장";
      await typewriter.updateComplete;
      expect(typed.textContent).toBe("");
      expect(typewriter.querySelector(".jd-typewriter__sr")!.textContent).toBe("새문장");

      await vi.advanceTimersByTimeAsync(3);
      expect(typed.textContent).toBe("새문장");
    } finally {
      vi.useRealTimers();
    }
  });
});
