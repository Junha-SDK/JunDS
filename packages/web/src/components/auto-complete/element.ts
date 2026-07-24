/**
 * <jd-auto-complete> — 자동완성 입력 (v2 composites/AutoComplete) = Combobox 파생.
 *
 * 두 컴포넌트의 차이는 **"무엇이 value인가" 하나뿐**이다(§6 R12):
 *  - Combobox: value = 선택된 옵션의 값, 입력 텍스트는 별도 질의(query)
 *  - AutoComplete: value = 입력 텍스트 그 자체. 옵션을 고르면 value가 그 라벨이 된다.
 * 그래서 파생은 queryText/acceptTyped/inputText/pick 4개만 갈아끼운다. 팝업·필터·
 * 화살표 내비·로딩·빈 상태·클릭아웃·디바운스·폼 참여는 전부 상속이다.
 *
 * v2 표면 호환: 옵션이 `key`를 쓰면(v2 AutoCompleteOption) value로 접어준다.
 *
 * 이벤트: `jd-input`{value}(타이핑, v2 onChange) · `jd-select`{value,label}
 * (옵션 확정, v2 onSelect) · `jd-change`{value}(값 확정) · `jd-open`/`jd-close`.
 *
 * v2와의 의도적 차이 1건 — **Portal 미사용**: v2는 드롭다운을 body로 포털해
 * fixed 좌표를 매 프레임 계산했다(오버플로 클리핑 회피). v3는 호스트 안 absolute로
 * 둔다. 근거: (1) 스크롤·리사이즈마다 좌표를 다시 재는 비용과 프리렌더 비결정성이
 * 사라지고, (2) light DOM이라 aria-controls/activedescendant가 포털 없이도 성립하며,
 * (3) 클리핑이 문제인 컨테이너는 소비자가 overflow를 풀면 된다(레이어 밖 CSS가 이긴다).
 */
import { JdCombobox, type JdComboboxOption, type JdComboboxItem } from "../combobox/element.js";
import { adoptStyles } from "../../core/styles.js";
import autoCompleteStyles from "./auto-complete.css.js";

/** v2 AutoCompleteOption 호환 — 식별자를 key/value 어느 쪽으로 줘도 된다 */
export interface JdAutoCompleteOption {
  /** v2 식별자. value가 있으면 value가 이긴다 */
  key?: string;
  value?: string;
  label: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
}

export class JdAutoComplete extends JdCombobox {
  static override tag = "jd-auto-complete";
  static override props = {
    ...JdCombobox.props,
    placeholder: { type: String, default: "입력하세요..." },
  };

  protected override fallbackAriaLabel = "자동완성 입력";

  protected override adoptStyleHook(): void {
    adoptStyles(autoCompleteStyles);
  }

  /** v2는 옵션 식별자가 `key`였다 — value로 접어 하나의 목록 계약으로 만든다 */
  protected override normalizeOptions(v: JdComboboxOption[]): JdComboboxOption[] {
    return v.map((o) => {
      const raw = o as unknown as JdAutoCompleteOption;
      if (raw.value) return o;
      return { ...o, value: raw.key ?? raw.label };
    });
  }

  /** 입력 텍스트가 곧 질의다 */
  protected override queryText(): string {
    return this.value;
  }

  protected override acceptTyped(v: string): void {
    this.query = v;
    this.value = v; // → requestUpdate
  }

  /** 열림 여부와 무관하게 입력창은 항상 value를 보인다 */
  protected override inputText(): string {
    return this.value;
  }

  protected override placeholderText(): string {
    return this.placeholder;
  }

  /** 선택 표시는 "지금 입력된 텍스트와 같은 라벨"로 판정 (v2는 활성 행에 aria-selected를 잘못 붙였다) */
  protected override isSelected(opt: JdComboboxItem): boolean {
    return !opt.create && Boolean(this.value) && opt.label === this.value;
  }

  protected override pick(opt: JdComboboxItem): void {
    if (opt.disabled) return;
    if (opt.create) this.emit("jd-create", { value: opt.value });
    this.query = opt.label;
    this.value = opt.label; // v2: onChange(opt.label)
    this.emit("jd-select", { value: opt.value, label: opt.label });
    this.emit("jd-change", { value: opt.label });
    this.setOpen(false);
    this.requestUpdate();
  }
}
