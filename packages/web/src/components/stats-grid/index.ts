import { JdStatsGrid } from "./element.js";
import { defineElement } from "../../core/define.js";
// stats가 만드는 <jd-stat-card>가 정의돼 있어야 한다 — 합성 의존을 index 부작용에서 보장
import "../stat-card/index.js";
export { JdStatsGrid };
defineElement(JdStatsGrid.tag, JdStatsGrid);
