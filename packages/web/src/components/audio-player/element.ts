/**
 * <jd-audio-player> — 오디오 트랜스포트 (v2 composites/AudioPlayer)이자
 * <jd-video-player>의 **원형**(§6 R12).
 *
 * v2는 AudioPlayer와 VideoPlayer가 같은 트랜스포트(재생 토글·timeupdate 진행률·
 * 시킹·m:ss 포맷)를 두 벌 갖고 있었다 — 두 파일의 `fmt`·`handleSeek`·`togglePlay`가
 * 글자까지 같다. v3는 그 전부를 이 원형이 갖고, 파생은 **미디어 요소 종류와 스킨만**
 * 재정의한다(jd-modal → jd-drawer와 같은 축).
 *
 * v2 대비 실질 개선 4건:
 *  1. **시크바가 네이티브 input[type=range]다**(§1.6-1 네이티브 위임). v2는 `div`에
 *     onClick 하나였다 — 키보드로 위치를 못 옮기고(탭 대상조차 아니다), 드래그도 안 되며,
 *     AT에는 진행률이 전혀 노출되지 않았다. 네이티브 위임으로 키보드·드래그·
 *     aria-valuenow가 한 번에 붙고, 채움은 트랙 그라디언트 %로 시각 패리티를 지킨다.
 *  2. **재생 상태의 단일 정본이 미디어 요소다.** v2는 `setPlaying`을 클릭 핸들러에서
 *     직접 불러, 자동재생 정책 거부·외부 API 조작·재생 끝 이후 되감기에서 아이콘이
 *     실제 상태와 어긋났다. v3는 play/pause/ended 이벤트만 듣는다.
 *  3. **총 길이가 재생 전에도 보인다** — preload 기본 metadata. 또 duration이 NaN인
 *     구간(메타데이터 도착 전·스트리밍)에서 v2는 `NaN:NaN`을 그렸다.
 *  4. **자식이 미디어 슬롯이다** — `<source>`·`<track>`(자막)·폴백 텍스트를 호스트
 *     children으로 주면 미디어 요소 안으로 이동한다. v2는 src 문자열 하나뿐이었다.
 *
 * 이벤트(§1.5): 미디어 네이티브 play/pause/ended는 **버블하지 않아** 호스트 밖에서
 * 들을 수 없다 — 그래서 jd-play · jd-pause · jd-ended(사후, 취소 불가)를 덧발행한다.
 * 시킹은 드래그 중 jd-input({currentTime}) · 확정 시 jd-change({currentTime}).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { on } from "../../behaviors/input.js";
import audioPlayerStyles from "./audio-player.css.js";

/**
 * CE 안에서 SVG를 만드는 유일하게 안전한 방법은 innerHTML 재파싱이다 —
 * createElement("path")는 HTML 네임스페이스라 아무것도 그려지지 않는다(DEC-030-1).
 */
const TRANSPORT_ICONS =
  `<svg class="jd-audio-player__icon jd-audio-player__icon--play" width="14" height="14" ` +
  `viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><path d="M4 2l8 5-8 5z"/></svg>` +
  `<svg class="jd-audio-player__icon jd-audio-player__icon--pause" width="14" height="14" ` +
  `viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">` +
  `<rect x="3" y="2" width="3" height="10" rx="1"/><rect x="8" y="2" width="3" height="10" rx="1"/></svg>`;

