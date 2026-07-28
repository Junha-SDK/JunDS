"use client";
import { Component, type ReactNode, type ErrorInfo } from "react";
import { cn } from "../../utils/cn";

export interface ErrorBoundaryProps {
  /** 보호할 자식 트리 */
  children: ReactNode;
  /** 에러 시 표시할 대체 UI 또는 렌더 함수 */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** 에러 발생 시 호출되는 콜백 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** 추가 클래스 */
  className?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 하위 컴포넌트의 렌더링 오류를 잡아 폴백 UI로 대체하는 에러 경계.
 * @example
 * <ErrorBoundary fallback={<p>문제가 발생했어요</p>}>
 *   <App />
 * </ErrorBoundary>
 * @status stable
 * @since 2.2.0
 * @tags feedback
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (typeof this.props.fallback === "function") {
        return this.props.fallback(this.state.error, this.reset);
      }
      if (this.props.fallback) {
        return this.props.fallback;
      }
      // Default fallback UI
      return (
        <div
          className={cn(
            "flex flex-col items-center justify-center p-8 text-center border border-danger/20 rounded-xl bg-danger-light",
            this.props.className,
          )}
        >
          <div className="text-danger text-2xl mb-2" aria-hidden="true">
            ⚠
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">오류가 발생했습니다</h3>
          <p className="max-w-full break-words text-xs text-muted mb-3">
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={this.reset}
            className={cn(
              "px-3 py-1.5 text-xs font-medium bg-danger text-white rounded-xl cursor-pointer",
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]",
              // 누를 수 있는 것에는 hover·active·focus-visible 이 전부 있어야 한다
              "transition-colors hover:bg-danger-hover active:scale-[0.97] motion-reduce:active:scale-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
