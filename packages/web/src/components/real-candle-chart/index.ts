import "../candle-chart/index.js"; // 내부 합성 <jd-candle-chart> 등록 보장
import { JdRealCandleChart } from "./element.js";
import { defineElement } from "../../core/define.js";
export { JdRealCandleChart };
defineElement(JdRealCandleChart.tag, JdRealCandleChart);
