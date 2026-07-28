/**
 * surface — 컴포넌트 공개 표면의 단일 수집기 (DEC-044).
 *
 * 표면을 필요로 하는 생성기가 셋이다(매니페스트·IDE 데이터·React 어댑터). 각자
 * 소스를 파싱하면 규칙이 셋으로 갈라지므로 여기 한 곳에서만 모은다.
 *
 * 어디서 무엇을 가져오는가 — 가장 정확한 출처를 각각 고른다:
 *  - 프롭 표 : **런타임** `Klass.props`. `...STYLE_PROPS` 같은 스프레드 상속이
 *    모듈 평가 시점에 이미 합쳐져 있어, 소스를 다시 읽으면 그 합성 규칙을 두 번
 *    구현하게 된다(그리고 어긋난다).
 *  - 복합 데이터 프롭 : 런타임 프로토타입의 손저작 접근자. `static props` 에 없다.
 *    setter 없는 읽기 전용(`current` 등)은 표면에서 뺀다.
 *  - 설명·프롭 주석 : 소스 JSDoc. 런타임에 남지 않는다.
 *  - 이벤트 : 소스의 `this.emit("jd-…")`. 런타임에 목록이 없다.
 *  - 허용 값 : 컴포넌트 CSS 의 `[attr="값"]` 셀렉터. 타입만 보면 String 이라
 *    열거인지 자유 문자열인지 알 수 없는데, 허용 값은 이미 CSS 에 적혀 있다.
 *    이걸 뽑아야 IDE 가 값을 제안하고 React 프롭이 유니언 타입이 된다.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const here = dirname(fileURLToPath(import.meta.url));
const webDir = join(here, "../..");
const componentsDir = join(webDir, "src/components");

/** camelCase → kebab-case (JdElement 의 attribute 이름 규칙과 동일) */
export const toAttr = (name) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const toCamel = (name) => name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

