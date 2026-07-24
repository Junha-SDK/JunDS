/**
 * <jd-video-player> — 커스텀 컨트롤 비디오 (v2 composites/VideoPlayer)
 *   = **jd-audio-player 파생**(§6 R12).
 *
 * v2 두 파일의 트랜스포트는 글자까지 같았다(togglePlay·handleTimeUpdate·handleSeek·fmt).
 * 여기서 새로 정의하는 것은 셋뿐이다: (a) 미디어 요소가 <video>다, (b) 음소거 버튼이
 * 붙는다, (c) 컨트롤이 영상 위에 뜬다(스킨). 골격 클래스명은 원형의 것을 그대로 쓴다 —
 * jd-drawer가 `.jd-modal__panel`을 쓰는 것과 같은 규약이다.
 *
 * v2 대비 실질 개선 4건(원형에서 오는 시크바 네이티브 위임·상태 정본화 외에):
 *  1. **터치 기기에서 컨트롤에 닿을 수 있다.** v2는 `opacity-0 group-hover:opacity-100`
 *     뿐이라 호버가 없는 기기에서는 재생 버튼조차 영영 나타나지 않았다(영상 탭으로만
 *     재생/정지 가능). v3는 `@media (hover: none)`에서 상시 노출하고, 키보드 포커스가
 *     들어와도(`:focus-within`) 나타난다 — v2에서는 탭으로 도달한 버튼이 **보이지 않았다**.
 *  2. **음소거 상태의 정본도 미디어 요소다.** v2는 `muted` state와 `<video muted>`를
 *     따로 굴려 외부에서 볼륨을 바꾸면 아이콘이 어긋났다. v3는 volumechange만 듣는다.
 *  3. **iOS 인라인 재생** — `playsinline`. 없으면 iPhone Safari가 전체화면 플레이어를
 *     띄워 커스텀 컨트롤이 통째로 무의미해진다.
 *  4. **영상 클릭 토글에 접근성 등가물이 있다** — 재생 버튼이 항상 도달 가능한 탭
 *     스톱이며, 영상 자체는 `aria-hidden`이 아니라 그룹 안의 미디어로 남는다.
 */
import { JdAudioPlayer } from "../audio-player/element.js";
import { adoptStyles } from "../../core/styles.js";
import { on } from "../../behaviors/input.js";
import videoPlayerStyles from "./video-player.css.js";

/** DEC-030-1: SVG는 innerHTML 재파싱만이 SVG 네임스페이스를 만든다 */
const MUTE_ICONS =
  `<svg class="jd-video-player__icon jd-video-player__icon--sound" width="16" height="16" ` +
  `viewBox="0 0 16 16" fill="none" aria-hidden="true">` +
  `<path d="M2 6h3l4-3v10l-4-3H2V6z" stroke="currentColor" stroke-width="1.5"/>` +
  `<path d="M12 5.5c1 1 1 4 0 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>` +
  `<svg class="jd-video-player__icon jd-video-player__icon--muted" width="16" height="16" ` +
  `viewBox="0 0 16 16" fill="none" aria-hidden="true">` +
  `<path d="M2 6h3l4-3v10l-4-3H2V6z" stroke="currentColor" stroke-width="1.5"/>` +
  `<path d="M12 5l-4 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

export class JdVideoPlayer extends JdAudioPlayer {
  static override tag = "jd-video-player";
  static override props = {
    ...JdAudioPlayer.props,
    /** 포스터 이미지 URL */
    poster: { type: String },
    muteLabel: { type: String, default: "음소거" },
    unmuteLabel: { type: String, default: "음소거 해제" },
  };

  declare poster: string;
  declare muteLabel: string;
  declare unmuteLabel: string;

  #muteBtn: HTMLButtonElement | null = null;

  protected override createMedia(): HTMLMediaElement {
    return this.ownerDocument.createElement("video");
  }

  protected override get defaultLabel(): string {
    return "비디오 플레이어";
  }

  protected override render(): void {
    super.render(); // 미디어 + 컨트롤(토글·제목·시크·시간) 구축 또는 입양
    adoptStyles(videoPlayerStyles);
    // iOS Safari 전체화면 강제 회피 — 없으면 커스텀 컨트롤이 무의미해진다
    this.media.setAttribute("playsinline", "");
    this.#mountMute();
    this.update();
  }

  /** 음소거 버튼은 컨트롤 줄 맨 끝(v2 `ml-auto`) */
  #mountMute(): void {
    const existing = this.controls.querySelector<HTMLButtonElement>(".jd-video-player__mute");
    if (existing) {
      this.#muteBtn = existing;
      return;
    }
    const btn = this.ownerDocument.createElement("button");
    btn.type = "button";
    btn.className = "jd-video-player__mute";
    btn.innerHTML = MUTE_ICONS;
    this.controls.append(btn);
    this.#muteBtn = btn;
  }

  protected override connected(): void {
    super.connected();
    this.offs.push(
      on(this.media, "click", this.#onMediaClick),
      on(this.media, "volumechange", this.#onVolumeLabel),
    );
    if (this.#muteBtn) this.offs.push(on(this.#muteBtn, "click", this.#onMuteClick));
    this.#onVolumeLabel();
  }

  protected override update(): void {
    super.update();
    const video = this.media;
    // IDL 프로퍼티가 아니라 attribute로 쓴다 — src와 같은 규율이고, video가 아닌
    // 요소로 입양된 골격에서도 안전하다
    if (this.poster) {
      if (video.getAttribute("poster") !== this.poster) video.setAttribute("poster", this.poster);
    } else {
      video.removeAttribute("poster");
    }
    this.#onVolumeLabel();
  }

  /** 음소거 토글 — 정본은 미디어 요소, 프로퍼티는 그 결과를 따라간다 */
  toggleMute(): void {
    if (!this.media) return;
    this.muted = !this.media.muted;
  }

  #onMuteClick = (): void => {
    this.toggleMute();
  };

  #onMediaClick = (): void => {
    this.toggle();
  };

  /** 아이콘 교체는 원형이 다는 [data-muted]가 하고, 여기서는 접근 이름만 맞춘다 */
  #onVolumeLabel = (): void => {
    if (!this.#muteBtn || !this.media) return;
    this.#muteBtn.setAttribute("aria-label", this.media.muted ? this.unmuteLabel : this.muteLabel);
    this.#muteBtn.setAttribute("aria-pressed", String(this.media.muted));
  };
}
