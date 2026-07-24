/**
 * <jd-command-palette-host> — 동적 항목 프로바이더를 붙이는 커맨드 팔레트 호스트
 * (v2 finance/CommandPaletteHost) = CommandPalette 파생.
 *
 * v2 Host의 본질은 두 가지였다: (1) ⌘K 전역 토글, (2) 앱이 자기 데이터를 팔레트에
 * 실시간으로 노출하는 **프로바이더 등록 API**(registerCommandItemsProvider +
 * notifyCommandItemsChanged). ⌘K는 이미 jd-command-palette의 `hotkey` 프로퍼티가
 * 처리하므로(§6 R12), 이 파생은 프로바이더 계층만 얹는다.
 *
 * v2는 ButterMoney 라우트(PAGES)·종목(STOCKS)을 **컴포넌트 안에 하드코딩**했다 —
 * 디자인 시스템 경계 위반이다. v3 호스트는 비어서 출발하고, 소비자가 `items`(정적)와
 * registerProvider(동적)로 항목을 공급한다. 유효 목록 = 정적 items + 모든 프로바이더 수집.
 *
 * 프로바이더 계약: `() => JdCommandItem[]`. 등록은 해제 함수를 돌려준다. 데이터가 바뀌면
 * 재등록 없이 refreshProviders()만 호출하면 열린 팔레트에도 반영된다(v2 notify와 동형).
 * 한 프로바이더가 throw해도 나머지 수집은 계속된다(v2 방어와 동일).
 */
import { JdCommandPalette, type JdCommandItem } from "../command-palette/element.js";
import { adoptStyles } from "../../core/styles.js";
import commandPaletteHostStyles from "./command-palette-host.css.js";

export type JdCommandItemsProvider = () => JdCommandItem[];

export class JdCommandPaletteHost extends JdCommandPalette {
  static override tag = "jd-command-palette-host";

  /** 소비자가 `items`로 설정한 정적 목록 — 프로바이더 결과와 병합된다 */
  #base: JdCommandItem[] = [];
  #providers = new Set<JdCommandItemsProvider>();

  /** get은 소비자가 설정한 정적 목록을 되돌린다(프로바이더 결과 제외 — 라운드트립 직관성) */
  override get items(): JdCommandItem[] {
    return this.#base;
  }
  override set items(v: JdCommandItem[]) {
    this.#base = Array.isArray(v) ? v : [];
    this.#recollect();
  }

  protected override render(): void {
    super.render(); // 모달·팔레트 골격 + 스타일 채택, JSON 슬롯 소비
    adoptStyles(commandPaletteHostStyles); // 태그-스코프 레이아웃 규칙(파생 태그용)
    // JSON 슬롯으로 초기화된 항목은 super의 목록에 들어간다 — 정적 base로 승격해 프로바이더와 병합
    if (this.#base.length === 0) {
      const inherited = super.items;
      if (inherited.length > 0) this.#base = inherited.slice();
    }
    this.#recollect();
  }

  /**
   * 동적 항목 프로바이더 등록 — 해제 함수 반환.
   *   const off = host.registerProvider(() => noteItems);
   *   host.refreshProviders();  // 데이터 변경 시
   *   off();                    // 정리 시
   */
  registerProvider(provider: JdCommandItemsProvider): () => void {
    this.#providers.add(provider);
    this.#recollect();
    return () => {
      this.#providers.delete(provider);
      this.#recollect();
    };
  }

  /** 프로바이더가 반환할 데이터가 바뀌었을 때 — 항목 재수집(v2 notifyCommandItemsChanged) */
  refreshProviders(): void {
    this.#recollect();
  }

  /** 유효 목록 = 정적 base + 프로바이더 수집분 → super로 위임(super가 필터·렌더) */
  #recollect(): void {
    const extra: JdCommandItem[] = [];
    for (const provider of this.#providers) {
      try {
        extra.push(...provider());
      } catch {
        /* 한 프로바이더 실패가 팔레트 전체를 막지 않게(v2 방어) */
      }
    }
    // super의 items 세터가 #items 저장 + (골격 있으면) 결과 재렌더
    super.items = extra.length > 0 ? [...this.#base, ...extra] : this.#base;
  }
}
