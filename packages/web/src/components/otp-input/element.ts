/**
 * <jd-otp-input> — 일회용 비밀번호 입력 (v2 primitives/OTPInput) = PinInput 파생.
 * 표면 차: 숫자 고정(alphanumeric 무시), 중앙 구분자, 더 큰 칸(border-medium·rounded-xl).
 * 로직(이동·삭제·붙여넣기·완료 통지)은 전량 공유 — §6 R12 단일 구현 + 별칭 원칙.
 */
import { JdPinInput } from "../pin-input/element.js";
import otpInputStyles from "./otp-input.css.js";

export class JdOtpInput extends JdPinInput {
  static override tag = "jd-otp-input";
  static override styles = otpInputStyles;

  protected override baseClass = "jd-otp-input";
  protected override fallbackAriaLabel = "인증 코드 입력";

  /** v2 OTPInput은 숫자 전용 — alphanumeric을 노출하지 않는다 */
  protected override get textMode(): boolean {
    return false;
  }

  /** v2: 가운데(length/2 내림)에 구분 막대 */
  protected override separatorIndex(): number {
    return Math.floor(this.length / 2);
  }
}
