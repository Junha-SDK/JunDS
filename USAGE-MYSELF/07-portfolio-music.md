# 07. 포트폴리오 · 음악

[← 목차](../USAGE-MYSELF.md) · [← 06 서재](06-book.md)

MySelf 대응: `features/portfolio/components/{ProjectCard,CaseStudyCard,BentoGrid,ChapterShell,contacts}` ·
`components/music/*` · `hooks/{useAudioPlayer,useAlbumColors,useRevealOnScroll,useJsonLd}`

## 1. 프로젝트 인덱스 — `ProjectCard`

`ProjectCard` 와 `CaseStudyCard` 두 개가 `variant` 하나로 합쳐졌다.

```tsx
import { ProjectCard } from "@junds/ui/composites";
import { Badge } from "@junds/ui/primitives";
import { preloadDoc } from "@docs/registry/docLoader";

// 목록 행 (구 ProjectCard)
{projects.map((p) => (
  <ProjectCard
    key={p.slug}
    variant="row"
    title={p.title}
    subtitle={p.subtitle}
    icon={p.icon}
    meta={projectYearLabel(p)}
    href={docsHrefFor(p.slug)}
    badges={p.appStore && <Badge>App Store</Badge>}
    onPrefetch={() => preloadDoc(docsHrefFor(p.slug))}
    renderLink={routerLink}
  />
))}

// 대표작 (구 CaseStudyCard)
{pinned.map((p) => (
  <ProjectCard
    key={p.slug}
    variant="feature"
    title={p.title}
    subtitle={CASE_SUMMARY[p.slug] ?? p.subtitle}
    icon={p.icon}
    meta={projectYearLabel(p)}
    href={docsHrefFor(p.slug)}
    onPrefetch={() => preloadDoc(docsHrefFor(p.slug))}
    renderLink={routerLink}
  />
))}
```

**폴백 순서를 그대로 유지한다.**

| 상황 | 결과 |
|---|---|
| `href` 있음 | `<a>` (또는 `renderLink`) — 화살표 표시 |
| `href` 없고 `github` 만 있음 | `href={p.github}` 를 넘긴다 → `external` 자동 판정 |
| 둘 다 없음 | `<article>` — 포커스되지 않는다 |

`http(s)` href 는 자동으로 `target="_blank"` + `rel="noopener noreferrer"` 가 붙는다.
`external` prop 으로 강제할 수도 있다.

## 2. 벤토 그리드

MySelf 의 `BentoGrid`(513줄)는 **프로필 갤러리 화면**이지 그리드 컴포넌트가 아니다.
격자만 JunDS 것을 쓰고 내용은 그대로 둔다.

```tsx
import { BentoGrid } from "@junds/ui/composites";

<BentoGrid cols={4} gap={4}>
  <BentoGrid.Item colSpan={2} rowSpan={2}>
    <ProfileTile />
  </BentoGrid.Item>
  <BentoGrid.Item>
    <NowPlayingTile />
  </BentoGrid.Item>
  <BentoGrid.Item colSpan={2}>
    <WritingTile />
  </BentoGrid.Item>
</BentoGrid>
```

## 3. 등장 모션

```tsx
import { useRevealOnScroll } from "@junds/ui/hooks";

const ref = useRevealOnScroll({ selector: ".pf-reveal" });

<section ref={ref} className="pf-section">
  <div className="pf-reveal">…</div>
</section>
```

MySelf 의 기존 클래스명을 그대로 쓸 수 있다. 기본값은 `.jds-reveal` 이고,
그 경우 모션 CSS 도 `styles.css` 가 제공한다. `.pf-reveal` 을 쓴다면 모션은 MySelf 의
`portfolio.css` 가 계속 담당한다.

