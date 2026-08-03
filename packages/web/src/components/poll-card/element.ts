/**
 * <jd-poll-card> — 단일 선택 투표 카드 (v2 composites/PollCard).
 *
 * 옵션 입력 2경로(§1.3 — 복합 데이터는 attribute 금지, radio-group·action-sheet 선례):
 *  1. `options` 프로퍼티 (Array<{id,label,votes}>)
 *  2. 선언적 초기화: 자식 `<script type="application/json">[…]</script>` 슬롯
 *
 * 컨트롤드 표면(v2 동형): 투표는 `jd-vote`만 발행하고 스스로 votedId를 바꾸지 않는다 —
 * 소비자가 `voted-id`와 `options`(집계)를 되쓴다. 낙관적 자가 증가로 이중 집계되는 것을 피한다.
 *
 * v2 대비 교정 3건:
 *  1. **질문이 옵션 묶음의 이름이 아니었다.** v2는 질문 <p>와 버튼들이 접근성상 분리돼
 *     있었다. v3는 옵션 리스트를 role="group" + aria-labelledby(질문)으로 묶는다.
 *  2. **결과 막대가 값을 두 번 셌다.** 막대는 순수 장식이라 aria-hidden, 실제 수치는
 *     텍스트("46% · 1,203")가 단독으로 말한다.
 *  3. **선두 옵션 강조가 색으로만 전달됐다.** data-top으로 CSS만 칠하고 수치는 텍스트로.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import pollCardStyles from "./poll-card.css.js";

export interface JdPollOption {
  id: string;
  label: string;
  votes: number;
}

interface Row {
  li: HTMLLIElement;
  button: HTMLButtonElement;
  bar: HTMLElement;
  check: HTMLElement;
  labelText: HTMLElement;
  pct: HTMLElement;
}

const CLS = "jd-poll-card";

export class JdPollCard extends JdElement {
  static override tag = "jd-poll-card";
  static override props = {
    /** 질문 텍스트 */
    question: { type: String },
    /** 사용자가 투표한 옵션 id. 비면 미투표 */
    votedId: { type: String }, // attr: voted-id
    /** 마감까지 남은 텍스트 */
    closesIn: { type: String }, // attr: closes-in
    /** 투표 전에도 결과를 보여줄지 */
    alwaysShowResults: { type: Boolean }, // attr: always-show-results
  };

  declare question: string;
  declare votedId: string;
  declare closesIn: string;
  declare alwaysShowResults: boolean;

  #options: JdPollOption[] = [];
  #rows: Row[] = [];
  #questionEl!: HTMLElement;
  #list!: HTMLElement;
  #footer!: HTMLElement;
  #total!: HTMLElement;
  #closes!: HTMLElement;

  get options(): JdPollOption[] {
    return this.#options;
  }
  set options(v: JdPollOption[]) {
    this.#options = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(pollCardStyles);
    this.#readJson();
    // 슬롯 없는 데이터 컴포넌트 — SSR 골격이 있으면 지우고 새로 세운다(§3.3 멱등, 이중 방지)
    this.textContent = "";

    this.#questionEl = document.createElement("p");
    this.#questionEl.className = `${CLS}__question`;
    this.#questionEl.id = jdUid(`${CLS}-q`);

    this.#list = document.createElement("ul");
    this.#list.className = `${CLS}__options`;
    this.#list.setAttribute("role", "group");
    this.#list.setAttribute("aria-labelledby", this.#questionEl.id);

    this.#total = document.createElement("span");
    this.#total.className = `${CLS}__total`;
    this.#closes = document.createElement("span");
    this.#closes.className = `${CLS}__closes`;
    this.#footer = document.createElement("footer");
    this.#footer.className = `${CLS}__footer`;
    this.#footer.append(this.#total, this.#closes);

    this.append(this.#questionEl, this.#list, this.#footer);
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent) as JdPollOption[];
      if (Array.isArray(parsed)) this.#options = parsed;
    } catch {
      console.warn("[junds] <jd-poll-card> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #rebuild(): void {
    this.#list.textContent = "";
    this.#rows = [];
    for (let i = 0; i < this.#options.length; i++) {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = `${CLS}__option`;

      const bar = document.createElement("span");
      bar.className = `${CLS}__bar`;
      bar.setAttribute("aria-hidden", "true");

      const check = document.createElement("span");
      check.className = `${CLS}__check`;
      check.setAttribute("aria-hidden", "true");
      check.textContent = "✓";
      const labelText = document.createElement("span");
      labelText.className = `${CLS}__label-text`;
      const label = document.createElement("span");
      label.className = `${CLS}__label`;
      label.append(check, labelText);

      const pct = document.createElement("span");
      pct.className = `${CLS}__pct`;

      const inner = document.createElement("span");
      inner.className = `${CLS}__row`;
      inner.append(label, pct);

      button.append(bar, inner);
      button.addEventListener("click", () => this.#vote(i));
      li.append(button);
      this.#list.append(li);
      this.#rows.push({ li, button, bar, check, labelText, pct });
    }
  }

  #vote(i: number): void {
    if (this.#isVoted()) return; // 이미 투표 — 컨트롤드
    const opt = this.#options[i];
    if (!opt) return;
    this.emit("jd-vote", { id: opt.id });
  }

  #isVoted(): boolean {
    // 빈 문자열·null·undefined 모두 미투표 (v2 votedId?: string | null 대응)
    return Boolean(this.votedId);
  }

  protected override update(): void {
    this.#questionEl.textContent = this.question;

    if (this.#rows.length !== this.#options.length) this.#rebuild();

    const total = this.#options.reduce((s, o) => s + (Number(o.votes) || 0), 0);
    const voted = this.#isVoted();
    const showResults = voted || this.alwaysShowResults;
    const maxVotes = this.#options.reduce((m, o) => Math.max(m, Number(o.votes) || 0), 0);

    this.#options.forEach((opt, i) => {
      const row = this.#rows[i];
      if (!row) return;
      const votes = Number(opt.votes) || 0;
      const pct = total > 0 ? (votes / total) * 100 : 0;
      const mine = voted && this.votedId === opt.id;
      const top = votes > 0 && votes === maxVotes;

      row.button.setAttribute("aria-pressed", String(mine));
      row.button.disabled = voted;
      row.button.toggleAttribute("data-top", showResults && top && !mine);

      row.bar.hidden = !showResults;
      row.bar.style.width = `${pct}%`;

      row.check.hidden = !mine;
      row.labelText.textContent = opt.label;

      row.pct.hidden = !showResults;
      if (showResults) row.pct.textContent = `${Math.round(pct)}% · ${votes.toLocaleString()}`;
    });

    this.#total.textContent = `${total.toLocaleString()}표`;
    this.#closes.textContent = this.closesIn;
    this.#closes.hidden = !this.closesIn;
  }
}
