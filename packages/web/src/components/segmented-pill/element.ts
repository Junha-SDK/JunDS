/**
 * <jd-segmented-pill> — 알약 세그먼트 선택기 (v2 finance/SegmentedPill) = **jd-tabs 파생**.
 *
 * v2 SegmentedPill은 `role=tablist` + `role=tab` 버튼 나열에 아이콘·카운트 배지를 얹은
 * 알약 선택기다 — jd-tabs가 이미 갖춘 것(로빙 tabindex·←/→·Home/End·비활성 건너뜀·
 * 자동 활성화·JSON 슬롯·아이콘/배지 슬롯·jd-change)과 골격이 같다. 그래서 그 기계를
 * 상속하고(§6 R12) **알약 트랙 외관 + fullWidth + lg 사이즈 + key→value 정규화**만 얹는다.
 * v2는 화살표 키가 아예 없었는데(핸들러 미부착), 상속으로 APG Tabs 키보드가 공짜로 붙는다.
 *
 * v2 SegmentOption의 식별자는 `key`였다 — jd-tabs의 `value`로 접어 받는다(둘 다 허용).
 * 데이터 입력 2경로: `options` 프로퍼티 / 자식 `<script type="application/json">`.
 */
import { JdTabs, type JdTab } from "../tabs/element.js";
import type { JdContent } from "../../core/content.js";
import { adoptStyles } from "../../core/styles.js";
import segmentedPillStyles from "./segmented-pill.css.js";

export interface JdSegmentOption {
  /** 식별자 (v2 `key`도 허용) */
  value?: string;
  key?: string;
  label: string;
  /** 아이콘. 문자열(평문), DOM 노드 또는 `unsafeHtml()`로 표시한 값 */
  icon?: JdContent;
  /** 0보다 클 때만 노출되는 카운트 배지 (v2 규칙) */
  badge?: number;
  disabled?: boolean;
}

function normalizeOptions(v: unknown): JdTab[] {
  if (!Array.isArray(v)) return [];
  return v.map((raw) => {
    const o = raw as JdSegmentOption;
    const badge = typeof o.badge === "number" && o.badge > 0 ? o.badge : undefined;
    return {
      value: o.value ?? o.key ?? o.label,
      label: o.label,
      icon: o.icon,
      badge,
      disabled: o.disabled,
    };
  });
}

export class JdSegmentedPill extends JdTabs {
  static override tag = "jd-segmented-pill";
  static override props = {
    ...JdTabs.props,
    /** sm | md | lg (v2 3종 — jd-tabs 기본 2종에 lg 확장) */
    size: { type: String, default: "md", reflect: true },
    /** 트랙 폭을 100%로 늘리고 알약을 균등 분배 */
    fullWidth: { type: Boolean, reflect: true },
  };

  declare fullWidth: boolean;

  /** v2 프롭명. jd-tabs의 `tabs`로 위임하며 key→value 정규화 */
  get options(): JdSegmentOption[] {
    return this.tabs as JdSegmentOption[];
  }
  set options(v: JdSegmentOption[]) {
    this.tabs = normalizeOptions(v);
  }

  protected override render(): void {
    this.#upgradeOwnOptions(); // 업그레이드 전 대입된 .options 회수(수제 접근자는 베이스가 못 챙긴다)
    super.render(); // role=tablist + 골격 구축 + JSON 슬롯 소비
    adoptStyles(segmentedPillStyles);
    // JSON 슬롯이 `key`로 들어왔을 수 있으니 한 번 정규화(idempotent) — 재싱크 유발
    this.tabs = normalizeOptions(this.tabs);
  }

  /** 표준 CE 함정: static props가 아닌 수제 접근자는 #upgradeProps가 회수하지 못한다 */
  #upgradeOwnOptions(): void {
    if (!Object.prototype.hasOwnProperty.call(this, "options")) return;
    const self = this as unknown as Record<string, unknown>;
    const v = self.options;
    delete self.options;
    self.options = v;
  }
}
