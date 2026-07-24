/**
 * <jd-key-value-grid-client> — v2 finance/KeyValueGridClient의 CE 대응 = **jd-key-value-grid 별칭**.
 *
 * v2에서 KeyValueGridClient는 `"use client"` 한 줄이 전부인 얇은 래퍼였다 — Next.js가
 * 서버 컴포넌트 트리 안에서 KeyValueGrid를 클라이언트 경계로 넘기기 위한 존재였다.
 * 바닐라 Custom Element에는 서버/클라이언트 경계가 없다(요소 자체가 곧 클라이언트) —
 * 그 구분은 소멸한다. 그래서 이 태그는 jd-key-value-grid를 **그대로 상속**하고
 * 태그명만 바꾼다. 프롭·슬롯·렌더는 원형과 100% 동일하다(§6 R12 별칭).
 *
 * v2 마이그레이션 경로 보존을 위해 별도 태그로 남긴다 — 새 코드는 jd-key-value-grid를 쓰라.
 */
import { JdKeyValueGrid } from "../key-value-grid/element.js";
import { adoptStyles } from "../../core/styles.js";
import keyValueGridClientStyles from "./key-value-grid-client.css.js";

export class JdKeyValueGridClient extends JdKeyValueGrid {
  static override tag = "jd-key-value-grid-client";

  protected override render(): void {
    super.render();
    // 파생 태그는 원형의 태그 셀렉터 규칙을 못 받는다 — :not(:defined) 폴백만 얹는다
    adoptStyles(keyValueGridClientStyles);
  }
}
