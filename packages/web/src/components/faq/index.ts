import { JdFaq } from "./element.js";
import { defineElement } from "../../core/define.js";
// 행 골격이 <jd-disclosure>다 — FAQ만 import해도 행이 살아 있어야 한다 (accordion 선례)
import "../disclosure/index.js";
export { JdFaq };
export type { JdFaqItem } from "./element.js";
defineElement(JdFaq.tag, JdFaq);
