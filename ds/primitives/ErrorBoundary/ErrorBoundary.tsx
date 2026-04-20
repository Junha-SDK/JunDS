"use client";
import { Component, type ReactNode, type ErrorInfo } from "react";
import { cn } from "../../utils/cn";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  className?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

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
        <div className={cn("flex flex-col items-center justify-center p-8 text-center border border-danger/20 rounded-xl bg-danger-light", this.props.className)}>
          <div className="text-danger text-2xl mb-2">⚠</div>
          <h3 className="text-sm font-semibold text-foreground mb-1">오류가 발생했습니다</h3>
          <p className="text-xs text-muted mb-3">{this.state.error.message}</p>
          <button
            onClick={this.reset}
            className="px-3 py-1.5 text-xs font-medium bg-danger text-white rounded-lg hover:bg-danger-hover transition-colors"
          >
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
