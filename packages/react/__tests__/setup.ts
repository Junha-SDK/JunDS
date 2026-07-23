import "@testing-library/jest-dom/vitest";

// RTL 밖에서 hydrateRoot/act를 직접 쓰는 테스트(hydration.test.tsx)용
(globalThis as Record<string, unknown>)["IS_REACT_ACT_ENVIRONMENT"] = true;
