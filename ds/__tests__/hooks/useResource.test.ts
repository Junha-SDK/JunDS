import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useResource } from "../../hooks/useResource";

describe("useResource", () => {
  it("loads data successfully", async () => {
    const { result } = renderHook(() =>
      useResource(["k1"], async () => ({ name: "준하" })),
    );
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.name).toBe("준하");
    expect(result.current.error).toBeUndefined();
  });
});
