/**
 * <jd-tree-nav> — 사이드바 트리 내비게이션 (v2 composites/TreeNav) = jd-tree-view 파생.
 *
 * v2의 TreeNav와 TreeView는 **같은 컴포넌트를 두 번 쓴 것**이었다: 재귀 노드 렌더,
 * 확장 상태 맵, `depth * 16 + 8` 들여쓰기, 90° 회전 셰브론, 아이콘 슬롯이 전부 같고
 * 다른 것은 (a) 배지, (b) 랜드마크/접근 이름, (c) 프롭 이름(items/activeKey vs
 * nodes/selected)뿐이었다. v3는 골격·키보드·ARIA를 jd-tree-view가 갖고 여기서는
 * 그 셋만 얹는다(§6 R12) — 로빙 tabindex·APG 화살표 내비·aria-expanded가 공짜로 붙는다.
 *
 * v2 대비 추가 교정: v2 TreeNav는 `<div role="treeitem" tabIndex={0}>`을 노드마다
 * 냈다 — 노드 100개면 탭스톱 100개이고, `aria-selected`가 **모든** 노드에 붙어
 * (선택 안 된 노드에도 aria-selected="false") 트리 전체가 선택 위젯처럼 읽혔다.
 * 기반 클래스가 이 둘을 이미 바로잡는다.
 *
 * v2 표면 다리: `items` → `nodes`, `activeKey` → `selected`, `onItemClick(key, href)`
 * → `jd-select` detail `{ key, href }`.
 */
import { adoptStyles } from "../../core/styles.js";
import { JdTreeView, type JdTreeNode } from "../tree-view/element.js";
import treeNavStyles from "./tree-nav.css.js";

export type JdTreeNavItem = JdTreeNode;

export class JdTreeNav extends JdTreeView {
  static override tag = "jd-tree-nav";
  static override props = {
    ...JdTreeView.props,
    /** 내비게이션 랜드마크 + 트리 접근 이름 */
    label: { type: String, default: "트리 내비게이션" },
  };

  /** v2 TreeNavProps.items 표면 — nodes의 별칭 */
  get items(): JdTreeNavItem[] {
    return this.nodes;
  }
  set items(v: JdTreeNavItem[]) {
    this.nodes = v;
  }

  /** v2 TreeNavProps.activeKey 표면 — selected의 별칭 */
  get activeKey(): string {
    return this.selected;
  }
  set activeKey(v: string) {
    this.selected = v;
  }

  protected override render(): void {
    super.render();
    adoptStyles(treeNavStyles);
    // 사이드바 트리는 랜드마크 안에 산다 — 건너뛰기 내비게이션의 목적지가 된다
    this.setAttribute("role", "navigation");
  }

  protected override update(): void {
    super.update();
    this.setAttribute("aria-label", this.label);
  }
}
