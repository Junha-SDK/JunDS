import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useForm } from "@/ds/hooks/useForm";

describe("useForm", () => {
  it("required rule surfaces an error on validate", () => {
    const { result } = renderHook(() =>
      useForm({ email: "" }, { email: { required: "이메일을 입력하세요" } }),
    );
    act(() => {
      result.current.validate();
    });
    expect(result.current.errors.email).toBe("이메일을 입력하세요");
    expect(result.current.isValid).toBe(false);
  });

  it("setError reports an external validation failure for a field", () => {
    const { result } = renderHook(() => useForm({ email: "a@b.c" }));
    act(() => result.current.setError("email", "이미 사용 중인 이메일입니다"));
    expect(result.current.errors.email).toBe("이미 사용 중인 이메일입니다");
    expect(result.current.isValid).toBe(false);
  });

  it("setValue clears the field error once the value changes", () => {
    const { result } = renderHook(() =>
      useForm({ email: "" }, { email: { required: "필수" } }),
    );
    act(() => {
      result.current.validate();
    });
    expect(result.current.errors.email).toBe("필수");
    act(() => result.current.setValue("email", "a@b.c"));
    expect(result.current.errors.email).toBeUndefined();
  });
});
