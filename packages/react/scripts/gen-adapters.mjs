/**
 * gen-adapters — 손저작 3종을 제외한 <jd-*> React 어댑터를 생성한다 (DEC-044).
 *
 * 표면은 **파싱하지 않고 런타임에서 읽는다.** `static props = { ...STYLE_PROPS, … }`
 * 같은 스프레드 상속은 모듈 평가 시점에 이미 하나의 객체로 합쳐져 있어서, 소스를
 * 다시 해석하면 그 합성 규칙을 두 번 구현하게 된다(그리고 어긋난다). @junds/web
 * 소스 엔트리를 메모리에서 번들·평가해 `Klass.props` 를 읽는 것이 유일한 정본이다.
 * 디스크의 dist를 읽지 않으므로 Web/React 병렬 빌드 중에도 생성 검사가 흔들리지 않는다.
 * — JdElement 는 Node 에 HTMLElement 가 없을 때 스텁으로 대체되므로(§3.1-1)
 *   클래스 정의만 읽는 이 용도에서는 브라우저가 필요 없다.
 *
 * 복합 데이터 프롭(배열·객체)은 `static props` 에 없다. 접근자는 finalize() 전
 * 프로토타입에서 찾고, renderItem 같은 공개 writable class field는 AST에서 찾는다.
 * setter 없는 읽기 전용 getter(`current` 등)는 어댑터 표면에서 뺀다.
 *
 * 이벤트는 TypeScript AST/타입 검사기로 `this.emit("jd-…", detail)`을 읽는다.
 * detail이 공개 타입으로 안전하게 표현되는 경우 `CustomEvent<T>`로 방출하고, 소스의
 * 비공개 타입에 의존해 거짓 타입을 만들게 되는 경우에만 정직하게 unknown으로 남긴다.
 *
 * 실행:  node packages/react/scripts/gen-adapters.mjs [--check]
 *   --check 는 산출물이 디스크와 다르면 exit 1 (드리프트 게이트).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import ts from "typescript";

const here = dirname(fileURLToPath(import.meta.url));
const reactDir = join(here, "..");
const webDir = join(reactDir, "../web");
const OUT_DIR = join(reactDir, "src/generated");
const MANIFEST = join(reactDir, "scripts/adapters.generated.json");

/** 손으로 짠 어댑터가 이미 소유한 태그 — 생성 대상에서 뺀다 */
const HAND_WRITTEN = new Set(["jd-button", "jd-text-field", "jd-modal"]);

