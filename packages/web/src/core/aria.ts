/**
 * 컴포넌트가 소비자 DOM에 추가하는 ARIA 속성의 소유권을 관리한다.
 *
 * light DOM 컴포넌트는 사용자가 만든 컨트롤에 설명·상태를 자동 연결한다. 이때 단순
 * set/removeAttribute를 쓰면 소비자의 기존 값을 덮거나, 상태 해제 시 소비자 값까지
 * 지우게 된다. 아래 함수는 JunDS가 직전에 추가한 값만 기억하고 회수한다.
 */

export type AriaIdRefAttribute =
  | "aria-controls"
  | "aria-describedby"
  | "aria-details"
  | "aria-errormessage"
  | "aria-labelledby"
  | "aria-owns";

const idRefOwnership = new WeakMap<Element, Map<AriaIdRefAttribute, Set<string>>>();

function idRefs(value: string | readonly string[] | null | undefined): string[] {
  const values = Array.isArray(value) ? value : [value];
  return [
    ...new Set(
      values.flatMap((item) => (typeof item === "string" ? item.split(/\s+/).filter(Boolean) : [])),
    ),
  ];
}

/**
 * IDREF 속성에 JunDS 소유 id를 병합한다.
 *
 * 다음 호출에서는 직전 `ownedIds`만 제거하므로, 호출 사이에 소비자가 추가한 id도
 * 보존된다. 빈 배열은 JunDS 관계만 해제한다.
 */
export function syncAriaIdRefs(
  target: Element,
  attribute: AriaIdRefAttribute,
  ownedIds: string | readonly string[] | null | undefined,
): void {
  let ownership = idRefOwnership.get(target);
  const previous = ownership?.get(attribute) ?? new Set<string>();
  const consumer = idRefs(target.getAttribute(attribute)).filter((id) => !previous.has(id));
  const nextOwned = idRefs(ownedIds);
  const value = [...new Set([...consumer, ...nextOwned])].join(" ");

  if (value) target.setAttribute(attribute, value);
  else target.removeAttribute(attribute);

  if (nextOwned.length > 0) {
    ownership ??= new Map();
    ownership.set(attribute, new Set(nextOwned));
    idRefOwnership.set(target, ownership);
  } else if (ownership) {
    ownership.delete(attribute);
    if (ownership.size === 0) idRefOwnership.delete(target);
  }
}

interface OwnedAttributeState {
  original: string | null;
  applied: string;
}

const attributeOwnership = new WeakMap<Element, Map<string, OwnedAttributeState>>();

export interface SyncOwnedAttributeOptions {
  /**
   * 소비자가 이미 값을 지정했다면 JunDS 기본값을 적용하지 않는다.
   * 자동 role처럼 의미상 기본값인 속성에 사용한다.
   */
  preserveExisting?: boolean;
}

/**
 * 단일 값 속성을 JunDS가 필요한 동안만 적용하고, 해제 시 기존 소비자 값을 복원한다.
 *
 * 적용 중 소비자가 값을 다시 바꾸면 그 값이 새 소유자가 된다. `value=null`은 소비자
 * 값을 건드리지 않고 JunDS가 마지막으로 적용한 값만 회수한다.
 */
export function syncOwnedAttribute(
  target: Element,
  attribute: string,
  value: string | null | undefined,
  options: SyncOwnedAttributeOptions = {},
): void {
  let ownership = attributeOwnership.get(target);
  let state = ownership?.get(attribute);
  const current = target.getAttribute(attribute);

  if (value == null) {
    if (!state) return;
    if (current === state.applied) {
      if (state.original == null) target.removeAttribute(attribute);
      else target.setAttribute(attribute, state.original);
    }
    ownership!.delete(attribute);
    if (ownership!.size === 0) attributeOwnership.delete(target);
    return;
  }

  if (!state) {
    if (options.preserveExisting && current != null) return;
    ownership ??= new Map();
    state = { original: current, applied: value };
    ownership.set(attribute, state);
    attributeOwnership.set(target, ownership);
  } else if (current !== state.applied) {
    if (options.preserveExisting) {
      ownership!.delete(attribute);
      if (ownership!.size === 0) attributeOwnership.delete(target);
      return;
    }
    state.original = current;
  }

  state.applied = value;
  if (current !== value) target.setAttribute(attribute, value);
}
