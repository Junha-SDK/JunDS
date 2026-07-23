/**
 * <jd-stack> — 방향 가변 스택 (v2 layout/Stack). 기본 column·gap md.
 * v2의 divider 프롭(children 사이 노드 삽입)은 React 어댑터 몫 — 바닐라 HTML에서는
 * children 사이에 <jd-divider>를 직접 쓴다 (DECISIONS B2).
 * layout HStack/VStack 재수출은 core jd-hstack/jd-vstack와 동일 표면 — 별도 태그 없음.
 */
import { JdBox } from "../box/element.js";
import stackStyles from "./stack.css.js";

export class JdStack extends JdBox {
  static override tag = "jd-stack";
  static override styles = stackStyles;
}