const runtimeBundle = await build({
  entryPoints: [join(webDir, "src/index.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node20",
  write: false,
  logLevel: "silent",
});
const runtimeUrl =
  "data:text/javascript;base64," +
  Buffer.from(runtimeBundle.outputFiles[0].text).toString("base64");
const { ALL_COMPONENTS } = await import(runtimeUrl);

/* ── 이벤트 수확 (TypeScript AST + checker) ── */
const componentsDir = join(webDir, "src/components");
const sourcePaths = readdirSync(componentsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(componentsDir, entry.name, "element.ts"));
const program = ts.createProgram(sourcePaths, {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  lib: ["lib.es2022.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts"],
  strict: true,
  skipLibCheck: true,
});
const checker = program.getTypeChecker();
const eventsByTag = new Map();
const elementByTag = new Map();
const sourceDataPropsByTag = new Map();

const TYPE_FLAGS = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.InTypeAlias;
const BUILTIN_TYPES = new Set([
  "Array",
  "ArrayBuffer",
  "Blob",
  "CustomEvent",
  "Date",
  "Element",
  "Error",
  "Event",
  "File",
  "HTMLElement",
  "Map",
  "Node",
  "Promise",
  "Readonly",
  "ReadonlyArray",
  "Record",
  "Set",
  "URL",
]);

function exportedTypeNames(sourceFile) {
  const names = new Set();
  for (const statement of sourceFile.statements) {
    const exported = statement.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    );
    if (!exported || !("name" in statement) || !statement.name) continue;
    if (ts.isIdentifier(statement.name)) names.add(statement.name.text);
  }
  return names;
}

function isThisEmit(node) {
  return (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.name.text === "emit" &&
    node.expression.expression.kind === ts.SyntaxKind.ThisKeyword &&
    node.arguments[0] !== undefined &&
    ts.isStringLiteral(node.arguments[0]) &&
    /^jd-[a-z0-9-]+$/.test(node.arguments[0].text)
  );
}

function eventDetailType(detail, elementType, publicTypes) {
  if (!detail) return { text: "void", imports: [] };

  // `this.value`처럼 공개 프로퍼티를 그대로 보내는 경우 element 선언을 직접 참조한다.
  if (
    ts.isPropertyAccessExpression(detail) &&
    detail.expression.kind === ts.SyntaxKind.ThisKeyword
  ) {
    return {
      text: `${elementType}[${JSON.stringify(detail.name.text)}]`,
      imports: [],
    };
  }

  const inferred = checker.typeToString(checker.getTypeAtLocation(detail), detail, TYPE_FLAGS);
  if (!inferred || inferred === "any" || inferred === "never") {
    return { text: "unknown", imports: [] };
  }

  const referenced = new Set(
    [...inferred.matchAll(/\b[A-Z][A-Za-z0-9_$]*\b/g)].map((match) => match[0]),
  );
  const imports = [...referenced].filter((name) => publicTypes.has(name));
  const unresolved = [...referenced].filter(
    (name) => !publicTypes.has(name) && !BUILTIN_TYPES.has(name),
  );
  if (unresolved.length) return { text: "unknown", imports: [] };
  return { text: inferred, imports };
}

for (const sourceFile of program.getSourceFiles()) {
  if (
    !sourceFile.fileName.startsWith(componentsDir) ||
    !sourceFile.fileName.endsWith("/element.ts")
  ) {
    continue;
  }
  const dir = sourceFile.fileName.slice(componentsDir.length + 1, -"/element.ts".length);
  const publicTypes = exportedTypeNames(sourceFile);
  for (const statement of sourceFile.statements) {
    if (!ts.isClassDeclaration(statement) || !statement.name) continue;
    let tag;
    const writableFields = [];
    for (const member of statement.members) {
      if (
        ts.isPropertyDeclaration(member) &&
        member.name !== undefined &&
        ts.isIdentifier(member.name) &&
        !member.modifiers?.some((modifier) =>
          [
            ts.SyntaxKind.StaticKeyword,
            ts.SyntaxKind.PrivateKeyword,
            ts.SyntaxKind.ProtectedKeyword,
            ts.SyntaxKind.ReadonlyKeyword,
            ts.SyntaxKind.DeclareKeyword,
          ].includes(modifier.kind),
        )
      ) {
        writableFields.push(member.name.text);
      }
      if (
        ts.isPropertyDeclaration(member) &&
        member.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword) &&
        member.name !== undefined &&
        ts.isIdentifier(member.name) &&
        member.name.text === "tag" &&
        member.initializer !== undefined
      ) {
        const tagType = checker.getTypeAtLocation(member.initializer);
        tag = ts.isStringLiteral(member.initializer)
          ? member.initializer.text
          : tagType.isStringLiteral()
          ? tagType.value
          : undefined;
        if (!tag) continue;
        elementByTag.set(tag, {
          sourceDir: dir,
          elementClass: statement.name.text,
        });
      }
    }
    if (!tag) continue;
    sourceDataPropsByTag.set(tag, writableFields);
    const byName = new Map();
    const visit = (node) => {
      if (isThisEmit(node)) {
        const name = node.arguments[0].text;
        const entry = byName.get(name) ?? { detailTypes: new Set(), imports: new Set() };
        const detail = eventDetailType(node.arguments[1], "__ELEMENT_TYPE__", publicTypes);
        entry.detailTypes.add(detail.text);
        for (const imported of detail.imports) entry.imports.add(imported);
        byName.set(name, entry);
      }
      ts.forEachChild(node, visit);
    };
    visit(statement);
    if (byName.size) eventsByTag.set(tag, byName);
  }
}

