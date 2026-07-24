/**
 * <jd-recent-visit-tracker> — 헤드리스 방문 기록기 (v2 finance/RecentVisitTracker).
 *
 * v2는 `useEffect(() => recordVisit(decodeURIComponent(name)), [name])`로 null을
 * 렌더하는 순수 부작용 컴포넌트였다. 바닐라 등가물은 **DOM을 만들지 않는** 커스텀
 * 엘리먼트로, 연결 시점과 name 변경 시점에 공유 저장소(recent-store)에 기록한다.
 *
 * SSG 결정성(§3.1-3): 이 컴포넌트는 산출 DOM이 0이라 더블 렌더 비교가 항상 동일하다.
 * render()는 스토리지를 만지지 않고(규칙 준수), 기록은 connected()/update()의 부작용으로
 * 미룬다 — 프리렌더에서도 name이 있으면 기록되지만 스냅샷 HTML에는 영향이 없다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { RECENT_DEFAULT_KEY, recordVisit } from "./recent-store.js";
import trackerStyles from "./recent-visit-tracker.css.js";

export class JdRecentVisitTracker extends JdElement {
  static override tag = "jd-recent-visit-tracker";
  static override props = {
    /** 방문한 종목 이름(라우트 파라미터라 URL 인코딩되어 있을 수 있다) */
    name: { type: String, reflect: true },
    /** 저장소 key 재정의 (attr: storage-key) */
    storageKey: { type: String, default: RECENT_DEFAULT_KEY, attribute: "storage-key" },
  };

  declare name: string;
  declare storageKey: string;

  #recorded: string | null = null;

  protected render(): void {
    adoptStyles(trackerStyles); // 호스트를 display:none으로만 둔다 — 표시물 없음
  }

  /** 최초 연결 시 기록(§3.1-3: render 밖 부작용) */
  protected override connected(): void {
    this.#record();
  }

  /** name이 런타임에 바뀌면 재기록 — v2 useEffect([name])와 같은 의미 */
  protected override update(): void {
    this.#record();
  }

  #record(): void {
    const raw = this.name?.trim();
    if (!raw || raw === this.#recorded) return;
    this.#recorded = raw;
    let decoded = raw;
    try {
      decoded = decodeURIComponent(raw); // v2 recordVisit(decodeURIComponent(name))
    } catch {
      // 잘못된 % 시퀀스 — 원문 그대로 기록
    }
    recordVisit(this.storageKey, decoded);
  }
}
