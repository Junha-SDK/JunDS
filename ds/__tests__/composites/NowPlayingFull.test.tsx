import { render, renderHook, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { NowPlayingFull } from "../../composites/NowPlayingFull";
import { useAudioPlayer, type PlayerTrack } from "../../hooks/useAudioPlayer";

const TRACKS: PlayerTrack[] = [
  { slug: "a", title: "첫 곡", artist: "junha", src: "/a.mp3" },
];

/** 훅 인스턴스를 만들어 컴포넌트에 그대로 넘긴다 */
function usePlayer() {
  return renderHook(() => useAudioPlayer(TRACKS)).result.current;
}

describe("NowPlayingFull", () => {
  it("renders without throwing", () => {
    const player = usePlayer();
    const { container } = render(
      <NowPlayingFull open={false} onClose={() => {}} player={player} />,
    );
    expect(container).toBeDefined();
  });

  it("renders nothing while closed", () => {
    const player = usePlayer();
    render(<NowPlayingFull open={false} onClose={() => {}} player={player} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("stays closed when no track is selected, even with open=true", () => {
    // 트랙을 고르지 않은 상태에서 열리면 빈 화면만 뜬다 — 열지 않는 게 맞다
    const player = usePlayer();
    render(<NowPlayingFull open onClose={() => {}} player={player} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
