/**
 * <jd-announcement-bar> — 사이트 최상단 공지 띠 (v2 composites/AnnouncementBar) = Banner 파생.
 *
 * v2는 Banner와 AnnouncementBar가 **각자** 색 띠·닫기 버튼·닫기 상태를 다시 구현했다
 * (닫기 SVG·hover:bg-white/20까지 문자 단위로 같았다). v3는 그 골격 전부를 jd-banner가
 * 갖고, 이 파생은 **공지에만 있는 것 넷**만 더한다(§6 R12):
 *   1) 좌측 아이콘 슬롯  2) 우측 CTA(링크 또는 버튼)  3) storageKey 영속  4) neutral 톤.
 * 닫기 버튼·`jd-dismiss`·`no-dismiss` 반전 플래그(DEC-029-5)는 상속으로 공짜다.
 *
 * v2 대비 고친 것:
 * - **닫힘 영속을 render 시점에 적용**한다. v2는 useEffect에서 localStorage를 읽어
 *   이미 닫은 공지가 한 프레임 번쩍인 뒤 사라졌다(마운트 → 페인트 → setState).
 * - **탭 간 동기화**. createStoredValue의 storage 이벤트 구독으로, 한 탭에서 닫으면
 *   다른 탭에서도 사라진다(v2는 새로고침해야 반영됐다).
 * - **접근 이름을 저작자가 정한다**. v2는 aria-label="공지" 하드코딩이라 다국어 사이트에서
 *   랜드마크 이름이 한국어로 고정됐다 — `label` 프로퍼티로 뺐다.
 * - **아이콘은 aria-hidden**. 의미는 본문이 지고 아이콘은 장식이다(v2는 낭독됐다).
 * - `dismiss()` / `reset()` 공개 메서드 — v2는 영속을 지울 방법이 없어 개발 중 저장소를
 *   손으로 비워야 했다.
 *
 * 저장 키는 v2 형식(`junds-ann-<storageKey>`)을 그대로 쓴다 — v2에서 이미 닫은 사용자에게
 * 공지가 되살아나지 않는다. v2가 쓰던 문자열 "1"도 truthy로 읽는다(JSON.parse("1") === 1).
 */
import { JdBanner } from "../banner/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createStoredValue, type StoredValue } from "../../behaviors/storage.js";
import { on } from "../../behaviors/input.js";
import announcementBarStyles from "./announcement-bar.css.js";

const CTA_CLASS = "jd-announcement-bar__cta";

export class JdAnnouncementBar extends JdBanner {
  static override tag = "jd-announcement-bar";
  static override props = {
    ...JdBanner.props,
    /** neutral | primary | success | warning | danger — v2 기본 primary */
    variant: { type: String, default: "primary", reflect: true },
    /** 본문. light DOM children이 있으면 그쪽이 이긴다 */
    message: { type: String },
    /** 우측 CTA 텍스트. 없으면 CTA 자체가 없다 */
    ctaLabel: { type: String },
    /** 있으면 CTA가 <a>, 없으면 <button>(jd-cta 발행) */
    ctaHref: { type: String },
    /** localStorage 영속 키 — 닫힘 상태를 기억한다 */
    storageKey: { type: String },
    /** 랜드마크 접근 이름 */
    label: { type: String, default: "공지" },
    /**
     * 스크롤해도 상단에 붙는다. v2는 JSDoc이 "Banner와 달리 sticky"라 했지만
     * 구현에는 없었다 — 문서가 약속한 것을 opt-in 플래그로 실제로 준다.
     */
    sticky: { type: Boolean, reflect: true },
  };

  declare message: string;
  declare ctaLabel: string;
  declare ctaHref: string;
  declare storageKey: string;
  declare label: string;
  declare sticky: boolean;

  #content: HTMLElement | null = null;
  #iconSlot: HTMLElement | null = null;
  #link: HTMLAnchorElement | null = null;
  #button: HTMLButtonElement | null = null;
  /** children이 없어 message 프로퍼티가 본문을 쓰는 모드인지 */
  #messageDriven = false;

  #store: StoredValue<unknown> | null = null;
  #storeKey = "";
  #unsubscribe: (() => void) | null = null;
  #offDismiss: (() => void) | null = null;

