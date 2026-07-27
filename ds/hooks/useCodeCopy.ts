"use client";

import { useEffect } from "react";
import type { DependencyList } from "react";

export interface UseCodeCopyOptions {
  /** 복사 버튼을 붙일 코드 블록 셀렉터 (기본 `"pre"`) */
  blockSelector?: string;
  /** 버튼 기본 라벨 (기본 `"복사"`) */
  label?: string;
  /** 복사 성공 후 잠시 보여줄 라벨 (기본 `"복사됨"`) */
  copiedLabel?: string;
  /** 버튼에 붙일 클래스 (기본 `"jds-code-copy-btn"`) */
  buttonClassName?: string;
  /** 복사 성공 상태에서 추가로 붙는 클래스 (기본 `"is-copied"`) */
  copiedClassName?: string;
  /** 성공 라벨을 유지할 시간 (ms, 기본 1600) */
  resetDelay?: number;
  /** 스크린리더용 버튼 라벨 (기본 `"코드 복사"`) */
  ariaLabel?: string;
}

const RETRY_DELAY = 300;

/**
 * 이미 커밋된 DOM 안의 코드 블록마다 "복사" 버튼을 주입하는 훅.
 *
 * 마크다운을 빌드 타임에 HTML 문자열로 굳혀 `dangerouslySetInnerHTML` 로 꽂는
 * 파이프라인에서는 코드 블록마다 걸어 둘 React 컴포넌트가 없다. 이 훅은 그런
 * 경우를 위해 렌더가 끝난 뒤 DOM 을 직접 보강한다.
 *
 * 주입은 `data-copy-ready` 로 멱등성이 보장되고, `deps` 가 바뀔 때마다 다시
 * 돈다. 본문이 lazy 하게 도착하는 경우를 대비해 즉시 / 다음 프레임 /
 * 300ms 후 세 번 시도한다. 언마운트 시 주입한 버튼과 리스너를 모두 걷어낸다.
 *
 * 컴포넌트 단위로 제어 가능한 코드 블록이라면 `<CopyButton>` 이나
 * `useClipboard` 를 쓰는 편이 낫다. 이 훅은 "내가 만들지 않은 DOM" 전용이다.
 *
 * @param rootSelector - 코드 블록을 찾을 루트 컨테이너 셀렉터
 * @param deps - 이 값이 바뀌면 다시 주입 (보통 글 slug / 경로)
 *
 * @example
 * ```tsx
 * useCodeCopy(".article__body", [slug]);
 * ```
 */
export function useCodeCopy(
  rootSelector: string,
  deps: DependencyList,
  options: UseCodeCopyOptions = {},
): void {
  const {
    blockSelector = "pre",
    label = "복사",
    copiedLabel = "복사됨",
    buttonClassName = "jds-code-copy-btn",
    copiedClassName = "is-copied",
    resetDelay = 1600,
    ariaLabel = "코드 복사",
  } = options;

  useEffect(() => {
    if (typeof document === "undefined") return;

    let cancelled = false;
    const cleanups: Array<() => void> = [];

    const enhance = () => {
      if (cancelled) return;
      const root = document.querySelector(rootSelector);
      if (!root) return;

      root.querySelectorAll<HTMLElement>(blockSelector).forEach((pre) => {
        if (pre.dataset.copyReady === "1") return;
        pre.dataset.copyReady = "1";

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = buttonClassName;
        btn.textContent = label;
        btn.setAttribute("aria-label", ariaLabel);

        let resetTimer = 0;
        const onClick = (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          const code = pre.querySelector("code");
          const text = (code?.textContent ?? pre.textContent ?? "").replace(/\n$/, "");
          if (!navigator.clipboard?.writeText) return;
          navigator.clipboard
            .writeText(text)
            .then(() => {
              if (cancelled) return;
              btn.textContent = copiedLabel;
              btn.classList.add(copiedClassName);
              window.clearTimeout(resetTimer);
              resetTimer = window.setTimeout(() => {
                btn.textContent = label;
                btn.classList.remove(copiedClassName);
              }, resetDelay);
            })
            .catch(() => {
              /* 클립보드 거부(권한/비보안 컨텍스트)는 조용히 무시 */
            });
        };

        btn.addEventListener("click", onClick);
        pre.appendChild(btn);

        cleanups.push(() => {
          window.clearTimeout(resetTimer);
          btn.removeEventListener("click", onClick);
          btn.remove();
          delete pre.dataset.copyReady;
        });
      });
    };

    enhance();
    const raf = requestAnimationFrame(enhance);
    const timer = window.setTimeout(enhance, RETRY_DELAY);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      cleanups.forEach((fn) => fn());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
