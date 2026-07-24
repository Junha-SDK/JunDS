import { JdNavSidebar } from "./element.js";
import { defineElement } from "../../core/define.js";
import "../app-icon/index.js"; // 합성 대상 <jd-app-icon> 등록 보장
import "../badge/index.js"; // 합성 대상 <jd-badge> 등록 보장
export { JdNavSidebar };
export type { JdNavItem, JdNavSection } from "./element.js";
defineElement(JdNavSidebar.tag, JdNavSidebar);
