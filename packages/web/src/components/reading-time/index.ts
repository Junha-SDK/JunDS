import { JdReadingTime } from "./element.js";
import { defineElement } from "../../core/define.js";
export { JdReadingTime };
/** 순수 추정기 — 같은 계열 후속(ReadingStats·ReadingGoal)과 앱 코드가 공유한다 */
export { stripHtml, countHeadings, estimateReadingTime, estimateDifficulty } from "./element.js";
export type { JdDifficulty, JdReadingEstimate } from "./element.js";
defineElement(JdReadingTime.tag, JdReadingTime);