/** 초 → `m:ss`. 미확정(NaN·Infinity·음수)은 0:00 — v2는 `NaN:NaN`을 그대로 그렸다. */
export function formatMediaTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export class JdAudioPlayer extends JdElement {
  static override tag = "jd-audio-player";
  static override props = {
    src: { type: String },
    /** 트랙 제목. 비어 있으면 제목 줄이 사라진다(v2 동형) */
    title: { type: String },
    /** 브라우저 자동재생 정책상 muted 없이는 대개 거부된다 — 거부돼도 상태는 어긋나지 않는다 */
    autoplay: { type: Boolean, reflect: true },
    loop: { type: Boolean, reflect: true },
    muted: { type: Boolean, reflect: true },
    /** none | metadata | auto. 기본 metadata — 재생 전에 총 길이를 보여주기 위함 */
    preload: { type: String, default: "metadata" },
    playLabel: { type: String, default: "재생" },
    pauseLabel: { type: String, default: "일시정지" },
    seekLabel: { type: String, default: "탐색" },
  };

  declare src: string;
  declare title: string;
  declare autoplay: boolean;
  declare loop: boolean;
  declare muted: boolean;
  declare preload: string;
  declare playLabel: string;
  declare pauseLabel: string;
  declare seekLabel: string;

  /* 파생(jd-video-player)이 접근하는 골격 — private(#) 대신 protected */
  protected media!: HTMLMediaElement;
  protected controls!: HTMLElement;
  protected toggleBtn!: HTMLButtonElement;
  protected bodyEl!: HTMLElement;
  protected titleEl!: HTMLElement;
  protected transport!: HTMLElement;
  protected seekInput!: HTMLInputElement;
  protected currentEl!: HTMLElement;
  protected durationEl!: HTMLElement;
  protected offs: Array<() => void> = [];

  #playing = false;
  #scrubbing = false;
  #ownLabel = false;

  /** 파생이 <video>로 바꾸는 지점 */
  protected createMedia(): HTMLMediaElement {
    return this.ownerDocument.createElement("audio");
  }

  /** 제목이 없을 때의 접근 이름 */
  protected get defaultLabel(): string {
    return "오디오 플레이어";
  }

  /* ── 골격 ────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(audioPlayerStyles);
    // 소비자가 직접 준 aria-label은 절대 덮지 않는다(1회 판정)
    this.#ownLabel = this.hasAttribute("aria-label");
    const media = this.querySelector<HTMLMediaElement>(":scope > .jd-audio-player__media");
    const controls = this.querySelector<HTMLElement>(":scope > .jd-audio-player__controls");
    if (media && controls) {
      // 입양 규칙(§3.3) — 프리렌더/SSR 골격 위에서는 재구축하지 않는다
      this.media = media;
      this.controls = controls;
      this.toggleBtn = controls.querySelector<HTMLButtonElement>(".jd-audio-player__toggle")!;
      this.bodyEl = controls.querySelector<HTMLElement>(".jd-audio-player__body")!;
      this.titleEl = controls.querySelector<HTMLElement>(".jd-audio-player__title")!;
      this.transport = controls.querySelector<HTMLElement>(".jd-audio-player__transport")!;
      this.currentEl = controls.querySelector<HTMLElement>(".jd-audio-player__time--current")!;
      this.seekInput = controls.querySelector<HTMLInputElement>(".jd-audio-player__seek")!;
      this.durationEl = controls.querySelector<HTMLElement>(".jd-audio-player__time--duration")!;
    } else {
      this.buildSkeleton();
    }
    if (!this.hasAttribute("role")) this.setAttribute("role", "group");
    this.update();
  }

  protected buildSkeleton(): void {
    const doc = this.ownerDocument;
    // children은 미디어 슬롯이다 — <source>·<track>·폴백 텍스트가 여기 들어온다
    const slotted = Array.from(this.childNodes);

    this.media = this.createMedia();
    this.media.className = "jd-audio-player__media";
    if (slotted.length) this.media.append(...slotted);

    this.toggleBtn = doc.createElement("button");
    this.toggleBtn.type = "button";
    this.toggleBtn.className = "jd-audio-player__toggle";
    this.toggleBtn.innerHTML = TRANSPORT_ICONS;

    this.titleEl = doc.createElement("p");
    this.titleEl.className = "jd-audio-player__title";

    this.currentEl = doc.createElement("span");
    this.currentEl.className = "jd-audio-player__time jd-audio-player__time--current";
    this.durationEl = doc.createElement("span");
    this.durationEl.className = "jd-audio-player__time jd-audio-player__time--duration";

    this.seekInput = doc.createElement("input");
    this.seekInput.type = "range";
    this.seekInput.className = "jd-audio-player__seek";
    this.seekInput.min = "0";
    this.seekInput.max = "0";
    this.seekInput.step = "any";
    this.seekInput.value = "0";

    this.transport = doc.createElement("div");
    this.transport.className = "jd-audio-player__transport";
    this.transport.append(this.currentEl, this.seekInput, this.durationEl);

    this.bodyEl = doc.createElement("div");
    this.bodyEl.className = "jd-audio-player__body";
    this.bodyEl.append(this.titleEl, this.transport);

    this.controls = doc.createElement("div");
    this.controls.className = "jd-audio-player__controls";
    this.controls.append(this.toggleBtn, this.bodyEl);

    this.append(this.media, this.controls);
  }

  /* ── 수명주기 ─────────────────────────────────────────────── */

  protected override connected(): void {
    this.offs.push(
      on(this.media, "loadedmetadata", this.#onMeta),
      on(this.media, "durationchange", this.#onMeta),
      on(this.media, "timeupdate", this.#onMeta),
      on(this.media, "seeked", this.#onMeta),
      on(this.media, "play", this.#onPlay),
      on(this.media, "pause", this.#onPause),
      on(this.media, "ended", this.#onEnded),
      on(this.media, "volumechange", this.#onVolume),
      on(this.toggleBtn, "click", this.#onToggleClick),
      on(this.seekInput, "input", this.#onSeekInput),
      on(this.seekInput, "change", this.#onSeekChange),
      on(this.seekInput, "pointerdown", this.#onScrubStart),
      on(this.seekInput, "pointerup", this.#onScrubEnd),
      on(this.seekInput, "pointercancel", this.#onScrubEnd),
    );
    this.syncTransport();
  }

  protected override disconnected(): void {
    for (const off of this.offs) off();
    this.offs = [];
    this.#scrubbing = false;
  }

  protected override update(): void {
    const m = this.media;
    // src는 **달라졌을 때만** 쓴다 — 매번 쓰면 재생 중인 미디어가 되감긴다
    if (this.src) {
      if (m.getAttribute("src") !== this.src) m.setAttribute("src", this.src);
    } else if (m.hasAttribute("src")) {
      m.removeAttribute("src"); // 빈 문자열을 넣으면 페이지 URL로 해석된다
    }
    m.loop = this.loop;
    m.autoplay = this.autoplay;
    if (m.muted !== this.muted) m.muted = this.muted;
    m.preload = this.preload as HTMLMediaElement["preload"];

    this.titleEl.textContent = this.title;
    this.titleEl.hidden = !this.title;
    this.seekInput.setAttribute("aria-label", this.seekLabel);
    this.toggleBtn.setAttribute("aria-label", this.#playing ? this.pauseLabel : this.playLabel);
    if (!this.#ownLabel) this.setAttribute("aria-label", this.title || this.defaultLabel);
    this.syncTransport();
  }

  /* ── 트랜스포트 ───────────────────────────────────────────── */

  /** 시간·진행률 반영. 이벤트 경로가 직접 부른다(update() 전량 재실행 없이) */
  protected syncTransport(): void {
    const m = this.media;
    if (!m) return;
    const duration = Number.isFinite(m.duration) ? Math.max(0, m.duration) : 0;
    const current = Number.isFinite(m.currentTime) ? Math.max(0, m.currentTime) : 0;
    this.currentEl.textContent = formatMediaTime(current);
    this.durationEl.textContent = formatMediaTime(duration);
    this.seekInput.max = String(duration);
    // 길이를 모르는 동안 시크바는 조작 대상이 아니다(라이브 스트림 포함)
    this.seekInput.disabled = duration <= 0;
    if (!this.#scrubbing) this.seekInput.value = String(Math.min(current, duration));
    this.seekInput.setAttribute(
      "aria-valuetext",
      `${formatMediaTime(current)} / ${formatMediaTime(duration)}`,
    );
    this.#paintProgress(current, duration);
  }

  #paintProgress(current: number, duration: number): void {
    const pct = duration > 0 ? Math.max(0, Math.min(100, (current / duration) * 100)) : 0;
    this.style.setProperty("--_jd-audio-pct", `${pct}%`);
  }

  #setPlaying(next: boolean): void {
    if (this.#playing === next) return;
    this.#playing = next;
    this.toggleAttribute("data-playing", next);
    this.toggleBtn.setAttribute("aria-label", next ? this.pauseLabel : this.playLabel);
  }

  /* ── 공개 표면 ────────────────────────────────────────────── */

  get playing(): boolean {
    return this.#playing;
  }

  get duration(): number {
    const d = this.media?.duration ?? 0;
    return Number.isFinite(d) ? d : 0;
  }

  get currentTime(): number {
    const t = this.media?.currentTime ?? 0;
    return Number.isFinite(t) ? t : 0;
  }

  set currentTime(v: number) {
    if (this.media && Number.isFinite(v)) this.media.currentTime = Math.max(0, v);
  }

  /** 재생. 자동재생 정책 거부는 삼킨다 — 아이콘은 play 이벤트가 오지 않으므로 그대로다 */
  play(): void {
    const p = this.media?.play() as Promise<void> | undefined;
    if (p && typeof p.catch === "function") p.catch(() => undefined);
  }

  pause(): void {
    this.media?.pause();
  }

  toggle(): void {
    if (!this.media) return;
    if (this.media.paused) this.play();
    else this.pause();
  }

  override focus(options?: FocusOptions): void {
    this.toggleBtn?.focus(options);
  }

  /* ── 핸들러 ──────────────────────────────────────────────── */

  #onMeta = (): void => {
    this.syncTransport();
  };

  #onPlay = (): void => {
    this.#setPlaying(true);
    this.emit("jd-play", { currentTime: this.currentTime });
  };

  #onPause = (): void => {
    this.#setPlaying(false);
    this.emit("jd-pause", { currentTime: this.currentTime });
  };

  #onEnded = (): void => {
    this.#setPlaying(false);
    this.emit("jd-ended");
  };

  #onVolume = (): void => {
    this.toggleAttribute("data-muted", this.media.muted);
  };

  #onToggleClick = (): void => {
    this.toggle();
  };

  #onScrubStart = (): void => {
    this.#scrubbing = true;
  };

  #onScrubEnd = (): void => {
    this.#scrubbing = false;
  };

  #onSeekInput = (): void => {
    const t = Number(this.seekInput.value);
    if (!Number.isFinite(t)) return;
    this.media.currentTime = t;
    // 미디어의 seeked를 기다리지 않고 즉시 그린다 — 드래그가 끈적하게 느껴지지 않도록
    this.currentEl.textContent = formatMediaTime(t);
    this.#paintProgress(t, this.duration);
    this.emit("jd-input", { currentTime: t });
  };

  #onSeekChange = (): void => {
    this.#scrubbing = false;
    this.emit("jd-change", { currentTime: this.currentTime });
  };
}
