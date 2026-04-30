import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Form } from "../../patterns/Form";

describe("Form", () => {
  it("renders with empty values and child content", () => {
    const { container } = render(
      <Form values={{}} onChange={() => {}}>
        <input name="email" />
      </Form>,
    );
    expect(container.firstChild).toBeDefined();
  });
});
