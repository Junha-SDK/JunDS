import { JdButton } from "./element.js";
import { defineElement } from "../../core/define.js";
export { JdButton };
defineElement(JdButton.tag, JdButton); // §2 — SSR no-op·충돌 가드 내장
