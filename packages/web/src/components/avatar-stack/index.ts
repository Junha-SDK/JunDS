import { JdAvatarStack } from "./element.js";
import { defineElement } from "../../core/define.js";
// 항목 골격이 <jd-avatar>다 — 스택만 import해도 아바타가 살아 있어야 한다
import "../avatar/index.js";
export { JdAvatarStack };
defineElement(JdAvatarStack.tag, JdAvatarStack);
