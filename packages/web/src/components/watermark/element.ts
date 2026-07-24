/**
 * <jd-watermark> — 반복 워터마크 오버레이 (v2 composites/Watermark).
 *
 * 타일은 v2와 같이 canvas로 굽는다(회전 텍스트의 폭은 measureText 없이 알 수 없다).
 * 다만 **굽는 시점이 다르다**: render()는 빈 레이어만 만들고, 측정·toDataURL은 전부
 * connected() 이후다 — 프리렌더 초기 렌더에서 브라우저 측정 API를 쓰지 않는다(§3.1-3,
 * jd-spotlight의 #measure 규율과 동형).
 *
 * v2 실측 버그 1건 + 개선 2건:
 *  1. **타일 배율이 절반이었다.** v2는 2×2 셀 크기의 캔버스에 문구를 4번 그려 놓고
 *     `backgroundSize`는 **1셀**로 줬다 — 이미지가 50%로 축소되어 지정한 fontSize의
 *     절반 크기 워터마크가 두 배로 촘촘하게 깔렸다. v3는 backgroundSize를 2셀로 고쳐
 *     fontSize가 실제 글자 크기가 되게 한다.
 *  2. **레티나에서 뭉갰다.** 1x 캔버스를 배경 이미지로 늘려 깔았다 → devicePixelRatio를
 *     반영해 굽는다(상한 3배 — 큰 gap에서 메모리 폭주 방지).
 *  3. **다크에서 보이지 않았다.** 기본색이 `rgba(0,0,0,0.08)` 리터럴이었다 → 기본색을
 *     CSS 변수 --jd-watermark-color로 두고 다크 테마에서 흰색 계열로 뒤집는다.
 *     `color` 프로퍼티를 주면 v2처럼 그 값이 그대로 쓰인다.
 *
 * 워터마크는 순수 장식이다 — aria-hidden + pointer-events:none + user-select:none.
 * (콘텐츠 보호 장치가 아니다. DOM은 지울 수 있다 — v2와 같은 성격의 표시 기능이다.)
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import watermarkStyles from "./watermark.css.js";

const DEFAULT_COLOR = "rgba(0, 0, 0, 0.08)";

export class JdWatermark extends JdElement {
  static override tag = "jd-watermark";
  static override props = {
    /** 워터마크 문구 */
    text: { type: String },
    /** 글자 크기(px). v2 기본 16 */
    fontSize: { type: Number, default: 16 },
    /** 글자 색. 빈 값이면 --jd-watermark-color (테마 대응) */
    color: { type: String },
    /** 회전 각도(deg). v2 기본 -22 */
    rotate: { type: Number, default: -22 },
    /** 패턴 간격(px). v2 기본 100 */
    gap: { type: Number, default: 100 },
  };

  declare text: string;
  declare fontSize: number;
  declare color: string;
  declare rotate: number;
  declare gap: number;

  #layer: HTMLDivElement | null = null;
  #live = false;

  protected render(): void {
    adoptStyles(watermarkStyles);
    // 입양 규칙(§3.3) — 레이어는 항상 마지막 자식
    let layer = this.querySelector<HTMLDivElement>(":scope > .jd-watermark__layer");
    if (!layer) {
      layer = document.createElement("div");
      layer.className = "jd-watermark__layer";
      layer.setAttribute("aria-hidden", "true");
      this.append(layer);
    }
    this.#layer = layer;
  }

  protected override connected(): void {
    this.#live = true;
    this.#paint();
  }

  protected override disconnected(): void {
    this.#live = false;
  }

  protected override update(): void {
    if (this.#live) this.#paint();
  }

  /** 타일을 다시 굽는다. 테마를 코드로 바꾼 뒤처럼 외부 요인이 바뀐 경우의 공개 진입점 */
  repaint(): void {
    if (this.#live) this.#paint();
  }

  #resolveColor(): string {
    const explicit = this.color.trim();
    if (explicit) return explicit;
    const view = this.ownerDocument.defaultView;
    const fromToken = view?.getComputedStyle(this).getPropertyValue("--jd-watermark-color").trim();
    return fromToken || DEFAULT_COLOR;
  }

  /** 측정·캔버스는 연결 이후에만 (§3.1-3) */
  #paint(): void {
    const layer = this.#layer;
    if (!layer) return;
    if (!this.text) {
      layer.style.removeProperty("background-image");
      layer.style.removeProperty("background-size");
      return;
    }
    const doc = this.ownerDocument;
    const canvas = doc.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return; // 캔버스 미지원 환경 — 워터마크만 비고 본문은 그대로

    const fontSize = this.fontSize > 0 ? this.fontSize : 16;
    const gap = this.gap >= 0 ? this.gap : 100;
    const font = `${fontSize}px sans-serif`; // v2와 같은 시스템 sans (웹폰트 대기 불필요)
    ctx.font = font;
    const cellW = ctx.measureText(this.text).width + gap;
    const cellH = fontSize * 1.2 + gap;

    const dpr = Math.min(3, Math.max(1, doc.defaultView?.devicePixelRatio ?? 1));
    canvas.width = Math.ceil(cellW * 2 * dpr);
    canvas.height = Math.ceil(cellH * 2 * dpr);

    ctx.scale(dpr, dpr);
    ctx.font = font; // 캔버스 크기 변경이 컨텍스트를 초기화한다 — 재지정 필수
    ctx.fillStyle = this.#resolveColor();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const rad = (this.rotate * Math.PI) / 180;
    const centers: Array<[number, number]> = [
      [cellW / 2, cellH / 2],
      [cellW * 1.5, cellH / 2],
      [cellW / 2, cellH * 1.5],
      [cellW * 1.5, cellH * 1.5],
    ];
    for (const [cx, cy] of centers) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rad);
      ctx.fillText(this.text, 0, 0);
      ctx.restore();
    }

    layer.style.backgroundImage = `url(${canvas.toDataURL()})`;
    // 캔버스는 2×2 셀이다 — v2는 여기에 1셀을 줘 타일이 절반으로 축소됐다
    layer.style.backgroundSize = `${cellW * 2}px ${cellH * 2}px`;
  }
}
