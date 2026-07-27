/**
 * @junds/react — JunDS v3 React 어댑터 (03-web-arch §11).
 * v2 @junds/ui 소비 코드가 import만 바꿔 무수정 컴파일되는 것이 계약이다.
 * 컴포넌트 모듈 import가 해당 <jd-*> 정의(선등록 승리 가드, §2)까지 수행한다.
 *
 * 표면은 두 층이다.
 *  - **손저작 3종** (Button · TextField(Input+FormField) · Modal): v2 API 표면을
 *    그대로 보존해야 해서 골격까지 React가 소유한다(DEC-008-(1)). 아래에 명시 export.
 *  - **생성 387종** (DEC-044): 그런 사연이 없는 나머지. @junds/web 의 런타임
 *    `static props` 에서 표면을 그대로 읽어 만든 얇은 층이라, 라이브러리가 프롭을
 *    늘리면 재생성만 하면 된다. 값 전달만 하고 골격은 CE가 소유한다.
 */
import "./jsx.js";

export * from "./generated/index.js";

export { Button } from "./components/Button.js";
export type {
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from "./components/Button.types.js";

export { TextField, Input, FormField } from "./components/TextField.js";
export type {
  TextFieldProps,
  InputProps,
  InputSize,
  FormFieldProps,
} from "./components/TextField.js";

export { Modal } from "./components/Modal.js";
export type {
  ModalProps,
  ModalSize,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
} from "./components/Modal.js";
