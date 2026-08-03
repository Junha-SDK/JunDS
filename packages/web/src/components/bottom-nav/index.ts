import { JdBottomNav } from "./element.js";
import { defineElement } from "../../core/define.js";
import "../bottom-sheet/index.js"; // 합성 대상 <jd-bottom-sheet> 등록 보장
export { JdBottomNav };
export type { JdBottomNavTab, JdBottomNavSheetItem, JdBottomNavSection } from "./element.js";
defineElement(JdBottomNav.tag, JdBottomNav);
