/**
 * @junds/react — JunDS v3 React 어댑터 (03-web-arch §11).
 * v2 @junds/ui 소비 코드가 import만 바꿔 무수정 컴파일되는 것이 계약이다.
 * G1 파일럿 표면: Button · TextField(Input + FormField) · Modal.
 * 컴포넌트 모듈 import가 해당 <jd-*> 정의(선등록 승리 가드, §2)까지 수행한다.
 */
import "./jsx.js";

export { Button } from "./components/Button.js";
export type { ButtonProps, ButtonSize, ButtonVariant } from "./components/Button.types.js";

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
  ModalFooterProps,
} from "./components/Modal.js";