/** "jd-alert" → "Alert" */
export const pascal = (tag) =>
  tag
    .replace(/^jd-/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

/** "jd-open-change" → "onJdOpenChange" */
export const handlerName = (evt) =>
  "on" +
  evt
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

const KIND = new Map([
  [String, "string"],
  [Number, "number"],
  [Boolean, "boolean"],
]);

/* ── 소스에서만 얻을 수 있는 것들 ─────────────────────────────────────── */

const EMIT_RE = /this\.emit(?:<[^>]*>)?\(\s*"(jd-[a-z0-9-]+)"/g;

/** 파일 머리 JSDoc 의 첫 문장 — 컴포넌트 한 줄 설명 */
function headerDoc(src) {
  const m = /^\/\*\*([\s\S]*?)\*\//.exec(src);
  if (!m) return undefined;
  const body = m[1]
    .split("\n")
    .map((l) =>
      l
        .replace(/^\s*\*ID?\s?/, "")
        .replace(/^\s*\*\s?/, "")
        .trim(),
    )
    .filter(Boolean)
    .join(" ");
  // "<jd-alert> — 인라인 알림 배너 (v2 …)." 에서 설명부만
  const afterDash = body.replace(/^<[a-z-]+>\s*[—-]\s*/, "");
  const stop = /[.。]\s|$/.exec(afterDash);
  return afterDash.slice(0, stop.index + 1).trim() || undefined;
}

/** props 블록 안에서 `/** … *​/` 바로 뒤 `name:` 을 짝지어 프롭 설명을 뽑는다 */
function propDocs(src) {
  const out = {};
  const start = /static\s+(?:override\s+)?props\s*(?::[^=]+?)?=\s*(?:defineProps\s*\(\s*)?\{/.exec(
    src,
  );
  if (!start) return out;
  let depth = 0;
  let i = src.indexOf("{", start.index);
  const from = i;
  for (; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) break;
    }
  }
  const block = src.slice(from, i + 1);
  for (const m of block.matchAll(
    /\/\*\*([\s\S]*?)\*\/\s*(?:\/\/[^\n]*\n\s*)*([A-Za-z_$][\w$]*)\s*:/g,
  )) {
    const text = m[1]
      .split("\n")
      .map((l) => l.replace(/^\s*\*\s?/, "").trim())
      .filter(Boolean)
      .join(" ")
      .trim();
    if (text) out[m[2]] = text;
  }
  return out;
}

/** 컴포넌트 CSS 셀렉터가 곧 허용 값 목록 — `jd-badge[variant="primary"]` */
const ENUM_SEL = /\[([a-z][a-z0-9-]*)\s*=\s*"([^"]+)"\]/g;
/** 값이 아니라 상태·골격 표식인 attribute */
const ENUM_SKIP = new Set(["type", "role", "hidden", "slot", "for", "open"]);

function cssOptions(dir) {
  const found = {};
  const compDir = join(componentsDir, dir);
  if (!existsSync(compDir)) return found;
  for (const f of readdirSync(compDir)) {
    if (!f.endsWith(".css.ts")) continue;
    const css = readFileSync(join(compDir, f), "utf8");
    for (const [, attr, val] of css.matchAll(ENUM_SEL)) {
      if (ENUM_SKIP.has(attr) || attr.startsWith("data-") || attr.startsWith("aria-")) continue;
      const key = toCamel(attr);
      (found[key] ??= new Set()).add(val);
    }
  }
  // 값이 하나뿐이면 "선택지"가 아니라 특례 규칙이다
  return Object.fromEntries(
    Object.entries(found)
      .filter(([, s]) => s.size > 1)
      .map(([k, s]) => [k, [...s].sort()]),
  );
}

/* ── 수집 ─────────────────────────────────────────────────────────────── */

/**
 * @returns {Promise<Array<{tag,dir,name,className,description,props,events}>>}
 *   props: [{ name, kind: "string"|"number"|"boolean"|"data", attribute, reflects,
 *             default, description, options }]
 */
export async function collectSurface() {
  /* 디스크의 dist 가 아니라 **소스 엔트리를 메모리에서 번들·평가**한다 —
     Web/React 병렬 빌드 중에 dist 가 반쯤 쓰여 있어도 생성 검사가 흔들리지 않는다
     (gen-adapters 와 같은 규율). JdElement 는 Node 에 HTMLElement 가 없으면
     스텁으로 대체되므로(§3.1-1) 클래스 정의만 읽는 이 용도에 브라우저가 필요 없다. */
  const bundle = await build({
    entryPoints: [join(webDir, "src/index.ts")],
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node20",
    write: false,
    logLevel: "silent",
  });
  const { ALL_COMPONENTS } = await import(
    "data:text/javascript;base64," + Buffer.from(bundle.outputFiles[0].text).toString("base64")
  );

  const sourceByDir = new Map();
  for (const d of readdirSync(componentsDir, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const p = join(componentsDir, d.name, "element.ts");
    if (existsSync(p)) sourceByDir.set(d.name, readFileSync(p, "utf8"));
  }

  const out = [];
  for (const Klass of ALL_COMPONENTS) {
    const tag = Klass.tag;
    if (!tag) continue;
    const tagDir = tag.replace(/^jd-/, "");
    /* 태그 이름과 같은 폴더가 있어도 클래스가 그 폴더 소유라는 보장은 없다.
       jd-page-header는 page/element.ts의 JdPageHeader이고, page-header/element.ts는
       별도 JdPageHeaderBar를 소유한다. 클래스 선언을 먼저 찾아 잘못된 import를
       생성하지 않게 한다. */
    const dir = ownerDir(sourceByDir, Klass.name) ?? tagDir;
    const src = sourceByDir.get(dir);
    const docs = src ? propDocs(src) : {};
    const options = cssOptions(dir);

    const props = [];
    for (const [name, def] of Object.entries(Klass.props ?? {})) {
      const kind = KIND.get(def.type);
      if (!kind) continue;
      /* 기본값은 셀렉터가 없는 경우가 많다 — 그게 기본 스타일이라서다.
         목록에 없으면 편집기가 "되돌아갈 값"을 제안하지 못하므로 맨 앞에 넣는다. */
      let values = kind === "string" ? options[name] : undefined;
      if (
        values &&
        typeof def.default === "string" &&
        def.default &&
        !values.includes(def.default)
      ) {
        values = [def.default, ...values];
      }
      props.push({
        name,
        kind,
        attribute: def.attribute === false ? null : def.attribute || toAttr(name),
        reflects: Boolean(def.reflect),
        default: def.default,
        description: docs[name],
        options: values,
      });
    }
    for (const name of Object.getOwnPropertyNames(Klass.prototype)) {
      if (name === "constructor") continue;
      const d = Object.getOwnPropertyDescriptor(Klass.prototype, name);
      if (!d?.set) continue;
      if (props.some((p) => p.name === name)) continue;
      props.push({
        name,
        kind: "data",
        attribute: null,
        reflects: false,
        description: docs[name],
      });
    }
    props.sort((a, b) => a.name.localeCompare(b.name));

    const events = src ? [...new Set([...src.matchAll(EMIT_RE)].map((m) => m[1]))].sort() : [];
    out.push({
      tag,
      dir,
      name: pascal(tag),
      className: Klass.name,
      description: src ? headerDoc(src) : undefined,
      props,
      events,
    });
  }
  out.sort((a, b) => a.tag.localeCompare(b.tag));
  return out;
}

/** 하위 요소 클래스가 사는 폴더 찾기 (JdCardHeader → card) */
function ownerDir(sourceByDir, className) {
  const needle = new RegExp(`\\bclass\\s+${className}\\b`);
  for (const [dir, src] of sourceByDir) if (needle.test(src)) return dir;
  return null;
}
