/**
 * jd-sidebar-provider CSS — 상자 없는 상태 컨테이너.
 * v2 DsSidebarProvider가 children만 반환했으므로 레이아웃에 개입하지 않는다.
 * 접힘 반응 규칙은 각 자손(jd-sidebar/link/section) 시트가 조상 `[collapsed]`를
 * 자손 조합자로 읽어 처리한다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-sidebar-provider {
      display: contents;
    }
  }
`;
