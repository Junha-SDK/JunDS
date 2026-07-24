import { JdStockTopBar } from "./element.js";
import { defineElement } from "../../core/define.js";
import "../app-icon/index.js"; // 합성 대상 <jd-app-icon> 등록 보장
import "../star-button/index.js"; // 합성 대상 <jd-star-button> 등록 보장
import "../alert-button/index.js"; // 합성 대상 <jd-alert-button> 등록 보장
export { JdStockTopBar };
export type { JdStockTab } from "./element.js";
defineElement(JdStockTopBar.tag, JdStockTopBar);