const pascal = (tag) =>
  tag
    .replace(/^jd-/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
/** "jd-open-change" → "onJdOpenChange" */
const handlerName = (evt) =>
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
/** 식별자로 쓸 수 있으면 따옴표를 벗긴다 — 생성물도 사람이 읽는 코드다 */
const key = (k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k));
const scalarLiteral = (value) => {
  if (typeof value === "number" && Number.isNaN(value)) return "Number.NaN";
  if (value === Number.POSITIVE_INFINITY) return "Number.POSITIVE_INFINITY";
  if (value === Number.NEGATIVE_INFINITY) return "Number.NEGATIVE_INFINITY";
  return JSON.stringify(value);
};

/** 프로토타입의 손저작 접근자 = 복합 데이터 프롭 (setter 있는 것만) */
function dataProps(Klass) {
  const out = [];
  for (const name of Object.getOwnPropertyNames(Klass.prototype)) {
    if (name === "constructor") continue;
    const d = Object.getOwnPropertyDescriptor(Klass.prototype, name);
    if (d && d.set) out.push(name);
  }
  return out.sort();
}

const entries = [];
for (const Klass of ALL_COMPONENTS) {
  const tag = Klass.tag;
  if (!tag || HAND_WRITTEN.has(tag)) continue;
  const props = {};
  const defaults = {};
  for (const [propName, def] of Object.entries(Klass.props ?? {})) {
    const kind = KIND.get(def.type);
    if (kind) {
      props[propName] = kind;
      defaults[propName] =
        def.default !== undefined
          ? def.default
          : def.type === Boolean
          ? false
          : def.type === Number
          ? 0
          : "";
    }
  }
  for (const propName of dataProps(Klass)) {
    if (!(propName in props)) props[propName] = "data";
  }
  for (const propName of sourceDataPropsByTag.get(tag) ?? []) {
    if (!(propName in props)) props[propName] = "data";
  }
  const dir = tag.replace(/^jd-/, "");
  const source = elementByTag.get(tag);
  if (!source) {
    throw new Error(`gen-adapters: ${tag}의 공개 class/tag 선언을 소스에서 찾지 못했습니다.`);
  }
  entries.push({
    tag,
    dir,
    sourceDir: source.sourceDir,
    name: pascal(tag),
    elementClass: source.elementClass,
    props,
    defaults,
    events: eventsByTag.get(tag) ?? new Map(),
  });
}
entries.sort((a, b) => a.name.localeCompare(b.name));

/* ── 방출 ────────────────────────────────────────────────────────────────
   컴포넌트당 파일 하나. 한 파일에 387개를 몰면 `import { Alert }` 하나가 라이브러리
   전체를 끌고 온다 — 각 모듈이 자기 <jd-*> 정의를 import 하기 때문이다(정의 없이는
   태그가 업그레이드되지 않으므로 이 import 는 뺄 수 없다). 모듈을 쪼개면 번들러가
   안 쓰는 것을 통째로 버릴 수 있다. */
function moduleSource(e) {
  const elementType = `${e.name}Element`;
  const propRows = Object.entries(e.props).sort(([a], [b]) => a.localeCompare(b));
  const propLines = propRows.map(([k]) => `  ${key(k)}?: ${elementType}[${JSON.stringify(k)}];`);
  const eventImports = new Set();
  const eventRows = [...e.events].sort(([a], [b]) => a.localeCompare(b));
  const eventLines = eventRows.map(([eventName, event]) => {
    for (const imported of event.imports) eventImports.add(imported);
    const detail = [...event.detailTypes]
      .sort()
      .join(" | ")
      .replaceAll("__ELEMENT_TYPE__", elementType);
    return `  ${handlerName(eventName)}?: (event: CustomEvent<${detail}>) => void;`;
  });
  const specProps = propRows.map(([k, kind]) => `${key(k)}: ${JSON.stringify(kind)}`).join(", ");
  const specEvents = eventRows
    .map(([eventName]) => `${handlerName(eventName)}: ${JSON.stringify(eventName)}`)
    .join(", ");
  const specDefaults = Object.entries(e.defaults)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => `${key(name)}: ${scalarLiteral(value)}`)
    .join(", ");
  const typeImports = [e.elementClass, ...eventImports].sort();
  const importedTypes = typeImports
    .map((name) => (name === e.elementClass ? `${name} as ${elementType}` : name))
    .join(", ");
  const ownType = `${e.name}OwnProps`;
  return [
    "/* AUTO-GENERATED by scripts/gen-adapters.mjs — DO NOT EDIT (DEC-044) */",
    '"use client";',
    "",
    `/** <${e.tag}> 의 React 어댑터. 표면은 @junds/web 공개 element 선언에서 왔다. */`,
    `import "@junds/web/${e.sourceDir}"; // <${e.tag}> 정의 등록 (선등록 승리 가드, §2)`,
    `import type { ${importedTypes} } from "@junds/web/${e.sourceDir}/element";`,
    'import { createJdElement, type JdBaseProps } from "../internal/createJdElement.js";',
    "",
    `interface ${ownType} {`,
    ...propLines,
    ...eventLines,
    "}",
    "",
    `export type ${e.name}Props = JdBaseProps<${elementType}, keyof ${ownType}> & ${ownType};`,
    "",
    `export const ${e.name} = createJdElement<${elementType}, ${e.name}Props>(`,
    `  { tag: ${JSON.stringify(
      e.tag,
    )}, props: { ${specProps} }, defaults: { ${specDefaults} }, events: { ${specEvents} } },`,
    `  ${JSON.stringify(e.name)},`,
    ");",
    "",
  ].join("\n");
}

