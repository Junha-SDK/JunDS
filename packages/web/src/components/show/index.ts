import { JdHide, JdShow } from "./element.js";
import { defineElement } from "../../core/define.js";
export { JdHide, JdShow };
defineElement(JdShow.tag, JdShow);
defineElement(JdHide.tag, JdHide);
