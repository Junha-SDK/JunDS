import { JdStrategyPanel } from "./element.js";
import { defineElement } from "../../core/define.js";
import "../app-icon/index.js"; // 합성 대상 <jd-app-icon> 등록 보장
import "../badge/index.js"; // 합성 대상 <jd-badge> 등록 보장
export { JdStrategyPanel };
export type { JdStrategySnapshot, JdStrategyLevel, JdScoreBreakdown } from "./element.js";
defineElement(JdStrategyPanel.tag, JdStrategyPanel);
