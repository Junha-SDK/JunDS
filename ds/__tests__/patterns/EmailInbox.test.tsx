import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EmailInbox } from "../../patterns/EmailInbox";

describe("EmailInbox", () => {
  it("renders with folders + messages", () => {
    const { container } = render(
      <EmailInbox
        folders={[{ id: "inbox", label: "받은편지함" }]}
        messages={[
          { id: "m1", folderId: "inbox", from: "준하", subject: "테스트", preview: "본문 미리보기", receivedAt: new Date() },
        ]}
        activeFolderId="inbox"
        onFolderChange={() => {}}
        onMessageSelect={() => {}}
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
