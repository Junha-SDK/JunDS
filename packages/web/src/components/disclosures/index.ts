import { JdDisclosures } from "./element.js";
import { defineElement } from "../../core/define.js";
// 목록·배지 골격이 jd-timeline·jd-tag다 — 이것만 import해도 둘이 살아 있어야 한다
import "../timeline/index.js";
import "../tag/index.js";
export { JdDisclosures };
defineElement(JdDisclosures.tag, JdDisclosures);