자세한 동작은 [05 §7](05-daily.md#7-등장-모션--userevealonscroll).

## 4. 구조화 데이터

```tsx
import { useJsonLd } from "@junds/ui/hooks";

useJsonLd("person", {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "박준하",
  url: "https://www.junome.info/portfolio",
  jobTitle: "iOS · Frontend Developer",
  sameAs: contacts.map((c) => c.href),
});
```

## 5. 음악 — 재생 엔진 `useAudioPlayer`

`MusicChapter` 하나가 엔진을 갖고, 바·전체 화면·트랙 목록이 **같은 상태를 공유한다.**

```tsx
import { useAudioPlayer, formatAudioTime, type PlayerTrack } from "@junds/ui/hooks";

const tracks: PlayerTrack[] = songs.map((s) => ({
  slug: s.slug,
  title: s.title,
  artist: s.artist,
  cover: s.cover,
  src: s.src,
}));

const player = useAudioPlayer(tracks, { initialVolume: 0.8, initialRepeat: "all" });
```

반환값:

| 이름 | 설명 |
|---|---|
| `audioRef` | `<audio ref={…} />` 에 연결 — **호출부가 렌더해야 한다** |
| `index` · `current` | 현재 트랙 인덱스 / 객체 (`null` 이면 아무것도 안 틀었다) |
| `isPlaying` · `currentTime` · `duration` · `error` | 재생 상태 |
| `volume` · `repeat` | 0~1 볼륨 / `"off" \| "one" \| "all"` |
| `play(i)` | i 번째 재생. **이미 그 트랙이면 토글** |
| `toggle()` · `next()` · `prev()` · `seek(t)` · `stop()` | 조작 |
| `setVolume(v)` · `setRepeat(m)` | 설정 |

- **`prev()` 는 3초 이상 재생됐으면 "현재 곡 처음으로"** 간다. 이전 곡으로 가는 게 아니다 —
  대부분의 플레이어가 그렇게 동작하고, 그게 사용자가 기대하는 바다.
- **재생 상태는 `play`/`pause` 이벤트로 갱신한다.** 사용자가 OS 미디어 키나 이어폰 버튼으로
  조작해도 UI 가 어긋나지 않는다.
- 자동재생 정책상 제스처 없는 `play()` 는 거부될 수 있다 — 조용히 일시정지 상태로 남는다.

`formatAudioTime(sec)` 이 `m:ss` 로 만들어 준다(음수·NaN 은 `0:00`).

> MySelf 의 `formatTime` 이 `formatAudioTime` 으로 이름이 바뀌었다. 훅 하나가 여러 도메인의
> 시간 포맷과 이름이 겹치지 않게 하려는 것이다.

## 6. 하단 재생 바 — `NowPlayingBar`

```tsx
import { NowPlayingBar } from "@junds/ui/composites";

<NowPlayingBar
  player={player}
  onExpand={() => setFullscreen(true)}
  errorMessage="파일을 찾을 수 없어요 — public/music/ 확인"
  bars={72}
/>
```

- `<audio>` 를 이 컴포넌트가 렌더하되 **트랙이 없어도 마운트를 유지한다.** 언마운트되면
  훅이 잡고 있는 ref 가 끊겨 다음 재생에서 이벤트가 하나도 오지 않는다.
- 바 자체는 트랙이 선택됐을 때만 나타난다.
- `fixed={false}` 로 두면 문서 흐름 안에 놓인다(미리보기·임베드용).
- `actions` 로 오른쪽 끝에 볼륨 슬라이더나 반복 버튼을 덧붙인다.

```tsx
<NowPlayingBar
  player={player}
  actions={
    <>
      <IconButton
        aria-label={`반복: ${REPEAT_LABEL[player.repeat]}`}
        onClick={() => player.setRepeat(nextRepeat(player.repeat))}
      >
        <RepeatIcon mode={player.repeat} />
      </IconButton>
      <Slider
        value={player.volume}
        onChange={player.setVolume}
        min={0}
        max={1}
        step={0.05}
        aria-label="볼륨"
      />
    </>
  }
/>
```

## 7. 전체 화면 플레이어 — `NowPlayingFull`

```tsx
import { NowPlayingFull } from "@junds/ui/composites";

const song = player.index !== null ? songs[player.index] : null;

<NowPlayingFull
  open={fullscreen}
  onClose={() => setFullscreen(false)}
  player={player}          // ← 같은 엔진. 화면을 열어도 재생이 끊기지 않는다
  lyrics={song?.lyrics}
  bars={72}
/>
```

- 배경은 커버에서 뽑은 색(`useDominantColor`)으로 물든다 — 앨범마다 화면 전체의 인상이
  달라져서, 제목을 읽지 않아도 무엇을 듣고 있는지 전해진다.
- 커버가 있으면 크게 흐려서 배경에 깐다. 없으면 그라디언트만 남는다.
- 가사가 없으면 플레이어가 가운데 놓인다.
- **고른 트랙이 없으면 `open` 이어도 열지 않는다** — 빈 화면을 띄우지 않기 위해서다.
- `Modal` 위에 조립돼 포커스 트랩·Escape·스크롤 잠금을 그대로 물려받는다.

## 8. 가사 — `Lyrics`

`NowPlayingFull` 안에 이미 들어 있지만, 따로 쓸 수도 있다.

```tsx
import { Lyrics } from "@junds/ui/composites";

<Lyrics
  text={song.lyrics}                                  // 빈 줄로 연 구분
  progress={player.duration ? player.currentTime / player.duration : 0}
  autoScroll
  centered={false}
  className="max-h-[60vh]"
/>
```

**연 단위인 것은 의도다.** 커버곡·자작곡 가사에 행별 타임스탬프(LRC)가 붙어 있는 경우는
드물어서, 행 단위로 맞추려 하면 대부분 어긋난 싱크만 보여 주게 된다. 전체 길이에 연 수를
균등 매핑한 근사이므로 "대략 이쯤"이다.

행별 데이터가 있다면 직접 몰아 준다.

```tsx
<Lyrics verses={verses} activeIndex={currentVerseFromLrc} />
```

- 지나간 연은 조금만 흐리게(따라 읽던 자리를 잃지 않도록), 앞으로 올 연은 더 흐리게
  (시선이 앞서 나가지 않도록).
- 현재 연이 **바뀔 때만** 스크롤한다 — 진행률이 조금 움직일 때마다 굴리면 멀미가 난다.
- `prefers-reduced-motion` 이면 즉시 점프.
- 강조된 연에 `aria-current="true"` 가 붙는다 — 시각적 밝기에만 의존하지 않는다.

## 9. 커버 · 파형

```tsx
import { AlbumArt, Waveform } from "@junds/ui/composites";

<AlbumArt
  src={song.cover}
  seed={`${song.title}-${song.artist}`}
  size={56}
  radius="md"
  glyph="♪"
/>

<Waveform
  seed={song.slug}
  progress={progress}
  playing={player.isPlaying}
  bars={72}
  height={40}
  onSeek={(f) => player.seek(f * player.duration)}
  ariaLabel={`${song.title} 재생 위치`}
/>
```

**`AlbumArt` — 커버가 없거나 깨지면 시드에서 만든 커버로 대신한다.** 채도·명도를 낮춘 두 색의
그라디언트인데, 무지개빛을 피한 건 진짜 커버들 사이에 섞였을 때 폴백만 튀어 보이지 않게
하기 위해서다. 색은 시드 해시에서 결정적으로 정해지므로 곡마다 고유하면서도 매 렌더 같다.

`alt` 를 주지 않으면 장식으로 보고 숨긴다 — 커버 옆에 곡 제목이 텍스트로 있는 보통의
배치에서 중복 낭독을 막는다.

**`Waveform` — `onSeek` 을 주면 `role="slider"` 가 된다.** 클릭·드래그뿐 아니라
`←`/`→`(5%, Shift 10%)·`Home`·`End` 로도 탐색할 수 있다. 안 주면 진행률을 보여 주는
장식이라 `aria-hidden` 이 되고, `aria-label` 을 주면 `role="img"` 로 노출된다.

실제 진폭 데이터가 있으면 `peaks` 로 넘긴다 — 없으면 시드에서 결정적으로 만든다.
파형 하나를 위해 오디오 전체를 내려받아 디코딩하는 비용을 피하기 위해서다.

## 10. 앨범색 직접 쓰기 — `useDominantColor`

```tsx
import { useDominantColor } from "@junds/ui/hooks";

const { tint, deep, ready } = useDominantColor(album.cover, album.title);

<section
  style={{ background: `linear-gradient(160deg, ${tint}, ${deep})` }}
  className={ready ? "transition-[background] duration-700" : undefined}
/>
```

- 24×24 캔버스로 줄여 채도 가중 색조 히스토그램에서 지배 색조를 고른다. 외부 라이브러리를
  쓰지 않는다.
- 결과는 `src` 기준 **모듈 캐시** — 같은 이미지는 한 번만 디코드한다.
- `src` 가 없으면 `seed` 문자열에서 무광 색을 파생한다(`AlbumArt` 의 생성 커버와 톤이 맞다).
- 교차 출처 이미지는 캔버스가 taint 되어 읽기가 막힐 수 있다. 조용히 무채색으로 떨어지므로
  UI 가 깨지진 않는다. CORS 헤더가 있는 이미지라면 `{ crossOrigin: "anonymous" }`.
- 명도를 0.36~0.56 으로 죄어 뽑으므로 위에 흰 텍스트를 얹어도 대비가 무너지지 않는다.

## 11. 연락처 · 태그

```tsx
import { Tag } from "@junds/ui/primitives";
import { DocLinks } from "@junds/ui/composites";

// 연락처는 DocLinks 로 (github/external 자동 판정)
<DocLinks
  links={[
    { href: "https://github.com/jjunhaa0211", label: "GitHub" },
    { href: "mailto:pjh02@hygino.co.kr", label: "이메일", kind: "external" },
  ]}
/>

// 태그
{work.tags.map((t) => <Tag key={t}>{t}</Tag>)}
```

## 12. 전체 조립 — 음악 챕터

12종이 한 화면에서 어떻게 맞물리는지.

```tsx
import { useAudioPlayer } from "@junds/ui/hooks";
import { NowPlayingBar, NowPlayingFull, AlbumArt } from "@junds/ui/composites";

function MusicChapter({ songs }: { songs: PlayableSong[] }) {
  const tracks = useMemo(() => songs.map(toPlayerTrack), [songs]);
  const player = useAudioPlayer(tracks);
  const [full, setFull] = useState(false);
  const song = player.index !== null ? songs[player.index] : null;

  return (
    <>
      <ul>
        {songs.map((s, i) => (
          <li key={s.slug}>
            <button onClick={() => player.play(i)} aria-current={player.index === i}>
              <AlbumArt src={s.cover} seed={`${s.title}-${s.artist}`} size={44} />
              <span>{s.title}</span>
              <span>{s.artist}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* 하단 바 — <audio> 가 여기 산다 */}
      <NowPlayingBar player={player} onExpand={() => setFull(true)} />

      {/* 전체 화면 — 같은 player 를 공유 */}
      <NowPlayingFull
        open={full}
        onClose={() => setFull(false)}
        player={player}
        lyrics={song?.lyrics}
      />
    </>
  );
}
```

핵심은 **`player` 인스턴스가 하나**라는 것이다. 목록에서 눌러 재생하고, 바에서 일시정지하고,
전체 화면을 열어도 전부 같은 `<audio>` 를 본다.

---

[← 06 서재](06-book.md) · [다음: 08 훅·토큰 →](08-hooks-tokens.md)
