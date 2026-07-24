/**
 * <jd-search-bar> — 단축키 포커스가 붙은 검색 입력 (v2 composites/SearchBar) = SearchInput 파생.
 *
 * v2에서 SearchInput과 SearchBar는 **각자** 디바운스·지우기 버튼·크기 3단을 다시
 * 구현했다(디바운스 기본값 300 vs 250, 지우기 라벨/아이콘도 제각각). v3는 골격·이벤트·
 * 디바운스를 <jd-search-input> 하나가 갖고, 여기서는 §6 R12대로
 * **기하(높이 3단)·기본값·단축키**만 더한다.
 *
 * - `focus-shortcut`(기본 "mod+k")은 behaviors/createHotkeys에 위임 — "mod"의
 *   플랫폼 분기·IME 중 key 비문자열 방어가 이미 그 안에 있다. 빈 문자열이면 비활성.
 *   입력 요소 안에서도 동작해야 하므로 enableOnFormTags: true(v2 allowInInputs 동형).
 * - v2 endSlot(단축키 힌트 등)은 light DOM children — 베이스가
 *   `.jd-search-input__end`로 옮긴다.
 */
import { JdSearchInput } from "../search-input/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createHotkeys } from "../../behaviors/input.js";
import type { HotkeyMap } from "../../behaviors/input.js";
import type { Behavior } from "../../behaviors/types.js";
import searchBarStyles from "./search-bar.css.js";

export class JdSearchBar extends JdSearchInput {
  static override tag = "jd-search-bar";
  static override props = {
    ...JdSearchInput.props,
    // v2 SearchBar 고유 기본값 (SearchInput은 "검색..." / 300 / "검색어 지우기")
    placeholder: { type: String, default: "검색" },
    debounce: { type: Number, default: 250 },
    clearLabel: { type: String, default: "지우기" },
    /** 포커스 단축키. "" 이면 비활성 (v2 focusShortcut={false} 대응) */
    focusShortcut: { type: String, default: "mod+k" },
  };

  declare focusShortcut: string;

  #hotkeys: Behavior<HotkeyMap> | null = null;
  #chord = "";

  protected override render(): void {
    super.render(); // 골격 + 베이스 시트 + update()
    adoptStyles(searchBarStyles); // 호스트 델타만 (골격 클래스는 공유)
  }

  protected override connected(): void {
    super.connected();
    this.#bindShortcut();
  }

  protected override disconnected(): void {
    super.disconnected();
    this.#hotkeys = null; // own() 등록분은 베이스가 destroy — 참조만 끊는다
    this.#chord = "";
  }

  protected override update(): void {
    super.update();
    this.#bindShortcut(); // focus-shortcut 런타임 변경 반영
  }

  #bindShortcut(): void {
    const chord = this.focusShortcut.trim();
    if (chord === this.#chord) return;
    this.#chord = chord;
    this.#hotkeys?.destroy(); // 멱등
    this.#hotkeys = null;
    if (!chord) return;
    this.#hotkeys = this.own(
      createHotkeys(
        { [chord]: () => this.focus() },
        { enableOnFormTags: true }, // 다른 입력에 있어도 검색으로 점프 (v2 allowInInputs)
      ),
    );
  }
}
