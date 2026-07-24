/**
 * <jd-textarea-autosize> — 내용에 맞춰 높이가 자라는 textarea (v2 composites/TextareaAutosize)
 * = <jd-textarea> 파생.
 *
 * v2는 Textarea(autoResize)와 TextareaAutosize가 **같은 기능을 두 번** 구현했다
 * (전자는 무제한 성장, 후자는 minRows/maxRows 클램프 + 글자수). v3는 골격·값 동기화·
 * 카운터·IME 안전 되쓰기를 jd-textarea가 전부 갖고, 여기서는 §6 R12대로
 * **행 수 클램프**만 얹는다. 골격 클래스(.jd-textarea__*)도 공유하고 시트는
 * 호스트 셀렉터 델타만 갖는다(jd-search-bar와 같은 구조).
 *
 * 클램프는 베이스의 성장 로직 **뒤에** 돌아야 한다:
 *  - update() 오버라이드는 super 뒤 → 베이스가 height=scrollHeight로 늘린 값을 조인다.
 *  - input 리스너는 connected()에서 super 뒤에 붙어 등록 순서상 나중에 실행된다.
 * 둘 다 같은 태스크 안이라 중간 상태가 페인트되지 않는다.
 *
 * lineHeight/padding은 getComputedStyle 실측 — v2 알고리즘 그대로이되 테두리 두께를
 * 더한다(box-sizing: border-box이므로 border를 빼면 매번 2px 짧아진다. v2의 실버그).
 */
import { JdTextarea } from "../textarea/element.js";
import { adoptStyles } from "../../core/styles.js";
import textareaAutosizeStyles from "./textarea-autosize.css.js";

export class JdTextareaAutosize extends JdTextarea {
  static override tag = "jd-textarea-autosize";
  static override props = {
    ...JdTextarea.props,
    /** 최소 행 수 (v2 기본 2) */
    minRows: { type: Number, default: 2 },
    /** 최대 행 수 — 넘으면 스크롤 (v2 기본 10) */
    maxRows: { type: Number, default: 10 },
    // v2 autoResize 프롭은 승계하지 않는다 — 이 컴포넌트는 정의상 항상 성장하며,
    // 끄고 싶으면 베이스 <jd-textarea>를 쓰면 된다(죽은 프롭 미승계, AUTHORING §9).
  };

  declare minRows: number;
  declare maxRows: number;

  #ta: HTMLTextAreaElement | null = null;

  protected override render(): void {
    // 파생 시트를 **먼저** 채택한다 — super.render()가 곧바로 update()→clamp를 부르는데,
    // 그때 베이스의 min-height 80px이 살아 있으면 첫 측정이 minRows를 무시한다.
    adoptStyles(textareaAutosizeStyles);
    super.render(); // 베이스 시트 + 골격 + update()
    this.#clamp();
  }

  protected override connected(): void {
    super.connected(); // 베이스 input/change 리스너 + 최초 성장
    this.#el()?.addEventListener("input", this.#onInput);
    this.#clamp();
  }

  protected override disconnected(): void {
    super.disconnected();
    this.#ta?.removeEventListener("input", this.#onInput);
  }

  protected override update(): void {
    super.update();
    this.#clamp();
  }

  #el(): HTMLTextAreaElement | null {
    if (!this.#ta) {
      this.#ta = this.querySelector<HTMLTextAreaElement>(":scope > textarea.jd-textarea__input");
    }
    return this.#ta;
  }

  #onInput = (): void => {
    this.#clamp();
  };

  /** v2 resize() 이식 — minRows/maxRows 사이로 높이를 조이고 넘치면 스크롤 */
  #clamp(): void {
    const ta = this.#el();
    if (!ta) return;
    // 하한은 minRows가 정한다 — 시트 채택 타이밍과 무관하게 CSS min-height를 인라인으로
    // 무력화해야 height:auto 측정이 베이스의 80px에 걸리지 않는다.
    ta.style.minHeight = "0px";
    const cs = getComputedStyle(ta);
    const lineHeight = parseFloat(cs.lineHeight) || 20; // normal이면 v2와 같은 폴백
    const padding = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    // border-box라 지정 높이에 테두리가 포함된다 — scrollHeight엔 없으므로 더해 준다
    const border = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
    const min = Math.max(1, this.minRows);
    const max = Math.max(min, this.maxRows);
    const minH = lineHeight * min + padding + border;
    const maxH = lineHeight * max + padding + border;

    ta.style.height = "auto"; // 먼저 접어야 scrollHeight가 줄어든다
    const content = ta.scrollHeight + border;
    ta.style.height = `${Math.min(maxH, Math.max(minH, content))}px`;
    ta.style.overflowY = content > maxH ? "auto" : "hidden";
  }
}
