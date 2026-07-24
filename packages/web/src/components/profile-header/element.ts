/**
 * <jd-profile-header> — SNS 프로필 헤더 (v2 composites/ProfileHeader).
 *
 * 배너 + 아바타 + 이름/핸들 + 소개 + 위치/가입일 + 통계 + 액션. 스칼라(name·handle·
 * location·joinedAt·banner·avatar·verified)는 attribute, 리치 콘텐츠는 슬롯으로 받는다:
 *   [slot="actions"] → 우측 액션(FollowButton 등) · [slot="bio"] 또는 무슬롯 → 소개.
 * 통계는 복합 데이터라 `stats` 프로퍼티 또는 자식 `<script type="application/json">`
 * 슬롯으로 받는다(§1.3).
 *
 * v2 대비 개선: 배너를 `role="img"`가 아니라 순수 장식(빈 aria)으로 두고, 아바타
 * 이니셜 폴백을 aria-hidden 처리해 이름이 접근 트리에서 한 번만 읽히게 한다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import profileHeaderStyles from "./profile-header.css.js";

export interface JdProfileStat {
  label: string;
  value: string | number;
  href?: string;
}

export class JdProfileHeader extends JdElement {
  static override tag = "jd-profile-header";
  static override props = {
    name: { type: String },
    handle: { type: String },
    location: { type: String },
    joinedAt: { type: String },
    banner: { type: String },
    avatar: { type: String },
    verified: { type: Boolean, reflect: true },
    // stats(배열)는 property 전용(§1.3)
  };

  declare name: string;
  declare handle: string;
  declare location: string;
  declare joinedAt: string;
  declare banner: string;
  declare avatar: string;
  declare verified: boolean;

  #stats: JdProfileStat[] = [];

  #bannerEl!: HTMLElement;
  #bannerImg!: HTMLImageElement;
  #avatarImg!: HTMLImageElement;
  #avatarFallback!: HTMLSpanElement;
  #name!: HTMLHeadingElement;
  #verified!: HTMLSpanElement;
  #handleEl!: HTMLParagraphElement;
  #bio!: HTMLElement;
  #location!: HTMLParagraphElement;
  #locText!: HTMLSpanElement;
  #joinedText!: HTMLSpanElement;
  #statsEl!: HTMLUListElement;

  get stats(): JdProfileStat[] {
    return this.#stats;
  }
  set stats(v: JdProfileStat[]) {
    this.#stats = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(profileHeaderStyles);
    this.#readJson();
    const existing = this.querySelector<HTMLElement>(":scope > header.jd-profile-header");
    if (existing) this.#adopt(existing);
    else this.#build();
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdProfileStat[];
      if (Array.isArray(parsed)) this.#stats = parsed;
    } catch {
      console.warn("[junds] <jd-profile-header> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #adopt(header: HTMLElement): void {
    this.#bannerEl = header.querySelector(".jd-profile-header__banner")!;
    this.#bannerImg = header.querySelector(".jd-profile-header__banner-img")!;
    this.#avatarImg = header.querySelector(".jd-profile-header__avatar-img")!;
    this.#avatarFallback = header.querySelector(".jd-profile-header__avatar-fallback")!;
    this.#name = header.querySelector(".jd-profile-header__name")!;
    this.#verified = header.querySelector(".jd-profile-header__verified")!;
    this.#handleEl = header.querySelector(".jd-profile-header__handle")!;
    this.#bio = header.querySelector(".jd-profile-header__bio")!;
    this.#location = header.querySelector(".jd-profile-header__location")!;
    this.#locText = header.querySelector(".jd-profile-header__loc")!;
    this.#joinedText = header.querySelector(".jd-profile-header__joined")!;
    this.#statsEl = header.querySelector(".jd-profile-header__stats")!;
  }

  #build(): void {
    // children 분류(§1.3): script는 이미 소비됨. slot="actions" → 액션, 그 외 → 소개
    const actionNodes: Node[] = [];
    const bioNodes: Node[] = [];
    for (const node of Array.from(this.childNodes)) {
      const slot = node.nodeType === 1 ? (node as Element).getAttribute("slot") : null;
      (slot === "actions" ? actionNodes : bioNodes).push(node);
    }

    const header = document.createElement("header");
    header.className = "jd-profile-header";

    this.#bannerEl = document.createElement("div");
    this.#bannerEl.className = "jd-profile-header__banner";
    this.#bannerImg = document.createElement("img");
    this.#bannerImg.className = "jd-profile-header__banner-img";
    this.#bannerImg.alt = "";
    this.#bannerEl.append(this.#bannerImg);

    const body = document.createElement("div");
    body.className = "jd-profile-header__body";

    const top = document.createElement("div");
    top.className = "jd-profile-header__top";
    const avatarWrap = document.createElement("div");
    avatarWrap.className = "jd-profile-header__avatar";
    this.#avatarImg = document.createElement("img");
    this.#avatarImg.className = "jd-profile-header__avatar-img";
    this.#avatarImg.alt = "";
    this.#avatarFallback = document.createElement("span");
    this.#avatarFallback.className = "jd-profile-header__avatar-fallback";
    this.#avatarFallback.setAttribute("aria-hidden", "true");
    avatarWrap.append(this.#avatarImg, this.#avatarFallback);
    const actions = document.createElement("div");
    actions.className = "jd-profile-header__actions";
    actions.append(...actionNodes);
    top.append(avatarWrap, actions);

    const identity = document.createElement("div");
    identity.className = "jd-profile-header__identity";
    const nameRow = document.createElement("div");
    nameRow.className = "jd-profile-header__name-row";
    this.#name = document.createElement("h2");
    this.#name.className = "jd-profile-header__name";
    this.#verified = document.createElement("span");
    this.#verified.className = "jd-profile-header__verified";
    this.#verified.textContent = "✓";
    this.#verified.setAttribute("aria-label", "인증됨");
    nameRow.append(this.#name, this.#verified);
    this.#handleEl = document.createElement("p");
    this.#handleEl.className = "jd-profile-header__handle";
    identity.append(nameRow, this.#handleEl);

    this.#bio = document.createElement("div");
    this.#bio.className = "jd-profile-header__bio";
    this.#bio.append(...bioNodes);

    this.#location = document.createElement("p");
    this.#location.className = "jd-profile-header__location";
    this.#locText = document.createElement("span");
    this.#locText.className = "jd-profile-header__loc";
    this.#joinedText = document.createElement("span");
    this.#joinedText.className = "jd-profile-header__joined";
    this.#location.append(this.#locText, this.#joinedText);

    this.#statsEl = document.createElement("ul");
    this.#statsEl.className = "jd-profile-header__stats";

    body.append(top, identity, this.#bio, this.#location, this.#statsEl);
    header.append(this.#bannerEl, body);
    this.append(header);
  }

  protected override update(): void {
    // 배너
    const hasBanner = Boolean(this.banner);
    this.#bannerImg.hidden = !hasBanner;
    if (hasBanner) {
      if (this.#bannerImg.getAttribute("src") !== this.banner) this.#bannerImg.src = this.banner;
    } else {
      this.#bannerImg.removeAttribute("src");
    }

    // 아바타
    const hasAvatar = Boolean(this.avatar);
    this.#avatarImg.hidden = !hasAvatar;
    this.#avatarFallback.hidden = hasAvatar;
    if (hasAvatar) {
      if (this.#avatarImg.getAttribute("src") !== this.avatar) this.#avatarImg.src = this.avatar;
    } else {
      this.#avatarImg.removeAttribute("src");
      this.#avatarFallback.textContent = this.name ? this.name.slice(0, 1) : "";
    }

    // 이름/핸들
    this.#name.textContent = this.name ?? "";
    this.#verified.hidden = !this.verified;
    const hasHandle = Boolean(this.handle);
    this.#handleEl.textContent = hasHandle ? `@${this.handle}` : "";
    this.#handleEl.hidden = !hasHandle;

    // 소개 — 슬롯 콘텐츠가 없으면 접는다
    this.#bio.hidden = this.#bio.childNodes.length === 0;

    // 위치/가입일
    const hasLoc = Boolean(this.location);
    const hasJoined = Boolean(this.joinedAt);
    this.#locText.textContent = hasLoc ? `📍 ${this.location}` : "";
    this.#locText.hidden = !hasLoc;
    this.#joinedText.textContent = hasJoined ? `📅 ${this.joinedAt} 가입` : "";
    this.#joinedText.hidden = !hasJoined;
    this.#location.hidden = !(hasLoc || hasJoined);

    this.#syncStats();
  }

  #syncStats(): void {
    this.#statsEl.hidden = this.#stats.length === 0;
    if (this.#statsEl.children.length !== this.#stats.length) {
      this.#statsEl.textContent = "";
      for (const s of this.#stats) {
        const li = document.createElement("li");
        li.className = "jd-profile-header__stat";
        const wrap = s.href ? document.createElement("a") : document.createElement("span");
        wrap.className = "jd-profile-header__stat-link";
        if (s.href) (wrap as HTMLAnchorElement).href = s.href;
        const value = document.createElement("span");
        value.className = "jd-profile-header__stat-value";
        const label = document.createElement("span");
        label.className = "jd-profile-header__stat-label";
        wrap.append(value, label);
        li.append(wrap);
        this.#statsEl.append(li);
      }
    }
    this.#stats.forEach((s, i) => {
      const li = this.#statsEl.children[i];
      if (!li) return;
      li.querySelector(".jd-profile-header__stat-value")!.textContent = String(s.value);
      li.querySelector(".jd-profile-header__stat-label")!.textContent = s.label;
    });
  }
}
