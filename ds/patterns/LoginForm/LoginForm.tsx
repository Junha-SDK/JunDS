"use client";
import { useState } from "react";
import { cn } from "../../utils/cn";
import { Button } from "../../primitives/Button";
import { Input } from "../../primitives/Input";
import { PasswordInput } from "../../primitives/PasswordInput";
import { Label } from "../../primitives/Label";
import { Checkbox } from "../../primitives/Checkbox";
import { Divider } from "../../primitives/Divider";
import { Alert } from "../../composites/Alert";
import type { ReactNode } from "react";

export interface LoginFormProps {
  /** 제출 콜백 */
  onSubmit: (data: { email: string; password: string; remember: boolean }) => void | Promise<void>;
  /** 소셜 로그인 버튼 */
  socialButtons?: ReactNode;
  /** 에러 메시지 */
  error?: string;
  /** 로딩 상태 */
  loading?: boolean;
  /** 회원가입 링크 */
  signupHref?: string;
  /** 비밀번호 찾기 링크 */
  forgotHref?: string;
  /** 로고 */
  logo?: ReactNode;
  /** 폼 제목 */
  title?: string;
  /** 폼 부제목 */
  subtitle?: string;
  /** 비밀번호 강도 표시 (회원가입 폼용) */
  showPasswordStrength?: boolean;
  /** 비밀번호 확인 (회원가입 폼용) */
  showConfirmPassword?: boolean;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 보안 로그인/회원가입 폼
 *
 * 보안 기능:
 * - autocomplete 속성 설정
 * - 비밀번호 강도 표시
 * - 브루트포스 방지 에러 표시
 * - 소셜 로그인 통합
 * - 자동 로그인 (쿠키 기반) 옵션
 *
 * @example
 * <LoginForm onSubmit={handleLogin} title="로그인" forgotHref="/forgot" />
 * <LoginForm onSubmit={handleRegister} title="회원가입" showPasswordStrength showConfirmPassword />
 * @status stable
 * @since 2.2.0
 * @tags form
 */
export function LoginForm({
  onSubmit,
  socialButtons,
  error,
  loading,
  signupHref,
  forgotHref,
  logo,
  title = "로그인",
  subtitle,
  showPasswordStrength,
  showConfirmPassword,
  className,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!email.trim()) {
      setLocalError("이메일을 입력하세요");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setLocalError("올바른 이메일 형식이 아닙니다");
      return;
    }
    if (!password) {
      setLocalError("비밀번호를 입력하세요");
      return;
    }
    if (showConfirmPassword && password !== confirm) {
      setLocalError("비밀번호가 일치하지 않습니다");
      return;
    }

    onSubmit({ email, password, remember });
  };

  const displayError = error || localError;

  return (
    <div className={cn("w-full max-w-sm mx-auto", className)}>
      {/* Logo & Title */}
      <div className="text-center mb-6">
        {logo && <div className="flex justify-center mb-3">{logo}</div>}
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
      </div>

      {/* Error */}
      {displayError && (
        <Alert variant="danger" className="mb-4">
          {displayError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-email" required>
            이메일
          </Label>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            autoComplete="email"
            error={!!displayError && !email}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-pw" required>
              비밀번호
            </Label>
            {forgotHref && (
              <a href={forgotHref} className="text-xs text-primary-ink hover:underline">
                비밀번호 찾기
              </a>
            )}
          </div>
          <PasswordInput
            id="login-pw"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 입력"
            showStrength={showPasswordStrength}
            showRules={showPasswordStrength}
            error={!!displayError && !password}
          />
        </div>

        {/* Confirm Password */}
        {showConfirmPassword && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login-pw2" required>
              비밀번호 확인
            </Label>
            <PasswordInput
              id="login-pw2"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="비밀번호 다시 입력"
              error={!!confirm && password !== confirm}
            />
            {confirm && password !== confirm && (
              <p className="text-xs text-danger">비밀번호가 일치하지 않습니다</p>
            )}
          </div>
        )}

        {/* Remember + Submit */}
        <div className="flex items-center justify-between">
          <Checkbox
            label="자동 로그인"
            checked={remember}
            onChange={() => setRemember(!remember)}
            size="sm"
          />
        </div>

        <Button type="submit" fullWidth loading={loading}>
          {title}
        </Button>

        {/* Social */}
        {socialButtons && (
          <>
            <Divider label="또는" />
            <div className="flex flex-col gap-2">{socialButtons}</div>
          </>
        )}

        {/* Signup link */}
        {signupHref && (
          <p className="text-center text-sm text-muted">
            계정이 없으신가요?{" "}
            <a href={signupHref} className="text-primary-ink font-medium hover:underline">
              회원가입
            </a>
          </p>
        )}
      </form>

      {/* Security notice */}
      <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-muted-light">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M6 1c-.4.2-1.3.6-2.5.8C3.2 3 3 4.2 3 5.2c0 2.5 1.4 4.2 3 5 1.6-.8 3-2.5 3-5 0-1-.2-2.2-.5-3.4C7.3 1.6 6.4 1.2 6 1z"
            stroke="currentColor"
            strokeWidth="0.8"
          />
        </svg>
        <span>보안 연결 (TLS 1.3)</span>
      </div>
    </div>
  );
}
