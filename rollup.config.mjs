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
  ) return;
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
      plugins: [
        ...sharedJsPlugins(),
        postcss({ extract: false }),
        terser(terserOptions),
      ],
    },
    {
      input,
      onwarn,
      output: { file: dtsOut, format: "esm" },
      external,
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

/** @type {import('rollup').RollupOptions[]} */
const config = [...root, ...runtime, ...subEntries];

export default config;
