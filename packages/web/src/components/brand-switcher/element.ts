/**
 * <jd-brand-switcher> — 브랜드 프리셋 전환 UI (v2 composites/BrandSwitcher). chips | list | select.
 *
 * **데이터 소스 전환(핵심)**: v2는 `useBrand()` 컨텍스트에서 presets/현재 브랜드를 읽고
 *   `setBrand`가 곧 문서에 테마를 **적용**했다. web 패키지는 Provider를 토큰 시스템으로
 *   내부화했고(CoreProvider "done(내부화)", DEC-014-6) 런타임 의존성 0이라 컨텍스트가 없다.
 *   그래서 v3 BrandSwitcher는 **순수 선택 컨트롤**이다:
 *     · presets를 property(Array) 또는 자식 `<script type="application/json">`으로 받는다
 *       (jd-radio-group 선례, WEB-03 예외).
 *     · 현재 선택은 `value`(브랜드 id, reflect), 변경은 `jd-change` { value }로 알린다.
 *     · **테마 적용(applyBrand)은 하지 않는다** — :root 토큰을 바꾸는 것은 문서 전역 부작용이라
 *       앱/React 어댑터의 몫이다(§6.3 "컴포넌트는 데이터를 받기만" 원칙과 동형). 소비자는
 *       jd-change를 듣고 자기 방식으로 브랜드 토큰을 적용한다.
 *
 * v2 대비 접근성 교정: v2는 chips/list를 `role="radio"` **버튼**으로 만들어 화살표 순회가
 *   없었다(role만 있고 키보드 동작 없음). v3는 네이티브 radio input(시각 숨김)+`<label>` 칩으로
 *   바꿔 화살표 순회·단일 탭스톱·(폼 안에서) 값 제출을 브라우저 기본으로 얻는다
 *   (jd-radio-group가 roving Behavior 없이 네이티브 radio로 해결한 것과 같은 판단).
 *
 * 프리셋 항목: { id, label, tagline?, primary?, accent? } — v2 BrandPreset의 theme.primary/
 *   theme.accent 중첩도 관용적으로 받아준다(스와치 색). id 없는 항목은 버린다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import brandSwitcherStyles from "./brand-switcher.css.js";

export interface JdBrandPreset {
  id: string;
  label: string;
  tagline?: string;
  primary?: string;
  accent?: string;
}

const CLS = "jd-brand-switcher";

function normalize(v: unknown): JdBrandPreset[] {
  if (!Array.isArray(v)) return [];
  const out: JdBrandPreset[] = [];
  for (const raw of v) {
    const o = raw as Record<string, unknown>;
    const id = o.id != null ? String(o.id) : "";
    if (!id) continue;
    const theme = (o.theme as Record<string, unknown> | undefined) ?? {};
    const primary = (o.primary ?? theme.primary) as string | undefined;
    const accent = (o.accent ?? theme.accent) as string | undefined;
    out.push({
      id,
      label: o.label != null ? String(o.label) : id,
      tagline: o.tagline != null ? String(o.tagline) : undefined,
      primary: primary != null ? String(primary) : undefined,
      accent: accent != null ? String(accent) : undefined,
    });
  }
  return out;
}

export class JdBrandSwitcher extends JdElement {
  static override tag = "jd-brand-switcher";
  static override props = {
    variant: { type: String, default: "chips", reflect: true }, // chips | list | select
    value: { type: String, reflect: true }, // 현재 브랜드 id
    name: { type: String }, // radio 그룹 name (미지정 시 자동 발급)
    disabled: { type: Boolean, reflect: true },
    // presets(Array)는 property 전용(§1.3) — 아래 접근자로 선언
  };

  declare variant: string;
  declare value: string;
  declare name: string;
  declare disabled: boolean;

  #presets: JdBrandPreset[] = [];
  #dirty = false;
  #builtVariant: string | null = null;
  #groupName = "";
  #select: HTMLSelectElement | null = null;
  #inputs: HTMLInputElement[] = [];

  get presets(): JdBrandPreset[] {
    return this.#presets;
  }
  set presets(v: JdBrandPreset[]) {
    this.#presets = normalize(v);
    this.#dirty = true;
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(brandSwitcherStyles);
    // 선언적 초기화 슬롯(jd-radio-group 선례) — 1회 소비
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (script) {
      try {
        this.#presets = normalize(JSON.parse(script.textContent || "[]"));
      } catch {
        console.warn("[junds] <jd-brand-switcher> JSON 슬롯 파싱 실패 — 무시합니다.");
      }
      script.remove();
      this.#dirty = true;
      this.update();
      return;
    }
    // 프로퍼티로 이미 presets가 왔으면 그걸로 구축
    if (this.#presets.length > 0) {
      this.#dirty = true;
      this.update();
      return;
    }
    // SSR/프리렌더가 그린 골격이 있으면 입양(§3.3) — 데이터 없이 wipe 금지.
    // JSON 슬롯은 프리렌더에서 제거되므로, 방문자 render는 이 경로로 골격을 재사용한다.
    const built = this.querySelector(`:scope > .${CLS}__select, :scope > .${CLS}__item`);
    if (built) this.#adopt();
    else this.#dirty = true;
    this.update();
  }

  #adopt(): void {
    const sel = this.querySelector<HTMLSelectElement>(`:scope > .${CLS}__select`);
    if (sel) {
      this.#select = sel;
      this.#builtVariant = "select";
      this.#presets = Array.from(sel.options).map((o) => ({ id: o.value, label: o.text }));
    } else {
      this.setAttribute("role", "radiogroup");
      this.setAttribute("aria-label", "브랜드 선택");
      this.#inputs = Array.from(
        this.querySelectorAll<HTMLInputElement>(`:scope > .${CLS}__item > .${CLS}__input`),
      );
      this.#builtVariant = this.variant;
      this.#groupName = this.#inputs[0]?.name ?? "";
      this.#presets = this.#inputs.map((inp) => ({ id: inp.value, label: inp.value }));
    }
    this.#dirty = false;
  }

  protected override connected(): void {
    // 네이티브 radio change와 select change 모두 여기로 버블한다
    this.addEventListener("change", this.#onChange);
  }

  protected override disconnected(): void {
    this.removeEventListener("change", this.#onChange);
  }

  #onChange = (e: Event): void => {
    const t = e.target as HTMLElement;
    let v: string | null = null;
    if (t instanceof HTMLSelectElement && t.classList.contains(`${CLS}__select`)) {
      v = t.value;
    } else if (t instanceof HTMLInputElement && t.classList.contains(`${CLS}__input`)) {
      v = t.value;
    }
    if (v === null) return;
    this.value = v;
    this.emit("jd-change", { value: v });
  };

  #rebuild(): void {
    const doc = this.ownerDocument;
    this.textContent = "";
    this.#inputs = [];
    this.#select = null;

    if (this.variant === "select") {
      this.removeAttribute("role");
      this.removeAttribute("aria-label");
      const sel = doc.createElement("select");
      sel.className = `${CLS}__select`;
      sel.setAttribute("aria-label", "브랜드 선택");
      for (const p of this.#presets) {
        const opt = doc.createElement("option");
        opt.value = p.id;
        opt.textContent = p.label;
        sel.append(opt);
      }
      this.append(sel);
      this.#select = sel;
    } else {
      this.setAttribute("role", "radiogroup");
      this.setAttribute("aria-label", "브랜드 선택");
      if (!this.#groupName) this.#groupName = this.name || jdUid("jd-brand");
      const name = this.name || this.#groupName;
      for (const p of this.#presets) {
        const item = doc.createElement("label");
        item.className = `${CLS}__item`;

        const input = doc.createElement("input");
        input.type = "radio";
        input.className = `${CLS}__input`;
        input.name = name;
        input.value = p.id;

        const swatch = doc.createElement("span");
        swatch.className = `${CLS}__swatch`;
        swatch.setAttribute("aria-hidden", "true");
        swatch.style.setProperty("--jd-bs-primary", p.primary || "var(--jd-color-primary)");
        swatch.style.setProperty(
          "--jd-bs-accent",
          p.accent || p.primary || "var(--jd-color-accent)",
        );

        const label = doc.createElement("span");
        label.className = `${CLS}__label`;
        label.textContent = p.label;
        const text = doc.createElement("span");
        text.className = `${CLS}__text`;
        text.append(label);
        if (p.tagline) {
          const tagline = doc.createElement("span");
          tagline.className = `${CLS}__tagline`;
          tagline.textContent = p.tagline;
          text.append(tagline);
        }

        item.append(input, swatch, text);
        this.append(item);
        this.#inputs.push(input);
      }
    }
    this.#builtVariant = this.variant;
  }

  protected override update(): void {
    if (this.#dirty || this.#builtVariant !== this.variant) {
      this.#rebuild();
      this.#dirty = false;
    }
    if (this.#select) {
      this.#select.value = this.value;
      this.#select.disabled = this.disabled;
      return;
    }
    for (const input of this.#inputs) {
      input.checked = input.value === this.value;
      input.disabled = this.disabled;
    }
  }
}
