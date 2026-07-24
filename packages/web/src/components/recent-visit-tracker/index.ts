import { JdRecentVisitTracker } from "./element.js";
import { defineElement } from "../../core/define.js";
export { JdRecentVisitTracker };
export {
  RECENT_DEFAULT_KEY,
  readRecent,
  recordVisit,
  clearRecent,
  subscribeRecent,
} from "./recent-store.js";
defineElement(JdRecentVisitTracker.tag, JdRecentVisitTracker);
