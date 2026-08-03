#!/usr/bin/env node
/**
 * gen-layout-map — 레이아웃 표면의 3플랫폼 대응표 (DEC-054)
 *
 * ## 왜 필요한가
 * 웹 표면은 `custom-elements.json`(CEM)이 있어 편집기가 `<jd-switcher ` 까지 치면
 * 속성과 값을 알려준다. iOS 표면은 그런 통로가 없었다 — UIKit/SwiftUI의 배치 API는
 * doc comment와 데모의 `recipe` 문자열에만 존재해서, 사람이든 에이전트든
 * "웹의 이건 iOS에서 뭐지"를 물으면 소스를 뒤지는 수밖에 없었다.
 *
 * 그 결과가 예측 가능한 실패다: 웹만 보고 iOS에 없는 API를 지어내거나, iOS만 보고
 * 웹에 이미 있는 것을 다시 만든다. 대응표를 **기계가 읽는 형식**으로 내보내면
 * 그 두 실패가 같이 사라진다.
 *
 * ## 왜 손으로 적은 표인가 (그리고 왜 그래도 썩지 않는가)
 * 세 플랫폼의 API 모양이 달라서(태그 / 자유 함수 / Layout 구조체) 한쪽에서 다른 쪽을
 * 기계적으로 유도할 수 없다. 그래서 대응 관계 자체는 사람이 적는다.
 * 대신 **적힌 것이 실제로 존재하는지는 전부 검증한다** — 웹 태그는 CEM에서, Swift
 * 심볼은 소스에서 찾는다. 이름을 바꾸거나 지우면 `--check`가 CI에서 잡는다.
 * 손으로 적은 표가 썩는 이유는 검증이 없어서지 손으로 적어서가 아니다.
 *
 * 실행:
 *   node scripts/gen-layout-map.mjs           # .ai/layout-map.json 생성
 *   node scripts/gen-layout-map.mjs --check   # 검증만 (드리프트 게이트)
 */
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, "..");
const CEM = join(REPO_ROOT, "packages/web/custom-elements.json");
const UIKIT_DIR = join(REPO_ROOT, "packages/ios/Sources/JunDSUIKit");
const SWIFTUI_DIR = join(REPO_ROOT, "packages/ios/Sources/JunDSSwiftUI");
const CORE_DIR = join(REPO_ROOT, "packages/ios/Sources/JunDSCore");
const OUT = join(REPO_ROOT, ".ai/layout-map.json");

/* ─── 대응표 (사람이 적는 유일한 부분) ─── */

/**
 * intent: 화면을 짜는 사람이 떠올리는 말. 이 표를 고르는 키가 CSS 속성명이나
 * UIStackView 용어가 아니라 의도인 것이 요점이다.
 */
