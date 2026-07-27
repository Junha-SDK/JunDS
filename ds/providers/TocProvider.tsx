"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * 목차 항목 하나. `TableOfContents` 의 `TocItem` 과 구조가 같으므로,
 * `useToc()?.items` 를 그대로 `<TableOfContents items={…} />` 에 넘길 수 있다.
 */
export interface TocEntry {
  /** 헤딩 요소의 id (앵커 링크 대상) */
  id: string;
  /** 목차에 표시할 텍스트 */
  label: string;
  /** 헤딩 레벨 (h2 = 2, h3 = 3 …) */
  level: number;
}

interface TocContextValue {
  /** 등록된 순서대로의 목차 항목 */
  items: TocEntry[];
  /** 헤딩 하나를 등록한다. 같은 id 는 무시된다 */
  register: (entry: TocEntry) => void;
  /** 등록을 취소한다 (헤딩이 언마운트될 때) */
  unregister: (id: string) => void;
  /**
   * 본문이 커밋됐는지.
   *
   * 이게 false 인 동안의 "항목 0개"는 "목차가 없는 글"이 아니라 "아직 본문이
   * 안 왔음"이다. 빈 상태 문구를 언제 띄울지 판단할 때 이 값을 본다.
   */
  ready: boolean;
  /** 본문 커밋을 알린다 */
  markReady: () => void;
}

const TocContext = createContext<TocContextValue | null>(null);

export interface TocProviderProps {
  children: ReactNode;
}

/**
 * React 로 렌더한 헤딩들이 스스로 목차에 등록되게 해 주는 프로바이더.
 *
 * DOM 을 훑어서 목차를 만드는 `TableOfContents` 와 목적이 같지만 방향이 반대다.
 * 이쪽은 헤딩 컴포넌트가 자기 자신을 등록하므로,
 *
 * - 본문이 아직 안 그려졌어도 등록 순서가 곧 문서 순서로 보장되고,
 * - 헤딩 텍스트가 문자열이 아니라 JSX 여도 라벨을 직접 지정할 수 있으며,
 * - 목차에 넣을 헤딩과 넣지 않을 헤딩을 셀렉터가 아니라 컴포넌트 선택으로 가른다.
 *
 * 이미 HTML 문자열로 굳어 있는 본문에는 `TableOfContents` 의 자동 수집을,
 * 헤딩을 컴포넌트로 렌더하는 본문에는 이쪽을 쓰면 된다.
 *
 * @example
 * ```tsx
 * <TocProvider>
 *   <aside><TocOutline /></aside>
 *   <article>
 *     <TocHeading level={2}>들어가며</TocHeading>
 *     <Suspense fallback={<Skeleton />}>
 *       <PostBody />
 *       <TocReady />
 *     </Suspense>
 *   </article>
 * </TocProvider>
 * ```
 */
export function TocProvider({ children }: TocProviderProps) {
  const [items, setItems] = useState<TocEntry[]>([]);
  const [ready, setReady] = useState(false);

  // 이미 본 id 집합. StrictMode 이중 마운트나 리렌더로 register 가 다시 불려도
  // 항목이 두 번 쌓이지 않게 한다.
  const seen = useRef(new Set<string>());

  const register = useCallback((entry: TocEntry) => {
    if (seen.current.has(entry.id)) return;
    seen.current.add(entry.id);
    setItems((prev) => [...prev, entry]);
  }, []);

  const unregister = useCallback((id: string) => {
    seen.current.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const markReady = useCallback(() => setReady(true), []);

  const value = useMemo<TocContextValue>(
    () => ({ items, register, unregister, ready, markReady }),
    [items, register, unregister, ready, markReady],
  );

  return <TocContext.Provider value={value}>{children}</TocContext.Provider>;
}

/**
 * 현재 목차 상태를 읽는다. `TocProvider` 밖에서 호출하면 null 을 반환하므로,
 * 프로바이더가 있을 때만 동작하는 선택적 기능을 만들 수 있다.
 */
export function useToc(): TocContextValue | null {
  return useContext(TocContext);
}

/**
 * 헤딩 하나를 목차에 등록한다. 마운트 시 등록하고 언마운트 시 해제한다.
 * `TocProvider` 가 없으면 아무 일도 하지 않는다.
 *
 * @param entry - 등록할 항목. `id` 가 없으면 등록을 건너뛴다.
 */
export function useRegisterHeading(entry: TocEntry | null): void {
  const toc = useToc();
  const register = toc?.register;
  const unregister = toc?.unregister;

  const id = entry?.id;
  const label = entry?.label;
  const level = entry?.level;

  useEffect(() => {
    if (!register || !unregister || !id) return;
    register({ id, label: label ?? id, level: level ?? 2 });
    return () => unregister(id);
  }, [register, unregister, id, label, level]);
}

/**
 * 본문이 커밋됐음을 알리는 마커. 아무것도 렌더하지 않는다.
 *
 * lazy 로딩되는 본문 **뒤에** 두면, 청크가 도착해 커밋되는 순간 `ready` 가 켜진다.
 * 그 전까지 목차가 비어 있는 건 정상이므로 "목차 없음" 문구를 띄우면 안 된다.
 */
export function TocReady() {
  const toc = useToc();
  const markReady = toc?.markReady;
  useEffect(() => {
    markReady?.();
  }, [markReady]);
  return null;
}
