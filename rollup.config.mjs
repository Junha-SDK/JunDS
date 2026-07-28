import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import esbuild from "rollup-plugin-esbuild";
import terser from "@rollup/plugin-terser";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import dts from "rollup-plugin-dts";

const external = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "react-dom/client",
  // The finance subpath imports from "@junds/ui" so React contexts
  // (CoreProvider, DsToastProvider, …) resolve to the SAME instance
  // the consumer already loaded from the root barrel. Keep it external
  // for every bundle — the root bundle never imports the package name.
  "@junds/ui",
  "next/dynamic",
  "next/link",
  "next/navigation",
  "next/image",
  "lucide-react",
  "yahoo-finance2",
];

const terserOptions = {
  ecma: 2017,
  module: true,
  compress: {
    drop_console: true,
    drop_debugger: true,
    passes: 3,
    pure_getters: true,
    dead_code: true,
    conditionals: true,
    collapse_vars: true,
    reduce_vars: true,
    toplevel: true,
  },
  mangle: {
    toplevel: true,
    properties: {
      regex: /^_[a-z]/,
      reserved: [
        "children",
        "className",
        "style",
        "ref",
        "key",
        "onClick",
        "onChange",
        "onSubmit",
        "disabled",
        "placeholder",
        "value",
        "defaultValue",
        "type",
        "name",
        "id",
        "href",
        "src",
        "alt",
      ],
    },
  },
  format: {
    comments: false,
    ecma: 2017,
  },
};

// "use client" directives are intentionally hoisted to the bundle banner,
// so silence rollup's per-file MODULE_LEVEL_DIRECTIVE warnings.
const onwarn = (warning, warn) => {
  if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
  if (
    warning.code === "SOURCEMAP_ERROR" &&
    /Can't resolve original location/.test(warning.message ?? "")
  )
    return;
  warn(warning);
};

const sharedJsPlugins = () => [
  peerDepsExternal(),
  resolve({
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  }),
  esbuild({
    include: /\.[jt]sx?$/,
    target: "es2017",
    jsx: "automatic",
    tsconfig: "./tsconfig.build.json",
  }),
  commonjs(),
];

/**
 * Sub-path entries — `import { X } from "@junds/ui/<entry>"` builds.
 * Each entry barrel produces ESM + CJS + d.ts in dist/<entry>/.
 * Mirror this list in package.json#exports.
 */
const SUB_ENTRIES = [
  "primitives",
  "composites",
  "patterns",
  "layout",
  "core",
  "hooks",
  "tokens",
  "providers",
  "auth",
  "utils",
  "finance",
];

function entryConfigs({ input, esmOut, cjsOut, dtsOut, extractCss = false }) {
  return [
    {
      input,
      onwarn,
      output: {
        file: esmOut,
        format: "esm",
        sourcemap: false,
        banner: '"use client";',
        inlineDynamicImports: true,
      },
      external,
      plugins: [
        ...sharedJsPlugins(),
        postcss({
          extract: extractCss ? "styles.css" : false,
          minimize: true,
        }),
        terser(terserOptions),
      ],
    },
    {
      input,
      onwarn,
      output: {
        file: cjsOut,
        format: "cjs",
        sourcemap: false,
        inlineDynamicImports: true,
      },
      external,
      plugins: [...sharedJsPlugins(), postcss({ extract: false }), terser(terserOptions)],
    },
    {
      input,
      onwarn,
      output: { file: dtsOut, format: "esm" },
      // dts() doesn't speak CSS — externalize any .css side-effect imports
      // so type emission can ignore them.
      external: [...external, /\.css$/],
      plugins: [dts({ tsconfig: "./tsconfig.build.json" })],
    },
  ];
}

const root = entryConfigs({
  input: "ds/index.ts",
  esmOut: "dist/index.mjs",
  cjsOut: "dist/index.cjs",
  dtsOut: "dist/index.d.ts",
  extractCss: true,
});

const runtime = entryConfigs({
  input: "ds/runtime/index.ts",
  esmOut: "dist/runtime.mjs",
  cjsOut: "dist/runtime.cjs",
  dtsOut: "dist/runtime.d.ts",
});

const subEntries = SUB_ENTRIES.flatMap((entry) =>
  entryConfigs({
    input: `ds/${entry}/index.ts`,
    esmOut: `dist/${entry}/index.mjs`,
    cjsOut: `dist/${entry}/index.cjs`,
    dtsOut: `dist/${entry}/index.d.ts`,
  }),
);

/**
 * finance/lib is built with preserveModules so each source file becomes its
 * own output file. This lets server-only consumers (Next.js middleware /
 * Edge runtime, RSC route handlers) import a specific module like
 * `@junds/ui/finance/lib/auth` without dragging React-hook code from
 * sibling modules into the bundle.
 */
import { readdirSync } from "node:fs";

const FINANCE_LIB_DIR = "ds/finance/lib";
const financeLibInputs = Object.fromEntries(
  readdirSync(FINANCE_LIB_DIR)
    .filter((f) => /\.ts$/.test(f))
    .map((f) => [f.replace(/\.ts$/, ""), `${FINANCE_LIB_DIR}/${f}`]),
);

// preserveModules treats every imported file as a separate output, so we
// just point Rollup at the barrel (which transitively pulls every sibling).
const financeLibSingleInput = `${FINANCE_LIB_DIR}/index.ts`;

// Files that declare `"use client"` at the source — the directive is
// stripped during bundling, so we restore it per-chunk in the output banner.
const FINANCE_LIB_CLIENT_MODULES = new Set([
  "accentColor",
  "alerts",
  "brokerages",
  "holdings",
  "livePrices",
  "recentlyViewed",
  "snapshots",
  "themeMode",
  "useMarketStatus",
  "watchlist",
]);

const financeLibBanner = (chunk) => {
  const id = chunk.facadeModuleId ?? "";
  const base = id
    .split("/")
    .pop()
    ?.replace(/\.tsx?$/, "");
  return base && FINANCE_LIB_CLIENT_MODULES.has(base) ? '"use client";' : "";
};

const financeLib = [
  {
    input: financeLibSingleInput,
    onwarn,
    output: {
      dir: "dist/finance/lib",
      format: "esm",
      entryFileNames: "[name].mjs",
      sourcemap: false,
      // Restore "use client" only on chunks whose source had it — keeps
      // pure server modules (auth, format, …) safely importable from the
      // Edge runtime / RSC handlers.
      banner: financeLibBanner,
      preserveModules: true,
      preserveModulesRoot: FINANCE_LIB_DIR,
    },
    external,
    plugins: [...sharedJsPlugins(), postcss({ extract: false }), terser(terserOptions)],
  },
  {
    input: financeLibSingleInput,
    onwarn,
    output: {
      dir: "dist/finance/lib",
      format: "cjs",
      entryFileNames: "[name].cjs",
      sourcemap: false,
      banner: financeLibBanner,
      preserveModules: true,
      preserveModulesRoot: FINANCE_LIB_DIR,
    },
    external,
    plugins: [...sharedJsPlugins(), postcss({ extract: false }), terser(terserOptions)],
  },
  // Per-module .d.ts so subpath imports get correctly typed.
  ...Object.entries(financeLibInputs).map(([name, input]) => ({
    input,
    onwarn,
    output: { file: `dist/finance/lib/${name}.d.ts`, format: "esm" },
    external,
    plugins: [dts({ tsconfig: "./tsconfig.build.json" })],
  })),
];

/** @type {import('rollup').RollupOptions[]} */
const config = [...root, ...runtime, ...subEntries, ...financeLib];

export default config;
