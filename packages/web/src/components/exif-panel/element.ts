/**
 * <jd-exif-panel> — 카메라·렌즈·노출 메타 표시 (v2 composites/ExifPanel)
 * = **jd-descriptions 파생**(§6 R12 · jd-key-value-grid 선례).
 *
 * v2 ExifPanel은 `<dl>` + `contents` 래퍼로 키-값 목록을 손으로 그렸다. 그 관용구의
 * 정본이 이미 jd-descriptions(dl/dt/dd + 그리드 자동 배치 + 제목의 aria-labelledby)라
 * 여기서는 **EXIF → 항목 배열 변환**과 compact 스킨만 더한다. 골격·동기화·입양은 전부
 * 기반 몫이다.
 *
 * v2 대비 교정 3건:
 *  1. **compact가 dl이 아니었다.** v2 compact는 `<div>` 안에 `<span>`만 늘어놔
 *     "설명 목록"이라는 의미가 사라졌다(같은 데이터가 모드에 따라 다르게 읽혔다).
 *     v3는 두 모드가 같은 dl이고 compact는 **레이아웃만** 바꾼다.
 *  2. **로케일이 못 박혀 있었다.** `Intl.DateTimeFormat("ko", …)` 하드코딩 → `locale` 프롭.
 *  3. **잘못된 날짜가 "Invalid Date"로 새어 나갔다.** 파싱 실패면 행 자체를 뺀다.
 *
 * 데이터 입력 2경로(§1.3): `data` 프로퍼티(객체) 또는 자식
 * `<script type="application/json">{…}</script>` 슬롯. 기반의 슬롯은 **배열**(항목)이라
 * 의미가 다르므로 super.render() 전에 우리가 먼저 소비한다(jd-action-sheet 선례).
 */
import { JdDescriptions, type JdDescriptionItem } from "../descriptions/element.js";
import { adoptStyles } from "../../core/styles.js";
import exifPanelStyles from "./exif-panel.css.js";

export interface JdExifData {
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutter?: string;
  iso?: number;
  takenAt?: string | Date;
  location?: string;
  /** 임의 추가 키 — 라벨은 키 그대로 */
  extra?: Record<string, string | number>;
}

/** v2 rows 순서·라벨 그대로 */
const FIELDS: {
  key: string;
  label: string;
  pick: (d: JdExifData) => string | number | undefined;
}[] = [
  { key: "camera", label: "카메라", pick: (d) => d.camera },
  { key: "lens", label: "렌즈", pick: (d) => d.lens },
  { key: "focal-length", label: "초점거리", pick: (d) => d.focalLength },
  { key: "aperture", label: "조리개", pick: (d) => d.aperture },
  { key: "shutter", label: "셔터", pick: (d) => d.shutter },
  { key: "iso", label: "ISO", pick: (d) => d.iso },
];

export class JdExifPanel extends JdDescriptions {
  static override tag = "jd-exif-panel";
  static override props = {
    ...JdDescriptions.props,
    /** v2 ExifPanel은 라벨/값 한 쌍이 한 행이었다 — 기반 기본값 2의 재정의 */
    columns: { type: Number, default: 1, reflect: true },
    /** 한 줄로 흘려 쓰기 (v2 compact) */
    compact: { type: Boolean, reflect: true },
    /** 촬영시각 표기 로케일 (v2는 "ko" 하드코딩) */
    locale: { type: String, default: "ko" },
  };

  declare compact: boolean;
  declare locale: string;

  #data: JdExifData = {};
  /** data·locale이 바뀐 뒤 한 번만 항목을 다시 만든다 (items 대입이 곧 requestUpdate) */
  #dirty = true;
  #lastLocale = "";

  get data(): JdExifData {
    return this.#data;
  }
  set data(v: JdExifData) {
    this.#data = v && typeof v === "object" ? v : {};
    this.#dirty = true;
    this.requestUpdate();
  }

  protected override render(): void {
    this.#readJson(); // 기반의 배열 슬롯 리더가 보기 전에 객체 슬롯을 소비한다
    super.render();
    adoptStyles(exifPanelStyles);
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "{}") as JdExifData;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) this.#data = parsed;
    } catch {
      console.warn("[junds] <jd-exif-panel> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /** EXIF → 기반 항목 배열. 값이 없는 행은 빼는 것이 v2 동형 */
  #rows(): JdDescriptionItem[] {
    const d = this.#data;
    const rows: JdDescriptionItem[] = [];
    const push = (key: string, label: string, value: string | number | undefined): void => {
      if (value === undefined || value === null || value === "") return;
      rows.push({ key, label, value: String(value) });
    };
    for (const f of FIELDS) push(f.key, f.label, f.pick(d));
    push("taken-at", "촬영시각", this.#formatDate(d.takenAt));
    push("location", "위치", d.location);
    for (const [k, v] of Object.entries(d.extra ?? {})) push(k, k, v);
    return rows;
  }

  /** 파싱 실패는 "Invalid Date"가 아니라 **행 없음**이다 (v2 교정) */
  #formatDate(value: string | Date | undefined): string | undefined {
    if (value === undefined || value === "") return undefined;
    const dt = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(dt.getTime())) return undefined;
    try {
      return new Intl.DateTimeFormat(this.locale || "ko", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(dt);
    } catch {
      return dt.toISOString(); // 잘못된 로케일 태그 — 렌더를 깨뜨리지 않는다
    }
  }

  protected override update(): void {
    if (this.#dirty || this.#lastLocale !== this.locale) {
      this.#dirty = false;
      this.#lastLocale = this.locale;
      this.items = this.#rows(); // 기반 setter가 골격 재동기화를 예약한다
    }
    super.update();
  }
}