const LAYOUT_MAP = [
  {
    intent: "세로로 쌓기",
    when: "가장 흔한 기본 배치. 순서대로 위에서 아래로.",
    web: "jd-vstack",
    uikit: "JdVStack",
    swiftui: "VStack",
    note: "SwiftUI는 표준 VStack을 그대로 쓴다 — 같은 일을 하는 타입을 새로 만들지 않는다.",
  },
  {
    intent: "가로로 늘어놓기",
    when: "아이콘 + 라벨처럼 한 줄에 나란히.",
    web: "jd-hstack",
    uikit: "JdHStack",
    swiftui: "HStack",
  },
  {
    intent: "넘치면 다음 줄로",
    when: "태그·칩처럼 개수가 정해지지 않은 묶음.",
    web: "jd-wrap",
    uikit: "JdWrapView",
    swiftui: "JdFlowLayout",
  },
  {
    intent: "양끝으로 밀기",
    when: "제목은 왼쪽, 버튼은 오른쪽. 헤더·툴바.",
    web: "jd-split",
    uikit: "JdSplitView",
    swiftui: "JdSplit",
  },
  {
    intent: "좁으면 세로로 접기",
    when: "넓으면 나란히, 좁으면 위아래. 브레이크포인트를 고르지 않아도 된다.",
    web: "jd-switcher",
    uikit: "JdSwitcherView",
    swiftui: "JdSwitcher",
    note: "셋 다 화면이 아니라 **자기가 놓인 자리**의 폭을 본다 — 사이드바 안에 중첩해도 맞다.",
  },
  {
    intent: "사이드바 + 본문",
    when: "목차 옆에 본문. 본문이 좁아지면 자동으로 쌓인다.",
    web: "jd-sidebar-layout",
    uikit: "JdSidebarLayoutView",
    swiftui: "JdSidebarLayout",
    note: "꺾이는 폭을 적지 않는다 — 본문 최소 폭에서 따라 나온다.",
  },
  {
    intent: "가운데 정렬",
    when: "빈 상태·로딩처럼 한 덩어리를 가운데.",
    web: "jd-center",
    uikit: "jdCenter(in:)",
    swiftui: "frame(maxWidth:maxHeight:alignment:)",
    note: "UIKit은 컨테이너가 아니라 배치 한 줄이다 — 래퍼 뷰를 한 겹 더 만들지 않는다.",
  },
  {
    intent: "격자",
    when: "카드 목록처럼 열이 정해진 배치.",
    web: ["jd-grid", "jd-grid-layout", "jd-simple-grid"],
    uikit: "JdColumnsView",
    swiftui: "LazyVGrid",
    note: "셋은 같은 구현의 별칭 파생이다 — jd-simple-grid는 min-child-width 표면만 다르다.",
  },
  {
    intent: "방향 가변 스택",
    when: "가로/세로를 값으로 정해야 할 때. 방향이 고정이면 vstack/hstack이 읽기 쉽다.",
    web: "jd-stack",
    uikit: "JdStackView",
    swiftui: "VStack / HStack",
  },
  {
    intent: "스타일 상자",
    when: "여백·배경·모서리만 주는 원형 컨테이너.",
    web: ["jd-box", "jd-flex"],
    uikit: null,
    swiftui: null,
    note: "iOS는 컴포넌트가 아니라 **토큰 모디파이어 체인**이 Box다 (04 §10.1).",
  },
  {
    intent: "묶음 (줄바꿈 허용)",
    when: "버튼 몇 개를 한 덩어리로. jd-wrap과 같은 구현이다.",
    web: "jd-group",
    uikit: "JdWrapView",
    swiftui: "JdFlowLayout",
  },
  {
    intent: "종횡비 고정",
    when: "썸네일·미디어 영역을 16:9로.",
    web: "jd-aspect-ratio-box",
    uikit: "jdAspect(_:)",
    swiftui: "aspectRatio(_:contentMode:)",
  },
  {
    intent: "덮개",
    when: "콘텐츠 위에 딤·로딩을 겹친다.",
    web: "jd-overlay",
    uikit: null,
    swiftui: "overlay(_:)",
    note: "UIKit은 jdFill(parent)로 위에 얹는 것이 그 자리다 — 전용 타입을 두지 않았다.",
  },
  {
    intent: "큰 목록·격자 (스크롤)",
    when: "셀이 많아 재사용이 필요한 목록·격자. 정적 배치용 격자와는 다른 물건이다.",
    web: null,
    uikit: "JdCollectionLayout",
    swiftui: "LazyVGrid / List",
    note: "UICollectionViewCompositionalLayout과 경쟁하지 않고 **얹는다** — JdGap·JdBreakpoint로 NSCollectionLayoutSection을 만든다. adaptiveGrid는 최소 셀 폭만 주면 열 수가 컨테이너 폭에서 따라 나온다(웹 auto-fill 동형). 웹은 CSS grid가 같은 일을 이미 하므로 전용 태그가 없다.",
  },
  {
    intent: "본문 폭 제한",
    when: "넓은 화면에서 글줄이 너무 길어지지 않게.",
    web: "jd-container",
    uikit: "JdContainerSize",
    swiftui: "JdContainerSize",
    note: "iOS는 컴포넌트가 아니라 값이다 — frame(maxWidth:)에 넣어 쓴다 (04 §10.1).",
  },
  {
    intent: "특정 폭에서만 보이기",
    when: "좁은 화면에서 부가 정보를 숨긴다.",
    web: "jd-show",
    uikit: null,
    swiftui: "jdShow(above:below:)",
    note: "UIKit 대응은 없다 — isHidden을 직접 다루거나 JdSwitcherView로 배치를 바꾸는 편이 낫다.",
  },
  {
    intent: "남는 공간 밀어내기",
    when: "한쪽으로 몰아붙이는 신축 여백.",
    web: "jd-spacer",
    uikit: "JdFlexSpacerView",
    swiftui: "Spacer",
    note: "웹 jd-spacer는 **고정** 간격, JdFlexSpacerView는 **신축**이다 — 이름이 같아 보이지만 다르다.",
  },
];

