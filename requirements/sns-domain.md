# SNS 도메인 — Social Feed Components

- **Slug:** `sns-domain`
- **Status:** active
- **Owner:** goodjunha@gmail.com
- **Last updated:** 2026-05-04

## Goal

소셜 네트워크/커뮤니티 기능에 공통으로 필요한 시각·인터랙션 단위를 한 묶음
으로 제공한다. 게시물 카드, 댓글, 프로필, 스토리 링, 팔로우/좋아요 등 일반
패턴을 별도 라이브러리(react-twitter, react-instagram-\* 등) 없이 JunDS만으로
조립한다.

## Scope

**In scope**

- 게시물: `PostCard` (작성자 + 본문 + 미디어 + 액션 바)
- 댓글: `CommentThread` (중첩 + 좋아요/답글 + 깊이 제한)
- 프로필: `ProfileHeader` (배너 + 아바타 + 통계 + 액션 슬롯)
- 스토리: `StoryCircle` (그라디언트 링 + unread/read/live/muted 상태)
- 인터랙션: `LikeButton`, `FollowButton` (primitive)
- 본문 칩: `MentionChip`(`@`), `Hashtag`(`#`)
- 리액션: `ReactionPicker` (이모지 바 드롭다운)
- 투표: `PollCard` (단일 선택 + 결과 막대 + 마감)
- 화면 패턴: `SocialFeed` (스토리 바 + 무한 스크롤 게시물)
- 훅: `useInfiniteFeed` (cursor 페이지네이션)

**Out of scope**

- 실시간 갱신/WebSocket — 호출자 측에서 `useEffect` 또는 SWR/RTK 사용.
- DM/채팅 — 별도 도메인 (`ChatThread`, 후속).
- 알림 — `NotificationCenter` (이미 존재하는 pattern) 사용.
- 콘텐츠 모더레이션/필터 — 서버 측 책임.
- 광고/스폰서 게시물 — `PostCard`에 `badge` slot으로 표현.

## User stories / acceptance criteria

- [x] **As a 사용자** I can 피드 끝까지 스크롤하면 다음 페이지가 자동 로드된다
      (`SocialFeed onLoadMore` + `useInfiniteFeed`).
- [x] **As a 사용자** I can 좋아요 버튼을 클릭하면 하트가 채워지고 즉시 +1
      카운트가 반영된다 (`LikeButton liked={true} count={41}`).
- [x] **As a 작성자** I can 본문에 `@user`, `#tag`을 칩으로 자동 변환할 수 있다
      (`MentionChip`/`Hashtag` + 사용자 측 파서).
- [x] **As a 사용자** I can 게시물 좋아요/댓글/공유 액션 중 일부만 표시할 수
      있다 (`onLike`/`onComment`/`onShare` 콜백 유무로 결정).
- [x] **As a 사용자** I can 프로필 헤더에서 팔로우 버튼이 hover 시 "언팔로우"
      로 바뀌어 의도하지 않은 언팔을 방지한다 (`FollowButton unfollowOnHover`).
- [x] **As a 시청자** I can 스토리 링에서 LIVE 사용자를 빨강 그라디언트와 LIVE
      배지로 즉시 식별한다 (`StoryCircle state="live"`).
- [x] **As a 사용자** I can 투표 카드에서 한 번 투표 후 결과 막대를 보고 다시
      투표할 수 없다 (`PollCard votedId` 가드).

## Design / behavior notes

- **`PostCard.onClick` vs 액션 버튼**: 카드 전체 클릭 핸들러와 좋아요/댓글
  버튼이 충돌. 액션 footer에 `e.stopPropagation()` 적용해 카드 클릭만 트리거
  되지 않도록 함.
- **`CommentThread maxDepth`**: 깊이 3 이상이면 답글 버튼 숨김 — 무한 중첩
  방지. UX적으로 4단 이상은 가독성 떨어짐.
- **`useInfiniteFeed` 동시 호출 가드**: `inflight.current`로 중복 fetch 방지.
  IntersectionObserver가 빠르게 발화해도 한 번에 한 페이지만 로드.
- **`useInfiniteFeed.reset`**: cursor 초기화 + 첫 페이지 재요청. requestId
  증가시켜 진행 중 요청은 무시.
- **`PollCard alwaysShowResults={false}`** (기본): 투표 전엔 옵션 라벨만,
  투표 후 결과 막대. `true`면 투표 전에도 결과 표시 (관전 모드).
- **`StoryCircle.state="muted"`**: 시청 알림 끈 사용자. 회색 링 + 라벨.
- **`MentionChip`** vs `composites/Mention`: 동명 충돌 방지를 위해 primitive는
  `MentionChip` (정적 표시). composites/Mention은 `@` 트리거 자동완성 입력
  컴포넌트 — 둘은 완전히 다른 역할.
- **a11y**:
  - `LikeButton` `aria-pressed` 토글, motion-reduce 시 scale 비활성화
  - `FollowButton` `aria-pressed` 토글, hover 텍스트는 시각만 — 스크린리더는
    상태(`aria-pressed`)를 읽음
  - `ReactionPicker` `aria-haspopup="menu"` + `aria-expanded`
  - `PollCard` `aria-pressed` (선택), `aria-disabled` (이미 투표)
  - `NotificationCenter`(기존) `aria-label`에 안 읽은 수 interpolation
  - `ProfileHeader` `<header>`, 통계는 `<ul>` semantic
- **z-index**: `ReactionPicker` 드롭다운 `z-20`, `NotificationCenter` 드롭다운
  `z-50` (Modal보다 위는 의도적이며 알림은 항상 최상단).

## Touched files (for agents)

- `ds/composites/PostCard/PostCard.tsx`
- `ds/composites/CommentThread/CommentThread.tsx`
- `ds/composites/ProfileHeader/ProfileHeader.tsx`
- `ds/composites/StoryCircle/StoryCircle.tsx`
- `ds/composites/ReactionPicker/ReactionPicker.tsx`
- `ds/composites/PollCard/PollCard.tsx`
- `ds/primitives/LikeButton/LikeButton.tsx`
- `ds/primitives/FollowButton/FollowButton.tsx`
- `ds/primitives/MentionChip/MentionChip.tsx`
- `ds/primitives/Hashtag/Hashtag.tsx`
- `ds/patterns/SocialFeed/SocialFeed.tsx`
- `ds/hooks/useInfiniteFeed.ts`
- `.ai/recipes/social-feed.md`
- `.ai/recipes/user-profile.md`
- `.ai/recipes/story-bar.md`

## Open questions

- **스토리 자동 진행**: `StoryBar` 레시피는 풀스크린 시청 시 다음 슬라이드 자동
  넘김(3-5초)을 시연. 라이브러리 단에서 `<StoryViewer>` 컴포넌트로 추출할지
  결정 필요.
- **본문 마크다운**: 현재 `PostCard.content`는 ReactNode. 마크다운/MDX
  자동 렌더는 외부 라이브러리 책임. 추후 `<RichText>` primitive 도입 검토.
- **차단/뮤트 UX**: `ProfileHeader.actions`에 사용자 정의 슬롯이 있어
  Dropdown으로 차단/뮤트 추가 가능. 표준 패턴을 recipe로 굳힐지 검토.
- **좋아요 acknowledge**: `LikeButton` 클릭 시 옵티미스틱 업데이트 vs 서버 응답
  대기. 현재 컴포넌트는 controlled(상태 외부 관리), 사용자 측에서 결정.
  옵티미스틱 패턴을 recipe로 추가하는 것 권장.

## Changelog

- 2026-05-04 — created.
