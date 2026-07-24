import { JdAccordion } from "./element.js";
import { defineElement } from "../../core/define.js";
// 행 골격이 <jd-disclosure>다 — 아코디언만 import해도 행이 살아 있어야 한다
import "../disclosure/index.js";
export { JdAccordion };
defineElement(JdAccordion.tag, JdAccordion);
