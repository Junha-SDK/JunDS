import { JdEmailInbox } from "./element.js";
import { defineElement } from "../../core/define.js";
export { JdEmailInbox };
export type { JdEmailFolder, JdEmailMessage } from "./element.js";
defineElement(JdEmailInbox.tag, JdEmailInbox);
