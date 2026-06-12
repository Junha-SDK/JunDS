import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PhotoAlbum } from "../../patterns/PhotoAlbum";

describe("PhotoAlbum", () => {
  it("renders", () => {
    const { container } = render(
      <PhotoAlbum
        title="앨범"
        photos={[
          { id: "1", src: "/a.jpg", alt: "1", tag: "여행" },
          { id: "2", src: "/b.jpg", alt: "2", tag: "음식" },
        ]}
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