/**
 * JdBox 계열이지만 **새 배치 의도가 아닌** 컴포넌트.
 *
 * 이 목록이 왜 있나: 아래 검증이 "JdBox를 상속하는 새 컴포넌트가 생겼는데 대응표에도
 * 이 목록에도 없다"를 실패로 만든다. 즉 새 컨테이너를 추가하는 사람이 **판단을 미룰 수
 * 없다** — 새 의도면 표에 적고, 아니면 여기에 이유와 함께 적는다.
 */
const NOT_A_LAYOUT_INTENT = {
  card: "표면(테두리·그림자·패딩) 컴포넌트 — 배치는 안에 든 스택이 한다",
  "spotlight-card": "card의 시각 변형",
  "button-group": "버튼 묶음의 시각 규칙(붙은 모서리) — 배치는 group과 동형",
  "bento-grid": "격자 위에 세운 패턴 — 의도는 '격자'에 이미 있다",
  "photo-grid": "격자 위에 세운 패턴",
  page: "화면 골격 패턴 — 배치 프리미티브가 아니다",
};

/** 세 플랫폼이 공유하는 어휘 — 이름 하나가 어디서나 같은 값을 뜻한다 (DEC-045) */
const SHARED_VOCABULARY = {
  breakpoint: {
    names: ["sm", "md", "lg", "xl", "2xl"],
    source: "tokens/breakpoint.json",
    web: '--jd-breakpoint-*, threshold="md", p="4 md:6"',
    ios: "JdBreakpoint.md, jdShow(above: .md)",
    note: "웹은 뷰포트, iOS는 컨테이너 폭을 기준으로 해석한다 (04 §10).",
  },
  gap: {
    names: ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"],
    source: "tokens/space.json",
    web: 'gap="md", p="md"',
    ios: "JdGap.md",
  },
  align: {
    names: ["start", "center", "end", "stretch", "baseline"],
    source: "웹 ALIGN_MAP ↔ JdAlign",
    web: 'align="center"',
    ios: "JdAlign.center",
    note: "UIKit의 .fill이 stretch다 — 그 이름 차이를 JdAlign이 흡수한다.",
  },
  container: {
    names: ["xs", "sm", "md", "lg", "xl", "2xl", "full"],
    source: "tokens/container.json",
    web: 'jd-container[size="lg"]',
    ios: "JdContainerSize.lg.maxWidth",
    note: "full은 상한 없음이라 토큰에 숫자가 없다.",
  },
};

/* ─── 검증 ─── */

function walkSwift(dir) {
  let text = "";
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) text += walkSwift(p);
    else if (entry.endsWith(".swift")) text += readFileSync(p, "utf8");
  }
  return text;
}

function webTags() {
  const cem = JSON.parse(readFileSync(CEM, "utf8"));
  return new Set(
    (cem.modules ?? [])
      .flatMap((m) => m.declarations ?? [])
      .map((d) => d.tagName)
      .filter(Boolean),
  );
}

