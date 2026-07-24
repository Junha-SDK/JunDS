import { JdPopover } from "./element.js";
import { defineElement } from "../../core/define.js";
export { JdPopover };
export type {
  JdPopoverSide,
  JdPopoverAlign,
  JdPopoverTriggerMode,
  JdPopoverCloseReason,
} from "./element.js";
defineElement(JdPopover.tag, JdPopover);
