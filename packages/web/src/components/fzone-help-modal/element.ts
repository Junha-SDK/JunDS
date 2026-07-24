/**
 * <jd-fzone-help-modal> — F존 사용법 안내 (v2 finance/FZoneHelpModal) = jd-modal 파생.
 *
 * v2는 `<Modal>` 위에 정적 안내(히어로·카드 읽는 법·탭별 의미·용어 사전·면책)를 얹었다.
 * v3는 오버레이 골격(포커스 감금·ESC·요청형 닫기·스크롤 락)을 jd-modal이 전부 갖고,
 * 여기서는 **안내 콘텐츠와 initialTab 재정렬만** 얹는다(§6 R12 — drawer가 기하만 덮는 것과 동형).
 * 콘텐츠는 상수(TAB_CONTENT/SHARED_TERMS)라 render는 결정적이다(§3.1-3).
 *
 * 색은 노드별 `--tab`/`--accent` 커스텀 프로퍼티로만 나른다 — CSS가 color-mix로 틴트를
 * 만든다(인라인 color-mix 반복 제거, 소비자 오버라이드 허용).
 */
import { JdModal } from "../modal/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import fzoneHelpModalStyles from "./fzone-help-modal.css.js";

const CLOSE_SVG =
  `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">` +
  `<path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

type TabKey = "F존포착" | "F존+" | "SF존" | "골드존" | "38스윙";
const TAB_ORDER: TabKey[] = ["F존포착", "F존+", "SF존", "골드존", "38스윙"];

interface TabContent {
  headline: string;
  oneLiner: string;
  bullets: string[];
  example?: string;
  color: string;
  emoji: string;
}

/** v2 var(--bm-*)를 --jd-* 토큰으로 번역(상승색은 폴백 체인, 그 외 리터럴 승계) */
const UP = "var(--jd-finance-up, var(--jd-color-success))";

const TAB_CONTENT: Record<TabKey, TabContent> = {
  F존포착: {
    headline: "매수 후보 구간을 알고리즘이 미리 잡아둡니다",
    oneLiner:
      "주가가 추세 하단의 1차 매수 영역(B1)·2차 매수 영역(B2)·3차 매수 영역(B3)에 닿았는지 한눈에 보여줍니다.",
    bullets: [
      "현재가가 B1·B2·B3 중 어디에 있는지 빨간 강조 라벨로 표시됩니다.",
      "‘F존임박’은 곧 B1을 터치할 가능성이 높은 종목, ‘B1·B2’는 이미 해당 구간에 진입한 종목입니다.",
      "저항선은 단기 반등 시 부딪히기 쉬운 위쪽 가격대입니다.",
    ],
    example:
      "‘대원전선 B1 17,940’은 현재가가 17,940원 부근에서 1차 매수 후보 구간에 진입했다는 뜻입니다.",
    color: UP,
    emoji: "🎯",
  },
  "F존+": {
    headline: "신규 편입 + 프로그램 매매 흐름까지 함께 봅니다",
    oneLiner:
      "오늘 새로 F존 후보로 들어온 종목과, 외국인·기관의 프로그램 순매수/매도 규모를 묶어서 보여줍니다.",
    bullets: [
      "‘NEW’ 핑크 배지는 오늘 처음 F존+에 편입된 종목입니다.",
      "프로그램 컬럼이 양수(빨강)면 매수 우위, 음수(파랑)면 매도 우위입니다.",
      "B1·B2 두 줄은 같은 종목의 1차/2차 매수 후보 가격을 동시에 보여줍니다.",
    ],
    color: "#ec4899",
    emoji: "✨",
  },
  SF존: {
    headline: "Strong F존 — 강한 매수 신호가 중첩된 구간",
    oneLiner:
      "거래대금·추세·이동평균선 등 여러 조건을 동시에 만족한 ‘프리미엄 F존’만 따로 모은 탭입니다.",
    bullets: [
      "F존포착보다 조건이 까다롭기 때문에 후보 종목 수가 더 적습니다.",
      "신호 강도가 높은 만큼 진입가·손절가를 더 명확히 잡을 수 있습니다.",
    ],
    color: "#8b5cf6",
    emoji: "💎",
  },
  골드존: {
    headline: "중장기 매수 누적 구간(G1·G2·G3)",
    oneLiner:
      "단기 매수 구간(B1~B3)이 아닌, 주봉·월봉 기준의 장기 누적 매수 후보 가격대를 표시합니다.",
    bullets: [
      "G1이 가장 가까운 1차 누적 후보, G3로 갈수록 더 깊은 조정 시의 분할매수 후보입니다.",
      "단기 매매보다 ‘분할 적립’ 관점으로 활용하기 좋습니다.",
    ],
    color: "var(--jd-color-warning)",
    emoji: "🏆",
  },
  "38스윙": {
    headline: "38% 되돌림 자리에서 짧게 잡는 단타 후보",
    oneLiner:
      "직전 상승 폭의 약 38% 구간(피보나치 되돌림)까지 눌림이 나온 종목을, 단기 스윙용으로 추려서 보여줍니다.",
    bullets: [
      "J1·J2·J3는 38스윙 진입 후보가, 가까운 순서대로 표시됩니다(J1=1차).",
      "보통 며칠~2주 내 단기 반등을 노리는 자리이므로, 손절·목표가를 짧게 잡는 것이 일반적입니다.",
      "장기 추세가 무너진 종목에서는 38스윙이 실패할 확률이 높습니다.",
    ],
    example: "‘10,000원→13,000원’ 상승 후 11,860원 부근까지 눌리면 38% 되돌림 자리입니다.",
    color: "var(--jd-color-info)",
    emoji: "⚡",
  },
};

interface Term {
  term: string;
  meaning: string;
  color: string;
}

const SHARED_TERMS: Term[] = [
  {
    term: "B1·B2·B3",
    meaning:
      "단기 매수 후보 가격(1차→3차). 숫자가 커질수록 더 깊게 조정받았을 때의 분할매수 자리.",
    color: UP,
  },
  { term: "G1·G2·G3", meaning: "골드존 — 중장기 누적 매수 후보 가격대 (1차~3차).", color: "var(--jd-color-warning)" },
  { term: "J1·J2·J3", meaning: "38스윙 — 단기 되돌림 진입 후보 가격대 (1차~3차).", color: "var(--jd-color-info)" },
  { term: "저항선", meaning: "단기 반등 시 매물벽으로 작용하기 쉬운 위쪽 가격.", color: "#0ea5e9" },
  { term: "F존임박", meaning: "아직 B1을 터치하진 않았지만 곧 진입할 가능성이 높은 상태.", color: "#a855f7" },
];

const READ_CARDS = [
  { title: "현재가 색상", body: "빨강 = 상승, 파랑 = 하락", color: UP },
  { title: "우측 상단 배지", body: "F존임박 / B1 / B2 — 종목 상태 요약", color: "#a855f7" },
  { title: "가격 정렬 순서", body: "위에서 아래로 가격이 높은 → 낮은 순", color: "#0ea5e9" },
  { title: "하이라이트 라인", body: "현재 상태와 일치하는 줄에 빨간 테두리", color: "#fb923c" },
];

function elc(tag: string, className: string, text?: string): HTMLElement {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export class JdFzoneHelpModal extends JdModal {
  static override tag = "jd-fzone-help-modal";
  static override props = {
    ...JdModal.props,
    size: { type: String, default: "lg", reflect: true },
    /** 처음에 맨 위로 올릴 탭 (v2 initialTab) */
    initialTab: { type: String, default: "F존포착" },
  };

  declare initialTab: string;

  #built = false;
  #tabsWrap: HTMLElement | null = null;
  #tabArticles = new Map<TabKey, HTMLElement>();

  protected override render(): void {
    super.render(); // 백드롭·패널 구축
    adoptStyles(fzoneHelpModalStyles);
    this.#mount();
    this.update();
  }

  #panelEl(): HTMLElement | null {
    return this.querySelector<HTMLElement>(":scope > .jd-modal__panel");
  }

  #mount(): void {
    const panel = this.#panelEl();
    if (!panel || panel.querySelector(":scope > .jd-fzone-help__header")) {
      this.#built = Boolean(panel?.querySelector(":scope > .jd-fzone-help__header"));
      this.#tabsWrap = panel?.querySelector(".jd-fzone-help__tabs") ?? null;
      return;
    }

    // 헤더
    const header = elc("header", "jd-fzone-help__header");
    const titleId = jdUid("jd-fzone-help-title");
    const title = elc("h2", "jd-fzone-help__title", "F존 사용법");
    title.id = titleId;
    const close = document.createElement("button");
    close.type = "button";
    close.className = "jd-fzone-help__close";
    close.setAttribute("aria-label", "닫기");
    close.innerHTML = CLOSE_SVG;
    close.addEventListener("click", () => this.close());
    header.append(title, close);
    panel.setAttribute("aria-labelledby", titleId);

    const scroll = elc("div", "jd-fzone-help__scroll");
    scroll.append(this.#hero(), this.#body());

    panel.append(header, scroll);
    this.#built = true;
  }

  #hero(): HTMLElement {
    const hero = elc("div", "jd-fzone-help__hero");
    const row = elc("div", "jd-fzone-help__hero-row");
    const icon = elc("span", "jd-fzone-help__hero-icon", "🎯");
    const textWrap = elc("div", "jd-fzone-help__hero-text");
    textWrap.append(
      elc("p", "jd-fzone-help__hero-head", "자주 보는 매수 자리, 알고리즘이 자동으로 잡아드려요"),
    );
    const sub = elc("p", "jd-fzone-help__hero-sub");
    sub.append(
      document.createTextNode("F존은 추세·이동평균·거래대금을 조합한 "),
      elc("strong", "jd-fzone-help__hero-strong", "매수 후보 가격 구간"),
      document.createTextNode("입니다. 매수·매도 권유가 아닌 보조 지표로 활용하세요."),
    );
    textWrap.append(sub);
    row.append(icon, textWrap);

    const chips = elc("div", "jd-fzone-help__chips");
    for (const t of SHARED_TERMS.slice(0, 3)) {
      const chip = elc("span", "jd-fzone-help__chip", t.term);
      chip.style.setProperty("--tab", t.color);
      chips.append(chip);
    }
    hero.append(row, chips);
    return hero;
  }

  #body(): HTMLElement {
    const body = elc("div", "jd-fzone-help__sections");
    body.append(this.#readSection(), this.#tabSection(), this.#termSection(), this.#disclaimer());
    return body;
  }

  #section(title: string, icon: string, accent: string): { section: HTMLElement; content: HTMLElement } {
    const section = elc("section", "jd-fzone-help__section");
    section.style.setProperty("--accent", accent);
    const h4 = elc("h4", "jd-fzone-help__section-title");
    h4.append(elc("span", "jd-fzone-help__section-icon", icon), document.createTextNode(title));
    const content = elc("div", "jd-fzone-help__section-body");
    section.append(h4, content);
    return { section, content };
  }

  #readSection(): HTMLElement {
    const { section, content } = this.#section("카드 읽는 법", "📖", UP);
    const grid = elc("div", "jd-fzone-help__read-grid");
    for (const c of READ_CARDS) {
      const card = elc("div", "jd-fzone-help__read-card");
      card.style.setProperty("--tab", c.color);
      const head = elc("div", "jd-fzone-help__read-head");
      head.append(elc("span", "jd-fzone-help__read-dot"), elc("span", "jd-fzone-help__read-title", c.title));
      card.append(head, elc("p", "jd-fzone-help__read-body", c.body));
      grid.append(card);
    }
    content.append(grid);
    return section;
  }

  #tabSection(): HTMLElement {
    const { section, content } = this.#section("탭별 의미", "🗂️", "#a855f7");
    const wrap = elc("div", "jd-fzone-help__tabs");
    for (const key of TAB_ORDER) {
      const c = TAB_CONTENT[key];
      const article = elc("article", "jd-fzone-help__tab");
      article.style.setProperty("--tab", c.color);

      const head = elc("header", "jd-fzone-help__tab-head");
      head.append(elc("span", "jd-fzone-help__tab-emoji", c.emoji));
      head.append(elc("span", "jd-fzone-help__tab-pill", key));
      head.append(elc("span", "jd-fzone-help__tab-current", "현재 탭"));
      head.append(elc("span", "jd-fzone-help__tab-headline", c.headline));

      const tabBody = elc("div", "jd-fzone-help__tab-body");
      tabBody.append(elc("p", "jd-fzone-help__tab-oneliner", c.oneLiner));
      const ul = elc("ul", "jd-fzone-help__tab-bullets");
      for (const b of c.bullets) {
        const li = elc("li", "jd-fzone-help__tab-bullet");
        li.append(elc("span", "jd-fzone-help__tab-bullet-dot"), elc("span", "jd-fzone-help__tab-bullet-text", b));
        ul.append(li);
      }
      tabBody.append(ul);
      if (c.example) {
        const ex = elc("div", "jd-fzone-help__tab-example");
        ex.append(elc("span", "jd-fzone-help__tab-example-label", "예시"), elc("span", "jd-fzone-help__tab-example-text", c.example));
        tabBody.append(ex);
      }
      article.append(head, tabBody);
      wrap.append(article);
      this.#tabArticles.set(key, article);
    }
    content.append(wrap);
    this.#tabsWrap = wrap;
    return section;
  }

  #termSection(): HTMLElement {
    const { section, content } = this.#section("용어 한눈에 보기", "📚", "var(--jd-color-accent)");
    const grid = elc("div", "jd-fzone-help__term-grid");
    for (const t of SHARED_TERMS) {
      const rowEl = elc("div", "jd-fzone-help__term");
      const pill = elc("span", "jd-fzone-help__term-pill", t.term);
      pill.style.setProperty("--tab", t.color);
      rowEl.append(pill, elc("span", "jd-fzone-help__term-meaning", t.meaning));
      grid.append(rowEl);
    }
    content.append(grid);
    return section;
  }

  #disclaimer(): HTMLElement {
    const box = elc("div", "jd-fzone-help__disclaimer");
    box.append(
      elc("span", "jd-fzone-help__disclaimer-icon", "⚠️"),
      elc(
        "span",
        "jd-fzone-help__disclaimer-text",
        "모든 지표는 시스템 계산값이며 매수·매도 권유가 아닙니다. 최종 판단과 책임은 투자자 본인에게 있습니다.",
      ),
    );
    return box;
  }

  protected override update(): void {
    super.update();
    if (!this.#built || !this.#tabsWrap) return;
    const initial = TAB_ORDER.includes(this.initialTab as TabKey)
      ? (this.initialTab as TabKey)
      : "F존포착";
    const ordered: TabKey[] = [initial, ...TAB_ORDER.filter((t) => t !== initial)];
    ordered.forEach((key, i) => {
      const article = this.#tabArticles.get(key);
      if (!article) return;
      this.#tabsWrap!.append(article); // 순서대로 재부착
      article.toggleAttribute("data-first", i === 0);
    });
  }
}
