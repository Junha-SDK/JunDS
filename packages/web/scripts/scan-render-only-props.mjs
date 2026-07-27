/**
 * scan-render-only-props — "바꿔도 안 바뀌는 프롭" 정적 검출기 (DEC-044).
 *
 * JdElement 의 계약(03-web-arch §1): render() 는 골격 1회, update() 는 상태 반영 N회.
 * 그래서 **선언된 프롭을 render() 안에서만 읽으면** 최초 1회는 맞게 그려지지만
 * 그 뒤 소비자가 값을 바꿔도 화면이 따라오지 않는다 — 프로퍼티 설정도, attribute
 * 변경도, React 어댑터의 리렌더도 전부 update() 로 들어오기 때문이다.
 *
 * 런타임 실측(DOM 지문 비교)은 조건부 표면에서 오탐이 많다(analog 모드에서만 쓰는
 * size, 비었을 때만 보이는 emptyMessage…). 여기서는 **읽는 위치**만 본다:
 *
 *   declared(props) ∩ read-in-render ∖ read-in-update  →  갱신 경로 없음
 *
 * 정적 파싱이라 다음은 의도적으로 놓친다(과탐 대신 미탐을 택한다):
 *  - render() 가 부르는 사설 메서드가 프롭을 읽고, 그 메서드를 update() 도 부르는 경우
 *    → 호출 그래프를 1단계 따라가 해소한다(#foo() 호출까지만. 2단계는 추적하지 않음).
 *  - 프롭을 이벤트 핸들러에서만 읽는 경우(동작 전용) → 애초에 render 에 없으니 무관.
 *
 * 실행:  node packages/web/scripts/scan-render-only-props.mjs [--json] [--check]
 *   --check 는 ALLOW 목록 밖의 검출이 하나라도 있으면 exit 1 (게이트용).
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(here, "../src/components");

/**
 * 승인된 예외 — "render 에서만 읽는 것이 옳다"고 판단한 프롭.
 * 각 항목에 이유를 남긴다. 이유 없이 추가하지 말 것.
 */
const ALLOW = {
  // 이름이 곧 계약인 "초기값" 프롭 — 이후 상태는 사용자 조작이 소유한다.
  // 나중에 바꿔서 화면이 따라오면 오히려 조작을 덮어쓰는 버그가 된다.
  "sidebar-provider": ["defaultCollapsed"],
};

/**
 * 이벤트 리스너 등록의 인자를 통째로 지운다.
 *
 * `register.addEventListener("click", () => this.emit(…, { name: this.name }))` 의
 * `this.name` 은 render() 안에 적혀 있지만 **클릭 시점**에 읽힌다 — 언제나 최신 값이므로
 * 갱신 경로가 없는 것이 아니다. 지우지 않으면 이런 지연 읽기가 전부 오탐이 된다(실측).
 */
function stripListeners(body) {
  if (!body) return body;
  let out = body;
  for (;;) {
    const i = out.indexOf(".addEventListener(");
    if (i < 0) return out;
    let depth = 0;
    let j = out.indexOf("(", i);
    const start = j;
    for (; j < out.length; j++) {
      if (out[j] === "(") depth++;
      else if (out[j] === ")") {
        depth--;
        if (depth === 0) break;
      }
    }
    // 남긴 자리에 다시 .addEventListener( 가 보이면 같은 지점을 무한히 다시 찾는다 —
    // 이름을 지운 중립 토큰으로 바꾼다.
    out = out.slice(0, i) + ".__listener__()" + out.slice(j + 1);
  }
}

/** 중괄호 균형으로 메서드 본문을 잘라낸다 (문자열/주석은 근사 처리) */
function methodBody(src, signatureRe) {
  const m = signatureRe.exec(src);
  if (!m) return null;
  let i = src.indexOf("{", m.index);
  if (i < 0) return null;
  let depth = 0;
  const start = i;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  return null;
}

