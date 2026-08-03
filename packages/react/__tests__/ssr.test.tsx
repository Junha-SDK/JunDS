// @vitest-environment node
/**
 * SSR 안전성 (03-web-arch §3.1·§11-4) — DOM 전역이 없는 Node에서:
 * 1) 어댑터 모듈 import가 그냥 평가된다(CE 정의는 no-op).
 * 2) renderToString이 "완성 골격"을 내보낸다 — 반영 attribute·라벨·에러·aria까지
 *    hydration 전 스타일 완성 상태(§11-4)의 근거.
 * 3) Modal은 v2 수명 의미론(포털+mounted 게이트)이라 서버에서 null — throw 없이 빈 문자열.
 */
import { describe, expect, test } from "vitest";
import { renderToString } from "react-dom/server";
import { Button, FormField, Input, Modal, TextField } from "../src/index.js";

describe("Node 모듈 평가·renderToString", () => {
  test("Button — 호스트 반영 attr + 내부 골격 + 스피너/aria-busy가 서버 HTML에 존재", () => {
    const html = renderToString(
      <Button variant="danger" size="lg" loading fullWidth>
        삭제 중...
      </Button>,
    );
    expect(html).toContain("<jd-button");
    expect(html).toContain('variant="danger"');
    expect(html).toContain('size="lg"');
    expect(html).toContain("loading");
    expect(html).toContain("full-width");
    expect(html).toContain('class="jd-button"');
    expect(html).toContain("jd-button__spinner");
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("disabled");
    expect(html).toContain("삭제 중...");
  });

  test("Button 기본값 — 디폴트 미반영(DEC-012-2 동형) + 안전한 type=button", () => {
    const html = renderToString(<Button>저장</Button>);
    expect(html).not.toContain("variant=");
    expect(html).not.toContain("size=");
    expect(html).toContain('type="button"');
  });

  test("TextField — 라벨·에러 행·aria 연결까지 완성 골격", () => {
    const html = renderToString(
      <TextField label="이름" error="이름을 입력해주세요" placeholder="이름 입력" />,
    );
    expect(html).toContain("<jd-text-field");
    expect(html).toContain('label="이름"');
    expect(html).toContain('error="이름을 입력해주세요"');
    expect(html).toContain("jd-text-field__label");
    expect(html).toContain("이름"); // 라벨 텍스트(dSIH)
    expect(html).toContain("jd-text-field__input");
    expect(html).toContain("jd-text-field__control");
    expect(html).toContain("jd-text-field__slot--start");
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain("aria-describedby");
    expect(html).toContain("jd-text-field__error");
    expect(html).toContain("이름을 입력해주세요");
  });

  test("Input invalid와 좌우 슬롯도 서버 완성 골격에 포함된다", () => {
    const html = renderToString(
      <Input error leftSlot={<span>₩</span>} rightSlot={<span>KRW</span>} />,
    );
    expect(html).toContain("invalid");
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain("₩");
    expect(html).toContain("KRW");
  });

  test("FormField+Input 폴드도 서버에서 동일 골격", () => {
    const html = renderToString(
      <FormField label="이름" required error="필수입니다">
        <Input id="name" error />
      </FormField>,
    );
    expect(html).toContain("jd-form-field");
    expect(html).toContain('label="이름"');
    expect(html).toContain("required");
    expect(html).toContain('id="name"');
    expect(html).toContain("필수입니다");
  });

  test("Modal — 서버에서 null(v2 Portal mounted 게이트 동형), throw 없음", () => {
    const html = renderToString(
      <Modal open onClose={() => {}}>
        <Modal.Header>제목</Modal.Header>
        <p>내용</p>
      </Modal>,
    );
    expect(html).toBe("");
  });

  test("controlled value가 서버 HTML에 직렬화된다", () => {
    const html = renderToString(<TextField value="서버값" onChange={() => {}} />);
    expect(html).toContain('value="서버값"');
  });
});