/** Swift 심볼이 실제로 선언돼 있는가. `foo(bar:)` 형태는 함수명만 본다. */
function declaresSymbol(source, symbol) {
  const base = symbol.replace(/\(.*$/, "");
  const patterns = [
    `public struct ${base}`,
    `public final class ${base}`,
    `public class ${base}`,
    `public enum ${base}`,
    `public func ${base}(`,
    `func ${base}(`, // extension 안의 public func — 접근제어가 extension에 붙은 경우
  ];
  return patterns.some((p) => source.includes(p));
}

/** element.ts가 JdBox 계열을 상속하는 컴포넌트 디렉터리 (= 배치 컨테이너의 구조적 신호) */
function boxFamilyDirs() {
  const dir = join(REPO_ROOT, "packages/web/src/components");
  const out = new Set();
  for (const entry of readdirSync(dir)) {
    let source;
    try {
      source = readFileSync(join(dir, entry, "element.ts"), "utf8");
    } catch {
      continue;
    }
    if (/extends\s+(JdBox|JdGridLayout|JdGroup|JdStack|JdContainer)\b/.test(source)) out.add(entry);
  }
  return out;
}

function verify() {
  const tags = webTags();
  // Core는 두 계통이 모두 의존한다 — JdContainerSize·JdBreakpoint처럼 순수 값 타입은
  // 어느 한쪽에 두지 않고 Core에 한 번만 선언하므로, 양쪽 검증에서 함께 본다.
  const core = walkSwift(CORE_DIR);
  const uikit = walkSwift(UIKIT_DIR) + core;
  const swiftui = walkSwift(SWIFTUI_DIR) + core;
  const errors = [];

  for (const row of LAYOUT_MAP) {
    for (const tag of Array.isArray(row.web) ? row.web : [row.web]) {
      if (tag && !tags.has(tag)) {
        errors.push(`"${row.intent}": 웹 태그 <${tag}>가 CEM에 없다`);
      }
    }
    if (row.uikit && !declaresSymbol(uikit, row.uikit)) {
      errors.push(`"${row.intent}": UIKit 심볼 ${row.uikit}를 소스에서 못 찾았다`);
    }
    // SwiftUI 열은 표준 SwiftUI API(VStack, LazyVGrid…)도 담으므로 우리 것만 검증한다
    if (row.swiftui?.startsWith("Jd") && !declaresSymbol(swiftui, row.swiftui)) {
      errors.push(`"${row.intent}": SwiftUI 심볼 ${row.swiftui}를 소스에서 못 찾았다`);
    }
  }

  // ── 역방향: 배치 컨테이너가 생겼는데 표에도 제외 목록에도 없으면 실패 ──
  // 정방향(표 → 소스)만 보면 "적힌 것은 다 맞지만 빠진 게 있다"를 못 잡는다.
  // 그게 대응표가 낡는 실제 경로다.
  const mapped = new Set(
    LAYOUT_MAP.flatMap((r) => (Array.isArray(r.web) ? r.web : [r.web])).filter(Boolean),
  );
  for (const dir of boxFamilyDirs()) {
    if (dir in NOT_A_LAYOUT_INTENT) continue;
    if (mapped.has(`jd-${dir}`)) continue;
    errors.push(
      `배치 컨테이너 <jd-${dir}>가 대응표에 없다 — 새 배치 의도면 LAYOUT_MAP에, ` +
        `아니면 NOT_A_LAYOUT_INTENT에 이유와 함께 넣어라`,
    );
  }
  return errors;
}

/* ─── main ─── */

const check = process.argv.includes("--check");
const errors = verify();
if (errors.length) {
  console.error("[layout-map] 표와 소스가 어긋난다:");
  for (const e of errors) console.error(`  - ${e}`);
  console.error("  → scripts/gen-layout-map.mjs의 LAYOUT_MAP을 고치거나, 심볼을 되살려라.");
  process.exit(1);
}

const payload = {
  $schema: "레이아웃 의도 → 3플랫폼 API 대응표. 생성: scripts/gen-layout-map.mjs",
  $note:
    "의도(intent)로 찾는다. CSS 속성명이나 UIStackView 용어가 아니라 '무엇을 하고 싶은가'가 키다.",
  vocabulary: SHARED_VOCABULARY,
  layouts: LAYOUT_MAP,
  notLayoutIntents: NOT_A_LAYOUT_INTENT,
};

if (check) {
  const current = (() => {
    try {
      return readFileSync(OUT, "utf8");
    } catch {
      return null;
    }
  })();
  if (current !== JSON.stringify(payload, null, 2) + "\n") {
    console.error(
      "[layout-map] .ai/layout-map.json이 낡았다 — `npm run gen:layout-map` 후 커밋할 것.",
    );
    process.exit(1);
  }
  console.log(`[layout-map] OK — ${LAYOUT_MAP.length}종, 소스와 일치`);
} else {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
  console.log(`[layout-map] ${LAYOUT_MAP.length}종 → ${OUT}`);
}
