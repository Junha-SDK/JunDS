/**
 * <jd-image-compare> — 종횡비 고정 before/after 비교 (v2 composites/ImageCompare)
 *   = **jd-compare-slider 파생**(§6 R12).
 *
 * v2에서 ImageCompare와 CompareSlider는 같은 위젯이었다. 드래그·클립·손잡이 로직은
 * 한 줄도 다르지 않고, 실제 차이는 넷뿐이다:
 *  (a) 컨테이너에 종횡비가 고정되고 이미지가 `object-fit: cover`다(사진 갤러리용),
 *  (b) 배경이 검정이라 로딩 중 흰 깜빡임이 없다,
 *  (c) 라벨을 끌 수 있다,
 *  (d) **좌우 대응이 반대**다 — 원형은 왼쪽(잘리는 쪽)이 beforeSrc인데 여기서는
 *      afterSrc다(v2 두 파일이 실제로 그랬다).
 * (d)만 코드가 필요하고 나머지는 CSS다. 좌우 대응은 원형의 protected 게터 6개를
 * 뒤집어 표현한다 — 원형의 배치 규약(왼쪽=잘리는 쪽)은 그대로 두고 소스만 바꿔 끼운다.
 * 프롭 이름(beforeSrc/afterSrc)은 원형에서 그대로 물려받는다.
 *
 * 키보드(←/→ step 2%p · PageUp/Down 10 · Home/End)는 v2 ImageCompare에도 있었고
 * 원형이 승계했다. 반대로 포인터 캡처·터치 가드·`aria-valuetext`는 원형에서 새로 온다.
 */
import { JdCompareSlider } from "../compare-slider/element.js";
import { adoptStyles } from "../../core/styles.js";
import imageCompareStyles from "./image-compare.css.js";

export class JdImageCompare extends JdCompareSlider {
  static override tag = "jd-image-compare";
  static override props = {
    ...JdCompareSlider.props,
    beforeAlt: { type: String },
    afterAlt: { type: String },
    /** CSS aspect-ratio 값. v2 기본 "16 / 9" */
    ratio: { type: String, default: "16 / 9" },
    label: { type: String, default: "비교 분할 위치" },
  };

  declare beforeAlt: string;
  declare afterAlt: string;
  declare ratio: string;

  /* 좌우 대응 뒤집기 — 왼쪽(잘리는 쪽)이 after다 */
  protected override get startSrc(): string {
    return this.afterSrc;
  }
  protected override get endSrc(): string {
    return this.beforeSrc;
  }
  protected override get startAlt(): string {
    return this.afterAlt || this.afterLabel;
  }
  protected override get endAlt(): string {
    return this.beforeAlt || this.beforeLabel;
  }
  protected override get startLabel(): string {
    return this.afterLabel;
  }
  protected override get endLabel(): string {
    return this.beforeLabel;
  }

  protected override render(): void {
    super.render();
    adoptStyles(imageCompareStyles);
    this.update();
  }

  protected override update(): void {
    super.update();
    // 종횡비는 CSS 값이라 토큰이 아니라 인라인 커스텀 프로퍼티로 흘린다
    if (this.ratio) this.style.setProperty("--_jd-image-compare-ratio", this.ratio);
    else this.style.removeProperty("--_jd-image-compare-ratio");
  }
}
