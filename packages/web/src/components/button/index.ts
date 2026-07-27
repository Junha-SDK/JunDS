import { JdButton } from "./element.js";
import { defineElement } from "../../core/define.js";
export { JdButton };
export type { JdButtonSize, JdButtonType, JdButtonVariant } from "./element.js";
defineElement(JdButton.tag, JdButton); // §2 — SSR no-op·충돌 가드 내장
