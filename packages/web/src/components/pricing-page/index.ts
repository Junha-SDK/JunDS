import { JdPricingPage } from "./element.js";
import { defineElement } from "../../core/define.js";
// 합성 대상 <jd-pricing-table>이 먼저 정의돼야 render 시 업그레이드된다
import "../pricing-table/index.js";
export { JdPricingPage };
defineElement(JdPricingPage.tag, JdPricingPage);
