/**
 * <jd-photo-uploader> — 드래그·클릭 사진 추가 + 미리보기 그리드 (v2 composites/PhotoUploader).
 *
 * jd-file-upload를 상속하지 않은 이유: 기반은 "고른 파일을 그대로 통지"가 전부이고
 * 검사·통지 파이프라인이 private(#accept)이다. 여기서 필요한 것은 그 **앞뒤**다 —
 * 이미지 필터·개수 상한·미리보기 소유권. 상속하면 기반이 먼저 걸러지지 않은 파일로
 * jd-change를 쏘고 나서 우리가 뒤늦게 정정하는 모양이 된다(이벤트 계약이 거짓말을 한다).
 * 숨은 input + 드롭존이라는 **관용구만** 같은 모양으로 가져왔다.
 *
 * v2 대비 교정 5건:
 *  1. **미리보기가 사진을 추가할 때마다 깨졌다.** v2는 `useEffect(() => () =>
 *     photos.forEach(revokeObjectURL), [photos])`였다 — photos가 바뀌면 cleanup이
 *     **직전 배열**의 URL을 해제하는데, 그 URL들은 새 배열에도 그대로 살아 있는 것이라
 *     두 번째 사진을 넣는 순간 첫 사진 썸네일이 죽었다. v3는 **실제로 목록에서 빠진**
 *     URL만, 그것도 우리가 만든 것만 해제한다.
 *  2. **`<p>`가 `<button>` 안에 있었다** — 버튼의 콘텐츠 모델은 phrasing content라
 *     파서가 버튼을 조기 종료할 수 있는 무효 마크업이었다. span으로 바꿨다.
 *  3. **같은 파일을 다시 고를 수 없었다.** input.value를 비우지 않아 change가 안 났다.
 *  4. **오류가 조용히 나타났다.** 메시지에 role="alert"를 줘서 읽히게 하고, 드롭존은
 *     aria-describedby로 개수 안내·오류를 함께 읽는다.
 *  5. **비제어 사용이 불가능했다.** v2는 photos를 부모가 들고 있어야만 동작했다.
 *     v3는 스스로 목록을 갖고(비제어), `photos` 대입으로 제어 모드도 된다.
 *
 * File/Blob URL은 attribute로 표현할 수 없다 — 목록은 property, 결과는 이벤트다(§1.3).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import photoUploaderStyles from "./photo-uploader.css.js";

export interface JdPhotoPreview {
  id: string;
  file: File;
  url: string;
}

const REMOVE_SVG =
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" ` +
  `aria-hidden="true" focusable="false">` +
  `<path stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/></svg>`;

export class JdPhotoUploader extends JdElement {
  static override tag = "jd-photo-uploader";
  static override props = {
    /** 최대 장수 (v2 maxCount) */
    maxCount: { type: Number, default: 9 },
    /** 파일당 최대 바이트. NaN = 제한 없음 (jd-file-upload 선례) */
    maxSize: { type: Number, default: NaN },
    accept: { type: String, default: "image/*" },
    disabled: { type: Boolean, reflect: true },
    description: { type: String, default: "사진을 드래그하거나 클릭해서 추가" },
    name: { type: String },
    /** 최근 거부 사유 — 내부에서 설정, CSS 훅 겸용 */
    error: { type: String, reflect: true },
  };

  declare maxCount: number;
  declare maxSize: number;
  declare accept: string;
  declare disabled: boolean;
  declare description: string;
  declare name: string;
  declare error: string;

  #zone!: HTMLButtonElement;
  #desc!: HTMLElement;
  #count!: HTMLElement;
  #errorEl!: HTMLElement;
  #grid!: HTMLElement;
  #input!: HTMLInputElement;

  #photos: JdPhotoPreview[] = [];
  /** 우리가 createObjectURL로 만든 것만 해제한다 — 소비자가 준 url은 건드리지 않는다 */
  #owned = new Set<string>();
  #sweep: ReturnType<typeof setTimeout> | undefined;

  get photos(): JdPhotoPreview[] {
    return this.#photos;
  }
  set photos(v: JdPhotoPreview[]) {
    const next = Array.isArray(v) ? v : [];
    this.#revokeMissing(next);
    this.#photos = next;
    this.requestUpdate();
  }

  /* ── 골격 ────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(photoUploaderStyles);
    const existing = this.querySelector<HTMLButtonElement>(":scope > button.jd-photo-uploader__zone");
    if (existing) {
      this.#zone = existing;
      this.#desc = this.querySelector(".jd-photo-uploader__desc")!;
      this.#count = this.querySelector(".jd-photo-uploader__count")!;
      this.#errorEl = this.querySelector(".jd-photo-uploader__error")!;
      this.#grid = this.querySelector(".jd-photo-uploader__grid")!;
      this.#input = this.querySelector(".jd-photo-uploader__input")!;
    } else {
      this.#build();
    }
    // 드롭존은 개수 안내와 오류를 함께 읽는다 (v2는 둘 다 연결이 없었다)
    if (!this.#count.id) this.#count.id = jdUid("jd-pu-count");
    if (!this.#errorEl.id) this.#errorEl.id = jdUid("jd-pu-error");
    this.#zone.setAttribute("aria-describedby", `${this.#count.id} ${this.#errorEl.id}`);
    this.update();
  }

  #build(): void {
    this.#zone = document.createElement("button");
    this.#zone.type = "button";
    this.#zone.className = "jd-photo-uploader__zone";
    // button의 콘텐츠 모델은 phrasing content다 — v2의 <p>는 무효 마크업이었다
    this.#desc = document.createElement("span");
    this.#desc.className = "jd-photo-uploader__desc";
    this.#count = document.createElement("span");
    this.#count.className = "jd-photo-uploader__count";
    this.#zone.append(this.#desc, this.#count);

    this.#errorEl = document.createElement("p");
    this.#errorEl.className = "jd-photo-uploader__error";
    this.#errorEl.setAttribute("role", "alert");

    this.#grid = document.createElement("div");
    this.#grid.className = "jd-photo-uploader__grid";

    this.#input = document.createElement("input");
    this.#input.type = "file";
    this.#input.className = "jd-photo-uploader__input";
    this.#input.multiple = true;
    this.#input.tabIndex = -1;
    this.#input.setAttribute("aria-label", "사진 파일 선택");

    this.append(this.#zone, this.#errorEl, this.#grid, this.#input);
  }

  protected override connected(): void {
    this.#zone.addEventListener("click", this.#onOpen);
    this.#zone.addEventListener("dragover", this.#onDragOver);
    this.#zone.addEventListener("dragleave", this.#onDragLeave);
    this.#zone.addEventListener("drop", this.#onDrop);
    this.#input.addEventListener("change", this.#onPick);
    this.#grid.addEventListener("click", this.#onGridClick);
    if (this.#sweep) {
      clearTimeout(this.#sweep); // 이동(remove→append)이었다 — 해제하지 않는다
      this.#sweep = undefined;
    }
  }

  protected override disconnected(): void {
    this.#zone.removeEventListener("click", this.#onOpen);
    this.#zone.removeEventListener("dragover", this.#onDragOver);
    this.#zone.removeEventListener("dragleave", this.#onDragLeave);
    this.#zone.removeEventListener("drop", this.#onDrop);
    this.#input.removeEventListener("change", this.#onPick);
    this.#grid.removeEventListener("click", this.#onGridClick);
    // DOM 이동도 disconnected를 부른다 — 한 태스크 뒤에도 끊겨 있을 때만 해제한다
    if (this.#sweep) clearTimeout(this.#sweep);
    this.#sweep = setTimeout(() => {
      this.#sweep = undefined;
      if (!this.isConnected) this.#revokeAll();
    }, 0);
  }

  /* ── 수집 ────────────────────────────────────────────────── */

  #onOpen = (): void => {
    if (!this.disabled) this.#input.click();
  };

  #onDragOver = (e: DragEvent): void => {
    e.preventDefault(); // 기본 동작(파일 열기)을 막아야 drop이 온다
    if (!this.disabled) this.#zone.toggleAttribute("data-drag", true);
  };

  #onDragLeave = (): void => {
    this.#zone.toggleAttribute("data-drag", false);
  };

  #onDrop = (e: DragEvent): void => {
    e.preventDefault();
    this.#zone.toggleAttribute("data-drag", false);
    if (this.disabled) return;
    this.#ingest(e.dataTransfer?.files ?? null);
  };

  #onPick = (): void => {
    this.#ingest(this.#input.files);
    // 같은 파일을 다시 고를 수 있게 비운다 — v2는 두 번째 선택이 무시됐다
    this.#input.value = "";
  };

  #onGridClick = (e: Event): void => {
    const btn = (e.target as Element | null)?.closest<HTMLButtonElement>(".jd-photo-uploader__remove");
    const id = btn?.dataset.id;
    if (id) this.removePhoto(id);
  };

  /** v2 ingest 동형 — 이미지만·크기 초과면 전량 거부·상한까지만 수용 */
  #ingest(list: FileList | null): void {
    if (!list || list.length === 0) return;
    const images = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return this.#reject("type", "이미지 파일만 업로드 가능합니다");

    if (!Number.isNaN(this.maxSize)) {
      const oversize = images.filter((f) => f.size > this.maxSize);
      if (oversize.length > 0) {
        const mb = (this.maxSize / 1024 / 1024).toFixed(0);
        return this.#reject("max-size", `${mb}MB를 초과한 파일이 있습니다`, { files: oversize });
      }
    }

    const remaining = Math.max(0, this.maxCount - this.#photos.length);
    const accepted = images.slice(0, remaining);
    if (accepted.length === 0) {
      return this.#reject("max-count", `최대 ${this.maxCount}장까지 업로드할 수 있습니다`);
    }

    this.error = "";
    const added = accepted.map((file) => {
      const url = URL.createObjectURL(file);
      this.#owned.add(url);
      // id는 jdUid — Date.now()는 같은 밀리초 안에서 충돌하고 결정적이지도 않다
      return { id: jdUid("jd-photo"), file, url };
    });
    this.#photos = [...this.#photos, ...added];
    this.requestUpdate();
    // 상한에 걸려 버려진 장수를 함께 알린다 — v2는 조용히 잘랐다
    this.emit("jd-add", { photos: added, skipped: images.length - accepted.length });
    this.emit("jd-change", { photos: this.#photos });
  }

  #reject(reason: string, message: string, extra?: Record<string, unknown>): void {
    this.error = message;
    this.emit("jd-error", { reason, message, ...extra });
  }

  /* ── 제거 ────────────────────────────────────────────────── */

  /**
   * 한 장 제거. 우리가 만든 URL이면 함께 해제한다.
   * 이름이 `remove`가 아닌 이유: `Element.prototype.remove()`를 덮으면
   * `el.remove()`(문서에서 제거)가 사라진다 — CE는 호스트가 곧 요소다.
   */
  removePhoto(id: string): void {
    const photo = this.#photos.find((p) => p.id === id);
    if (!photo) return;
    this.#photos = this.#photos.filter((p) => p.id !== id);
    this.#revoke(photo.url);
    this.error = "";
    this.requestUpdate();
    this.emit("jd-remove", { id, photo });
    this.emit("jd-change", { photos: this.#photos });
  }

  #revoke(url: string): void {
    if (!this.#owned.delete(url)) return;
    URL.revokeObjectURL(url);
  }

  #revokeMissing(next: JdPhotoPreview[]): void {
    const keep = new Set(next.map((p) => p.url));
    for (const url of [...this.#owned]) if (!keep.has(url)) this.#revoke(url);
  }

  #revokeAll(): void {
    for (const url of [...this.#owned]) this.#revoke(url);
  }

  /* ── 반영 ────────────────────────────────────────────────── */

  protected override update(): void {
    const count = this.#photos.length;
    const max = Math.max(0, Math.round(this.maxCount));

    this.#input.accept = this.accept;
    this.#input.disabled = this.disabled;
    if (this.name) this.#input.name = this.name;
    else this.#input.removeAttribute("name");

    // 가득 차도 버튼은 살려 둔다 — 눌렀을 때 "최대 N장" 안내가 나가는 것이 v2 동형이고,
    // 비활성 버튼은 이유를 말해 주지 못한다
    this.#zone.disabled = this.disabled;
    this.#zone.toggleAttribute("data-full", count >= max);
    this.#desc.textContent = this.description;
    this.#count.textContent = `최대 ${max}장 · ${count}/${max}`;

    this.#errorEl.textContent = this.error;
    this.#errorEl.hidden = !this.error;

    // 개수가 다를 때만 골격을 다시 만든다(§3.3) — 같으면 내용만 맞춘다
    if (this.#grid.childElementCount !== count) {
      this.#grid.textContent = "";
      for (let i = 0; i < count; i++) this.#grid.append(this.#buildItem());
    }
    this.#grid.hidden = count === 0;
    Array.from(this.#grid.children).forEach((node, i) => {
      const photo = this.#photos[i];
      if (!photo) return;
      const item = node as HTMLElement;
      const img = item.querySelector<HTMLImageElement>(".jd-photo-uploader__thumb")!;
      const btn = item.querySelector<HTMLButtonElement>(".jd-photo-uploader__remove")!;
      item.dataset.id = photo.id;
      if (img.src !== photo.url) img.src = photo.url;
      img.alt = photo.file?.name ?? "";
      btn.dataset.id = photo.id;
      btn.setAttribute("aria-label", `${photo.file?.name ?? "사진"} 제거`);
      btn.disabled = this.disabled;
    });
  }

  #buildItem(): HTMLElement {
    const item = document.createElement("div");
    item.className = "jd-photo-uploader__item";
    const img = document.createElement("img");
    img.className = "jd-photo-uploader__thumb";
    img.decoding = "async";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "jd-photo-uploader__remove";
    btn.innerHTML = REMOVE_SVG;
    item.append(img, btn);
    return item;
  }
}