  protected override render(): void {
    // 이미 렌더된 마크업 입양인지 먼저 판정한다 — 아래 children 판단이 갈린다(§3.3)
    const adopted = this.querySelector(":scope > .jd-banner__close") !== null;
    const icon = adopted ? null : this.querySelector<HTMLElement>(':scope > [slot="icon"]');
    icon?.remove(); // 본문으로 흡수되기 전에 빼둔다 — super.render()가 childNodes를 옮긴다

    const hasChildren =
      !adopted &&
      Array.from(this.childNodes).some(
        (n) => n.nodeType !== Node.TEXT_NODE || (n.textContent ?? "").trim() !== "",
      );
    this.#messageDriven = adopted ? Boolean(this.message) : !hasChildren;

    super.render(); // 본문 span + 닫기 버튼 구축, role=status 부여, update() 1회
    adoptStyles(announcementBarStyles);

    this.#content = this.querySelector<HTMLElement>(":scope > .jd-banner__content");
    const close = this.querySelector<HTMLElement>(":scope > .jd-banner__close");

    this.#iconSlot = this.querySelector<HTMLElement>(":scope > .jd-announcement-bar__icon");
    if (!this.#iconSlot) {
      this.#iconSlot = document.createElement("span");
      this.#iconSlot.className = "jd-announcement-bar__icon";
      this.#iconSlot.setAttribute("aria-hidden", "true");
      this.insertBefore(this.#iconSlot, this.#content ?? this.firstChild);
    }
    if (icon) this.#iconSlot.append(icon);

    // CTA는 <a>와 <button>을 둘 다 만들고 하나만 노출한다. href 유무로 요소를 갈아끼우면
    // 그때마다 리스너를 다시 걸어야 하고, 입양 경로에서 어느 쪽이 정본인지도 흐려진다.
    this.#link = this.querySelector<HTMLAnchorElement>(`:scope > a.${CTA_CLASS}`);
    this.#button = this.querySelector<HTMLButtonElement>(`:scope > button.${CTA_CLASS}`);
    if (!this.#link) {
      this.#link = document.createElement("a");
      this.#link.className = CTA_CLASS;
      this.insertBefore(this.#link, close);
    }
    if (!this.#button) {
      this.#button = document.createElement("button");
      this.#button.type = "button";
      this.#button.className = CTA_CLASS;
      this.insertBefore(this.#button, close);
    }
    this.#button.addEventListener("click", this.#onCta);
    this.update();
  }

  protected override connected(): void {
    super.connected();
    // 재연결 시 저장소 구독을 되살린다(disconnected에서 Behavior가 전부 destroy된다)
    this.#syncStore();
    this.#offDismiss = on(this, "jd-dismiss", this.#onDismiss as (e: never) => void);
  }

  protected override disconnected(): void {
    super.disconnected();
    this.#offDismiss?.();
    this.#offDismiss = null;
    this.#unsubscribe?.();
    this.#unsubscribe = null;
    this.#store = null;
    this.#storeKey = ""; // 다음 연결에서 재구축시키는 신호
  }

  /** 프로그램적 닫기 — 닫기 버튼과 같은 경로(영속·이벤트 포함) */
  dismiss(): void {
    if (this.hidden) return;
    this.hidden = true;
    this.emit("jd-dismiss");
  }

  /** 영속을 지우고 다시 보인다 */
  reset(): void {
    this.#store?.remove();
    this.hidden = false;
  }

  #onCta = (): void => {
    this.emit("jd-cta", { label: this.ctaLabel });
  };

  /**
   * 자기 자신이 낸 닫기만 영속시킨다. 공지 본문에 다른 jd-banner가 들어 있으면
   * 그쪽 jd-dismiss가 버블링으로 올라온다 — 남의 닫기를 우리 키에 기록하면 안 된다.
   */
  #onDismiss = (e: Event): void => {
    if (e.target !== this) return;
    this.#store?.set(true);
  };

  #syncStore(): void {
    const key = this.storageKey ? `junds-ann-${this.storageKey}` : "";
    // 키가 그대로이고 저장소 유무도 기대와 맞으면 할 일이 없다. 두 번째 조건이 없으면
    // 키 없는 흔한 경우에 매 update()마다 헛돌고, 재연결 후 죽은 구독을 못 살린다.
    if (key === this.#storeKey && Boolean(this.#store) === Boolean(key)) return;
    this.#storeKey = key;
    this.#unsubscribe?.();
    this.#unsubscribe = null;
    this.#store?.destroy();
    this.#store = null;
    if (!key) return;

    const store = this.own(createStoredValue<unknown>(key, false));
    this.#store = store;
    // 다른 탭의 변경도 같은 경로로 들어온다
    this.#unsubscribe = store.subscribe((v) => {
      this.hidden = Boolean(v);
    });
    if (store.get()) this.hidden = true; // 페인트 전에 숨긴다 — v2의 번쩍임 제거
  }

  protected override update(): void {
    super.update(); // 닫기 버튼 노출 여부(no-dismiss)
    this.#syncStore();
    if (this.#iconSlot) this.#iconSlot.hidden = !this.#iconSlot.firstChild;
    if (this.#content && this.#messageDriven) this.#content.textContent = this.message;

    const label = this.ctaLabel;
    const asLink = Boolean(label) && Boolean(this.ctaHref);
    if (this.#link) {
      this.#link.textContent = label;
      this.#link.hidden = !asLink;
      if (asLink) this.#link.href = this.ctaHref;
      else this.#link.removeAttribute("href");
    }
    if (this.#button) {
      this.#button.textContent = label;
      this.#button.hidden = !label || asLink;
    }
    // v2의 role="region" + 이름을 유지하되 **이름이 있을 때만** 건다. 이름 없는 region은
    // AT가 랜드마크로 노출하지 않아 조용히 사라지므로, 그 경우엔 상속받은 role=status로
    // 남겨 최소한 낭독은 되게 한다.
    if (this.label) {
      this.setAttribute("role", "region");
      this.setAttribute("aria-label", this.label);
    } else {
      this.setAttribute("role", "status");
      this.removeAttribute("aria-label");
    }
  }
}