/**
 * `this.foo` 읽기와 `this.#foo` 사설 멤버 참조를 나눠 담는다.
 * 사설 멤버는 메서드 호출뿐 아니라 **게터 읽기**(`this.#list`)도 프롭을 경유할 수 있어
 * 괄호 유무로 가르지 않는다 — 가르면 게터를 통한 갱신 경로를 놓쳐 오탐이 난다(실측: typewriter).
 */
function readsOf(body) {
  const props = new Set();
  const members = new Set();
  if (!body) return { props, members };
  for (const m of body.matchAll(/this\.(#?[A-Za-z_$][\w$]*)/g)) {
    const name = m[1];
    if (name.startsWith("#")) members.add(name);
    else props.add(name);
  }
  return { props, members };
}

/** static props 블록에서 선언 키를 뽑는다 (스프레드는 여기서 다루지 않는다 — 지역 선언만) */
function declaredProps(src) {
  const body = methodBody(src, /static\s+(?:override\s+)?props\s*=/);
  if (!body) return new Set();
  const keys = new Set();
  // 최상위 깊이의 `key:` 만 (중첩 객체의 type/default 를 걸러낸다)
  let depth = 0;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    else if (depth === 1) {
      const rest = body.slice(i);
      const m = /^["']?([A-Za-z_$][\w$]*)["']?\s*:/.exec(rest);
      if (m && (i === 0 || /[\s,{]/.test(body[i - 1]))) keys.add(m[1]);
    }
  }
  return keys;
}

const findings = [];
for (const dir of readdirSync(componentsDir, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const elementPath = join(componentsDir, dir.name, "element.ts");
  if (!existsSync(elementPath)) continue;
  const src = readFileSync(elementPath, "utf8");
  const declared = declaredProps(src);
  if (declared.size === 0) continue;

  const renderBody = methodBody(src, /protected\s+(?:override\s+)?render\s*\(/);
  const updateBody = methodBody(src, /protected\s+(?:override\s+)?update\s*\(/);
  if (!renderBody || !updateBody) continue; // update() 가 없으면 갱신 계약 자체가 없다

  const r = readsOf(stripListeners(renderBody));
  const u = readsOf(updateBody);

  /* 사설 멤버 그래프를 2단계까지 따라간다 — render/update 가 부르는 헬퍼가 다시
     헬퍼를 부르는 구조가 흔하다(#restart → #list → this.text). 게터·세터·async·
     static 접두를 모두 허용해야 게터 경유 읽기를 놓치지 않는다. */
  const memberBody = (name) =>
    methodBody(
      src,
      new RegExp(
        `(?:^|\\n)\\s*(?:static\\s+)?(?:private\\s+)?(?:get\\s+|set\\s+|async\\s+)?${name.replace("#", "\\#")}\\s*\\(`,
      ),
    );
  const expand = (acc, members, depth) => {
    if (depth === 0) return;
    for (const name of members) {
      const body = memberBody(name);
      if (!body) continue;
      const inner = readsOf(stripListeners(body));
      for (const p of inner.props) acc.add(p);
      expand(acc, inner.members, depth - 1);
    }
  };
  expand(r.props, r.members, 2);
  expand(u.props, u.members, 2);

  const renderOnly = [...declared].filter((p) => r.props.has(p) && !u.props.has(p));
  const allow = ALLOW[dir.name] ?? [];
  const flagged = renderOnly.filter((p) => !allow.includes(p));
  if (flagged.length) findings.push({ component: dir.name, props: flagged });
}

const json = process.argv.includes("--json");
if (json) {
  console.log(JSON.stringify(findings, null, 2));
} else {
  const total = findings.reduce((n, f) => n + f.props.length, 0);
  console.log(`render() 에서만 읽는 프롭: ${total}개 / ${findings.length}컴포넌트`);
  for (const f of findings) console.log(`  ${f.component.padEnd(28)} ${f.props.join(", ")}`);
}
if (process.argv.includes("--check") && findings.length) {
  console.error("\n✗ 갱신 경로가 없는 프롭이 있다 — update() 에서도 읽거나 ALLOW 에 이유와 함께 등재할 것");
  process.exit(1);
}