const barrel = [
  "/* AUTO-GENERATED by scripts/gen-adapters.mjs — DO NOT EDIT (DEC-044) */",
  "",
  "/**",
  ` * <jd-*> 커스텀 엘리먼트의 React 어댑터 ${entries.length}종.`,
  " *",
  " * 표면은 @junds/web 의 `static props`·공개 writable property에서 왔다 — 손으로 옮겨",
  " * 적은 것이 아니므로 프롭을 늘리면 재생성만 하면 된다(--check가 드리프트를 잡는다).",
  " * Button·TextField·Modal 은 v2 API 표면을 보존하는 손저작 어댑터가 따로 있다.",
  " *",
  " * 이벤트 핸들러 이름은 `jd-change` → `onJdChange` 규칙이다. React 의 onChange 와",
  " * 겹치지 않도록 `Jd` 를 남긴다 — 겹치면 합성 이벤트와 커스텀 이벤트가 한 이름으로 섞인다.",
  " */",
  ...entries.map((e) => `export { ${e.name}, type ${e.name}Props } from "./${e.name}.js";`),
  "",
].join("\n");

const files = new Map(entries.map((e) => [join(OUT_DIR, `${e.name}.ts`), moduleSource(e)]));
files.set(join(OUT_DIR, "index.ts"), barrel);
files.set(
  MANIFEST,
  JSON.stringify(
    entries.map(({ tag, dir, sourceDir, name, elementClass }) => ({
      tag,
      dir,
      sourceDir,
      name,
      elementClass,
    })),
    null,
    2,
  ) + "\n",
);

const read = (p) => {
  try {
    return readFileSync(p, "utf8");
  } catch {
    return null;
  }
};

if (process.argv.includes("--check")) {
  const stale = [...files].filter(([p, text]) => read(p) !== text).map(([p]) => p);
  const extra = existsSync(OUT_DIR)
    ? readdirSync(OUT_DIR).filter((f) => !files.has(join(OUT_DIR, f)))
    : [];
  if (stale.length || extra.length) {
    console.error(
      `✗ gen-adapters drift — 갱신 ${stale.length} · 잉여 ${extra.length}. ` +
        "node scripts/gen-adapters.mjs 재실행 필요",
    );
    process.exit(1);
  }
  console.log(`✓ gen-adapters drift 없음 (${entries.length}종)`);
} else {
  mkdirSync(OUT_DIR, { recursive: true });
  // 삭제된 컴포넌트의 잔해가 남으면 배럴이 없는 모듈을 가리킨다
  for (const f of existsSync(OUT_DIR) ? readdirSync(OUT_DIR) : []) {
    if (!files.has(join(OUT_DIR, f))) rmSync(join(OUT_DIR, f));
  }
  for (const [p, text] of files) writeFileSync(p, text);
  const propCount = entries.reduce((n, e) => n + Object.keys(e.props).length, 0);
  const eventCount = entries.reduce((n, e) => n + e.events.size, 0);
  console.log(
    `✓ React 어댑터 ${entries.length}종 · 프롭 ${propCount} · 이벤트 ${eventCount} → src/generated/`,
  );
}
